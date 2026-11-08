// High-Precision 60 FPS Physics & Endless Procedural Generator
// For CYBER NOVA: Sol-Jet Velocity

import { 
  JetpackPlayer, 
  Obstacle, 
  ShardCollectible, 
  VehicleTokenEntity, 
  LabScientistNPC, 
  JetpackParticle, 
  ScorePopup, 
  StakingPerks 
} from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FLOOR_Y, CEILING_Y } from './sprites';
import { sounds } from '@/lib/audio/sound-effects';

export interface PhysicsTickOutput {
  shardsGained: number;
  scoreGained: number;
  playerCrashed: boolean;
  vehicleLost: boolean;
}

export function updateJetpackPhysics(
  player: JetpackPlayer,
  obstacles: Obstacle[],
  shards: ShardCollectible[],
  vehicleTokens: VehicleTokenEntity[],
  scientists: LabScientistNPC[],
  particles: JetpackParticle[],
  scorePopups: ScorePopup[],
  perks: StakingPerks,
  globalFrame: number,
  isPracticeMode: boolean
): PhysicsTickOutput {
  const output: PhysicsTickOutput = {
    shardsGained: 0,
    scoreGained: 0,
    playerCrashed: false,
    vehicleLost: false,
  };

  // 1. Invincibility in practice mode
  if (isPracticeMode) {
    player.invincibleTimer = Math.max(player.invincibleTimer, 30);
  }

  // 2. Handle Death State
  if (player.isDying) {
    player.deathTimer--;
    player.vy += 0.4;
    player.y += player.vy;
    if (player.y >= FLOOR_Y - player.h) {
      player.y = FLOOR_Y - player.h;
      player.vy = 0;
    }
    if (player.deathTimer <= 0) {
      output.playerCrashed = true;
    }
    return output;
  }

  // 3. Dynamic Speed Scaling with Distance
  const scrollSpeed = 5.5 + Math.min(6.5, player.distance / 350);
  player.distance += scrollSpeed * 0.06;
  output.scoreGained += Math.round(scrollSpeed * 0.2);

  // 4. Invincible countdown
  if (player.invincibleTimer > 0) {
    player.invincibleTimer--;
  }

  // 5. Vertical Physics & Jetpack Thrust
  if (player.vehicle === 'gravity_drifter') {
    // Anti-gravity pod: moves smoothly towards current gravity wall
    const targetY = player.gravityInverted ? CEILING_Y + 4 : FLOOR_Y - player.h;
    player.vy = (targetY - player.y) * 0.12;
    player.y += player.vy;
  } else if (player.vehicle === 'mech_breaker') {
    // Heavy stomper mech
    player.vy += 0.55;
    if (player.isThrusting && player.grounded) {
      player.vy = -9.2; // heavy jump
      sounds.playJump(true);
    }
    player.y += player.vy;
  } else {
    // Standard Jetpack / Warp Cycle
    const gravity = 0.44;
    const thrustPower = 0.88;

    if (player.isThrusting) {
      player.vy -= thrustPower;
      if (player.vy < -8.5) player.vy = -8.5;

      // Emit Jetpack Exhaust Particles
      if (globalFrame % 2 === 0) {
        const exhaustColor = player.skin === 'fire' ? '#F97316' : player.skin === 'gold' ? '#FBBF24' : '#00FFFF';
        particles.push({
          x: player.x - 6 + (Math.random() - 0.5) * 6,
          y: player.y + player.h - 4,
          vx: -scrollSpeed * 0.4 - Math.random() * 2,
          vy: 4 + Math.random() * 4,
          size: 3 + Math.random() * 2,
          color: exhaustColor,
          life: 14,
          maxLife: 14,
          gravity: 0.1,
        });
      }
    } else {
      player.vy += gravity;
      if (player.vy > 8.5) player.vy = 8.5;
    }

    player.y += player.vy;
  }

  // 6. Boundaries (Ceiling and Floor Collisions)
  player.grounded = false;
  player.onCeiling = false;

  if (player.y >= FLOOR_Y - player.h) {
    player.y = FLOOR_Y - player.h;
    player.vy = 0;
    player.grounded = true;
    player.walkFrame += 0.2;
  } else if (player.y <= CEILING_Y) {
    player.y = CEILING_Y;
    player.vy = 0;
    player.onCeiling = true;
  }

  // 7. Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    if (obs.type === 'seeker_missile') {
      if (!obs.launched) {
        // Warning tracking phase
        obs.warningTimer = (obs.warningTimer || 60) - 1;
        obs.trackingY = (obs.trackingY || player.y) + (player.y - (obs.trackingY || player.y)) * 0.08;

        if (obs.warningTimer <= 0) {
          obs.launched = true;
          obs.x = CANVAS_WIDTH + 20;
          obs.y = obs.trackingY;
          obs.speed = scrollSpeed + 7.5;
          sounds.playFireball();
        }
      } else {
        // Rocket in flight
        obs.x -= (obs.speed || 12);

        // Rocket smoke trail
        if (globalFrame % 2 === 0) {
          particles.push({
            x: obs.x + 28,
            y: obs.y + 8,
            vx: Math.random() * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 4,
            color: '#94A3B8',
            life: 16,
            maxLife: 16,
          });
        }
      }
    } else {
      // Static / Rotating Zappers move with scroll speed
      obs.x -= scrollSpeed;
      if (obs.type === 'zapper_rotating' && obs.angle !== undefined && obs.rotSpeed) {
        obs.angle += obs.rotSpeed;
      }
    }

    // Remove off-screen obstacles
    if (obs.x < -120) {
      obstacles.splice(i, 1);
      continue;
    }

    // Collision with Player
    const playerRect = { x: player.x + 4, y: player.y + 4, w: player.w - 8, h: player.h - 8 };
    const obsRect = { x: obs.x + 4, y: obs.y + 4, w: obs.w - 8, h: obs.h - 8 };

    // Rotating zapper collision approximation
    const isHitting = rectIntersect(playerRect, obsRect);

    if (isHitting && obs.active) {
      if (player.invincibleTimer > 0) {
        // Invulnerable, smash through!
        obs.active = false;
        sounds.playKick();
        spawnShatterParticles(particles, obs.x + obs.w / 2, obs.y + obs.h / 2, '#00FFFF');
        continue;
      }

      if (player.vehicle !== 'none') {
        // Vehicle protects player, absorbs hit and explodes!
        obs.active = false;
        player.vehicle = 'none';
        player.invincibleTimer = 80;
        output.vehicleLost = true;
        sounds.playBossDefeat();
        spawnShatterParticles(particles, player.x + 20, player.y + 15, '#F59E0B');
        scorePopups.push({
          id: `pop_${Date.now()}`,
          text: 'VEHICLE EJECT!',
          x: player.x + 20,
          y: player.y - 10,
          vy: -2,
          opacity: 1,
          color: '#F59E0B',
        });
        continue;
      }

      if (player.shields > 0) {
        // Kinetic shield absorbs impact
        player.shields--;
        player.invincibleTimer = 60;
        obs.active = false;
        sounds.playPowerdown();
        spawnShatterParticles(particles, player.x + player.w / 2, player.y + player.h / 2, '#00FFFF');
        scorePopups.push({
          id: `pop_${Date.now()}`,
          text: 'SHIELD DEFLECT!',
          x: player.x + player.w / 2,
          y: player.y - 10,
          vy: -2,
          opacity: 1,
          color: '#38BDF8',
        });
        continue;
      }

      // Fatal Crash
      player.isDying = true;
      player.deathTimer = 70;
      player.vy = -6;
      sounds.playGameOver();
      spawnShatterParticles(particles, player.x + player.w / 2, player.y + player.h / 2, '#EF4444');
    }
  }

  // 8. Update Collectible Shards & Magnetism
  for (let i = shards.length - 1; i >= 0; i--) {
    const s = shards[i];
    s.x -= scrollSpeed;

    // Shard Magnetism Perk (from Solar Staking)
    if (perks.shardMagnet && !s.collected) {
      const dx = player.x + player.w / 2 - s.x;
      const dy = player.y + player.h / 2 - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        s.x += (dx / dist) * 9.0;
        s.y += (dy / dist) * 9.0;
      }
    }

    if (s.x < -40) {
      shards.splice(i, 1);
      continue;
    }

    // Collection collision
    if (!s.collected) {
      const dist = Math.hypot(player.x + player.w / 2 - (s.x + 8), player.y + player.h / 2 - (s.y + 8));
      if (dist < player.w / 2 + 10) {
        s.collected = true;
        let gained = 1;
        if (perks.shardBonusPercent > 0 && Math.random() < perks.shardBonusPercent / 100) {
          gained = 2;
        }
        output.shardsGained += gained;
        output.scoreGained += 25;
        sounds.playCoin();

        // Shard sparkle particles
        for (let p = 0; p < 4; p++) {
          particles.push({
            x: s.x + 8,
            y: s.y + 8,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 2.5,
            color: '#14F195',
            life: 12,
            maxLife: 12,
          });
        }
      }
    }
  }

  // 9. Update Vehicle Tokens
  for (let i = vehicleTokens.length - 1; i >= 0; i--) {
    const v = vehicleTokens[i];
    v.x -= scrollSpeed;

    if (v.x < -60) {
      vehicleTokens.splice(i, 1);
      continue;
    }

    if (v.active) {
      const dist = Math.hypot(player.x + player.w / 2 - (v.x + 13), player.y + player.h / 2 - (v.y + 13));
      if (dist < player.w / 2 + 16) {
        v.active = false;
        player.vehicle = v.type;
        player.shields = Math.max(player.shields, 1);
        sounds.play1Up();
        spawnShatterParticles(particles, v.x + 13, v.y + 13, '#C084FC');
        scorePopups.push({
          id: `pop_${Date.now()}`,
          text: `${v.type.replace('_', ' ').toUpperCase()} EQUIPPED!`,
          x: player.x + 20,
          y: player.y - 15,
          vy: -2,
          opacity: 1,
          color: '#C084FC',
        });
      }
    }
  }

  // 10. Update Floor Scientists NPCs
  for (let i = scientists.length - 1; i >= 0; i--) {
    const npc = scientists[i];
    npc.x -= scrollSpeed + npc.vx;
    npc.walkFrame += 0.2;

    if (npc.x < -60) {
      scientists.splice(i, 1);
    }
  }

  // 11. Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.gravity) p.vy += p.gravity;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // 12. Update Score Popups
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const sp = scorePopups[i];
    sp.y += sp.vy;
    sp.opacity -= 0.025;
    if (sp.opacity <= 0) {
      scorePopups.splice(i, 1);
    }
  }

  // 13. Procedural Wave Spawning
  spawnProceduralElements(player, obstacles, shards, vehicleTokens, scientists, globalFrame);

  return output;
}

/**
 * Procedural Endless Spawner
 */
let lastSpawnX = CANVAS_WIDTH;
let lastVehicleDistance = 0;

export function resetJetpackSpawnState() {
  lastSpawnX = CANVAS_WIDTH;
  lastVehicleDistance = 0;
}

function spawnProceduralElements(
  player: JetpackPlayer,
  obstacles: Obstacle[],
  shards: ShardCollectible[],
  vehicleTokens: VehicleTokenEntity[],
  scientists: LabScientistNPC[],
  globalFrame: number
) {
  // Check if we need to generate new upcoming obstacles
  const maxObstacleX = obstacles.reduce((max, o) => Math.max(max, o.x), 0);

  if (maxObstacleX < CANVAS_WIDTH + 240) {
    const spawnX = Math.max(CANVAS_WIDTH + 100, maxObstacleX + 180 + Math.random() * 120);

    // Random choice of hazard pattern
    const pattern = Math.floor(Math.random() * 6);

    if (pattern === 0) {
      // Horizontal Zapper at varied height
      const zapperY = CEILING_Y + 40 + Math.random() * (FLOOR_Y - CEILING_Y - 100);
      obstacles.push({
        id: `obs_${Date.now()}_${Math.random()}`,
        type: 'zapper_horizontal',
        x: spawnX,
        y: zapperY,
        w: 120,
        h: 18,
        active: true,
      });
    } else if (pattern === 1) {
      // Vertical Zapper
      const zapperY = CEILING_Y + 20 + Math.random() * (FLOOR_Y - CEILING_Y - 140);
      obstacles.push({
        id: `obs_${Date.now()}_${Math.random()}`,
        type: 'zapper_vertical',
        x: spawnX,
        y: zapperY,
        w: 18,
        h: 110,
        active: true,
      });
    } else if (pattern === 2) {
      // Rotating Zapper
      const zapperY = CEILING_Y + 60 + Math.random() * (FLOOR_Y - CEILING_Y - 150);
      obstacles.push({
        id: `obs_${Date.now()}_${Math.random()}`,
        type: 'zapper_rotating',
        x: spawnX,
        y: zapperY,
        w: 90,
        h: 90,
        angle: 0,
        rotSpeed: 0.035,
        active: true,
      });
    } else if (pattern === 3) {
      // Homing Seeker Missile
      obstacles.push({
        id: `obs_${Date.now()}_${Math.random()}`,
        type: 'seeker_missile',
        x: CANVAS_WIDTH + 40,
        y: player.y,
        w: 28,
        h: 16,
        warningTimer: 55,
        trackingY: player.y,
        launched: false,
        active: true,
      });
    } else if (pattern === 4) {
      // High-voltage gate top or bottom
      const onCeiling = Math.random() < 0.5;
      obstacles.push({
        id: `obs_${Date.now()}_${Math.random()}`,
        type: 'laser_gate',
        x: spawnX,
        y: onCeiling ? CEILING_Y : FLOOR_Y - 140,
        w: 20,
        h: 140,
        active: true,
      });
    }

    // Spawn Shard Formations
    spawnShardPattern(shards, spawnX + 80);

    // Spawn Vehicle Token every ~250m
    if (player.distance - lastVehicleDistance > 240 && player.vehicle === 'none') {
      lastVehicleDistance = player.distance;
      const types: Array<'gravity_drifter' | 'mech_breaker' | 'warp_cycle'> = ['gravity_drifter', 'mech_breaker', 'warp_cycle'];
      const vType = types[Math.floor(Math.random() * types.length)];
      vehicleTokens.push({
        id: `vt_${Date.now()}`,
        type: vType,
        x: spawnX + 220,
        y: CEILING_Y + 80 + Math.random() * 200,
        w: 26,
        h: 26,
        active: true,
      });
    }

    // Spawn Panicked Scientists on floor
    if (Math.random() < 0.6) {
      scientists.push({
        id: `sci_${Date.now()}`,
        x: spawnX + 60,
        y: FLOOR_Y - 28,
        vx: (Math.random() - 0.5) * 1.5,
        panicked: true,
        walkFrame: 0,
      });
    }
  }
}

function spawnShardPattern(shards: ShardCollectible[], startX: number) {
  const patternType = Math.floor(Math.random() * 3);
  const baseY = CEILING_Y + 50 + Math.random() * (FLOOR_Y - CEILING_Y - 100);

  if (patternType === 0) {
    // Sine wave of shards
    for (let i = 0; i < 8; i++) {
      shards.push({
        id: `s_${Date.now()}_${i}`,
        x: startX + i * 26,
        y: baseY + Math.sin(i * 0.7) * 45,
        collected: false,
      });
    }
  } else if (patternType === 1) {
    // Horizontal line
    for (let i = 0; i < 6; i++) {
      shards.push({
        id: `s_${Date.now()}_${i}`,
        x: startX + i * 24,
        y: baseY,
        collected: false,
      });
    }
  } else {
    // Parabolic jump arc
    for (let i = 0; i < 7; i++) {
      const h = -Math.sin((i / 6) * Math.PI) * 70;
      shards.push({
        id: `s_${Date.now()}_${i}`,
        x: startX + i * 28,
        y: Math.min(FLOOR_Y - 20, Math.max(CEILING_Y + 20, baseY + h)),
        collected: false,
      });
    }
  }
}

function spawnShatterParticles(particles: JetpackParticle[], x: number, y: number, color: string) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      size: 3 + Math.random() * 3,
      color,
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 25,
      gravity: 0.25,
    });
  }
}

function rectIntersect(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean {
  return !(
    r2.x > r1.x + r1.w ||
    r2.x + r2.w < r1.x ||
    r2.y > r1.y + r1.h ||
    r2.y + r2.h < r1.y
  );
}

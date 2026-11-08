// High-Precision 60 FPS Physics & Endless Procedural Generator
// For CYBER NOVA: Sol-Jet Velocity

import { 
  JetpackPlayer, 
  Obstacle, 
  ShardCollectible, 
  VehicleTokenEntity, 
  SpeedGateEntity,
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
  screenShake: number;
  combo: number;
  warpActive: boolean;
  nearMissCount: number;
  milestoneReached?: string;
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

export function updateJetpackPhysics(
  player: JetpackPlayer,
  obstacles: Obstacle[],
  shards: ShardCollectible[],
  vehicleTokens: VehicleTokenEntity[],
  speedGates: SpeedGateEntity[],
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
    screenShake: 0,
    combo: player.combo || 0,
    warpActive: player.warpBoostTimer > 0,
    nearMissCount: 0,
  };

  // 1. Invincibility in practice mode
  if (isPracticeMode) {
    player.invincibleTimer = Math.max(player.invincibleTimer, 30);
  }

  // 2. Handle Death State
  if (player.isDying) {
    player.deathTimer--;
    player.vy += 0.45;
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

  // 3. Shard Combo Countdown
  if (player.comboTimer > 0) {
    player.comboTimer--;
    if (player.comboTimer <= 0) {
      player.combo = 0;
    }
  }
  output.combo = player.combo;

  // 4. Warp Boost Countdown
  const isWarping = player.warpBoostTimer > 0;
  if (isWarping) {
    player.warpBoostTimer--;
    player.invincibleTimer = Math.max(player.invincibleTimer, 10);
    output.warpActive = true;
  }

  // 5. Dynamic Speed Scaling with Distance + Warp Boost
  let baseScrollSpeed = 5.6 + Math.min(6.4, player.distance / 320);
  if (isWarping) baseScrollSpeed *= 1.55;
  const scrollSpeed = baseScrollSpeed;

  const prevDist = player.distance;
  player.distance += scrollSpeed * 0.06;
  const mult = player.combo >= 15 ? 4 : player.combo >= 8 ? 3 : player.combo >= 4 ? 2 : 1;
  output.scoreGained += Math.round(scrollSpeed * 0.25 * mult);

  // Checkpoint Milestones every 250m
  const cur250 = Math.floor(player.distance / 250);
  const prev250 = Math.floor(prevDist / 250);
  if (cur250 > prev250 && cur250 > 0) {
    const meters = cur250 * 250;
    output.milestoneReached = `${meters}m CHECKPOINT!`;
    output.shardsGained += 5;
    output.scoreGained += 500;
    sounds.playPowerup();
    scorePopups.push({
      id: `ms_${Date.now()}`,
      text: `${meters}m MILESTONE! +5 SHARDS`,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2 - 40,
      vy: -1.5,
      opacity: 1,
      color: '#14F195',
    });
  }

  // 6. Invincible countdown
  if (player.invincibleTimer > 0) {
    player.invincibleTimer--;
  }

  // 7. Vertical Physics & Jetpack Thrust
  if (player.vehicle === 'gravity_drifter') {
    // Anti-gravity pod: moves smoothly towards current gravity wall
    const targetY = player.gravityInverted ? CEILING_Y + 4 : FLOOR_Y - player.h;
    player.vy = (targetY - player.y) * 0.14;
    player.y += player.vy;
  } else if (player.vehicle === 'mech_breaker') {
    // Heavy stomper mech
    player.vy += 0.58;
    if (player.isThrusting && player.grounded) {
      player.vy = -9.6; // heavy hydraulic jump
      sounds.playJump(true);
      output.screenShake = 3;
    }
    player.y += player.vy;
  } else {
    // Standard Jetpack / Warp Cycle
    const gravity = 0.44;
    const thrustPower = 0.88;

    if (player.isThrusting) {
      player.vy -= thrustPower;
      if (player.vy < -8.2) player.vy = -8.2;

      // Soft thrust audio pulse every 6 frames
      if (globalFrame % 7 === 0) {
        sounds.playThrustPulse();
      }

      // Emit Jetpack Exhaust Particles
      if (globalFrame % 2 === 0) {
        const exhaustColor = isWarping 
          ? '#9945FF' 
          : player.skin === 'fire' 
          ? '#F97316' 
          : player.skin === 'gold' 
          ? '#FBBF24' 
          : '#00FFFF';

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
      if (player.vy > 8.2) player.vy = 8.2;
    }

    player.y += player.vy;
  }

  // 8. Boundaries (Ceiling and Floor Collisions)
  player.grounded = false;
  player.onCeiling = false;

  if (player.y >= FLOOR_Y - player.h) {
    player.y = FLOOR_Y - player.h;
    player.vy = 0;
    player.grounded = true;
    player.walkFrame += 0.22;
  } else if (player.y <= CEILING_Y) {
    player.y = CEILING_Y;
    player.vy = 0;
    player.onCeiling = true;
  }

  // 9. Update Speed Gates
  for (let i = speedGates.length - 1; i >= 0; i--) {
    const gate = speedGates[i];
    gate.x -= scrollSpeed;

    if (gate.x < -60) {
      speedGates.splice(i, 1);
      continue;
    }

    if (gate.active) {
      const pcx = player.x + player.w / 2;
      const pcy = player.y + player.h / 2;
      const gcx = gate.x + gate.w / 2;
      const gcy = gate.y + gate.h / 2;
      if (Math.hypot(pcx - gcx, pcy - gcy) < gate.w / 2 + player.w / 3) {
        gate.active = false;
        player.warpBoostTimer = 180; // 3 seconds of hyper drive!
        output.screenShake = 6;
        sounds.playWarpGate();
        spawnShatterParticles(particles, gcx, gcy, '#9945FF');
        scorePopups.push({
          id: `warp_${Date.now()}`,
          text: 'QUANTUM WARP DRIVE! (3s)',
          x: player.x + 30,
          y: player.y - 15,
          vy: -2,
          opacity: 1,
          color: '#9945FF',
        });
      }
    }
  }

  // 10. Update Obstacles with Precise Fair Collision & Near-Miss Detection
  const pcx = player.x + player.w / 2;
  const pcy = player.y + player.h / 2;

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    if (obs.type === 'seeker_missile') {
      if (!obs.launched) {
        // Warning tracking phase
        obs.warningTimer = (obs.warningTimer || 60) - 1;
        obs.trackingY = (obs.trackingY || player.y) + (player.y - (obs.trackingY || player.y)) * 0.09;

        if (obs.warningTimer % 18 === 0) {
          sounds.playMissileBeep();
        }

        if (obs.warningTimer <= 0) {
          obs.launched = true;
          obs.x = CANVAS_WIDTH + 20;
          obs.y = obs.trackingY;
          obs.speed = scrollSpeed + 8.5;
          sounds.playFireball();
        }
      } else {
        // Rocket in flight
        obs.x -= (obs.speed || 14);

        // Rocket smoke trail
        if (globalFrame % 2 === 0) {
          particles.push({
            x: obs.x + 28,
            y: obs.y + 8,
            vx: Math.random() * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 4,
            color: '#94A3B8',
            life: 14,
            maxLife: 14,
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
    if (obs.x < -140) {
      obstacles.splice(i, 1);
      continue;
    }

    // Exact Collision & Near-Miss Detection
    if (obs.active) {
      let isHitting = false;
      let minDistance = 999;

      if (obs.type === 'seeker_missile') {
        if (!obs.launched) continue; // Not on screen yet!
        const r1 = { x: player.x + 4, y: player.y + 4, w: player.w - 8, h: player.h - 8 };
        const r2 = { x: obs.x + 4, y: obs.y + 2, w: obs.w - 8, h: obs.h - 4 };
        isHitting = rectIntersect(r1, r2);
        minDistance = Math.hypot(pcx - (obs.x + obs.w / 2), pcy - (obs.y + obs.h / 2));
      } else if (obs.type === 'zapper_rotating' && obs.angle !== undefined) {
        // Line-segment to player circle collision
        const ocx = obs.x + obs.w / 2;
        const ocy = obs.y + obs.h / 2;
        const r = obs.w / 2 - 8;
        const x1 = ocx + r * Math.cos(obs.angle);
        const y1 = ocy + r * Math.sin(obs.angle);
        const x2 = ocx - r * Math.cos(obs.angle);
        const y2 = ocy - r * Math.sin(obs.angle);

        minDistance = distToSegment(pcx, pcy, x1, y1, x2, y2);
        isHitting = minDistance < 13;
      } else if (obs.type === 'zapper_horizontal') {
        const x1 = obs.x + 8;
        const y1 = obs.y + obs.h / 2;
        const x2 = obs.x + obs.w - 8;
        const y2 = obs.y + obs.h / 2;
        minDistance = distToSegment(pcx, pcy, x1, y1, x2, y2);
        isHitting = minDistance < 12;
      } else {
        // Vertical zapper or laser gate
        const x1 = obs.x + obs.w / 2;
        const y1 = obs.y + 8;
        const x2 = obs.x + obs.w / 2;
        const y2 = obs.y + obs.h - 8;
        minDistance = distToSegment(pcx, pcy, x1, y1, x2, y2);
        isHitting = minDistance < 12;
      }

      // Near-Miss Detection: within 30px without touching
      if (!isHitting && !obs.nearMissChecked && minDistance < 32 && player.x > obs.x) {
        obs.nearMissChecked = true;
        output.nearMissCount++;
        output.scoreGained += 150;
        output.screenShake = 3;
        sounds.playNearMiss();
        scorePopups.push({
          id: `nm_${Date.now()}`,
          text: 'CLOSE CALL! +150',
          x: player.x + 20,
          y: player.y - 12,
          vy: -2,
          opacity: 1,
          color: '#FDE047',
        });
      }

      // Handle Collision Hit
      if (isHitting) {
        if (player.invincibleTimer > 0 || isWarping) {
          // Invulnerable / Warp Boost, smash through hazard!
          obs.active = false;
          output.screenShake = 4;
          sounds.playKick();
          spawnShatterParticles(particles, obs.x + obs.w / 2, obs.y + obs.h / 2, '#00FFFF');
          continue;
        }

        if (player.vehicle !== 'none') {
          // Vehicle protects player, absorbs hit and explodes!
          obs.active = false;
          player.vehicle = 'none';
          player.invincibleTimer = 85;
          output.vehicleLost = true;
          output.screenShake = 7;
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
          player.invincibleTimer = 65;
          obs.active = false;
          output.screenShake = 5;
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
        output.screenShake = 10;
        sounds.playGameOver();
        spawnShatterParticles(particles, player.x + player.w / 2, player.y + player.h / 2, '#EF4444');
      }
    }
  }

  // 11. Update Collectible Shards & Magnetism & Combos
  for (let i = shards.length - 1; i >= 0; i--) {
    const s = shards[i];
    s.x -= scrollSpeed;

    // Shard Magnetism Perk (from Solar Staking)
    if (perks.shardMagnet && !s.collected) {
      const dx = player.x + player.w / 2 - s.x;
      const dy = player.y + player.h / 2 - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        s.x += (dx / dist) * 9.5;
        s.y += (dy / dist) * 9.5;
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

        // Combo increment
        player.combo = (player.combo || 0) + 1;
        player.comboTimer = 70; // 1.15 seconds to continue combo

        const currentCombo = player.combo;
        const comboMultiplier = currentCombo >= 15 ? 4 : currentCombo >= 8 ? 3 : currentCombo >= 4 ? 2 : 1;
        output.scoreGained += 25 * comboMultiplier;

        if (currentCombo === 4 || currentCombo === 8 || currentCombo === 15) {
          sounds.playComboUp(comboMultiplier);
          scorePopups.push({
            id: `c_${Date.now()}`,
            text: `COMBO x${comboMultiplier}!`,
            x: s.x + 8,
            y: s.y - 12,
            vy: -2,
            opacity: 1,
            color: comboMultiplier >= 4 ? '#A855F7' : '#14F195',
          });
        } else {
          sounds.playCoin();
        }

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

  // 12. Update Vehicle Tokens
  for (let i = vehicleTokens.length - 1; i >= 0; i--) {
    const v = vehicleTokens[i];
    v.x -= scrollSpeed;

    if (v.x < -60) {
      vehicleTokens.splice(i, 1);
      continue;
    }

    if (v.active) {
      const dist = Math.hypot(player.x + player.w / 2 - (v.x + 14), player.y + player.h / 2 - (v.y + 14));
      if (dist < player.w / 2 + 16) {
        v.active = false;
        player.vehicle = v.type;
        player.shields = Math.max(player.shields, 1);
        sounds.play1Up();
        spawnShatterParticles(particles, v.x + 14, v.y + 14, '#C084FC');
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

  // 13. Update Floor Scientists NPCs
  for (let i = scientists.length - 1; i >= 0; i--) {
    const npc = scientists[i];
    npc.x -= scrollSpeed * 0.75 + npc.vx;
    npc.walkFrame += 0.25;

    if (npc.x < -40) {
      scientists.splice(i, 1);
      continue;
    }

    // Reaction when Nova thrusts directly overhead
    if (Math.abs(npc.x - player.x) < 50 && player.isThrusting) {
      npc.panicked = true;
      npc.vx = npc.x < player.x ? -2.2 : 2.2;
    }
  }

  // 14. Update Jetpack Particles
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

  // 15. Update Score Popups
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const sp = scorePopups[i];
    sp.y += sp.vy;
    sp.opacity -= 0.025;
    if (sp.opacity <= 0) {
      scorePopups.splice(i, 1);
    }
  }

  // 16. Procedural Wave Generation (Obstacles, Shards, Vehicles, Speed Gates)
  spawnProceduralElements(player, obstacles, shards, vehicleTokens, speedGates, scientists, globalFrame);

  return output;
}

/**
 * Procedural Hazard Spawner
 */
let lastSpawnX = CANVAS_WIDTH;
let lastVehicleDistance = 0;
let lastSpeedGateDistance = 0;

export function resetJetpackSpawnState() {
  lastSpawnX = CANVAS_WIDTH;
  lastVehicleDistance = 0;
  lastSpeedGateDistance = 0;
}

function spawnProceduralElements(
  player: JetpackPlayer,
  obstacles: Obstacle[],
  shards: ShardCollectible[],
  vehicleTokens: VehicleTokenEntity[],
  speedGates: SpeedGateEntity[],
  scientists: LabScientistNPC[],
  globalFrame: number
) {
  const maxObstacleX = obstacles.reduce((max, o) => Math.max(max, o.x), 0);

  if (maxObstacleX < CANVAS_WIDTH + 240) {
    const spawnX = Math.max(CANVAS_WIDTH + 100, maxObstacleX + 180 + Math.random() * 120);
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
        rotSpeed: 0.032,
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
      // High-voltage laser gate top or bottom
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

    // Spawn Speed Booster Ring every ~320m
    if (player.distance - lastSpeedGateDistance > 300) {
      lastSpeedGateDistance = player.distance;
      speedGates.push({
        id: `sg_${Date.now()}`,
        x: spawnX + 160,
        y: CEILING_Y + 70 + Math.random() * 180,
        w: 36,
        h: 36,
        active: true,
      });
    }

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
        w: 28,
        h: 28,
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
  const formation = Math.floor(Math.random() * 4);

  if (formation === 0) {
    // Sine Wave pattern
    const baseY = CEILING_Y + 80 + Math.random() * 180;
    for (let i = 0; i < 8; i++) {
      shards.push({
        id: `sh_${Date.now()}_${i}`,
        x: startX + i * 26,
        y: baseY + Math.sin(i * 0.6) * 45,
        collected: false,
      });
    }
  } else if (formation === 1) {
    // 3x3 Shard Block Matrix
    const baseY = CEILING_Y + 60 + Math.random() * 160;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        shards.push({
          id: `sh_${Date.now()}_${r}_${c}`,
          x: startX + c * 24,
          y: baseY + r * 24,
          collected: false,
        });
      }
    }
  } else if (formation === 2) {
    // Parabolic Arc
    const peakY = CEILING_Y + 60;
    for (let i = 0; i < 7; i++) {
      const t = (i - 3) / 3;
      shards.push({
        id: `sh_${Date.now()}_${i}`,
        x: startX + i * 28,
        y: peakY + t * t * 140,
        collected: false,
      });
    }
  } else {
    // Straight Flight Corridor Line
    const lineY = CEILING_Y + 50 + Math.random() * 240;
    for (let i = 0; i < 6; i++) {
      shards.push({
        id: `sh_${Date.now()}_${i}`,
        x: startX + i * 26,
        y: lineY,
        collected: false,
      });
    }
  }
}

function spawnShatterParticles(particles: JetpackParticle[], x: number, y: number, color: string) {
  for (let i = 0; i < 14; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 3,
      color,
      life: 20 + Math.random() * 10,
      maxLife: 30,
      gravity: 0.15,
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

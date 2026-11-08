// High-Precision Platformer Physics Engine for CYBER NOVA: Sol-Runner Odyssey
// Smooth 60 FPS physics, elastic block bumping, popping shard animations,
// enemy stomping, rolling kinetic sphere mechanics, and boss overload sequences.

import { 
  Player, 
  Enemy, 
  LevelConfig, 
  PowerUpItemEntity, 
  PoppingShardEntity,
  PlasmaBoltEntity, 
  TitanPlasmaWave,
  ScorePopup, 
  Particle,
  StakingPerks,
  TileBlock
} from './types';
import { TILE_SIZE } from './sprites';
import { sounds } from '../audio/sound-effects';

export const GRAVITY = 0.58;
export const MAX_FALL_SPEED = 11.0;
export const RUN_ACCEL = 0.45;
export const SPRINT_ACCEL = 0.68;
export const FRICTION = 0.84;
export const BASE_JUMP_FORCE = -11.8;

export interface PhysicsTickOutput {
  shardsGained: number;
  scoreGained: number;
  levelCleared: boolean;
  playerDied: boolean;
  bossDefeated: boolean;
}

export function rectIntersect(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

export function isSolidTile(type: string): boolean {
  return (
    type === 'circuit_floor' ||
    type === 'carbon_brick' ||
    type === 'matrix_cache' ||
    type === 'spent_alloy' ||
    type === 'transit_pipe_tl' ||
    type === 'transit_pipe_tr' ||
    type === 'transit_pipe_bl' ||
    type === 'transit_pipe_br' ||
    type === 'launch_pad' ||
    type === 'flux_bridge' ||
    type === 'citadel_plating'
  );
}

/**
 * Main physics tick
 */
export function updateGamePhysics(
  player: Player,
  level: LevelConfig,
  inputKeys: { left: boolean; right: boolean; jump: boolean; sprint: boolean; fire: boolean },
  powerUps: PowerUpItemEntity[],
  poppingShards: PoppingShardEntity[],
  plasmaBolts: PlasmaBoltEntity[],
  titanWaves: TitanPlasmaWave[],
  scorePopups: ScorePopup[],
  particles: Particle[],
  perks: StakingPerks,
  globalFrame: number
): PhysicsTickOutput {
  const output: PhysicsTickOutput = {
    shardsGained: 0,
    scoreGained: 0,
    levelCleared: false,
    playerDied: false,
    bossDefeated: false,
  };

  // 1. Update Block Bumping Animations (smooth elastic bounce-back)
  for (let ty = 0; ty < level.heightTiles; ty++) {
    for (let tx = 0; tx < level.widthTiles; tx++) {
      const tile = level.mapGrid[ty][tx];
      if (tile && (tile.bumpOffsetY !== 0 || tile.bumpVy !== 0)) {
        tile.bumpOffsetY += tile.bumpVy;
        tile.bumpVy += 1.2; // gravity pulling block back down
        if (tile.bumpOffsetY >= 0) {
          tile.bumpOffsetY = 0;
          tile.bumpVy = 0;
        }
      }
    }
  }

  // 2. Update Popping Shards
  for (let i = poppingShards.length - 1; i >= 0; i--) {
    const s = poppingShards[i];
    s.y += s.vy;
    s.vy += 0.4;
    s.life--;
    if (s.life <= 0) {
      poppingShards.splice(i, 1);
    }
  }

  // 3. Handle Death / Uplink Sequence
  if (player.isDying) {
    player.vy += GRAVITY * 0.8;
    player.y += player.vy;
    player.deathTimer--;
    if (player.deathTimer <= 0) {
      output.playerDied = true;
    }
    return output;
  }

  if (player.uplinkSliding) {
    player.y += 3.5;
    const groundY = 12 * TILE_SIZE - (player.powerUp === 'standard' ? 24 : 32);
    if (player.y >= groundY) {
      player.y = groundY;
      player.x += 2.0; // Sola jogs into the Gateway Sanctuary
      if (player.x >= (level.uplinkTileX ? (level.uplinkTileX + 7) * TILE_SIZE : player.x + 120)) {
        output.levelCleared = true;
      }
    }
    return output;
  }

  // 4. Timers & Perks
  if (player.invincibleTimer > 0) player.invincibleTimer--;
  if (player.hyperTimer > 0) {
    player.hyperTimer--;
    if (player.hyperTimer === 0 && player.powerUp === 'hyper') {
      player.powerUp = 'overcharge';
      sounds.stopBGM();
      sounds.startBGM(level.musicTheme);
    }
  }

  // Magnet Aura Perk (vacuum nearby cache shards)
  if (perks.shardMagnet) {
    const px = Math.floor(player.x / TILE_SIZE);
    const py = Math.floor(player.y / TILE_SIZE);
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const ty = py + dy;
        const tx = px + dx;
        if (ty >= 0 && ty < level.heightTiles && tx >= 0 && tx < level.widthTiles) {
          const t = level.mapGrid[ty][tx];
          if (t && t.type === 'matrix_cache' && t.shardsLeft > 0) {
            t.shardsLeft = 0;
            t.type = 'spent_alloy';
            output.shardsGained += 1;
            output.scoreGained += 200;
            sounds.playCoin();
          }
        }
      }
    }
  }

  // 5. Horizontal Physics
  const accel = inputKeys.sprint ? SPRINT_ACCEL : RUN_ACCEL;
  const maxSpeed = inputKeys.sprint ? 5.8 : 4.0;

  if (inputKeys.left) {
    player.vx -= accel;
    player.facingLeft = true;
  } else if (inputKeys.right) {
    player.vx += accel;
    player.facingLeft = false;
  } else {
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }

  if (player.vx > maxSpeed) player.vx = maxSpeed;
  if (player.vx < -maxSpeed) player.vx = -maxSpeed;

  player.x += player.vx;
  handleHorizontalCollisions(player, level);

  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }

  if (Math.abs(player.vx) > 0.2 && player.grounded) {
    player.walkCounter += Math.abs(player.vx);
    if (player.walkCounter > 8) {
      player.walkFrame++;
      player.walkCounter = 0;
    }
  }

  // 6. Vertical Physics (Jumping & Ceiling Bonk)
  let jumpForce = BASE_JUMP_FORCE;
  if (perks.superJump) {
    jumpForce *= 1.18;
  }

  if (inputKeys.jump && player.grounded) {
    player.vy = jumpForce;
    player.grounded = false;
    sounds.playJump(player.powerUp !== 'standard');
  }

  player.vy += GRAVITY;
  if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;

  player.y += player.vy;
  player.grounded = false;
  handleVerticalCollisions(player, level, powerUps, poppingShards, scorePopups, particles, output);

  // 7. Pit Fall Check
  if (player.y > level.heightTiles * TILE_SIZE + 40) {
    triggerPlayerDeath(player);
    return output;
  }

  // 8. Validator Uplink Pylon Collision
  if (level.hasUplinkPylon && level.uplinkTileX) {
    const pylonX = level.uplinkTileX * TILE_SIZE;
    if (Math.abs(player.x - pylonX) < 22 && player.y < 12 * TILE_SIZE) {
      player.uplinkSliding = true;
      player.vx = 0;
      player.vy = 0;
      sounds.playFlagpole();
      sounds.playStageClear();
      output.scoreGained += 5000;
      return output;
    }
  }

  // 9. Boss Core Fuse Overload (World 1-4)
  if (level.hasCoreFuse && level.fuseTileX) {
    const fuseX = level.fuseTileX * TILE_SIZE;
    const fuseY = 10 * TILE_SIZE;
    const fuseRect = { x: fuseX, y: fuseY, w: TILE_SIZE, h: TILE_SIZE };
    const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };

    if (rectIntersect(playerRect, fuseRect)) {
      // Overload the magnetic flux bridge!
      if (level.bridgeStartX && level.bridgeEndX) {
        for (let bx = level.bridgeStartX; bx <= level.bridgeEndX; bx++) {
          level.mapGrid[11][bx] = { type: 'empty', hiddenItem: 'none', shardsLeft: 0, bumpOffsetY: 0, bumpVy: 0 };
        }
      }
      sounds.playBossDefeat();
      output.bossDefeated = true;
      output.scoreGained += 10000;

      const boss = level.enemies.find(e => e.type === 'macro_titan');
      if (boss) {
        boss.state = 'terminated';
        boss.vy = 6;
      }

      setTimeout(() => {
        output.levelCleared = true;
      }, 1500);
    }
  }

  // 10. Enemies Interactions
  updateEnemies(player, level, output, particles, scorePopups, titanWaves);

  // 11. PowerUp Entities
  updatePowerUps(player, level, powerUps, output);

  // 12. Plasma Bolts
  updatePlasmaBolts(plasmaBolts, level, player, output, particles);

  // 12b. Titan Plasma Waves
  updateTitanWaves(titanWaves, player);

  // 13. Kinetic Launchpad Check
  const footTileX = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const footTileY = Math.floor((player.y + player.h) / TILE_SIZE);
  if (
    footTileY >= 0 && footTileY < level.heightTiles &&
    footTileX >= 0 && footTileX < level.widthTiles
  ) {
    const t = level.mapGrid[footTileY][footTileX];
    if (t && t.type === 'launch_pad') {
      player.vy = -18.0; // High magnetic bounce!
      sounds.playJump(true);
    }
  }

  return output;
}

/**
 * Clean Horizontal Collision Resolution
 */
function handleHorizontalCollisions(player: Player, level: LevelConfig) {
  // Use vertical middle sample points to prevent sticking to ground corners
  const leftTile = Math.floor(player.x / TILE_SIZE);
  const rightTile = Math.floor((player.x + player.w) / TILE_SIZE);
  const topTile = Math.floor((player.y + 4) / TILE_SIZE);
  const bottomTile = Math.floor((player.y + player.h - 4) / TILE_SIZE);

  for (let ty = topTile; ty <= bottomTile; ty++) {
    for (let tx = leftTile; tx <= rightTile; tx++) {
      if (ty < 0 || ty >= level.heightTiles || tx < 0 || tx >= level.widthTiles) continue;
      const tile = level.mapGrid[ty][tx];
      if (isSolidTile(tile.type)) {
        if (player.vx > 0) {
          player.x = tx * TILE_SIZE - player.w - 0.05;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = (tx + 1) * TILE_SIZE + 0.05;
          player.vx = 0;
        }
      }
    }
  }
}

/**
 * Clean Vertical Collision Resolution with BLOCK BONKING FIX
 */
function handleVerticalCollisions(
  player: Player,
  level: LevelConfig,
  powerUps: PowerUpItemEntity[],
  poppingShards: PoppingShardEntity[],
  scorePopups: ScorePopup[],
  particles: Particle[],
  output: PhysicsTickOutput
) {
  // Inset horizontal sample points so player can cleanly jump between blocks
  const leftTile = Math.floor((player.x + 4) / TILE_SIZE);
  const rightTile = Math.floor((player.x + player.w - 4) / TILE_SIZE);

  if (player.vy >= 0) {
    // Falling / Landing on floor
    const bottomTile = Math.floor((player.y + player.h) / TILE_SIZE);
    for (let tx = leftTile; tx <= rightTile; tx++) {
      if (bottomTile >= 0 && bottomTile < level.heightTiles && tx >= 0 && tx < level.widthTiles) {
        const tile = level.mapGrid[bottomTile][tx];
        if (isSolidTile(tile.type)) {
          player.y = bottomTile * TILE_SIZE - player.h;
          player.vy = 0;
          player.grounded = true;
          return;
        }
      }
    }
  } else {
    // Jumping UP / Bonking ceiling / Hitting Block from below!
    const topTile = Math.floor(player.y / TILE_SIZE);
    for (let tx = leftTile; tx <= rightTile; tx++) {
      if (topTile >= 0 && topTile < level.heightTiles && tx >= 0 && tx < level.widthTiles) {
        const tile = level.mapGrid[topTile][tx];
        if (isSolidTile(tile.type)) {
          // Snap player down and reverse velocity
          player.y = (topTile + 1) * TILE_SIZE;
          player.vy = 2.0;

          // Trigger block reaction!
          bonkBlock(tx, topTile, tile, player, level, powerUps, poppingShards, scorePopups, particles, output);
          return;
        }
      }
    }
  }
}

/**
 * Interactive Block Bonk Action (Spring animation + Popping Shards / Powerups)
 */
function bonkBlock(
  tx: number,
  ty: number,
  tile: TileBlock,
  player: Player,
  level: LevelConfig,
  powerUps: PowerUpItemEntity[],
  poppingShards: PoppingShardEntity[],
  scorePopups: ScorePopup[],
  particles: Particle[],
  output: PhysicsTickOutput
) {
  // Elastic spring bump upward
  tile.bumpOffsetY = -8;
  tile.bumpVy = -4.0;

  if (tile.type === 'matrix_cache') {
    if (tile.hiddenItem === 'shard' || tile.shardsLeft > 0) {
      output.shardsGained += 1;
      output.scoreGained += 200;
      sounds.playCoin();
      tile.shardsLeft--;

      // Spawn animated popping shard!
      poppingShards.push({
        id: `pop_${Date.now()}_${Math.random()}`,
        x: tx * TILE_SIZE + 8,
        y: (ty - 1) * TILE_SIZE + 8,
        vy: -7.5,
        life: 25,
      });

      if (tile.shardsLeft <= 0) {
        tile.type = 'spent_alloy';
      }
    } else if (
      tile.hiddenItem === 'overcharge' || 
      tile.hiddenItem === 'plasma_core' || 
      tile.hiddenItem === 'hyper_matrix' || 
      tile.hiddenItem === 'reboot_life'
    ) {
      sounds.playPowerupSprout();

      // Smoothly sprout item out of block
      powerUps.push({
        id: `p_${Date.now()}_${Math.random()}`,
        type: tile.hiddenItem,
        x: tx * TILE_SIZE + 4,
        y: (ty - 1) * TILE_SIZE,
        vx: 1.4,
        vy: -2.0,
        w: 24,
        h: 24,
        grounded: false,
        sprouting: true,
        sproutProgress: 0,
        originY: ty * TILE_SIZE,
      });

      tile.type = 'spent_alloy';
    }
  } else if (tile.type === 'carbon_brick') {
    if (player.powerUp === 'standard') {
      sounds.playJump(false);
    } else {
      // Overcharged Nova shatters the carbon brick!
      sounds.playBrickBreak();
      tile.type = 'empty';
      output.scoreGained += 50;

      // Shatter debris voxels
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: tx * TILE_SIZE + 16,
          y: ty * TILE_SIZE + 16,
          vx: (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 2),
          vy: -4 - Math.random() * 3,
          color: '#6366F1',
          size: 5,
          life: 25,
          maxLife: 25,
          gravity: 0.35,
        });
      }
    }
  } else if (tile.type === 'spent_alloy') {
    sounds.playJump(false);
  }
}

/**
 * Updates enemies, AI behavior, and player stomping
 */
function updateEnemies(
  player: Player,
  level: LevelConfig,
  output: PhysicsTickOutput,
  particles: Particle[],
  scorePopups: ScorePopup[],
  titanWaves: TitanPlasmaWave[]
) {
  for (const enemy of level.enemies) {
    if (enemy.state === 'terminated') continue;

    if (enemy.state === 'crushed') {
      enemy.stateTimer++;
      if (enemy.stateTimer > 25) {
        enemy.state = 'terminated';
      }
      continue;
    }

    enemy.vy += GRAVITY;
    if (enemy.vy > MAX_FALL_SPEED) enemy.vy = MAX_FALL_SPEED;

    if (enemy.type === 'macro_titan') {
      enemy.attackTimer = (enemy.attackTimer || 120) - 1;
      if (enemy.attackTimer <= 0) {
        enemy.attackTimer = 130 + Math.floor(Math.random() * 40);
        titanWaves.push({
          id: `tw_${Date.now()}_${Math.random()}`,
          x: enemy.x - 8,
          y: enemy.y + 20,
          vx: -4.2,
          vy: 0,
          active: true,
        });
        sounds.playFireball();
      }
      if (Math.random() < 0.015 && enemy.vy === 0) {
        enemy.vy = -7.5;
      }
    }

    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    // Floor collision
    const bottomTile = Math.floor((enemy.y + enemy.h) / TILE_SIZE);
    const centerTile = Math.floor((enemy.x + enemy.w / 2) / TILE_SIZE);
    if (bottomTile >= 0 && bottomTile < level.heightTiles && centerTile >= 0 && centerTile < level.widthTiles) {
      const tile = level.mapGrid[bottomTile][centerTile];
      if (isSolidTile(tile.type)) {
        enemy.y = bottomTile * TILE_SIZE - enemy.h;
        enemy.vy = 0;
      }
    }

    // Wall bounce
    const sideTile = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / TILE_SIZE);
    const midYTile = Math.floor((enemy.y + enemy.h / 2) / TILE_SIZE);
    if (midYTile >= 0 && midYTile < level.heightTiles && sideTile >= 0 && sideTile < level.widthTiles) {
      const t = level.mapGrid[midYTile][sideTile];
      if (isSolidTile(t.type)) {
        enemy.vx = -enemy.vx;
        enemy.facingLeft = enemy.vx < 0;
      }
    }

    // Player vs Enemy Collision
    const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    const eRect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };

    if (rectIntersect(pRect, eRect)) {
      if (player.hyperTimer > 0) {
        enemy.state = 'terminated';
        output.scoreGained += 200;
        sounds.playKick();
        continue;
      }

      // Stomp from above
      const isStomp = player.vy > 0 && (player.y + player.h - player.vy) <= enemy.y + 12;

      if (isStomp && enemy.type !== 'plasma_sentry') {
        if (enemy.type === 'fud_bot') {
          enemy.state = 'crushed';
          enemy.vx = 0;
          player.vy = -8.8;
          sounds.playStomp();
          output.scoreGained += 100;
        } else if (enemy.type === 'shield_orb') {
          if (enemy.state === 'patrol') {
            enemy.state = 'sphere_idle';
            enemy.vx = 0;
            player.vy = -8.8;
            sounds.playStomp();
            output.scoreGained += 100;
          } else if (enemy.state === 'sphere_idle') {
            // Kick spherical drone!
            enemy.state = 'sphere_rolling';
            enemy.vx = player.facingLeft ? -9 : 9;
            sounds.playKick();
            output.scoreGained += 400;
          }
        } else if (enemy.type === 'macro_titan') {
          player.vy = -8;
          if (enemy.health && enemy.health > 1) {
            enemy.health--;
            sounds.playStomp();
          }
        }
      } else {
        if (enemy.state === 'sphere_idle') {
          // Kick stationary sphere
          enemy.state = 'sphere_rolling';
          enemy.vx = player.facingLeft ? -9 : 9;
          sounds.playKick();
        } else if (player.invincibleTimer <= 0) {
          handlePlayerHit(player);
        }
      }
    }
  }
}

export function handlePlayerHit(player: Player) {
  if (player.powerUp === 'plasma' || player.powerUp === 'overcharge') {
    player.powerUp = 'standard';
    player.h = 24;
    player.invincibleTimer = 90;
    sounds.playPowerdown();
  } else {
    triggerPlayerDeath(player);
  }
}

export function triggerPlayerDeath(player: Player) {
  player.isDying = true;
  player.vy = -12;
  player.vx = 0;
  player.deathTimer = 60;
  sounds.playGameOver();
}

function updatePowerUps(
  player: Player,
  level: LevelConfig,
  powerUps: PowerUpItemEntity[],
  output: PhysicsTickOutput
) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const item = powerUps[i];

    if (item.sprouting) {
      item.sproutProgress += 0.08;
      item.y -= 1.2;
      if (item.sproutProgress >= 1.0) {
        item.sprouting = false;
      }
      continue;
    }

    item.vy += GRAVITY * 0.7;
    item.x += item.vx;
    item.y += item.vy;

    // Floor collision
    const bottomTile = Math.floor((item.y + item.h) / TILE_SIZE);
    const centerTile = Math.floor((item.x + item.w / 2) / TILE_SIZE);
    if (bottomTile >= 0 && bottomTile < level.heightTiles && centerTile >= 0 && centerTile < level.widthTiles) {
      const tile = level.mapGrid[bottomTile][centerTile];
      if (isSolidTile(tile.type)) {
        item.y = bottomTile * TILE_SIZE - item.h;
        item.vy = item.type === 'hyper_matrix' ? -6 : 0;
      }
    }

    const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    const iRect = { x: item.x, y: item.y, w: item.w, h: item.h };

    if (rectIntersect(pRect, iRect)) {
      if (item.type === 'overcharge') {
        player.powerUp = player.powerUp === 'plasma' ? 'plasma' : 'overcharge';
        player.h = 32;
        sounds.playPowerup();
        output.scoreGained += 1000;
      } else if (item.type === 'plasma_core') {
        player.powerUp = 'plasma';
        player.h = 32;
        sounds.playPowerup();
        output.scoreGained += 1000;
      } else if (item.type === 'hyper_matrix') {
        player.hyperTimer = 600;
        sounds.playPowerup();
        sounds.startBGM('star');
        output.scoreGained += 1000;
      } else if (item.type === 'reboot_life') {
        sounds.play1Up();
        output.scoreGained += 1000;
      }

      powerUps.splice(i, 1);
    }
  }
}

function updatePlasmaBolts(
  plasmaBolts: PlasmaBoltEntity[],
  level: LevelConfig,
  player: Player,
  output: PhysicsTickOutput,
  particles: Particle[]
) {
  for (let i = plasmaBolts.length - 1; i >= 0; i--) {
    const bolt = plasmaBolts[i];
    bolt.vy += GRAVITY;
    bolt.x += bolt.vx;
    bolt.y += bolt.vy;

    const bottomTile = Math.floor((bolt.y + bolt.h) / TILE_SIZE);
    const centerTile = Math.floor((bolt.x + bolt.w / 2) / TILE_SIZE);
    if (bottomTile >= 0 && bottomTile < level.heightTiles && centerTile >= 0 && centerTile < level.widthTiles) {
      const tile = level.mapGrid[bottomTile][centerTile];
      if (isSolidTile(tile.type)) {
        bolt.y = bottomTile * TILE_SIZE - bolt.h;
        bolt.vy = -6;
        bolt.bounces++;
      }
    }

    for (const enemy of level.enemies) {
      if (enemy.state === 'terminated' || enemy.state === 'crushed') continue;
      const eRect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      const fRect = { x: bolt.x, y: bolt.y, w: bolt.w, h: bolt.h };

      if (rectIntersect(fRect, eRect)) {
        if (enemy.type === 'macro_titan') {
          bolt.active = false;
          if (enemy.health && enemy.health > 1) {
            enemy.health--;
            sounds.playKick();
            output.scoreGained += 200;
          } else {
            enemy.state = 'terminated';
            sounds.playBossDefeat();
            output.bossDefeated = true;
            output.scoreGained += 2500;
          }
        } else {
          enemy.state = 'terminated';
          output.scoreGained += 200;
          sounds.playKick();
          bolt.active = false;
        }
        break;
      }
    }

    if (bolt.bounces > 4 || !bolt.active || bolt.y > level.heightTiles * TILE_SIZE) {
      plasmaBolts.splice(i, 1);
    }
  }
}

function updateTitanWaves(
  titanWaves: TitanPlasmaWave[],
  player: Player
) {
  for (let i = titanWaves.length - 1; i >= 0; i--) {
    const wave = titanWaves[i];
    wave.x += wave.vx;

    // Remove if off screen or inactive
    if (wave.x < -100 || !wave.active) {
      titanWaves.splice(i, 1);
      continue;
    }

    // Player collision with wave
    const waveRect = { x: wave.x, y: wave.y, w: 22, h: 16 };
    const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (rectIntersect(pRect, waveRect)) {
      if (player.hyperTimer > 0) {
        wave.active = false;
        sounds.playKick();
      } else if (player.invincibleTimer <= 0) {
        wave.active = false;
        handlePlayerHit(player);
      }
    }
  }
}

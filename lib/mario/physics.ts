// Mario Platformer Physics & Collision System
// Handles AABB collision, variable jumping, enemy stomping, block bumping,
// fireball bouncing, and flagpole / boss axe triggers.

import { 
  Player, 
  Enemy, 
  LevelConfig, 
  PowerUpItemEntity, 
  FireballEntity, 
  BowserFireball,
  ScorePopup, 
  Particle,
  StakingPerks
} from './types';
import { TILE_SIZE } from './sprites';
import { sounds } from '../audio/sound-effects';

export const GRAVITY = 0.58;
export const MAX_FALL_SPEED = 11.0;
export const RUN_ACCEL = 0.42;
export const SPRINT_ACCEL = 0.65;
export const FRICTION = 0.84;
export const BASE_JUMP_FORCE = -11.6;

export interface PhysicsTickOutput {
  coinsGained: number;
  scoreGained: number;
  levelCleared: boolean;
  playerDied: boolean;
  bossDefeated: boolean;
}

/**
 * Checks AABB intersection between two rectangles
 */
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

/**
 * Main physics step for the game loop
 */
export function updateGamePhysics(
  player: Player,
  level: LevelConfig,
  inputKeys: { left: boolean; right: boolean; jump: boolean; sprint: boolean; fire: boolean },
  powerUps: PowerUpItemEntity[],
  fireballs: FireballEntity[],
  bowserFireballs: BowserFireball[],
  scorePopups: ScorePopup[],
  particles: Particle[],
  perks: StakingPerks,
  globalFrame: number
): PhysicsTickOutput {
  const output: PhysicsTickOutput = {
    coinsGained: 0,
    scoreGained: 0,
    levelCleared: false,
    playerDied: false,
    bossDefeated: false,
  };

  // 1. Handle Dead / Flagpole Sliding Sequence
  if (player.isDying) {
    player.vy += GRAVITY * 0.8;
    player.y += player.vy;
    player.deathTimer--;
    if (player.deathTimer <= 0) {
      output.playerDied = true;
    }
    return output;
  }

  if (player.flagpoleSliding) {
    player.y += 3;
    const groundY = 12 * TILE_SIZE - (player.powerUp === 'small' ? 24 : 32);
    if (player.y >= groundY) {
      player.y = groundY;
      player.x += 1.8; // Solario walks towards castle
      if (player.x >= (level.flagpoleTileX ? (level.flagpoleTileX + 7) * TILE_SIZE : player.x + 100)) {
        output.levelCleared = true;
      }
    }
    return output;
  }

  // 2. Decrement temporary timers
  if (player.invincibleTimer > 0) player.invincibleTimer--;
  if (player.starTimer > 0) {
    player.starTimer--;
    if (player.starTimer === 0 && player.powerUp === 'star') {
      player.powerUp = 'super';
      sounds.stopBGM();
      sounds.startBGM(level.musicTheme);
    }
  }

  // Magnet Aura Perk: pull coins within 4 tiles towards player
  if (perks.coinMagnet) {
    const tileRange = 4;
    const px = Math.floor(player.x / TILE_SIZE);
    const py = Math.floor(player.y / TILE_SIZE);
    for (let dy = -tileRange; dy <= tileRange; dy++) {
      for (let dx = -tileRange; dx <= tileRange; dx++) {
        const ty = py + dy;
        const tx = px + dx;
        if (ty >= 0 && ty < level.heightTiles && tx >= 0 && tx < level.widthTiles) {
          const t = level.mapGrid[ty][tx];
          if (t && t.type === 'question' && t.coinsLeft > 0) {
            // vacuum coin
            t.coinsLeft = 0;
            t.type = 'metal';
            output.coinsGained += 1;
            output.scoreGained += 200;
            sounds.playCoin();
          }
        }
      }
    }
  }

  // 3. Horizontal Movement
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

  // Clamp max speed
  if (player.vx > maxSpeed) player.vx = maxSpeed;
  if (player.vx < -maxSpeed) player.vx = -maxSpeed;

  // Move X & check tile collisions
  player.x += player.vx;
  handleHorizontalTileCollisions(player, level);

  // Prevent leaving left edge of screen
  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }

  // Walk animation frame update
  if (Math.abs(player.vx) > 0.2 && player.grounded) {
    player.walkCounter += Math.abs(player.vx);
    if (player.walkCounter > 10) {
      player.walkFrame++;
      player.walkCounter = 0;
    }
  }

  // 4. Vertical Movement & Jumping
  let jumpForce = BASE_JUMP_FORCE;
  if (perks.superJump) {
    jumpForce *= 1.18; // +18% jump height
  }

  if (inputKeys.jump && player.grounded) {
    player.vy = jumpForce;
    player.grounded = false;
    sounds.playJump(player.powerUp !== 'small');
  }

  // Apply gravity
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;

  player.y += player.vy;
  player.grounded = false;
  handleVerticalTileCollisions(player, level, powerUps, scorePopups, particles, output);

  // 5. Pit Fall Check
  if (player.y > level.heightTiles * TILE_SIZE + 40) {
    triggerPlayerDeath(player);
    return output;
  }

  // 6. Flagpole Collision
  if (level.hasFlagpole && level.flagpoleTileX) {
    const poleX = level.flagpoleTileX * TILE_SIZE;
    if (Math.abs(player.x - poleX) < 20 && player.y < 12 * TILE_SIZE) {
      player.flagpoleSliding = true;
      player.vx = 0;
      player.vy = 0;
      sounds.playFlagpole();
      sounds.playStageClear();
      output.scoreGained += 5000;
      return output;
    }
  }

  // 7. Boss Golden Axe Collision (World 1-4)
  if (level.hasAxe && level.axeTileX) {
    const axeX = level.axeTileX * TILE_SIZE;
    const axeY = 10 * TILE_SIZE;
    const axeRect = { x: axeX, y: axeY, w: TILE_SIZE, h: TILE_SIZE };
    const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };

    if (rectIntersect(playerRect, axeRect)) {
      // Collapse the bridge into the lava!
      if (level.bridgeStartX && level.bridgeEndX) {
        for (let bx = level.bridgeStartX; bx <= level.bridgeEndX; bx++) {
          level.mapGrid[11][bx] = { type: 'empty', hiddenItem: 'none', coinsLeft: 0, bumpOffsetY: 0, bumpVy: 0 };
        }
      }
      sounds.playBossDefeat();
      output.bossDefeated = true;
      output.scoreGained += 10000;

      // Bowser falls into lava
      const bowser = level.enemies.find(e => e.type === 'bowser');
      if (bowser) {
        bowser.state = 'dead';
        bowser.vy = 6;
      }

      // Solario walks forward to victory chamber
      setTimeout(() => {
        output.levelCleared = true;
      }, 1500);
    }
  }

  // 8. Enemy Updates & Interactions
  updateEnemies(player, level, output, particles, scorePopups);

  // 9. PowerUp Entities Update
  updatePowerUps(player, level, powerUps, output);

  // 10. Fireballs Update
  updateFireballs(fireballs, bowserFireballs, level, player, output, particles);

  // 11. Springboard Trampoline Check
  const currentTileX = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const currentTileY = Math.floor((player.y + player.h) / TILE_SIZE);
  if (
    currentTileY >= 0 && currentTileY < level.heightTiles &&
    currentTileX >= 0 && currentTileX < level.widthTiles
  ) {
    const t = level.mapGrid[currentTileY][currentTileX];
    if (t && t.type === 'springboard') {
      player.vy = -17.5; // High launch!
      sounds.playJump(true);
    }
  }

  return output;
}

/**
 * Horizontal tile collision resolution
 */
function handleHorizontalTileCollisions(player: Player, level: LevelConfig) {
  const leftTile = Math.floor(player.x / TILE_SIZE);
  const rightTile = Math.floor((player.x + player.w) / TILE_SIZE);
  const topTile = Math.floor(player.y / TILE_SIZE);
  const bottomTile = Math.floor((player.y + player.h - 1) / TILE_SIZE);

  for (let ty = topTile; ty <= bottomTile; ty++) {
    for (let tx = leftTile; tx <= rightTile; tx++) {
      if (ty < 0 || ty >= level.heightTiles || tx < 0 || tx >= level.widthTiles) continue;
      const tile = level.mapGrid[ty][tx];
      if (isSolidTile(tile.type)) {
        if (player.vx > 0) {
          player.x = tx * TILE_SIZE - player.w - 0.01;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = (tx + 1) * TILE_SIZE + 0.01;
          player.vx = 0;
        }
      }
    }
  }
}

/**
 * Vertical tile collision resolution (floor landing & ceiling bonk)
 */
function handleVerticalTileCollisions(
  player: Player,
  level: LevelConfig,
  powerUps: PowerUpItemEntity[],
  scorePopups: ScorePopup[],
  particles: Particle[],
  output: PhysicsTickOutput
) {
  const leftTile = Math.floor((player.x + 2) / TILE_SIZE);
  const rightTile = Math.floor((player.x + player.w - 2) / TILE_SIZE);
  const topTile = Math.floor(player.y / TILE_SIZE);
  const bottomTile = Math.floor((player.y + player.h) / TILE_SIZE);

  for (let ty = topTile; ty <= bottomTile; ty++) {
    for (let tx = leftTile; tx <= rightTile; tx++) {
      if (ty < 0 || ty >= level.heightTiles || tx < 0 || tx >= level.widthTiles) continue;
      const tile = level.mapGrid[ty][tx];

      if (isSolidTile(tile.type)) {
        if (player.vy > 0) {
          // Landing on top of tile
          player.y = ty * TILE_SIZE - player.h;
          player.vy = 0;
          player.grounded = true;
        } else if (player.vy < 0) {
          // Bonking ceiling from underneath!
          player.y = (ty + 1) * TILE_SIZE;
          player.vy = 1;

          // Block reaction
          bonkBlock(tx, ty, tile, player, level, powerUps, scorePopups, particles, output);
        }
      }
    }
  }
}

/**
 * Block bonking from underneath
 */
function bonkBlock(
  tx: number,
  ty: number,
  tile: { type: string; hiddenItem: string; coinsLeft: number; bumpOffsetY: number; bumpVy: number },
  player: Player,
  level: LevelConfig,
  powerUps: PowerUpItemEntity[],
  scorePopups: ScorePopup[],
  particles: Particle[],
  output: PhysicsTickOutput
) {
  tile.bumpOffsetY = -6;

  if (tile.type === 'question') {
    if (tile.hiddenItem === 'coin' || tile.coinsLeft > 0) {
      output.coinsGained += 1;
      output.scoreGained += 200;
      sounds.playCoin();
      tile.coinsLeft--;
      if (tile.coinsLeft <= 0) {
        tile.type = 'metal';
      }
    } else if (tile.hiddenItem === 'mushroom' || tile.hiddenItem === 'flower' || tile.hiddenItem === 'star' || tile.hiddenItem === '1up') {
      sounds.playPowerupSprout();
      // Sprout item upwards
      powerUps.push({
        id: `p_${Date.now()}_${Math.random()}`,
        type: tile.hiddenItem,
        x: tx * TILE_SIZE + 4,
        y: (ty - 1) * TILE_SIZE,
        vx: 1.2,
        vy: -2,
        w: 24,
        h: 24,
        grounded: false,
        sprouting: true,
        sproutY: ty * TILE_SIZE,
      });
      tile.type = 'metal';
    }
  } else if (tile.type === 'brick') {
    if (player.powerUp === 'small') {
      // Just bumps
      sounds.playJump(false);
    } else {
      // Big/Super Mario shatters the brick!
      sounds.playBrickBreak();
      tile.type = 'empty';
      output.scoreGained += 50;

      // Shatter debris particles
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: tx * TILE_SIZE + 16,
          y: ty * TILE_SIZE + 16,
          vx: (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 2),
          vy: -4 - Math.random() * 3,
          color: '#B84418',
          size: 6,
          life: 30,
          maxLife: 30,
          gravity: 0.4,
        });
      }
    }
  }
}

/**
 * Checks if a tile is solid to player/enemies
 */
export function isSolidTile(type: string): boolean {
  return (
    type === 'ground' ||
    type === 'brick' ||
    type === 'question' ||
    type === 'metal' ||
    type === 'pipe_tl' ||
    type === 'pipe_tr' ||
    type === 'pipe_bl' ||
    type === 'pipe_br' ||
    type === 'springboard' ||
    type === 'bridge' ||
    type === 'castle_brick'
  );
}

/**
 * Updates enemies, AI behavior, and player stomping
 */
function updateEnemies(
  player: Player,
  level: LevelConfig,
  output: PhysicsTickOutput,
  particles: Particle[],
  scorePopups: ScorePopup[]
) {
  for (const enemy of level.enemies) {
    if (enemy.state === 'dead') continue;

    if (enemy.state === 'squished') {
      enemy.stateTimer++;
      if (enemy.stateTimer > 25) {
        enemy.state = 'dead';
      }
      continue;
    }

    // Apply gravity to enemies
    enemy.vy += GRAVITY;
    if (enemy.vy > MAX_FALL_SPEED) enemy.vy = MAX_FALL_SPEED;

    // Bowser behavior
    if (enemy.type === 'bowser') {
      enemy.fireTimer = (enemy.fireTimer || 60) - 1;
      // Bowser leaps periodically
      if (Math.random() < 0.015 && enemy.vy === 0) {
        enemy.vy = -7;
      }
    }

    // Horizontal movement
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    // Floor collision for enemies
    const bottomTile = Math.floor((enemy.y + enemy.h) / TILE_SIZE);
    const centerTile = Math.floor((enemy.x + enemy.w / 2) / TILE_SIZE);
    if (bottomTile >= 0 && bottomTile < level.heightTiles && centerTile >= 0 && centerTile < level.widthTiles) {
      const tile = level.mapGrid[bottomTile][centerTile];
      if (isSolidTile(tile.type)) {
        enemy.y = bottomTile * TILE_SIZE - enemy.h;
        enemy.vy = 0;
      }
    }

    // Wall bounce for enemies
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
      // Star invincibility wipes enemy
      if (player.starTimer > 0) {
        enemy.state = 'dead';
        output.scoreGained += 200;
        sounds.playKick();
        continue;
      }

      // Stomp from above?
      const isStomp = player.vy > 0 && (player.y + player.h - player.vy) <= enemy.y + 12;

      if (isStomp && enemy.type !== 'piranha') {
        if (enemy.type === 'goomba') {
          enemy.state = 'squished';
          enemy.vx = 0;
          player.vy = -8.5; // Bounce up
          sounds.playStomp();
          output.scoreGained += 100;
        } else if (enemy.type === 'koopa') {
          if (enemy.state === 'walk') {
            enemy.state = 'shell_idle';
            enemy.vx = 0;
            player.vy = -8.5;
            sounds.playStomp();
            output.scoreGained += 100;
          } else if (enemy.state === 'shell_idle') {
            // Kick shell
            enemy.state = 'shell_moving';
            enemy.vx = player.facingLeft ? -8 : 8;
            sounds.playKick();
            output.scoreGained += 400;
          }
        } else if (enemy.type === 'bowser') {
          // Bouncing off Bowser's head hurts player unless he's stomped multiple times
          player.vy = -8;
          if (enemy.health && enemy.health > 1) {
            enemy.health--;
            sounds.playStomp();
          }
        }
      } else {
        // Player got hit from side
        if (enemy.state === 'shell_idle') {
          // Kick the stationary shell
          enemy.state = 'shell_moving';
          enemy.vx = player.facingLeft ? -8 : 8;
          sounds.playKick();
        } else if (player.invincibleTimer <= 0) {
          handlePlayerHit(player);
        }
      }
    }
  }
}

/**
 * Handles damage when player is hit
 */
export function handlePlayerHit(player: Player) {
  if (player.powerUp === 'fire' || player.powerUp === 'super') {
    player.powerUp = 'small';
    player.h = 24;
    player.invincibleTimer = 90; // invulnerable for 1.5s
    sounds.playPowerdown();
  } else {
    triggerPlayerDeath(player);
  }
}

/**
 * Triggers Solario death sequence
 */
export function triggerPlayerDeath(player: Player) {
  player.isDying = true;
  player.vy = -12;
  player.vx = 0;
  player.deathTimer = 60;
  sounds.playGameOver();
}

/**
 * Updates power-up items moving in level
 */
function updatePowerUps(
  player: Player,
  level: LevelConfig,
  powerUps: PowerUpItemEntity[],
  output: PhysicsTickOutput
) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const item = powerUps[i];

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
        item.vy = item.type === 'star' ? -6 : 0; // Star bounces!
      }
    }

    // Collect item?
    const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    const iRect = { x: item.x, y: item.y, w: item.w, h: item.h };

    if (rectIntersect(pRect, iRect)) {
      if (item.type === 'mushroom') {
        player.powerUp = player.powerUp === 'fire' ? 'fire' : 'super';
        player.h = 32;
        sounds.playPowerup();
        output.scoreGained += 1000;
      } else if (item.type === 'flower') {
        player.powerUp = 'fire';
        player.h = 32;
        sounds.playPowerup();
        output.scoreGained += 1000;
      } else if (item.type === 'star') {
        player.starTimer = 600; // 10 seconds of invincibility
        sounds.playPowerup();
        sounds.startBGM('star');
        output.scoreGained += 1000;
      } else if (item.type === '1up') {
        sounds.play1Up();
        output.scoreGained += 1000;
      }

      powerUps.splice(i, 1);
    }
  }
}

/**
 * Updates fireballs shot by Fire Mario
 */
function updateFireballs(
  fireballs: FireballEntity[],
  bowserFireballs: BowserFireball[],
  level: LevelConfig,
  player: Player,
  output: PhysicsTickOutput,
  particles: Particle[]
) {
  // Player fireballs
  for (let i = fireballs.length - 1; i >= 0; i--) {
    const fb = fireballs[i];
    fb.vy += GRAVITY;
    fb.x += fb.vx;
    fb.y += fb.vy;

    // Floor bounce
    const bottomTile = Math.floor((fb.y + fb.h) / TILE_SIZE);
    const centerTile = Math.floor((fb.x + fb.w / 2) / TILE_SIZE);
    if (bottomTile >= 0 && bottomTile < level.heightTiles && centerTile >= 0 && centerTile < level.widthTiles) {
      const tile = level.mapGrid[bottomTile][centerTile];
      if (isSolidTile(tile.type)) {
        fb.y = bottomTile * TILE_SIZE - fb.h;
        fb.vy = -6; // Bounce
        fb.bounces++;
      }
    }

    // Hit enemies
    for (const enemy of level.enemies) {
      if (enemy.state === 'dead' || enemy.state === 'squished') continue;
      const eRect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      const fRect = { x: fb.x, y: fb.y, w: fb.w, h: fb.h };

      if (rectIntersect(fRect, eRect)) {
        enemy.state = 'dead';
        output.scoreGained += 200;
        sounds.playKick();
        fb.active = false;
        break;
      }
    }

    if (fb.bounces > 4 || !fb.active || fb.y > level.heightTiles * TILE_SIZE) {
      fireballs.splice(i, 1);
    }
  }
}

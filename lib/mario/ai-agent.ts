// Autonomous AI Agent for Super Solario (Toad AI / Autonomous Mario)
// Evaluates terrain, pits, enemies, and blocks in real-time to play autonomously
// Signs on-chain speedrun attestations with its own Solana wallet on Devnet!

import { Player, LevelConfig } from './types';
import { TILE_SIZE } from './sprites';
import { isSolidTile } from './physics';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const AI_AGENT_KEY = 'solario_ai_toad_agent_key_v1';

export interface AiTelemetry {
  action: string;
  reason: string;
  confidence: number;
  lookaheadDistTiles: number;
  nextObstacle: string;
}

export function getOrCreateAiAgentKeypair(): Keypair {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(AI_AGENT_KEY);
    if (saved) {
      try {
        return Keypair.fromSecretKey(bs58.decode(saved));
      } catch {
        // regenerate
      }
    }
    const kp = Keypair.generate();
    localStorage.setItem(AI_AGENT_KEY, bs58.encode(kp.secretKey));
    return kp;
  }
  return Keypair.generate();
}

/**
 * Computes autonomous controller inputs for the current frame
 */
export function computeAiAgentAction(
  player: Player,
  level: LevelConfig,
  globalFrame: number
): {
  keys: { left: boolean; right: boolean; jump: boolean; sprint: boolean; fire: boolean };
  telemetry: AiTelemetry;
} {
  const keys = {
    left: false,
    right: true, // Default to running right
    jump: false,
    sprint: false,
    fire: false,
  };

  const currentTileX = Math.floor(player.x / TILE_SIZE);
  const currentTileY = Math.floor((player.y + player.h) / TILE_SIZE);

  let action = 'SPRINT_FORWARD';
  let reason = 'Clear path detected; accelerating toward goal';
  let confidence = 0.95;
  let nextObstacle = 'None';

  // Always sprint unless approaching a tricky jump
  keys.sprint = true;

  // Fireball spam if player has Fire Mario powerup
  if (player.powerUp === 'fire' && globalFrame % 25 === 0) {
    keys.fire = true;
  }

  // 1. Check for Upcoming Pits / Chasms (Lookahead 2 to 5 tiles)
  let pitDetected = false;
  let pitDist = 0;

  for (let dx = 1; dx <= 5; dx++) {
    const checkX = currentTileX + dx;
    if (checkX >= level.widthTiles) break;

    // Check if there is any floor tile under checkX (from y=11 to 14)
    let hasFloor = false;
    for (let ty = 11; ty <= 14; ty++) {
      if (ty < level.heightTiles && isSolidTile(level.mapGrid[ty][checkX].type)) {
        hasFloor = true;
        break;
      }
    }

    if (!hasFloor) {
      pitDetected = true;
      pitDist = dx;
      break;
    }
  }

  if (pitDetected) {
    nextObstacle = `Pit Chasm (${pitDist} tiles ahead)`;
    if (pitDist <= 2 && player.grounded) {
      keys.jump = true;
      keys.sprint = true;
      action = 'LEAP_PIT';
      reason = `Chasm detected at +${pitDist} tiles. Launching maximum parabolic jump.`;
      confidence = 0.98;
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: pitDist, nextObstacle } };
    }
  }

  // 2. Check for Approaching Enemies (within 140 pixels)
  for (const enemy of level.enemies) {
    if (enemy.state === 'dead' || enemy.state === 'squished') continue;
    const distToEnemy = enemy.x - player.x;

    if (distToEnemy > 0 && distToEnemy < 130) {
      nextObstacle = `${enemy.type.toUpperCase()} enemy (${Math.round(distToEnemy)}px)`;

      if (enemy.type === 'bowser') {
        // Castle Boss fight: Leap over Bowser or run for Golden Axe!
        if (player.grounded) {
          keys.jump = true;
          keys.sprint = true;
          action = 'BOSS_LEAP_TO_AXE';
          reason = 'Bowser detected on bridge! Executing evasive high jump toward Golden Solana Axe.';
          confidence = 0.99;
          return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: Math.round(distToEnemy / TILE_SIZE), nextObstacle } };
        }
      } else if (distToEnemy < 90 && player.grounded) {
        // Jump to stomp or jump over
        keys.jump = true;
        keys.sprint = false; // controlled jump
        action = 'STOMP_ATTACK';
        reason = `Approaching ${enemy.type}. Initiating aerial stomp trajectory.`;
        confidence = 0.94;
        return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: Math.round(distToEnemy / TILE_SIZE), nextObstacle } };
      }
    }
  }

  // 3. Check for Wall / Pipe Obstacle directly in front
  const checkFrontTileX = currentTileX + 1;
  const playerMidTileY = Math.floor((player.y + player.h / 2) / TILE_SIZE);
  if (
    checkFrontTileX < level.widthTiles &&
    playerMidTileY >= 0 &&
    playerMidTileY < level.heightTiles
  ) {
    const tileFront = level.mapGrid[playerMidTileY][checkFrontTileX];
    if (isSolidTile(tileFront.type) && player.grounded) {
      keys.jump = true;
      action = 'JUMP_OVER_WALL';
      reason = `Solid obstacle [${tileFront.type}] detected in path. Clearing hurdle.`;
      confidence = 0.96;
      nextObstacle = `Pipe / Wall`;
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: 1, nextObstacle } };
    }
  }

  // 4. Hit Question Blocks above player
  const tileAboveY = currentTileY - 3;
  if (tileAboveY >= 0 && currentTileX < level.widthTiles) {
    const tileAbove = level.mapGrid[tileAboveY][currentTileX];
    if (tileAbove.type === 'question' && player.grounded && Math.random() < 0.6) {
      keys.jump = true;
      action = 'HIT_MYSTERY_BLOCK';
      reason = 'Question block detected directly overhead. Harvesting Solana tokens / powerup.';
      confidence = 0.92;
      nextObstacle = 'Question Block';
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: 0, nextObstacle } };
    }
  }

  // 5. Approaching Flagpole (World clear)
  if (level.hasFlagpole && level.flagpoleTileX) {
    const distToPole = (level.flagpoleTileX * TILE_SIZE) - player.x;
    if (distToPole > 0 && distToPole < 100 && player.grounded) {
      keys.jump = true; // Grab high on pole for maximum points!
      action = 'FLAGPOLE_GRAB';
      reason = 'Flagpole in range! Executing high jump for maximum 5,000pt bonus.';
      confidence = 1.0;
      nextObstacle = 'Flagpole Goal';
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: Math.round(distToPole / TILE_SIZE), nextObstacle } };
    }
  }

  return {
    keys,
    telemetry: {
      action,
      reason,
      confidence,
      lookaheadDistTiles: 4,
      nextObstacle,
    },
  };
}

// Autonomous AI Copilot: A.R.I.A. (Autonomous Runner Intelligence Agent)
// Analyzes level tiles, obstacles, and enemy vectors in real time
// Holds its own dedicated ed25519 Solana wallet and signs speedrun attestations!

import { Player, LevelConfig } from './types';
import { TILE_SIZE } from './sprites';
import { isSolidTile } from './physics';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const AI_AGENT_KEY = 'solario_aria_agent_key_v2';

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
    right: true,
    jump: false,
    sprint: true,
    fire: false,
  };

  const currentTileX = Math.floor(player.x / TILE_SIZE);
  const currentTileY = Math.floor((player.y + player.h) / TILE_SIZE);

  let action = 'SPRINT_FORWARD';
  let reason = 'Path clear; accelerating along subnet';
  let confidence = 0.95;
  let nextObstacle = 'None';

  if (player.powerUp === 'plasma' && globalFrame % 25 === 0) {
    keys.fire = true;
  }

  // 1. Detect Pits / Chasms (2 to 5 tiles ahead)
  let pitDetected = false;
  let pitDist = 0;

  for (let dx = 1; dx <= 5; dx++) {
    const checkX = currentTileX + dx;
    if (checkX >= level.widthTiles) break;

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
    nextObstacle = `Plasma Abyss (${pitDist} tiles ahead)`;
    if (pitDist <= 2 && player.grounded) {
      keys.jump = true;
      keys.sprint = true;
      action = 'LEAP_ABYSS';
      reason = `Chasm detected at +${pitDist} tiles. Engaging mag-thrusters for max leap.`;
      confidence = 0.98;
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: pitDist, nextObstacle } };
    }
  }

  // 2. Check for Approaching Enemies
  for (const enemy of level.enemies) {
    if (enemy.state === 'terminated' || enemy.state === 'crushed') continue;
    const distToEnemy = enemy.x - player.x;

    if (distToEnemy > 0 && distToEnemy < 130) {
      nextObstacle = `${enemy.type.toUpperCase()} (${Math.round(distToEnemy)}px)`;

      if (enemy.type === 'macro_titan') {
        if (player.grounded) {
          keys.jump = true;
          keys.sprint = true;
          action = 'TITAN_LEAP_TO_FUSE';
          reason = 'Macro-Titan detected on bridge! Vaulting toward Core Fuse to overload containment.';
          confidence = 0.99;
          return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: Math.round(distToEnemy / TILE_SIZE), nextObstacle } };
        }
      } else if (distToEnemy < 90 && player.grounded) {
        keys.jump = true;
        keys.sprint = false;
        action = 'STOMP_ATTACK';
        reason = `Approaching ${enemy.type}. Stomp trajectory calculated.`;
        confidence = 0.94;
        return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: Math.round(distToEnemy / TILE_SIZE), nextObstacle } };
      }
    }
  }

  // 3. Obstacle in front
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
      action = 'VAULT_OBSTACLE';
      reason = `Solid barrier [${tileFront.type}] in front. Clearing obstacle.`;
      confidence = 0.96;
      nextObstacle = `Transit Pipe / Barrier`;
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: 1, nextObstacle } };
    }
  }

  // 4. Hit Cache Blocks
  const tileAboveY = currentTileY - 3;
  if (tileAboveY >= 0 && currentTileX < level.widthTiles) {
    const tileAbove = level.mapGrid[tileAboveY][currentTileX];
    if (tileAbove.type === 'matrix_cache' && player.grounded && Math.random() < 0.65) {
      keys.jump = true;
      action = 'HARVEST_CACHE';
      reason = 'Data matrix cache detected overhead. Harvesting Solana energy shards.';
      confidence = 0.93;
      nextObstacle = 'Data Cache';
      return { keys, telemetry: { action, reason, confidence, lookaheadDistTiles: 0, nextObstacle } };
    }
  }

  // 5. Validator Terminal Uplink Pylon
  if (level.hasUplinkPylon && level.uplinkTileX) {
    const distToPole = (level.uplinkTileX * TILE_SIZE) - player.x;
    if (distToPole > 0 && distToPole < 100 && player.grounded) {
      keys.jump = true;
      action = 'UPLINK_TRANSMIT';
      reason = 'Validator Uplink Pylon reached! Broadcasting block to Solana Devnet.';
      confidence = 1.0;
      nextObstacle = 'Validator Pylon';
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

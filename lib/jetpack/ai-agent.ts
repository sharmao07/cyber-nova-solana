// Autonomous A.R.I.A. Copilot for CYBER NOVA: Sol-Jet Velocity
// Real-time lookahead predictive pathfinding & on-chain ed25519 identity

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { JetpackPlayer, Obstacle, ShardCollectible } from './types';
import { CEILING_Y, FLOOR_Y } from './sprites';

export interface AiTelemetry {
  action: string;
  confidence: number;
  reason: string;
  targetY?: number;
}

export interface AiJetpackDecision {
  isThrusting: boolean;
  telemetry: AiTelemetry;
}

const AI_AGENT_STORAGE_KEY = 'cyber_nova_ai_agent_keypair';

export function getOrCreateAiAgentKeypair(): Keypair {
  if (typeof window === 'undefined') {
    return Keypair.generate();
  }
  const stored = localStorage.getItem(AI_AGENT_STORAGE_KEY);
  if (stored) {
    try {
      const secret = bs58.decode(stored);
      return Keypair.fromSecretKey(secret);
    } catch {
      // regenerate if corrupted
    }
  }
  const kp = Keypair.generate();
  localStorage.setItem(AI_AGENT_STORAGE_KEY, bs58.encode(kp.secretKey));
  return kp;
}

/**
 * Real-time AI Lookahead Navigation
 */
export function computeAiJetpackAction(
  player: JetpackPlayer,
  obstacles: Obstacle[],
  shards: ShardCollectible[],
  globalFrame: number
): AiJetpackDecision {
  // 1. Scan immediate threat corridor ahead (150px to 320px)
  const nearbyObstacles = obstacles.filter(o => o.active && o.x >= player.x - 20 && o.x <= player.x + 320);

  // 2. Check for incoming homing missile
  const incomingMissile = nearbyObstacles.find(o => o.type === 'seeker_missile');
  if (incomingMissile) {
    const missileY = incomingMissile.launched ? incomingMissile.y : (incomingMissile.trackingY || player.y);
    // If missile is at our height, evade in the direction with more room
    if (Math.abs(player.y - missileY) < 70) {
      const spaceAbove = player.y - CEILING_Y;
      const spaceBelow = FLOOR_Y - player.y;
      const thrust = spaceAbove > spaceBelow;
      return {
        isThrusting: thrust,
        telemetry: {
          action: thrust ? 'THRUST (EVADE MISSILE)' : 'DIVE (EVADE MISSILE)',
          confidence: 0.94,
          reason: `Evading seeker missile at y=${Math.round(missileY)}`,
          targetY: thrust ? CEILING_Y + 50 : FLOOR_Y - 50,
        },
      };
    }
  }

  // 3. Check for Zapper Collision Ahead
  const nearestZapper = nearbyObstacles.find(o => o.type !== 'seeker_missile');
  if (nearestZapper) {
    const zapperTop = nearestZapper.y;
    const zapperBottom = nearestZapper.y + nearestZapper.h;

    // Check safe gap above zapper vs below zapper
    const gapAbove = zapperTop - CEILING_Y;
    const gapBelow = FLOOR_Y - zapperBottom;

    let targetY: number;
    let reason: string;

    if (gapAbove > 90 && (gapAbove >= gapBelow || player.y < zapperTop)) {
      // Fly above zapper
      targetY = CEILING_Y + gapAbove / 2;
      reason = `Ascending through top clearance (gap=${Math.round(gapAbove)}px)`;
    } else {
      // Fly below zapper
      targetY = zapperBottom + gapBelow / 2;
      reason = `Descending through bottom clearance (gap=${Math.round(gapBelow)}px)`;
    }

    const needThrust = player.y > targetY + 12 || player.vy > 3.0;
    return {
      isThrusting: needThrust,
      telemetry: {
        action: needThrust ? 'THRUST (CLEAR HAZARD)' : 'COAST (CLEAR HAZARD)',
        confidence: 0.91,
        reason,
        targetY,
      },
    };
  }

  // 4. Shard Seeking (if no immediate obstacle)
  const nearbyShard = shards.find(s => !s.collected && s.x >= player.x && s.x <= player.x + 220);
  if (nearbyShard) {
    const needThrust = player.y > nearbyShard.y + 4;
    return {
      isThrusting: needThrust,
      telemetry: {
        action: needThrust ? 'THRUST (COLLECT SHARD)' : 'DROP (COLLECT SHARD)',
        confidence: 0.86,
        reason: `Targeting Solana shard arc at y=${Math.round(nearbyShard.y)}`,
        targetY: nearbyShard.y,
      },
    };
  }

  // 5. Default Cruising (maintain comfortable mid-altitude)
  const midAltitude = (FLOOR_Y + CEILING_Y) / 2;
  const cruiseThrust = player.y > midAltitude + 20 || (player.y > midAltitude && player.vy > 2.0);

  return {
    isThrusting: cruiseThrust,
    telemetry: {
      action: cruiseThrust ? 'THRUST (CRUISE)' : 'GLIDE (CRUISE)',
      confidence: 0.82,
      reason: 'Optimal flight lane clearance',
      targetY: midAltitude,
    },
  };
}

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { CombatStats, MoveType } from '../solana/types';
import { getAccountBalance } from '../solana/connection';
import { requestDevnetAirdrop } from '../solana/burner-wallet';

const AI_AGENT_KEY = 'solarena_ai_sentinel_keypair_v1';

export interface AutonomousAgent {
  keypair: Keypair;
  address: string;
  name: string;
  modelTitle: string;
  balanceSol: number;
}

export function getOrCreateAiAgent(): AutonomousAgent {
  let kp: Keypair;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(AI_AGENT_KEY);
    if (saved) {
      try {
        kp = Keypair.fromSecretKey(bs58.decode(saved));
      } catch {
        kp = Keypair.generate();
        localStorage.setItem(AI_AGENT_KEY, bs58.encode(kp.secretKey));
      }
    } else {
      kp = Keypair.generate();
      localStorage.setItem(AI_AGENT_KEY, bs58.encode(kp.secretKey));
    }
  } else {
    kp = Keypair.generate();
  }

  return {
    keypair: kp,
    address: kp.publicKey.toBase58(),
    name: 'SENTINEL-X9',
    modelTitle: 'Autonomous Neural Arbiter (Gemini-Engine)',
    balanceSol: 0,
  };
}

/**
 * Ensures the autonomous agent has enough Devnet SOL to pay transaction fees.
 */
export async function ensureAgentFunded(agent: AutonomousAgent): Promise<number> {
  try {
    const bal = await getAccountBalance(agent.address);
    if (bal < 0.05) {
      // Auto-fund agent wallet so it can autonomously sign moves
      await requestDevnetAirdrop(agent.address, 0.2);
      const updated = await getAccountBalance(agent.address);
      return updated;
    }
    return bal;
  } catch (err) {
    console.warn('Agent funding check failed:', err);
    return 0.1;
  }
}

export interface TacticalDecision {
  move: MoveType;
  expectedDamage: number;
  reasoning: string;
  dialogue: string;
}

/**
 * Tactical AI decision matrix that evaluates battlefield telemetry.
 */
export function calculateAgentTactics(
  agentStats: CombatStats,
  playerStats: CombatStats,
  round: number,
  lastPlayerMove?: MoveType
): TacticalDecision {
  // Low agent health emergency response
  if (agentStats.hp <= 35 && agentStats.energy >= 25 && Math.random() > 0.3) {
    return {
      move: 'HEAL_POTION',
      expectedDamage: 0,
      reasoning: 'Critical structural integrity breached. Diverting auxiliary power to nanite repair matrix.',
      dialogue: 'Tactical alert: HP below 35%. Initiating autonomous nanite reconstitution protocol.',
    };
  }

  // Player likely to strike hard or agent has low shield
  if (playerStats.energy >= 40 && agentStats.shield === 0 && Math.random() > 0.4) {
    return {
      move: 'SHIELD_BLOCK',
      expectedDamage: 0,
      reasoning: 'Player has surplus kinetic energy. High probability of heavy barrage. Deploying Kinetic Aegis.',
      dialogue: 'Threat telemetry: High-yield offensive impending. Erecting harmonic forcefield.',
    };
  }

  // High energy burst attack
  if (agentStats.energy >= 45 && Math.random() > 0.35) {
    return {
      move: 'LIGHTNING_BOLT',
      expectedDamage: 38,
      reasoning: 'Electromagnetic capacitance peak achieved. Discharging ionic arc at target chassis.',
      dialogue: 'Target capacitor identified. Discharging 250,000V ionic bolt on-chain.',
    };
  }

  // Heavy physical strike
  if (agentStats.energy >= 30 && playerStats.shield === 0 && Math.random() > 0.4) {
    return {
      move: 'HEAVY_STRIKE',
      expectedDamage: 30,
      reasoning: 'Player barrier down. Executing pneumatic sledgehammer impact.',
      dialogue: 'Barrier nullified. Unleashing hydraulic sunder strike.',
    };
  }

  // Default tactical attack
  return {
    move: 'ATTACK',
    expectedDamage: 18,
    reasoning: 'Standard rapid plasma salvo to conserve power cycles while maintaining continuous pressure.',
    dialogue: 'Engaging baseline pulse laser barrage. Calibrating targeting reticle.',
  };
}

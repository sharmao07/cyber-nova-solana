export type MoveType = 
  | 'ATTACK' 
  | 'HEAVY_STRIKE' 
  | 'SHIELD_BLOCK' 
  | 'LIGHTNING_BOLT' 
  | 'HEAL_POTION';

export interface CombatStats {
  hp: number;
  maxHp: number;
  shield: number;
  energy: number;
  maxEnergy: number;
  attackPower: number;
  defense: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'WEAPON' | 'ARMOR' | 'POTION' | 'RELIC';
  rarity: 'COMMON' | 'RARE' | 'MYTHIC';
  description: string;
  statBoost: {
    attack?: number;
    defense?: number;
    energy?: number;
    hp?: number;
  };
  supply: number;
  basePrice: number; // in SOL
  currentPrice: number; // calculated via bonding curve
}

export interface GladiatorState {
  address: string;
  name: string;
  avatar: string;
  stats: CombatStats;
  inventory: InventoryItem[];
  isAi: boolean;
}

export interface CombatLogEntry {
  id: string;
  round: number;
  actor: 'PLAYER' | 'AI_AGENT';
  actorName: string;
  move: MoveType;
  damage: number;
  absorbed: number;
  isCrit: boolean;
  message: string;
  aiMonologue?: string;
  signature?: string;
  solscanUrl?: string;
  timestamp: number;
}

export interface SolanaTransactionRecord {
  signature: string;
  type: 'AIRDROP' | 'MATCH_ESCROW' | 'PLAYER_TURN' | 'AI_AGENT_TURN' | 'MATCH_PAYOUT' | 'AMM_BUY' | 'AMM_SELL' | 'STAKE_DEPOSIT' | 'STAKE_CLAIM';
  title: string;
  description: string;
  amountSol?: number;
  slot?: number;
  feeSol?: number;
  solscanUrl: string;
  timestamp: number;
  status: 'CONFIRMED' | 'FINALIZED' | 'PENDING';
  pdaExplained?: {
    account: string;
    concept: string;
    explanation: string;
  };
}

export interface StakingVaultState {
  totalVaultStaked: number; // in SOL
  userStaked: number; // in SOL
  apyPercent: number; // e.g. 14.8
  accruedYield: number; // in SOL
  lastStakeTimestamp: number;
  totalRewardsDistributed: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'POWERUP' | 'SKIN' | 'RELIC';
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  description: string;
  priceSol: number;
  priceCoins: number;
  imageUrl?: string;
  isEquipped?: boolean;
}

export interface SolanaTransactionRecord {
  signature: string;
  type: 
    | 'AIRDROP' 
    | 'SPEEDRUN_ATTESTATION' 
    | 'AI_AGENT_ATTESTATION'
    | 'AMM_SWAP_BUY' 
    | 'AMM_SWAP_SELL' 
    | 'WAGER_ESCROW_LOCK' 
    | 'WAGER_ESCROW_PAYOUT' 
    | 'STAKE_DEPOSIT' 
    | 'STAKE_CLAIM' 
    | 'ITEM_MINT';
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
  apyPercent: number; // e.g. 18.5
  accruedYield: number; // in SOL
  lastStakeTimestamp: number;
  totalRewardsDistributed: number;
}

export interface AmmPoolState {
  solReserve: number;    // e.g. 15.0 SOL
  coinReserve: number;   // e.g. 150,000 $COIN
  totalVolumeSol: number;
  lpFeePercent: number;  // 0.3%
}

export interface SpeedrunLeaderboardEntry {
  id: string;
  playerAddress: string;
  world: string;
  timeSeconds: number;
  coins: number;
  score: number;
  isAiAgent: boolean;
  signature: string;
  solscanUrl: string;
  timestamp: number;
}

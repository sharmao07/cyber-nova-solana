// Core Types for CYBER NOVA: Sol-Jet Velocity
// Original Futuristic Endless Jetpack Runner IP for Solana

export type VehicleType = 'none' | 'gravity_drifter' | 'mech_breaker' | 'warp_cycle';

export type SkinType = 'classic' | 'fire' | 'gold' | 'shadow';

export type DifficultyMode = 'EASY' | 'MEDIUM' | 'HARD';

export interface JetpackPlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  isThrusting: boolean;
  grounded: boolean;
  onCeiling: boolean;
  vehicle: VehicleType;
  gravityInverted: boolean; // For Gravity Drifter
  shields: number;
  distance: number;         // Meters traveled
  bestDistance: number;
  shards: number;
  score: number;
  isDying: boolean;
  deathTimer: number;
  invincibleTimer: number;
  walkFrame: number;
  skin: SkinType;
  combo: number;
  comboTimer: number;
  warpBoostTimer: number;
}

export type ObstacleType = 
  | 'zapper_horizontal'
  | 'zapper_vertical'
  | 'zapper_diagonal'
  | 'zapper_rotating'
  | 'seeker_missile'
  | 'laser_gate';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
  rotSpeed?: number;
  active: boolean;
  nearMissChecked?: boolean;
  // Missile specific fields
  warningTimer?: number;    // Countdown while tracking player
  trackingY?: number;       // Tracks player Y during warning
  launched?: boolean;
  speed?: number;
}

export interface ShardCollectible {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface VehicleTokenEntity {
  id: string;
  type: VehicleType;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
}

export interface SpeedGateEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
}

export interface LabScientistNPC {
  id: string;
  x: number;
  y: number;
  vx: number;
  panicked: boolean;
  walkFrame: number;
}

export interface JetpackParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface ScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  color?: string;
}

export interface StakingPerks {
  shardBonusPercent: number; // e.g. 15%
  superJump: boolean;        // Head start or reinforced kinetic shield
  shardMagnet: boolean;      // Vacuums shards in 180px radius
}

export interface SpeedrunLeaderboardEntry {
  id: string;
  playerAddress: string;
  world: string;             // Distance record, e.g. "2,450m"
  timeSeconds: number;
  shards: number;
  score: number;
  enemiesDefeated: number;
  isAiAgent: boolean;
  signature: string;
  solscanUrl: string;
  timestamp: number;
  runHash: string;
}

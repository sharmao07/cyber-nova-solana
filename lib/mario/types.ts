// Core Types for CYBER NOVA: Sol-Runner Odyssey
// Original Futuristic Cyber-Platformer IP for Solana

export type PowerUpState = 'standard' | 'overcharge' | 'plasma' | 'hyper';

export type EnemyType = 'fud_bot' | 'shield_orb' | 'plasma_sentry' | 'macro_titan';
export type EnemyState = 'patrol' | 'crushed' | 'sphere_idle' | 'sphere_rolling' | 'terminated';

export type TileType = 
  | 'empty'
  | 'circuit_floor'
  | 'carbon_brick'
  | 'matrix_cache'     // [ ? ] block
  | 'spent_alloy'      // Empty metal block after hit
  | 'transit_pipe_tl'
  | 'transit_pipe_tr'
  | 'transit_pipe_bl'
  | 'transit_pipe_br'
  | 'cloud_platform'
  | 'tech_panel'
  | 'launch_pad'       // Springboard trampoline
  | 'plasma_abyss'     // Lava pit
  | 'core_fuse'        // The Golden Solana Overload Switch to drop the boss
  | 'flux_bridge'      // Bridge under Macro-Titan
  | 'citadel_plating'
  | 'portal_door'
  | 'uplink_pylon_top'
  | 'uplink_pylon_beam'
  | 'uplink_pylon_base';

export type CacheHiddenItem = 'shard' | 'overcharge' | 'plasma_core' | 'hyper_matrix' | 'reboot_life' | 'none';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  powerUp: PowerUpState;
  grounded: boolean;
  facingLeft: boolean;
  invincibleTimer: number;
  hyperTimer: number; // duration of hyper invincibility
  isDying: boolean;
  deathTimer: number;
  uplinkSliding: boolean;
  uplinkY: number;
  walkFrame: number;
  walkCounter: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  state: EnemyState;
  stateTimer: number;
  facingLeft: boolean;
  health?: number; // for Macro-Titan boss
  attackTimer?: number;
}

export interface TileBlock {
  type: TileType;
  hiddenItem: CacheHiddenItem;
  shardsLeft: number;
  bumpOffsetY: number;
  bumpVy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface PowerUpItemEntity {
  id: string;
  type: 'overcharge' | 'plasma_core' | 'hyper_matrix' | 'reboot_life';
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  grounded: boolean;
  sprouting: boolean;
  sproutProgress: number; // 0 to 1
  originY: number;
}

export interface PoppingShardEntity {
  id: string;
  x: number;
  y: number;
  vy: number;
  life: number;
}

export interface PlasmaBoltEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  bounces: number;
  active: boolean;
}

export interface TitanPlasmaWave {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export interface ScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
}

export interface LevelConfig {
  id: string;
  worldNumber: string; // "1-1", "1-2", "1-3", "1-4", "AI-MATRIX"
  name: string;
  theme: 'cyber_city' | 'mempool_cavern' | 'sky_uplink' | 'titan_citadel';
  widthTiles: number;
  heightTiles: number;
  playerStartX: number;
  playerStartY: number;
  timeLimit: number;
  bgColor: string;
  mapGrid: TileBlock[][]; // [y][x]
  enemies: Enemy[];
  hasCoreFuse?: boolean;
  hasUplinkPylon?: boolean;
  uplinkTileX?: number;
  fuseTileX?: number;
  bridgeStartX?: number;
  bridgeEndX?: number;
  musicTheme: 'overworld' | 'underground' | 'sky' | 'castle';
}

export interface SpeedrunLeaderboardEntry {
  id: string;
  playerAddress: string;
  world: string;
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

export interface StakingPerks {
  shardBonusPercent: number; // e.g. 15%
  superJump: boolean;        // +20% jump height
  shardMagnet: boolean;      // pulls shards in 4-tile radius
}

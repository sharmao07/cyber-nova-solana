export type PowerUpState = 'small' | 'super' | 'fire' | 'star';

export type EnemyType = 'goomba' | 'koopa' | 'piranha' | 'bowser';
export type EnemyState = 'walk' | 'squished' | 'shell_idle' | 'shell_moving' | 'dead';

export type TileType = 
  | 'empty'
  | 'ground'
  | 'brick'
  | 'question'
  | 'metal'
  | 'pipe_tl'
  | 'pipe_tr'
  | 'pipe_bl'
  | 'pipe_br'
  | 'cloud'
  | 'bush'
  | 'hill'
  | 'springboard'
  | 'lava'
  | 'axe'
  | 'bridge'
  | 'castle_brick'
  | 'castle_door'
  | 'flagpole_top'
  | 'flagpole_pole'
  | 'flagpole_base';

export type HiddenItem = 'coin' | 'mushroom' | 'flower' | 'star' | '1up' | 'none';

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
  invincibleTimer: number; // in frames or ms
  starTimer: number; // duration of starman
  isDying: boolean;
  deathTimer: number;
  flagpoleSliding: boolean;
  flagpoleY: number;
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
  health?: number; // for Bowser (e.g. 5 hits)
  fireTimer?: number;
}

export interface TileBlock {
  type: TileType;
  hiddenItem: HiddenItem;
  coinsLeft: number;
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
  type: 'mushroom' | 'flower' | 'star' | '1up';
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  grounded: boolean;
  sprouting: boolean;
  sproutY: number;
}

export interface FireballEntity {
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

export interface BowserFireball {
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
  worldNumber: string; // "1-1", "1-2", "1-3", "1-4", "AI-GEN"
  name: string;
  theme: 'overworld' | 'underground' | 'sky' | 'castle';
  widthTiles: number;
  heightTiles: number;
  playerStartX: number;
  playerStartY: number;
  timeLimit: number;
  bgColor: string;
  mapGrid: TileBlock[][]; // [y][x]
  enemies: Enemy[];
  hasAxe?: boolean;
  hasFlagpole?: boolean;
  flagpoleTileX?: number;
  axeTileX?: number;
  bridgeStartX?: number;
  bridgeEndX?: number;
  musicTheme: 'overworld' | 'underground' | 'sky' | 'castle';
}

export interface SpeedrunLeaderboardEntry {
  id: string;
  playerAddress: string;
  world: string;
  timeSeconds: number;
  coins: number;
  score: number;
  enemiesDefeated: number;
  isAiAgent: boolean;
  signature: string;
  solscanUrl: string;
  timestamp: number;
  runHash: string;
}

export interface StakingPerks {
  coinBonusPercent: number; // e.g. 15%
  superJump: boolean;       // +20% jump height
  coinMagnet: boolean;      // pulls coins in 4-tile radius
}

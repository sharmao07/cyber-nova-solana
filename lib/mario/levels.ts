// Super Solario Level Definitions
// 4 Full Worlds + AI Generative Level Framework

import { LevelConfig, TileBlock, TileType, HiddenItem, Enemy } from './types';
import { TILE_SIZE } from './sprites';

function emptyBlock(): TileBlock {
  return {
    type: 'empty',
    hiddenItem: 'none',
    coinsLeft: 0,
    bumpOffsetY: 0,
    bumpVy: 0,
  };
}

function makeTile(type: TileType, hiddenItem: HiddenItem = 'none', coinsLeft: number = 0): TileBlock {
  return {
    type,
    hiddenItem,
    coinsLeft,
    bumpOffsetY: 0,
    bumpVy: 0,
  };
}

/**
 * World 1-1: Genesis Block (Classic Overworld)
 */
export function createWorld1_1(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Ground layer (bottom 2 rows: y=13, y=14)
  for (let x = 0; x < width; x++) {
    // Leave two small pits at x=36-37 and x=68-69
    if ((x >= 36 && x <= 37) || (x >= 68 && x <= 69)) {
      continue;
    }
    grid[13][x] = makeTile('ground');
    grid[14][x] = makeTile('ground');
  }

  // Question blocks and Bricks cluster 1
  // ? block at (x=16, y=9) -> Coin
  grid[9][16] = makeTile('question', 'coin', 1);
  // Bricks and ? blocks at (x=20..24, y=9)
  grid[9][20] = makeTile('brick');
  grid[9][21] = makeTile('question', 'mushroom', 1); // Super Mushroom!
  grid[9][22] = makeTile('brick');
  grid[9][23] = makeTile('question', 'coin', 1);
  grid[9][24] = makeTile('brick');

  // Pipe 1 (height 2) at x=28
  grid[12][28] = makeTile('pipe_tl');
  grid[12][29] = makeTile('pipe_tr');
  grid[11][28] = makeTile('pipe_tl');
  grid[11][29] = makeTile('pipe_tr');

  // Pipe 2 (height 3) at x=38
  grid[12][38] = makeTile('pipe_tl');
  grid[12][39] = makeTile('pipe_tr');
  grid[11][38] = makeTile('pipe_tl');
  grid[11][39] = makeTile('pipe_tr');
  grid[10][38] = makeTile('pipe_tl');
  grid[10][39] = makeTile('pipe_tr');

  // High block cluster at (x=45..50, y=6)
  grid[6][45] = makeTile('brick');
  grid[6][46] = makeTile('question', 'flower', 1); // Fire Flower!
  grid[6][47] = makeTile('brick');
  grid[6][48] = makeTile('question', 'star', 1);   // Starman!
  grid[6][49] = makeTile('brick');

  // Lower brick cache at (x=52..56, y=9)
  for (let x = 52; x <= 56; x++) {
    grid[9][x] = makeTile(x === 54 ? 'question' : 'brick', x === 54 ? 'coin' : 'none', x === 54 ? 1 : 0);
  }

  // Springboard at x=60
  grid[12][60] = makeTile('springboard');

  // High platform staircase leading to flagpole (x=76..84)
  for (let i = 0; i < 6; i++) {
    for (let y = 12 - i; y <= 12; y++) {
      grid[y][76 + i] = makeTile('brick');
    }
  }

  // Flagpole at x=90 (from y=3 to y=12)
  grid[3][90] = makeTile('flagpole_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][90] = makeTile('flagpole_pole');
  }
  grid[12][90] = makeTile('flagpole_base');

  // Castle at x=96..102
  for (let cx = 96; cx <= 102; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('castle_brick');
    }
  }
  grid[12][99] = makeTile('castle_door');
  grid[11][99] = makeTile('castle_door');

  // Enemies
  const enemies: Enemy[] = [
    {
      id: 'e1',
      type: 'goomba',
      x: 22 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e2',
      type: 'goomba',
      x: 34 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e3',
      type: 'koopa',
      x: 50 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e4',
      type: 'goomba',
      x: 64 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e5',
      type: 'koopa',
      x: 72 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-1',
    worldNumber: '1-1',
    name: 'Genesis Block',
    theme: 'overworld',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#5C94FC', // Classic NES Blue Sky
    mapGrid: grid,
    enemies,
    hasFlagpole: true,
    flagpoleTileX: 90,
    musicTheme: 'overworld',
  };
}

/**
 * World 1-2: Underground Mempool (Subterranean Cavern)
 */
export function createWorld1_2(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Ceiling layer (top row y=0)
  for (let x = 0; x < width; x++) {
    grid[0][x] = makeTile('brick');
    grid[1][x] = makeTile('brick');
  }

  // Floor layer (y=13, y=14) with chasms at x=25-27 and x=55-58
  for (let x = 0; x < width; x++) {
    if ((x >= 25 && x <= 27) || (x >= 55 && x <= 58)) {
      continue;
    }
    grid[13][x] = makeTile('ground');
    grid[14][x] = makeTile('ground');
  }

  // Floating platforms over first chasm
  grid[9][25] = makeTile('brick');
  grid[9][26] = makeTile('brick');
  grid[9][27] = makeTile('brick');

  // Underground Question & Coin ceiling
  for (let x = 12; x <= 18; x++) {
    grid[8][x] = makeTile(x % 2 === 0 ? 'question' : 'brick', 'coin', 1);
  }

  // Super Mushroom in underground block
  grid[8][15] = makeTile('question', 'mushroom', 1);

  // Pipes with Piranha
  grid[12][35] = makeTile('pipe_tl');
  grid[12][36] = makeTile('pipe_tr');
  grid[11][35] = makeTile('pipe_tl');
  grid[11][36] = makeTile('pipe_tr');

  grid[12][46] = makeTile('pipe_tl');
  grid[12][47] = makeTile('pipe_tr');
  grid[11][46] = makeTile('pipe_tl');
  grid[11][47] = makeTile('pipe_tr');
  grid[10][46] = makeTile('pipe_tl');
  grid[10][47] = makeTile('pipe_tr');

  // Multi-tier brick run over second chasm
  for (let x = 54; x <= 60; x++) {
    grid[6][x] = makeTile('brick', x === 57 ? 'flower' : 'none', x === 57 ? 1 : 0);
  }

  // Secret Warp Pipe at end
  grid[12][75] = makeTile('pipe_tl');
  grid[12][76] = makeTile('pipe_tr');
  grid[11][75] = makeTile('pipe_tl');
  grid[11][76] = makeTile('pipe_tr');

  // Flagpole at x=90
  grid[3][90] = makeTile('flagpole_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][90] = makeTile('flagpole_pole');
  }
  grid[12][90] = makeTile('flagpole_base');

  // Castle at x=96..102
  for (let cx = 96; cx <= 102; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('castle_brick');
    }
  }
  grid[12][99] = makeTile('castle_door');
  grid[11][99] = makeTile('castle_door');

  const enemies: Enemy[] = [
    {
      id: 'u1',
      type: 'goomba',
      x: 18 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u2',
      type: 'piranha',
      x: 35 * TILE_SIZE + 2,
      y: 10 * TILE_SIZE,
      vx: 0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u3',
      type: 'koopa',
      x: 42 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u4',
      type: 'piranha',
      x: 46 * TILE_SIZE + 2,
      y: 9 * TILE_SIZE,
      vx: 0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u5',
      type: 'goomba',
      x: 65 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-2',
    worldNumber: '1-2',
    name: 'Underground Mempool',
    theme: 'underground',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#000000', // Underground Pitch Black
    mapGrid: grid,
    enemies,
    hasFlagpole: true,
    flagpoleTileX: 90,
    musicTheme: 'underground',
  };
}

/**
 * World 1-3: DeFi Skyway (High-Altitude Cloud Athletic)
 */
export function createWorld1_3(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Scattered floating mushroom & cloud platforms over open sky
  // Starting pad (x=0..12, y=12..14)
  for (let x = 0; x <= 12; x++) {
    grid[13][x] = makeTile('ground');
    grid[14][x] = makeTile('ground');
  }

  // Floating platform 1 (x=16..22, y=9)
  for (let x = 16; x <= 22; x++) {
    grid[9][x] = makeTile('brick', 'none');
  }
  grid[9][19] = makeTile('question', 'star', 1);

  // High Springboard Trampoline (x=24, y=10)
  grid[10][24] = makeTile('brick');
  grid[9][24] = makeTile('springboard');

  // Cloud Bridge 1 (x=28..36, y=5)
  for (let x = 28; x <= 36; x++) {
    grid[5][x] = makeTile('brick', 'coin', 1);
  }

  // Floating platform 2 (x=40..46, y=8)
  for (let x = 40; x <= 46; x++) {
    grid[8][x] = makeTile('brick');
  }
  grid[8][43] = makeTile('question', 'flower', 1);

  // Second Springboard (x=48, y=8)
  grid[8][48] = makeTile('springboard');

  // High Coin Haven (x=52..62, y=4)
  for (let x = 52; x <= 62; x++) {
    grid[4][x] = makeTile('brick', 'coin', 1);
  }

  // Lower bridge (x=66..76, y=10)
  for (let x = 66; x <= 76; x++) {
    grid[10][x] = makeTile('brick');
  }

  // End landing platform (x=82..108, y=13..14)
  for (let x = 82; x <= 108; x++) {
    grid[13][x] = makeTile('ground');
    grid[14][x] = makeTile('ground');
  }

  // Flagpole at x=92
  grid[3][92] = makeTile('flagpole_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][92] = makeTile('flagpole_pole');
  }
  grid[12][92] = makeTile('flagpole_base');

  // Castle at x=98..104
  for (let cx = 98; cx <= 104; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('castle_brick');
    }
  }
  grid[12][101] = makeTile('castle_door');
  grid[11][101] = makeTile('castle_door');

  const enemies: Enemy[] = [
    {
      id: 's1',
      type: 'koopa',
      x: 18 * TILE_SIZE,
      y: 8 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 's2',
      type: 'koopa',
      x: 42 * TILE_SIZE,
      y: 7 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 's3',
      type: 'goomba',
      x: 70 * TILE_SIZE,
      y: 9 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-3',
    worldNumber: '1-3',
    name: 'DeFi Skyway',
    theme: 'sky',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#9BBCFF', // Athletic Sunset/Sky
    mapGrid: grid,
    enemies,
    hasFlagpole: true,
    flagpoleTileX: 92,
    musicTheme: 'sky',
  };
}

/**
 * World 1-4: The Bear Castle (Boss Level)
 * Features Lava, Rotating Fire obstacles, Bowser boss on Bridge, and Golden Axe trigger!
 */
export function createWorld1_4(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Ceiling and Floor castle masonry
  for (let x = 0; x < width; x++) {
    grid[0][x] = makeTile('castle_brick');
    grid[1][x] = makeTile('castle_brick');
  }

  // Castle floor with lava pits
  for (let x = 0; x < width; x++) {
    // Lava pit at x=18..24 and boss lava pit at x=68..84
    if ((x >= 18 && x <= 24) || (x >= 68 && x <= 84)) {
      grid[13][x] = makeTile('lava');
      grid[14][x] = makeTile('lava');
      continue;
    }
    grid[13][x] = makeTile('castle_brick');
    grid[14][x] = makeTile('castle_brick');
  }

  // Floating platforms over first lava pit
  grid[9][19] = makeTile('brick');
  grid[9][21] = makeTile('brick');
  grid[9][23] = makeTile('brick');

  // Question blocks with Fire Flower for boss fight
  grid[8][32] = makeTile('question', 'mushroom', 1);
  grid[8][36] = makeTile('question', 'flower', 1);
  grid[8][40] = makeTile('question', 'coin', 1);

  // Upper/lower castle corridors (x=44..60)
  for (let x = 44; x <= 60; x++) {
    grid[6][x] = makeTile('brick');
  }

  // Bowser's Boss Bridge over the deep lava pit (x=68..80 at y=11)
  for (let x = 68; x <= 80; x++) {
    grid[11][x] = makeTile('bridge');
  }

  // Golden Solana Axe at x=82
  grid[11][82] = makeTile('castle_brick');
  grid[10][82] = makeTile('axe'); // Touch this axe to drop bridge into lava!

  // Princess Peach / Victory Room at x=86..100
  for (let x = 84; x <= 108; x++) {
    grid[13][x] = makeTile('castle_brick');
    grid[14][x] = makeTile('castle_brick');
  }

  // Bowser Boss Enemy positioned on the bridge
  const enemies: Enemy[] = [
    {
      id: 'bowser_boss',
      type: 'bowser',
      x: 74 * TILE_SIZE,
      y: 9 * TILE_SIZE - 6,
      vx: -0.6,
      vy: 0,
      w: 44,
      h: 46,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
      health: 5, // 5 hits or 1 axe cut!
      fireTimer: 60,
    },
    {
      id: 'c1',
      type: 'goomba',
      x: 14 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'c2',
      type: 'koopa',
      x: 50 * TILE_SIZE,
      y: 5 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-4',
    worldNumber: '1-4',
    name: 'The Bear Castle',
    theme: 'castle',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#000000',
    mapGrid: grid,
    enemies,
    hasAxe: true,
    axeTileX: 82,
    bridgeStartX: 68,
    bridgeEndX: 80,
    musicTheme: 'castle',
  };
}

/**
 * World 5: AI Procedural Level Generator
 * Creates an endless variety of balanced, solvable Mario levels from user prompts or seeds!
 */
export function createAiGeneratedLevel(prompt: string, seed: number = 1337): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  const cleanPrompt = prompt.toLowerCase();
  const isCastle = cleanPrompt.includes('castle') || cleanPrompt.includes('lava') || cleanPrompt.includes('boss');
  const isUnderground = cleanPrompt.includes('underground') || cleanPrompt.includes('cave') || cleanPrompt.includes('mempool');
  const isSky = cleanPrompt.includes('sky') || cleanPrompt.includes('cloud') || cleanPrompt.includes('high');

  const theme = isCastle ? 'castle' : isUnderground ? 'underground' : isSky ? 'sky' : 'overworld';
  const bgColor = isCastle || isUnderground ? '#000000' : isSky ? '#9BBCFF' : '#5C94FC';

  // Procedural floor with pits
  for (let x = 0; x < width; x++) {
    const isPit = (x > 20 && x < 24 && Math.sin(seed + x) > 0.4) || 
                  (x > 50 && x < 54 && Math.cos(seed + x) > 0.4);
    if (!isPit) {
      grid[13][x] = makeTile(isCastle ? 'castle_brick' : 'ground');
      grid[14][x] = makeTile(isCastle ? 'castle_brick' : 'ground');
    } else if (isCastle) {
      grid[13][x] = makeTile('lava');
      grid[14][x] = makeTile('lava');
    }
  }

  // Procedural Question & Brick blocks
  for (let x = 12; x < 80; x += 4) {
    const pseudoRand = Math.abs(Math.sin(seed * 0.1 + x * 0.7));
    if (pseudoRand > 0.35) {
      const yPos = 8 - Math.floor(pseudoRand * 3);
      if (pseudoRand > 0.7) {
        grid[yPos][x] = makeTile('question', pseudoRand > 0.85 ? 'flower' : 'coin', 1);
      } else {
        grid[yPos][x] = makeTile('brick', 'none');
      }
    }
  }

  // Trampolines
  if (isSky || cleanPrompt.includes('jump') || cleanPrompt.includes('trampoline')) {
    grid[12][28] = makeTile('springboard');
    grid[12][58] = makeTile('springboard');
  }

  // End flagpole
  grid[3][92] = makeTile('flagpole_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][92] = makeTile('flagpole_pole');
  }
  grid[12][92] = makeTile('flagpole_base');

  // Castle at end
  for (let cx = 98; cx <= 104; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('castle_brick');
    }
  }
  grid[12][101] = makeTile('castle_door');
  grid[11][101] = makeTile('castle_door');

  // Procedural enemies
  const enemies: Enemy[] = [];
  const enemyCount = cleanPrompt.includes('hard') ? 8 : 4;
  for (let i = 0; i < enemyCount; i++) {
    const ex = (20 + i * 8) * TILE_SIZE;
    const isKoopa = i % 2 === 1;
    enemies.push({
      id: `ai_e_${i}`,
      type: isKoopa ? 'koopa' : 'goomba',
      x: ex,
      y: 12 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: isKoopa ? 30 : 28,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
    });
  }

  if (isCastle || cleanPrompt.includes('boss') || cleanPrompt.includes('bowser')) {
    enemies.push({
      id: 'ai_bowser',
      type: 'bowser',
      x: 76 * TILE_SIZE,
      y: 10 * TILE_SIZE,
      vx: -0.6,
      vy: 0,
      w: 44,
      h: 46,
      state: 'walk',
      stateTimer: 0,
      facingLeft: true,
      health: 5,
      fireTimer: 60,
    });
  }

  return {
    id: `ai-gen-${seed}`,
    worldNumber: 'AI-GEN',
    name: prompt ? `AI: ${prompt.slice(0, 20)}...` : 'AI Procedural Matrix',
    theme,
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor,
    mapGrid: grid,
    enemies,
    hasFlagpole: true,
    flagpoleTileX: 92,
    musicTheme: theme,
  };
}

export const ALL_LEVELS = [
  createWorld1_1,
  createWorld1_2,
  createWorld1_3,
  createWorld1_4,
];

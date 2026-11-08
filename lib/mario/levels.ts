// Level Maps for CYBER NOVA: Sol-Runner Odyssey
// 4 Handcrafted Cyber Worlds + AI Matrix Generative Engine

import { LevelConfig, TileBlock, TileType, CacheHiddenItem, Enemy } from './types';
import { TILE_SIZE } from './sprites';

function emptyBlock(): TileBlock {
  return {
    type: 'empty',
    hiddenItem: 'none',
    shardsLeft: 0,
    bumpOffsetY: 0,
    bumpVy: 0,
  };
}

function makeTile(type: TileType, hiddenItem: CacheHiddenItem = 'none', shardsLeft: number = 0): TileBlock {
  return {
    type,
    hiddenItem,
    shardsLeft,
    bumpOffsetY: 0,
    bumpVy: 0,
  };
}

/**
 * World 1-1: Neon Genesis (Cyber City Outskirts)
 */
export function createWorld1_1(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Ground layer at y=13 and y=14
  for (let x = 0; x < width; x++) {
    // Two chasm pits at x=36..37 and x=68..69
    if ((x >= 36 && x <= 37) || (x >= 68 && x <= 69)) {
      continue;
    }
    grid[13][x] = makeTile('circuit_floor');
    grid[14][x] = makeTile('circuit_floor');
  }

  // Cache Block 1 at reachable height (y=10, 3 tiles above ground)
  grid[10][16] = makeTile('matrix_cache', 'shard', 1);

  // First Tech Platform (x=20..24 at y=10)
  grid[10][20] = makeTile('carbon_brick');
  grid[10][21] = makeTile('matrix_cache', 'overcharge', 1); // Quantum Overdrive!
  grid[10][22] = makeTile('carbon_brick');
  grid[10][23] = makeTile('matrix_cache', 'shard', 1);
  grid[10][24] = makeTile('carbon_brick');

  // Quantum Transit Pipe 1 (height 2) at x=28
  grid[12][28] = makeTile('transit_pipe_tl');
  grid[12][29] = makeTile('transit_pipe_tr');
  grid[11][28] = makeTile('transit_pipe_tl');
  grid[11][29] = makeTile('transit_pipe_tr');

  // Pipe 2 (height 3) at x=38
  grid[12][38] = makeTile('transit_pipe_tl');
  grid[12][39] = makeTile('transit_pipe_tr');
  grid[11][38] = makeTile('transit_pipe_tl');
  grid[11][39] = makeTile('transit_pipe_tr');
  grid[10][38] = makeTile('transit_pipe_tl');
  grid[10][39] = makeTile('transit_pipe_tr');

  // Upper cache cluster at (x=45..49, y=7)
  grid[7][45] = makeTile('carbon_brick');
  grid[7][46] = makeTile('matrix_cache', 'plasma_core', 1); // Plasma Cannon Module!
  grid[7][47] = makeTile('carbon_brick');
  grid[7][48] = makeTile('matrix_cache', 'hyper_matrix', 1); // Prismatic Star!
  grid[7][49] = makeTile('carbon_brick');

  // Lower cache at (x=52..56, y=10)
  for (let x = 52; x <= 56; x++) {
    grid[10][x] = makeTile(x === 54 ? 'matrix_cache' : 'carbon_brick', x === 54 ? 'shard' : 'none', x === 54 ? 1 : 0);
  }

  // Kinetic Launchpad at x=60
  grid[12][60] = makeTile('launch_pad');

  // Staircase of Carbon Bricks leading to Validator Pylon (x=76..81)
  for (let i = 0; i < 6; i++) {
    for (let y = 12 - i; y <= 12; y++) {
      grid[y][76 + i] = makeTile('carbon_brick');
    }
  }

  // Validator Terminal Node Uplink Pylon at x=90 (from y=3 to y=12)
  grid[3][90] = makeTile('uplink_pylon_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][90] = makeTile('uplink_pylon_beam');
  }
  grid[12][90] = makeTile('uplink_pylon_base');

  // Gateway Sanctuary at x=96..102
  for (let cx = 96; cx <= 102; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('citadel_plating');
    }
  }
  grid[12][99] = makeTile('portal_door');
  grid[11][99] = makeTile('portal_door');

  // Enemies
  const enemies: Enemy[] = [
    {
      id: 'e1',
      type: 'fud_bot',
      x: 22 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e2',
      type: 'fud_bot',
      x: 34 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e3',
      type: 'shield_orb',
      x: 50 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e4',
      type: 'fud_bot',
      x: 64 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'e5',
      type: 'shield_orb',
      x: 72 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-1',
    worldNumber: '1-1',
    name: 'Neon Genesis',
    theme: 'cyber_city',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#0B0F19', // Cyberpunk Midnight Navy
    mapGrid: grid,
    enemies,
    hasUplinkPylon: true,
    uplinkTileX: 90,
    musicTheme: 'overworld',
  };
}

/**
 * World 1-2: Underground Mempool (Subterranean Transit)
 */
export function createWorld1_2(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Ceiling plating
  for (let x = 0; x < width; x++) {
    grid[0][x] = makeTile('carbon_brick');
    grid[1][x] = makeTile('carbon_brick');
  }

  // Floor with chasms at x=25..27 and x=55..58
  for (let x = 0; x < width; x++) {
    if ((x >= 25 && x <= 27) || (x >= 55 && x <= 58)) {
      continue;
    }
    grid[13][x] = makeTile('circuit_floor');
    grid[14][x] = makeTile('circuit_floor');
  }

  // Floating platforms over first chasm
  grid[9][25] = makeTile('carbon_brick');
  grid[9][26] = makeTile('carbon_brick');
  grid[9][27] = makeTile('carbon_brick');

  // Underground Cache row at y=9
  for (let x = 12; x <= 18; x++) {
    grid[9][x] = makeTile(x % 2 === 0 ? 'matrix_cache' : 'carbon_brick', 'shard', 1);
  }
  grid[9][15] = makeTile('matrix_cache', 'overcharge', 1);

  // Quantum Transit Pipes with Sentries
  grid[12][35] = makeTile('transit_pipe_tl');
  grid[12][36] = makeTile('transit_pipe_tr');
  grid[11][35] = makeTile('transit_pipe_tl');
  grid[11][36] = makeTile('transit_pipe_tr');

  grid[12][46] = makeTile('transit_pipe_tl');
  grid[12][47] = makeTile('transit_pipe_tr');
  grid[11][46] = makeTile('transit_pipe_tl');
  grid[11][47] = makeTile('transit_pipe_tr');
  grid[10][46] = makeTile('transit_pipe_tl');
  grid[10][47] = makeTile('transit_pipe_tr');

  // Upper bridge over second chasm
  for (let x = 54; x <= 60; x++) {
    grid[7][x] = makeTile('carbon_brick', x === 57 ? 'plasma_core' : 'none', x === 57 ? 1 : 0);
  }

  // Terminal Pylon at x=90
  grid[3][90] = makeTile('uplink_pylon_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][90] = makeTile('uplink_pylon_beam');
  }
  grid[12][90] = makeTile('uplink_pylon_base');

  // Gateway Sanctuary at x=96..102
  for (let cx = 96; cx <= 102; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('citadel_plating');
    }
  }
  grid[12][99] = makeTile('portal_door');
  grid[11][99] = makeTile('portal_door');

  const enemies: Enemy[] = [
    {
      id: 'u1',
      type: 'fud_bot',
      x: 18 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u2',
      type: 'plasma_sentry',
      x: 35 * TILE_SIZE + 2,
      y: 10 * TILE_SIZE,
      vx: 0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u3',
      type: 'shield_orb',
      x: 42 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u4',
      type: 'plasma_sentry',
      x: 46 * TILE_SIZE + 2,
      y: 9 * TILE_SIZE,
      vx: 0,
      vy: 0,
      w: 28,
      h: 30,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'u5',
      type: 'fud_bot',
      x: 65 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-2',
    worldNumber: '1-2',
    name: 'Underground Mempool',
    theme: 'mempool_cavern',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#020617', // Deep Mempool Slate Black
    mapGrid: grid,
    enemies,
    hasUplinkPylon: true,
    uplinkTileX: 90,
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

  // Starting floor
  for (let x = 0; x <= 12; x++) {
    grid[13][x] = makeTile('circuit_floor');
    grid[14][x] = makeTile('circuit_floor');
  }

  // Floating platform 1 (x=16..22, y=10)
  for (let x = 16; x <= 22; x++) {
    grid[10][x] = makeTile('carbon_brick');
  }
  grid[10][19] = makeTile('matrix_cache', 'hyper_matrix', 1);

  // Launchpad at x=24
  grid[10][24] = makeTile('carbon_brick');
  grid[9][24] = makeTile('launch_pad');

  // Upper Cloud Bridge 1 (x=28..36, y=5)
  for (let x = 28; x <= 36; x++) {
    grid[5][x] = makeTile('carbon_brick', 'shard', 1);
  }

  // Floating platform 2 (x=40..46, y=9)
  for (let x = 40; x <= 46; x++) {
    grid[9][x] = makeTile('carbon_brick');
  }
  grid[9][43] = makeTile('matrix_cache', 'plasma_core', 1);

  // Second Launchpad at x=48
  grid[9][48] = makeTile('launch_pad');

  // High Shard Haven (x=52..62, y=4)
  for (let x = 52; x <= 62; x++) {
    grid[4][x] = makeTile('carbon_brick', 'shard', 1);
  }

  // Lower bridge (x=66..76, y=10)
  for (let x = 66; x <= 76; x++) {
    grid[10][x] = makeTile('carbon_brick');
  }

  // Landing floor (x=82..108, y=13..14)
  for (let x = 82; x <= 108; x++) {
    grid[13][x] = makeTile('circuit_floor');
    grid[14][x] = makeTile('circuit_floor');
  }

  // Terminal Uplink Pylon at x=92
  grid[3][92] = makeTile('uplink_pylon_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][92] = makeTile('uplink_pylon_beam');
  }
  grid[12][92] = makeTile('uplink_pylon_base');

  // Gateway Sanctuary at x=98..104
  for (let cx = 98; cx <= 104; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('citadel_plating');
    }
  }
  grid[12][101] = makeTile('portal_door');
  grid[11][101] = makeTile('portal_door');

  const enemies: Enemy[] = [
    {
      id: 's1',
      type: 'shield_orb',
      x: 18 * TILE_SIZE,
      y: 9 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 's2',
      type: 'shield_orb',
      x: 42 * TILE_SIZE,
      y: 8 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 's3',
      type: 'fud_bot',
      x: 70 * TILE_SIZE,
      y: 9 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-3',
    worldNumber: '1-3',
    name: 'DeFi Skyway',
    theme: 'sky_uplink',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#1E1B4B', // High-Altitude Neon Twilight
    mapGrid: grid,
    enemies,
    hasUplinkPylon: true,
    uplinkTileX: 92,
    musicTheme: 'sky',
  };
}

/**
 * World 1-4: The Titan Citadel (Boss Level)
 * Sola faces the Macro-Titan on the magnetic flux bridge over the plasma ocean!
 */
export function createWorld1_4(): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  // Ceiling plating
  for (let x = 0; x < width; x++) {
    grid[0][x] = makeTile('citadel_plating');
    grid[1][x] = makeTile('citadel_plating');
  }

  // Floor with Plasma Oceans
  for (let x = 0; x < width; x++) {
    if ((x >= 18 && x <= 24) || (x >= 68 && x <= 84)) {
      grid[13][x] = makeTile('plasma_abyss');
      grid[14][x] = makeTile('plasma_abyss');
      continue;
    }
    grid[13][x] = makeTile('citadel_plating');
    grid[14][x] = makeTile('citadel_plating');
  }

  // Floating platforms over first plasma ocean
  grid[10][19] = makeTile('carbon_brick');
  grid[10][21] = makeTile('carbon_brick');
  grid[10][23] = makeTile('carbon_brick');

  // Pre-boss cache blocks (y=10)
  grid[10][32] = makeTile('matrix_cache', 'overcharge', 1);
  grid[10][36] = makeTile('matrix_cache', 'plasma_core', 1);
  grid[10][40] = makeTile('matrix_cache', 'shard', 1);

  // Upper corridor
  for (let x = 44; x <= 60; x++) {
    grid[7][x] = makeTile('carbon_brick');
  }

  // Magnetic Flux Bridge under the Macro-Titan (x=68..80 at y=11)
  for (let x = 68; x <= 80; x++) {
    grid[11][x] = makeTile('flux_bridge');
  }

  // Golden Core Overload Fuse at x=82
  grid[11][82] = makeTile('citadel_plating');
  grid[10][82] = makeTile('core_fuse'); // Leap here to drop the boss into the plasma abyss!

  // Final Gateway Sanctuary at x=84..108
  for (let x = 84; x <= 108; x++) {
    grid[13][x] = makeTile('citadel_plating');
    grid[14][x] = makeTile('citadel_plating');
  }

  const enemies: Enemy[] = [
    {
      id: 'macro_titan_boss',
      type: 'macro_titan',
      x: 74 * TILE_SIZE,
      y: 9 * TILE_SIZE - 4,
      vx: -0.6,
      vy: 0,
      w: 44,
      h: 46,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
      health: 5,
      attackTimer: 60,
    },
    {
      id: 'c1',
      type: 'fud_bot',
      x: 14 * TILE_SIZE,
      y: 12 * TILE_SIZE,
      vx: -1.2,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
    {
      id: 'c2',
      type: 'shield_orb',
      x: 50 * TILE_SIZE,
      y: 6 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    },
  ];

  return {
    id: 'w1-4',
    worldNumber: '1-4',
    name: 'Titan Citadel',
    theme: 'titan_citadel',
    widthTiles: width,
    heightTiles: height,
    playerStartX: 3 * TILE_SIZE,
    playerStartY: 11 * TILE_SIZE,
    timeLimit: 300,
    bgColor: '#000000',
    mapGrid: grid,
    enemies,
    hasCoreFuse: true,
    fuseTileX: 82,
    bridgeStartX: 68,
    bridgeEndX: 80,
    musicTheme: 'castle',
  };
}

/**
 * World 5: AI Matrix (Procedural Level Generator)
 */
export function createAiGeneratedLevel(prompt: string, seed: number = 1337): LevelConfig {
  const width = 110;
  const height = 15;
  const grid: TileBlock[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => emptyBlock())
  );

  const cleanPrompt = prompt.toLowerCase();
  const isCastle = cleanPrompt.includes('citadel') || cleanPrompt.includes('titan') || cleanPrompt.includes('lava') || cleanPrompt.includes('boss');
  const isUnderground = cleanPrompt.includes('underground') || cleanPrompt.includes('cave') || cleanPrompt.includes('mempool');
  const isSky = cleanPrompt.includes('sky') || cleanPrompt.includes('cloud') || cleanPrompt.includes('high');

  const theme = isCastle ? 'titan_citadel' : isUnderground ? 'mempool_cavern' : isSky ? 'sky_uplink' : 'cyber_city';
  const bgColor = isCastle ? '#000000' : isUnderground ? '#020617' : isSky ? '#1E1B4B' : '#0B0F19';

  // Procedural floor with pits
  for (let x = 0; x < width; x++) {
    const isPit = (x > 20 && x < 24 && Math.sin(seed + x) > 0.4) || 
                  (x > 50 && x < 54 && Math.cos(seed + x) > 0.4);
    if (!isPit) {
      grid[13][x] = makeTile(isCastle ? 'citadel_plating' : 'circuit_floor');
      grid[14][x] = makeTile(isCastle ? 'citadel_plating' : 'circuit_floor');
    } else if (isCastle) {
      grid[13][x] = makeTile('plasma_abyss');
      grid[14][x] = makeTile('plasma_abyss');
    }
  }

  // Reachable blocks at y=10
  for (let x = 12; x < 80; x += 4) {
    const pseudoRand = Math.abs(Math.sin(seed * 0.1 + x * 0.7));
    if (pseudoRand > 0.35) {
      const yPos = 10;
      if (pseudoRand > 0.65) {
        grid[yPos][x] = makeTile('matrix_cache', pseudoRand > 0.85 ? 'plasma_core' : 'shard', 1);
      } else {
        grid[yPos][x] = makeTile('carbon_brick', 'none');
      }
    }
  }

  // Launchpads
  if (isSky || cleanPrompt.includes('jump') || cleanPrompt.includes('trampoline') || cleanPrompt.includes('launch')) {
    grid[12][28] = makeTile('launch_pad');
    grid[12][58] = makeTile('launch_pad');
  }

  // Terminal Pylon
  grid[3][92] = makeTile('uplink_pylon_top');
  for (let y = 4; y <= 11; y++) {
    grid[y][92] = makeTile('uplink_pylon_beam');
  }
  grid[12][92] = makeTile('uplink_pylon_base');

  // Sanctuary portal
  for (let cx = 98; cx <= 104; cx++) {
    for (let cy = 8; cy <= 12; cy++) {
      grid[cy][cx] = makeTile('citadel_plating');
    }
  }
  grid[12][101] = makeTile('portal_door');
  grid[11][101] = makeTile('portal_door');

  // Enemies
  const enemies: Enemy[] = [];
  const enemyCount = cleanPrompt.includes('hard') ? 8 : 4;
  for (let i = 0; i < enemyCount; i++) {
    const ex = (20 + i * 8) * TILE_SIZE;
    const isOrb = i % 2 === 1;
    enemies.push({
      id: `ai_e_${i}`,
      type: isOrb ? 'shield_orb' : 'fud_bot',
      x: ex,
      y: 12 * TILE_SIZE,
      vx: -1.1,
      vy: 0,
      w: 28,
      h: 28,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
    });
  }

  if (isCastle || cleanPrompt.includes('boss') || cleanPrompt.includes('titan')) {
    enemies.push({
      id: 'ai_macro_titan',
      type: 'macro_titan',
      x: 76 * TILE_SIZE,
      y: 10 * TILE_SIZE,
      vx: -0.6,
      vy: 0,
      w: 44,
      h: 46,
      state: 'patrol',
      stateTimer: 0,
      facingLeft: true,
      health: 5,
      attackTimer: 60,
    });
  }

  return {
    id: `ai-matrix-${seed}`,
    worldNumber: 'AI-MATRIX',
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
    hasUplinkPylon: true,
    uplinkTileX: 92,
    musicTheme: theme === 'titan_citadel' ? 'castle' : theme === 'mempool_cavern' ? 'underground' : theme === 'sky_uplink' ? 'sky' : 'overworld',
  };
}

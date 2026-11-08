// Procedural Retro Pixel Art Sprites for CYBER NOVA: Sol-Runner Odyssey
// Original Futuristic Cyber-Platformer IP for Solana

import { Player, Enemy, TileType, PoppingShardEntity } from './types';

export const TILE_SIZE = 32;

// Original Cyber-Runner Palette
export const COLORS = {
  // Nova Base
  visorCyan: '#00FFFF',
  visorGlow: '#80FFFF',
  jacketDark: '#121324',
  jacketIndigo: '#2D1B69',
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  bootsChrome: '#CCCCCC',
  bootsGlow: '#00FFAA',
  skinWarm: '#FFDFC4',

  // Power Up Variants
  overchargeGold: '#FFD700',
  plasmaWhite: '#FFFFFF',
  plasmaOrange: '#FF5500',

  // Hyper Prismatic Colors
  hyperColors: ['#00FFFF', '#14F195', '#9945FF', '#FF0055', '#FFD700', '#00AAFF'],

  // Enemies
  fudBotBody: '#4B5563',
  fudBotEyeRed: '#EF4444',
  fudBotSparks: '#F59E0B',
  shieldOrbBlue: '#3B82F6',
  shieldOrbCore: '#60A5FA',
  macroTitanArmor: '#1E293B',
  macroTitanRed: '#DC2626',
  macroTitanGold: '#F59E0B',

  // Environment
  circuitFloor: '#0F172A',
  circuitTrim: '#14F195',
  carbonBrick: '#1E1B4B',
  carbonBrickLine: '#4338CA',
  cacheGold: '#F59E0B',
  cacheCyan: '#06B6D4',
  spentAlloy: '#334155',
  pipeNeonGreen: '#10B981',
  pipeNeonDark: '#047857',
  plasmaRed: '#E11D48',
  abyssOrange: '#FB923C',
  pylonCyan: '#22D3EE',
};

/**
 * Draws the cyber-runner protagonist (Nova)
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  viewportX: number,
  globalFrame: number,
  skinType: 'classic' | 'fire' | 'gold' | 'shadow' = 'classic'
) {
  const drawX = Math.round(player.x - viewportX);
  const drawY = Math.round(player.y);

  ctx.save();

  if (player.facingLeft) {
    ctx.translate(drawX + player.w, drawY);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(drawX, drawY);
  }

  // Invincibility flicker
  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
    ctx.restore();
    return;
  }

  const isOvercharged = player.powerUp === 'overcharge' || player.powerUp === 'plasma' || player.powerUp === 'hyper';
  const isHyper = player.hyperTimer > 0;

  // Resolve palette
  let visorColor = COLORS.visorCyan;
  let suitPrimary = COLORS.jacketIndigo;
  let suitSecondary = COLORS.solanaGreen;

  if (skinType === 'gold') {
    suitPrimary = '#B45309';
    suitSecondary = '#FDE047';
    visorColor = '#FEF08A';
  } else if (skinType === 'shadow') {
    suitPrimary = '#09090B';
    suitSecondary = '#10B981';
    visorColor = '#A7F3D0';
  } else if (player.powerUp === 'plasma') {
    suitPrimary = '#1E1B4B';
    suitSecondary = '#FB923C';
    visorColor = '#F97316';
  }

  if (isHyper) {
    const colorIdx = Math.floor(globalFrame / 3) % COLORS.hyperColors.length;
    visorColor = COLORS.hyperColors[colorIdx];
    suitSecondary = COLORS.hyperColors[(colorIdx + 2) % COLORS.hyperColors.length];
  }

  const scale = isOvercharged ? 2 : 1.5;

  if (player.isDying) {
    drawDeadNova(ctx, suitPrimary, suitSecondary, scale);
  } else if (!player.grounded) {
    drawJumpNova(ctx, visorColor, suitPrimary, suitSecondary, scale, globalFrame);
  } else if (Math.abs(player.vx) > 0.4) {
    const runFrame = Math.floor(player.walkFrame) % 4;
    drawRunNova(ctx, visorColor, suitPrimary, suitSecondary, scale, runFrame, globalFrame);
  } else {
    drawIdleNova(ctx, visorColor, suitPrimary, suitSecondary, scale, globalFrame);
  }

  ctx.restore();
}

function drawIdleNova(
  ctx: CanvasRenderingContext2D,
  visor: string,
  primary: string,
  accent: string,
  s: number,
  frame: number
) {
  // Helmet
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(3 * s, 0, 7 * s, 5 * s);

  // Neon Visor Strip
  ctx.fillStyle = visor;
  ctx.fillRect(5 * s, 2 * s, 5 * s, 1.8 * s);

  // Visor Pulse Glimmer
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect((7 + Math.sin(frame * 0.1) * 1.5) * s, 2 * s, 1.2 * s, 1.8 * s);

  // Scarf / Cyber Collar
  ctx.fillStyle = accent;
  ctx.fillRect(2 * s, 5 * s, 8 * s, 1.5 * s);

  // Torso / Suit
  ctx.fillStyle = primary;
  ctx.fillRect(3 * s, 6.5 * s, 6 * s, 4.5 * s);
  ctx.fillStyle = accent;
  ctx.fillRect(4.5 * s, 7 * s, 3 * s, 3 * s); // Solana chest emblem

  // Arms
  ctx.fillStyle = primary;
  ctx.fillRect(1.5 * s, 6.5 * s, 1.5 * s, 4 * s);
  ctx.fillRect(9 * s, 6.5 * s, 1.5 * s, 4 * s);

  // Mag-Boots
  ctx.fillStyle = COLORS.bootsChrome;
  ctx.fillRect(2 * s, 11 * s, 3.5 * s, 3 * s);
  ctx.fillRect(6.5 * s, 11 * s, 3.5 * s, 3 * s);

  // Boot Thruster Glow
  ctx.fillStyle = COLORS.bootsGlow;
  ctx.fillRect(2 * s, 13.5 * s, 3.5 * s, 0.8 * s);
  ctx.fillRect(6.5 * s, 13.5 * s, 3.5 * s, 0.8 * s);
}

function drawRunNova(
  ctx: CanvasRenderingContext2D,
  visor: string,
  primary: string,
  accent: string,
  s: number,
  runFrame: number,
  globalFrame: number
) {
  // Forward lean
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(4 * s, 0.5 * s, 7 * s, 4.5 * s);

  // Visor
  ctx.fillStyle = visor;
  ctx.fillRect(6 * s, 2 * s, 5 * s, 1.8 * s);

  // Trailing Energy Scarf
  ctx.fillStyle = accent;
  ctx.fillRect(1 * s, 4.5 * s, 3.5 * s, 1.5 * s);
  ctx.fillRect(0 * s, 5 * s, 2 * s, 1.2 * s);

  // Torso
  ctx.fillStyle = primary;
  ctx.fillRect(3.5 * s, 5.5 * s, 6 * s, 5 * s);

  // Running Legs
  ctx.fillStyle = COLORS.bootsChrome;
  if (runFrame === 0) {
    ctx.fillRect(1 * s, 10.5 * s, 4 * s, 3.5 * s);
    ctx.fillRect(7.5 * s, 9.5 * s, 4 * s, 3.5 * s);
  } else if (runFrame === 1) {
    ctx.fillRect(3 * s, 10.5 * s, 3.5 * s, 3.5 * s);
    ctx.fillRect(6.5 * s, 10.5 * s, 3.5 * s, 3.5 * s);
  } else if (runFrame === 2) {
    ctx.fillRect(7.5 * s, 10.5 * s, 4 * s, 3.5 * s);
    ctx.fillRect(1 * s, 9.5 * s, 4 * s, 3.5 * s);
  } else {
    ctx.fillRect(4 * s, 10.5 * s, 3.5 * s, 3.5 * s);
    ctx.fillRect(5.5 * s, 10.5 * s, 3.5 * s, 3.5 * s);
  }

  // Thruster trail sparks
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.fillRect(0 * s, 12 * s, 1.5 * s, 1.5 * s);
}

function drawJumpNova(
  ctx: CanvasRenderingContext2D,
  visor: string,
  primary: string,
  accent: string,
  s: number,
  globalFrame: number
) {
  // Helmet
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(3 * s, 0, 7 * s, 4.5 * s);

  // Visor
  ctx.fillStyle = visor;
  ctx.fillRect(5 * s, 1.5 * s, 5 * s, 1.8 * s);

  // Cyber Scarf Flapping Down
  ctx.fillStyle = accent;
  ctx.fillRect(2 * s, 4.5 * s, 7 * s, 1.5 * s);
  ctx.fillRect(1 * s, 6 * s, 2 * s, 2.5 * s);

  // Torso
  ctx.fillStyle = primary;
  ctx.fillRect(3 * s, 6 * s, 6 * s, 4.5 * s);

  // Jet Boots with active ignition flame!
  ctx.fillStyle = COLORS.bootsChrome;
  ctx.fillRect(1.5 * s, 10.5 * s, 3.5 * s, 3 * s);
  ctx.fillRect(7 * s, 11 * s, 3.5 * s, 2.5 * s);

  // Propulsion Flames
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(2 * s, 13.5 * s, 2.5 * s, 3 * s);
  ctx.fillRect(7.5 * s, 13.5 * s, 2.5 * s, 2.5 * s);
}

function drawDeadNova(
  ctx: CanvasRenderingContext2D,
  primary: string,
  accent: string,
  s: number
) {
  // Glitching voxel fragments
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(2 * s, 2 * s, 8 * s, 4 * s);
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(3 * s, 6 * s, 6 * s, 3 * s);
  ctx.fillStyle = accent;
  ctx.fillRect(1 * s, 9 * s, 3 * s, 2 * s);
  ctx.fillRect(6 * s, 10 * s, 4 * s, 2 * s);
}

/**
 * Draws original enemies (FUD-Bot, Shield-Orb, Plasma Sentry, Macro-Titan)
 */
export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  viewportX: number,
  globalFrame: number
) {
  const drawX = Math.round(enemy.x - viewportX);
  const drawY = Math.round(enemy.y);

  ctx.save();

  if (enemy.facingLeft) {
    ctx.translate(drawX + enemy.w, drawY);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(drawX, drawY);
  }

  if (enemy.type === 'fud_bot') {
    drawFudBot(ctx, enemy, globalFrame);
  } else if (enemy.type === 'shield_orb') {
    drawShieldOrb(ctx, enemy, globalFrame);
  } else if (enemy.type === 'plasma_sentry') {
    drawPlasmaSentry(ctx, enemy, globalFrame);
  } else if (enemy.type === 'macro_titan') {
    drawMacroTitan(ctx, enemy, globalFrame);
  }

  ctx.restore();
}

function drawFudBot(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  if (enemy.state === 'crushed') {
    // Crushed mechanical scrap
    ctx.fillStyle = COLORS.fudBotBody;
    ctx.fillRect(2, 22, 24, 6);
    ctx.fillStyle = COLORS.fudBotEyeRed;
    ctx.fillRect(8, 23, 12, 3);
    return;
  }

  // Armored Hex Chassis
  ctx.fillStyle = COLORS.fudBotBody;
  ctx.beginPath();
  ctx.roundRect(4, 4, 20, 16, 4);
  ctx.fill();

  // Red Optical Sensor Visor
  ctx.fillStyle = COLORS.fudBotEyeRed;
  ctx.fillRect(6, 8, 16, 5);

  // Scanning laser dot
  const scanX = 8 + (Math.sin(frame * 0.2) + 1) * 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(scanX, 9, 3, 3);

  // Antenna
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(13, 0, 2, 4);
  ctx.fillStyle = COLORS.fudBotEyeRed;
  ctx.fillRect(12, 0, 4, 2);

  // Robotic Stomp Legs (Alternating 2-frame stride)
  const legStep = Math.floor(frame / 8) % 2 === 0;
  ctx.fillStyle = '#374151';
  if (legStep) {
    ctx.fillRect(3, 20, 6, 8);
    ctx.fillRect(19, 18, 6, 10);
  } else {
    ctx.fillRect(3, 18, 6, 10);
    ctx.fillRect(19, 20, 6, 8);
  }
}

function drawShieldOrb(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  if (enemy.state === 'sphere_idle' || enemy.state === 'sphere_rolling') {
    // Spherical Kinetic Energy Shell
    ctx.fillStyle = COLORS.shieldOrbBlue;
    ctx.beginPath();
    ctx.arc(14, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COLORS.visorCyan;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spinning core
    ctx.fillStyle = '#FFFFFF';
    const angle = (frame * (enemy.state === 'sphere_rolling' ? 0.3 : 0.05));
    ctx.fillRect(14 + Math.cos(angle) * 5 - 2, 16 + Math.sin(angle) * 5 - 2, 4, 4);
    return;
  }

  // Hovering Security Drone
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(4, 6, 20, 16, 6);
  ctx.fill();

  // Cyan Energy Shield Band
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(6, 11, 16, 5);

  // Dual Sensor Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(8, 12, 3, 3);
  ctx.fillRect(17, 12, 3, 3);

  // Hover thrusters
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.fillRect(7, 22, 4, 4);
  ctx.fillRect(17, 22, 4, 4);
}

function drawPlasmaSentry(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  // Laser vent emitting upward pulse
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(8, 12, 16, 18);

  const laserPulse = Math.sin(frame * 0.15) > 0;
  if (laserPulse) {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(12, 0, 8, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(14, 0, 4, 12);
  }
}

function drawMacroTitan(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  // 48x48 Colossal Mech Boss
  ctx.fillStyle = COLORS.macroTitanArmor;
  ctx.beginPath();
  ctx.roundRect(4, 8, 38, 28, 8);
  ctx.fill();

  // Glowing Quad-Visor Array
  ctx.fillStyle = COLORS.macroTitanRed;
  ctx.fillRect(10, 14, 26, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(14, 15, 4, 4);
  ctx.fillRect(28, 15, 4, 4);

  // Heavy Shoulder Cannons
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 4, 8, 12);
  ctx.fillRect(38, 4, 8, 12);

  // Heavy Hydraulic Tread Legs
  ctx.fillStyle = '#334155';
  ctx.fillRect(6, 36, 12, 10);
  ctx.fillRect(28, 36, 12, 10);

  // Core Plasma Reactor Glow
  ctx.fillStyle = COLORS.macroTitanGold;
  ctx.beginPath();
  ctx.arc(23, 28, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws tiles and interactive environment blocks
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  theme: 'cyber_city' | 'mempool_cavern' | 'sky_uplink' | 'titan_citadel',
  globalFrame: number,
  bumpOffsetY: number = 0
) {
  const drawY = Math.round(y + bumpOffsetY);
  if (tile === 'empty') return;

  if (tile === 'circuit_floor' || tile === 'citadel_plating') {
    // Cyberpunk Circuit Floor
    ctx.fillStyle = theme === 'mempool_cavern' ? '#0F172A' : '#1E1B4B';
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);

    // Glowing Neon Circuit Traces
    ctx.fillStyle = theme === 'titan_citadel' ? '#DC2626' : COLORS.solanaGreen;
    ctx.fillRect(x, drawY, TILE_SIZE, 3);
    ctx.fillRect(x + 4, drawY + 8, 2, 8);
    ctx.fillRect(x + 4, drawY + 16, 12, 2);
    ctx.fillRect(x + 20, drawY + 12, 8, 2);
    ctx.fillRect(x + 28, drawY + 12, 2, 10);
  } else if (tile === 'carbon_brick') {
    // Carbon-Nanotube Hex Brick
    ctx.fillStyle = theme === 'mempool_cavern' ? '#1E293B' : '#2E1065';
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);

    ctx.strokeStyle = '#4338CA';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    // Tech panel groove
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(x + 6, drawY + 6, 8, 2);
    ctx.fillRect(x + 18, drawY + 18, 8, 2);
  } else if (tile === 'matrix_cache') {
    // Holographic [ ? ] Cache Block
    ctx.fillStyle = '#065F46'; // dark emerald base
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);

    // Golden / Cyan Animated Border
    ctx.strokeStyle = COLORS.solanaGreen;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    // Corner rivets
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 4, drawY + 4, 3, 3);
    ctx.fillRect(x + TILE_SIZE - 7, drawY + 4, 3, 3);
    ctx.fillRect(x + 4, drawY + TILE_SIZE - 7, 3, 3);
    ctx.fillRect(x + TILE_SIZE - 7, drawY + TILE_SIZE - 7, 3, 3);

    // Pulsing Central Diamond / ? symbol
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', x + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
  } else if (tile === 'spent_alloy') {
    // Deactivated metal block
    ctx.fillStyle = COLORS.spentAlloy;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 4, drawY + 4, 3, 3);
    ctx.fillRect(x + TILE_SIZE - 7, drawY + 4, 3, 3);
    ctx.fillRect(x + 4, drawY + TILE_SIZE - 7, 3, 3);
    ctx.fillRect(x + TILE_SIZE - 7, drawY + TILE_SIZE - 7, 3, 3);
  } else if (tile === 'transit_pipe_tl' || tile === 'transit_pipe_tr' || tile === 'transit_pipe_bl' || tile === 'transit_pipe_br') {
    // Quantum Transit Pipeline
    ctx.fillStyle = COLORS.pipeNeonGreen;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.pipeNeonDark;
    ctx.fillRect(x + 3, drawY + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, drawY, TILE_SIZE, TILE_SIZE);
  } else if (tile === 'launch_pad') {
    // Kinetic Launchpad
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 2, drawY + 22, 28, 10);
    ctx.fillStyle = COLORS.visorCyan;
    ctx.fillRect(x + 6, drawY + 12, 20, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, drawY + 4, 24, 6);
  } else if (tile === 'plasma_abyss') {
    // Bubbling Plasma Ocean
    const wave = Math.sin((globalFrame + x) * 0.1) * 3;
    ctx.fillStyle = COLORS.plasmaRed;
    ctx.fillRect(x, drawY + 4 + wave, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.plasmaOrange;
    ctx.fillRect(x, drawY + wave, TILE_SIZE, 5);
  } else if (tile === 'flux_bridge') {
    // Magnetic Flux Bridge
    ctx.fillStyle = '#312E81';
    ctx.fillRect(x, drawY + 10, TILE_SIZE, 12);
    ctx.fillStyle = COLORS.visorCyan;
    ctx.fillRect(x + 2, drawY + 12, TILE_SIZE - 4, 8);
  } else if (tile === 'core_fuse') {
    // Golden Master Core Switch to drop the boss
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 12, drawY + 14, 8, 16);
    ctx.fillStyle = COLORS.solanaGreen;
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', x + 16, drawY + 10);
  } else if (tile === 'uplink_pylon_top') {
    // Validator Terminal Node Uplink
    ctx.fillStyle = COLORS.visorCyan;
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 14, drawY + 8, 4, 16);
  } else if (tile === 'uplink_pylon_beam') {
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(x + 14, drawY, 4, TILE_SIZE);
    ctx.fillStyle = '#A5F3FC';
    ctx.fillRect(x + 15, drawY, 2, TILE_SIZE);
  } else if (tile === 'uplink_pylon_base') {
    ctx.fillStyle = '#0E7490';
    ctx.fillRect(x + 4, drawY + 14, 24, 18);
    ctx.fillStyle = COLORS.solanaGreen;
    ctx.fillRect(x + 8, drawY + 18, 16, 4);
  } else if (tile === 'portal_door') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
  }
}

/**
 * Draws powerup items (Quantum Overcharge, Plasma Core, Hyper Matrix, Reboot Life)
 */
export function drawPowerUp(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, frame: number) {
  if (type === 'overcharge' || type === 'reboot_life') {
    // Quantum Battery Cell
    const cellColor = type === 'reboot_life' ? COLORS.solanaGreen : COLORS.solanaPurple;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + 6, y + 4, 14, 18);

    ctx.fillStyle = cellColor;
    ctx.fillRect(x + 8, y + 8, 10, 12);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10, y + 2, 6, 2); // terminal cap
  } else if (type === 'plasma_core') {
    // Arm Blaster Module
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'hyper_matrix') {
    // Prismatic Star Core
    const color = COLORS.hyperColors[Math.floor(frame / 4) % COLORS.hyperColors.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10, y + 10, 4, 4);
  }
}

/**
 * Draws floating spinning Solana Data Shards
 */
export function drawShard(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const widthFactor = Math.abs(Math.cos(frame * 0.14));
  const w = Math.max(4, 16 * widthFactor);

  ctx.fillStyle = COLORS.solanaGreen;
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 12, w / 2, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#064E3B';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (w > 8) {
    ctx.fillText('$', x + 12, y + 12);
  }
}

/**
 * Draws popping animated shard when hitting a block
 */
export function drawPoppingShard(ctx: CanvasRenderingContext2D, shard: PoppingShardEntity, viewportX: number) {
  const drawX = Math.round(shard.x - viewportX);
  const drawY = Math.round(shard.y);

  ctx.save();
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.beginPath();
  ctx.arc(drawX + 8, drawY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('$', drawX + 5, drawY + 3);
  ctx.restore();
}

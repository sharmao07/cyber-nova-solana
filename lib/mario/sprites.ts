// Procedural Retro Pixel Art Sprites for CYBER NOVA: Sol-Runner Odyssey
// Original Futuristic Cyber-Platformer IP for Solana

import { Player, Enemy, TileType, PoppingShardEntity } from './types';

export const TILE_SIZE = 32;

// Original Cyber-Runner Palette
export const COLORS = {
  // Nova Base
  visorCyan: '#00FFFF',
  visorGlow: '#80FFFF',
  jacketDark: '#0B0C16',
  jacketIndigo: '#1E1B4B',
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  bootsChrome: '#E2E8F0',
  bootsDark: '#64748B',
  bootsGlow: '#00FFAA',
  skinWarm: '#FFDFC4',

  // Power Up Variants
  overchargeGold: '#FBBF24',
  overchargeCore: '#FEF08A',
  plasmaWhite: '#FFFFFF',
  plasmaOrange: '#F97316',
  plasmaRed: '#EF4444',

  // Hyper Prismatic Colors
  hyperColors: ['#00FFFF', '#14F195', '#9945FF', '#FF0077', '#FFD700', '#38BDF8'],

  // Enemies
  fudBotBody: '#374151',
  fudBotDark: '#1F2937',
  fudBotEyeRed: '#EF4444',
  fudBotEyeGlow: '#FCA5A5',
  fudBotSparks: '#F59E0B',
  shieldOrbBlue: '#2563EB',
  shieldOrbCore: '#60A5FA',
  shieldOrbGlow: '#93C5FD',
  macroTitanArmor: '#0F172A',
  macroTitanSecondary: '#1E293B',
  macroTitanRed: '#DC2626',
  macroTitanGold: '#F59E0B',
  macroTitanGlow: '#FEF08A',

  // Environment
  circuitFloor: '#090D16',
  circuitTrim: '#14F195',
  carbonBrick: '#1E1B4B',
  carbonBrickLine: '#6366F1',
  cacheGold: '#F59E0B',
  cacheCyan: '#06B6D4',
  spentAlloy: '#334155',
  spentAlloyDark: '#1E293B',
  pipeNeonGreen: '#10B981',
  pipeNeonDark: '#047857',
  hazardRed: '#E11D48',
  abyssOrange: '#FB923C',
  pylonCyan: '#22D3EE',
  fluxBridge: '#312E81',
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

  // Draw Overcharge / Hyper energy aura behind Nova
  const isOvercharged = player.powerUp === 'overcharge' || player.powerUp === 'plasma' || player.powerUp === 'hyper';
  const isHyper = player.hyperTimer > 0;

  if (isHyper) {
    const auraPulse = Math.sin(globalFrame * 0.3) * 4;
    const hyperColor = COLORS.hyperColors[Math.floor(globalFrame / 2) % COLORS.hyperColors.length];
    ctx.strokeStyle = hyperColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(drawX + player.w / 2, drawY + player.h / 2, player.w / 2 + 6 + auraPulse, player.h / 2 + 6 + auraPulse, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (isOvercharged) {
    const auraPulse = Math.sin(globalFrame * 0.2) * 2;
    ctx.strokeStyle = player.powerUp === 'plasma' ? 'rgba(249, 115, 22, 0.6)' : 'rgba(20, 241, 149, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(drawX + player.w / 2, drawY + player.h / 2, player.w / 2 + 4 + auraPulse, player.h / 2 + 4 + auraPulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

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

  // Resolve skin palette
  let visorColor = COLORS.visorCyan;
  let suitPrimary = COLORS.jacketIndigo;
  let suitSecondary = COLORS.solanaGreen;
  let suitAccent = COLORS.solanaPurple;

  if (skinType === 'gold') {
    suitPrimary = '#78350F';
    suitSecondary = '#FDE047';
    suitAccent = '#F59E0B';
    visorColor = '#FEF08A';
  } else if (skinType === 'shadow') {
    suitPrimary = '#09090B';
    suitSecondary = '#10B981';
    suitAccent = '#064E3B';
    visorColor = '#A7F3D0';
  } else if (player.powerUp === 'plasma') {
    suitPrimary = '#1E1B4B';
    suitSecondary = '#FB923C';
    suitAccent = '#EF4444';
    visorColor = '#F97316';
  }

  if (isHyper) {
    const colorIdx = Math.floor(globalFrame / 3) % COLORS.hyperColors.length;
    visorColor = COLORS.hyperColors[colorIdx];
    suitSecondary = COLORS.hyperColors[(colorIdx + 2) % COLORS.hyperColors.length];
    suitAccent = COLORS.hyperColors[(colorIdx + 4) % COLORS.hyperColors.length];
  }

  const scale = isOvercharged ? 2 : 1.5;

  if (player.isDying) {
    drawDeadNova(ctx, suitPrimary, suitSecondary, scale, globalFrame);
  } else if (!player.grounded) {
    drawJumpNova(ctx, visorColor, suitPrimary, suitSecondary, suitAccent, scale, globalFrame, player.powerUp === 'plasma');
  } else if (Math.abs(player.vx) > 0.4) {
    const runFrame = Math.floor(player.walkFrame) % 4;
    drawRunNova(ctx, visorColor, suitPrimary, suitSecondary, suitAccent, scale, runFrame, globalFrame, player.powerUp === 'plasma');
  } else {
    drawIdleNova(ctx, visorColor, suitPrimary, suitSecondary, suitAccent, scale, globalFrame, player.powerUp === 'plasma');
  }

  ctx.restore();
}

function drawIdleNova(
  ctx: CanvasRenderingContext2D,
  visor: string,
  primary: string,
  accent: string,
  secondary: string,
  s: number,
  frame: number,
  hasPlasmaBlaster: boolean
) {
  // Cyber-Helmet Base
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(3 * s, 0, 7.5 * s, 5 * s);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(3 * s, 0, 7.5 * s, 1.5 * s); // Crown ridge

  // Neon Curved Visor Strip
  ctx.fillStyle = visor;
  ctx.fillRect(5.5 * s, 1.8 * s, 5.5 * s, 2 * s);

  // Visor Pulse / Glint Reflection
  const glintPos = 6 + (Math.sin(frame * 0.08) + 1) * 1.8;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(glintPos * s, 2 * s, 1.2 * s, 1.6 * s);

  // Holographic Ear Comms Node
  ctx.fillStyle = accent;
  ctx.fillRect(2.2 * s, 2 * s, 1.2 * s, 2.2 * s);

  // Flowing Cyber Scarf / Energy Cowl
  const scarfWave = Math.sin(frame * 0.1) * 0.8;
  ctx.fillStyle = accent;
  ctx.fillRect(2 * s, 5 * s, 8.5 * s, 1.6 * s);
  ctx.fillRect(1 * s, 5.8 * s + scarfWave, 2.5 * s, 2 * s);

  // Cyber Jacket / Torso
  ctx.fillStyle = primary;
  ctx.fillRect(3 * s, 6.6 * s, 6.5 * s, 4.4 * s);

  // Solana Glowing Chest Crest
  ctx.fillStyle = accent;
  ctx.fillRect(4.5 * s, 7.2 * s, 3.5 * s, 0.8 * s);
  ctx.fillStyle = secondary;
  ctx.fillRect(4.5 * s, 8.2 * s, 3.5 * s, 0.8 * s);
  ctx.fillStyle = accent;
  ctx.fillRect(4.5 * s, 9.2 * s, 3.5 * s, 0.8 * s);

  // Arms / Plasma Blaster
  ctx.fillStyle = primary;
  ctx.fillRect(1.5 * s, 6.8 * s, 1.5 * s, 4 * s);

  if (hasPlasmaBlaster) {
    // Plasma Cannon on Right Arm
    ctx.fillStyle = '#F97316';
    ctx.fillRect(9 * s, 6.5 * s, 3 * s, 3 * s);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(11.5 * s, 7 * s, 1 * s, 2 * s); // Muzzle
  } else {
    ctx.fillRect(9.5 * s, 6.8 * s, 1.5 * s, 4 * s);
  }

  // Heavy Mag-Boots
  ctx.fillStyle = COLORS.bootsChrome;
  ctx.fillRect(2 * s, 11 * s, 3.8 * s, 3.2 * s);
  ctx.fillRect(6.8 * s, 11 * s, 3.8 * s, 3.2 * s);

  // Boot Joint Shading
  ctx.fillStyle = COLORS.bootsDark;
  ctx.fillRect(2 * s, 12 * s, 3.8 * s, 0.8 * s);
  ctx.fillRect(6.8 * s, 12 * s, 3.8 * s, 0.8 * s);

  // Active Boot Thruster Glow
  ctx.fillStyle = COLORS.bootsGlow;
  ctx.fillRect(2 * s, 13.6 * s, 3.8 * s, 0.8 * s);
  ctx.fillRect(6.8 * s, 13.6 * s, 3.8 * s, 0.8 * s);
}

function drawRunNova(
  ctx: CanvasRenderingContext2D,
  visor: string,
  primary: string,
  accent: string,
  secondary: string,
  s: number,
  runFrame: number,
  globalFrame: number,
  hasPlasmaBlaster: boolean
) {
  // Forward Aerodynamic Lean
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(4 * s, 0.5 * s, 7.5 * s, 4.8 * s);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(4 * s, 0.5 * s, 7.5 * s, 1.2 * s);

  // Visor
  ctx.fillStyle = visor;
  ctx.fillRect(6.5 * s, 2 * s, 5.5 * s, 2 * s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(8.5 * s, 2.2 * s, 1.5 * s, 1.5 * s);

  // High-Speed Trailing Scarf
  ctx.fillStyle = accent;
  ctx.fillRect(1.5 * s, 4.5 * s, 4 * s, 1.8 * s);
  ctx.fillRect(0 * s, 5 * s + Math.sin(globalFrame * 0.2) * 1.5, 2.5 * s, 1.5 * s);
  ctx.fillRect(-1.5 * s, 5.5 * s + Math.cos(globalFrame * 0.2) * 1.5, 2 * s, 1.2 * s);

  // Torso
  ctx.fillStyle = primary;
  ctx.fillRect(3.8 * s, 5.5 * s, 6.5 * s, 5 * s);

  // Solana Chest Emblem
  ctx.fillStyle = accent;
  ctx.fillRect(5 * s, 6.5 * s, 3.5 * s, 2.5 * s);

  // Plasma Blaster Arm
  if (hasPlasmaBlaster) {
    ctx.fillStyle = '#F97316';
    ctx.fillRect(9.5 * s, 6 * s, 3.5 * s, 3 * s);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(12.5 * s, 6.5 * s, 1.2 * s, 2 * s);
  }

  // Running Legs with Thruster Jets
  ctx.fillStyle = COLORS.bootsChrome;
  if (runFrame === 0) {
    ctx.fillRect(1 * s, 10.5 * s, 4.2 * s, 3.5 * s);
    ctx.fillRect(8 * s, 9.5 * s, 4.2 * s, 3.5 * s);
  } else if (runFrame === 1) {
    ctx.fillRect(3 * s, 10.5 * s, 3.8 * s, 3.5 * s);
    ctx.fillRect(7 * s, 10.5 * s, 3.8 * s, 3.5 * s);
  } else if (runFrame === 2) {
    ctx.fillRect(8 * s, 10.5 * s, 4.2 * s, 3.5 * s);
    ctx.fillRect(1 * s, 9.5 * s, 4.2 * s, 3.5 * s);
  } else {
    ctx.fillRect(4 * s, 10.5 * s, 3.8 * s, 3.5 * s);
    ctx.fillRect(6 * s, 10.5 * s, 3.8 * s, 3.5 * s);
  }

  // Mag-Boot Thruster Sparks
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.fillRect(-0.5 * s, 12 * s, 1.5 * s, 1.5 * s);
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(-1.5 * s, 12.5 * s, 1.2 * s, 1.2 * s);
}

function drawJumpNova(
  ctx: CanvasRenderingContext2D,
  visor: string,
  primary: string,
  accent: string,
  secondary: string,
  s: number,
  globalFrame: number,
  hasPlasmaBlaster: boolean
) {
  // Helmet
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(3 * s, 0, 7.5 * s, 4.8 * s);

  // Visor
  ctx.fillStyle = visor;
  ctx.fillRect(5.5 * s, 1.6 * s, 5.5 * s, 2 * s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(7.5 * s, 1.8 * s, 1.5 * s, 1.5 * s);

  // Scarf flapping downward in high winds
  ctx.fillStyle = accent;
  ctx.fillRect(2 * s, 4.5 * s, 7 * s, 1.6 * s);
  ctx.fillRect(0.8 * s, 6 * s, 2.5 * s, 3 * s);

  // Torso
  ctx.fillStyle = primary;
  ctx.fillRect(3 * s, 6 * s, 6.5 * s, 4.5 * s);

  // Solana Chest Emblem
  ctx.fillStyle = accent;
  ctx.fillRect(4.5 * s, 7 * s, 3.5 * s, 2.5 * s);

  // Plasma Blaster aiming forward
  if (hasPlasmaBlaster) {
    ctx.fillStyle = '#F97316';
    ctx.fillRect(9.5 * s, 5.5 * s, 4 * s, 3.5 * s);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(13 * s, 6 * s, 1.5 * s, 2.5 * s);
  }

  // Jet Boots with active ignition flame!
  ctx.fillStyle = COLORS.bootsChrome;
  ctx.fillRect(1.5 * s, 10.5 * s, 3.8 * s, 3 * s);
  ctx.fillRect(7.2 * s, 11 * s, 3.8 * s, 2.5 * s);

  // Boot Thruster Flames (animated flickering exhaust)
  const flameH = 3 + (globalFrame % 3) * 1.5;
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(2 * s, 13.5 * s, 2.8 * s, flameH * s);
  ctx.fillRect(7.7 * s, 13.5 * s, 2.8 * s, flameH * s);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(2.5 * s, 13.5 * s, 1.8 * s, (flameH * 0.6) * s);
  ctx.fillRect(8.2 * s, 13.5 * s, 1.8 * s, (flameH * 0.6) * s);
}

function drawDeadNova(
  ctx: CanvasRenderingContext2D,
  primary: string,
  accent: string,
  s: number,
  frame: number
) {
  // Glitching voxel fragments exploding outward
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(2 * s, 2 * s, 8 * s, 4 * s);
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(3 * s, 6 * s, 6 * s, 3 * s);
  ctx.fillStyle = accent;
  ctx.fillRect(1 * s, 9 * s, 3 * s, 2 * s);
  ctx.fillRect(6 * s, 10 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(4 * s, 3 * s, 2 * s, 2 * s);
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
    // Crushed mechanical scrap with sparking circuits
    ctx.fillStyle = COLORS.fudBotDark;
    ctx.fillRect(2, 22, 24, 7);
    ctx.fillStyle = COLORS.fudBotEyeRed;
    ctx.fillRect(8, 23, 12, 3);
    ctx.fillStyle = COLORS.fudBotSparks;
    ctx.fillRect(6, 20, 3, 3);
    ctx.fillRect(18, 21, 2, 2);
    return;
  }

  // Armored Hex Chassis
  ctx.fillStyle = COLORS.fudBotDark;
  ctx.beginPath();
  ctx.roundRect(3, 3, 22, 17, 4);
  ctx.fill();

  ctx.fillStyle = COLORS.fudBotBody;
  ctx.beginPath();
  ctx.roundRect(5, 5, 18, 13, 3);
  ctx.fill();

  // Red Optical Sensor Visor
  ctx.fillStyle = '#7F1D1D';
  ctx.fillRect(6, 8, 16, 6);

  ctx.fillStyle = COLORS.fudBotEyeRed;
  ctx.fillRect(7, 9, 14, 4);

  // Scanning laser dot sweep
  const scanX = 8 + (Math.sin(frame * 0.25) + 1) * 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(scanX, 9, 3, 4);

  // High-Tech Radar Antenna
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(13, 0, 2, 4);
  ctx.fillStyle = COLORS.fudBotEyeRed;
  ctx.fillRect(12, 0, 4, 2);

  // Robotic Stomp Legs (Alternating stride)
  const legStep = Math.floor(frame / 8) % 2 === 0;
  ctx.fillStyle = '#1F2937';
  if (legStep) {
    ctx.fillRect(3, 19, 6, 9);
    ctx.fillRect(19, 17, 6, 11);
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(2, 26, 8, 3);
  } else {
    ctx.fillRect(3, 17, 6, 11);
    ctx.fillRect(19, 19, 6, 9);
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(18, 26, 8, 3);
  }
}

function drawShieldOrb(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  if (enemy.state === 'sphere_idle' || enemy.state === 'sphere_rolling') {
    // Spherical Kinetic Energy Shell
    const isRolling = enemy.state === 'sphere_rolling';
    ctx.fillStyle = COLORS.shieldOrbBlue;
    ctx.beginPath();
    ctx.arc(14, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Outer Energy Forcefield Rim
    ctx.strokeStyle = COLORS.visorCyan;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rolling Gyro Core
    const angle = (frame * (isRolling ? 0.35 : 0.06));
    ctx.fillStyle = COLORS.shieldOrbCore;
    ctx.beginPath();
    ctx.arc(14, 16, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(14 + Math.cos(angle) * 7 - 2, 16 + Math.sin(angle) * 7 - 2, 4, 4);
    ctx.fillRect(14 - Math.cos(angle) * 7 - 2, 16 - Math.sin(angle) * 7 - 2, 4, 4);
    return;
  }

  // Hovering Security Drone
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(3, 5, 22, 18, 6);
  ctx.fill();

  ctx.fillStyle = COLORS.shieldOrbBlue;
  ctx.beginPath();
  ctx.roundRect(5, 7, 18, 14, 4);
  ctx.fill();

  // Cyan Energy Shield Band
  ctx.fillStyle = COLORS.visorCyan;
  ctx.fillRect(6, 11, 16, 5);

  // Dual Sensor Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(8, 12, 3, 3);
  ctx.fillRect(17, 12, 3, 3);

  // Twin Hover thrusters with exhaust
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.fillRect(6, 22, 4, 4);
  ctx.fillRect(18, 22, 4, 4);

  const hoverExhaust = (frame % 2) * 2;
  ctx.fillStyle = '#A7F3D0';
  ctx.fillRect(6, 26, 4, 2 + hoverExhaust);
  ctx.fillRect(18, 26, 4, 2 + hoverExhaust);
}

function drawPlasmaSentry(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  // Laser vent emitting upward thermal pulse
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(6, 10, 20, 20);

  // Cooling ribs
  ctx.fillStyle = '#334155';
  ctx.fillRect(8, 14, 16, 2);
  ctx.fillRect(8, 18, 16, 2);
  ctx.fillRect(8, 22, 16, 2);

  const laserPulse = Math.sin(frame * 0.15) > 0;
  if (laserPulse) {
    // Upward firing plasma beam
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(11, -4, 10, 16);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(13, -4, 6, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(15, -4, 2, 16);
  }
}

function drawMacroTitan(ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) {
  // 48x48 Colossal Mech Boss
  // Boss Health Gauge above the mech
  const maxHp = 5;
  const currentHp = enemy.health !== undefined ? enemy.health : 5;
  const hpPercent = Math.max(0, currentHp / maxHp);

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(2, -12, 44, 7);
  ctx.fillStyle = hpPercent > 0.4 ? '#10B981' : '#EF4444';
  ctx.fillRect(3, -11, 42 * hpPercent, 5);

  // Armored Heavy Chassis
  ctx.fillStyle = COLORS.macroTitanArmor;
  ctx.beginPath();
  ctx.roundRect(2, 6, 44, 32, 8);
  ctx.fill();

  ctx.fillStyle = COLORS.macroTitanSecondary;
  ctx.beginPath();
  ctx.roundRect(5, 9, 38, 26, 6);
  ctx.fill();

  // Glowing Quad-Visor Array
  ctx.fillStyle = COLORS.macroTitanRed;
  ctx.fillRect(8, 14, 32, 7);

  // Menacing scanning optics
  ctx.fillStyle = '#FFFFFF';
  const bossScan = Math.sin(frame * 0.1) * 6;
  ctx.fillRect(18 + bossScan, 15, 4, 5);
  ctx.fillRect(28 - bossScan, 15, 4, 5);

  // Heavy Shoulder-Mounted Missile Pods
  ctx.fillStyle = '#020617';
  ctx.fillRect(-2, 2, 9, 14);
  ctx.fillRect(41, 2, 9, 14);

  // Smoke from exhaust vents
  if (frame % 4 < 2) {
    ctx.fillStyle = '#64748B';
    ctx.fillRect(1, -2, 3, 3);
    ctx.fillRect(44, -2, 3, 3);
  }

  // Heavy Hydraulic Tread Legs
  ctx.fillStyle = '#334155';
  ctx.fillRect(6, 38, 14, 10);
  ctx.fillRect(28, 38, 14, 10);

  // Hydraulic Pistons
  ctx.fillStyle = '#64748B';
  ctx.fillRect(9, 39, 3, 8);
  ctx.fillRect(31, 39, 3, 8);

  // Core Plasma Arc Reactor with Heartbeat Pulse
  const corePulse = Math.sin(frame * 0.2) * 1.5;
  ctx.fillStyle = COLORS.macroTitanGold;
  ctx.beginPath();
  ctx.arc(24, 27, 6 + corePulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(24, 27, 3, 0, Math.PI * 2);
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
    const baseFloor = theme === 'mempool_cavern' ? '#090D16' : theme === 'titan_citadel' ? '#18181B' : '#0B0F19';
    ctx.fillStyle = baseFloor;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);

    // Glowing Neon Circuit Traces
    const traceColor = theme === 'titan_citadel' ? '#EF4444' : COLORS.solanaGreen;
    ctx.fillStyle = traceColor;
    ctx.fillRect(x, drawY, TILE_SIZE, 3); // top glowing rail

    // Internal circuit micro-traces
    ctx.fillStyle = 'rgba(20, 241, 149, 0.4)';
    ctx.fillRect(x + 4, drawY + 8, 2, 10);
    ctx.fillRect(x + 4, drawY + 18, 14, 2);
    ctx.fillRect(x + 18, drawY + 12, 10, 2);
    ctx.fillRect(x + 28, drawY + 12, 2, 12);
  } else if (tile === 'carbon_brick') {
    // Carbon-Nanotube Hex Brick
    const brickBase = theme === 'mempool_cavern' ? '#1E293B' : theme === 'titan_citadel' ? '#27272A' : '#1E1B4B';
    ctx.fillStyle = brickBase;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);

    // Beveled Border
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    // High-Tech Corner Hex Rivets
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(x + 3, drawY + 3, 2, 2);
    ctx.fillRect(x + TILE_SIZE - 5, drawY + 3, 2, 2);
    ctx.fillRect(x + 3, drawY + TILE_SIZE - 5, 2, 2);
    ctx.fillRect(x + TILE_SIZE - 5, drawY + TILE_SIZE - 5, 2, 2);

    // Central Data Core Line
    ctx.fillStyle = '#818CF8';
    ctx.fillRect(x + 6, drawY + 14, 20, 3);
  } else if (tile === 'matrix_cache') {
    // Holographic [ ◈ ] Cache Block
    ctx.fillStyle = '#064E3B'; // Dark Emerald base
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);

    // Neon Frame
    ctx.strokeStyle = COLORS.solanaGreen;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    // Golden Corner Brackets
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 3, drawY + 3, 4, 4);
    ctx.fillRect(x + TILE_SIZE - 7, drawY + 3, 4, 4);
    ctx.fillRect(x + 3, drawY + TILE_SIZE - 7, 4, 4);
    ctx.fillRect(x + TILE_SIZE - 7, drawY + TILE_SIZE - 7, 4, 4);

    // Animated Holographic Symbol with Scanline
    const pulseAlpha = 0.7 + Math.sin(globalFrame * 0.12) * 0.3;
    ctx.fillStyle = `rgba(20, 241, 149, ${pulseAlpha})`;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', x + TILE_SIZE / 2, drawY + TILE_SIZE / 2);

    // Horizontal scanline sweep
    const scanlineY = drawY + 4 + (globalFrame % 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + 4, scanlineY, TILE_SIZE - 8, 1);
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

    // Scorched center
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + 10, drawY + 10, 12, 12);
  } else if (tile === 'transit_pipe_tl' || tile === 'transit_pipe_tr' || tile === 'transit_pipe_bl' || tile === 'transit_pipe_br') {
    // Quantum Transit Pipeline
    ctx.fillStyle = COLORS.pipeNeonGreen;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.pipeNeonDark;
    ctx.fillRect(x + 3, drawY + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    ctx.strokeStyle = '#022C22';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, drawY, TILE_SIZE, TILE_SIZE);

    // Internal quantum directional arrows
    ctx.fillStyle = '#6EE7B7';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (tile.includes('_tl') || tile.includes('_tr')) {
      ctx.fillText('▼', x + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
    }
  } else if (tile === 'launch_pad') {
    // Kinetic Launchpad Trampoline
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 2, drawY + 22, 28, 10);
    ctx.fillStyle = COLORS.visorCyan;
    ctx.fillRect(x + 6, drawY + 12, 20, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, drawY + 4, 24, 6);

    // Springs
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, drawY + 22);
    ctx.lineTo(x + 14, drawY + 12);
    ctx.lineTo(x + 20, drawY + 22);
    ctx.stroke();
  } else if (tile === 'plasma_abyss') {
    // Bubbling Plasma Ocean
    const wave = Math.sin((globalFrame + x) * 0.1) * 3;
    ctx.fillStyle = COLORS.plasmaRed;
    ctx.fillRect(x, drawY + 4 + wave, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.plasmaOrange;
    ctx.fillRect(x, drawY + wave, TILE_SIZE, 5);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x + 8, drawY + wave + 1, 6, 2);
  } else if (tile === 'flux_bridge') {
    // Magnetic Flux Bridge
    ctx.fillStyle = '#312E81';
    ctx.fillRect(x, drawY + 10, TILE_SIZE, 12);
    ctx.fillStyle = COLORS.visorCyan;
    ctx.fillRect(x + 2, drawY + 12, TILE_SIZE - 4, 8);

    // High-voltage lightning sparks
    if (globalFrame % 6 < 3) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 8, drawY + 14, 16, 2);
    }
  } else if (tile === 'core_fuse') {
    // Golden Master Core Switch to drop the boss
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 12, drawY + 14, 8, 16);
    ctx.fillStyle = COLORS.solanaGreen;
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 10, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', x + 16, drawY + 10);
  } else if (tile === 'uplink_pylon_top') {
    // Validator Terminal Node Uplink
    ctx.fillStyle = COLORS.visorCyan;
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 14, drawY + 8, 4, 16);

    // Beaming satellite rings
    const ringRadius = 14 + (globalFrame % 8);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 16, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tile === 'uplink_pylon_beam') {
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(x + 13, drawY, 6, TILE_SIZE);
    ctx.fillStyle = '#A5F3FC';
    ctx.fillRect(x + 15, drawY, 2, TILE_SIZE);
  } else if (tile === 'uplink_pylon_base') {
    ctx.fillStyle = '#0E7490';
    ctx.fillRect(x + 4, drawY + 12, 24, 20);
    ctx.fillStyle = COLORS.solanaGreen;
    ctx.fillRect(x + 8, drawY + 16, 16, 4);
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
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 4, y + 2, 16, 20);

    ctx.fillStyle = cellColor;
    ctx.fillRect(x + 6, y + 6, 12, 14);

    // Terminal Cap
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(x + 9, y, 6, 2);

    // Glowing energy symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type === 'reboot_life' ? '+' : '⚡', x + 12, y + 13);
  } else if (type === 'plasma_core') {
    // Arm Blaster Module
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10, y + 10, 4, 4);
  } else if (type === 'hyper_matrix') {
    // Prismatic Star Core
    const color = COLORS.hyperColors[Math.floor(frame / 4) % COLORS.hyperColors.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x + 12, y + 12);
  }
}

/**
 * Draws floating spinning Solana Data Shards
 */
export function drawShard(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const widthFactor = Math.abs(Math.cos(frame * 0.14));
  const w = Math.max(4, 18 * widthFactor);

  // Outer Shard Glow
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 12, w / 2, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shimmer core
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 12, Math.max(2, (w / 2) - 2), 8, 0, 0, Math.PI * 2);
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
  ctx.arc(drawX + 8, drawY, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', drawX + 8, drawY);
  ctx.restore();
}

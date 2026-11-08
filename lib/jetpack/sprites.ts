// Procedural Pixel Art Sprites for CYBER NOVA: Sol-Jet Velocity
// 100% Original Sci-Fi Endless Jetpack Runner Assets for Solana

import { JetpackPlayer, Obstacle, ShardCollectible, VehicleTokenEntity, LabScientistNPC } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 480;
export const FLOOR_Y = 416;
export const CEILING_Y = 40;

export const COLORS = {
  visorCyan: '#00FFFF',
  visorGlow: '#80FFFF',
  jacketIndigo: '#1E1B4B',
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  bootsChrome: '#E2E8F0',
  bootsDark: '#64748B',

  // Jetpack Exhaust
  thrustCyan: '#38BDF8',
  thrustWhite: '#FFFFFF',
  thrustOrange: '#F97316',
  thrustGold: '#FBBF24',

  // Zapper Laser
  zapperPylon: '#334155',
  zapperCore: '#00FFFF',
  zapperGlow: 'rgba(0, 255, 255, 0.4)',
  zapperZap: '#FFFFFF',

  // Missile
  missileRed: '#EF4444',
  missileDark: '#991B1B',
  missileWarning: '#EF4444',
  missileGlow: '#FEF08A',

  // Vehicles
  drifterBody: '#06B6D4',
  mechBody: '#475569',
  cycleBody: '#8B5CF6',
};

/**
 * Draws Nova with Photon Jetpack or Active Cyber Vehicle
 */
export function drawJetpackPlayer(
  ctx: CanvasRenderingContext2D,
  player: JetpackPlayer,
  globalFrame: number
) {
  const drawX = Math.round(player.x);
  const drawY = Math.round(player.y);

  ctx.save();

  // Invincibility flicker
  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
    ctx.restore();
    return;
  }

  // Draw Kinetic Shield Bubble if active
  if (player.shields > 0) {
    ctx.save();
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(drawX + player.w / 2, drawY + player.h / 2, player.w / 2 + 10, player.h / 2 + 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.fill();
    ctx.restore();
  }

  // Draw Vehicle if active
  if (player.vehicle !== 'none') {
    drawVehicle(ctx, player, drawX, drawY, globalFrame);
    ctx.restore();
    return;
  }

  // Resolve Skin Palette
  let visorColor = COLORS.visorCyan;
  let suitPrimary = COLORS.jacketIndigo;
  let suitAccent = COLORS.solanaGreen;

  if (player.skin === 'gold') {
    suitPrimary = '#78350F';
    suitAccent = '#FDE047';
    visorColor = '#FEF08A';
  } else if (player.skin === 'shadow') {
    suitPrimary = '#09090B';
    suitAccent = '#10B981';
    visorColor = '#A7F3D0';
  } else if (player.skin === 'fire') {
    suitPrimary = '#1E1B4B';
    suitAccent = '#F97316';
    visorColor = '#FB923C';
  }

  const s = 1.6; // scale

  if (player.isDying) {
    // Tumbling / sliding mechanical tumble on floor
    ctx.translate(drawX + player.w / 2, drawY + player.h / 2);
    ctx.rotate((player.deathTimer * 0.15));
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-12, -12, 24, 24);
    ctx.fillStyle = visorColor;
    ctx.fillRect(-8, -4, 16, 8);
    ctx.restore();
    return;
  }

  // Normal Jetpack Runner
  ctx.translate(drawX, drawY);

  // 1. Dual-Nozzle Chrome Jetpack on back
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-7 * s, 4 * s, 6 * s, 10 * s); // jetpack body
  ctx.fillStyle = COLORS.bootsChrome;
  ctx.fillRect(-6 * s, 3 * s, 4 * s, 2 * s); // top intake
  ctx.fillRect(-7 * s, 14 * s, 5 * s, 3 * s); // bottom exhaust nozzle

  // Solana Glowing Power Cell on Jetpack
  ctx.fillStyle = suitAccent;
  ctx.fillRect(-5 * s, 6 * s, 3 * s, 6 * s);

  // Jetpack Thruster Flame Exhaust (when holding thrust)
  if (player.isThrusting) {
    const flameLen = 8 + (globalFrame % 4) * 3;
    ctx.fillStyle = player.skin === 'fire' ? '#F97316' : COLORS.thrustCyan;
    ctx.fillRect(-7 * s, 17 * s, 5 * s, flameLen * s);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-6 * s, 17 * s, 3 * s, (flameLen * 0.6) * s);
  }

  // 2. Helmet
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(2 * s, 0, 7.5 * s, 5 * s);

  // Visor
  ctx.fillStyle = visorColor;
  ctx.fillRect(4.5 * s, 1.8 * s, 5.5 * s, 2 * s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(7 * s, 2 * s, 1.5 * s, 1.5 * s); // reflection

  // Scarf streaming back
  ctx.fillStyle = suitAccent;
  ctx.fillRect(-2 * s, 4.5 * s, 4 * s, 1.8 * s);
  ctx.fillRect(-4 * s, 5 * s, 3 * s, 1.5 * s);

  // 3. Torso / Suit
  ctx.fillStyle = suitPrimary;
  ctx.fillRect(1.5 * s, 5.5 * s, 6.5 * s, 5 * s);

  // Chest emblem
  ctx.fillStyle = suitAccent;
  ctx.fillRect(3.5 * s, 6.5 * s, 3 * s, 2.5 * s);

  // 4. Legs / Boots
  ctx.fillStyle = COLORS.bootsChrome;
  if (player.grounded) {
    // Running stride on floor
    const runFrame = Math.floor(player.walkFrame) % 4;
    if (runFrame === 0) {
      ctx.fillRect(-1 * s, 10.5 * s, 4 * s, 3.5 * s);
      ctx.fillRect(6 * s, 9.5 * s, 4 * s, 3.5 * s);
    } else if (runFrame === 1) {
      ctx.fillRect(1 * s, 10.5 * s, 3.5 * s, 3.5 * s);
      ctx.fillRect(5 * s, 10.5 * s, 3.5 * s, 3.5 * s);
    } else if (runFrame === 2) {
      ctx.fillRect(6 * s, 10.5 * s, 4 * s, 3.5 * s);
      ctx.fillRect(-1 * s, 9.5 * s, 4 * s, 3.5 * s);
    } else {
      ctx.fillRect(2 * s, 10.5 * s, 3.5 * s, 3.5 * s);
      ctx.fillRect(4 * s, 10.5 * s, 3.5 * s, 3.5 * s);
    }
  } else {
    // Mid-air flight pose (legs angled back aerodynamically)
    ctx.fillRect(-1 * s, 10.5 * s, 4 * s, 3.5 * s);
    ctx.fillRect(3 * s, 11.5 * s, 4 * s, 3.5 * s);
    ctx.fillStyle = COLORS.bootsDark;
    ctx.fillRect(-1 * s, 13 * s, 4 * s, 1 * s);
  }

  ctx.restore();
}

/**
 * Draws original Cyber Vehicles (Gravity Drifter, Mech Breaker, Warp Cycle)
 */
function drawVehicle(
  ctx: CanvasRenderingContext2D,
  player: JetpackPlayer,
  drawX: number,
  drawY: number,
  globalFrame: number
) {
  ctx.save();
  ctx.translate(drawX, drawY);

  if (player.vehicle === 'gravity_drifter') {
    // Anti-Gravity Hover-Pod
    if (player.gravityInverted) {
      ctx.scale(1, -1);
      ctx.translate(0, -player.h);
    }
    ctx.fillStyle = '#0E7490';
    ctx.beginPath();
    ctx.roundRect(0, 4, 38, 26, 8);
    ctx.fill();

    // Cyan Cockpit Bubble
    ctx.fillStyle = COLORS.visorCyan;
    ctx.beginPath();
    ctx.ellipse(22, 14, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nova Pilot silhouette inside
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(18, 10, 7, 7);

    // Rotating Anti-Gravity Gyro Ring
    const angle = globalFrame * 0.15;
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(19, 17, 18, 6, angle, 0, Math.PI * 2);
    ctx.stroke();

    // Twin Repulsor Glow
    ctx.fillStyle = '#14F195';
    ctx.fillRect(4, 27, 8, 4);
    ctx.fillRect(26, 27, 8, 4);
  } else if (player.vehicle === 'mech_breaker') {
    // Heavy Armored Cyber Bipedal Stomper
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(2, 2, 40, 28, 6);
    ctx.fill();

    // Armored Cockpit Window
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(22, 6, 14, 8);

    // Heavy Stomper Legs
    const step = Math.floor(globalFrame / 6) % 2 === 0;
    ctx.fillStyle = '#1E293B';
    if (step) {
      ctx.fillRect(6, 28, 10, 14);
      ctx.fillRect(24, 26, 10, 16);
    } else {
      ctx.fillRect(6, 26, 10, 16);
      ctx.fillRect(24, 28, 10, 14);
    }

    // Heavy Plated Foot Pads
    ctx.fillStyle = '#64748B';
    ctx.fillRect(4, 39, 14, 4);
    ctx.fillRect(22, 39, 14, 4);
  } else if (player.vehicle === 'warp_cycle') {
    // Sleek Cyberpunk Speeder Bike
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.roundRect(0, 12, 44, 20, 6);
    ctx.fill();

    // Neon Trim
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(4, 16, 36, 4);

    // Nova Riding
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(14, 2, 14, 12);
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(20, 4, 8, 4);

    // Rear Turbine Thruster Trail
    ctx.fillStyle = '#C084FC';
    ctx.fillRect(-10, 16, 12, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-6, 18, 6, 2);
  }

  ctx.restore();
}

/**
 * Draws Obstacles (Zapper Lasers, Homing Missiles, Laser Gates)
 */
export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  globalFrame: number
) {
  const drawX = Math.round(obs.x);
  const drawY = Math.round(obs.y);

  if (obs.type === 'seeker_missile') {
    if (!obs.launched) {
      // Missile Warning Klaxon indicator tracking player on the right edge!
      const warnY = Math.round(obs.trackingY || drawY);
      const flash = Math.floor(globalFrame / 6) % 2 === 0;

      ctx.save();
      ctx.fillStyle = flash ? '#EF4444' : '#7F1D1D';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 44, warnY - 14, 36, 28, 6);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warning Exclamation mark
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', CANVAS_WIDTH - 26, warnY);

      // Horizontal tracking laser pointer line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - 44, warnY);
      ctx.lineTo(CANVAS_WIDTH - 240, warnY);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Rocket in flight
    ctx.save();
    ctx.translate(drawX, drawY);

    // Heavy red missile rocket
    ctx.fillStyle = COLORS.missileRed;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(24, 0);
    ctx.lineTo(28, 16);
    ctx.lineTo(0, 8);
    ctx.fill();

    ctx.fillStyle = COLORS.missileDark;
    ctx.fillRect(4, 2, 18, 12);

    // Rear Fin
    ctx.fillStyle = '#374151';
    ctx.fillRect(20, -2, 6, 20);

    // Exhaust Flame
    const exhaustLen = 10 + (globalFrame % 3) * 4;
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(26, 4, exhaustLen, 8);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(26, 6, exhaustLen * 0.5, 4);

    ctx.restore();
    return;
  }

  // Zapper Obstacles (Horizontal, Vertical, Diagonal, Rotating)
  ctx.save();
  ctx.translate(drawX, drawY);

  if (obs.type === 'zapper_rotating' && obs.angle !== undefined) {
    ctx.translate(obs.w / 2, obs.h / 2);
    ctx.rotate(obs.angle);
    ctx.translate(-obs.w / 2, -obs.h / 2);
  }

  const pulse = Math.sin(globalFrame * 0.25) * 1.5;

  if (obs.type === 'zapper_horizontal') {
    // Left Pylon
    drawPylon(ctx, 0, 0);
    // Right Pylon
    drawPylon(ctx, obs.w - 14, 0);

    // Pulsing Central Laser Beam
    ctx.fillStyle = COLORS.zapperGlow;
    ctx.fillRect(10, 4 - pulse / 2, obs.w - 20, 8 + pulse);
    ctx.fillStyle = COLORS.zapperCore;
    ctx.fillRect(12, 6, obs.w - 24, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(14, 7, obs.w - 28, 2);
  } else if (obs.type === 'zapper_vertical' || obs.type === 'laser_gate') {
    // Top Pylon
    drawPylon(ctx, 0, 0);
    // Bottom Pylon
    drawPylon(ctx, 0, obs.h - 14);

    // Vertical Laser Beam
    ctx.fillStyle = COLORS.zapperGlow;
    ctx.fillRect(4 - pulse / 2, 10, 8 + pulse, obs.h - 20);
    ctx.fillStyle = COLORS.zapperCore;
    ctx.fillRect(6, 12, 4, obs.h - 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(7, 14, 2, obs.h - 28);
  } else if (obs.type === 'zapper_diagonal' || obs.type === 'zapper_rotating') {
    // Angled / Rotating Zapper
    drawPylon(ctx, 0, 0);
    drawPylon(ctx, obs.w - 14, obs.h - 14);

    ctx.strokeStyle = COLORS.zapperGlow;
    ctx.lineWidth = 8 + pulse;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(obs.w - 8, obs.h - 8);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(obs.w - 8, obs.h - 8);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPylon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(x, y, 14, 14);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(x + 3, y + 3, 8, 8);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 5, y + 5, 4, 4);
}

/**
 * Draws Floating Solana Energy Shard
 */
export function drawShardCollectible(
  ctx: CanvasRenderingContext2D,
  shard: ShardCollectible,
  globalFrame: number
) {
  if (shard.collected) return;
  const drawX = Math.round(shard.x);
  const drawY = Math.round(shard.y);

  const rotFactor = Math.abs(Math.cos(globalFrame * 0.12));
  const w = Math.max(3, 16 * rotFactor);

  ctx.save();
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.beginPath();
  ctx.ellipse(drawX + 8, drawY + 8, w / 2, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.ellipse(drawX + 8, drawY + 8, Math.max(1, w / 2 - 2), 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (w > 8) {
    ctx.fillStyle = '#064E3B';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', drawX + 8, drawY + 8);
  }
  ctx.restore();
}

/**
 * Draws Vehicle Token Hologram Box [ V ]
 */
export function drawVehicleToken(
  ctx: CanvasRenderingContext2D,
  token: VehicleTokenEntity,
  globalFrame: number
) {
  if (!token.active) return;
  const drawX = Math.round(token.x);
  const drawY = Math.round(token.y) + Math.sin(globalFrame * 0.1) * 3;

  ctx.save();
  ctx.fillStyle = '#1E1B4B';
  ctx.beginPath();
  ctx.roundRect(drawX, drawY, 26, 26, 6);
  ctx.fill();

  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Floating Symbol
  ctx.fillStyle = '#C084FC';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', drawX + 13, drawY + 13);
  ctx.restore();
}

/**
 * Draws Floor Laboratory Protocol Scientists running in panic
 */
export function drawLabScientistNPC(
  ctx: CanvasRenderingContext2D,
  npc: LabScientistNPC
) {
  const drawX = Math.round(npc.x);
  const drawY = Math.round(npc.y);

  ctx.save();
  ctx.translate(drawX, drawY);

  // Scientist Lab Coat
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(4, 8, 12, 14);

  // Glasses / Head
  ctx.fillStyle = '#FFDFC4';
  ctx.fillRect(6, 0, 8, 8);
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(10, 2, 4, 3); // Blue safety goggles

  // Panicked flailing arms
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 4, 4, 8);
  ctx.fillRect(16, 4, 4, 8);

  // Running Legs
  const leg = Math.floor(npc.walkFrame) % 2 === 0;
  ctx.fillStyle = '#1E293B';
  if (leg) {
    ctx.fillRect(4, 22, 4, 6);
    ctx.fillRect(12, 20, 4, 8);
  } else {
    ctx.fillRect(4, 20, 4, 8);
    ctx.fillRect(12, 22, 4, 6);
  }

  ctx.restore();
}

/**
 * Draws Multi-layer Parallax Cyber Research Facility Background
 */
export function drawFacilityBackground(
  ctx: CanvasRenderingContext2D,
  distance: number,
  globalFrame: number
) {
  // 1. Dark Mainframe Base
  ctx.fillStyle = '#080A12';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Far Layer: Server Racks & Solana Mainframe Arrays (0.2x speed)
  const farOffset = Math.round(distance * 0.6) % 300;
  ctx.fillStyle = '#0E1322';
  for (let x = -farOffset; x < CANVAS_WIDTH + 300; x += 150) {
    ctx.fillRect(x, 60, 110, 340);
    // Server LED blinks
    ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
    for (let sy = 80; sy < 380; sy += 24) {
      ctx.fillRect(x + 12, sy, 3, 4);
      ctx.fillRect(x + 20, sy, 3, 4);
      ctx.fillRect(x + 40, sy, 3, 4);
      ctx.fillRect(x + 60, sy, 3, 4);
    }
    ctx.fillStyle = '#0E1322';
  }

  // 3. Mid Layer: Conduit Pipes & Wall Plating (0.5x speed)
  const midOffset = Math.round(distance * 1.5) % 200;
  ctx.strokeStyle = 'rgba(20, 241, 149, 0.08)';
  ctx.lineWidth = 2;
  for (let x = -midOffset; x < CANVAS_WIDTH + 200; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, 416);
    ctx.stroke();
  }

  // 4. Solid Ceiling Plating
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y);
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(0, CEILING_Y - 3, CANVAS_WIDTH, 3); // Cyan ceiling guide strip

  // 5. Solid Floor Plating
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);
  ctx.fillStyle = '#14F195';
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, 3); // Green floor guide strip

  // Floor Perspective Grid
  ctx.strokeStyle = 'rgba(20, 241, 149, 0.12)';
  ctx.lineWidth = 1;
  const gridOffset = Math.round(distance * 4) % 40;
  for (let x = -gridOffset; x < CANVAS_WIDTH + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, FLOOR_Y);
    ctx.lineTo(x - 20, CANVAS_HEIGHT);
    ctx.stroke();
  }
}

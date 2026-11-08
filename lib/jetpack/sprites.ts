// Procedural Pixel Art Sprites for CYBER NOVA: Sol-Jet Velocity
// 100% Original Sci-Fi Endless Jetpack Runner Assets for Solana

import { JetpackPlayer, Obstacle, ShardCollectible, VehicleTokenEntity, LabScientistNPC, SpeedGateEntity } from './types';

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
  zapperPylon: '#1E293B',
  zapperPylonBorder: '#38BDF8',
  zapperCore: '#00FFFF',
  zapperGlow: 'rgba(0, 255, 255, 0.45)',
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
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.fill();
    ctx.restore();
  }

  // Draw Warp Boost Aura if active
  if (player.warpBoostTimer > 0) {
    ctx.save();
    const warpPulse = (globalFrame % 10) / 10;
    ctx.strokeStyle = `rgba(153, 69, 255, ${0.8 - warpPulse * 0.4})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(drawX + player.w / 2, drawY + player.h / 2, player.w / 2 + 16, player.h / 2 + 16, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Speed lines trailing back
    ctx.strokeStyle = 'rgba(20, 241, 149, 0.6)';
    ctx.lineWidth = 1.5;
    for (let l = 0; l < 4; l++) {
      ctx.beginPath();
      ctx.moveTo(drawX - 10 - l * 15, drawY + 8 + l * 8);
      ctx.lineTo(drawX - 35 - l * 20, drawY + 8 + l * 8);
      ctx.stroke();
    }
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

  // Dynamic flight tilt angle (-15 deg when climbing, +15 deg when diving)
  const flightTilt = Math.max(-0.25, Math.min(0.25, player.vy * 0.035));
  ctx.rotate(flightTilt);

  // 1. Dual-Nozzle Chrome Jetpack on back
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(-8 * s, 4 * s, 7 * s, 11 * s, 3);
  ctx.fill();

  ctx.fillStyle = COLORS.bootsChrome;
  ctx.fillRect(-7 * s, 2.5 * s, 5 * s, 2 * s); // top chrome intake
  ctx.fillRect(-8 * s, 15 * s, 6 * s, 3 * s); // exhaust nozzle bell

  // Solana Glowing Power Cell on Jetpack
  ctx.fillStyle = suitAccent;
  ctx.fillRect(-6 * s, 6 * s, 3 * s, 6 * s);

  // Jetpack Thruster Flame Exhaust (when holding thrust)
  if (player.isThrusting) {
    const flameLen = 10 + (globalFrame % 4) * 4;
    const exhaustColor = player.skin === 'fire' ? '#F97316' : player.skin === 'gold' ? '#FBBF24' : COLORS.thrustCyan;

    // Outer plasma flare
    ctx.fillStyle = exhaustColor;
    ctx.beginPath();
    ctx.moveTo(-8 * s, 18 * s);
    ctx.lineTo(-5 * s, (18 + flameLen) * s);
    ctx.lineTo(-2 * s, 18 * s);
    ctx.fill();

    // Inner white-hot core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-7 * s, 18 * s);
    ctx.lineTo(-5 * s, (18 + flameLen * 0.55) * s);
    ctx.lineTo(-3 * s, 18 * s);
    ctx.fill();
  }

  // 2. Helmet & Visor
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(2 * s, 0, 8 * s, 5.5 * s, 3);
  ctx.fill();

  // Glowing Visor
  ctx.fillStyle = visorColor;
  ctx.fillRect(4.5 * s, 1.8 * s, 6 * s, 2.2 * s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(7.5 * s, 2 * s, 1.8 * s, 1.5 * s); // reflection glint

  // Animated Scarf Ripples
  const scarfWave = Math.sin(globalFrame * 0.3) * 1.5;
  ctx.fillStyle = suitAccent;
  ctx.fillRect(-2 * s, 4.5 * s, 4 * s, 1.8 * s);
  ctx.fillRect((-4 - scarfWave) * s, (5 + scarfWave * 0.5) * s, 3 * s, 1.5 * s);

  // 3. Torso / Suit
  ctx.fillStyle = suitPrimary;
  ctx.fillRect(1.5 * s, 5.5 * s, 7 * s, 5.5 * s);

  // Chest emblem / Solana circuit
  ctx.fillStyle = suitAccent;
  ctx.fillRect(3.5 * s, 6.8 * s, 3 * s, 2.5 * s);

  // 4. Legs / Boots
  ctx.fillStyle = COLORS.bootsChrome;
  if (player.grounded) {
    // Running stride on floor
    const runFrame = Math.floor(player.walkFrame) % 4;
    if (runFrame === 0) {
      ctx.fillRect(-1 * s, 11 * s, 4 * s, 4 * s);
      ctx.fillRect(6 * s, 10 * s, 4 * s, 4 * s);
    } else if (runFrame === 1) {
      ctx.fillRect(1 * s, 11 * s, 3.5 * s, 4 * s);
      ctx.fillRect(5 * s, 11 * s, 3.5 * s, 4 * s);
    } else if (runFrame === 2) {
      ctx.fillRect(6 * s, 11 * s, 4 * s, 4 * s);
      ctx.fillRect(-1 * s, 10 * s, 4 * s, 4 * s);
    } else {
      ctx.fillRect(2 * s, 11 * s, 3.5 * s, 4 * s);
      ctx.fillRect(4 * s, 11 * s, 3.5 * s, 4 * s);
    }
  } else {
    // Mid-air flight pose (legs angled back aerodynamically)
    ctx.fillRect(-2 * s, 11 * s, 4.5 * s, 4 * s);
    ctx.fillRect(3 * s, 12 * s, 4.5 * s, 4 * s);
    ctx.fillStyle = COLORS.bootsDark;
    ctx.fillRect(-2 * s, 14 * s, 4.5 * s, 1 * s);
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
    ctx.fillStyle = '#0891B2';
    ctx.beginPath();
    ctx.roundRect(0, 4, 40, 26, 8);
    ctx.fill();

    // Cyan Cockpit Bubble
    ctx.fillStyle = COLORS.visorCyan;
    ctx.beginPath();
    ctx.ellipse(24, 14, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nova Pilot silhouette inside
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(20, 10, 8, 7);

    // Rotating Anti-Gravity Gyro Ring
    const angle = globalFrame * 0.15;
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(20, 17, 19, 6, angle, 0, Math.PI * 2);
    ctx.stroke();

    // Twin Repulsor Glow
    ctx.fillStyle = '#14F195';
    ctx.fillRect(4, 27, 8, 4);
    ctx.fillRect(28, 27, 8, 4);
  } else if (player.vehicle === 'mech_breaker') {
    // Heavy Armored Cyber Bipedal Stomper
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(2, 2, 42, 28, 6);
    ctx.fill();

    // Armored Cockpit Window
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(24, 6, 14, 8);

    // Heavy Stomper Legs
    const step = Math.floor(globalFrame / 6) % 2 === 0;
    ctx.fillStyle = '#1E293B';
    if (step) {
      ctx.fillRect(6, 28, 10, 14);
      ctx.fillRect(26, 26, 10, 16);
    } else {
      ctx.fillRect(6, 26, 10, 16);
      ctx.fillRect(26, 28, 10, 14);
    }

    // Heavy Plated Foot Pads
    ctx.fillStyle = '#64748B';
    ctx.fillRect(4, 39, 14, 4);
    ctx.fillRect(24, 39, 14, 4);
  } else if (player.vehicle === 'warp_cycle') {
    // Sleek Cyberpunk Speeder Bike
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.roundRect(0, 12, 46, 20, 6);
    ctx.fill();

    // Neon Trim
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(4, 16, 38, 4);

    // Nova Riding
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(16, 2, 14, 12);
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(22, 4, 8, 4);

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
      const flash = Math.floor(globalFrame / 5) % 2 === 0;

      ctx.save();
      // Holographic tracking box
      ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.9)' : 'rgba(153, 27, 27, 0.7)';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 50, warnY - 16, 42, 32, 6);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warning Exclamation mark
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', CANVAS_WIDTH - 29, warnY);

      // Distance Countdown
      const countdown = Math.max(0, Math.round((obs.warningTimer || 60) * 4));
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText(`${countdown}m`, CANVAS_WIDTH - 29, warnY + 22);

      // Horizontal tracking laser pointer line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - 50, warnY);
      ctx.lineTo(CANVAS_WIDTH - 260, warnY);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Rocket in flight
    ctx.save();
    ctx.translate(drawX, drawY);

    // Heavy red missile rocket body
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
    ctx.fillRect(20, -3, 6, 22);

    // Warhead tip
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(0, 6, 4, 4);

    // Exhaust Flame
    const exhaustLen = 12 + (globalFrame % 3) * 5;
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

  const pulse = Math.sin(globalFrame * 0.25) * 2.0;

  if (obs.type === 'zapper_horizontal') {
    // Left & Right Pylons
    drawPylon(ctx, 0, 0);
    drawPylon(ctx, obs.w - 14, 0);

    // Pulsing Central Laser Glow
    ctx.fillStyle = COLORS.zapperGlow;
    ctx.fillRect(10, 4 - pulse / 2, obs.w - 20, 8 + pulse);

    // Animated Electric Arcing Lightning Segments
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 8);
    const steps = 6;
    const segW = (obs.w - 20) / steps;
    for (let s = 1; s <= steps; s++) {
      const jitter = (s === steps) ? 0 : (Math.random() - 0.5) * 6;
      ctx.lineTo(10 + s * segW, 8 + jitter);
    }
    ctx.stroke();

    ctx.strokeStyle = COLORS.zapperCore;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (obs.type === 'zapper_vertical' || obs.type === 'laser_gate') {
    // Top & Bottom Pylons
    drawPylon(ctx, 0, 0);
    drawPylon(ctx, 0, obs.h - 14);

    // Vertical Laser Glow
    ctx.fillStyle = COLORS.zapperGlow;
    ctx.fillRect(4 - pulse / 2, 10, 8 + pulse, obs.h - 20);

    // Animated Electric Arcing Lightning Segments
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(8, 10);
    const steps = 8;
    const segH = (obs.h - 20) / steps;
    for (let s = 1; s <= steps; s++) {
      const jitter = (s === steps) ? 0 : (Math.random() - 0.5) * 6;
      ctx.lineTo(8 + jitter, 10 + s * segH);
    }
    ctx.stroke();

    ctx.strokeStyle = COLORS.zapperCore;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (obs.type === 'zapper_diagonal' || obs.type === 'zapper_rotating') {
    // Angled / Rotating Zapper with Pylons at ends
    drawPylon(ctx, 0, 0);
    drawPylon(ctx, obs.w - 14, obs.h - 14);

    ctx.strokeStyle = COLORS.zapperGlow;
    ctx.lineWidth = 8 + pulse;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(obs.w - 8, obs.h - 8);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const targetX = 8 + t * (obs.w - 16);
      const targetY = 8 + t * (obs.h - 16);
      const jitter = (s === steps) ? 0 : (Math.random() - 0.5) * 8;
      ctx.lineTo(targetX + jitter, targetY - jitter);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawPylon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(x, y, 14, 14, 3);
  ctx.fill();

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#00FFFF';
  ctx.fillRect(x + 4, y + 4, 6, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 5, y + 5, 4, 4);
}

/**
 * Draws Floating Solana Energy Shard (3D Diamond with Shimmer)
 */
export function drawShardCollectible(
  ctx: CanvasRenderingContext2D,
  shard: ShardCollectible,
  globalFrame: number
) {
  if (shard.collected) return;
  const drawX = Math.round(shard.x);
  const drawY = Math.round(shard.y);

  // 3D rotation projection
  const rotFactor = Math.abs(Math.cos(globalFrame * 0.12));
  const w = Math.max(3, 16 * rotFactor);

  ctx.save();
  // Outer gradient glow
  ctx.fillStyle = 'rgba(20, 241, 149, 0.2)';
  ctx.beginPath();
  ctx.ellipse(drawX + 8, drawY + 8, 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Diamond shape
  ctx.fillStyle = COLORS.solanaGreen;
  ctx.beginPath();
  ctx.moveTo(drawX + 8, drawY);
  ctx.lineTo(drawX + 8 + w / 2, drawY + 8);
  ctx.lineTo(drawX + 8, drawY + 16);
  ctx.lineTo(drawX + 8 - w / 2, drawY + 8);
  ctx.closePath();
  ctx.fill();

  // Top facet glint
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(drawX + 8, drawY + 2);
  ctx.lineTo(drawX + 8 + w * 0.3, drawY + 8);
  ctx.lineTo(drawX + 8, drawY + 7);
  ctx.closePath();
  ctx.fill();

  if (w > 8) {
    ctx.fillStyle = '#064E3B';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', drawX + 8, drawY + 8);
  }
  ctx.restore();
}

/**
 * Draws Quantum Speed Booster Gate [ SPEED GATE >> ]
 */
export function drawSpeedGate(
  ctx: CanvasRenderingContext2D,
  gate: SpeedGateEntity,
  globalFrame: number
) {
  if (!gate.active) return;
  const drawX = Math.round(gate.x);
  const drawY = Math.round(gate.y);

  ctx.save();
  const pulse = Math.sin(globalFrame * 0.2) * 3;

  // Outer glowing ring
  ctx.strokeStyle = '#9945FF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(drawX + gate.w / 2, drawY + gate.h / 2, gate.w / 2 + pulse, gate.h / 2 + pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner energy aura
  ctx.fillStyle = 'rgba(153, 69, 255, 0.15)';
  ctx.fill();

  // Chevrons [ >> ]
  ctx.fillStyle = '#14F195';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('>>', drawX + gate.w / 2, drawY + gate.h / 2);

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
  ctx.roundRect(drawX, drawY, 28, 28, 6);
  ctx.fill();

  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Floating Symbol
  ctx.fillStyle = '#C084FC';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', drawX + 14, drawY + 14);
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

  // Distant Hologram City Billboard (Every 400m)
  const billboardX = 600 - (Math.round(distance * 1.8) % 800);
  if (billboardX > -150 && billboardX < CANVAS_WIDTH + 50) {
    ctx.save();
    ctx.fillStyle = 'rgba(153, 69, 255, 0.06)';
    ctx.fillRect(billboardX, 90, 120, 50);
    ctx.strokeStyle = 'rgba(153, 69, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(billboardX, 90, 120, 50);

    ctx.fillStyle = 'rgba(20, 241, 149, 0.35)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOLANA DEVNET', billboardX + 60, 110);
    ctx.fillText('65,000 TPS CLUSTER', billboardX + 60, 126);
    ctx.restore();
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

/**
 * A.R.I.A. Autonomous AI Holographic Tactical HUD Overlay
 * Visually displays the autonomous agent's real-time lookahead corridor,
 * predictive trajectory curve, target altitude waypoint, and hazard lock brackets.
 */
export function drawAiTacticalOverlay(
  ctx: CanvasRenderingContext2D,
  player: JetpackPlayer,
  obstacles: Obstacle[],
  telemetry: { action: string; confidence: number; reason: string; targetY?: number } | null,
  globalFrame: number
) {
  if (!telemetry) return;
  ctx.save();

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const targetY = telemetry.targetY ?? py;

  // 1. Radar Scan Sweep Corridor ahead of player
  const scanWidth = 300;
  const sweepProgress = (globalFrame * 4) % scanWidth;
  const sweepX = px + sweepProgress;

  const grad = ctx.createLinearGradient(sweepX - 30, 0, sweepX, 0);
  grad.addColorStop(0, 'rgba(0, 255, 255, 0)');
  grad.addColorStop(1, 'rgba(0, 255, 255, 0.08)');
  ctx.fillStyle = grad;
  ctx.fillRect(px, CEILING_Y, sweepX - px, FLOOR_Y - CEILING_Y);

  ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sweepX, CEILING_Y);
  ctx.lineTo(sweepX, FLOOR_Y);
  ctx.stroke();

  // 2. Predictive Trajectory Bezier Spline
  ctx.save();
  ctx.strokeStyle = 'rgba(20, 241, 149, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(px + 12, py);
  ctx.quadraticCurveTo(px + 60, py, px + 140, targetY);
  ctx.stroke();

  // Target Waypoint Crosshair at (px + 140, targetY)
  ctx.setLineDash([]);
  ctx.strokeStyle = '#14F195';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(px + 140, targetY, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#14F195';
  ctx.fillRect(px + 137, targetY - 1, 6, 2);
  ctx.fillRect(px + 139, targetY - 3, 2, 6);
  ctx.restore();

  // 3. Threat Detection Holographic Corner Brackets
  for (const obs of obstacles) {
    if (!obs.active || obs.x < player.x - 20 || obs.x > player.x + 300) continue;
    ctx.save();
    const isMissile = obs.type === 'seeker_missile';
    ctx.strokeStyle = isMissile ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 255, 255, 0.75)';
    ctx.lineWidth = 1.5;
    const bX = Math.round(obs.x) - 4;
    const bY = Math.round(obs.y) - 4;
    const bW = Math.round(obs.w) + 8;
    const bH = Math.round(obs.h) + 8;

    const cL = 6;
    ctx.beginPath();
    ctx.moveTo(bX, bY + cL); ctx.lineTo(bX, bY); ctx.lineTo(bX + cL, bY);
    ctx.moveTo(bX + bW - cL, bY); ctx.lineTo(bX + bW, bY); ctx.lineTo(bX + bW, bY + cL);
    ctx.moveTo(bX, bY + bH - cL); ctx.lineTo(bX, bY + bH); ctx.lineTo(bX + cL, bY + bH);
    ctx.moveTo(bX + bW - cL, bY + bH); ctx.lineTo(bX + bW, bY + bH); ctx.lineTo(bX + bW, bY + bH - cL);
    ctx.stroke();

    ctx.fillStyle = isMissile ? '#EF4444' : '#00FFFF';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(isMissile ? '⚠️ MISSILE LOCK' : '⚡ HAZARD GAP', bX, bY - 6);
    ctx.restore();
  }

  // 4. Futuristic Tactical Status Pill in Canvas Corner
  ctx.save();
  ctx.fillStyle = 'rgba(10, 10, 16, 0.88)';
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(16, 12, 340, 24, 6);
  ctx.fill();
  ctx.stroke();

  // Blinking AI indicator dot
  const pulse = (globalFrame % 30) < 15;
  ctx.fillStyle = pulse ? '#14F195' : '#047857';
  ctx.beginPath();
  ctx.arc(26, 24, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#00FFFF';
  ctx.fillText('A.R.I.A. NEURAL COPILOT', 36, 27);

  ctx.fillStyle = '#71717A';
  ctx.fillText('|', 160, 27);

  ctx.fillStyle = telemetry.action.includes('EVADE') ? '#EF4444' : '#E4E4E7';
  ctx.fillText(`${telemetry.action.slice(0, 18)}`, 168, 27);

  ctx.fillStyle = '#14F195';
  ctx.fillText(`${Math.round(telemetry.confidence * 100)}%`, 318, 27);
  ctx.restore();

  ctx.restore();
}

/**
 * Renders In-Flight Mission & DeFi Wager Objective Overlays directly onto the canvas
 */
export function drawMissionHudOverlay(
  ctx: CanvasRenderingContext2D,
  distance: number,
  activeWager: { amount: number; targetMeters: number; potentialPayout: number } | null,
  stakingPerks: { shardBonusPercent: number; superJump: boolean; shardMagnet: boolean },
  shields: number,
  globalFrame: number
) {
  ctx.save();

  // 1. Active DeFi Escrow Wager Card (Top-Right Canvas Overlay)
  if (activeWager) {
    const isCompleted = distance >= activeWager.targetMeters;
    const progress = Math.min(100, Math.round((distance / activeWager.targetMeters) * 100));

    ctx.save();
    ctx.fillStyle = isCompleted ? 'rgba(5, 46, 22, 0.92)' : 'rgba(24, 18, 5, 0.9)';
    ctx.strokeStyle = isCompleted ? '#14F195' : '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH - 240, 12, 224, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = isCompleted ? '#14F195' : '#FBBF24';
    ctx.fillText(
      isCompleted 
        ? `🏆 BOUNTY UNLOCKED: +${activeWager.potentialPayout.toFixed(3)} SOL`
        : `🎯 WAGER: ${distance}m / ${activeWager.targetMeters}m (${progress}%)`,
      CANVAS_WIDTH - 232,
      25
    );

    // Mini Progress Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(CANVAS_WIDTH - 232, 30, 208, 4);
    ctx.fillStyle = isCompleted ? '#14F195' : '#F59E0B';
    ctx.fillRect(CANVAS_WIDTH - 232, 30, (208 * progress) / 100, 4);

    ctx.restore();
  }

  // 2. Staking Perks Indicators (Top-Center / Bottom-Left)
  const perksList: string[] = [];
  if (shields > 0) perksList.push(`🛡️ SHIELD (${shields})`);
  if (stakingPerks.shardMagnet) perksList.push('🧲 MAGNET');
  if (stakingPerks.shardBonusPercent > 0) perksList.push(`⚡ +${stakingPerks.shardBonusPercent}% SHARDS`);

  if (perksList.length > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, FLOOR_Y + 12, 280, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(perksList.join(' • '), 24, FLOOR_Y + 26);
    ctx.restore();
  }

  ctx.restore();
}

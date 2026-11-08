// Procedural Pixel Art Sprites for Super Solario
// Renders authentic NES / 16-bit arcade sprites onto Canvas 2D contexts

import { Player, Enemy, TileType } from './types';

export const TILE_SIZE = 32;

// Standard Mario Palette (with Solana themed colors!)
export const COLORS = {
  // Mario
  marioHatRed: '#E52521',
  marioOverallsBlue: '#0020C2',
  marioSkin: '#FCD8A8',
  marioBrownHair: '#6A3805',
  
  // Fire Mario
  fireWhite: '#FFFFFF',
  fireRed: '#E52521',

  // Star Mario Rainbow Cycles
  starColors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF', '#14F195', '#9945FF'],

  // Solana
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  solanaDark: '#121212',

  // Enemies
  goombaBody: '#B85020',
  goombaFeet: '#301808',
  koopaGreen: '#00A800',
  koopaYellow: '#FCB000',
  koopaShellRed: '#D82800',
  piranhaRed: '#D82800',
  bowserGreen: '#248024',
  bowserOrange: '#FC7400',
  bowserSpikes: '#F8F8F8',

  // Tiles & Environment
  groundBrown: '#C84C0C',
  groundTopGreen: '#00A800',
  brickBrown: '#B84418',
  brickMortar: '#000000',
  questionYellow: '#FC9838',
  metalGrey: '#888888',
  pipeGreenLight: '#00D800',
  pipeGreenDark: '#006800',
  coinGold: '#FCB000',
  cloudWhite: '#FFFFFF',
  lavaRed: '#E81C00',
  lavaOrange: '#FFA800',
  castleBrick: '#686868',
};

/**
 * Draws the player (Solario) at (x, y) with proper scale, animation frame, and direction.
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

  // Flip horizontally if facing left
  if (player.facingLeft) {
    ctx.translate(drawX + player.w, drawY);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(drawX, drawY);
  }

  // Invincibility blink
  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
    ctx.restore();
    return;
  }

  const isSuper = player.powerUp === 'super' || player.powerUp === 'fire' || player.powerUp === 'star';
  const isStar = player.starTimer > 0;

  // Resolve palette
  let shirtColor = COLORS.marioHatRed;
  let overallsColor = COLORS.marioOverallsBlue;

  if (skinType === 'gold') {
    shirtColor = '#FFD700';
    overallsColor = '#FFA500';
  } else if (skinType === 'shadow') {
    shirtColor = '#2A2A2A';
    overallsColor = '#14F195';
  } else if (player.powerUp === 'fire') {
    shirtColor = COLORS.fireWhite;
    overallsColor = COLORS.fireRed;
  }

  if (isStar) {
    const colorIndex = Math.floor(globalFrame / 3) % COLORS.starColors.length;
    shirtColor = COLORS.starColors[colorIndex];
    overallsColor = COLORS.starColors[(colorIndex + 3) % COLORS.starColors.length];
  }

  // Draw Pixel Model
  const scale = isSuper ? 2 : 1.5;

  if (player.isDying) {
    // Solario dead face / pose
    drawDeadSolario(ctx, shirtColor, overallsColor, scale);
  } else if (!player.grounded) {
    // Jump Pose
    drawJumpSolario(ctx, shirtColor, overallsColor, scale);
  } else if (Math.abs(player.vx) > 0.5) {
    // Run cycle (3 frames)
    const runFrame = Math.floor(player.walkFrame) % 3;
    drawRunSolario(ctx, shirtColor, overallsColor, scale, runFrame);
  } else {
    // Idle Pose
    drawIdleSolario(ctx, shirtColor, overallsColor, scale);
  }

  ctx.restore();
}

function drawIdleSolario(ctx: CanvasRenderingContext2D, shirt: string, overalls: string, scale: number) {
  // Hat
  ctx.fillStyle = shirt;
  ctx.fillRect(3 * scale, 0, 7 * scale, 2 * scale);
  ctx.fillRect(2 * scale, 2 * scale, 10 * scale, 1.5 * scale);

  // Face & Hair
  ctx.fillStyle = COLORS.marioSkin;
  ctx.fillRect(3 * scale, 3.5 * scale, 8 * scale, 3 * scale);
  ctx.fillStyle = COLORS.marioBrownHair;
  ctx.fillRect(1 * scale, 3 * scale, 3 * scale, 3.5 * scale); // hair
  ctx.fillRect(6 * scale, 4.5 * scale, 1.5 * scale, 1.5 * scale); // eye
  ctx.fillRect(7 * scale, 5.5 * scale, 4 * scale, 1.5 * scale); // mustache

  // Torso / Overalls
  ctx.fillStyle = shirt;
  ctx.fillRect(2 * scale, 6.5 * scale, 8 * scale, 4 * scale);
  ctx.fillStyle = overalls;
  ctx.fillRect(3 * scale, 8 * scale, 6 * scale, 4 * scale);
  ctx.fillRect(2 * scale, 9 * scale, 8 * scale, 3 * scale);

  // Shoes
  ctx.fillStyle = COLORS.marioBrownHair;
  ctx.fillRect(1 * scale, 12 * scale, 4 * scale, 2 * scale);
  ctx.fillRect(7 * scale, 12 * scale, 4 * scale, 2 * scale);
}

function drawRunSolario(ctx: CanvasRenderingContext2D, shirt: string, overalls: string, scale: number, frame: number) {
  // Hat
  ctx.fillStyle = shirt;
  ctx.fillRect(3 * scale, 0, 7 * scale, 2 * scale);
  ctx.fillRect(2 * scale, 2 * scale, 10 * scale, 1.5 * scale);

  // Face & Hair
  ctx.fillStyle = COLORS.marioSkin;
  ctx.fillRect(3 * scale, 3.5 * scale, 8 * scale, 3 * scale);
  ctx.fillStyle = COLORS.marioBrownHair;
  ctx.fillRect(1 * scale, 3 * scale, 3 * scale, 3.5 * scale);
  ctx.fillRect(6 * scale, 4.5 * scale, 1.5 * scale, 1.5 * scale);
  ctx.fillRect(7 * scale, 5.5 * scale, 4 * scale, 1.5 * scale);

  // Torso
  ctx.fillStyle = shirt;
  ctx.fillRect(2 * scale, 6.5 * scale, 8 * scale, 4 * scale);
  ctx.fillStyle = overalls;
  ctx.fillRect(3 * scale, 8 * scale, 6 * scale, 4 * scale);
  ctx.fillRect(2 * scale, 9 * scale, 8 * scale, 3 * scale);

  // Legs in run stride
  ctx.fillStyle = COLORS.marioBrownHair;
  if (frame === 0) {
    ctx.fillRect(0 * scale, 12 * scale, 4 * scale, 2 * scale);
    ctx.fillRect(8 * scale, 11 * scale, 4 * scale, 2 * scale);
  } else if (frame === 1) {
    ctx.fillRect(2 * scale, 12 * scale, 4 * scale, 2 * scale);
    ctx.fillRect(6 * scale, 12 * scale, 4 * scale, 2 * scale);
  } else {
    ctx.fillRect(8 * scale, 12 * scale, 4 * scale, 2 * scale);
    ctx.fillRect(0 * scale, 11 * scale, 4 * scale, 2 * scale);
  }
}

function drawJumpSolario(ctx: CanvasRenderingContext2D, shirt: string, overalls: string, scale: number) {
  // Hat
  ctx.fillStyle = shirt;
  ctx.fillRect(3 * scale, 0, 7 * scale, 2 * scale);
  ctx.fillRect(2 * scale, 2 * scale, 10 * scale, 1.5 * scale);

  // Face
  ctx.fillStyle = COLORS.marioSkin;
  ctx.fillRect(3 * scale, 3.5 * scale, 8 * scale, 3 * scale);
  ctx.fillStyle = COLORS.marioBrownHair;
  ctx.fillRect(1 * scale, 3 * scale, 3 * scale, 3.5 * scale);
  ctx.fillRect(6 * scale, 4.5 * scale, 1.5 * scale, 1.5 * scale);
  ctx.fillRect(7 * scale, 5.5 * scale, 4 * scale, 1.5 * scale);

  // Torso & Raised Arm
  ctx.fillStyle = shirt;
  ctx.fillRect(1 * scale, 5 * scale, 3 * scale, 5 * scale);
  ctx.fillRect(8 * scale, 4 * scale, 3 * scale, 5 * scale); // raised arm
  ctx.fillStyle = overalls;
  ctx.fillRect(3 * scale, 8 * scale, 6 * scale, 4 * scale);

  // Splayed legs
  ctx.fillStyle = COLORS.marioBrownHair;
  ctx.fillRect(0 * scale, 11 * scale, 4 * scale, 2 * scale);
  ctx.fillRect(8 * scale, 12 * scale, 4 * scale, 2 * scale);
}

function drawDeadSolario(ctx: CanvasRenderingContext2D, shirt: string, overalls: string, scale: number) {
  ctx.fillStyle = shirt;
  ctx.fillRect(2 * scale, 2 * scale, 8 * scale, 3 * scale);
  ctx.fillStyle = COLORS.marioSkin;
  ctx.fillRect(3 * scale, 5 * scale, 6 * scale, 4 * scale);
  ctx.fillStyle = overalls;
  ctx.fillRect(2 * scale, 9 * scale, 8 * scale, 4 * scale);
  ctx.fillStyle = COLORS.marioBrownHair;
  ctx.fillRect(1 * scale, 13 * scale, 4 * scale, 2 * scale);
  ctx.fillRect(7 * scale, 13 * scale, 4 * scale, 2 * scale);
}

/**
 * Draws enemies (Goomba, Koopa, Piranha, Bowser)
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

  if (enemy.type === 'goomba') {
    drawGoomba(ctx, enemy, globalFrame);
  } else if (enemy.type === 'koopa') {
    drawKoopa(ctx, enemy, globalFrame);
  } else if (enemy.type === 'piranha') {
    drawPiranha(ctx, enemy, globalFrame);
  } else if (enemy.type === 'bowser') {
    drawBowser(ctx, enemy, globalFrame);
  }

  ctx.restore();
}

function drawGoomba(ctx: CanvasRenderingContext2D, enemy: Enemy, globalFrame: number) {
  if (enemy.state === 'squished') {
    // Squished flat Goomba
    ctx.fillStyle = COLORS.goombaBody;
    ctx.fillRect(2, 22, 28, 10);
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, 24, 6, 3);
    ctx.fillRect(20, 24, 6, 3);
    return;
  }

  // Mushroom-shaped Goomba head
  ctx.fillStyle = COLORS.goombaBody;
  ctx.beginPath();
  ctx.roundRect(4, 2, 24, 18, [8, 8, 2, 2]);
  ctx.fill();

  // Face stem
  ctx.fillStyle = '#FFDDAA';
  ctx.fillRect(8, 14, 16, 10);

  // Angry eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(9, 14, 5, 6);
  ctx.fillRect(18, 14, 5, 6);
  ctx.fillStyle = '#000000';
  ctx.fillRect(11, 15, 3, 5);
  ctx.fillRect(18, 15, 3, 5);

  // Walking feet cycle
  const foot = Math.floor(globalFrame / 10) % 2;
  ctx.fillStyle = COLORS.goombaFeet;
  if (foot === 0) {
    ctx.fillRect(2, 24, 11, 7);
    ctx.fillRect(19, 26, 10, 5);
  } else {
    ctx.fillRect(3, 26, 10, 5);
    ctx.fillRect(19, 24, 11, 7);
  }
}

function drawKoopa(ctx: CanvasRenderingContext2D, enemy: Enemy, globalFrame: number) {
  if (enemy.state === 'shell_idle' || enemy.state === 'shell_moving') {
    // Retracted Koopa Shell
    ctx.fillStyle = COLORS.koopaShellRed;
    ctx.beginPath();
    ctx.roundRect(4, 10, 24, 20, [10, 10, 4, 4]);
    ctx.fill();

    // Shell pattern
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8, 14, 16, 4);
    ctx.fillRect(10, 20, 12, 4);
    return;
  }

  // Walking Koopa Troopa
  // Head
  ctx.fillStyle = COLORS.koopaYellow;
  ctx.fillRect(14, 2, 12, 10);
  ctx.fillStyle = '#000000';
  ctx.fillRect(20, 4, 3, 4); // eye

  // Beak
  ctx.fillStyle = '#FFAA00';
  ctx.fillRect(22, 6, 6, 5);

  // Shell
  ctx.fillStyle = COLORS.koopaGreen;
  ctx.beginPath();
  ctx.roundRect(6, 10, 18, 16, [8, 4, 4, 6]);
  ctx.fill();

  // Feet
  const foot = Math.floor(globalFrame / 8) % 2;
  ctx.fillStyle = COLORS.koopaYellow;
  if (foot === 0) {
    ctx.fillRect(6, 26, 8, 6);
    ctx.fillRect(16, 28, 8, 4);
  } else {
    ctx.fillRect(6, 28, 8, 4);
    ctx.fillRect(16, 26, 8, 6);
  }
}

function drawPiranha(ctx: CanvasRenderingContext2D, enemy: Enemy, globalFrame: number) {
  // Snapping piranha plant inside pipe
  const snap = Math.floor(globalFrame / 8) % 2 === 0;

  // Stem
  ctx.fillStyle = '#00A800';
  ctx.fillRect(12, 16, 8, 16);

  // Leaves
  ctx.fillRect(6, 22, 6, 4);
  ctx.fillRect(20, 22, 6, 4);

  // Red head with white polka dots
  ctx.fillStyle = COLORS.piranhaRed;
  ctx.beginPath();
  ctx.roundRect(4, 2, 24, 18, 6);
  ctx.fill();

  // White polka dots
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(8, 5, 4, 4);
  ctx.fillRect(18, 4, 4, 4);
  ctx.fillRect(10, 14, 3, 3);

  // White teeth
  ctx.fillStyle = '#FFFFFF';
  if (snap) {
    ctx.fillRect(6, 9, 20, 4); // closed jaws
  } else {
    ctx.fillRect(6, 7, 5, 4);
    ctx.fillRect(15, 7, 5, 4);
    ctx.fillRect(8, 13, 5, 4);
    ctx.fillRect(17, 13, 5, 4);
  }
}

function drawBowser(ctx: CanvasRenderingContext2D, enemy: Enemy, globalFrame: number) {
  // Bowser: 48x48 pixel boss
  const breathe = Math.floor(globalFrame / 15) % 2 === 0;

  // Spiked green Shell
  ctx.fillStyle = COLORS.bowserGreen;
  ctx.beginPath();
  ctx.roundRect(4, 12, 28, 30, [14, 14, 6, 6]);
  ctx.fill();

  // Spikes on shell
  ctx.fillStyle = COLORS.bowserSpikes;
  ctx.fillRect(8, 8, 4, 6);
  ctx.fillRect(18, 6, 4, 6);
  ctx.fillRect(26, 10, 4, 6);

  // Orange horned Head
  ctx.fillStyle = COLORS.bowserOrange;
  ctx.fillRect(28, 8, 16, 20);

  // Red hair crest
  ctx.fillStyle = '#E52521';
  ctx.fillRect(26, 2, 14, 8);

  // Horns
  ctx.fillStyle = '#FFF8E0';
  ctx.fillRect(36, 0, 4, 6);

  // Eye
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(34, 12, 5, 5);
  ctx.fillStyle = '#E52521';
  ctx.fillRect(36, 13, 3, 3);

  // Snout & Fangs
  ctx.fillStyle = '#FCB000';
  ctx.fillRect(38, 16, 10, 10);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(40, 24, 3, 4);
  ctx.fillRect(45, 24, 3, 4);

  // Claws & Feet
  ctx.fillStyle = COLORS.bowserOrange;
  ctx.fillRect(8, 40, 14, 8);
  ctx.fillRect(26, 40, 14, 8);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(6, 44, 4, 4);
  ctx.fillRect(38, 44, 4, 4);

  // Fire breath glow
  if (breathe) {
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(48, 20, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws tiles and interactive environment blocks
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  theme: 'overworld' | 'underground' | 'sky' | 'castle',
  globalFrame: number,
  bumpOffsetY: number = 0
) {
  const drawY = y + bumpOffsetY;

  if (tile === 'empty') return;

  if (tile === 'ground') {
    if (theme === 'underground') {
      ctx.fillStyle = '#0050A0';
      ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#003060';
      ctx.fillRect(x + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    } else if (theme === 'castle') {
      ctx.fillStyle = '#505050';
      ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#383838';
      ctx.fillRect(x + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    } else {
      // Overworld classic
      ctx.fillStyle = COLORS.groundBrown;
      ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = COLORS.groundTopGreen;
      ctx.fillRect(x, drawY, TILE_SIZE, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 4, drawY + 12, 4, 4);
      ctx.fillRect(x + 20, drawY + 20, 4, 4);
    }
  } else if (tile === 'brick') {
    ctx.fillStyle = theme === 'underground' ? '#0060C0' : theme === 'castle' ? '#606060' : COLORS.brickBrown;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#000000';
    // Brick pattern lines
    ctx.fillRect(x, drawY + 7, TILE_SIZE, 2);
    ctx.fillRect(x, drawY + 15, TILE_SIZE, 2);
    ctx.fillRect(x, drawY + 23, TILE_SIZE, 2);
    ctx.fillRect(x + 15, drawY, 2, 7);
    ctx.fillRect(x + 8, drawY + 8, 2, 7);
    ctx.fillRect(x + 24, drawY + 8, 2, 7);
    ctx.fillRect(x + 15, drawY + 16, 2, 7);
  } else if (tile === 'question') {
    // Animated pulsing ? block with Solana shine
    ctx.fillStyle = COLORS.questionYellow;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    // 4 corner rivets
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 3, drawY + 3, 2, 2);
    ctx.fillRect(x + TILE_SIZE - 5, drawY + 3, 2, 2);
    ctx.fillRect(x + 3, drawY + TILE_SIZE - 5, 2, 2);
    ctx.fillRect(x + TILE_SIZE - 5, drawY + TILE_SIZE - 5, 2, 2);

    // Solana Green ? symbol
    ctx.fillStyle = COLORS.solanaGreen;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
  } else if (tile === 'metal') {
    // Empty spent block
    ctx.fillStyle = COLORS.metalGrey;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    // 4 corner dots
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 3, drawY + 3, 3, 3);
    ctx.fillRect(x + TILE_SIZE - 6, drawY + 3, 3, 3);
    ctx.fillRect(x + 3, drawY + TILE_SIZE - 6, 3, 3);
    ctx.fillRect(x + TILE_SIZE - 6, drawY + TILE_SIZE - 6, 3, 3);
  } else if (tile === 'pipe_tl') {
    ctx.fillStyle = COLORS.pipeGreenLight;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.pipeGreenDark;
    ctx.fillRect(x + 2, drawY + 2, 6, TILE_SIZE - 4);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, drawY, TILE_SIZE, TILE_SIZE);
  } else if (tile === 'pipe_tr') {
    ctx.fillStyle = COLORS.pipeGreenLight;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.pipeGreenDark;
    ctx.fillRect(x + TILE_SIZE - 8, drawY + 2, 6, TILE_SIZE - 4);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, drawY, TILE_SIZE, TILE_SIZE);
  } else if (tile === 'pipe_bl' || tile === 'pipe_br') {
    ctx.fillStyle = COLORS.pipeGreenLight;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, drawY, TILE_SIZE, TILE_SIZE);
  } else if (tile === 'springboard') {
    // Trampoline Springboard
    ctx.fillStyle = '#D03030';
    ctx.fillRect(x + 4, drawY + 20, 24, 12);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(x + 8, drawY + 10, 16, 10);
    ctx.fillStyle = '#E52521';
    ctx.fillRect(x + 2, drawY + 4, 28, 6);
  } else if (tile === 'lava') {
    // Bubbling castle lava
    const wave = Math.sin((globalFrame + x) * 0.1) * 3;
    ctx.fillStyle = COLORS.lavaRed;
    ctx.fillRect(x, drawY + 4 + wave, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = COLORS.lavaOrange;
    ctx.fillRect(x, drawY + wave, TILE_SIZE, 6);
  } else if (tile === 'bridge') {
    // Castle bridge made of wooden / chain links
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, drawY + 8, TILE_SIZE, 16);
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(x + 2, drawY + 10, TILE_SIZE - 4, 12);
  } else if (tile === 'axe') {
    // Golden Solana Axe to collapse Bowser's bridge!
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 12, drawY + 14, 8, 16); // handle
    ctx.fillStyle = COLORS.solanaGreen;
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', x + 16, drawY + 12);
  } else if (tile === 'flagpole_top') {
    ctx.fillStyle = '#00A800';
    ctx.beginPath();
    ctx.arc(x + 16, drawY + 16, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (tile === 'flagpole_pole') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 14, drawY, 4, TILE_SIZE);
  } else if (tile === 'flagpole_base') {
    ctx.fillStyle = '#00A800';
    ctx.fillRect(x + 4, drawY + 16, 24, 16);
  } else if (tile === 'castle_brick') {
    ctx.fillStyle = COLORS.castleBrick;
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, drawY, TILE_SIZE, TILE_SIZE);
  } else if (tile === 'castle_door') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, drawY, TILE_SIZE, TILE_SIZE);
  }
}

/**
 * Draws powerup items (Super Mushroom, Fire Flower, Star, 1-Up)
 */
export function drawPowerUp(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, globalFrame: number) {
  if (type === 'mushroom' || type === '1up') {
    // Solana Super Mushroom (Purple/Green cap) or 1-Up (Green cap)
    const capColor = type === '1up' ? COLORS.solanaGreen : COLORS.solanaPurple;
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.arc(x + 12, y + 10, 10, Math.PI, 0, false);
    ctx.fill();

    // White polka dots
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, y + 6, 3, 3);
    ctx.fillRect(x + 15, y + 6, 3, 3);

    // Stem
    ctx.fillStyle = '#FFF8E0';
    ctx.fillRect(x + 6, y + 10, 12, 10);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, y + 12, 2, 4);
    ctx.fillRect(x + 14, y + 12, 2, 4);
  } else if (type === 'flower') {
    // Fire Flower
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(x + 12, y + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x + 12, y + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00D800';
    ctx.fillRect(x + 10, y + 14, 4, 8);
  } else if (type === 'star') {
    // Rainbow Starman
    const starColor = COLORS.starColors[Math.floor(globalFrame / 4) % COLORS.starColors.length];
    ctx.fillStyle = starColor;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 9, y + 9, 2, 4);
    ctx.fillRect(x + 13, y + 9, 2, 4);
  }
}

/**
 * Draws floating rotating $SOL Coin
 */
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, globalFrame: number) {
  const widthFactor = Math.abs(Math.cos(globalFrame * 0.12));
  const w = Math.max(4, 16 * widthFactor);

  ctx.fillStyle = COLORS.coinGold;
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 12, w / 2, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.solanaGreen;
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (w > 8) {
    ctx.fillText('$', x + 12, y + 12);
  }
}

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Player, 
  LevelConfig, 
  PowerUpItemEntity, 
  FireballEntity, 
  BowserFireball,
  ScorePopup, 
  Particle,
  StakingPerks
} from '@/lib/mario/types';
import { 
  createWorld1_1, 
  createWorld1_2, 
  createWorld1_3, 
  createWorld1_4,
  createAiGeneratedLevel 
} from '@/lib/mario/levels';
import { 
  drawPlayer, 
  drawEnemy, 
  drawTile, 
  drawPowerUp, 
  drawCoin, 
  TILE_SIZE 
} from '@/lib/mario/sprites';
import { updateGamePhysics } from '@/lib/mario/physics';
import { computeAiAgentAction, AiTelemetry, getOrCreateAiAgentKeypair } from '@/lib/mario/ai-agent';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  executeSpeedrunAttestation, 
  saveLeaderboardEntry 
} from '@/lib/solana/transactions';
import { getOrCreateBurnerWallet } from '@/lib/solana/burner-wallet';
import { 
  Bot, 
  Sparkles, 
  RotateCcw, 
  ExternalLink, 
  Trophy, 
  Play, 
  Pause, 
  Tv, 
  Zap, 
  Flame, 
  Gamepad2, 
  ArrowRight,
  ShieldAlert,
  Coins
} from 'lucide-react';

interface MarioGameProps {
  onCoinCollected: (amount: number) => void;
  stakingPerks: StakingPerks;
  activeSkin: 'classic' | 'fire' | 'gold' | 'shadow';
  customLevelPrompt?: string;
  onTxConfirmed?: (sig: string) => void;
}

export default function MarioGame({
  onCoinCollected,
  stakingPerks,
  activeSkin,
  customLevelPrompt,
  onTxConfirmed,
}: MarioGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game State
  const [currentWorldId, setCurrentWorldId] = useState<string>('1-1');
  const [level, setLevel] = useState<LevelConfig>(createWorld1_1);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isAiAutopilot, setIsAiAutopilot] = useState<boolean>(false);
  const [aiTelemetry, setAiTelemetry] = useState<AiTelemetry | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasCrtEffect, setHasCrtEffect] = useState<boolean>(true);

  // Modals
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [isAttesting, setIsAttesting] = useState<boolean>(false);
  const [attestationSig, setAttestationSig] = useState<string | null>(null);
  const [runStats, setRunStats] = useState<{ time: number; coins: number; score: number } | null>(null);

  // Mutable Game References for 60fps Loop
  const gameStateRef = useRef<{
    player: Player;
    level: LevelConfig;
    powerUps: PowerUpItemEntity[];
    fireballs: FireballEntity[];
    bowserFireballs: BowserFireball[];
    scorePopups: ScorePopup[];
    particles: Particle[];
    viewportX: number;
    globalFrame: number;
    startTime: number;
    elapsedTime: number;
    keys: { left: boolean; right: boolean; jump: boolean; sprint: boolean; fire: boolean };
  }>({
    player: {
      x: 3 * TILE_SIZE,
      y: 11 * TILE_SIZE,
      vx: 0,
      vy: 0,
      w: 24,
      h: 24,
      powerUp: 'small',
      grounded: true,
      facingLeft: false,
      invincibleTimer: 0,
      starTimer: 0,
      isDying: false,
      deathTimer: 0,
      flagpoleSliding: false,
      flagpoleY: 0,
      walkFrame: 0,
      walkCounter: 0,
    },
    level: createWorld1_1(),
    powerUps: [],
    fireballs: [],
    bowserFireballs: [],
    scorePopups: [],
    particles: [],
    viewportX: 0,
    globalFrame: 0,
    startTime: 0,
    elapsedTime: 0,
    keys: { left: false, right: false, jump: false, sprint: false, fire: false },
  });

  // Switch or reload level
  const loadLevel = useCallback((world: string, customPrompt?: string) => {
    let newLvl: LevelConfig;
    if (world === '1-1') newLvl = createWorld1_1();
    else if (world === '1-2') newLvl = createWorld1_2();
    else if (world === '1-3') newLvl = createWorld1_3();
    else if (world === '1-4') newLvl = createWorld1_4();
    else newLvl = createAiGeneratedLevel(customPrompt || 'hardcore sky trampolines with lots of coins');

    setLevel(newLvl);
    setCurrentWorldId(world);
    setTimeLeft(newLvl.timeLimit);
    setShowClearModal(false);
    setShowGameOverModal(false);
    setAttestationSig(null);

    // Reset player position and physics
    const gs = gameStateRef.current;
    gs.level = newLvl;
    gs.player.x = newLvl.playerStartX;
    gs.player.y = newLvl.playerStartY;
    gs.player.vx = 0;
    gs.player.vy = 0;
    gs.player.isDying = false;
    gs.player.flagpoleSliding = false;
    gs.player.powerUp = activeSkin === 'fire' ? 'fire' : 'small';
    gs.player.h = gs.player.powerUp === 'small' ? 24 : 32;
    gs.powerUps = [];
    gs.fireballs = [];
    gs.bowserFireballs = [];
    gs.scorePopups = [];
    gs.particles = [];
    gs.viewportX = 0;
    gs.startTime = Date.now();
    gs.elapsedTime = 0;

    sounds.stopBGM();
    sounds.startBGM(newLvl.musicTheme);
  }, [activeSkin]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') gs.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') gs.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') gs.keys.jump = true;
      if (e.key === 'Shift') gs.keys.sprint = true;
      if (e.key === 'x' || e.key === 'X' || e.key === 'f' || e.key === 'F') {
        gs.keys.fire = true;
        // Shoot fireball if Fire Mario
        if (gs.player.powerUp === 'fire' && gs.fireballs.length < 3) {
          sounds.playFireball();
          gs.fireballs.push({
            id: `fb_${Date.now()}`,
            x: gs.player.facingLeft ? gs.player.x - 8 : gs.player.x + gs.player.w + 2,
            y: gs.player.y + 8,
            vx: gs.player.facingLeft ? -7 : 7,
            vy: 2,
            w: 12,
            h: 12,
            bounces: 0,
            active: true,
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const gs = gameStateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') gs.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') gs.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') gs.keys.jump = false;
      if (e.key === 'Shift') gs.keys.sprint = false;
      if (e.key === 'x' || e.key === 'X' || e.key === 'f' || e.key === 'F') gs.keys.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    if (gameStateRef.current.startTime === 0) {
      gameStateRef.current.startTime = Date.now();
    }
    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      const gs = gameStateRef.current;
      if (isPaused || showClearModal || showGameOverModal) return;

      gs.globalFrame++;

      // Compute AI input if Autopilot enabled
      if (isAiAutopilot) {
        const aiOutput = computeAiAgentAction(gs.player, gs.level, gs.globalFrame);
        gs.keys = aiOutput.keys;
        setAiTelemetry(aiOutput.telemetry);

        if (gs.keys.fire && gs.player.powerUp === 'fire' && gs.fireballs.length < 3) {
          sounds.playFireball();
          gs.fireballs.push({
            id: `fb_ai_${Date.now()}`,
            x: gs.player.facingLeft ? gs.player.x - 8 : gs.player.x + gs.player.w + 2,
            y: gs.player.y + 8,
            vx: gs.player.facingLeft ? -7 : 7,
            vy: 2,
            w: 12,
            h: 12,
            bounces: 0,
            active: true,
          });
        }
      }

      // Physics tick
      const out = updateGamePhysics(
        gs.player,
        gs.level,
        gs.keys,
        gs.powerUps,
        gs.fireballs,
        gs.bowserFireballs,
        gs.scorePopups,
        gs.particles,
        stakingPerks,
        gs.globalFrame
      );

      // Handle Coins & Score
      if (out.coinsGained > 0) {
        let coinBonus = out.coinsGained;
        if (stakingPerks.coinBonusPercent > 0) {
          coinBonus = Math.round(coinBonus * (1 + stakingPerks.coinBonusPercent / 100));
        }
        setCoins(c => c + coinBonus);
        onCoinCollected(coinBonus);
      }

      if (out.scoreGained > 0) {
        setScore(s => s + out.scoreGained);
      }

      // Level Cleared!
      if (out.levelCleared) {
        const elapsedSec = Math.max(1, (Date.now() - gs.startTime) / 1000);
        setRunStats({
          time: elapsedSec,
          coins: coins + out.coinsGained,
          score: score + out.scoreGained,
        });
        setShowClearModal(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14F195', '#9945FF', '#FFD700', '#E52521'],
        });
        return;
      }

      // Player Died
      if (out.playerDied) {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) {
            setShowGameOverModal(true);
          } else {
            // Respawn in same level
            loadLevel(currentWorldId);
          }
          return next;
        });
        return;
      }

      // Smooth horizontal camera tracking
      const targetViewportX = gs.player.x - canvas.width * 0.38;
      gs.viewportX += (targetViewportX - gs.viewportX) * 0.12;
      if (gs.viewportX < 0) gs.viewportX = 0;
      const maxViewportX = gs.level.widthTiles * TILE_SIZE - canvas.width;
      if (gs.viewportX > maxViewportX) gs.viewportX = maxViewportX;

      // Render Frame
      renderGameFrame(ctx, canvas, gs, activeSkin);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, showClearModal, showGameOverModal, isAiAutopilot, stakingPerks, activeSkin, coins, score, currentWorldId, loadLevel, onCoinCollected]);

  // Renderer function
  const renderGameFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gs: typeof gameStateRef.current,
    skin: 'classic' | 'fire' | 'gold' | 'shadow'
  ) => {
    // 1. Background Fill
    ctx.fillStyle = gs.level.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative background clouds / mountains if overworld or sky
    if (gs.level.theme === 'overworld' || gs.level.theme === 'sky') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 8; i++) {
        const cloudX = (i * 240 - gs.viewportX * 0.3) % (canvas.width + 200) - 100;
        ctx.beginPath();
        ctx.arc(cloudX, 70, 24, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 60, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 55, 70, 22, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Render Tiles
    const startTileX = Math.max(0, Math.floor(gs.viewportX / TILE_SIZE));
    const endTileX = Math.min(gs.level.widthTiles, Math.ceil((gs.viewportX + canvas.width) / TILE_SIZE));

    for (let ty = 0; ty < gs.level.heightTiles; ty++) {
      for (let tx = startTileX; tx < endTileX; tx++) {
        const tile = gs.level.mapGrid[ty][tx];
        if (tile && tile.type !== 'empty') {
          drawTile(
            ctx,
            tile.type,
            tx * TILE_SIZE - Math.round(gs.viewportX),
            ty * TILE_SIZE,
            gs.level.theme,
            gs.globalFrame,
            tile.bumpOffsetY
          );
        }
      }
    }

    // 3. Render PowerUps
    for (const p of gs.powerUps) {
      drawPowerUp(
        ctx,
        p.type,
        Math.round(p.x - gs.viewportX),
        Math.round(p.y),
        gs.globalFrame
      );
    }

    // 4. Render Enemies
    for (const enemy of gs.level.enemies) {
      if (enemy.state === 'dead') continue;
      // Only render if within viewport bounds
      if (enemy.x >= gs.viewportX - 60 && enemy.x <= gs.viewportX + canvas.width + 60) {
        drawEnemy(ctx, enemy, gs.viewportX, gs.globalFrame);
      }
    }

    // 5. Render Fireballs
    for (const fb of gs.fireballs) {
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(fb.x - gs.viewportX + 6, fb.y + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(fb.x - gs.viewportX + 6, fb.y + 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Render Particles
    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const part = gs.particles[i];
      part.vy += part.gravity || 0.3;
      part.x += part.vx;
      part.y += part.vy;
      part.life--;

      ctx.fillStyle = part.color;
      ctx.fillRect(part.x - gs.viewportX, part.y, part.size, part.size);

      if (part.life <= 0) {
        gs.particles.splice(i, 1);
      }
    }

    // 7. Render Player (Solario)
    drawPlayer(ctx, gs.player, gs.viewportX, gs.globalFrame, skin);

    // 8. Render AI Autopilot Visual Path Indicator
    if (isAiAutopilot) {
      ctx.save();
      ctx.strokeStyle = '#14F195';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(gs.player.x - gs.viewportX + gs.player.w / 2, gs.player.y + gs.player.h / 2);
      ctx.lineTo(
        gs.player.x - gs.viewportX + gs.player.w / 2 + 120,
        gs.player.y + gs.player.h / 2 - 10
      );
      ctx.stroke();

      // AI Target reticle
      ctx.fillStyle = '#14F195';
      ctx.beginPath();
      ctx.arc(
        gs.player.x - gs.viewportX + gs.player.w / 2 + 120,
        gs.player.y + gs.player.h / 2 - 10,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }
  };

  // Attest Run to Solana Devnet
  const handleAttestRun = async () => {
    if (!runStats || isAttesting) return;
    setIsAttesting(true);

    try {
      let keypair;
      if (isAiAutopilot) {
        keypair = getOrCreateAiAgentKeypair();
      } else {
        const w = getOrCreateBurnerWallet();
        keypair = w.keypair;
      }

      const sig = await executeSpeedrunAttestation(
        keypair,
        currentWorldId,
        runStats.time,
        runStats.coins,
        runStats.score,
        isAiAutopilot
      );

      setAttestationSig(sig);
      if (onTxConfirmed) onTxConfirmed(sig);
      sounds.playCoin();
    } catch (err) {
      console.error('Speedrun attestation failed:', err);
    } finally {
      setIsAttesting(false);
    }
  };

  // On-screen touch buttons helper
  const handleTouchControl = (key: 'left' | 'right' | 'jump' | 'fire' | 'sprint', pressed: boolean) => {
    const gs = gameStateRef.current;
    gs.keys[key] = pressed;
    if (key === 'jump' && pressed && gs.player.grounded) {
      sounds.playJump(gs.player.powerUp !== 'small');
    }
    if (key === 'fire' && pressed && gs.player.powerUp === 'fire' && gs.fireballs.length < 3) {
      sounds.playFireball();
      gs.fireballs.push({
        id: `fb_touch_${Date.now()}`,
        x: gs.player.facingLeft ? gs.player.x - 8 : gs.player.x + gs.player.w + 2,
        y: gs.player.y + 8,
        vx: gs.player.facingLeft ? -7 : 7,
        vy: 2,
        w: 12,
        h: 12,
        bounces: 0,
        active: true,
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Retro Arcade Cabinet Frame */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-4 border-zinc-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Top Header Display / Arcade Marquee */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-zinc-950/80 border border-zinc-800/80 px-4 py-2.5 rounded-xl font-mono text-xs text-white">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Player</div>
              <div className="font-black text-amber-400 tracking-wider">SOLARIO</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Score</div>
              <div className="font-bold text-white tracking-widest">{score.toString().padStart(6, '0')}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">$COIN</div>
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>x{coins.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">World</div>
              <div className="font-black text-emerald-400 tracking-wider">{currentWorldId}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Lives</div>
              <div className="font-bold text-red-400">{'❤️'.repeat(lives)}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Buffs</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300">
                {stakingPerks.coinMagnet && <span title="Coin Magnet">🧲</span>}
                {stakingPerks.superJump && <span title="Super Jump">🚀</span>}
                {stakingPerks.coinBonusPercent > 0 && <span title="Coin Yield">+{stakingPerks.coinBonusPercent}%</span>}
                {!stakingPerks.coinMagnet && !stakingPerks.superJump && <span className="text-zinc-600">None</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Game Area with CRT scanline effect */}
        <div className="relative w-full aspect-[800/480] bg-black rounded-xl overflow-hidden border-2 border-zinc-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={800}
            height={480}
            className="w-full h-full block"
          />

          {/* CRT Scanline Shader Overlay */}
          {hasCrtEffect && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)] opacity-80">
              <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
            </div>
          )}

          {/* AI Autopilot Live Telemetry HUD Overlay */}
          {isAiAutopilot && aiTelemetry && (
            <div className="absolute top-3 left-3 bg-zinc-950/90 border border-emerald-500/50 backdrop-blur-md px-3 py-2 rounded-lg font-mono text-[11px] shadow-lg max-w-sm pointer-events-none z-10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
                <span>TOAD AI AUTONOMOUS COPILOT</span>
                <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.2 rounded text-emerald-300">
                  {Math.round(aiTelemetry.confidence * 100)}% Conf
                </span>
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Action:</span>{' '}
                <span className="font-semibold text-amber-300">{aiTelemetry.action}</span>
              </div>
              <div className="text-zinc-400 text-[10px] line-clamp-1">
                {aiTelemetry.reason}
              </div>
            </div>
          )}
        </div>

        {/* Level Selector Toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-zinc-950/70 border border-zinc-800 p-2 rounded-xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-500 px-2">Levels:</span>
            <button
              onClick={() => loadLevel('1-1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                currentWorldId === '1-1' 
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20' 
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              1-1 Genesis
            </button>
            <button
              onClick={() => loadLevel('1-2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                currentWorldId === '1-2' 
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20' 
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              1-2 Mempool
            </button>
            <button
              onClick={() => loadLevel('1-3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                currentWorldId === '1-3' 
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20' 
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              1-3 Skyway
            </button>
            <button
              onClick={() => loadLevel('1-4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                currentWorldId === '1-4' 
                  ? 'bg-red-500 text-zinc-950 shadow-md shadow-red-500/20' 
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              1-4 Bear Castle
            </button>
            <button
              onClick={() => loadLevel('AI-GEN', customLevelPrompt)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                currentWorldId === 'AI-GEN' 
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-zinc-900 text-purple-300 hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Matrix</span>
            </button>
          </div>

          {/* Action Toggles */}
          <div className="flex items-center gap-2">
            {/* AI Autopilot Toggle */}
            <button
              onClick={() => setIsAiAutopilot(!isAiAutopilot)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                isAiAutopilot 
                  ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/30' 
                  : 'bg-zinc-900 border border-emerald-500/40 text-emerald-400 hover:bg-zinc-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>{isAiAutopilot ? 'AI Autopilot: ON' : 'AI Autopilot: OFF'}</span>
            </button>

            {/* CRT Effect Toggle */}
            <button
              onClick={() => setHasCrtEffect(!hasCrtEffect)}
              title="Toggle retro CRT scanlines"
              className={`p-2 rounded-lg text-xs font-mono transition ${
                hasCrtEffect ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Restart Level */}
            <button
              onClick={() => loadLevel(currentWorldId)}
              title="Restart Level"
              className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* On-Screen Touch / Gamepad Controls (Mobile & Tablet Friendly) */}
        <div className="mt-4 grid grid-cols-2 gap-4 select-none sm:hidden">
          {/* D-Pad Left/Right */}
          <div className="flex items-center gap-2">
            <button
              onTouchStart={() => handleTouchControl('left', true)}
              onTouchEnd={() => handleTouchControl('left', false)}
              onMouseDown={() => handleTouchControl('left', true)}
              onMouseUp={() => handleTouchControl('left', false)}
              className="w-14 h-14 bg-zinc-800 active:bg-zinc-700 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleTouchControl('right', true)}
              onTouchEnd={() => handleTouchControl('right', false)}
              onMouseDown={() => handleTouchControl('right', true)}
              onMouseUp={() => handleTouchControl('right', false)}
              className="w-14 h-14 bg-zinc-800 active:bg-zinc-700 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md"
            >
              ▶
            </button>
          </div>

          {/* Action Buttons: A (Jump) and B (Run/Fire) */}
          <div className="flex items-center justify-end gap-3">
            <button
              onTouchStart={() => handleTouchControl('fire', true)}
              onTouchEnd={() => handleTouchControl('fire', false)}
              onMouseDown={() => handleTouchControl('fire', true)}
              onMouseUp={() => handleTouchControl('fire', false)}
              className="w-14 h-14 bg-red-600 active:bg-red-500 rounded-full flex flex-col items-center justify-center text-xs font-black text-white shadow-md"
            >
              <span>B</span>
              <span className="text-[9px] opacity-80">FIRE</span>
            </button>
            <button
              onTouchStart={() => handleTouchControl('jump', true)}
              onTouchEnd={() => handleTouchControl('jump', false)}
              onMouseDown={() => handleTouchControl('jump', true)}
              onMouseUp={() => handleTouchControl('jump', false)}
              className="w-14 h-14 bg-emerald-600 active:bg-emerald-500 rounded-full flex flex-col items-center justify-center text-xs font-black text-white shadow-md"
            >
              <span>A</span>
              <span className="text-[9px] opacity-80">JUMP</span>
            </button>
          </div>
        </div>

        {/* Keyboard Instructions Bar */}
        <div className="hidden sm:flex items-center justify-between mt-3 text-[11px] font-mono text-zinc-500 border-t border-zinc-900 pt-2 px-1">
          <div>
            <span className="text-zinc-400 font-bold">[Arrow Keys / WASD]</span> Move & Jump •{' '}
            <span className="text-zinc-400 font-bold">[Shift]</span> Sprint •{' '}
            <span className="text-zinc-400 font-bold">[X]</span> Fireball
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400/80">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Gamepad & Touch Supported</span>
          </div>
        </div>
      </div>

      {/* Stage Clear Modal */}
      {showClearModal && runStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-emerald-500 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full mx-auto flex items-center justify-center text-3xl mb-3">
              🏆
            </div>
            <h2 className="text-2xl font-black font-mono text-white tracking-wide">
              STAGE CLEAR!
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              {isAiAutopilot ? 'Autonomous AI Toad completed the speedrun' : 'You completed the speedrun successfully'}!
            </p>

            {/* Run Stats */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-xl my-4 text-left font-mono">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Clear Time</div>
                <div className="text-sm font-bold text-white">{runStats.time.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">$COINs</div>
                <div className="text-sm font-bold text-amber-400">+{runStats.coins}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Score</div>
                <div className="text-sm font-bold text-emerald-400">{runStats.score}</div>
              </div>
            </div>

            {/* Solana Attestation */}
            {attestationSig ? (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl text-left font-mono mb-4">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span>✓ Attested to Solana Devnet</span>
                </div>
                <a
                  href={`https://solscan.io/tx/${attestationSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 underline break-all"
                >
                  <span>{attestationSig.slice(0, 16)}...{attestationSig.slice(-16)}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            ) : (
              <button
                onClick={handleAttestRun}
                disabled={isAttesting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black py-3 rounded-xl font-mono text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isAttesting ? 'animate-spin' : ''}`} />
                <span>{isAttesting ? 'Publishing to Solana...' : 'Attest Run on Solana Devnet'}</span>
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const nextWorld = currentWorldId === '1-1' ? '1-2' : currentWorldId === '1-2' ? '1-3' : currentWorldId === '1-3' ? '1-4' : '1-1';
                  loadLevel(nextWorld);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold py-2.5 rounded-xl transition"
              >
                Next Level →
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-mono text-xs py-2.5 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-500/60 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="text-4xl mb-2">💀</div>
            <h2 className="text-2xl font-black font-mono text-white tracking-widest text-red-500">
              GAME OVER
            </h2>
            <p className="text-xs font-mono text-zinc-400 my-3">
              Solario ran out of lives in the Solana mempool!
            </p>
            <button
              onClick={() => {
                setLives(3);
                loadLevel(currentWorldId);
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl font-mono text-sm transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Continue (3 Lives)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Player, 
  LevelConfig, 
  PowerUpItemEntity, 
  PoppingShardEntity,
  PlasmaBoltEntity, 
  TitanPlasmaWave,
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
  drawShard,
  drawPoppingShard,
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
  Tv, 
  Zap, 
  Flame, 
  Gamepad2, 
  Coins,
  BookOpen,
  Rocket,
  ShieldAlert
} from 'lucide-react';
import HowToPlayModal from '@/components/demo/HowToPlayModal';
import DevnetDeployModal from '@/components/beginner/DevnetDeployModal';

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
  const [shards, setShards] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isAiAutopilot, setIsAiAutopilot] = useState<boolean>(false);
  const [aiTelemetry, setAiTelemetry] = useState<AiTelemetry | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasCrtEffect, setHasCrtEffect] = useState<boolean>(true);

  // Modals & Guides
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [isAttesting, setIsAttesting] = useState<boolean>(false);
  const [attestationSig, setAttestationSig] = useState<string | null>(null);
  const [runStats, setRunStats] = useState<{ time: number; shards: number; score: number } | null>(null);

  // Mutable Game References for 60fps Loop
  const gameStateRef = useRef<{
    player: Player;
    level: LevelConfig;
    powerUps: PowerUpItemEntity[];
    poppingShards: PoppingShardEntity[];
    plasmaBolts: PlasmaBoltEntity[];
    titanWaves: TitanPlasmaWave[];
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
      powerUp: 'standard',
      grounded: true,
      facingLeft: false,
      invincibleTimer: 0,
      hyperTimer: 0,
      isDying: false,
      deathTimer: 0,
      uplinkSliding: false,
      uplinkY: 0,
      walkFrame: 0,
      walkCounter: 0,
    },
    level: createWorld1_1(),
    powerUps: [],
    poppingShards: [],
    plasmaBolts: [],
    titanWaves: [],
    scorePopups: [],
    particles: [],
    viewportX: 0,
    globalFrame: 0,
    startTime: 0,
    elapsedTime: 0,
    keys: { left: false, right: false, jump: false, sprint: false, fire: false },
  });

  const loadLevel = useCallback((world: string, customPrompt?: string) => {
    let newLvl: LevelConfig;
    if (world === '1-1') newLvl = createWorld1_1();
    else if (world === '1-2') newLvl = createWorld1_2();
    else if (world === '1-3') newLvl = createWorld1_3();
    else if (world === '1-4') newLvl = createWorld1_4();
    else newLvl = createAiGeneratedLevel(customPrompt || 'high tech sky trampolines with lots of shards');

    setLevel(newLvl);
    setCurrentWorldId(world);
    setTimeLeft(newLvl.timeLimit);
    setShowClearModal(false);
    setShowGameOverModal(false);
    setAttestationSig(null);

    const gs = gameStateRef.current;
    gs.level = newLvl;
    gs.player.x = newLvl.playerStartX;
    gs.player.y = newLvl.playerStartY;
    gs.player.vx = 0;
    gs.player.vy = 0;
    gs.player.isDying = false;
    gs.player.uplinkSliding = false;
    gs.player.powerUp = activeSkin === 'fire' ? 'plasma' : 'standard';
    gs.player.h = gs.player.powerUp === 'standard' ? 24 : 32;
    gs.powerUps = [];
    gs.poppingShards = [];
    gs.plasmaBolts = [];
    gs.titanWaves = [];
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
        if (gs.player.powerUp === 'plasma' && gs.plasmaBolts.length < 3) {
          sounds.playFireball();
          gs.plasmaBolts.push({
            id: `pb_${Date.now()}`,
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

      if (isAiAutopilot) {
        const aiOutput = computeAiAgentAction(gs.player, gs.level, gs.globalFrame);
        gs.keys = aiOutput.keys;
        setAiTelemetry(aiOutput.telemetry);

        if (gs.keys.fire && gs.player.powerUp === 'plasma' && gs.plasmaBolts.length < 3) {
          sounds.playFireball();
          gs.plasmaBolts.push({
            id: `pb_ai_${Date.now()}`,
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

      if (isPracticeMode) {
        gs.player.invincibleTimer = 60;
      }

      // Thruster Exhaust & Dash Spark Emitter
      if (!gs.player.grounded && gs.globalFrame % 3 === 0) {
        gs.particles.push({
          x: gs.player.facingLeft ? gs.player.x + gs.player.w - 4 : gs.player.x + 4,
          y: gs.player.y + gs.player.h,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2 + Math.random() * 2,
          color: '#00FFFF',
          size: 3,
          life: 12,
          maxLife: 12,
          gravity: 0.1,
        });
      } else if (Math.abs(gs.player.vx) > 3 && gs.globalFrame % 4 === 0) {
        gs.particles.push({
          x: gs.player.facingLeft ? gs.player.x + gs.player.w : gs.player.x,
          y: gs.player.y + gs.player.h - 2,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2,
          color: '#14F195',
          size: 2,
          life: 10,
          maxLife: 10,
          gravity: 0.2,
        });
      }

      const out = updateGamePhysics(
        gs.player,
        gs.level,
        gs.keys,
        gs.powerUps,
        gs.poppingShards,
        gs.plasmaBolts,
        gs.titanWaves,
        gs.scorePopups,
        gs.particles,
        stakingPerks,
        gs.globalFrame
      );

      if (out.shardsGained > 0) {
        let bonus = out.shardsGained;
        if (stakingPerks.shardBonusPercent > 0) {
          bonus = Math.round(bonus * (1 + stakingPerks.shardBonusPercent / 100));
        }
        setShards(c => c + bonus);
        onCoinCollected(bonus);
      }

      if (out.scoreGained > 0) {
        setScore(s => s + out.scoreGained);
      }

      if (out.levelCleared) {
        const elapsedSec = Math.max(1, (Date.now() - gs.startTime) / 1000);
        setRunStats({
          time: elapsedSec,
          shards: shards + out.shardsGained,
          score: score + out.scoreGained,
        });
        setShowClearModal(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14F195', '#00FFFF', '#9945FF', '#F59E0B'],
        });
        return;
      }

      if (out.playerDied) {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) {
            setShowGameOverModal(true);
          } else {
            loadLevel(currentWorldId);
          }
          return next;
        });
        return;
      }

      // Smooth horizontal camera
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
  }, [isPaused, showClearModal, showGameOverModal, isAiAutopilot, stakingPerks, activeSkin, shards, score, currentWorldId, loadLevel, onCoinCollected]);

  const renderGameFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gs: typeof gameStateRef.current,
    skin: 'classic' | 'fire' | 'gold' | 'shadow'
  ) => {
    // 1. Background Fill & Parallax Biome Skyline
    ctx.fillStyle = gs.level.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const px = Math.round(gs.viewportX * 0.25) % 600;

    if (gs.level.theme === 'cyber_city') {
      // Cyber City Skyline Silhouettes
      ctx.fillStyle = '#060814';
      for (let i = -1; i < 5; i++) {
        const bx = i * 200 - px;
        ctx.fillRect(bx, 130, 65, 350);
        ctx.fillRect(bx + 75, 80, 55, 400);
        ctx.fillRect(bx + 140, 160, 45, 320);

        // Glowing neon windows
        ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
        for (let wy = 110; wy < 380; wy += 26) {
          ctx.fillRect(bx + 85, wy, 3, 5);
          ctx.fillRect(bx + 105, wy, 3, 5);
          ctx.fillRect(bx + 15, wy + 35, 3, 5);
        }
        ctx.fillStyle = '#060814';
      }

      // Sweeping searchlight beam across cyber sky
      const beamAngle = Math.sin(gs.globalFrame * 0.02) * 0.35;
      ctx.save();
      ctx.fillStyle = 'rgba(20, 241, 149, 0.04)';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height);
      ctx.lineTo(canvas.width / 2 + Math.tan(beamAngle - 0.12) * 480, 0);
      ctx.lineTo(canvas.width / 2 + Math.tan(beamAngle + 0.12) * 480, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (gs.level.theme === 'mempool_cavern') {
      // Stalactites and deep mempool data conduits
      ctx.fillStyle = '#05070D';
      for (let i = -1; i < 5; i++) {
        const cx = i * 180 - px;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 35, 100);
        ctx.lineTo(cx + 70, 0);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(153, 69, 255, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 70);
      ctx.bezierCurveTo(250, 140, 500, 30, 800, 100);
      ctx.stroke();
    } else if (gs.level.theme === 'sky_uplink') {
      // Glowing high-altitude solar clouds
      ctx.fillStyle = 'rgba(34, 211, 238, 0.09)';
      for (let i = -1; i < 4; i++) {
        const cx = i * 260 - px;
        ctx.beginPath();
        ctx.arc(cx + 50, 100, 40, 0, Math.PI * 2);
        ctx.arc(cx + 100, 90, 55, 0, Math.PI * 2);
        ctx.arc(cx + 160, 100, 40, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (gs.level.theme === 'titan_citadel') {
      // Heavy dreadnought fortress pillars & alarm beacons
      ctx.fillStyle = '#09090B';
      for (let i = -1; i < 5; i++) {
        const ix = i * 180 - px;
        ctx.fillRect(ix, 0, 40, 480);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(ix + 16, 50, 8, 16);
        ctx.fillStyle = '#09090B';
      }
    }

    // Perspective Cyber-Grid Lines
    ctx.strokeStyle = 'rgba(20, 241, 149, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // 2. Render Tiles (with smooth bump offsets)
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

    // 3. Render Popping Shards
    for (const pop of gs.poppingShards) {
      drawPoppingShard(ctx, pop, gs.viewportX);
    }

    // 4. Render PowerUps
    for (const p of gs.powerUps) {
      drawPowerUp(
        ctx,
        p.type,
        Math.round(p.x - gs.viewportX),
        Math.round(p.y),
        gs.globalFrame
      );
    }

    // 5. Render Enemies
    for (const enemy of gs.level.enemies) {
      if (enemy.state === 'terminated') continue;
      if (enemy.x >= gs.viewportX - 60 && enemy.x <= gs.viewportX + canvas.width + 60) {
        drawEnemy(ctx, enemy, gs.viewportX, gs.globalFrame);
      }
    }

    // 6. Render Plasma Bolts
    for (const pb of gs.plasmaBolts) {
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(pb.x - gs.viewportX + 6, pb.y + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pb.x - gs.viewportX + 6, pb.y + 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6b. Render Titan Plasma Waves
    for (const tw of gs.titanWaves) {
      if (!tw.active) continue;
      const twX = Math.round(tw.x - gs.viewportX);
      const twY = Math.round(tw.y);

      // Outer plasma flame wave
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(twX + 10, twY + 8, 10, 0, Math.PI * 2);
      ctx.fill();

      // Inner heat core
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(twX + 10, twY + 8, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(twX + 10, twY + 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6c. Render Floating Score Popups
    for (let i = gs.scorePopups.length - 1; i >= 0; i--) {
      const sp = gs.scorePopups[i];
      sp.y += sp.vy;
      sp.opacity -= 0.025;

      if (sp.opacity <= 0) {
        gs.scorePopups.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(20, 241, 149, ${Math.max(0, sp.opacity)})`;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sp.text, sp.x - gs.viewportX, sp.y);
      ctx.restore();
    }

    // 7. Render Particles
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

    // 8. Render Protagonist (Nova)
    drawPlayer(ctx, gs.player, gs.viewportX, gs.globalFrame, skin);

    // 9. AI Visual Path Telemetry
    if (isAiAutopilot) {
      ctx.save();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(gs.player.x - gs.viewportX + gs.player.w / 2, gs.player.y + gs.player.h / 2);
      ctx.lineTo(
        gs.player.x - gs.viewportX + gs.player.w / 2 + 130,
        gs.player.y + gs.player.h / 2 - 12
      );
      ctx.stroke();

      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(
        gs.player.x - gs.viewportX + gs.player.w / 2 + 130,
        gs.player.y + gs.player.h / 2 - 12,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }
  };

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
        runStats.shards,
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

  const handleTouchControl = (key: 'left' | 'right' | 'jump' | 'fire' | 'sprint', pressed: boolean) => {
    const gs = gameStateRef.current;
    gs.keys[key] = pressed;
    if (key === 'jump' && pressed && gs.player.grounded) {
      sounds.playJump(gs.player.powerUp !== 'standard');
    }
    if (key === 'fire' && pressed && gs.player.powerUp === 'plasma' && gs.plasmaBolts.length < 3) {
      sounds.playFireball();
      gs.plasmaBolts.push({
        id: `pb_touch_${Date.now()}`,
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
      {/* Retro Cyber Arcade Frame */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-4 border-zinc-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Top Header Marquee */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-zinc-950/80 border border-zinc-800/80 px-4 py-2.5 rounded-xl font-mono text-xs text-white">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Runner</div>
              <div className="font-black text-cyan-400 tracking-wider">NOVA</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Energy Score</div>
              <div className="font-bold text-white tracking-widest">{score.toString().padStart(6, '0')}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Energy Shards</div>
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>x{shards.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Subnet Sector</div>
              <div className="font-black text-emerald-400 tracking-wider">{currentWorldId}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Shields</div>
              <div className="font-bold text-cyan-400">{'⚡'.repeat(lives)}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Active Buffs</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300">
                {stakingPerks.shardMagnet && <span title="Shard Magnet">🧲</span>}
                {stakingPerks.superJump && <span title="Super Mag-Jump">🚀</span>}
                {stakingPerks.shardBonusPercent > 0 && <span title="Shard Yield">+{stakingPerks.shardBonusPercent}%</span>}
                {!stakingPerks.shardMagnet && !stakingPerks.superJump && <span className="text-zinc-600">None</span>}
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

          {hasCrtEffect && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)] opacity-80">
              <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
            </div>
          )}

          {/* AI Autopilot Live Telemetry HUD */}
          {isAiAutopilot && aiTelemetry && (
            <div className="absolute top-3 left-3 bg-zinc-950/90 border border-cyan-500/50 backdrop-blur-md px-3 py-2 rounded-lg font-mono text-[11px] shadow-lg max-w-sm pointer-events-none z-10">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
                <span>A.R.I.A. AUTONOMOUS RUNNER COPILOT</span>
                <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.2 rounded text-cyan-300">
                  {Math.round(aiTelemetry.confidence * 100)}% Conf
                </span>
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Action:</span>{' '}
                <span className="font-semibold text-emerald-300">{aiTelemetry.action}</span>
              </div>
              <div className="text-zinc-400 text-[10px] line-clamp-1">
                {aiTelemetry.reason}
              </div>
            </div>
          )}
        </div>

        {/* Sector Toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-zinc-950/70 border border-zinc-800 p-2 rounded-xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-500 px-2">Sectors:</span>
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
              1-4 Titan Citadel
            </button>
            <button
              onClick={() => loadLevel('AI-MATRIX', customLevelPrompt)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                currentWorldId === 'AI-MATRIX' 
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-zinc-900 text-purple-300 hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Matrix</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiAutopilot(!isAiAutopilot)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                isAiAutopilot 
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/30' 
                  : 'bg-zinc-900 border border-cyan-500/40 text-cyan-400 hover:bg-zinc-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>{isAiAutopilot ? 'AI Copilot: ON' : 'AI Copilot: OFF'}</span>
            </button>

            <button
              onClick={() => setHasCrtEffect(!hasCrtEffect)}
              title="Toggle CRT scanlines"
              className={`p-2 rounded-lg text-xs font-mono transition ${
                hasCrtEffect ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={() => loadLevel(currentWorldId)}
              title="Restart Sector"
              className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Guide & Mode Shortcuts Bar */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition shadow-sm hover:shadow-cyan-500/20"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>🎮 How to Play / Demo Guide</span>
            </button>

            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition shadow-sm hover:shadow-emerald-500/20"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span>🚀 Deploy on Devnet</span>
            </button>
          </div>

          <button
            onClick={() => setIsPracticeMode(!isPracticeMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${
              isPracticeMode
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/25'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            <span>🛡️ Practice Mode: {isPracticeMode ? 'ACTIVE (Invulnerable)' : 'OFF'}</span>
          </button>
        </div>

        {/* Mobile Touch Controls */}
        <div className="mt-4 grid grid-cols-2 gap-4 select-none sm:hidden">
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

          <div className="flex items-center justify-end gap-3">
            <button
              onTouchStart={() => handleTouchControl('fire', true)}
              onTouchEnd={() => handleTouchControl('fire', false)}
              onMouseDown={() => handleTouchControl('fire', true)}
              onMouseUp={() => handleTouchControl('fire', false)}
              className="w-14 h-14 bg-cyan-600 active:bg-cyan-500 rounded-full flex flex-col items-center justify-center text-xs font-black text-white shadow-md"
            >
              <span>B</span>
              <span className="text-[9px] opacity-80">PLASMA</span>
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
            <span className="text-zinc-400 font-bold">[Shift]</span> Mag-Sprint •{' '}
            <span className="text-zinc-400 font-bold">[X]</span> Plasma Cannon
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
          <div className="bg-zinc-900 border-2 border-emerald-500 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative font-mono">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full mx-auto flex items-center justify-center text-3xl mb-3">
              ⚡
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              SECTOR CLEARED!
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isAiAutopilot ? 'A.R.I.A. Autonomous AI completed the speedrun' : 'You completed the speedrun successfully'}!
            </p>

            <div className="grid grid-cols-3 gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-xl my-4 text-left font-mono">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Clear Time</div>
                <div className="text-sm font-bold text-white">{runStats.time.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Shards</div>
                <div className="text-sm font-bold text-emerald-400">+{runStats.shards}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Score</div>
                <div className="text-sm font-bold text-cyan-400">{runStats.score}</div>
              </div>
            </div>

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
                <span>{isAttesting ? 'Broadcasting to Solana...' : 'Attest Run on Solana Devnet'}</span>
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
                Next Sector →
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
          <div className="bg-zinc-900 border-2 border-red-500/60 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl font-mono">
            <div className="text-4xl mb-2">⚡</div>
            <h2 className="text-2xl font-black text-white tracking-widest text-red-500">
              SYSTEM REBOOT NEEDED
            </h2>
            <p className="text-xs text-zinc-400 my-3">
              Nova ran out of energy shields in the mempool!
            </p>
            <button
              onClick={() => {
                setLives(3);
                loadLevel(currentWorldId);
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl font-mono text-sm transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recharge Shields (3 Lives)</span>
            </button>
          </div>
        </div>
      )}
      {/* Interactive Guide & Demo Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onStartPractice={() => {
          setIsPracticeMode(true);
          loadLevel('1-1');
        }}
      />

      {/* Devnet Deployment Guide Modal */}
      <DevnetDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}

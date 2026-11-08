'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  JetpackPlayer, 
  Obstacle, 
  ShardCollectible, 
  VehicleTokenEntity, 
  SpeedGateEntity,
  LabScientistNPC, 
  JetpackParticle, 
  ScorePopup, 
  StakingPerks,
  SkinType
} from '@/lib/jetpack/types';
import { 
  drawJetpackPlayer, 
  drawObstacle, 
  drawShardCollectible, 
  drawVehicleToken, 
  drawSpeedGate,
  drawLabScientistNPC, 
  drawFacilityBackground, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  FLOOR_Y,
  CEILING_Y 
} from '@/lib/jetpack/sprites';
import { updateJetpackPhysics, resetJetpackSpawnState } from '@/lib/jetpack/physics';
import { computeAiJetpackAction, AiTelemetry, getOrCreateAiAgentKeypair } from '@/lib/jetpack/ai-agent';
import { sounds } from '@/lib/audio/sound-effects';
import { executeSpeedrunAttestation } from '@/lib/solana/transactions';
import { getOrCreateBurnerWallet } from '@/lib/solana/burner-wallet';
import { 
  Bot, 
  RotateCcw, 
  ExternalLink, 
  Tv, 
  Zap, 
  Flame, 
  Gamepad2, 
  Shield, 
  Rocket,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  Radio,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import HowToPlayModal from '@/components/demo/HowToPlayModal';
import DevnetDeployModal from '@/components/beginner/DevnetDeployModal';

interface JetpackGameProps {
  onCoinCollected: (amount: number) => void;
  stakingPerks: StakingPerks;
  activeSkin: SkinType;
  onTxConfirmed?: (sig: string) => void;
}

export default function JetpackGame({
  onCoinCollected,
  stakingPerks,
  activeSkin,
  onTxConfirmed,
}: JetpackGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game States
  const [distance, setDistance] = useState<number>(0);
  const [bestDistance, setBestDistance] = useState<number>(0);
  const [shards, setShards] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [isAiAutopilot, setIsAiAutopilot] = useState<boolean>(false);
  const [aiTelemetry, setAiTelemetry] = useState<AiTelemetry | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [hasCrtEffect, setHasCrtEffect] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isThrustActive, setIsThrustActive] = useState<boolean>(false);
  const [milestoneBanner, setMilestoneBanner] = useState<string | null>(null);

  // Modals & Attestation
  const [showCrashModal, setShowCrashModal] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isAttesting, setIsAttesting] = useState<boolean>(false);
  const [attestationSig, setAttestationSig] = useState<string | null>(null);
  const [runSummary, setRunSummary] = useState<{ distance: number; shards: number; score: number } | null>(null);

  // Mutable state references for 60 FPS Canvas Game Loop
  const gameStateRef = useRef<{
    player: JetpackPlayer;
    obstacles: Obstacle[];
    shards: ShardCollectible[];
    vehicleTokens: VehicleTokenEntity[];
    speedGates: SpeedGateEntity[];
    scientists: LabScientistNPC[];
    particles: JetpackParticle[];
    scorePopups: ScorePopup[];
    globalFrame: number;
    startTime: number;
    thrustKeyDown: boolean;
    touchPointerDown: boolean;
    screenShake: number;
  }>({
    player: {
      x: 120,
      y: FLOOR_Y - 42,
      vx: 0,
      vy: 0,
      w: 28,
      h: 42,
      isThrusting: false,
      grounded: true,
      onCeiling: false,
      vehicle: 'none',
      gravityInverted: false,
      shields: 0,
      distance: 0,
      bestDistance: 0,
      shards: 0,
      score: 0,
      isDying: false,
      deathTimer: 0,
      invincibleTimer: 0,
      walkFrame: 0,
      skin: activeSkin,
      combo: 0,
      comboTimer: 0,
      warpBoostTimer: 0,
    },
    obstacles: [],
    shards: [],
    vehicleTokens: [],
    speedGates: [],
    scientists: [],
    particles: [],
    scorePopups: [],
    globalFrame: 0,
    startTime: 0,
    thrustKeyDown: false,
    touchPointerDown: false,
    screenShake: 0,
  });

  const resetGame = useCallback(() => {
    setShowCrashModal(false);
    setAttestationSig(null);
    setMilestoneBanner(null);
    resetJetpackSpawnState();

    const gs = gameStateRef.current;
    gs.player.y = FLOOR_Y - 42;
    gs.player.vy = 0;
    gs.player.isThrusting = false;
    gs.player.grounded = true;
    gs.player.onCeiling = false;
    gs.player.vehicle = 'none';
    gs.player.gravityInverted = false;
    gs.player.shields = stakingPerks.superJump ? 1 : 0;
    gs.player.distance = 0;
    gs.player.shards = 0;
    gs.player.score = 0;
    gs.player.combo = 0;
    gs.player.comboTimer = 0;
    gs.player.warpBoostTimer = 0;
    gs.player.isDying = false;
    gs.player.deathTimer = 0;
    gs.player.invincibleTimer = 30;
    gs.player.skin = activeSkin;
    gs.obstacles = [];
    gs.shards = [];
    gs.vehicleTokens = [];
    gs.speedGates = [];
    gs.scientists = [];
    gs.particles = [];
    gs.scorePopups = [];
    gs.screenShake = 0;
    gs.startTime = Date.now();
    setDistance(0);
    setShards(0);
    setScore(0);
    setCombo(0);
    setIsWarping(false);
  }, [activeSkin, stakingPerks]);

  // Input Listeners (Keyboard & Mouse / Touch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code) || e.key === ' ') {
        e.preventDefault();
        gameStateRef.current.thrustKeyDown = true;
        setIsThrustActive(true);

        // Gravity Drifter inversion tap
        const gs = gameStateRef.current;
        if (gs.player.vehicle === 'gravity_drifter') {
          gs.player.gravityInverted = !gs.player.gravityInverted;
          sounds.playJump(false);
        }
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code) || e.key === ' ') {
        gameStateRef.current.thrustKeyDown = false;
        setIsThrustActive(false);
      }
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
    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      const gs = gameStateRef.current;
      if (isPaused || showCrashModal) return;

      gs.globalFrame++;

      // Player thrust resolution (Keyboard OR Touch OR AI Autopilot)
      if (isAiAutopilot) {
        const aiDecision = computeAiJetpackAction(gs.player, gs.obstacles, gs.shards, gs.globalFrame);
        gs.player.isThrusting = aiDecision.isThrusting;
        setAiTelemetry(aiDecision.telemetry);
        setIsThrustActive(aiDecision.isThrusting);
      } else {
        const active = gs.thrustKeyDown || gs.touchPointerDown;
        gs.player.isThrusting = active;
        setIsThrustActive(active);
      }

      // Physics tick
      const out = updateJetpackPhysics(
        gs.player,
        gs.obstacles,
        gs.shards,
        gs.vehicleTokens,
        gs.speedGates,
        gs.scientists,
        gs.particles,
        gs.scorePopups,
        stakingPerks,
        gs.globalFrame,
        isPracticeMode
      );

      if (out.screenShake > 0) {
        gs.screenShake = Math.max(gs.screenShake, out.screenShake);
      }

      if (out.shardsGained > 0) {
        setShards(s => s + out.shardsGained);
        onCoinCollected(out.shardsGained);
      }

      if (out.scoreGained > 0) {
        setScore(s => s + out.scoreGained);
      }

      setCombo(out.combo);
      setIsWarping(out.warpActive);

      if (out.milestoneReached) {
        setMilestoneBanner(out.milestoneReached);
        setTimeout(() => setMilestoneBanner(null), 3500);
      }

      const curDistance = Math.round(gs.player.distance);
      setDistance(curDistance);
      if (curDistance > bestDistance) {
        setBestDistance(curDistance);
      }

      // Crash / Run Over
      if (out.playerCrashed) {
        setRunSummary({
          distance: curDistance,
          shards: shards + out.shardsGained,
          score: score + out.scoreGained,
        });
        setShowCrashModal(true);
        if (curDistance > 800) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }

      // Render Frame with Screen Shake
      renderFrame(ctx, canvas, gs);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, showCrashModal, isAiAutopilot, isPracticeMode, stakingPerks, bestDistance, shards, score, onCoinCollected]);

  const renderFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gs: typeof gameStateRef.current
  ) => {
    ctx.save();

    // Screen Shake Offset
    if (gs.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * gs.screenShake * 1.6;
      const shakeY = (Math.random() - 0.5) * gs.screenShake * 1.6;
      ctx.translate(shakeX, shakeY);
      gs.screenShake *= 0.9;
      if (gs.screenShake < 0.2) gs.screenShake = 0;
    }

    // 1. Draw Facility Background
    drawFacilityBackground(ctx, gs.player.distance, gs.globalFrame);

    // 2. Draw Speed Booster Gates
    for (const gate of gs.speedGates) {
      drawSpeedGate(ctx, gate, gs.globalFrame);
    }

    // 3. Draw Obstacles
    for (const obs of gs.obstacles) {
      if (obs.active) {
        drawObstacle(ctx, obs, gs.globalFrame);
      }
    }

    // 4. Draw Vehicle Tokens
    for (const token of gs.vehicleTokens) {
      drawVehicleToken(ctx, token, gs.globalFrame);
    }

    // 5. Draw Shard Collectibles
    for (const s of gs.shards) {
      drawShardCollectible(ctx, s, gs.globalFrame);
    }

    // 6. Draw Floor Scientists
    for (const npc of gs.scientists) {
      drawLabScientistNPC(ctx, npc);
    }

    // 7. Draw Jetpack Particles
    for (const p of gs.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // 8. Draw Player (Nova or Vehicle)
    drawJetpackPlayer(ctx, gs.player, gs.globalFrame);

    // 9. Draw Score Popups
    for (const sp of gs.scorePopups) {
      ctx.save();
      ctx.fillStyle = sp.color || `rgba(20, 241, 149, ${Math.max(0, sp.opacity)})`;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sp.text, sp.x, sp.y);
      ctx.restore();
    }

    ctx.restore();
  };

  const handleAttestRun = async () => {
    if (!runSummary || isAttesting) return;
    setIsAttesting(true);

    try {
      let keypair;
      if (isAiAutopilot) {
        keypair = getOrCreateAiAgentKeypair();
      } else {
        const w = getOrCreateBurnerWallet();
        keypair = w.keypair;
      }

      // Attest distance run to Solana Devnet
      const sig = await executeSpeedrunAttestation(
        keypair,
        `${runSummary.distance}m_RUN`,
        Math.round(runSummary.distance / 10),
        runSummary.shards,
        runSummary.score,
        isAiAutopilot
      );

      setAttestationSig(sig);
      if (onTxConfirmed) onTxConfirmed(sig);
      sounds.playCoin();
    } catch (err) {
      console.error('Distance run attestation failed:', err);
    } finally {
      setIsAttesting(false);
    }
  };

  const nextMilestone = (Math.floor(distance / 250) + 1) * 250;
  const milestoneProgress = Math.min(100, Math.round(((distance % 250) / 250) * 100));

  return (
    <div className="w-full flex flex-col items-center font-mono">
      {/* Sleek Arcade Cabinet Frame */}
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Top Flight HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl text-xs text-white">
          <div className="flex items-center gap-5 sm:gap-7">
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Distance</div>
              <div className="font-bold text-cyan-400 text-sm tabular-nums flex items-center gap-1">
                <span>{distance}</span>
                <span className="text-[10px] text-zinc-400">m</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Best</div>
              <div className="font-semibold text-zinc-300 tabular-nums">{bestDistance}m</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Shards</div>
              <div className="font-semibold text-emerald-400 flex items-center gap-1 tabular-nums">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>x{shards}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Score</div>
              <div className="font-semibold text-white tabular-nums">{score.toLocaleString()}</div>
            </div>

            {/* Live Combo Badge */}
            {combo >= 4 && (
              <div className="animate-bounce">
                <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>COMBO x{combo >= 15 ? 4 : combo >= 8 ? 3 : 2}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Milestone mini-meter */}
            <div className="hidden sm:block text-right">
              <div className="text-[10px] text-zinc-500">Next: {nextMilestone}m</div>
              <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-200" 
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>

            {isPracticeMode ? (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Practice Mode
              </span>
            ) : (
              <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {stakingPerks.shardMagnet && <span title="Shard Magnetism">🧲 Magnet</span>}
                {stakingPerks.superJump && <span title="Kinetic Shield Active">🛡️ Shield</span>}
                {!stakingPerks.shardMagnet && !stakingPerks.superJump && <span className="text-zinc-500">No Buffs</span>}
              </div>
            )}
          </div>
        </div>

        {/* Canvas Flight Area with CRT Scanlines & Interactive Touch Support */}
        <div 
          className="relative w-full aspect-[800/480] bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-inner select-none cursor-pointer"
          onMouseDown={() => { gameStateRef.current.touchPointerDown = true; }}
          onMouseUp={() => { gameStateRef.current.touchPointerDown = false; }}
          onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.touchPointerDown = true; }}
          onTouchEnd={(e) => { e.preventDefault(); gameStateRef.current.touchPointerDown = false; }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full block"
          />

          {hasCrtEffect && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)] opacity-80">
              <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
            </div>
          )}

          {/* Warp Drive Speed Streak Overlay */}
          {isWarping && (
            <div className="pointer-events-none absolute inset-0 bg-purple-500/10 border-2 border-purple-500/40 animate-pulse flex items-center justify-center">
              <div className="bg-purple-950/80 border border-purple-500 px-4 py-1.5 rounded-full text-xs font-bold text-purple-300 tracking-wider shadow-lg">
                ⚡ QUANTUM WARP SPEED ACTIVE ⚡
              </div>
            </div>
          )}

          {/* Milestone Toast Banner */}
          {milestoneBanner && (
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-950/95 border border-emerald-500 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 shadow-xl flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>{milestoneBanner}</span>
            </div>
          )}

          {/* AI Copilot Live Telemetry HUD */}
          {isAiAutopilot && aiTelemetry && (
            <div className="absolute top-3 left-3 bg-zinc-950/90 border border-cyan-500/40 backdrop-blur-md px-3 py-2 rounded-lg text-[11px] shadow-lg max-w-sm pointer-events-none z-10">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Bot className="w-3.5 h-3.5" />
                <span>A.R.I.A. JETPACK COPILOT</span>
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

          {/* In-Game Touch / Click Prompt Hint */}
          {!isThrustActive && distance < 20 && !isAiAutopilot && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 border border-cyan-500/50 text-cyan-300 px-4 py-2 rounded-full text-xs font-medium pointer-events-none animate-pulse flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>Hold Spacebar or Click / Tap to Fly!</span>
            </div>
          )}
        </div>

        {/* Prominent Primary Touch / Click Flight Pad (Requested: Show Controls Below Window) */}
        <div className="mt-3">
          <button
            onMouseDown={() => { gameStateRef.current.touchPointerDown = true; }}
            onMouseUp={() => { gameStateRef.current.touchPointerDown = false; }}
            onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.touchPointerDown = true; }}
            onTouchEnd={(e) => { e.preventDefault(); gameStateRef.current.touchPointerDown = false; }}
            className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2.5 select-none active:scale-[0.99] border ${
              isThrustActive
                ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-cyan-500/30'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80 shadow-black/50'
            }`}
          >
            <Flame className={`w-4 h-4 ${isThrustActive ? 'text-zinc-950' : 'text-cyan-400'}`} />
            <span>{isThrustActive ? '🔥 THRUSTERS FIRING — ASCENDING' : '⚡ PRESS & HOLD TO ENGAGE PHOTON JETPACK'}</span>
          </button>
        </div>

        {/* Detailed Keyboard & Gameplay Controls Bar Below Game Window */}
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl">
            <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Ascend / Thrust</div>
            <div className="text-zinc-200 flex items-center gap-1 flex-wrap">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-cyan-400 font-bold text-[11px]">SPACE</kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-cyan-400 font-bold text-[11px]">W</kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-cyan-400 font-bold text-[11px]">↑</kbd>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Hold key to fly upward</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl">
            <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Descend / Glide</div>
            <div className="text-zinc-200 flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-emerald-400 font-bold text-[11px]">RELEASE</kbd>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Cut burn to glide down</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl">
            <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Cyber Vehicles</div>
            <div className="text-zinc-200 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-purple-400 font-bold text-[11px]">TAP</kbd>
              <span className="text-[11px] text-zinc-300">Gravity Drifter</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Absorbs 1 hit (Eject Armor)</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl">
            <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Pause / Reset</div>
            <div className="text-zinc-200 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-amber-400 font-bold text-[11px]">P</kbd>
              <span className="text-zinc-500">/</span>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-amber-400 font-bold text-[11px]">ESC</kbd>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Freeze or restart flight</div>
          </div>
        </div>

        {/* Quick Toggles & Utilities Row */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 bg-zinc-900/40 border border-zinc-800/60 p-2 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAiAutopilot(!isAiAutopilot)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                isAiAutopilot 
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{isAiAutopilot ? 'AI Copilot: ACTIVE' : 'Manual Pilot'}</span>
            </button>

            <button
              onClick={() => setIsPracticeMode(!isPracticeMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                isPracticeMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>Practice Mode: {isPracticeMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Flight Guide</span>
            </button>

            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              Devnet Deploy
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHasCrtEffect(!hasCrtEffect)}
              title="Toggle CRT scanlines"
              className={`p-1.5 rounded-lg border transition ${
                hasCrtEffect ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetGame}
              title="Restart Flight"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Flight Crash Modal with Solana Speedrun Attestation */}
      {showCrashModal && runSummary && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono animate-in fade-in duration-150">
          <div className="bg-zinc-900 border-2 border-red-500/60 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative text-white">
            <div className="w-14 h-14 bg-red-500/20 border border-red-500/40 rounded-full mx-auto flex items-center justify-center text-2xl mb-3">
              ⚡
            </div>
            <h2 className="text-xl font-bold tracking-wide">
              {isAiAutopilot ? 'A.R.I.A. COPILOT CRASH' : 'FLIGHT TERMINATED'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Quantum hazard collision detected in facility corridor.
            </p>

            {/* Run Stats */}
            <div className="grid grid-cols-3 gap-2 my-5 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Distance</div>
                <div className="text-base font-bold text-cyan-400">{runSummary.distance}m</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Shards</div>
                <div className="text-base font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+{runSummary.shards}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Score</div>
                <div className="text-base font-bold text-white">{runSummary.score.toLocaleString()}</div>
              </div>
            </div>

            {/* On-Chain Attestation Proof Box */}
            {attestationSig ? (
              <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ATTESTED ON SOLANA DEVNET!</span>
                </div>
                <div className="text-zinc-400 text-[11px] font-mono break-all line-clamp-1">
                  Tx: {attestationSig}
                </div>
                <a
                  href={`https://solscan.io/tx/${attestationSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                >
                  <span>View Proof on Solscan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="mb-5">
                <button
                  onClick={handleAttestRun}
                  disabled={isAttesting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isAttesting 
                      ? 'Signing ed25519 Distance Proof to Devnet...' 
                      : `Attest ${runSummary.distance}m Run on Solana`}
                  </span>
                </button>
                <div className="text-[10px] text-zinc-500 mt-1.5">
                  Submits immutable distance proof via Solana SPL Memo Program
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={resetGame}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>

              <button
                onClick={() => setShowCrashModal(false)}
                className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onStartPractice={() => {
          setIsPracticeMode(true);
          resetGame();
        }}
      />

      <DevnetDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}

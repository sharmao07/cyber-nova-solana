'use client';

import React, { useState } from 'react';
import { 
  Gamepad2, 
  Zap, 
  Bot, 
  Flame, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  ChevronRight,
  Sparkles,
  Layers,
  Coins,
  Cpu
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: () => void;
}

type GuideTab = 'CONTROLS' | 'COMBAT' | 'POWERUPS' | 'AI_COPILOT' | 'DEFI';

export default function HowToPlayModal({
  isOpen,
  onClose,
  onStartPractice,
}: HowToPlayModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('CONTROLS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                CYBER NOVA: HOW TO PLAY & WALKTHROUGH
              </h2>
              <p className="text-xs text-zinc-400">
                Sol-Runner Odyssey • Controls, Combat, AI Copilot & Solana DeFi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-zinc-800 bg-zinc-950 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('CONTROLS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CONTROLS'
                ? 'bg-cyan-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>1. Controls & Moves</span>
          </button>

          <button
            onClick={() => setActiveTab('COMBAT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COMBAT'
                ? 'bg-red-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>2. Combat & Boss</span>
          </button>

          <button
            onClick={() => setActiveTab('POWERUPS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'POWERUPS'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Powerups & Shards</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_COPILOT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'AI_COPILOT'
                ? 'bg-purple-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>4. A.R.I.A. AI Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('DEFI')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DEFI'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>5. DeFi & Solana Speed</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs leading-relaxed text-zinc-300">
          {activeTab === 'CONTROLS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">← →</span>
                    <span>or</span>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">A / D</span>
                  </div>
                  <div className="text-zinc-300 font-semibold">Move Sol-Runner</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Smooth acceleration with retro inertial physics and mid-air control.</div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">SPACE</span>
                    <span>or</span>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">W / ↑ / Z</span>
                  </div>
                  <div className="text-zinc-300 font-semibold">Mag-Boot Jump</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Hold for higher jump height. Stomp enemies from above for extra bounce.</div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">SHIFT</span>
                    <span>or</span>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">X</span>
                  </div>
                  <div className="text-zinc-300 font-semibold">Sprint / Plasma Shot</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Hold while running for max sprint speed. Fires plasma bolts when armed with Plasma Blaster.</div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">↓</span>
                    <span>or</span>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">S</span>
                  </div>
                  <div className="text-zinc-300 font-semibold">Crouch / Transit Pipe</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Press down on green Quantum Transit Pipes to warp into bonus underground mempools!</div>
                </div>
              </div>

              {/* Mobile Controls Note */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-start gap-3">
                <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-[11px]">
                  <strong className="text-cyan-300">Mobile & Touch Ready:</strong> When playing on a touch screen or mobile browser, an on-screen cyberpunk virtual D-pad and action buttons (Jump, Fire, Sprint) render automatically below the canvas!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMBAT' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-bold text-white">FUD-Bot (Scout Automaton)</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Patrols network sectors with red scanning laser eyes. <strong>Stomp from above</strong> to crush its chassis (+100 pts) or blast with plasma. Hitting it from the side costs 1 shield!
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-bold text-white">Shield-Orb (Kinetic Drone)</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Hovering blue security sphere. <strong>Stomp once</strong> to force it into stationary sphere mode. <strong>Kick it</strong> from either side to send it hurtling forward at high velocity—bowling through entire lines of enemies!
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-bold text-white">Plasma Sentry (Thermal Vent)</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Floor-mounted cooling pylon that intermittently erupts with high-temp plasma beams. Time your sprint and jumps across the vents when the beam is inactive.
                </p>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-300">Macro-Titan Boss (World 1-4 Citadel)</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Colossal 48x48 dreadnought guarding the Solana Gateway. It unleashes plasma shockwaves across the magnetic flux bridge! Defeat it by:
                  <br />
                  1. Jumping over it to hit the <strong>Golden Master Core Switch [⚡]</strong> to overload the bridge, OR
                  <br />
                  2. Blasting it with 5 direct hits from your <strong>Plasma Blaster</strong>!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'POWERUPS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Quantum Overcharge [⚡]</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Sprouts from Matrix Caches. Doubles Nova's height and grants super strength to shatter Carbon-Nanotube Hex Bricks!
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="text-orange-400 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span>Plasma Blaster Core [🔥]</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Equips an arm cannon allowing Nova to fire bouncing cyan/white plasma bolts (press Shift or X) to terminate enemies from a distance.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="text-purple-400 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span>Prismatic Hyper Matrix [★]</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Bouncing star core that grants temporary total invulnerability, increased speed, and rainbow chromatic trails!
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Solana Energy Shards [$]</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Spinning cryptographic tokens scattered across levels and hidden inside matrix cache blocks. Collect 100 for an extra shield!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[11px]">Hit Matrix Blocks [ ◈ ] from Below</div>
                  <div className="text-zinc-400 text-[10px]">Jump up into blocks to reveal hidden shards, overcharge cores, or powerups with spring physics!</div>
                </div>
                <span className="text-xl">◈</span>
              </div>
            </div>
          )}

          {activeTab === 'AI_COPILOT' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl">
                <div className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>A.R.I.A. (Autonomous Runner Intelligence Agent)</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  A.R.I.A. is an ed25519-keyed autonomous agent that evaluates upcoming level tiles, predicts jumps, calculates threat proximity, and plays the game autonomously at 60 FPS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1">Autonomous Wallet</div>
                  <p className="text-zinc-400">
                    A.R.I.A. holds its own Solana Devnet ed25519 keypair. When it clears a level, it cryptographically signs and commits its run to the Solana blockchain.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-emerald-400 mb-1">Predictive Pathfinding</div>
                  <p className="text-zinc-400">
                    Toggle <strong>AI Autopilot Mode</strong> in the bottom right corner of the arcade screen to watch A.R.I.A. navigate obstacles, stomp bots, and beat speedruns.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DEFI' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl">
                <div className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Full Solana DeFi Ecosystem</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Unlike Web2 games with bolted-on NFTs, CYBER NOVA features native Solana DeFi mechanics directly affecting gameplay:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <strong className="text-emerald-400 block mb-1">Quantum Swap AMM</strong>
                  <span className="text-zinc-400">Constant product ($x \cdot y = k$) DEX pool to swap in-game `$SHARD` for real Devnet SOL with 0.3% LP fees.</span>
                </div>

                <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <strong className="text-cyan-400 block mb-1">Solar Staking Reactor</strong>
                  <span className="text-zinc-400">Stake SOL at 18.5% streaming APY to unlock in-game perks: Shard Magnetism & Super Mag-Jump!</span>
                </div>

                <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <strong className="text-amber-400 block mb-1">Speedrun Wagers</strong>
                  <span className="text-zinc-400">Lock 0.05 - 0.25 SOL in a smart escrow contract. Beat the level under time to win a 1.5x bounty payout!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Eligible for all 5 MLH Tracks (Gaming, AI, DeFi, Beginner, Top 3)</span>
          </div>

          <div className="flex items-center gap-2">
            {onStartPractice && (
              <button
                onClick={() => {
                  onStartPractice();
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-lg text-xs transition"
              >
                Enter Practice Mode
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-lg text-xs transition flex items-center gap-1"
            >
              <span>Ready to Play!</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

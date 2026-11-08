'use client';

import React, { useState } from 'react';
import { 
  Gamepad2, 
  Zap, 
  Bot, 
  Flame, 
  ShieldCheck, 
  X, 
  ChevronRight,
  Sparkles,
  Layers,
  Coins,
  Rocket,
  Shield,
  Radio
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: () => void;
}

type GuideTab = 'CONTROLS' | 'HAZARDS' | 'VEHICLES' | 'AI_COPILOT' | 'DEFI';

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
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                CYBER NOVA: JETPACK FLIGHT MANUAL
              </h2>
              <p className="text-xs text-zinc-400">
                Endless Sol-Jet Velocity • Controls, Hazards, Vehicles & Solana DeFi
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
            <span>1. Flight Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('HAZARDS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'HAZARDS'
                ? 'bg-red-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>2. Hazards & Threats</span>
          </button>

          <button
            onClick={() => setActiveTab('VEHICLES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'VEHICLES'
                ? 'bg-purple-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Cyber Vehicles</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_COPILOT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'AI_COPILOT'
                ? 'bg-emerald-500 text-zinc-950'
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
            <span>5. Solana DeFi & Proofs</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs leading-relaxed text-zinc-300">
          {activeTab === 'CONTROLS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">SPACEBAR</span>
                    <span>or</span>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">LEFT CLICK</span>
                  </div>
                  <div className="text-zinc-200 font-semibold">Hold to Fire Photon Thrusters</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Hold down to blast vertical thrust upward against gravity. Particle exhaust shoots towards the floor, scattering panicked scientists!
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">RELEASE</span>
                  </div>
                  <div className="text-zinc-200 font-semibold">Release to Descend</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Let go of the key or screen to cut engine burn. Nova glides smoothly downward under facility gravity.
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">TAP</span>
                    <span>(In Gravity Drifter)</span>
                  </div>
                  <div className="text-zinc-200 font-semibold">Invert Gravity Polarity</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    When inside the Gravity Drifter hoverpod, tap Space or click to flip gravity instantly between the ceiling and floor!
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">P</span>
                    <span>or</span>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded text-[11px]">ESC</span>
                  </div>
                  <div className="text-zinc-200 font-semibold">Pause Simulation</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Freeze time instantly. Toggle Practice Mode to fly with unlimited invulnerability while training muscle memory.
                  </div>
                </div>
              </div>

              {/* Mobile Controls Note */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-start gap-3">
                <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-[11px]">
                  <strong className="text-cyan-300">Touch & Mobile Ready:</strong> Tap and hold anywhere on the screen or arcade window on mobile browsers to engage thrust. Zero lag, 60 FPS requestAnimationFrame loop!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HAZARDS' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="font-bold text-white">Quantum Zappers (High-Voltage Plasma Rods)</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Pulsing electric barriers fixed across corridors. They appear horizontally, vertically, diagonally, and in spinning dual-rotor configurations. Maneuver through their clearance corridors!
                </p>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span className="font-bold text-red-300">Homing Seeker Missiles [ ! ]</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Automated defence missiles lock onto Nova's altitude. An audio warning beep sounds and a flashing red warning beacon <span className="font-bold text-red-400">[ ! ]</span> tracks you along the right edge before the missile fires at blistering velocity! Dodge up or down immediately after launch!
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="font-bold text-white">Laser Containment Gates</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Vertical energy gates that seal off the top or bottom half of the research facility. Require precise altitude control to slip through.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Kinetic Energy Shields</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Absorbs 1 fatal hazard collision without ending the run. Unlocked via the Solar Staking Vault or Chassis Shop!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'VEHICLES' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl">
                <div className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Rideable Cyber Vehicles & Eject Armor</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Touch floating glowing vehicle tokens to instantly board high-tech experimental craft. <strong>Eject Armor Perk:</strong> When inside any vehicle, taking a hit destroys the vehicle but safely ejects Nova back into flight with temporary invulnerability!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Gravity Drifter</span>
                  </div>
                  <p className="text-zinc-400">
                    Sleek inverted hoverpod. Click to reverse gravity, sending you zooming up to walk along the ceiling, and click again to drop to the floor.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Mech Breaker</span>
                  </div>
                  <p className="text-zinc-400">
                    Heavy bipedal titan armored chassis. Runs on the floor with heavy strides; tap to perform powerful hydraulic jumps.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span>Warp Cycle</span>
                  </div>
                  <p className="text-zinc-400">
                    Hyper-velocity anti-grav speeder bike. Tearing through the facility at 1.4x standard cruise speed with a neon particle tail.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AI_COPILOT' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                <div className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>A.R.I.A. (Autonomous Runner Intelligence Agent)</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  A.R.I.A. is an autonomous ed25519-keyed AI copilot designed specifically for Solana. It evaluates a 320px threat lookahead buffer, tracks missile trajectory vectors, steers into zapper gap corridors, and signs flight records to the blockchain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-cyan-400 mb-1">Autonomous ed25519 Keypair</div>
                  <p className="text-zinc-400">
                    A.R.I.A. generates its own persistent Solana Devnet keypair. When it achieves distance milestones, it signs and confirms transactions via the Solana Memo Program.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="font-bold text-emerald-400 mb-1">Real-Time Threat Corridor Evaluation</div>
                  <p className="text-zinc-400">
                    Toggle <strong>AI Copilot Autopilot</strong> to watch A.R.I.A. pilot Nova hands-free at 60 FPS while rendering live safety confidence and altitude telemetry.
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
                  <span>Native Solana Speed, Low Fees & Composability</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Solana's 400ms slot times and fraction-of-a-cent transaction fees power four interconnected DeFi mechanisms in CYBER NOVA:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <strong className="text-emerald-400 block mb-1">Quantum Swap AMM</strong>
                  <span className="text-zinc-400">Constant-product ($x \cdot y = k$) DEX liquidity pool to swap in-game `$SHARD` for real Devnet SOL with 0.3% LP fees.</span>
                </div>

                <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <strong className="text-cyan-400 block mb-1">Solar Staking Vault</strong>
                  <span className="text-zinc-400">Stake SOL at 18.5% streaming APY to unlock in-game perks: Shard Magnetism & Kinetic Shields!</span>
                </div>

                <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <strong className="text-amber-400 block mb-1">Distance Wager Escrow</strong>
                  <span className="text-zinc-400">Lock SOL into a bounty escrow. Reach target flight distance (1,000m+) to win 1.5x - 2.0x bounty payouts!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Eligible for all 5 MLH Tracks (Top 3, AI, DeFi, Gaming, Beginner)</span>
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
                Enter Practice Flight
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-lg text-xs transition flex items-center gap-1"
            >
              <span>Take Flight!</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

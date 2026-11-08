'use client';

import React, { useState } from 'react';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Sparkles, 
  Play, 
  Cpu, 
  Flame, 
  Gamepad2,
  Check,
  Rocket,
  Zap,
  Radio
} from 'lucide-react';

interface AiLevelGeneratorProps {
  onGenerateAndPlay: (prompt: string) => void;
}

const PRESET_PROMPTS = [
  { 
    label: '⚡ Quantum Grid Surge', 
    prompt: 'Dense rotating zappers, vertical plasma barriers, and high-density shard formations',
    icon: '⚡'
  },
  { 
    label: '🚀 Seeker Missile Barrage', 
    prompt: 'Rapid-fire tracking missiles with evasive corridors and supersonic warning times',
    icon: '🚀'
  },
  { 
    label: '🤖 Titan Vehicle Lab', 
    prompt: 'Frequent Gravity Drifter, Mech Breaker, and Warp Cycle vehicle drops with long coin cascades',
    icon: '🤖'
  },
  { 
    label: '🌌 Supersonic Hyper-Cruise', 
    prompt: 'High initial cruise velocity with wide zapper gaps designed for record distance flight attempts',
    icon: '🌌'
  },
];

export default function AiLevelGenerator({ onGenerateAndPlay }: AiLevelGeneratorProps) {
  const [prompt, setPrompt] = useState<string>('Dense rotating zappers with frequent Gravity Drifter drops and shard streams');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<boolean>(false);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    sounds.playCoin();

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
      sounds.playPowerup();
      onGenerateAndPlay(prompt);
    }, 600);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
            ✨
          </div>
        </div>
        <div>
          <h3 className="text-base font-black text-white tracking-wide">
            AI HAZARD & FLIGHT <span className="text-purple-400">ARCHITECT</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Synthesize Procedural Facility Waves & Threat Formations from Natural Language
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <div className="text-[11px] text-zinc-500 uppercase mb-2">Preset AI Flight Parameters</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_PROMPTS.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setPrompt(p.prompt);
                sounds.playJump(false);
              }}
              className="text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition hover:border-purple-500/50"
            >
              <div className="font-bold text-white mb-0.5 flex items-center gap-1.5">
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </div>
              <div className="text-[10px] text-zinc-500 line-clamp-1">{p.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Describe Your Custom Facility Wave Parameters</span>
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Extreme rotating zappers, dense homing missiles, and lots of floating Solana Shards..."
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-zinc-600 outline-none transition resize-none"
        />
      </div>

      {/* Action Button */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Compiles into 60 FPS procedural wave parameters</span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Wave...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Synthesize & Launch Flight</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

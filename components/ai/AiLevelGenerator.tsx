'use client';

import React, { useState } from 'react';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Sparkles, 
  Play, 
  Cpu, 
  Flame, 
  Cloud, 
  Gamepad2,
  Check
} from 'lucide-react';

interface AiLevelGeneratorProps {
  onGenerateAndPlay: (prompt: string) => void;
}

const PRESET_PROMPTS = [
  { label: '🔥 Brutal Lava Fortress', prompt: 'hardcore lava castle with fire obstacles, jumping pits and bowser boss' },
  { label: '☁️ High-Altitude Skyway', prompt: 'high altitude sky level with springboards, trampolines and 25 floating coins' },
  { label: '🕳️ Underground Mempool Rush', prompt: 'underground blue stone cave with piranha pipes and high coin caches' },
  { label: '⚡ Speedrun Sprint', prompt: 'flat speedrun gauntlet with springboards and coin cascades for sub-30s speedrun' },
];

export default function AiLevelGenerator({ onGenerateAndPlay }: AiLevelGeneratorProps) {
  const [prompt, setPrompt] = useState<string>('hardcore sky trampolines with lots of coins and 3 koopas');
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
            AI LEVEL <span className="text-purple-400">ARCHITECT</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Generate Solvable, Balanced Mario Tilemaps from Natural Language Prompts
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <div className="text-[11px] text-zinc-500 uppercase mb-2">Preset AI Blueprints</div>
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
              <div className="font-bold text-white mb-0.5">{p.label}</div>
              <div className="text-[10px] text-zinc-500 line-clamp-1">{p.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Prompt Box */}
      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl mb-4">
        <label className="block text-xs text-zinc-400 mb-2">
          Natural Language Prompt (Describe Level Theme, Obstacles & Physics)
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono resize-none"
          placeholder="e.g. Generate high sky trampolines with cloud bridges, 20 gold coins, and 2 koopas..."
        />
      </div>

      {/* Compile & Play Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black py-3 rounded-xl font-mono text-xs transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        <span>{isGenerating ? 'Compiling AI Tilemap Matrix...' : 'Generate & Play AI Level'}</span>
      </button>

      {generatedSuccess && (
        <div className="mt-3 p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-xs text-purple-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>Level compiled successfully! Switched to AI Matrix level in the Play tab.</span>
        </div>
      )}
    </div>
  );
}

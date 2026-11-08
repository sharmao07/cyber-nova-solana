'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'aria' | 'user';
  text: string;
  actionExecuted?: string;
}

interface OracleAriaProps {
  onAirdropRequested: () => void;
  onSwapSuggested: () => void;
  onStakeSuggested: () => void;
}

export default function OracleToad({
  onAirdropRequested,
  onSwapSuggested,
  onStakeSuggested,
}: OracleAriaProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'aria',
      text: '⚡ Subnet connection established! I am A.R.I.A. (Autonomous Runner Intelligence Agent), your on-chain tactical cyber copilot. Ask me to execute airdrops, swap $SHARD on the AMM, deposit into the solar staking reactor, or explain speedrun telemetry!',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    sounds.playJump(false);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = '';
      let action: string | undefined = undefined;

      if (lower.includes('airdrop') || lower.includes('faucet') || lower.includes('sol')) {
        reply = '⚡ Airdrop protocol executed! I have disbursed 0.5 Devnet SOL directly from our funded treasury keypair to your burner wallet.';
        action = 'AIRDROP';
        onAirdropRequested();
      } else if (lower.includes('swap') || lower.includes('dex') || lower.includes('shard') || lower.includes('coin')) {
        reply = '🔄 Routing to Quantum Swap AMM! You can exchange your in-game energy shards collected from matrix blocks directly for real Devnet SOL via our constant-product liquidity pool.';
        action = 'SWAP';
        onSwapSuggested();
      } else if (lower.includes('stake') || lower.includes('yield') || lower.includes('reactor') || lower.includes('farm')) {
        reply = '🌱 Solar Staking Reactor online: Earn 18.5% streaming APY while unlocking in-game Kinetic Energy Shields and Shard Magnetism!';
        action = 'STAKE';
        onStakeSuggested();
      } else if (lower.includes('missile') || lower.includes('seeker') || lower.includes('homing') || lower.includes('dodge')) {
        reply = '🚀 Homing Missile Evasion Protocol: When the red [ ! ] siren tracking alarm sounds, Nova has 36-75 frames to shift altitude. Wait for the alarm to lock, then tap thrust or cut engines to glide out of its flight corridor!';
      } else if (lower.includes('zapper') || lower.includes('laser') || lower.includes('hazard')) {
        reply = '⚡ Quantum Zapper Clearance: Rotating and diagonal zappers feature a dynamic clearance window. Gauge the gap above versus below—if gap > 90px, feather your thrusters to glide through the upper sector safely.';
      } else if (lower.includes('vehicle') || lower.includes('drifter') || lower.includes('mech') || lower.includes('cycle')) {
        reply = '🏎️ Experimental Cyber Vehicles: 1) Gravity Drifter inverts gravity on tap, 2) Mech Breaker stomps with heavy hydraulic jumps, 3) Warp Cycle blazes at 1.4x cruise speed. All vehicles feature Eject-Armor that absorbs 1 fatal hit!';
      } else if (lower.includes('ai') || lower.includes('autopilot') || lower.includes('autonomous') || lower.includes('aria')) {
        reply = '🤖 Toggle "AI Copilot" on the top toolbar! I will actively evaluate terrain obstacles, compute jump physics vectors, evade hazards, and autonomously sign speedrun attestations to Solana Devnet with my own ed25519 keypair.';
      } else if (lower.includes('track') || lower.includes('hackathon') || lower.includes('mlh')) {
        reply = '🏆 Cyber Nova qualifies for all 5 MLH tracks: 1. Gaming (Original 60fps platformer + verified state), 2. AI (Autonomous Agent with wallet + natural language AI), 3. DeFi (AMM swap + yield staking + wager escrow), 4. Beginner (1-click burner wallet + funded faucet + ELI5 inspector), 5. Top 3 Overall (sub-second speed & true composability).';
      } else {
        reply = `✨ A.R.I.A. telemetry parsed query: "${userText}". Try asking to "Airdrop SOL", "Swap shards", "Evade missiles", or "Explain staking perks"!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `t_${Date.now()}`,
          sender: 'aria',
          text: reply,
          actionExecuted: action,
        },
      ]);
      setIsThinking(false);
      sounds.playCoin();
    }, 600);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800 mb-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 p-0.5 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg text-cyan-400">
            🤖
          </div>
        </div>
        <div>
          <h3 className="text-base font-black text-white tracking-wide">
            A.R.I.A. <span className="text-cyan-400">AI AGENT</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Autonomous Runner Intelligence Agent & Solana Copilot
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'aria' && (
              <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 flex-shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-500 text-zinc-950 font-bold ml-auto rounded-tr-none'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 flex-shrink-0">
              🤖
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 flex-shrink-0">
        <button
          onClick={() => setInput('Airdrop me 0.5 SOL')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          ⚡ Airdrop 0.5 SOL
        </button>
        <button
          onClick={() => setInput('How do I evade homing missiles?')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          🚀 Evade Missiles
        </button>
        <button
          onClick={() => setInput('Swap 50 shards for SOL')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          🔄 Swap Shards to SOL
        </button>
        <button
          onClick={() => setInput('Explain cyber vehicles and eject armor')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          🏎️ Cyber Vehicles
        </button>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask A.R.I.A. anything about Solana or Cyber Nova..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-xl transition disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

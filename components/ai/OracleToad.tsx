'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  Coins, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'toad' | 'user';
  text: string;
  actionExecuted?: string;
}

interface OracleToadProps {
  onAirdropRequested: () => void;
  onSwapSuggested: () => void;
  onStakeSuggested: () => void;
}

export default function OracleToad({
  onAirdropRequested,
  onSwapSuggested,
  onStakeSuggested,
}: OracleToadProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'toad',
      text: '🍄 Greetings adventurer! I am Oracle Toad, your on-chain Solana and Mushroom Kingdom AI advisor. Ask me anything about swapping coins, staking SOL, beating Bowser, or running autonomous AI speedruns!',
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
        reply = '⚡ Airdrop request initiated! I’ve triggered your instant 0.5 Devnet SOL disbursement directly from our funded treasury keypair.';
        action = 'AIRDROP';
        onAirdropRequested();
      } else if (lower.includes('swap') || lower.includes('dex') || lower.includes('sell coin') || lower.includes('buy coin')) {
        reply = '🍄 Opening Mushroom Swap AMM! You can exchange your in-game coins collected from breaking blocks directly into real Devnet SOL with 0.3% LP fees.';
        action = 'SWAP';
        onSwapSuggested();
      } else if (lower.includes('stake') || lower.includes('yield') || lower.includes('farm')) {
        reply = '🌱 Staking in Yoshi’s Farm earns 18.5% streaming APY and immediately grants you the Coin Magnet aura and Super Jump perk in Mario!';
        action = 'STAKE';
        onStakeSuggested();
      } else if (lower.includes('bowser') || lower.includes('1-4') || lower.includes('boss') || lower.includes('castle')) {
        reply = '🏰 Pro tip for World 1-4: Bowser periodically leaps into the air. Time your dash to run under his jump or sprint along the upper brick ledge to hit the Golden Solana Axe, collapsing the bridge into the lava pit!';
      } else if (lower.includes('ai') || lower.includes('autopilot') || lower.includes('autonomous')) {
        reply = '🤖 Toggle the "AI Autopilot" button above the game screen! Toad AI uses real-time obstacle lookahead and parabolic jump physics to complete speedruns and signs its own on-chain verification transaction with its dedicated Solana wallet.';
      } else if (lower.includes('track') || lower.includes('hackathon') || lower.includes('mlh') || lower.includes('rules')) {
        reply = '🏆 Super Solario covers all 5 MLH tracks: 1. Gaming (playable platformer + verifiable state), 2. AI (Autonomous Agent with wallet + natural language AI), 3. DeFi (AMM swap + yield staking + wager escrow), 4. Beginner (1-click burner wallet + funded faucet + ELI5 inspector), 5. Top 3 Overall (sub-second speed & true composability).';
      } else {
        reply = `✨ I analyzed your query: "${userText}". Try asking me to "Airdrop SOL", "Swap coins", "How to beat Bowser", or "Explain staking perks"!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `t_${Date.now()}`,
          sender: 'toad',
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
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 p-0.5 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
            🍄
          </div>
        </div>
        <div>
          <h3 className="text-base font-black text-white tracking-wide">
            ORACLE TOAD <span className="text-amber-400">AI AGENT</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Natural Language Solana In-Game Copilot
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
            {m.sender === 'toad' && (
              <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-xs flex-shrink-0">
                🍄
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-500 text-zinc-950 font-bold ml-auto rounded-tr-none'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-xs flex-shrink-0">
              🍄
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 flex-shrink-0">
        <button
          onClick={() => setInput('Airdrop me 0.5 SOL')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          ⚡ Airdrop 0.5 SOL
        </button>
        <button
          onClick={() => setInput('How do I beat Bowser in World 1-4?')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          🏰 How to Beat Bowser
        </button>
        <button
          onClick={() => setInput('Swap 25 coins for SOL')}
          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 whitespace-nowrap transition"
        >
          🍄 Swap Coins to SOL
        </button>
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask Toad anything about Solana or Mario..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          className="p-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl transition disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

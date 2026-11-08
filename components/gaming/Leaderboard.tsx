'use client';

import React, { useState, useEffect } from 'react';
import { getStoredLeaderboard } from '@/lib/solana/transactions';
import { SpeedrunLeaderboardEntry } from '@/lib/solana/types';
import { 
  Trophy, 
  Bot, 
  User, 
  Timer, 
  Coins, 
  ExternalLink, 
  ShieldCheck,
  Medal
} from 'lucide-react';

export default function Leaderboard() {
  const [entries, setEntries] = useState<SpeedrunLeaderboardEntry[]>([]);
  const [filterWorld, setFilterWorld] = useState<string>('ALL');

  useEffect(() => {
    setEntries(getStoredLeaderboard());
  }, []);

  const filtered = entries.filter(e => filterWorld === 'ALL' || e.world === filterWorld);

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
              🏆
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              ON-CHAIN SPEEDRUN <span className="text-amber-400">LEADERBOARD</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Cryptographically Attested Runs • Verified on Solana Devnet
            </p>
          </div>
        </div>

        {/* Filter World Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl text-xs">
          {['ALL', '1-1', '1-2', '1-3', '1-4'].map(w => (
            <button
              key={w}
              onClick={() => setFilterWorld(w)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterWorld === w
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {w === 'ALL' ? 'All Worlds' : `World ${w}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Player / Agent</th>
              <th className="py-2.5 px-3">World</th>
              <th className="py-2.5 px-3">Clear Time</th>
              <th className="py-2.5 px-3">$COIN</th>
              <th className="py-2.5 px-3">Score</th>
              <th className="py-2.5 px-3 text-right">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.map((item, idx) => {
              const isTop3 = idx < 3;
              const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

              return (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition">
                  {/* Rank */}
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-1">
                    <span>{rankIcon}</span>
                  </td>

                  {/* Player Address & Type */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {item.isAiAgent ? (
                        <span className="flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] px-1.5 py-0.2 rounded font-bold">
                          <Bot className="w-3 h-3" />
                          <span>AI Agent</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-1.5 py-0.2 rounded font-bold">
                          <User className="w-3 h-3" />
                          <span>Human</span>
                        </span>
                      )}
                      <span className="text-zinc-300 font-mono">
                        {item.playerAddress.slice(0, 4)}...{item.playerAddress.slice(-4)}
                      </span>
                    </div>
                  </td>

                  {/* World */}
                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold">
                      {item.world}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {item.timeSeconds.toFixed(1)}s
                  </td>

                  {/* Coins */}
                  <td className="py-3 px-3 text-amber-300 font-bold">
                    +{item.coins}
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3 font-bold text-white">
                    {item.score.toLocaleString()}
                  </td>

                  {/* Proof */}
                  <td className="py-3 px-3 text-right">
                    <a
                      href={item.solscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2 py-1 rounded text-[10px] transition"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Solscan</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getStoredLeaderboard } from '@/lib/solana/transactions';
import { SpeedrunLeaderboardEntry } from '@/lib/solana/types';
import { 
  Trophy, 
  Bot, 
  User, 
  Coins, 
  ExternalLink, 
  ShieldCheck,
  Rocket,
  Zap
} from 'lucide-react';

export default function Leaderboard() {
  const [entries, setEntries] = useState<SpeedrunLeaderboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<string>('ALL');

  useEffect(() => {
    setEntries(getStoredLeaderboard());
  }, []);

  const getDistanceNumber = (world: string): number => {
    const num = parseInt(world.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const filtered = entries.filter(e => {
    if (filterMode === 'ALL') return true;
    if (filterMode === 'AI') return e.isAiAgent;
    if (filterMode === 'HUMAN') return !e.isAiAgent;
    if (filterMode === '2000+') return getDistanceNumber(e.world) >= 2000;
    if (filterMode === '1000+') return getDistanceNumber(e.world) >= 1000;
    return true;
  });

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
              SOL-JET FLIGHT <span className="text-amber-400">LEADERBOARD</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Cryptographically Attested Runs • Verified on Solana Devnet
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl text-xs">
          {[
            { id: 'ALL', label: 'All Flights' },
            { id: '2000+', label: '2,000m+' },
            { id: '1000+', label: '1,000m+' },
            { id: 'AI', label: 'AI Agent' },
            { id: 'HUMAN', label: 'Human' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterMode === f.id
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {f.label}
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
              <th className="py-2.5 px-3">Runner / Pilot</th>
              <th className="py-2.5 px-3">Distance</th>
              <th className="py-2.5 px-3">Shards</th>
              <th className="py-2.5 px-3">Score</th>
              <th className="py-2.5 px-3 text-right">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.map((item, idx) => {
              const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
              const displayDistance = item.world.includes('m')
                ? item.world.replace('_RUN', '')
                : `${item.world} Sector`;

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
                        <span className="flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          <Bot className="w-3 h-3" />
                          <span>A.R.I.A. AI</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          <User className="w-3 h-3" />
                          <span>Nova Pilot</span>
                        </span>
                      )}
                      <span className="text-zinc-300 font-mono text-[11px]">
                        {item.playerAddress.slice(0, 4)}...{item.playerAddress.slice(-4)}
                      </span>
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                      <Rocket className="w-3 h-3 text-cyan-400" />
                      <span>{displayDistance}</span>
                    </span>
                  </td>

                  {/* Shards */}
                  <td className="py-3 px-3 text-emerald-300 font-bold">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>+{item.coins}</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3 font-bold text-white tabular-nums">
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

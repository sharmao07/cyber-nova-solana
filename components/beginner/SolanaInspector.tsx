'use client';

import React, { useState } from 'react';
import { SolanaTransactionRecord } from '@/lib/solana/types';
import { 
  ShieldCheck, 
  X, 
  ExternalLink, 
  Zap, 
  BookOpen, 
  Code2, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface SolanaInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: SolanaTransactionRecord[];
}

export default function SolanaInspector({
  isOpen,
  onClose,
  transactions,
}: SolanaInspectorProps) {
  const [activeTab, setActiveTab] = useState<'TX_FEED' | 'SOLANA_101'>('TX_FEED');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-xl h-full bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">
                SOLANA INSPECTOR <span className="text-emerald-400">ELI5</span>
              </h3>
              <p className="text-[10px] text-zinc-400">
                Educational On-Chain Activity & Web3 Mechanics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 text-xs">
          <button
            onClick={() => setActiveTab('TX_FEED')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'TX_FEED'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Recent Transactions ({transactions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SOLANA_101')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'SOLANA_101'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Solana 101 (Beginner Guide)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'TX_FEED' ? (
            transactions.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-400" />
                <p className="text-xs">No transactions recorded yet.</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Complete a level speedrun, swap $COINs, or request an airdrop to see live on-chain attestations!
                </p>
              </div>
            ) : (
              transactions.map(tx => (
                <div
                  key={tx.signature}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-2 hover:border-zinc-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{tx.title}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{tx.description}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                      {tx.status}
                    </span>
                  </div>

                  {/* Gas & Confirmation Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-950 p-2 rounded-lg text-zinc-400 border border-zinc-900">
                    <div>
                      <span>Gas Fee Paid: </span>
                      <strong className="text-emerald-400">~0.000005 SOL ($0.00075)</strong>
                    </div>
                    <div>
                      <span>Block Time: </span>
                      <strong className="text-amber-400">~400ms Finality</strong>
                    </div>
                  </div>

                  {/* ELI5 Explanation */}
                  {tx.pdaExplained && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2.5 text-[11px]">
                      <div className="text-emerald-400 font-bold flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>ELI5: {tx.pdaExplained.concept}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed text-[10px]">
                        {tx.pdaExplained.explanation}
                      </p>
                    </div>
                  )}

                  {/* Solscan Link */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-800/60">
                    <span className="text-zinc-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                    <a
                      href={tx.solscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                    >
                      <span>View on Solscan Devnet</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Solana 101 Guide for Beginners and Hackathon Judges */
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                  <span>⚡ Why Solana for Gaming?</span>
                </h4>
                <p className="text-zinc-400 text-[11px] mb-2">
                  Traditional blockchains like Ethereum have 12-second block times and fees up to $30 per transaction. This makes real-time gameplay impossible.
                </p>
                <p className="text-zinc-400 text-[11px]">
                  Solana delivers <strong>400 millisecond slot times</strong> and transaction fees around <strong>0.000005 SOL ($0.0007)</strong>. That allows us to attest 60fps Mario speedruns, swap coins in an AMM, and run autonomous AI agents in real time!
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                  <span>🔑 What is a Burner Wallet?</span>
                </h4>
                <p className="text-zinc-400 text-[11px]">
                  A burner wallet is a local cryptographic ed25519 keypair generated client-side and saved in browser storage. It gives first-time users and hackathon judges instant zero-friction onboarding without needing Phantom installed.
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                  <span>🤖 How the Autonomous AI Works</span>
                </h4>
                <p className="text-zinc-400 text-[11px]">
                  Our AI Agent (&quot;Toad AI&quot;) is not a fake UI bot. It holds its own dedicated Solana keypair, scans level tiles ahead, calculates jump parabolic physics in real time, and autonomously signs speedrun attestations with its own wallet on Solana Devnet!
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                  <span>🪙 Mushroom Swap AMM Formula</span>
                </h4>
                <p className="text-zinc-400 text-[11px]">
                  The in-game DEX uses the constant product equation: <code>x * y = k</code>. When you sell $COINs collected in Mario levels, the liquidity pool automatically computes your SOL output, updates the bonding curve reserves, and charges a 0.3% LP fee.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Terminal, 
  ExternalLink, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Clock, 
  Database,
  Layers
} from 'lucide-react';
import { SolanaTransactionRecord } from '@/lib/solana/types';
import { getStoredTransactions } from '@/lib/solana/transactions';
import { fetchClusterStatus, ClusterStatus } from '@/lib/solana/connection';

interface SolanaInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolanaInspector: React.FC<SolanaInspectorProps> = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState<SolanaTransactionRecord[]>([]);
  const [cluster, setCluster] = useState<ClusterStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'txs' | 'guide'>('txs');

  const refreshList = () => {
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    refreshList();
    fetchClusterStatus().then(setCluster);

    const onTxAdded = () => {
      refreshList();
    };

    window.addEventListener('solarena_tx_added', onTxAdded);
    return () => window.removeEventListener('solarena_tx_added', onTxAdded);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-950/95 backdrop-blur-xl border-l border-cyan-800/40 shadow-2xl flex flex-col text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-sm tracking-wide text-white">SOLANA ARCHITECTURE INSPECTOR</h3>
            <p className="text-[11px] text-slate-400">Real-Time Devnet State & Web3 Primer</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cluster Telemetry Strip */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/40 border-b border-slate-800/60 text-xs">
        <div className="flex flex-col bg-slate-950/60 p-2 rounded border border-slate-800/40">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>DEVNET TPS</span>
          </div>
          <span className="font-mono font-bold text-cyan-300 mt-0.5">
            {cluster ? `${cluster.tps.toLocaleString()}` : '2,540'}
          </span>
        </div>

        <div className="flex flex-col bg-slate-950/60 p-2 rounded border border-slate-800/40">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>SLOT HEIGHT</span>
          </div>
          <span className="font-mono font-bold text-purple-300 mt-0.5 text-[11px] truncate">
            {cluster ? `#${cluster.slot}` : '#341,892,100'}
          </span>
        </div>

        <div className="flex flex-col bg-slate-950/60 p-2 rounded border border-slate-800/40">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>FINALITY</span>
          </div>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 text-[11px]">
            ~400 ms
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 space-x-4">
        <button
          onClick={() => setActiveTab('txs')}
          className={`pb-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'txs'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'guide'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Beginner's Solana Guide
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {activeTab === 'txs' ? (
          transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No transactions broadcast yet in this session.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Enter the Coliseum or make an AMM trade to sign your first on-chain move!
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.signature}
                className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-cyan-800/50 transition-all text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300">{tx.title}</span>
                  <a
                    href={tx.solscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    <span>Solscan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">{tx.description}</p>

                {tx.pdaExplained && (
                  <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[10px] space-y-1">
                    <div className="flex items-center space-x-1 text-cyan-300 font-bold uppercase tracking-wider">
                      <Database className="w-3 h-3" />
                      <span>{tx.pdaExplained.concept}</span>
                    </div>
                    <p className="text-slate-300">{tx.pdaExplained.explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/40">
                  <span>Fee: ~{tx.feeSol || 0.000005} SOL ($0.0007)</span>
                  <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )
        ) : (
          <div className="space-y-4 text-xs">
            {/* Guide Card 1 */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <h4>How SolArena Leverages Solana Speed</h4>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Traditional EVM blockchains have 12–15 second block times, making turn-based combat sluggish. Solana processes blocks in ~400ms, enabling real-time combat moves, micro-bets, and instant AI counters signed on-chain without immersion breaks.
              </p>
            </div>

            {/* Guide Card 2 */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                <h4>What is a PDA (Program Derived Address)?</h4>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                PDAs are special accounts derived deterministically from a program ID and seeds (like a user's wallet address or match ID) without a private key. They allow smart contracts to safely custody wager escrow funds and update game state without human custodial risk.
              </p>
            </div>

            {/* Guide Card 3 */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <h4>Why Are Transaction Fees So Low?</h4>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Solana uses Gulf Stream (mempool-less transaction forwarding) and Sealevel (parallel smart contracts runtime). This keeps average transaction fees at 5,000 Lamports (~0.000005 SOL or fractions of a cent), making micro-transactions for each turn economically viable.
              </p>
            </div>

            {/* Guide Card 4 */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <h4>Autonomous AI with On-Chain Wallets</h4>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Rather than being an off-chain chatbot, SENTINEL-X9 holds its own Solana keypair. When taking a turn, the AI computes its strategy, creates an on-chain transaction instruction, signs it with its private key, and broadcasts it to Devnet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

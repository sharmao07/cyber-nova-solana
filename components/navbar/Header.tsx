'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Coins, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BurnerWallet, getOrCreateBurnerWallet, requestDevnetAirdrop } from '@/lib/solana/burner-wallet';
import { fetchClusterStatus, getAccountBalance, ClusterStatus } from '@/lib/solana/connection';
import { sounds } from '@/lib/audio/sound-effects';

interface HeaderProps {
  onToggleInspector: () => void;
  inspectorOpen: boolean;
  txCount: number;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  wallet: BurnerWallet | null;
  setWallet: React.Dispatch<React.SetStateAction<BurnerWallet | null>>;
  activeTab: 'arena' | 'amm' | 'vault';
  setActiveTab: (tab: 'arena' | 'amm' | 'vault') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleInspector,
  inspectorOpen,
  txCount,
  balance,
  setBalance,
  wallet,
  setWallet,
  activeTab,
  setActiveTab,
}) => {
  const [cluster, setCluster] = useState<ClusterStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Initial wallet
    const w = getOrCreateBurnerWallet();
    setWallet(w);

    // Initial cluster status
    fetchClusterStatus().then(setCluster);
    const clusterInterval = setInterval(() => {
      fetchClusterStatus().then(setCluster);
    }, 15000);

    return () => clearInterval(clusterInterval);
  }, [setWallet]);

  useEffect(() => {
    if (wallet) {
      getAccountBalance(wallet.publicKeyBase58).then(setBalance);
    }
  }, [wallet, setBalance]);

  const handleCopy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.publicKeyBase58);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    if (!wallet || isAirdropping) return;
    setIsAirdropping(true);
    sounds.playCoin();

    const res = await requestDevnetAirdrop(wallet.publicKeyBase58, 0.5);
    if (res.success) {
      setTimeout(async () => {
        const newBal = await getAccountBalance(wallet.publicKeyBase58);
        setBalance(newBal);
        setIsAirdropping(false);
      }, 1500);
    } else {
      setIsAirdropping(false);
    }
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/40 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
                  SOLARENA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Devnet
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                Autonomous AI Battler & DeFi Coliseum
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('arena')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'arena'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Coliseum Arena
            </button>
            <button
              onClick={() => setActiveTab('amm')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'amm'
                  ? 'bg-gradient-to-r from-fuchsia-500/20 to-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm shadow-fuchsia-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              AMM Relic Shop
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'vault'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Yield Vault (14.8% APY)
            </button>
          </nav>

          {/* Action Center: Audio, Network & Burner Wallet */}
          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Solana Under-the-Hood Inspector Trigger */}
            <button
              onClick={onToggleInspector}
              className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                inspectorOpen
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/50'
              }`}
              title="Inspect On-Chain Transactions & Solana Architecture"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Solana 101</span>
              {txCount > 0 && (
                <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950">
                  {txCount}
                </span>
              )}
            </button>

            {/* Burner Wallet Card */}
            {wallet && (
              <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-cyan-800/50 rounded-lg p-1.5 pl-2.5">
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                      {wallet.publicKeyBase58.slice(0, 4)}...{wallet.publicKeyBase58.slice(-4)}
                    </span>
                    <button
                      onClick={handleCopy}
                      title="Copy Address"
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={`https://solscan.io/account/${wallet.publicKeyBase58}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on Solscan"
                      className="text-slate-500 hover:text-cyan-400"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {balance.toFixed(3)} SOL
                    </span>
                  </div>
                </div>

                {/* Instant Airdrop Button */}
                <button
                  onClick={handleAirdrop}
                  disabled={isAirdropping}
                  title="Airdrop 0.5 Devnet SOL instantly"
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-[11px] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isAirdropping ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">+0.5 SOL</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

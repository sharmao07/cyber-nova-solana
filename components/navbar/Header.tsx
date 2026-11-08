'use client';

import React, { useState, useEffect } from 'react';
import { 
  getOrCreateBurnerWallet, 
  requestDevnetAirdrop, 
  BurnerWallet 
} from '@/lib/solana/burner-wallet';
import { 
  fetchClusterStatus, 
  getAccountBalance, 
  ClusterStatus 
} from '@/lib/solana/connection';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Zap, 
  Wallet, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Copy,
  Check,
  Gamepad2,
  Rocket
} from 'lucide-react';

interface HeaderProps {
  onOpenInspector: () => void;
  onOpenHowToPlay?: () => void;
  onOpenDeployGuide?: () => void;
  txCount: number;
  inGameCoins: number;
  onBalanceUpdate?: (bal: number) => void;
}

export default function Header({
  onOpenInspector,
  onOpenHowToPlay,
  onOpenDeployGuide,
  txCount,
  inGameCoins,
  onBalanceUpdate,
}: HeaderProps) {
  const [wallet, setWallet] = useState<BurnerWallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [cluster, setCluster] = useState<ClusterStatus | null>(null);
  const [isAirdropping, setIsAirdropping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const w = getOrCreateBurnerWallet();
    setWallet(w);

    getAccountBalance(w.publicKeyBase58).then(bal => {
      setBalance(bal);
      if (onBalanceUpdate) onBalanceUpdate(bal);
    });

    fetchClusterStatus().then(setCluster);
    setIsMuted(sounds.isMuted);

    const interval = setInterval(() => {
      fetchClusterStatus().then(setCluster);
      if (w) {
        getAccountBalance(w.publicKeyBase58).then(bal => {
          setBalance(bal);
          if (onBalanceUpdate) onBalanceUpdate(bal);
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleAirdrop = async () => {
    if (!wallet || isAirdropping) return;
    setIsAirdropping(true);
    sounds.playCoin();

    try {
      const res = await requestDevnetAirdrop(wallet.publicKeyBase58, 0.5);
      if (res.success) {
        setTimeout(async () => {
          const newBal = await getAccountBalance(wallet.publicKeyBase58);
          setBalance(newBal);
          if (onBalanceUpdate) onBalanceUpdate(newBal);
        }, 1500);
      }
    } catch (err) {
      console.error('Airdrop failed:', err);
    } finally {
      setIsAirdropping(false);
    }
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playJump();
  };

  const copyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.publicKeyBase58);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = wallet 
    ? `${wallet.publicKeyBase58.slice(0, 4)}...${wallet.publicKeyBase58.slice(-4)}` 
    : 'Connecting...';

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-emerald-400 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center text-xl text-cyan-400">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black tracking-wider text-white">
                CYBER <span className="text-cyan-400">NOVA</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Solana Devnet
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Sol-Runner Cyber-Platformer • Autonomous AI • DeFi AMM & Staking
            </p>
          </div>
        </div>

        {/* Live Solana Network Stats */}
        <div className="hidden lg:flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-500">TPS:</span>
            <span className="font-semibold text-emerald-400">{cluster?.tps?.toLocaleString() || '2,480'}</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Slot:</span>
            <span>{cluster?.slot ? `#${cluster.slot}` : 'Loading...'}</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Latency:</span>
            <span className="text-amber-400">{cluster?.latencyMs || 120}ms</span>
          </div>
        </div>

        {/* User Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Energy Shards Counter */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>{inGameCoins}</span>
            <span className="text-[10px] text-emerald-400/80">$SHARD</span>
          </div>

          {/* Devnet SOL Wallet Card */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <button
              onClick={copyAddress}
              title="Click to copy public address"
              className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white transition"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>{shortAddr}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
              )}
            </button>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {balance.toFixed(3)} SOL
            </span>
          </div>

          {/* How to Play Guide Shortcut */}
          {onOpenHowToPlay && (
            <button
              onClick={onOpenHowToPlay}
              title="Open CYBER NOVA Game Guide & Controls"
              className="hidden lg:flex items-center gap-1.5 bg-zinc-900 border border-cyan-500/40 hover:border-cyan-400 px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-300 transition"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guide</span>
            </button>
          )}

          {/* Devnet Deploy Guide Shortcut */}
          {onOpenDeployGuide && (
            <button
              onClick={onOpenDeployGuide}
              title="Open Solana Devnet Deployment Guide"
              className="hidden xl:flex items-center gap-1.5 bg-zinc-900 border border-emerald-500/40 hover:border-emerald-400 px-2.5 py-1.5 rounded-lg text-xs font-mono text-emerald-300 transition"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deploy</span>
            </button>
          )}

          {/* 1-Click Devnet Faucet Button */}
          <button
            onClick={handleAirdrop}
            disabled={isAirdropping}
            title="Instant 1-Click Airdrop of 0.5 Devnet SOL from funded treasury"
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isAirdropping ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Airdrop</span>
            <span>+0.5 SOL</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Solana Inspector Button */}
          <button
            onClick={onOpenInspector}
            className="relative flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-200 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Inspector</span>
            {txCount > 0 && (
              <span className="bg-emerald-500 text-zinc-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {txCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

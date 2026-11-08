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
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5 font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 text-sm font-bold shadow-inner">
            ⚡
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wider text-white">
              CYBER <span className="text-cyan-400">NOVA</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-900 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              Devnet
            </span>
          </div>
        </div>

        {/* Live Network Health (Muted, Calm) */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1 rounded-lg text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-500">TPS</span>
            <span className="font-semibold text-zinc-200">{cluster?.tps?.toLocaleString() || '2,480'}</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Slot</span>
            <span className="text-zinc-300">#{cluster?.slot || '...'}</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Latency</span>
            <span className="text-zinc-300">{cluster?.latencyMs || 120}ms</span>
          </div>
        </div>

        {/* User Balance & Actions */}
        <div className="flex items-center gap-2">
          {/* Energy Shards */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{inGameCoins}</span>
            <span className="text-[10px] text-zinc-500 font-normal">$SHARD</span>
          </div>

          {/* Devnet SOL Wallet Card */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <button
              onClick={copyAddress}
              title="Click to copy public address"
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{shortAddr}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
              )}
            </button>
            <div className="h-3.5 w-px bg-zinc-800" />
            <span className="text-xs font-semibold text-white">
              {balance.toFixed(2)} SOL
            </span>
          </div>

          {/* 1-Click Devnet Faucet Button */}
          <button
            onClick={handleAirdrop}
            disabled={isAirdropping}
            title="Instant 1-Click Airdrop of 0.5 Devnet SOL from funded treasury"
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-zinc-950 font-bold px-3 py-1 rounded-lg text-xs transition disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isAirdropping ? 'animate-spin' : ''}`} />
            <span>+0.5 SOL</span>
          </button>

          {/* Guide Shortcuts */}
          {onOpenHowToPlay && (
            <button
              onClick={onOpenHowToPlay}
              title="Open CYBER NOVA Game Guide & Controls"
              className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Guide</span>
            </button>
          )}

          {onOpenDeployGuide && (
            <button
              onClick={onOpenDeployGuide}
              title="Open Solana Devnet Deployment Guide"
              className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            >
              <Rocket className="w-3.5 h-3.5 text-zinc-400" />
              <span>Deploy</span>
            </button>
          )}

          {/* Solana Inspector Button */}
          <button
            onClick={onOpenInspector}
            title="Open Solana Inspector (ELI5 Mode)"
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-lg text-xs text-zinc-300 hover:text-white transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Inspector</span>
            {txCount > 0 && (
              <span className="bg-zinc-800 text-zinc-200 font-bold text-[10px] px-1.5 py-0.2 rounded-full border border-zinc-700">
                {txCount}
              </span>
            )}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}

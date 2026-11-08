'use client';

import React, { useState } from 'react';
import { executeSpeedrunWagerEscrow } from '@/lib/solana/transactions';
import { getOrCreateBurnerWallet } from '@/lib/solana/burner-wallet';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Timer, 
  ExternalLink, 
  Zap 
} from 'lucide-react';

interface WagerEscrowProps {
  solBalance: number;
  onWagerLocked: (wagerSol: number) => void;
  onTxConfirmed?: (sig: string) => void;
}

export default function WagerEscrow({
  solBalance,
  onWagerLocked,
  onTxConfirmed,
}: WagerEscrowProps) {
  const [selectedWager, setSelectedWager] = useState<number>(0.05);
  const [selectedWorld, setSelectedWorld] = useState<string>('1-1');
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [activeWager, setActiveWager] = useState<{ amount: number; world: string; signature: string } | null>(null);

  const targetTime = selectedWorld === '1-4' ? 75 : 50;
  const potentialPayout = selectedWager * 1.5;

  const handleLockWager = async () => {
    if (selectedWager > solBalance || isLocking) return;
    setIsLocking(true);
    sounds.playCoin();

    try {
      const wallet = getOrCreateBurnerWallet();
      const sig = await executeSpeedrunWagerEscrow(wallet.keypair, selectedWager, selectedWorld);
      setActiveWager({
        amount: selectedWager,
        world: selectedWorld,
        signature: sig,
      });
      onWagerLocked(selectedWager);
      if (onTxConfirmed) onTxConfirmed(sig);
      sounds.playPowerup();
    } catch (err) {
      console.error('Wager lock failed:', err);
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
              👑
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              SPEEDRUN <span className="text-amber-400">WAGER ESCROW</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              High-Stakes Speedrun Bounty • 150% Payout on Victory
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase">Multiplier</div>
          <div className="text-sm font-black text-amber-400">1.5x Bounty</div>
        </div>
      </div>

      {/* Rules Box */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-xs space-y-2 text-zinc-300">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Timer className="w-4 h-4" />
          <span>Rules: Clear Sector {selectedWorld} in under {targetTime}s</span>
        </div>
        <p className="text-zinc-400 text-[11px]">
          Lock SOL into the decentralized escrow. If you reach the terminal pylon / core fuse before the timer expires without losing your shields, the escrow automatically disburses your original wager + 50% bounty bonus!
        </p>
      </div>

      {/* Select Sector */}
      <div className="mt-4">
        <div className="text-xs text-zinc-400 mb-2">Select Target Sector</div>
        <div className="grid grid-cols-3 gap-2">
          {['1-1', '1-2', '1-4'].map(w => (
            <button
              key={w}
              onClick={() => setSelectedWorld(w)}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                selectedWorld === w
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Sector {w}
            </button>
          ))}
        </div>
      </div>

      {/* Select Wager Amount */}
      <div className="mt-4">
        <div className="text-xs text-zinc-400 mb-2">Select Wager Amount</div>
        <div className="grid grid-cols-3 gap-2">
          {[0.05, 0.1, 0.25].map(amt => (
            <button
              key={amt}
              onClick={() => setSelectedWager(amt)}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                selectedWager === amt
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {amt} SOL
            </button>
          ))}
        </div>
      </div>

      {/* Projected Payout */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase">Target Payout</div>
          <div className="text-lg font-black text-emerald-400">
            {potentialPayout.toFixed(3)} SOL
          </div>
        </div>
        <div className="text-right text-xs text-zinc-400">
          <span>Wager: <strong>{selectedWager} SOL</strong></span>
          <br />
          <span>Profit: <strong className="text-emerald-400">+{(potentialPayout - selectedWager).toFixed(3)} SOL</strong></span>
        </div>
      </div>

      {/* Lock Wager Button */}
      <button
        onClick={handleLockWager}
        disabled={isLocking || selectedWager > solBalance}
        className="w-full mt-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-black py-3 rounded-xl font-mono text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Flame className={`w-4 h-4 ${isLocking ? 'animate-spin' : ''}`} />
        <span>
          {isLocking ? 'Locking into Escrow...' : `Lock ${selectedWager} SOL Wager on Solana`}
        </span>
      </button>

      {/* Active Escrow Status */}
      {activeWager && (
        <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span>🔥 Escrow Locked: World {activeWager.world} ({activeWager.amount} SOL)</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-1">
            Now switch to the Play tab and beat World {activeWager.world} to claim your bounty!
          </p>
          <a
            href={`https://solscan.io/tx/${activeWager.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] underline text-zinc-300 hover:text-white break-all"
          >
            <span>{activeWager.signature}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
}

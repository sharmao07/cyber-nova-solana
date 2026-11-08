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
  Zap,
  Rocket
} from 'lucide-react';

interface WagerEscrowProps {
  solBalance: number;
  onWagerLocked: (wagerSol: number) => void;
  onTxConfirmed?: (sig: string) => void;
}

const DISTANCE_TIERS = [
  { id: '800m', label: '800m Recon', multiplier: 1.4, desc: 'Beginner endurance flight' },
  { id: '1500m', label: '1,500m Penetration', multiplier: 1.8, desc: 'Advanced hazard evasion' },
  { id: '2500m', label: '2,500m Apex', multiplier: 2.2, desc: 'Master cyber-runner flight' },
];

export default function WagerEscrow({
  solBalance,
  onWagerLocked,
  onTxConfirmed,
}: WagerEscrowProps) {
  const [selectedWager, setSelectedWager] = useState<number>(0.05);
  const [selectedTier, setSelectedTier] = useState<string>('1500m');
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [activeWager, setActiveWager] = useState<{ amount: number; tier: string; signature: string } | null>(null);

  const activeTierObj = DISTANCE_TIERS.find(t => t.id === selectedTier) || DISTANCE_TIERS[1];
  const potentialPayout = selectedWager * activeTierObj.multiplier;

  const handleLockWager = async () => {
    if (selectedWager > solBalance || isLocking) return;
    setIsLocking(true);
    sounds.playCoin();

    try {
      const wallet = getOrCreateBurnerWallet();
      const sig = await executeSpeedrunWagerEscrow(wallet.keypair, selectedWager, selectedTier);
      setActiveWager({
        amount: selectedWager,
        tier: selectedTier,
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
              DISTANCE <span className="text-amber-400">WAGER ESCROW</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              High-Stakes Flight Bounties • Up to 2.2x Payout on Victory
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase">Multiplier</div>
          <div className="text-sm font-black text-amber-400">{activeTierObj.multiplier}x Bounty</div>
        </div>
      </div>

      {/* Rules Box */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-xs space-y-2 text-zinc-300">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Rocket className="w-4 h-4" />
          <span>Objective: Reach {activeTierObj.id} Distance in an Endless Flight</span>
        </div>
        <p className="text-zinc-400 text-[11px]">
          Lock SOL into the decentralized escrow account. Pilot Nova through the research facility past {activeTierObj.id} without crashing into quantum zappers or missiles. The smart escrow verifies your on-chain distance attestation and disburses your wager + bonus payout!
        </p>
      </div>

      {/* Select Distance Tier */}
      <div className="mt-4">
        <div className="text-xs text-zinc-400 mb-2">Select Target Flight Distance</div>
        <div className="grid grid-cols-3 gap-2">
          {DISTANCE_TIERS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`py-2 px-2 rounded-xl text-center border transition ${
                selectedTier === t.id
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <div className="text-xs font-bold">{t.id}</div>
              <div className="text-[10px] text-zinc-500">{t.multiplier}x Payout</div>
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
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {amt} SOL
            </button>
          ))}
        </div>
      </div>

      {/* Potential Payout */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-zinc-400">Potential Return: </span>
          <span className="font-bold text-white">{potentialPayout.toFixed(3)} SOL</span>
        </div>
        <div className="text-emerald-400 font-bold flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>+{(potentialPayout - selectedWager).toFixed(3)} SOL Net Profit</span>
        </div>
      </div>

      {/* Active Wager Status */}
      {activeWager && (
        <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Escrow Locked ({activeWager.amount} SOL)</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
              ACTIVE BOUNTY
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Reach {activeWager.tier} in your next flight to claim {(activeWager.amount * activeTierObj.multiplier).toFixed(3)} SOL!
          </p>
          <a
            href={`https://solscan.io/tx/${activeWager.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-0.5"
          >
            <span>View Escrow Deposit on Solscan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Lock Button */}
      <button
        onClick={handleLockWager}
        disabled={isLocking || selectedWager > solBalance}
        className={`mt-5 w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
          selectedWager > solBalance
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : isLocking
            ? 'bg-amber-600 text-zinc-950 animate-pulse'
            : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
        }`}
      >
        <Flame className="w-4 h-4" />
        <span>
          {isLocking
            ? 'Locking Escrow on Solana Devnet...'
            : selectedWager > solBalance
            ? 'Insufficient SOL Balance'
            : `Lock ${selectedWager} SOL Bounty`}
        </span>
      </button>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  Coins, 
  Lock, 
  Sparkles, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { BurnerWallet } from '@/lib/solana/burner-wallet';
import { StakingVaultState } from '@/lib/solana/types';
import { 
  getStoredVaultState, 
  saveVaultState, 
  executeVaultStake, 
  executeVaultClaim 
} from '@/lib/defi/vault';
import { sounds } from '@/lib/audio/sound-effects';

interface StakingVaultProps {
  wallet: BurnerWallet | null;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export const StakingVault: React.FC<StakingVaultProps> = ({
  wallet,
  balance,
  setBalance,
}) => {
  const [vaultState, setVaultState] = useState<StakingVaultState>(getStoredVaultState());
  const [stakeInput, setStakeInput] = useState<number>(0.1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTxSig, setLastTxSig] = useState<string | null>(null);

  // Live yield ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setVaultState((curr) => {
        if (curr.userStaked <= 0) return curr;
        const now = Date.now();
        const elapsed = (now - curr.lastStakeTimestamp) / 1000;
        const secondsPerYear = 365 * 24 * 3600;
        const additional = (curr.userStaked * (curr.apyPercent / 100) * elapsed) / secondsPerYear;
        const updated = {
          ...curr,
          accruedYield: curr.accruedYield + additional,
          lastStakeTimestamp: now,
        };
        saveVaultState(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStake = async () => {
    if (!wallet || isProcessing || stakeInput <= 0) return;
    if (balance < stakeInput) {
      alert(`Insufficient balance! Your balance is ${balance.toFixed(3)} SOL.`);
      return;
    }

    setIsProcessing(true);
    sounds.playCoin();

    try {
      const sig = await executeVaultStake(wallet.keypair, stakeInput);
      setLastTxSig(sig);

      // Update state
      setBalance((b) => Math.max(0, b - stakeInput));
      setVaultState((curr) => {
        const updated = {
          ...curr,
          userStaked: curr.userStaked + stakeInput,
          totalVaultStaked: curr.totalVaultStaked + stakeInput,
          lastStakeTimestamp: Date.now(),
        };
        saveVaultState(updated);
        return updated;
      });
    } catch (err) {
      console.error('Staking error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = async () => {
    if (!wallet || isProcessing || vaultState.accruedYield <= 0.0001) {
      alert('No accrued yield ready to harvest yet!');
      return;
    }

    setIsProcessing(true);
    sounds.playVictory();

    const claimAmount = vaultState.accruedYield;

    try {
      const sig = await executeVaultClaim(wallet.keypair, claimAmount);
      setLastTxSig(sig);

      // Update state
      setBalance((b) => b + claimAmount);
      setVaultState((curr) => {
        const updated = {
          ...curr,
          accruedYield: 0,
          totalRewardsDistributed: curr.totalRewardsDistributed + claimAmount,
          lastStakeTimestamp: Date.now(),
        };
        saveVaultState(updated);
        return updated;
      });
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide text-white flex items-center space-x-2">
              <span>GLADIATOR YIELD VAULT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                14.8% APY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Stake Idle Champions & Battle Winnings • Real-Time Yield Stream • Instant On-Chain Claims
            </p>
          </div>
        </div>

        {/* APY Metrics Strip */}
        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              TOTAL VALUE LOCKED
            </span>
            <span className="font-mono font-bold text-base text-emerald-400">
              {vaultState.totalVaultStaked.toFixed(2)} SOL
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              TOTAL HARVESTED
            </span>
            <span className="font-mono font-bold text-base text-cyan-300">
              {vaultState.totalRewardsDistributed.toFixed(3)} SOL
            </span>
          </div>
        </div>
      </div>

      {lastTxSig && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Vault interaction finalized on Solana Devnet!</span>
          </div>
          <a
            href={`https://solscan.io/tx/${lastTxSig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 font-mono text-cyan-400 hover:underline"
          >
            <span>View on Solscan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Main Staking Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Your Staking Position & Yield Ticker */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ACTIVE POSITION
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Auto-Compounding
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  YOUR PRINCIPAL STAKE
                </span>
                <span className="text-2xl font-black font-mono text-white mt-1 block">
                  {vaultState.userStaked.toFixed(3)} SOL
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span>UNCLAIMED YIELD</span>
                  <span className="animate-pulse">● LIVE</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">
                  +{vaultState.accruedYield.toFixed(5)} SOL
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 space-y-1.5 mt-4">
              <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Streaming Yield Engine</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Yield accrues continuously on every Solana slot. Rewards are generated from match escrow protocol fees and validator staking delegations.
              </p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={isProcessing || vaultState.accruedYield < 0.0001}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40"
          >
            {isProcessing ? 'Harvesting...' : `Harvest Yield (+${vaultState.accruedYield.toFixed(4)} SOL)`}
          </button>
        </div>

        {/* Card 2: Deposit Staking Form */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                STAKE SOL INTO VAULT
              </span>
              <span className="text-xs font-mono text-slate-400">
                Balance: <strong className="text-emerald-400">{balance.toFixed(3)} SOL</strong>
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Stake Amount (Devnet SOL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                  />
                  <div className="absolute right-3 top-3.5 text-xs font-bold text-slate-500 font-mono">
                    SOL
                  </div>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex space-x-2">
                {[0.05, 0.1, 0.25, 0.5].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStakeInput(amt)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700 transition-colors"
                  >
                    {amt} SOL
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Estimated Annual Yield:</span>
              <span className="font-mono text-emerald-400 font-bold">
                +{(stakeInput * 0.148).toFixed(3)} SOL / yr
              </span>
            </div>

            <button
              onClick={handleStake}
              disabled={isProcessing || stakeInput <= 0 || balance < stakeInput}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40"
            >
              {isProcessing ? 'Depositing on Solana...' : `Stake ${stakeInput} SOL`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

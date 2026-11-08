'use client';

import React, { useState, useEffect } from 'react';
import { executeVaultStake, executeVaultClaim } from '@/lib/solana/transactions';
import { getOrCreateBurnerWallet } from '@/lib/solana/burner-wallet';
import { StakingPerks } from '@/lib/mario/types';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  Sprout, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  Sparkles,
  Award
} from 'lucide-react';

interface StakingVaultProps {
  solBalance: number;
  onPerksChanged: (perks: StakingPerks) => void;
  onBalanceChanged: (newBal: number) => void;
  onTxConfirmed?: (sig: string) => void;
}

export default function StakingVault({
  solBalance,
  onPerksChanged,
  onBalanceChanged,
  onTxConfirmed,
}: StakingVaultProps) {
  const [stakedSol, setStakedSol] = useState<number>(0.1);
  const [accruedYield, setAccruedYield] = useState<number>(0.0024);
  const [depositInput, setDepositInput] = useState<string>('0.05');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [isHarvesting, setIsHarvesting] = useState<boolean>(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  // Update perks whenever stakedSol changes
  useEffect(() => {
    const perks: StakingPerks = {
      coinBonusPercent: stakedSol >= 0.05 ? 15 : 0,
      superJump: stakedSol >= 0.1,
      coinMagnet: stakedSol >= 0.25,
    };
    onPerksChanged(perks);
  }, [stakedSol, onPerksChanged]);

  // Real-time streaming yield ticker (18.5% APY)
  useEffect(() => {
    if (stakedSol <= 0) return;
    const interval = setInterval(() => {
      // 18.5% per year => yield per second
      const yieldPerSec = (stakedSol * 0.185) / (365 * 24 * 3600);
      setAccruedYield(y => y + yieldPerSec);
    }, 1000);
    return () => clearInterval(interval);
  }, [stakedSol]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositInput);
    if (!amount || amount <= 0 || amount > solBalance || isDepositing) return;

    setIsDepositing(true);
    sounds.playCoin();

    try {
      const wallet = getOrCreateBurnerWallet();
      const sig = await executeVaultStake(wallet.keypair, amount);
      setLastSignature(sig);
      if (onTxConfirmed) onTxConfirmed(sig);

      setStakedSol(s => s + amount);
      onBalanceChanged(solBalance - amount);
      sounds.playPowerup();
    } catch (err) {
      console.error('Stake deposit error:', err);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleHarvest = async () => {
    if (accruedYield <= 0.0001 || isHarvesting) return;
    setIsHarvesting(true);
    sounds.playCoin();

    try {
      const wallet = getOrCreateBurnerWallet();
      const harvestAmount = accruedYield;
      const sig = await executeVaultClaim(wallet.keypair, harvestAmount);
      setLastSignature(sig);
      if (onTxConfirmed) onTxConfirmed(sig);

      setAccruedYield(0);
      onBalanceChanged(solBalance + harvestAmount);
      sounds.playPowerup();
    } catch (err) {
      console.error('Harvest yield error:', err);
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
              🌱
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              YOSHI&apos;S STAKING <span className="text-emerald-400">FARM</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Earn 18.5% APY Yield • Unlocks Live In-Game Mario Buffs
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase">Fixed APY</div>
          <div className="text-sm font-black text-emerald-400">18.5%</div>
        </div>
      </div>

      {/* Yield Dashboard Cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Total Staked */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-zinc-500 uppercase mb-1">Your Staked Principal</div>
          <div className="text-xl font-black text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{stakedSol.toFixed(3)} SOL</span>
          </div>
        </div>

        {/* Accrued Yield */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-zinc-500 uppercase mb-1">Accrued Yield (Live)</div>
          <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>+{accruedYield.toFixed(5)} SOL</span>
          </div>
        </div>
      </div>

      {/* In-Game Buff Tiers Activated by Staking */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
        <div className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Active In-Game Gameplay Perks</span>
        </div>

        <div className="space-y-2">
          {/* Tier 1 */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
            stakedSol >= 0.05 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}>
            <div className="flex items-center gap-2">
              <span>🪙</span>
              <span><strong>Bronze (≥0.05 SOL):</strong> +15% $COIN Value Multiplier</span>
            </div>
            <span className="font-bold">{stakedSol >= 0.05 ? 'ACTIVE' : 'LOCKED'}</span>
          </div>

          {/* Tier 2 */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
            stakedSol >= 0.1 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}>
            <div className="flex items-center gap-2">
              <span>🚀</span>
              <span><strong>Silver (≥0.10 SOL):</strong> Super Jump (+18% Height)</span>
            </div>
            <span className="font-bold">{stakedSol >= 0.1 ? 'ACTIVE' : 'LOCKED'}</span>
          </div>

          {/* Tier 3 */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
            stakedSol >= 0.25 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}>
            <div className="flex items-center gap-2">
              <span>🧲</span>
              <span><strong>Gold (≥0.25 SOL):</strong> Magnetic Aura (Vacuum 4 tiles)</span>
            </div>
            <span className="font-bold">{stakedSol >= 0.25 ? 'ACTIVE' : 'LOCKED'}</span>
          </div>
        </div>
      </div>

      {/* Stake Deposit Form */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>Deposit More SOL</span>
          <span>Wallet Balance: <strong className="text-white">{solBalance.toFixed(3)} SOL</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={depositInput}
            onChange={e => setDepositInput(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-white font-bold focus:outline-none"
            placeholder="0.05"
            step="0.01"
            min="0"
          />
          <button
            onClick={handleDeposit}
            disabled={isDepositing || parseFloat(depositInput) <= 0 || parseFloat(depositInput) > solBalance}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50"
          >
            {isDepositing ? 'Depositing...' : 'Stake SOL'}
          </button>
        </div>
      </div>

      {/* Harvest Button */}
      <button
        onClick={handleHarvest}
        disabled={isHarvesting || accruedYield <= 0.0001}
        className="w-full mt-3 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs transition border border-zinc-700 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Sprout className="w-4 h-4 text-emerald-400" />
        <span>Harvest Accrued Yield (+{accruedYield.toFixed(5)} SOL)</span>
      </button>

      {/* Confirmed Signature Link */}
      {lastSignature && (
        <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          <div className="font-bold flex items-center gap-1 mb-1">
            <span>✓ Vault Transaction Confirmed on Solana Devnet</span>
          </div>
          <a
            href={`https://solscan.io/tx/${lastSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] underline text-zinc-300 hover:text-white break-all"
          >
            <span>{lastSignature}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
}

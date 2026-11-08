'use client';

import React, { useState } from 'react';
import { executeAmmSwap } from '@/lib/solana/transactions';
import { getOrCreateBurnerWallet } from '@/lib/solana/burner-wallet';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  ArrowDownUp, 
  Zap, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface MushroomSwapProps {
  inGameCoins: number;
  solBalance: number;
  onSwapSuccess: (newCoins: number, newSol: number) => void;
  onTxConfirmed?: (sig: string) => void;
}

export default function MushroomSwap({
  inGameCoins,
  solBalance,
  onSwapSuccess,
  onTxConfirmed,
}: MushroomSwapProps) {
  // AMM Constant Product Reserves: x * y = k
  // Sol Reserve: 20.0 SOL, Shard Reserve: 100,000 $SHARD => k = 2,000,000
  const [solReserve, setSolReserve] = useState<number>(20.0);
  const [shardReserve, setShardReserve] = useState<number>(100000);
  const [mode, setMode] = useState<'SELL_SHARDS' | 'BUY_SHARDS'>('SELL_SHARDS');
  const [amount, setAmount] = useState<string>('50');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const spotShardPerSol = shardReserve / solReserve; // e.g. 5,000 $SHARD / SOL
  const numAmount = parseFloat(amount) || 0;
  let estimatedOut = 0;
  let priceImpact = 0;

  if (mode === 'SELL_SHARDS') {
    const effectiveIn = numAmount * 0.997; // 0.3% LP fee
    estimatedOut = (solReserve * effectiveIn) / (shardReserve + effectiveIn);
    priceImpact = (numAmount / (shardReserve + numAmount)) * 100;
  } else {
    const effectiveIn = numAmount * 0.997;
    estimatedOut = (shardReserve * effectiveIn) / (solReserve + effectiveIn);
    priceImpact = (numAmount / (solReserve + numAmount)) * 100;
  }

  const handleSwap = async () => {
    if (numAmount <= 0 || isSwapping) return;
    setErrorMsg(null);

    if (mode === 'SELL_SHARDS' && numAmount > inGameCoins) {
      setErrorMsg(`Insufficient $SHARD balance (You have ${inGameCoins} $SHARDs)`);
      return;
    }
    if (mode === 'BUY_SHARDS' && numAmount > solBalance) {
      setErrorMsg(`Insufficient Devnet SOL balance (You have ${solBalance.toFixed(3)} SOL)`);
      return;
    }

    setIsSwapping(true);
    sounds.playCoin();

    try {
      const wallet = getOrCreateBurnerWallet();
      const tradeType = mode === 'BUY_SHARDS' ? 'BUY_COIN' : 'SELL_COIN';
      const solValue = mode === 'BUY_SHARDS' ? numAmount : estimatedOut;
      const shardValue = mode === 'BUY_SHARDS' ? estimatedOut : numAmount;

      const sig = await executeAmmSwap(
        wallet.keypair,
        tradeType,
        solValue,
        shardValue
      );

      setLastSignature(sig);
      if (onTxConfirmed) onTxConfirmed(sig);

      if (mode === 'SELL_SHARDS') {
        setShardReserve(c => c + numAmount);
        setSolReserve(s => Math.max(0.1, s - estimatedOut));
        onSwapSuccess(inGameCoins - numAmount, solBalance + estimatedOut);
      } else {
        setSolReserve(s => s + numAmount);
        setShardReserve(c => Math.max(100, c - estimatedOut));
        onSwapSuccess(inGameCoins + Math.round(estimatedOut), solBalance - numAmount);
      }

      sounds.playPowerup();
    } catch (err: unknown) {
      console.error('Swap error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Swap execution failed');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
              ⚡
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              QUANTUM SWAP <span className="text-emerald-400">DEX</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Constant-Product AMM (x * y = k) • 0.3% LP Fee
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase">Rate</div>
          <div className="text-xs font-bold text-emerald-400">
            1 SOL = {Math.round(spotShardPerSol).toLocaleString()} $SHARD
          </div>
        </div>
      </div>

      {/* Input Box 1 */}
      <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>You Pay</span>
          <span>
            Balance:{' '}
            <strong className="text-white">
              {mode === 'SELL_SHARDS' ? `${inGameCoins} $SHARD` : `${solBalance.toFixed(3)} SOL`}
            </strong>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
            placeholder="0.0"
            min="0"
          />
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0">
            {mode === 'SELL_SHARDS' ? (
              <>
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>$SHARD</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>SOL</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switch Button */}
      <div className="flex justify-center -my-2.5 relative z-10">
        <button
          onClick={() => {
            setMode(m => (m === 'SELL_SHARDS' ? 'BUY_SHARDS' : 'SELL_SHARDS'));
            setAmount('10');
            sounds.playJump(false);
          }}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 shadow-md transition"
        >
          <ArrowDownUp className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Output Box 2 */}
      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>You Receive (Estimated)</span>
          <span>
            Balance:{' '}
            <strong className="text-white">
              {mode === 'SELL_SHARDS' ? `${solBalance.toFixed(3)} SOL` : `${inGameCoins} $SHARD`}
            </strong>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-black text-emerald-400">
            {mode === 'SELL_SHARDS' ? estimatedOut.toFixed(4) : Math.round(estimatedOut)}
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0">
            {mode === 'SELL_SHARDS' ? (
              <>
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>SOL</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>$SHARD</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="mt-4 bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl text-xs space-y-1.5 text-zinc-400">
        <div className="flex justify-between">
          <span>Price Impact</span>
          <span className={priceImpact > 3 ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
            {priceImpact.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Liquidity Provider Fee (0.3%)</span>
          <span className="text-zinc-300">
            {mode === 'SELL_SHARDS' ? `${(numAmount * 0.003).toFixed(2)} $SHARD` : `${(numAmount * 0.003).toFixed(4)} SOL`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Pool Reserves</span>
          <span className="text-zinc-300">
            {solReserve.toFixed(2)} SOL / {shardReserve.toLocaleString()} $SHARD
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={isSwapping || numAmount <= 0}
        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black py-3 rounded-xl font-mono text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Zap className={`w-4 h-4 ${isSwapping ? 'animate-spin' : ''}`} />
        <span>
          {isSwapping 
            ? 'Executing Swap on Solana...' 
            : mode === 'SELL_SHARDS' 
              ? `Swap $SHARD for ${estimatedOut.toFixed(4)} SOL` 
              : `Swap SOL for ${Math.round(estimatedOut)} $SHARD`}
        </span>
      </button>

      {lastSignature && (
        <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          <div className="font-bold flex items-center gap-1 mb-1">
            <span>✓ Swap Confirmed on Solana Devnet</span>
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

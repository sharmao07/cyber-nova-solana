'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ExternalLink,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Check
} from 'lucide-react';
import { BurnerWallet } from '@/lib/solana/burner-wallet';
import { InventoryItem } from '@/lib/solana/types';
import { 
  INITIAL_MARKET_ITEMS, 
  calculateBondingCurvePrice, 
  calculateSellRefund, 
  executeAmmTrade 
} from '@/lib/defi/bonding-curve';
import { sounds } from '@/lib/audio/sound-effects';

interface BondingCurveShopProps {
  wallet: BurnerWallet | null;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export const BondingCurveShop: React.FC<BondingCurveShopProps> = ({
  wallet,
  balance,
  setBalance,
  inventory,
  setInventory,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_MARKET_ITEMS);
  const [tradingItemId, setTradingItemId] = useState<string | null>(null);
  const [lastTradeSig, setLastTradeSig] = useState<string | null>(null);

  const handleBuy = async (item: InventoryItem) => {
    if (!wallet || tradingItemId) return;

    const currentPrice = calculateBondingCurvePrice(item.basePrice, item.supply);
    if (balance < currentPrice) {
      alert(`Insufficient funds! Item costs ${currentPrice.toFixed(3)} SOL, your balance is ${balance.toFixed(3)} SOL.`);
      return;
    }

    setTradingItemId(item.id);
    sounds.playCoin();

    try {
      const nextSupply = item.supply + 1;
      const sig = await executeAmmTrade(wallet.keypair, item, 'BUY', nextSupply, currentPrice);
      setLastTradeSig(sig);

      // Update state
      setBalance((b) => Math.max(0, b - currentPrice));
      setInventory((inv) => [...inv, { ...item, supply: nextSupply, currentPrice }]);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, supply: nextSupply, currentPrice: calculateBondingCurvePrice(i.basePrice, nextSupply) }
            : i
        )
      );
    } catch (err) {
      console.error('Buy error:', err);
    } finally {
      setTradingItemId(null);
    }
  };

  const handleSell = async (item: InventoryItem) => {
    if (!wallet || tradingItemId) return;
    const owned = inventory.find((i) => i.id === item.id);
    if (!owned) {
      alert('You do not own this item in your inventory!');
      return;
    }

    setTradingItemId(item.id);
    sounds.playCoin();

    try {
      const nextSupply = Math.max(0, item.supply - 1);
      const refund = calculateSellRefund(item.basePrice, item.supply);
      const sig = await executeAmmTrade(wallet.keypair, item, 'SELL', nextSupply, refund);
      setLastTradeSig(sig);

      // Update state
      setBalance((b) => b + refund);
      setInventory((inv) => {
        const idx = inv.findIndex((i) => i.id === item.id);
        if (idx === -1) return inv;
        const copy = [...inv];
        copy.splice(idx, 1);
        return copy;
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, supply: nextSupply, currentPrice: calculateBondingCurvePrice(i.basePrice, nextSupply) }
            : i
        )
      );
    } catch (err) {
      console.error('Sell error:', err);
    } finally {
      setTradingItemId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-fuchsia-950/30 to-slate-900 border border-fuchsia-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-fuchsia-950 border border-fuchsia-800 text-fuchsia-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide text-white flex items-center space-x-2">
              <span>AMM BONDING CURVE RELIC MARKET</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/60 font-mono">
                DeFi Primitive
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic Invariant Pricing • Guaranteed Automated Liquidity • Instant Devnet Settlement
            </p>
          </div>
        </div>

        {/* Bonding Curve Math Badge */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-fuchsia-300 font-mono font-bold justify-end">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>P(S) = BasePrice × (1 + S/10)²</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Price increases exponentially with circulating supply.
          </p>
        </div>
      </div>

      {lastTradeSig && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>On-chain AMM trade confirmed on Solana Devnet!</span>
          </div>
          <a
            href={`https://solscan.io/tx/${lastTradeSig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 font-mono text-cyan-400 hover:underline"
          >
            <span>View on Solscan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Item Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => {
          const buyPrice = calculateBondingCurvePrice(item.basePrice, item.supply);
          const sellPrice = calculateSellRefund(item.basePrice, item.supply);
          const ownedCount = inventory.filter((i) => i.id === item.id).length;
          const isBusy = tradingItemId === item.id;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-fuchsia-800/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      item.rarity === 'MYTHIC'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : item.rarity === 'RARE'
                        ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-800'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                    }`}
                  >
                    {item.rarity} {item.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Supply: <strong className="text-white">{item.supply}</strong>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 group-hover:text-fuchsia-300 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>

                {/* Stat Boosts */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.statBoost.attack && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50">
                      +{item.statBoost.attack} ATK
                    </span>
                  )}
                  {item.statBoost.defense && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                      +{item.statBoost.defense} DEF
                    </span>
                  )}
                  {item.statBoost.hp && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                      +{item.statBoost.hp} HP
                    </span>
                  )}
                  {item.statBoost.energy && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
                      +{item.statBoost.energy} ENERGY
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">AMM SPOT PRICE</span>
                    <span className="font-mono font-bold text-sm text-fuchsia-300">
                      {buyPrice.toFixed(3)} SOL
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">IN INVENTORY</span>
                    <span className="font-mono font-bold text-sm text-cyan-300">
                      {ownedCount}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={isBusy || balance < buyPrice}
                    className="py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all disabled:opacity-40"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{isBusy ? 'Signing...' : 'Buy'}</span>
                  </button>

                  <button
                    onClick={() => handleSell(item)}
                    disabled={isBusy || ownedCount === 0}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1 transition-all disabled:opacity-40 border border-slate-700"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Sell (+{sellPrice.toFixed(3)})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

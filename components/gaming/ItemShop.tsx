'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/lib/solana/types';
import { executeItemMint } from '@/lib/solana/transactions';
import { getOrCreateBurnerWallet } from '@/lib/solana/burner-wallet';
import { sounds } from '@/lib/audio/sound-effects';
import { 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  Coins, 
  Check, 
  ExternalLink,
  QrCode
} from 'lucide-react';

interface ItemShopProps {
  inGameCoins: number;
  solBalance: number;
  activeSkin: 'classic' | 'fire' | 'gold' | 'shadow';
  onSkinSelected: (skin: 'classic' | 'fire' | 'gold' | 'shadow') => void;
  onCoinsDeducted: (amt: number) => void;
  onTxConfirmed?: (sig: string) => void;
}

const SHOP_ITEMS: InventoryItem[] = [
  {
    id: 'skin-classic',
    name: 'Classic Solario',
    category: 'SKIN',
    rarity: 'COMMON',
    description: 'The iconic red hat and blue overalls plumber from the genesis block.',
    priceSol: 0,
    priceCoins: 0,
  },
  {
    id: 'skin-fire',
    name: 'Fire Solario',
    category: 'SKIN',
    rarity: 'RARE',
    description: 'Starts levels equipped with White/Red Fire Flower gear. Casts bouncing fireballs!',
    priceSol: 0.05,
    priceCoins: 50,
  },
  {
    id: 'skin-gold',
    name: 'Cyber Gold Solario',
    category: 'SKIN',
    rarity: 'LEGENDARY',
    description: 'Forged in Solana validator fires. Shimmers with pure 24-karat gold radiance.',
    priceSol: 0.1,
    priceCoins: 100,
  },
  {
    id: 'skin-shadow',
    name: 'Shadow Solario',
    category: 'SKIN',
    rarity: 'LEGENDARY',
    description: 'Dark mode cyber ninja skin with neon Solana green accents.',
    priceSol: 0.1,
    priceCoins: 100,
  },
  {
    id: 'item-star',
    name: 'Starman Shield',
    category: 'POWERUP',
    rarity: 'RARE',
    description: 'Start with 10 seconds of invincibility. Destroys any enemy on contact!',
    priceSol: 0.02,
    priceCoins: 30,
  },
  {
    id: 'item-1up',
    name: '1-Up Solana Shroom',
    category: 'POWERUP',
    rarity: 'COMMON',
    description: 'Instantly grants +1 extra life to rescue Princess Peach.',
    priceSol: 0.01,
    priceCoins: 20,
  },
];

export default function ItemShop({
  inGameCoins,
  solBalance,
  activeSkin,
  onSkinSelected,
  onCoinsDeducted,
  onTxConfirmed,
}: ItemShopProps) {
  const [purchasedIds, setPurchasedIds] = useState<string[]>(['skin-classic']);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [showQrItem, setShowQrItem] = useState<InventoryItem | null>(null);

  const handleBuyWithSol = async (item: InventoryItem) => {
    if (item.priceSol > solBalance || isPurchasing) return;
    setIsPurchasing(item.id);
    sounds.playCoin();

    try {
      const wallet = getOrCreateBurnerWallet();
      const sig = await executeItemMint(wallet.keypair, item);
      setLastSignature(sig);
      if (onTxConfirmed) onTxConfirmed(sig);

      setPurchasedIds(prev => [...prev, item.id]);
      if (item.category === 'SKIN') {
        const skinType = item.id.replace('skin-', '') as 'classic' | 'fire' | 'gold' | 'shadow';
        onSkinSelected(skinType);
      }
      sounds.playPowerup();
    } catch (err) {
      console.error('Purchase error:', err);
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleBuyWithCoins = (item: InventoryItem) => {
    if (item.priceCoins > inGameCoins) return;
    onCoinsDeducted(item.priceCoins);
    setPurchasedIds(prev => [...prev, item.id]);
    if (item.category === 'SKIN') {
      const skinType = item.id.replace('skin-', '') as 'classic' | 'fire' | 'gold' | 'shadow';
      onSkinSelected(skinType);
    }
    sounds.playPowerup();
  };

  const handleEquip = (item: InventoryItem) => {
    if (item.category === 'SKIN') {
      const skinType = item.id.replace('skin-', '') as 'classic' | 'fire' | 'gold' | 'shadow';
      onSkinSelected(skinType);
      sounds.playJump();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg">
              🛍️
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              TOAD&apos;S NFT <span className="text-purple-400">POWER-UP STORE</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Player-Owned Assets • Buy with $COIN or Solana Pay
            </p>
          </div>
        </div>

        {/* User Balance Display */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-amber-300">
            <Coins className="w-3.5 h-3.5" />
            <span>{inGameCoins} $COIN</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{solBalance.toFixed(3)} SOL</span>
          </div>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_ITEMS.map(item => {
          const isOwned = purchasedIds.includes(item.id);
          const isEquipped = item.id === `skin-${activeSkin}`;
          const rarityColor = 
            item.rarity === 'LEGENDARY' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
            item.rarity === 'RARE' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
            'text-zinc-400 border-zinc-700 bg-zinc-800';

          return (
            <div
              key={item.id}
              className={`bg-zinc-950 border rounded-xl p-4 flex flex-col justify-between transition ${
                isEquipped ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${rarityColor}`}>
                    {item.rarity}
                  </span>
                  {item.category === 'SKIN' && (
                    <span className="text-[10px] text-zinc-500 uppercase">Cosmetic Skin</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                  <span>{item.name}</span>
                  {isEquipped && <Check className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="border-t border-zinc-800/80 pt-3">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="text-zinc-500">Price:</span>
                  <div className="flex items-center gap-2">
                    {item.priceCoins > 0 && (
                      <span className="text-amber-400 font-bold">{item.priceCoins} $COIN</span>
                    )}
                    {item.priceSol > 0 && (
                      <span className="text-emerald-400 font-bold">{item.priceSol} SOL</span>
                    )}
                    {item.priceCoins === 0 && item.priceSol === 0 && (
                      <span className="text-zinc-400 font-bold">Free</span>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                {isOwned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    disabled={isEquipped}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                      isEquipped
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip Skin'}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleBuyWithCoins(item)}
                      disabled={inGameCoins < item.priceCoins}
                      className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold py-2 rounded-lg text-xs transition disabled:opacity-40"
                    >
                      Buy $COIN
                    </button>
                    <button
                      onClick={() => handleBuyWithSol(item)}
                      disabled={isPurchasing === item.id || solBalance < item.priceSol}
                      className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-2 rounded-lg text-xs transition disabled:opacity-40 flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{isPurchasing === item.id ? 'Minting...' : 'Mint SOL'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmed Signature Link */}
      {lastSignature && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          <div className="font-bold flex items-center gap-1 mb-1">
            <span>✓ Asset Minted to Wallet on Solana Devnet</span>
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

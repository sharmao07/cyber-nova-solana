import { InventoryItem } from '../solana/types';
import { Keypair, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getSolanaConnection, MEMO_PROGRAM_ID } from '../solana/connection';
import { saveTransactionRecord } from '../solana/transactions';

export const INITIAL_MARKET_ITEMS: InventoryItem[] = [
  {
    id: 'plasma-katana',
    name: 'Plasma Katana',
    category: 'WEAPON',
    rarity: 'RARE',
    description: 'High-frequency ion blade that slices through enemy energy shields effortlessly.',
    statBoost: { attack: 12 },
    supply: 4,
    basePrice: 0.02,
    currentPrice: 0.039,
  },
  {
    id: 'aegis-nanoshield',
    name: 'Aegis Nano-Plating',
    category: 'ARMOR',
    rarity: 'RARE',
    description: 'Dense weave of carbon-nanotube fibers that reduces incoming physical shock by 25%.',
    statBoost: { defense: 14 },
    supply: 3,
    basePrice: 0.025,
    currentPrice: 0.042,
  },
  {
    id: 'overcharged-battery',
    name: 'Overcharged Capacitor',
    category: 'RELIC',
    rarity: 'COMMON',
    description: 'Miniaturized fusion capacitor boosting your gladiator starting combat energy.',
    statBoost: { energy: 30 },
    supply: 7,
    basePrice: 0.015,
    currentPrice: 0.043,
  },
  {
    id: 'hyper-stim-injector',
    name: 'Hyper-Stim Stimulant',
    category: 'POTION',
    rarity: 'COMMON',
    description: 'Injectable combat adrenaline that immediately enhances max vitality and HP.',
    statBoost: { hp: 40 },
    supply: 8,
    basePrice: 0.01,
    currentPrice: 0.032,
  },
  {
    id: 'quantum-core',
    name: 'Quantum Arbiter Core',
    category: 'RELIC',
    rarity: 'MYTHIC',
    description: 'Rare cybernetic relic recovered from ancient validator nodes. Bestows immense combat prowess.',
    statBoost: { attack: 25, defense: 15, energy: 20 },
    supply: 1,
    basePrice: 0.08,
    currentPrice: 0.096,
  },
];

/**
 * Calculates item price using an exponential bonding curve:
 * Price(S) = BasePrice * (1 + S / 10)^2
 */
export function calculateBondingCurvePrice(basePrice: number, supply: number): number {
  const price = basePrice * Math.pow(1 + supply / 10, 2);
  return Math.round(price * 1000) / 1000;
}

/**
 * Returns estimated sell price (liquidity refund minus 5% AMM fee)
 */
export function calculateSellRefund(basePrice: number, supply: number): number {
  if (supply <= 0) return 0;
  const currentPrice = calculateBondingCurvePrice(basePrice, supply);
  const refund = currentPrice * 0.95; // 5% AMM spread
  return Math.round(refund * 1000) / 1000;
}

export async function executeAmmTrade(
  playerKeypair: Keypair,
  item: InventoryItem,
  tradeType: 'BUY' | 'SELL',
  newSupply: number,
  priceSol: number
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  const payload = {
    app: 'SolArena',
    module: 'BONDING_CURVE_AMM',
    tradeType,
    itemId: item.id,
    itemName: item.name,
    priceSol,
    newSupply,
    trader: playerKeypair.publicKey.toBase58(),
    timestamp: Date.now(),
  };

  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: playerKeypair.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(JSON.stringify(payload)),
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [playerKeypair],
    { commitment: 'confirmed' }
  );

  saveTransactionRecord({
    signature,
    type: tradeType === 'BUY' ? 'AMM_BUY' : 'AMM_SELL',
    title: `AMM ${tradeType}: ${item.name}`,
    description: `${tradeType === 'BUY' ? 'Purchased' : 'Liquidated'} ${item.name} for ${priceSol.toFixed(3)} SOL via Bonding Curve (New Supply: ${newSupply})`,
    amountSol: priceSol,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: playerKeypair.publicKey.toBase58(),
      concept: 'Bonding Curve AMM Pricing',
      explanation: 'Item price moves deterministically based on circulating supply on Solana without requiring an external order book.',
    },
  });

  return signature;
}

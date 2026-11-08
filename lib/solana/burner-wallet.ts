import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

const STORAGE_KEY = 'solarena_burner_keypair_v1';

export interface BurnerWallet {
  publicKey: PublicKey;
  publicKeyBase58: string;
  secretKeyBase58: string;
  keypair: Keypair;
}

export function getOrCreateBurnerWallet(): BurnerWallet {
  if (typeof window === 'undefined') {
    // SSR Fallback
    const kp = Keypair.generate();
    return {
      publicKey: kp.publicKey,
      publicKeyBase58: kp.publicKey.toBase58(),
      secretKeyBase58: bs58.encode(kp.secretKey),
      keypair: kp,
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const secret = bs58.decode(stored);
      const kp = Keypair.fromSecretKey(secret);
      return {
        publicKey: kp.publicKey,
        publicKeyBase58: kp.publicKey.toBase58(),
        secretKeyBase58: stored,
        keypair: kp,
      };
    } catch (e) {
      console.warn('Corrupt burner key in storage, regenerating:', e);
    }
  }

  const newKp = Keypair.generate();
  const encoded = bs58.encode(newKp.secretKey);
  localStorage.setItem(STORAGE_KEY, encoded);
  return {
    publicKey: newKp.publicKey,
    publicKeyBase58: newKp.publicKey.toBase58(),
    secretKeyBase58: encoded,
    keypair: newKp,
  };
}

export function resetBurnerWallet(): BurnerWallet {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getOrCreateBurnerWallet();
}

export async function requestDevnetAirdrop(recipientAddress: string, amountSol: number = 0.5): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    // 1. Try our instant backend faucet route (backed by funded Devnet treasury)
    const res = await fetch('/api/faucet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: recipientAddress, amount: amountSol }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, signature: data.signature };
    }

    // If backend route returned error message
    if (data.error) {
      console.warn('Backend faucet warning, fallback response:', data.error);
    }
    
    return { success: false, error: data.error || 'Failed to request airdrop' };
  } catch (err: unknown) {
    console.error('Airdrop error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Network error during airdrop' };
  }
}

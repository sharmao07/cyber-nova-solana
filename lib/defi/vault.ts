import { Keypair, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getSolanaConnection, MEMO_PROGRAM_ID } from '../solana/connection';
import { StakingVaultState } from '../solana/types';
import { saveTransactionRecord } from '../solana/transactions';

const VAULT_STORAGE_KEY = 'solarena_vault_state_v1';

export const DEFAULT_VAULT_STATE: StakingVaultState = {
  totalVaultStaked: 45.25,
  userStaked: 0,
  apyPercent: 14.8,
  accruedYield: 0,
  lastStakeTimestamp: Date.now(),
  totalRewardsDistributed: 3.412,
};

export function getStoredVaultState(): StakingVaultState {
  if (typeof window === 'undefined') return DEFAULT_VAULT_STATE;
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return DEFAULT_VAULT_STATE;
    const state: StakingVaultState = JSON.parse(raw);

    // Calculate elapsed yield
    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - state.lastStakeTimestamp) / 1000);
    const secondsPerYear = 365 * 24 * 3600;
    const additionalYield = (state.userStaked * (state.apyPercent / 100) * elapsedSeconds) / secondsPerYear;

    return {
      ...state,
      accruedYield: state.accruedYield + additionalYield,
      lastStakeTimestamp: now,
    };
  } catch {
    return DEFAULT_VAULT_STATE;
  }
}

export function saveVaultState(state: StakingVaultState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save vault state:', err);
  }
}

export async function executeVaultStake(
  playerKeypair: Keypair,
  amountSol: number
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  const payload = {
    app: 'SolArena',
    module: 'DEFI_STAKING_VAULT',
    action: 'STAKE_DEPOSIT',
    amountSol,
    staker: playerKeypair.publicKey.toBase58(),
    apy: 14.8,
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
    type: 'STAKE_DEPOSIT',
    title: `Vault Staked: ${amountSol.toFixed(2)} SOL`,
    description: `Deposited ${amountSol.toFixed(2)} SOL into Gladiator Yield Vault earning 14.8% APY`,
    amountSol,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: playerKeypair.publicKey.toBase58(),
      concept: 'On-Chain Yield Vault',
      explanation: 'Gladiator champions lock collateral in automated yield pools to earn continuous validator staking rewards.',
    },
  });

  return signature;
}

export async function executeVaultClaim(
  playerKeypair: Keypair,
  claimedAmountSol: number
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  const payload = {
    app: 'SolArena',
    module: 'DEFI_STAKING_VAULT',
    action: 'CLAIM_YIELD',
    amountSol: claimedAmountSol,
    staker: playerKeypair.publicKey.toBase58(),
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
    type: 'STAKE_CLAIM',
    title: `Yield Harvested: +${claimedAmountSol.toFixed(4)} SOL`,
    description: `Claimed ${claimedAmountSol.toFixed(4)} SOL accrued staking yield from the Gladiator Vault`,
    amountSol: claimedAmountSol,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: playerKeypair.publicKey.toBase58(),
      concept: 'Real-Time Yield Distribution',
      explanation: 'Compounded yield stream harvested directly to player wallet with minimal Solana transaction fees.',
    },
  });

  return signature;
}

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  TransactionInstruction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { getSolanaConnection, MEMO_PROGRAM_ID } from './connection';
import { MoveType, SolanaTransactionRecord } from './types';

// In-memory / session storage for transaction inspector
const TX_HISTORY_KEY = 'solarena_tx_history_v1';

export function getStoredTransactions(): SolanaTransactionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TX_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTransactionRecord(record: SolanaTransactionRecord) {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredTransactions();
    const updated = [record, ...list].slice(0, 30); // keep last 30
    localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('solarena_tx_added', { detail: record }));
  } catch (err) {
    console.error('Failed to save tx record:', err);
  }
}

/**
 * Executes an on-chain Player Combat Turn with a verified Memo instruction.
 */
export async function executePlayerCombatTurn(
  playerKeypair: Keypair,
  matchId: string,
  round: number,
  move: MoveType,
  damage: number,
  isCrit: boolean
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  // Create deterministic match payload
  const payload = {
    app: 'SolArena',
    type: 'PLAYER_TURN',
    matchId,
    round,
    move,
    damage,
    isCrit,
    timestamp: Date.now(),
  };

  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: playerKeypair.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(payload)),
  });

  tx.add(memoInstruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [playerKeypair],
    { commitment: 'confirmed' }
  );

  saveTransactionRecord({
    signature,
    type: 'PLAYER_TURN',
    title: `Player Turn: ${move.replace('_', ' ')}`,
    description: `Round ${round} combat action. Dealt ${damage} damage (Crit: ${isCrit})`,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: playerKeypair.publicKey.toBase58(),
      concept: 'Signer Verification & State Instruction',
      explanation: 'The player signs the combat turn memo instruction, ensuring verifiable move authenticity on-chain.',
    },
  });

  return signature;
}

/**
 * Autonomous AI Agent signs and broadcasts its counter-move transaction on Devnet.
 */
export async function executeAiAgentCombatTurn(
  agentKeypair: Keypair,
  matchId: string,
  round: number,
  move: MoveType,
  damage: number,
  reasoningSnippet: string
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  const payload = {
    app: 'SolArena',
    type: 'AI_AGENT_TURN',
    agent: 'AutonomousSentinel_v2',
    matchId,
    round,
    move,
    damage,
    reasoningHash: reasoningSnippet.slice(0, 48),
    timestamp: Date.now(),
  };

  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: agentKeypair.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(payload)),
  });

  tx.add(memoInstruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [agentKeypair],
    { commitment: 'confirmed' }
  );

  saveTransactionRecord({
    signature,
    type: 'AI_AGENT_TURN',
    title: `AI Agent Turn: ${move.replace('_', ' ')}`,
    description: `AI Agent signed autonomous move on-chain: "${reasoningSnippet.slice(0, 60)}..."`,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: agentKeypair.publicKey.toBase58(),
      concept: 'Autonomous Agent Wallet',
      explanation: 'The AI holds its own private key and signs its battle moves directly on Solana, paying its own gas fees.',
    },
  });

  return signature;
}

/**
 * Deposits match wager into escrow account.
 */
export async function executeMatchWagerEscrow(
  playerKeypair: Keypair,
  escrowPubkey: PublicKey,
  wagerAmountSol: number,
  matchId: string
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  const lamports = Math.round(wagerAmountSol * LAMPORTS_PER_SOL);

  // Transfer wager to escrow
  tx.add(
    SystemProgram.transfer({
      fromPubkey: playerKeypair.publicKey,
      toPubkey: escrowPubkey,
      lamports,
    })
  );

  // Escrow Memo
  const memoPayload = {
    app: 'SolArena',
    event: 'ESCROW_LOCK',
    matchId,
    wagerSol: wagerAmountSol,
    escrowAccount: escrowPubkey.toBase58(),
    timestamp: Date.now(),
  };

  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: playerKeypair.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(JSON.stringify(memoPayload)),
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
    type: 'MATCH_ESCROW',
    title: `Match Wager Escrow Locked`,
    description: `Locked ${wagerAmountSol} SOL into match escrow account.`,
    amountSol: wagerAmountSol,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: escrowPubkey.toBase58(),
      concept: 'On-Chain Escrow Protocol',
      explanation: 'Wagers are custodied programmatically until combat resolution conditions are verified by the game state.',
    },
  });

  return signature;
}

/**
 * Executes payout from match escrow to the victor.
 */
export async function executeMatchPayout(
  escrowKeypair: Keypair,
  winnerPubkey: PublicKey,
  totalPotSol: number,
  matchId: string
): Promise<string> {
  const connection = getSolanaConnection();
  const tx = new Transaction();

  // Deduct 5000 lamports for tx fee
  const lamports = Math.max(0, Math.round(totalPotSol * LAMPORTS_PER_SOL) - 5000);

  tx.add(
    SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: winnerPubkey,
      lamports,
    })
  );

  const memoPayload = {
    app: 'SolArena',
    event: 'ESCROW_PAYOUT',
    matchId,
    payoutSol: lamports / LAMPORTS_PER_SOL,
    winner: winnerPubkey.toBase58(),
    timestamp: Date.now(),
  };

  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: escrowKeypair.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(JSON.stringify(memoPayload)),
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [escrowKeypair],
    { commitment: 'confirmed' }
  );

  saveTransactionRecord({
    signature,
    type: 'MATCH_PAYOUT',
    title: `Victory Pot Disbursed`,
    description: `Awarded ${totalPotSol.toFixed(3)} SOL pot to match victor.`,
    amountSol: totalPotSol,
    solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    timestamp: Date.now(),
    status: 'CONFIRMED',
    feeSol: 0.000005,
    pdaExplained: {
      account: winnerPubkey.toBase58(),
      concept: 'Trustless Settlement',
      explanation: 'The pot is distributed automatically without centralized manual intervention.',
    },
  });

  return signature;
}

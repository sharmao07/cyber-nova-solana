import { NextRequest, NextResponse } from 'next/server';
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction, 
  LAMPORTS_PER_SOL, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { DEVNET_RPC_ENDPOINT, MEMO_PROGRAM_ID } from '@/lib/solana/connection';

// Pre-funded Devnet treasury keypair (holds 10 SOL on Devnet)
const TREASURY_SECRET = [
  212,181,146,26,181,221,54,155,83,247,155,161,162,3,217,160,
  183,92,95,6,3,148,97,81,50,18,247,215,240,52,90,201,
  139,203,38,116,111,69,37,95,14,112,70,130,19,220,130,233,
  219,143,69,200,100,166,198,81,216,108,116,136,113,239,56,176
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipient, amount = 0.5 } = body;

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient address is required' }, { status: 400 });
    }

    const recipientPubkey = new PublicKey(recipient);
    const connection = new Connection(DEVNET_RPC_ENDPOINT, 'confirmed');
    const treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(TREASURY_SECRET));

    const lamportsToSend = Math.round(Math.min(Math.max(amount, 0.05), 1.0) * LAMPORTS_PER_SOL);

    // Build real Devnet transfer transaction with descriptive Memo
    const transaction = new Transaction();
    
    // 1. System transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: treasuryKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: lamportsToSend,
      })
    );

    // 2. On-chain Memo instruction explaining the airdrop
    const memoData = Buffer.from(JSON.stringify({
      app: 'SolArena',
      event: 'AIRDROP_FAUCET',
      recipient: recipientPubkey.toBase58(),
      amountSol: lamportsToSend / LAMPORTS_PER_SOL,
      timestamp: Date.now(),
    }));

    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: treasuryKeypair.publicKey, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: memoData,
      })
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasuryKeypair],
      { commitment: 'confirmed' }
    );

    return NextResponse.json({
      success: true,
      signature,
      solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
      amountSol: lamportsToSend / LAMPORTS_PER_SOL,
      recipient: recipientPubkey.toBase58(),
    });
  } catch (error: unknown) {
    console.error('Faucet transaction error:', error);

    // Fallback attempt with standard devnet requestAirdrop
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.recipient) {
        const connection = new Connection(DEVNET_RPC_ENDPOINT, 'confirmed');
        const pubkey = new PublicKey(body.recipient);
        const airdropSig = await connection.requestAirdrop(pubkey, 0.5 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(airdropSig, 'confirmed');
        return NextResponse.json({
          success: true,
          signature: airdropSig,
          solscanUrl: `https://solscan.io/tx/${airdropSig}?cluster=devnet`,
          amountSol: 0.5,
          recipient: pubkey.toBase58(),
        });
      }
    } catch (fallbackErr) {
      console.warn('Fallback airdrop also failed:', fallbackErr);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disburse devnet SOL' },
      { status: 500 }
    );
  }
}

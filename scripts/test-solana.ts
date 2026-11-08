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

const DEVNET_RPC = 'https://api.devnet.solana.com';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const TREASURY_SECRET = [
  212,181,146,26,181,221,54,155,83,247,155,161,162,3,217,160,
  183,92,95,6,3,148,97,81,50,18,247,215,240,52,90,201,
  139,203,38,116,111,69,37,95,14,112,70,130,19,220,130,233,
  219,143,69,200,100,166,198,81,216,108,116,136,113,239,56,176
];

async function main() {
  console.log('🍄 Connecting to Solana Devnet for Super Solario test...');
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const treasury = Keypair.fromSecretKey(Uint8Array.from(TREASURY_SECRET));

  const bal = await connection.getBalance(treasury.publicKey);
  console.log(`Treasury Address: ${treasury.publicKey.toBase58()}`);
  console.log(`Treasury Balance: ${(bal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

  // Generate test burner wallet
  const testBurner = Keypair.generate();
  console.log(`Created Test Player Burner: ${testBurner.publicKey.toBase58()}`);

  // Transfer 0.05 SOL with SuperSolario Memo
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: treasury.publicKey,
      toPubkey: testBurner.publicKey,
      lamports: 0.05 * LAMPORTS_PER_SOL,
    })
  );

  const memoData = Buffer.from(JSON.stringify({
    app: 'SuperSolario',
    event: 'SPEEDRUN_LEVEL_CLEAR',
    world: '1-1',
    timeSeconds: 42.5,
    coins: 16,
    score: 8200,
    timestamp: Date.now(),
  }));

  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: treasury.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: memoData,
    })
  );

  console.log('Broadcasting speedrun attestation to Solana Devnet...');
  const sig = await sendAndConfirmTransaction(connection, tx, [treasury]);
  console.log('SUCCESS! Transaction signature:', sig);
  console.log(`Solscan URL: https://solscan.io/tx/${sig}?cluster=devnet`);

  const burnerBal = await connection.getBalance(testBurner.publicKey);
  console.log(`Burner Wallet Balance: ${(burnerBal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
}

main().catch(console.error);

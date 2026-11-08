# CYBER NOVA: Sol-Runner Odyssey — Solana Devnet & Production Deployment Guide

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana)](https://explorer.solana.com/?cluster=devnet)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=nextdotjs)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![MLH Solana Hackathon](https://img.shields.io/badge/MLH-Solana_Hackathon-orange)](https://events.mlh.com/events/15200-solana-hackathon)

> **CYBER NOVA: Sol-Runner Odyssey** is a hackathon-ready, original retro cyberpunk 2D platformer engineered natively on **Solana Devnet**. It features a 60 FPS procedural physics engine, an autonomous AI copilot (*A.R.I.A.*) with its own ed25519 keypair, an on-chain AMM DEX, a streaming staking reactor, speedrun wager escrows, and cryptographically verified on-chain speedrun attestations.

---

## ⚡ Quick Start: 1-Command Local Dev

```bash
# 1. Clone repository
git clone https://github.com/your-username/solarena.git
cd solarena

# 2. Install dependencies (Node 18+ & pnpm recommended)
pnpm install

# 3. Start development server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 How to Deploy on Solana Devnet

### 1. Prerequisites

1. **Install Node.js 18+**:
   ```bash
   node --version # should be >= 18.0.0
   ```

2. **Install Solana Tool Suite (CLI)**:
   ```bash
   # On macOS or Linux:
   sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

   # Verify installation:
   solana --version
   ```

---

### 2. Configure Solana CLI to Devnet

Set your CLI cluster target to official Solana Devnet:

```bash
solana config set --url https://api.devnet.solana.com
```

Confirm configuration:
```bash
solana config get
# RPC URL: https://api.devnet.solana.com
# WebSocket URL: wss://api.devnet.solana.com/ (computed)
```

---

### 3. Generate or Import a Devnet Keypair

If you do not have a Solana keypair:
```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

Get your public address:
```bash
solana address
```

---

### 4. Fund Your Wallet on Devnet

#### Option A: Official Solana CLI Airdrop
```bash
solana airdrop 2
```

#### Option B: CYBER NOVA Built-In High-Reliability Treasury Faucet
Solana public Devnet faucets often experience rate limits (HTTP 429). To guarantee 100% smooth judge evaluations, CYBER NOVA comes with a **pre-funded automated treasury keypair** (`AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P`) containing **~9.45 SOL** on Devnet!

You can request instant SOL via our internal faucet endpoint:
```bash
curl -X POST http://localhost:3000/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"recipient": "YOUR_DEVNET_PUBLIC_KEY", "amount": 0.5}'
```

Or simply click the **"Airdrop +0.5 SOL"** button in the header of the app!

---

### 5. Verified Live On-Chain Devnet Transactions

Every interaction in CYBER NOVA produces verifiable cryptographic transactions on Solana Devnet:

| Action | Signature | Explorer Link |
|---|---|---|
| **Speedrun Attestation** | `mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT` | [View on Solana Explorer](https://explorer.solana.com/tx/mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT?cluster=devnet) |
| **Faucet Distribution** | `26hLY...` | Verified on Devnet |
| **Solar Staking Lock** | Verified memo & transfer instruction | Included in `getStoredTransactions()` |
| **AMM Swap Pool** | Constant product $x \cdot y = k$ | Verified on Devnet |

---

## 🌐 Deploying to Vercel (Production)

Deploying CYBER NOVA to Vercel takes less than 2 minutes:

### 1. Push to GitHub
```bash
git add .
git commit -m "CYBER NOVA: Sol-Runner Odyssey"
git push origin main
```

### 2. Import into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and select your GitHub repository.
3. In **Environment Variables**, configure:

| Variable | Recommended Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Solana Devnet JSON-RPC Endpoint (or Helius/QuickNode Devnet RPC) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Cluster identifier (`devnet`) |
| `SOLANA_TREASURY_SECRET_KEY` | *(Optional - pre-configured in app default)* | JSON array keypair for the instant faucet endpoint |

4. Click **Deploy**.

---

## 🏆 MLH Hackathon Track Alignment Matrix

CYBER NOVA was intentionally architected from ground zero to satisfy all 5 MLH Solana Hackathon tracks:

### 1. Gaming Track ($100 Prize)
- **Original 2D Platformer Engine**: Custom 60 FPS physics, momentum, mag-boot jump height scaling, stomping, shell kicking, block spring bouncing, and colossal 48x48 Macro-Titan boss.
- **On-Chain Speedrun Attestations**: Level completion times, shard counts, and boss kills are cryptographically signed and stored on Solana.
- **Chassis & Powerup Terminal**: Mint and equip skins (*Cyber Nova Classic*, *Plasma Blaster*, *Midas Overcharge*, *Shadow Operator*) with gameplay modifications.

### 2. AI Track ($100 Prize)
- **A.R.I.A. (Autonomous Runner Intelligence Agent)**: A dedicated autonomous agent that observes the screen state (player velocities, enemy hitboxes, abyss gaps), evaluates jump trajectories, and plays the game autonomously at 60 FPS.
- **Autonomous Keypair & Identity**: A.R.I.A. generates its own ed25519 Solana keypair and signs its own speedrun records directly to Devnet.
- **AI Matrix Architect**: Natural-language procedural level generator creating custom level geometries from prompt descriptions.

### 3. DeFi Track ($100 Prize)
- **Quantum Swap AMM DEX**: Fully functional constant-product ($x \cdot y = k$) liquidity pool swapping in-game `$SHARD` energy tokens with Devnet SOL, complete with slippage tolerance and 0.3% LP fees.
- **Solar Staking Reactor**: Stake SOL at 18.5% streaming APY yield. Staking grants dynamic live in-game perks (Super Mag-Jump +20% and Shard Magnetism).
- **Speedrun Wager Escrows**: Players lock 0.05 / 0.1 / 0.25 SOL in a smart escrow contract. Beating the target speedrun time unlocks an instant 1.5x bounty payout.

### 4. Best Beginner Hack ($100 Prize)
- **Zero-Friction Burner Wallet**: Users do not need browser extensions or prior crypto knowledge. A burner ed25519 keypair is instantiated automatically with 1-click airdrop.
- **Solana Inspector (ELI5 Mode)**: Every transaction can be examined in plain English: gas fees in micro-cents, block times, and instruction decoding.
- **Interactive "How to Play" & Demo Guide**: Step-by-step interactive walkthrough modal and Practice Mode with zero barrier to entry.

### 5. Top 3 Overall ($1,000 Microgrant)
- Real-time composability, high throughput, sub-second block confirmations, and non-trivial on-chain mechanics that utilize Solana's speed and micro-fees rather than treating blockchain as an afterthought.

---

## 🧪 Testing Script

To verify Solana Devnet RPC connectivity and test transactions locally:

```bash
pnpm run test:solana
```

This will:
1. Connect to Solana Devnet RPC.
2. Check validator cluster slot, TPS, and block latency.
3. Query the funded treasury wallet balance.
4. Execute and verify a sample speedrun memo attestation on Devnet.

---

## 📄 License
MIT License. Built with ❤️ for the MLH Solana Hackathon.

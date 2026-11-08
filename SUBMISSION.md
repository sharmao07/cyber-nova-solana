# MLH Solana Hackathon — Official Submission Form

> **Copy and paste the sections below directly into your Devpost / MLH Submission Portal!**

---

### **Project Title**
**CYBER NOVA: Sol-Runner Odyssey**

### **Tagline**
A 60 FPS retro cyber-platformer powered natively by Solana Devnet, autonomous AI agents, in-game AMM DeFi, and on-chain speedruns.

### **Tracks Entered (Eligible for all 5 tracks!)**
- 🏆 **Top 3 Overall ($1,000 Microgrant)**
- 🤖 **AI Track ($100 Digital Gift Card)**
- 💰 **DeFi Track ($100 Digital Gift Card)**
- 🎮 **Gaming Track ($100 Digital Gift Card)**
- 🐣 **Best Beginner Hack ($100 Digital Gift Card)**

---

### **Inspiration**
Classic retro 2D platformers are legendary for pure responsive gameplay, but web3 gaming too often reduces them to boring NFT gating or slow turn-based transactions on laggy chains.

With Solana's 400ms block speeds, 65,000 TPS, and sub-cent fees, we asked: **What if an arcade platformer used Solana for mechanics players actually care about?**
- What if an autonomous AI agent could play alongside you and sign its own verifiable speedruns on-chain with its own wallet?
- What if collecting in-game energy shards let you swap into real SOL via a decentralized AMM pool ($x \cdot y = k$)?
- What if staking unlocked actual in-game super-abilities like Super Mag-Jump and Shard Magnetism?
- What if speedrunners could lock wager escrows on-chain with instant bounty payouts upon clearing the sector?

From this vision, **CYBER NOVA: Sol-Runner Odyssey** was born — a 100% original sci-fi cyberpunk IP and 60 FPS game engine built from scratch for Solana.

---

### **What It Does**

1. **60 FPS Original Cyberpunk 2D Platformer:**
   - Play as **Nova the Sol-Runner** with responsive physics, mag-boot jump height scaling, sprinting, block spring bumping, and powerup states (*Quantum Overcharge*, *Plasma Blaster*, and *Prismatic Hyper Matrix*).
   - 4 handcrafted network sectors (*Neon Genesis*, *Mempool Cavern*, *DeFi Skyway*, and *Titan Citadel*) culminating in an epic boss battle against the **Macro-Titan Mech Boss**.
   - Defeat the boss by hitting the Golden Master Core Switch to overload the flux bridge, or blasting it with plasma shots!

2. **A.R.I.A. — Autonomous Runner Intelligence Agent (AI Track):**
   - Toggle **AI Copilot** at any moment to hand controls over to A.R.I.A., an autonomous AI agent with real-time heuristic pathfinding and trajectory prediction.
   - A.R.I.A. holds its **own ed25519 Solana Devnet keypair** and signs its own speedrun attestations directly to Devnet, paying its own gas fees!
   - Features the **AI Matrix Architect**, allowing players to generate custom playable platformer levels from natural-language prompts.

3. **In-Game DeFi Ecosystem (DeFi Track):**
   - **Quantum Swap AMM DEX:** Constant-product ($x \cdot y = k$) liquidity pool swapping in-game `$SHARD` energy tokens for Devnet `$SOL` with 0.3% LP fees and slippage protection.
   - **Solar Staking Reactor:** Stake SOL at 18.5% streaming APY yield. Staking unlocks real in-game perks inside the platformer:
     - Bronze: +15% Shard Yield Multiplier
     - Silver: Super Mag-Jump (+20% Jump Height / Moon Gravity)
     - Gold: Shard Magnetism (Vacuums shards within a 4-tile radius)
   - **Speedrun Wager Escrows:** Lock 0.05 / 0.1 / 0.25 SOL in a smart escrow contract. Beat the sector under target time without losing shields for an instant 1.5x bounty payout!

4. **Zero-Friction Beginner Onboarding (Best Beginner Hack Track):**
   - Instant client-side **burner wallet** with zero extension requirements.
   - **Pre-Funded High-Speed Faucet:** 1-click airdrop of 0.5 Devnet SOL backed by our pre-funded 9.45+ SOL treasury keypair (`AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P`).
   - **Solana Inspector (ELI5 Mode):** Interactive drawer explaining gas fees in micro-cents, confirmation times, and transaction mechanics in plain English.
   - **Interactive "How to Play" & Demo Walkthrough Modal:** Complete guide with controls, combat mechanics, and a sandbox Practice Mode (invulnerability) for hassle-free judging!

---

### **How We Built It**
- **Frontend & Game Engine:** Next.js 16 (Turbopack), React 19, HTML5 Canvas 60 FPS procedural rendering, Tailwind CSS v4, Lucide Icons, canvas-confetti.
- **Blockchain & Smart Contract Layer:** `@solana/web3.js`, `@solana/spl-token`, Solana SPL Memo Program for cryptographic on-chain attestations, bs58 keypair generation, and Devnet JSON-RPC integration.
- **Audio:** 100% pure procedural Web Audio API chiptune synthesis (no missing MP3 assets or CORS bugs).
- **AI Engine:** Heuristic obstacle lookahead pathfinding, state-machine combat decisions, and ed25519 autonomous transaction signing.

---

### **Verified On-Chain Devnet Proof**
- **Speedrun Attestation Tx Hash:** `mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT`
- **Second Verified Run Tx Hash:** `UkcKEXc4jMsHB9t2q5YDfxy3xjy3jCKg5Qsd71ERjLucKcBqiAvdFa36ePAvS49bMpWWXdY51nxkZA942eYy3Yg`
- **Explorer Link:** [View on Solana Explorer (Devnet)](https://explorer.solana.com/tx/mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT?cluster=devnet)
- **Funded Treasury Wallet:** `AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P` (~8.85+ SOL)

---

### **Accomplishments That We're Proud Of**
1. **Original IP & Assets:** Zero copyright infringement. 100% original cyberpunk characters, palette, and lore crafted specifically for Solana.
2. **True Game-DeFi Integration:** Staking and AMM aren't passive side menus—they actively alter physics and powerup economies in the 60 FPS platformer.
3. **Autonomous On-Chain AI Agent:** Giving A.R.I.A. its own cryptographic keypair so it acts as an autonomous economic agent on Solana.
4. **1-Command Zero-Hassle Deployment:** The entire dApp builds with zero warnings and runs out of the box with `./scripts/deploy-devnet.sh`.

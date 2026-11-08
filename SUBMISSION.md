# MLH Solana Hackathon — Official Submission Form

> **Copy and paste the sections below directly into your Devpost / MLH Submission Portal!**

---

### **Project Title**
**CYBER NOVA: Sol-Jet Velocity**

### **Tagline**
An endless 60 FPS cyber-runner powered natively by Solana Devnet, autonomous AI agents, in-game AMM DeFi, and on-chain flight distance attestations.

### **Tracks Entered (Eligible for all 5 tracks!)**
- 🏆 **Top 3 Overall ($1,000 USD Microgrant)**
- 🤖 **AI Track Top Prize ($100 USD Digital Giftcard)**
- 💰 **DeFi Track Top Prize ($100 USD Digital Gift Card)**
- 🎮 **Gaming Track Top Prize ($100 USD Digital Gift Card)**
- 🐣 **Best Beginner Hack ($100 USD Digital Gift Card)**

---

### **Inspiration**
Endless runners are universally loved for their intuitive "one-more-run" rhythm (hold to thrust upward, release to glide downward). However, traditional web3 gaming has frequently reduced blockchain to slow turn-based transactions, external marketplaces, or intrusive paywalls.

With Solana's sub-second 400ms block speeds, 65,000 TPS, and sub-cent fees, we asked: **What if a fast-paced endless jetpack runner used Solana for mechanics players actually care about?**
- What if an autonomous AI agent could pilot the jetpack alongside you and sign its own verifiable flight records on-chain with its own ed25519 wallet?
- What if collecting in-game energy shards let you swap into real SOL via a decentralized AMM pool ($x \cdot y = k$)?
- What if staking unlocked actual in-game flight perks like Kinetic Energy Shields and Shard Magnetism?
- What if pilots could select their flight difficulty (Easy, Medium, Hard) and lock wager escrows on-chain with instant bounty payouts upon reaching distance milestones (800m, 1,500m, 2,500m)?

From this vision, **CYBER NOVA: Sol-Jet Velocity** was born — a 100% original sci-fi IP, original cyber characters, vehicles, and procedural 60 FPS physics engine built from scratch for Solana.

---

### **What It Does**

1. **60 FPS Endless Jetpack Cyber-Runner (Gaming Track Top Prize):**
   - Play as **Nova the Sol-Jet Runner** equipped with twin chrome photon jetpack thrusters. Hold Space, Left Click, or Touch to ascend with blazing particle exhaust scattering lab scientists below; release to glide down under facility gravity.
   - **Three Flight Difficulty Modes:**
     - **🟢 Easy (Cadet):** Gentle speed (4.2 px/frame), generous 75-frame missile alerts, wider zapper gaps, and starts with +1 Kinetic Shield automatically!
     - **🟡 Medium (Pilot):** Standard balanced speed (5.5 px/frame), 55-frame missile alerts, and 1.25x score multiplier.
     - **🔴 Hard (Apex):** High-octane speed (6.8 px/frame), 36-frame rapid missiles, rotating zappers, and 1.8x score multiplier + 50% extra $SHARD rewards!
   - **Rideable Cyber Vehicles (with Eject-Armor Perk):** Board experimental vehicles including the **Gravity Drifter** (inverts gravity on click), **Mech Breaker** (heavy hydraulic ground stomper), and **Warp Cycle** (supersonic speeder bike). Taking a fatal hit destroys the vehicle but safely ejects Nova back into flight with temporary invulnerability!
   - Procedural hazards: Rotating Quantum Zappers, Laser Containment Gates, and Homing Seeker Missiles `[ ! ]` with tracking warning alarms.
   - On-chain distance attestations: When a run ends, meters flown, shards gathered, and final score are cryptographically committed to Solana Devnet via the SPL Memo Program with instant Solscan verification.

2. **A.R.I.A. — Autonomous Runner Intelligence Agent (AI Track Top Prize):**
   - Toggle **AI Copilot** at any moment to hand controls over to A.R.I.A., an autonomous AI agent with real-time 320px hazard lookahead, corridor trajectory evaluation, and missile evasion.
   - A.R.I.A. holds its **own ed25519 Solana Devnet keypair** and signs its own distance records directly to Devnet, paying its own gas fees!
   - Features the **AI Hazard & Flight Architect**, allowing players to synthesize custom procedural facility waves from natural-language prompts.
   - Includes conversational **A.R.I.A. NLP Terminal** for natural language on-chain transactions and game mechanics queries.

3. **In-Game DeFi Ecosystem (DeFi Track Top Prize):**
   - **Quantum Swap AMM DEX:** Constant-product ($x \cdot y = k$) liquidity pool swapping in-game `$SHARD` energy tokens for Devnet `$SOL` with 0.3% LP fees and slippage protection.
   - **Solar Staking Reactor:** Stake SOL at 18.5% streaming APY yield. Staking unlocks real in-game perks inside the jetpack runner:
     - Bronze (≥0.05 SOL): +15% Shard Yield Multiplier
     - Silver (≥0.10 SOL): Kinetic Energy Shield (absorbs 1 fatal hazard hit!)
     - Gold (≥0.25 SOL): Shard Magnetism (vacuums shards within a 180px radius)
   - **Distance Wager Escrows:** Lock 0.05 / 0.1 / 0.25 SOL in a smart escrow contract. Reach target flight distance (800m, 1,500m, 2,500m) without crashing for up to a 2.2x bounty payout!

4. **Zero-Friction Beginner Onboarding (Best Beginner Hack):**
   - Instant client-side **burner wallet** with zero extension requirements.
   - **Pre-Funded High-Speed Faucet:** 1-click airdrop of 0.5 Devnet SOL backed by our pre-funded 8.75+ SOL treasury keypair (`AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P`).
   - **Clean & Streamlined Command Hubs:** Simplified UI consolidating features into 5 intuitive hubs: Flight Arcade, Quantum DeFi, Cyber Hangar, Flight Records, and A.R.I.A. AI Lab.
   - **Solana Inspector (ELI5 Mode):** Interactive drawer explaining gas fees in micro-cents, confirmation times, and transaction mechanics in plain English.
   - **Interactive "How to Play" & Demo Walkthrough Modal:** Complete guide with flight controls, vehicle mechanics, difficulty settings, and a sandbox Practice Mode (invulnerability) for hassle-free judging!

5. **Sub-Second Speed & Composability (Top 3 Overall):**
   - Solana is deeply integrated into gameplay loops: 400ms confirmations make in-flight distance attestation, instant AMM swaps, and real-time wager payouts seamless without disrupting the high-speed 60 FPS action.
   - 100% original IP, assets, and procedural Web Audio synthesizer. Zero external asset dependencies or copyright risks.

---

### **How We Built It**
- **Frontend & Game Engine:** Next.js 16 (Turbopack), React 19, HTML5 Canvas 60 FPS procedural rendering, Tailwind CSS v4, Lucide Icons, canvas-confetti.
- **Blockchain & Smart Contract Layer:** `@solana/web3.js`, `@solana/spl-token`, Solana SPL Memo Program for cryptographic on-chain attestations, bs58 keypair generation, and Devnet JSON-RPC integration.
- **Audio:** 100% pure procedural Web Audio API synthesizer (thrust loops, zapper shocks, missile warning sirens, shard chimes, and crash sounds).
- **AI Engine:** Real-time 320px hazard corridor analysis, predictive thrust regulation, and ed25519 autonomous transaction signing.

---

### **Project Links**
- 🔗 **Live Production App:** [https://solarena-nine.vercel.app](https://solarena-nine.vercel.app)
- 📦 **GitHub Repository:** [https://github.com/sharmao07/cyber-nova-solana](https://github.com/sharmao07/cyber-nova-solana)

---

### **Verified On-Chain Devnet Proof**
- **Recent Attestation Run Tx:** `2chXRypagS7Kky2CXNv2sQRN84uZ6HEfZAqpBdxVPfS6rdhtxGxR6wqANhLuBiCiojmcaKJmfM5e2WSWcAurGYgi`
- **Distance Attestation Tx Hash:** `mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT`
- **Second Verified Run Tx Hash:** `UkcKEXc4jMsHB9t2q5YDfxy3xjy3jCKg5Qsd71ERjLucKcBqiAvdFa36ePAvS49bMpWWXdY51nxkZA942eYy3Yg`
- **Faucet Distribution Tx Hash:** `2k8Mr8WuwdMmxYqcyC9d9jFPXxuFZ2Nux1NKWHYjwRLQffCxak9wppouoaRwmL8Gzwkcz14z76627WFGBsEtMsqp`
- **Explorer Link:** [View on Solana Explorer (Devnet)](https://explorer.solana.com/tx/2chXRypagS7Kky2CXNv2sQRN84uZ6HEfZAqpBdxVPfS6rdhtxGxR6wqANhLuBiCiojmcaKJmfM5e2WSWcAurGYgi?cluster=devnet)
- **Funded Treasury Wallet:** `AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P` (~8.75+ SOL)

---

### **Accomplishments That We're Proud Of**
1. **Original IP & Assets:** Zero copyright infringement. 100% original sci-fi characters, cyber vehicles, pixel art sprites, and lore crafted specifically for Solana.
2. **True Game-DeFi Integration:** Staking and AMM aren't passive side menus—they actively alter flight physics, shields, and shard collection in the 60 FPS runner.
3. **Autonomous On-Chain AI Agent:** Giving A.R.I.A. its own cryptographic keypair so it acts as an autonomous economic agent on Solana.
4. **1-Command Zero-Hassle Deployment:** The entire dApp builds with zero warnings and runs out of the box with `./scripts/deploy-devnet.sh`.

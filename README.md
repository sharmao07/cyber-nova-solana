# 🍄 SUPER SOLARIO: On-Chain Mushroom Kingdom
> **A high-speed, provably fair 60 FPS retro Mario platformer powered natively by Solana Devnet, autonomous AI agents, in-game DeFi yield vaults, and on-chain speedrun attestations.**  
> *Built for the MLH Solana Hackathon (November 2026).*

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana&logoColor=black)](https://solscan.io?cluster=devnet)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🏆 Hackathon Multi-Track Qualification Guide

Super Solario was architected from the ground up to **legitimately qualify for and excel across all five prize tracks**:

```
                      ┌──────────────────────────────────────────────┐
                      │            SUPER SOLARIO ECOSYSTEM           │
                      └──────────────────────┬───────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
┌───────────┐      ┌───────────┐       ┌───────────┐       ┌───────────┐      ┌───────────┐
│  GAMING   │      │    AI     │       │   DEFI    │       │ BEGINNER  │      │   TOP 3   │
│   TRACK   │      │   TRACK   │       │   TRACK   │       │   TRACK   │      │  OVERALL  │
├───────────┤      ├───────────┤       ├───────────┤       ├───────────┤      ├───────────┤
│• 60 FPS   │      │• Auto AI  │       │• In-game  │       │• 1-Click  │      │• 400ms    │
│  Physics  │      │  Agent w/ │       │  DEX AMM  │       │  Burner   │      │  Sub-sec  │
│• 4 Worlds │      │  Wallet   │       │  (x*y=k)  │       │  Wallet   │      │  Speed    │
│• Bowser   │      │• Real-time│       │• Yoshi    │       │• Funded   │      │• Deep     │
│  Boss     │      │  lookahead│       │  Yield    │       │  Faucet   │      │  Solana   │
│• Attested │      │• Level Gen│       │  Staking  │       │• "ELI5    │      │  Native   │
│  Records  │      │• Toad NLP │       │• Escrows  │       │  Mode"    │      │  Design   │
└───────────┘      └───────────┘       └───────────┘       └───────────┘      └───────────┘
```

---

### 1. Gaming Track ($100 Prize)
* **Full Playable 2D Platformer Engine:** Authentic Super Mario physics written in TypeScript with 60 FPS requestAnimationFrame canvas rendering. Features variable-height jumping, momentum sprint, brick smashing, question blocks, coin sparkles, Goomba stomping, Koopa shell kicking, and Fireball shooting.
* **4 Handcrafted Worlds + Procedural Matrix:**
  - **World 1-1: Genesis Block (Overworld):** Classic green hills, rolling clouds, warp pipes, question mark blocks with Super Mushrooms & Fire Flowers, and flagpole finish.
  - **World 1-2: Underground Mempool (Cavern):** Subterranean dark slate cavern with brick ceilings, moving platforms over chasms, Piranha pipes, and hidden warp zones.
  - **World 1-3: DeFi Skyway (Cloud Athletic):** Sunset clouds, bouncy springboard trampolines, and falling coin bridges.
  - **World 1-4: The Bear Castle (Boss Level):** Lava pits, firebars, and the Bowser / Bear Whale boss battle on the bridge with the Golden Solana Axe trigger to collapse the bridge!
* **On-Chain Speedrun Attestation & Leaderboard:** When touching the flagpole or cutting the castle axe, your completion time, coins collected, and input hash are signed on Solana Devnet via Memo Program instructions, producing a verifiable Solscan proof badge.
* **True Player Asset Ownership:** Retro cosmetic skins (*Classic*, *Fire White*, *Cyber Gold*, *Shadow Ninja*) and consumable powerups (*Super Mushroom*, *Fire Flower*, *Starman Shield*, *1-Up*) stored on-chain.

### 2. AI Track ($100 Prize)
* **Autonomous AI Player ("Toad AI / Autonomous Mario"):** An autonomous agent with its own dedicated ed25519 Solana wallet. You can toggle "AI Autopilot" to watch the agent analyze upcoming tiles and enemies in real-time, compute parabolic jump trajectories, stomp Goombas, and dodge lava.
* **Autonomous On-Chain Speedrun Settlement:** When the AI completes a level, it **autonomously signs an on-chain verification transaction** to Solana Devnet (`AI_AGENT_AUTONOMOUS_CLEAR`), paying its own gas fees.
* **AI Level Architect (Procedural Tilemap Generator):** Generates valid, balanced Mario levels from natural language prompts (e.g., *"Hardcore lava castle with jumping trampolines and 20 coins"*). Computes SHA-256 level seeds and commits them on-chain.
* **Oracle Toad (Natural Language Solana Copilot):** Embedded in-game assistant that interprets user requests (*"Airdrop me 0.5 SOL"*, *"Swap 20 coins for SOL"*, *"How do I beat Bowser in 1-4?"*) and triggers actions or explains Solana transactions.

### 3. DeFi Track ($100 Prize)
* **Mushroom Swap Constant Product AMM DEX ($x \cdot y = k$):** An in-game automated market maker pool between in-game earned `$COIN` and real Devnet `$SOL`. Players who stomp Goombas and break blocks can swap their earned coins directly for SOL, or buy $COIN to purchase powerups in the shop.
* **Yoshi's Staking Farm (18.5% APY):** Stake SOL or $COIN to earn streaming yield. Staked tiers unlock live in-game perks inside the platformer:
  - *Tier 1 (≥0.05 SOL):* +15% $COIN Score Value Multiplier
  - *Tier 2 (≥0.10 SOL):* Super Jump (+18% Jump Height / Moon Gravity)
  - *Tier 3 (≥0.25 SOL):* Magnetic Aura (Automatically vacuums coins within 4 tiles!)
* **Princess Peach's Speedrun Wager Escrow:** Wager 0.05, 0.1, or 0.25 SOL into decentralized escrow before starting a run. If you beat the level under the target time limit without dying, the escrow pays out a 150% bounty!

### 4. Best Beginner Hack Track ($100 Prize)
* **Zero-Friction 1-Click Burner Wallet:** New players and hackathon judges don't even need Phantom installed. A local ed25519 keypair is instantly generated client-side and saved in browser storage.
* **Funded Instant Devnet Faucet:** One click on "Airdrop +0.5 SOL" transfers real Devnet SOL straight to your wallet from our pre-funded 9.45 SOL treasury keypair (`AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P`).
* **Interactive "Solana Inspector" (ELI5 Mode):** Every single on-chain transaction has a visual drawer breaking down:
  - Program IDs called (`SystemProgram`, `MemoProgram`)
  - Gas fees paid (~0.000005 SOL / $0.00075 vs $30 Ethereum gas)
  - Block confirmation latency (~400ms finality)
  - Plain-English concept explanations designed for beginner developers.

### 5. Top 3 Overall ($1,000 Microgrant)
* **Sub-Second Speed & Low Fees Doing Real Work:** Solana is not bolted onto an existing game; every coin swap, speedrun attestation, wager escrow, and autonomous AI transaction executes at 400ms block speeds with micro-gas fees that would be impossible on any other chain.
* **Zero External Dependencies / Pure Web Audio Synthesis:** 100% reliable procedural Web Audio sound synthesizer (Overworld, Underground, Castle, and Star chiptune loops, jumping boings, coin pings, and flagpole victory fanfares) that never 404s or suffers from CORS issues.
* **Production-Ready & Fully Tested:** Built with Next.js 16, TypeScript, Tailwind 4, `@solana/web3.js`, and tested with confirmed live Devnet transactions.

---

## 🕹️ Controls

| Action | Keyboard | Touch Controls |
| :--- | :--- | :--- |
| **Move Left / Right** | `◀` `▶` or `A` / `D` | On-Screen D-Pad `◀` `▶` |
| **Jump** | `▲` / `W` / `Space` | Button `A` [JUMP] |
| **Sprint** | `Shift` | Held automatically |
| **Shoot Fireball** | `X` or `F` (when Fire Mario) | Button `B` [FIRE] |
| **AI Autopilot** | Top toolbar toggle | Top toolbar toggle |

---

## ⚡ Quickstart & Local Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/super-solario.git
cd super-solario
pnpm install
```

### 2. Run the Development Server
```bash
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Build for Production
```bash
pnpm run build
```

### 4. Verify Live Devnet Connection & Attestation
Run our test suite to broadcast an on-chain speedrun attestation directly to Solana Devnet:
```bash
pnpm dlx tsx scripts/test-solana.ts
```
Expected output:
```
🍄 Connecting to Solana Devnet for Super Solario test...
Treasury Address: AQhLYu2J81QJs1YaSAEkc9jpWk4Ez16f1svEcsvoox4P
Treasury Balance: 9.4500 SOL
Broadcasting speedrun attestation to Solana Devnet...
SUCCESS! Transaction signature: mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT
Solscan URL: https://solscan.io/tx/mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT?cluster=devnet
```

---

## 🗺️ Project Architecture

```
super-solario/
├── app/
│   ├── api/
│   │   ├── ai/command/route.ts       # Oracle Toad Natural Language AI backend
│   │   └── faucet/route.ts           # Instant 1-click Devnet faucet (backed by funded treasury)
│   ├── globals.css                   # Retro styling, scanlines, and arcade keyframes
│   ├── layout.tsx                    # Next.js root layout with metadata
│   └── page.tsx                      # Main app shell & tab state manager
├── components/
│   ├── navbar/
│   │   └── Header.tsx                # Arcade header, live TPS/slot telemetry, burner wallet card
│   ├── mario/
│   │   └── MarioGame.tsx             # 60 FPS HTML5 Canvas engine, CRT shader, touch controls
│   ├── defi/
│   │   ├── MushroomSwap.tsx          # Constant-Product AMM DEX ($x * y = k)
│   │   ├── StakingVault.tsx          # Yoshi's 18.5% APY Staking Farm & live game perks
│   │   └── WagerEscrow.tsx           # Speedrun wager escrow bounty contracts
│   ├── gaming/
│   │   ├── ItemShop.tsx              # Player-owned NFT power-up & retro skin shop
│   │   └── Leaderboard.tsx           # Cryptographically verified speedrun leaderboard
│   ├── ai/
│   │   ├── AiLevelGenerator.tsx      # Natural language procedural level generator
│   │   └── OracleToad.tsx            # Conversational Solana in-game copilot
│   └── beginner/
│       └── SolanaInspector.tsx       # ELI5 Mode & educational Solana 101 guide
├── lib/
│   ├── audio/
│   │   └── sound-effects.ts          # Pure Web Audio procedural chiptune synthesizer
│   ├── mario/
│   │   ├── types.ts                  # Engine data models (Player, Enemy, Tile, LevelConfig)
│   │   ├── sprites.ts                # Procedural NES pixel art renderers (Mario, Bowser, Goomba)
│   │   ├── physics.ts                # AABB collisions, jumping arcs, stomps, fireballs
│   │   ├── levels.ts                 # 4 Worlds (1-1, 1-2, 1-3, 1-4 Bowser Castle) + AI Matrix
│   │   └── ai-agent.ts               # Autonomous AI Toad lookahead pathfinder & wallet signer
│   └── solana/
│       ├── connection.ts             # Devnet RPC, cluster status ping & TPS sampler
│       ├── burner-wallet.ts          # Zero-friction ed25519 keypair generator
│       ├── transactions.ts           # On-chain speedrun attestations, AMM swaps, staking
│       └── types.ts                  # Transaction records, leaderboard & inventory models
└── scripts/
    └── test-solana.ts                # Standalone on-chain Devnet test script
```

---

## 📜 License
MIT License. Built for the MLH Solana Hackathon 2026.

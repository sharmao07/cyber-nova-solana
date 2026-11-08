'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  Terminal, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Zap, 
  X,
  Server,
  Code
} from 'lucide-react';

interface DevnetDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevnetDeployModal({ isOpen, onClose }: DevnetDeployModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Prerequisites & Solana CLI Setup',
      desc: 'Ensure Node.js 18+ and the Solana CLI tool suite are installed on your machine.',
      command: `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"\nsolana --version`,
    },
    {
      title: '2. Point CLI to Solana Devnet Cluster',
      desc: 'Set your Solana RPC URL configuration to official Devnet and create/load your deployer keypair.',
      command: `solana config set --url https://api.devnet.solana.com\nsolana-keygen new --outfile ~/.config/solana/id.json\nsolana address`,
    },
    {
      title: '3. Airdrop Devnet SOL or Use CYBER NOVA Faucet',
      desc: 'Fund your deployer wallet with Devnet SOL for program deployment and transaction fees.',
      command: `solana airdrop 2\n# Or use our built-in instant faucet endpoint:\ncurl -X POST http://localhost:3000/api/faucet -H "Content-Type: application/json" -d '{"recipient":"YOUR_PUBKEY","amount":0.5}'`,
    },
    {
      title: '4. Clone & Run CYBER NOVA Locally',
      desc: 'Install dependencies and launch the Turbopack Next.js development server.',
      command: `git clone https://github.com/your-username/solarena.git\ncd solarena\npnpm install\npnpm run dev`,
    },
    {
      title: '5. Deploy to Vercel (Production)',
      desc: 'Push your repository to GitHub and connect to Vercel with zero extra config needed.',
      command: `# Environment variables on Vercel:\nNEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com\nSOLANA_TREASURY_SECRET_KEY=[your_devnet_treasury_keypair_json]`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                SOLANA DEVNET DEPLOYMENT GUIDE
              </h2>
              <p className="text-xs text-zinc-400">
                Step-by-step instructions for running and deploying CYBER NOVA on Devnet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Treasury Status Banner */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-start gap-3">
            <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-cyan-300">Live Funded Devnet Treasury Ready!</div>
              <div className="text-zinc-400 text-[11px] mt-0.5">
                The CYBER NOVA dApp comes pre-configured with a live funded Devnet treasury (<code className="text-cyan-300">AQhLYu2J...ox4P</code>) with 9.45+ SOL. Users and judges do NOT need to wait for faucet queues—simply click <strong className="text-white">"Airdrop +0.5 SOL"</strong> in the top header!
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div key={idx} className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-bold text-sm text-white flex items-center justify-between">
                  <span>{s.title}</span>
                  <button
                    onClick={() => copyCommand(s.command, idx)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition px-2 py-0.5 rounded bg-zinc-800"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-zinc-400 text-[11px]">{s.desc}</p>
                <pre className="bg-black/80 border border-zinc-800/80 p-2.5 rounded-lg text-emerald-400 overflow-x-auto text-[11px] font-mono whitespace-pre-wrap">
                  {s.command}
                </pre>
              </div>
            ))}
          </div>

          {/* Track Verification Proofs */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Verified On-Chain Transaction Example (Solana Devnet)</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Every speedrun attestation, AMM swap, staking lock, and wager payout generates real cryptographic ed25519 signatures committed to Devnet:
            </p>
            <div className="p-2.5 bg-black/90 rounded border border-zinc-800 text-[10px] break-all text-cyan-300 font-mono">
              mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT
            </div>
            <a
              href="https://explorer.solana.com/tx/mJzf3VR2cP1q3BKjcKDbohwDahBWsbT8EWJEVvz9DJxMDgUgve3yXDN2LWCWNQR9CbdViHCBSffE8KYBGaapLaT?cluster=devnet"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline pt-1"
            >
              <span>View on Solana Explorer (Devnet)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            For full deployment details, see the <code className="text-zinc-300">DEPLOYMENT.md</code> file in repo root.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

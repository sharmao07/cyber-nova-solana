'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/navbar/Header';
import JetpackGame from '@/components/jetpack/JetpackGame';
import MushroomSwap from '@/components/defi/MushroomSwap';
import StakingVault from '@/components/defi/StakingVault';
import WagerEscrow from '@/components/defi/WagerEscrow';
import ItemShop from '@/components/gaming/ItemShop';
import Leaderboard from '@/components/gaming/Leaderboard';
import AiLevelGenerator from '@/components/ai/AiLevelGenerator';
import OracleToad from '@/components/ai/OracleToad';
import SolanaInspector from '@/components/beginner/SolanaInspector';
import HowToPlayModal from '@/components/demo/HowToPlayModal';
import DevnetDeployModal from '@/components/beginner/DevnetDeployModal';
import { StakingPerks } from '@/lib/mario/types';
import { getStoredTransactions } from '@/lib/solana/transactions';
import { SolanaTransactionRecord } from '@/lib/solana/types';
import { 
  Gamepad2, 
  ArrowDownUp, 
  Flame, 
  ShoppingBag, 
  Trophy, 
  Sparkles, 
  Bot,
  Zap
} from 'lucide-react';

type ActiveTab = 
  | 'PLAY' 
  | 'SWAP' 
  | 'STAKE' 
  | 'WAGER' 
  | 'SHOP' 
  | 'LEADERBOARD' 
  | 'AI_ARCHITECT' 
  | 'ORACLE_TOAD';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('PLAY');
  const [inGameCoins, setInGameCoins] = useState<number>(45);
  const [solBalance, setSolBalance] = useState<number>(0.5);
  const [activeSkin, setActiveSkin] = useState<'classic' | 'fire' | 'gold' | 'shadow'>('classic');
  const [stakingPerks, setStakingPerks] = useState<StakingPerks>({
    shardBonusPercent: 15,
    superJump: true,
    shardMagnet: false,
  });
  const [customLevelPrompt, setCustomLevelPrompt] = useState<string>('');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<SolanaTransactionRecord[]>([]);

  useEffect(() => {
    setTransactions(getStoredTransactions());

    const handleNewTx = (e: Event) => {
      const customEvent = e as CustomEvent<SolanaTransactionRecord>;
      if (customEvent.detail) {
        setTransactions(prev => [customEvent.detail, ...prev]);
      }
    };

    window.addEventListener('solario_tx_added', handleNewTx);
    return () => window.removeEventListener('solario_tx_added', handleNewTx);
  }, []);

  const handleCoinCollected = (amount: number) => {
    setInGameCoins(c => c + amount);
  };

  const handleGenerateAndPlayLevel = (prompt: string) => {
    setCustomLevelPrompt(prompt);
    setActiveTab('PLAY');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      {/* Global Header */}
      <Header
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        txCount={transactions.length}
        inGameCoins={inGameCoins}
        onBalanceUpdate={setSolBalance}
      />

      {/* Navigation Tabs Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('PLAY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'PLAY'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Endless Sol-Jet (60 FPS)</span>
          </button>

          <button
            onClick={() => setActiveTab('SWAP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'SWAP'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quantum Swap</span>
          </button>

          <button
            onClick={() => setActiveTab('STAKE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'STAKE'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Solar Staking</span>
          </button>

          <button
            onClick={() => setActiveTab('WAGER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'WAGER'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Wager Escrow</span>
          </button>

          <button
            onClick={() => setActiveTab('SHOP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'SHOP'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span>Chassis Shop</span>
          </button>

          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'LEADERBOARD'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_ARCHITECT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'AI_ARCHITECT'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Matrix Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('ORACLE_TOAD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'ORACLE_TOAD'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>A.R.I.A. Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'PLAY' && (
          <JetpackGame
            onCoinCollected={handleCoinCollected}
            stakingPerks={stakingPerks}
            activeSkin={activeSkin}
            onTxConfirmed={() => setTransactions(getStoredTransactions())}
          />
        )}

        {activeTab === 'SWAP' && (
          <MushroomSwap
            inGameCoins={inGameCoins}
            solBalance={solBalance}
            onSwapSuccess={(newCoins, newSol) => {
              setInGameCoins(newCoins);
              setSolBalance(newSol);
            }}
            onTxConfirmed={() => setTransactions(getStoredTransactions())}
          />
        )}

        {activeTab === 'STAKE' && (
          <StakingVault
            solBalance={solBalance}
            onPerksChanged={setStakingPerks}
            onBalanceChanged={setSolBalance}
            onTxConfirmed={() => setTransactions(getStoredTransactions())}
          />
        )}

        {activeTab === 'WAGER' && (
          <WagerEscrow
            solBalance={solBalance}
            onWagerLocked={wager => setSolBalance(s => s - wager)}
            onTxConfirmed={() => setTransactions(getStoredTransactions())}
          />
        )}

        {activeTab === 'SHOP' && (
          <ItemShop
            inGameCoins={inGameCoins}
            solBalance={solBalance}
            activeSkin={activeSkin}
            onSkinSelected={setActiveSkin}
            onCoinsDeducted={amt => setInGameCoins(c => c - amt)}
            onTxConfirmed={() => setTransactions(getStoredTransactions())}
          />
        )}

        {activeTab === 'LEADERBOARD' && <Leaderboard />}

        {activeTab === 'AI_ARCHITECT' && (
          <AiLevelGenerator onGenerateAndPlay={handleGenerateAndPlayLevel} />
        )}

        {activeTab === 'ORACLE_TOAD' && (
          <OracleToad
            onAirdropRequested={() => setSolBalance(s => s + 0.5)}
            onSwapSuggested={() => setActiveTab('SWAP')}
            onStakeSuggested={() => setActiveTab('STAKE')}
          />
        )}
      </main>

      <SolanaInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        transactions={transactions}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onStartPractice={() => {
          setActiveTab('PLAY');
        }}
      />

      <DevnetDeployModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            CYBER NOVA • Powered by <span className="text-cyan-400 font-bold">Solana Devnet</span> for the MLH Solana Hackathon
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              How to Play Guide
            </button>
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              Deploy on Devnet
            </button>
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="text-purple-400 hover:underline"
            >
              Solana Inspector
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

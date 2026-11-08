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
import { StakingPerks } from '@/lib/jetpack/types';
import { getStoredTransactions } from '@/lib/solana/transactions';
import { SolanaTransactionRecord } from '@/lib/solana/types';
import { 
  Rocket, 
  ArrowDownUp, 
  Flame, 
  ShoppingBag, 
  Trophy, 
  Sparkles, 
  Bot,
  Zap,
  Coins,
  Cpu
} from 'lucide-react';

type ActiveTab = 'PLAY' | 'DEFI' | 'SHOP' | 'LEADERBOARD' | 'AI_LAB';
type DefiSubTab = 'SWAP' | 'STAKE' | 'WAGER';
type AiSubTab = 'COPILOT' | 'ARCHITECT';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('PLAY');
  const [defiSubTab, setDefiSubTab] = useState<DefiSubTab>('SWAP');
  const [aiSubTab, setAiSubTab] = useState<AiSubTab>('COPILOT');

  const [inGameCoins, setInGameCoins] = useState<number>(45);
  const [solBalance, setSolBalance] = useState<number>(0.5);
  const [activeSkin, setActiveSkin] = useState<'classic' | 'fire' | 'gold' | 'shadow'>('classic');
  const [stakingPerks, setStakingPerks] = useState<StakingPerks>({
    shardBonusPercent: 15,
    superJump: true,
    shardMagnet: false,
  });
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

      {/* Clean, Unified 5-Tab Segmented Control (Unslop & Calm) */}
      <div className="border-b border-zinc-800/80 bg-zinc-950 px-4 py-2.5 sticky top-[53px] z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar text-xs bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/80">
          <button
            onClick={() => setActiveTab('PLAY')}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'PLAY'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flight Arcade</span>
          </button>

          <button
            onClick={() => setActiveTab('DEFI')}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'DEFI'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quantum DeFi</span>
          </button>

          <button
            onClick={() => setActiveTab('SHOP')}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'SHOP'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span>Cyber Hangar</span>
          </button>

          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'LEADERBOARD'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Flight Records</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_LAB')}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'AI_LAB'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>A.R.I.A. AI Lab</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {/* 1. FLIGHT ARCADE TAB */}
        {activeTab === 'PLAY' && (
          <JetpackGame
            onCoinCollected={handleCoinCollected}
            stakingPerks={stakingPerks}
            activeSkin={activeSkin}
            onTxConfirmed={() => setTransactions(getStoredTransactions())}
          />
        )}

        {/* 2. QUANTUM DEFI COMMAND CENTER */}
        {activeTab === 'DEFI' && (
          <div className="w-full max-w-2xl mx-auto space-y-4">
            {/* Sub-navigation for DeFi */}
            <div className="flex items-center justify-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setDefiSubTab('SWAP')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                  defiSubTab === 'SWAP'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span>Quantum AMM Swap</span>
              </button>

              <button
                onClick={() => setDefiSubTab('STAKE')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                  defiSubTab === 'STAKE'
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Solar Staking (18.5% APY)</span>
              </button>

              <button
                onClick={() => setDefiSubTab('WAGER')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                  defiSubTab === 'WAGER'
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Distance Wager Escrow</span>
              </button>
            </div>

            {defiSubTab === 'SWAP' && (
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

            {defiSubTab === 'STAKE' && (
              <StakingVault
                solBalance={solBalance}
                onPerksChanged={setStakingPerks}
                onBalanceChanged={setSolBalance}
                onTxConfirmed={() => setTransactions(getStoredTransactions())}
              />
            )}

            {defiSubTab === 'WAGER' && (
              <WagerEscrow
                solBalance={solBalance}
                onWagerLocked={wager => setSolBalance(s => s - wager)}
                onTxConfirmed={() => setTransactions(getStoredTransactions())}
              />
            )}
          </div>
        )}

        {/* 3. CYBER HANGAR SHOP */}
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

        {/* 4. FLIGHT RECORDS & PROOFS */}
        {activeTab === 'LEADERBOARD' && <Leaderboard />}

        {/* 5. A.R.I.A. AI LAB */}
        {activeTab === 'AI_LAB' && (
          <div className="w-full max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setAiSubTab('COPILOT')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                  aiSubTab === 'COPILOT'
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>A.R.I.A. Conversational Terminal</span>
              </button>

              <button
                onClick={() => setAiSubTab('ARCHITECT')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                  aiSubTab === 'ARCHITECT'
                    ? 'bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Wave & Threat Architect</span>
              </button>
            </div>

            {aiSubTab === 'COPILOT' && (
              <OracleToad
                onAirdropRequested={() => setSolBalance(s => s + 0.5)}
                onSwapSuggested={() => {
                  setActiveTab('DEFI');
                  setDefiSubTab('SWAP');
                }}
                onStakeSuggested={() => {
                  setActiveTab('DEFI');
                  setDefiSubTab('STAKE');
                }}
              />
            )}

            {aiSubTab === 'ARCHITECT' && (
              <AiLevelGenerator onGenerateAndPlay={handleGenerateAndPlayLevel} />
            )}
          </div>
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

      {/* Muted, Clean Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 text-center text-xs text-zinc-500 font-mono mt-auto">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            CYBER NOVA: Sol-Jet Velocity • Powered by <span className="text-cyan-400 font-bold">Solana Devnet</span> for MLH Hackathon
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Flight Manual
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

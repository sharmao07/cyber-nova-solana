'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/navbar/Header';
import MarioGame from '@/components/mario/MarioGame';
import MushroomSwap from '@/components/defi/MushroomSwap';
import StakingVault from '@/components/defi/StakingVault';
import WagerEscrow from '@/components/defi/WagerEscrow';
import ItemShop from '@/components/gaming/ItemShop';
import Leaderboard from '@/components/gaming/Leaderboard';
import AiLevelGenerator from '@/components/ai/AiLevelGenerator';
import OracleToad from '@/components/ai/OracleToad';
import SolanaInspector from '@/components/beginner/SolanaInspector';
import { StakingPerks } from '@/lib/mario/types';
import { getStoredTransactions } from '@/lib/solana/transactions';
import { SolanaTransactionRecord } from '@/lib/solana/types';
import { 
  Gamepad2, 
  ArrowDownUp, 
  Sprout, 
  Flame, 
  ShoppingBag, 
  Trophy, 
  Sparkles, 
  Bot,
  Zap,
  Info
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
    coinBonusPercent: 15,
    superJump: true,
    coinMagnet: false,
  });
  const [customLevelPrompt, setCustomLevelPrompt] = useState<string>('');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<SolanaTransactionRecord[]>([]);

  // Load transactions and listen for updates
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
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-emerald-500 selection:text-black">
      {/* Global Header */}
      <Header
        onOpenInspector={() => setIsInspectorOpen(true)}
        txCount={transactions.length}
        inGameCoins={inGameCoins}
        onBalanceUpdate={setSolBalance}
      />

      {/* Navigation Tabs Bar */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2.5 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('PLAY')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'PLAY'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Mario (60fps)</span>
          </button>

          <button
            onClick={() => setActiveTab('SWAP')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'SWAP'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ArrowDownUp className="w-4 h-4" />
            <span>Mushroom Swap (AMM DEX)</span>
          </button>

          <button
            onClick={() => setActiveTab('STAKE')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'STAKE'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Yoshi&apos;s Staking (18.5% APY)</span>
          </button>

          <button
            onClick={() => setActiveTab('WAGER')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'WAGER'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Speedrun Wager Escrow</span>
          </button>

          <button
            onClick={() => setActiveTab('SHOP')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'SHOP'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Power-Up & Skin Shop</span>
          </button>

          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'LEADERBOARD'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>On-Chain Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_ARCHITECT')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'AI_ARCHITECT'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-purple-400 hover:text-purple-300 hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Level Architect</span>
          </button>

          <button
            onClick={() => setActiveTab('ORACLE_TOAD')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'ORACLE_TOAD'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Oracle Toad AI</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'PLAY' && (
          <MarioGame
            onCoinCollected={handleCoinCollected}
            stakingPerks={stakingPerks}
            activeSkin={activeSkin}
            customLevelPrompt={customLevelPrompt}
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

      {/* Slide-over Solana Inspector (ELI5 Mode) */}
      <SolanaInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        transactions={transactions}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            Built with ❤️ on <span className="text-emerald-400 font-bold">Solana Devnet</span> for the MLH Solana Hackathon
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Tracks: Gaming • AI • DeFi • Beginner • Top 3</span>
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              Open Solana Inspector
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

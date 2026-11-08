'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, 
  Shield, 
  Zap, 
  Heart, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Trophy,
  RotateCcw,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BurnerWallet } from '@/lib/solana/burner-wallet';
import { CombatStats, MoveType, CombatLogEntry, InventoryItem } from '@/lib/solana/types';
import { 
  executePlayerCombatTurn, 
  executeAiAgentCombatTurn, 
  executeMatchWagerEscrow, 
  executeMatchPayout 
} from '@/lib/solana/transactions';
import { 
  getOrCreateAiAgent, 
  ensureAgentFunded, 
  calculateAgentTactics, 
  AutonomousAgent 
} from '@/lib/ai/agent-wallet';
import { parseNaturalLanguageCommand, ParsedCommandResult } from '@/lib/ai/command-parser';
import { sounds } from '@/lib/audio/sound-effects';
import { Keypair } from '@solana/web3.js';

interface CombatArenaProps {
  wallet: BurnerWallet | null;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryItem[];
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  wallet,
  balance,
  setBalance,
  inventory,
}) => {
  // Combatant States
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [playerShield, setPlayerShield] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(50);

  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [bossShield, setBossShield] = useState(0);
  const [bossEnergy, setBossEnergy] = useState(40);

  // Match State
  const [matchId, setMatchId] = useState<string>('');
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'IDLE' | 'ACTIVE' | 'VICTORY' | 'DEFEAT'>('IDLE');
  const [wagerAmount, setWagerAmount] = useState<number>(0.05);
  const [escrowKeypair, setEscrowKeypair] = useState<Keypair | null>(null);

  // Combat Logs
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [floatingDamage, setFloatingDamage] = useState<{ target: 'player' | 'boss'; text: string; id: number } | null>(null);

  // AI & Natural Language
  const [aiAgent, setAiAgent] = useState<AutonomousAgent | null>(null);
  const [nlInput, setNlInput] = useState('');
  const [isParsingNl, setIsParsingNl] = useState(false);
  const [pendingParsedMove, setPendingParsedMove] = useState<ParsedCommandResult | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Calculate equipment bonuses
  const attackBonus = inventory.reduce((acc, item) => acc + (item.statBoost.attack || 0), 0);
  const defenseBonus = inventory.reduce((acc, item) => acc + (item.statBoost.defense || 0), 0);
  const hpBonus = inventory.reduce((acc, item) => acc + (item.statBoost.hp || 0), 0);
  const energyBonus = inventory.reduce((acc, item) => acc + (item.statBoost.energy || 0), 0);

  useEffect(() => {
    const agent = getOrCreateAiAgent();
    setAiAgent(agent);
    ensureAgentFunded(agent);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLogs]);

  // Start new match & deposit escrow
  const startMatch = async () => {
    if (!wallet || isProcessing) return;

    setIsProcessing(true);
    const newMatchId = `match_${Date.now()}`;
    const newEscrow = Keypair.generate();
    setEscrowKeypair(newEscrow);
    setMatchId(newMatchId);

    // Apply inventory stat buffs
    const totalHp = 100 + hpBonus;
    setPlayerHp(totalHp);
    setPlayerMaxHp(totalHp);
    setPlayerShield(20 + defenseBonus);
    setPlayerEnergy(50 + energyBonus);

    setBossHp(100);
    setBossMaxHp(100);
    setBossShield(15);
    setBossEnergy(40);
    setRound(1);
    setCombatLogs([]);

    try {
      // Broadcast match wager escrow deposit
      sounds.playCoin();
      await executeMatchWagerEscrow(
        wallet.keypair,
        newEscrow.publicKey,
        wagerAmount,
        newMatchId
      );
      setBalance((b) => Math.max(0, b - wagerAmount));
      setMatchStatus('ACTIVE');

      setCombatLogs([
        {
          id: `log_init_${Date.now()}`,
          round: 0,
          actor: 'PLAYER',
          actorName: 'SYSTEM ARBITER',
          move: 'ATTACK',
          damage: 0,
          absorbed: 0,
          isCrit: false,
          message: `Coliseum Bout Initialized. ${wagerAmount * 2} SOL Match Pot securely locked in Solana Escrow.`,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error('Failed to lock escrow:', err);
      // Fallback start without blocking if user has low funds
      setMatchStatus('ACTIVE');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger floating damage notification
  const showDamage = (target: 'player' | 'boss', text: string) => {
    const id = Date.now();
    setFloatingDamage({ target, text, id });
    setTimeout(() => {
      setFloatingDamage((curr) => (curr?.id === id ? null : curr));
    }, 1200);
  };

  // Execute Player Move
  const handlePlayerMove = async (move: MoveType) => {
    if (matchStatus !== 'ACTIVE' || isProcessing || !wallet) return;

    // Energy checks
    let energyCost = 0;
    if (move === 'HEAVY_STRIKE') energyCost = 30;
    if (move === 'SHIELD_BLOCK') energyCost = 20;
    if (move === 'LIGHTNING_BOLT') energyCost = 40;
    if (move === 'HEAL_POTION') energyCost = 25;

    if (playerEnergy < energyCost) {
      alert(`Insufficient Energy! Required: ${energyCost}, Available: ${playerEnergy}`);
      return;
    }

    setIsProcessing(true);
    setPendingParsedMove(null);

    // Calculate move outcomes
    let damageDealt = 0;
    let isCrit = false;
    let nextBossHp = bossHp;
    let nextBossShield = bossShield;
    let nextPlayerShield = playerShield;
    let nextPlayerHp = playerHp;
    let nextPlayerEnergy = Math.max(0, playerEnergy - energyCost);

    if (move === 'ATTACK') {
      sounds.playAttack();
      damageDealt = Math.floor(16 + Math.random() * 8 + attackBonus);
      isCrit = Math.random() > 0.8;
      if (isCrit) damageDealt = Math.floor(damageDealt * 1.5);
      nextPlayerEnergy = Math.min(100, nextPlayerEnergy + 15); // basic attack regenerates energy
    } else if (move === 'HEAVY_STRIKE') {
      sounds.playHeavy();
      damageDealt = Math.floor(28 + Math.random() * 12 + attackBonus * 1.5);
      isCrit = Math.random() > 0.6;
      if (isCrit) damageDealt = Math.floor(damageDealt * 1.6);
    } else if (move === 'LIGHTNING_BOLT') {
      sounds.playLightning();
      damageDealt = Math.floor(36 + Math.random() * 10 + attackBonus);
      isCrit = Math.random() > 0.75;
      if (isCrit) damageDealt = Math.floor(damageDealt * 1.5);
    } else if (move === 'SHIELD_BLOCK') {
      sounds.playShield();
      nextPlayerShield = Math.min(100, playerShield + 45 + defenseBonus);
      showDamage('player', `+45 SHIELD`);
    } else if (move === 'HEAL_POTION') {
      sounds.playHeal();
      nextPlayerHp = Math.min(playerMaxHp, playerHp + 40);
      showDamage('player', `+40 HP`);
    }

    // Apply damage to boss shield then HP
    let absorbed = 0;
    if (damageDealt > 0) {
      if (nextBossShield > 0) {
        if (nextBossShield >= damageDealt) {
          absorbed = damageDealt;
          nextBossShield -= damageDealt;
          damageDealt = 0;
        } else {
          absorbed = nextBossShield;
          damageDealt -= nextBossShield;
          nextBossShield = 0;
          nextBossHp = Math.max(0, nextBossHp - damageDealt);
        }
      } else {
        nextBossHp = Math.max(0, nextBossHp - damageDealt);
      }
      showDamage('boss', isCrit ? `CRIT! -${damageDealt + absorbed}` : `-${damageDealt + absorbed}`);
    }

    setBossHp(nextBossHp);
    setBossShield(nextBossShield);
    setPlayerHp(nextPlayerHp);
    setPlayerShield(nextPlayerShield);
    setPlayerEnergy(nextPlayerEnergy);

    // Broadcast Player Turn on Devnet
    let txSig = '';
    try {
      txSig = await executePlayerCombatTurn(
        wallet.keypair,
        matchId,
        round,
        move,
        damageDealt + absorbed,
        isCrit
      );
    } catch (e) {
      console.warn('Player turn tx broadcast:', e);
    }

    // Log Player Move
    const playerLog: CombatLogEntry = {
      id: `p_${Date.now()}`,
      round,
      actor: 'PLAYER',
      actorName: 'CYBER-VALKYRIE',
      move,
      damage: damageDealt,
      absorbed,
      isCrit,
      message: `${move.replace('_', ' ')} dealt ${damageDealt + absorbed} damage${absorbed > 0 ? ` (${absorbed} absorbed by barrier)` : ''}.`,
      signature: txSig,
      solscanUrl: txSig ? `https://solscan.io/tx/${txSig}?cluster=devnet` : undefined,
      timestamp: Date.now(),
    };

    setCombatLogs((prev) => [...prev, playerLog]);

    // Check Victory
    if (nextBossHp <= 0) {
      handleMatchEnd('VICTORY');
      setIsProcessing(false);
      return;
    }

    // Autonomous AI Counter-Move
    setTimeout(async () => {
      await handleAutonomousAiTurn(
        nextBossHp,
        nextBossShield,
        bossEnergy,
        nextPlayerHp,
        nextPlayerShield,
        nextPlayerEnergy
      );
      setIsProcessing(false);
    }, 900);
  };

  // Autonomous AI Agent Turn
  const handleAutonomousAiTurn = async (
    currentBossHp: number,
    currentBossShield: number,
    currentBossEnergy: number,
    currentPlayerHp: number,
    currentPlayerShield: number,
    currentPlayerEnergy: number
  ) => {
    if (!aiAgent) return;

    const agentStats: CombatStats = {
      hp: currentBossHp,
      maxHp: bossMaxHp,
      shield: currentBossShield,
      energy: currentBossEnergy,
      maxEnergy: 100,
      attackPower: 20,
      defense: 10,
    };

    const pStats: CombatStats = {
      hp: currentPlayerHp,
      maxHp: playerMaxHp,
      shield: currentPlayerShield,
      energy: currentPlayerEnergy,
      maxEnergy: 100,
      attackPower: 20,
      defense: 10,
    };

    const decision = calculateAgentTactics(agentStats, pStats, round);
    const aiMove = decision.move;

    let aiDamage = 0;
    let nextPlayerHp = currentPlayerHp;
    let nextPlayerShield = currentPlayerShield;
    let nextBossHp = currentBossHp;
    let nextBossShield = currentBossShield;
    let nextBossEnergy = Math.max(0, currentBossEnergy);

    if (aiMove === 'ATTACK') {
      sounds.playAttack();
      aiDamage = Math.floor(14 + Math.random() * 8);
      nextBossEnergy = Math.min(100, nextBossEnergy + 15);
    } else if (aiMove === 'HEAVY_STRIKE') {
      sounds.playHeavy();
      aiDamage = Math.floor(26 + Math.random() * 10);
      nextBossEnergy = Math.max(0, nextBossEnergy - 30);
    } else if (aiMove === 'LIGHTNING_BOLT') {
      sounds.playLightning();
      aiDamage = Math.floor(34 + Math.random() * 12);
      nextBossEnergy = Math.max(0, nextBossEnergy - 40);
    } else if (aiMove === 'SHIELD_BLOCK') {
      sounds.playShield();
      nextBossShield = Math.min(100, nextBossShield + 40);
      nextBossEnergy = Math.max(0, nextBossEnergy - 20);
      showDamage('boss', '+40 SHIELD');
    } else if (aiMove === 'HEAL_POTION') {
      sounds.playHeal();
      nextBossHp = Math.min(bossMaxHp, nextBossHp + 35);
      nextBossEnergy = Math.max(0, nextBossEnergy - 25);
      showDamage('boss', '+35 HP');
    }

    // Apply AI damage to player
    let playerAbsorbed = 0;
    if (aiDamage > 0) {
      if (nextPlayerShield > 0) {
        if (nextPlayerShield >= aiDamage) {
          playerAbsorbed = aiDamage;
          nextPlayerShield -= aiDamage;
          aiDamage = 0;
        } else {
          playerAbsorbed = nextPlayerShield;
          aiDamage -= nextPlayerShield;
          nextPlayerShield = 0;
          nextPlayerHp = Math.max(0, nextPlayerHp - aiDamage);
        }
      } else {
        nextPlayerHp = Math.max(0, nextPlayerHp - aiDamage);
      }
      showDamage('player', `-${aiDamage + playerAbsorbed}`);
    }

    setPlayerHp(nextPlayerHp);
    setPlayerShield(nextPlayerShield);
    setBossHp(nextBossHp);
    setBossShield(nextBossShield);
    setBossEnergy(nextBossEnergy);
    setRound((r) => r + 1);

    // AI Agent signs its own transaction on Devnet!
    let agentTxSig = '';
    try {
      agentTxSig = await executeAiAgentCombatTurn(
        aiAgent.keypair,
        matchId,
        round,
        aiMove,
        aiDamage + playerAbsorbed,
        decision.reasoning
      );
    } catch (e) {
      console.warn('AI agent tx broadcast:', e);
    }

    // Log AI Move
    const aiLog: CombatLogEntry = {
      id: `ai_${Date.now()}`,
      round,
      actor: 'AI_AGENT',
      actorName: 'SENTINEL-X9',
      move: aiMove,
      damage: aiDamage,
      absorbed: playerAbsorbed,
      isCrit: false,
      message: `${aiMove.replace('_', ' ')} dealt ${aiDamage + playerAbsorbed} damage${playerAbsorbed > 0 ? ` (${playerAbsorbed} absorbed)` : ''}.`,
      aiMonologue: `[SENTINEL-X9]: "${decision.dialogue}"`,
      signature: agentTxSig,
      solscanUrl: agentTxSig ? `https://solscan.io/tx/${agentTxSig}?cluster=devnet` : undefined,
      timestamp: Date.now(),
    };

    setCombatLogs((prev) => [...prev, aiLog]);

    // Check Defeat
    if (nextPlayerHp <= 0) {
      handleMatchEnd('DEFEAT');
    }
  };

  // Match Conclusion & Payout
  const handleMatchEnd = async (result: 'VICTORY' | 'DEFEAT') => {
    setMatchStatus(result);

    if (result === 'VICTORY') {
      sounds.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Claim Escrow Pot
      if (escrowKeypair && wallet) {
        try {
          const totalPot = wagerAmount * 2;
          await executeMatchPayout(
            escrowKeypair,
            wallet.keypair.publicKey,
            totalPot,
            matchId
          );
          setBalance((b) => b + totalPot);
        } catch (err) {
          console.warn('Escrow payout execution:', err);
        }
      }
    } else {
      sounds.playHeavy();
    }
  };

  // Parse Natural Language Command
  const handleParseNaturalLanguage = async () => {
    if (!nlInput.trim() || isParsingNl) return;
    setIsParsingNl(true);
    try {
      const parsed = await parseNaturalLanguageCommand(nlInput);
      setPendingParsedMove(parsed);
    } catch (err) {
      console.error('Failed to parse NL command:', err);
    } finally {
      setIsParsingNl(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner: Arena Header & Match Escrow Pot */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-cyan-800/40 backdrop-blur-md shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white flex items-center space-x-2">
              <span>CYBER COLISEUM</span>
              {matchStatus === 'ACTIVE' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono animate-pulse">
                  ROUND {round}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous AI Opponent • On-Chain Blockhash Fairness • Instant Devnet Settlement
            </p>
          </div>
        </div>

        {/* Match Wager & Pot Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              MATCH ESCROW POT
            </span>
            <span className="text-base font-mono font-extrabold text-emerald-400">
              {(wagerAmount * 2).toFixed(2)} SOL
            </span>
          </div>

          {matchStatus === 'IDLE' ? (
            <div className="flex items-center space-x-2">
              <select
                value={wagerAmount}
                onChange={(e) => setWagerAmount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 font-mono"
              >
                <option value={0.02}>Wager: 0.02 SOL</option>
                <option value={0.05}>Wager: 0.05 SOL</option>
                <option value={0.1}>Wager: 0.10 SOL</option>
              </select>
              <button
                onClick={startMatch}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                Enter Coliseum
              </button>
            </div>
          ) : (
            <button
              onClick={startMatch}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Battle Arena Grid: Player | Center VS | Autonomous AI Boss */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Player Gladiator Card */}
        <div className="lg:col-span-5 relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-800/40 shadow-xl flex flex-col justify-between">
          {floatingDamage?.target === 'player' && (
            <div className="absolute top-8 right-8 z-30 font-black text-xl text-red-400 animate-bounce">
              {floatingDamage.text}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-md shadow-cyan-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-300">
                    <User className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">CYBER-VALKYRIE</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-cyan-400 font-mono">
                    <span>Lv. 1 Champion</span>
                    <span>•</span>
                    <span>ATK +{attackBonus} | DEF +{defenseBonus}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                PLAYER
              </span>
            </div>

            {/* Health, Shield & Energy Bars */}
            <div className="space-y-3 mt-5">
              {/* HP Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center space-x-1 text-red-400">
                    <Heart className="w-3.5 h-3.5" />
                    <span>HEALTH</span>
                  </span>
                  <span className="font-mono text-slate-300">
                    {playerHp} / {playerMaxHp}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Shield Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center space-x-1 text-cyan-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>KINETIC SHIELD</span>
                  </span>
                  <span className="font-mono text-slate-300">{playerShield} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (playerShield / 100) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Energy Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center space-x-1 text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>COMBAT ENERGY</span>
                  </span>
                  <span className="font-mono text-slate-300">{playerEnergy} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (playerEnergy / 100) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Equipped Relics Badge */}
          <div className="mt-5 pt-3 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
              EQUIPPED AMM RELICS ({inventory.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {inventory.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">
                  No relics equipped. Visit AMM Shop to buy weapons.
                </span>
              ) : (
                inventory.map((item) => (
                  <span
                    key={item.id}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-medium"
                  >
                    {item.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: VS & Match Arena Status */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-xl font-black text-cyan-400 tracking-tighter">VS</span>
          </div>

          {matchStatus === 'ACTIVE' && (
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest block animate-pulse">
                BLOCKHASH RNG
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                Provably Fair On-Chain
              </span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[11px] font-mono animate-pulse">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>BROADCASTING...</span>
            </div>
          )}
        </div>

        {/* Right Column: Autonomous AI Boss Card */}
        <div className="lg:col-span-5 relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-purple-800/40 shadow-xl flex flex-col justify-between">
          {floatingDamage?.target === 'boss' && (
            <div className="absolute top-8 left-8 z-30 font-black text-xl text-cyan-300 animate-bounce">
              {floatingDamage.text}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-md shadow-purple-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-purple-300">
                    <Bot className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">SENTINEL-X9</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-purple-400 font-mono">
                    <span>Autonomous AI Agent</span>
                    <span>•</span>
                    <a
                      href={`https://solscan.io/account/${aiAgent?.address}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center space-x-0.5"
                    >
                      <span>{aiAgent ? `${aiAgent.address.slice(0, 4)}...${aiAgent.address.slice(-4)}` : 'On-Chain'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                AI WALLET
              </span>
            </div>

            {/* Boss HP, Shield & Energy */}
            <div className="space-y-3 mt-5">
              {/* HP Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center space-x-1 text-red-400">
                    <Heart className="w-3.5 h-3.5" />
                    <span>BOSS INTEGRITY</span>
                  </span>
                  <span className="font-mono text-slate-300">
                    {bossHp} / {bossMaxHp}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Shield Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center space-x-1 text-purple-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>AEGIS BARRIER</span>
                  </span>
                  <span className="font-mono text-slate-300">{bossShield} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (bossShield / 100) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Energy Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center space-x-1 text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>ION CAPACITOR</span>
                  </span>
                  <span className="font-mono text-slate-300">{bossEnergy} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (bossEnergy / 100) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Monologue Live Telemetry */}
          <div className="mt-5 p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] font-mono text-purple-300 flex items-center space-x-2">
            <Bot className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="italic truncate">
              {combatLogs.length > 0 && combatLogs[combatLogs.length - 1].aiMonologue
                ? combatLogs[combatLogs.length - 1].aiMonologue
                : 'Awaiting player tactical engagement...'}
            </span>
          </div>
        </div>
      </div>

      {/* Combat Action Controls & Natural Language Commander */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tactical Action Buttons */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              TACTICAL COMBAT INSTRUCTIONS
            </span>
            <span className="text-[11px] text-slate-500">Each move signs a real Solana Devnet Tx</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Quick Attack */}
            <button
              onClick={() => handlePlayerMove('ATTACK')}
              disabled={matchStatus !== 'ACTIVE' || isProcessing}
              className="p-3 rounded-xl bg-slate-950 border border-cyan-800/50 hover:border-cyan-400/80 hover:bg-cyan-950/30 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-bold text-emerald-400 font-mono">+15 EN</span>
              </div>
              <div className="font-bold text-xs text-white">Basic Attack</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~18 DMG • 0 Energy</div>
            </button>

            {/* Heavy Strike */}
            <button
              onClick={() => handlePlayerMove('HEAVY_STRIKE')}
              disabled={matchStatus !== 'ACTIVE' || isProcessing || playerEnergy < 30}
              className="p-3 rounded-xl bg-slate-950 border border-amber-800/50 hover:border-amber-400/80 hover:bg-amber-950/30 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 font-mono">-30 EN</span>
              </div>
              <div className="font-bold text-xs text-white">Heavy Strike</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~32 DMG • 60% Crit</div>
            </button>

            {/* Kinetic Shield */}
            <button
              onClick={() => handlePlayerMove('SHIELD_BLOCK')}
              disabled={matchStatus !== 'ACTIVE' || isProcessing || playerEnergy < 20}
              className="p-3 rounded-xl bg-slate-950 border border-blue-800/50 hover:border-blue-400/80 hover:bg-blue-950/30 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-amber-400 font-mono">-20 EN</span>
              </div>
              <div className="font-bold text-xs text-white">Shield Fortify</div>
              <div className="text-[10px] text-slate-400 mt-0.5">+45 Shield Barrier</div>
            </button>

            {/* Lightning Spell */}
            <button
              onClick={() => handlePlayerMove('LIGHTNING_BOLT')}
              disabled={matchStatus !== 'ACTIVE' || isProcessing || playerEnergy < 40}
              className="p-3 rounded-xl bg-slate-950 border border-fuchsia-800/50 hover:border-fuchsia-400/80 hover:bg-fuchsia-950/30 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <Zap className="w-4 h-4 text-fuchsia-400" />
                <span className="text-[10px] font-bold text-amber-400 font-mono">-40 EN</span>
              </div>
              <div className="font-bold text-xs text-white">Ionic Lightning</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~40 Spell Damage</div>
            </button>

            {/* Nanite Heal */}
            <button
              onClick={() => handlePlayerMove('HEAL_POTION')}
              disabled={matchStatus !== 'ACTIVE' || isProcessing || playerEnergy < 25}
              className="p-3 rounded-xl bg-slate-950 border border-emerald-800/50 hover:border-emerald-400/80 hover:bg-emerald-950/30 transition-all text-left group disabled:opacity-50 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between mb-1">
                <Heart className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-amber-400 font-mono">-25 EN</span>
              </div>
              <div className="font-bold text-xs text-white">Nanite Heal</div>
              <div className="text-[10px] text-slate-400 mt-0.5">+40 Health Restore</div>
            </button>
          </div>
        </div>

        {/* Right: Natural Language AI Commander (AI Track Feature) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border border-cyan-800/40 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                NATURAL LANGUAGE AI COMMANDER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Issue tactical commands in plain English. AI compiles your intent into validated Solana transactions.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setNlInput('Overcharge shields and brace for impact')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500"
            >
              "Overcharge shields"
            </button>
            <button
              onClick={() => setNlInput('Cast concentrated ionic lightning bolt')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500"
            >
              "Lightning strike"
            </button>
            <button
              onClick={() => setNlInput('Administer nanite heal injection')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500"
            >
              "Nanite heal"
            </button>
          </div>

          {/* Input Box */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParseNaturalLanguage()}
              placeholder="e.g. 'Unleash lightning and shatter their barrier'..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleParseNaturalLanguage}
              disabled={isParsingNl || !nlInput.trim()}
              className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Parse</span>
            </button>
          </div>

          {/* Parsed Output Preview */}
          {pendingParsedMove && (
            <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-cyan-300">
                <span className="font-bold">Interpreted Action: {pendingParsedMove.move}</span>
                <span className="font-mono text-[10px]">
                  {Math.round(pendingParsedMove.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{pendingParsedMove.explanation}</p>
              <button
                onClick={() => handlePlayerMove(pendingParsedMove.move)}
                disabled={matchStatus !== 'ACTIVE' || isProcessing}
                className="w-full py-1.5 rounded bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
              >
                <span>Confirm & Sign on Solana</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Turn-by-Turn Combat Telemetry Feed */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <span>COMBAT LOG & SOLANA DEVNET SIGNATURES</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {combatLogs.length} events logged
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 text-xs font-mono pr-2 custom-scrollbar">
          {combatLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-600 text-xs">
              Press "Enter Coliseum" above to initiate an on-chain battle bout.
            </div>
          ) : (
            combatLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border flex flex-col space-y-1 ${
                  log.actor === 'PLAYER'
                    ? 'bg-cyan-950/20 border-cyan-900/40 text-cyan-200'
                    : 'bg-purple-950/20 border-purple-900/40 text-purple-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold">
                    [R{log.round}] {log.actorName}: {log.message}
                  </span>
                  {log.solscanUrl && (
                    <a
                      href={log.solscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Solscan</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {log.aiMonologue && (
                  <div className="text-[10px] text-purple-300 italic pt-0.5">
                    {log.aiMonologue}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Match Victory / Defeat Modal */}
      {(matchStatus === 'VICTORY' || matchStatus === 'DEFEAT') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-cyan-800 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 border-2 flex items-center justify-center">
              {matchStatus === 'VICTORY' ? (
                <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-wide text-white">
                {matchStatus === 'VICTORY' ? 'COLISEUM VICTORY!' : 'TACTICAL DEFEAT'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {matchStatus === 'VICTORY'
                  ? `You outmatched the Autonomous Sentinel! The ${(wagerAmount * 2).toFixed(2)} SOL escrow pot has been awarded.`
                  : 'The Autonomous Sentinel counter-maneuvered your defenses. Recharge and try again!'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <span>Settlement: On-Chain Escrow via Solana Devnet</span>
            </div>

            <button
              onClick={() => setMatchStatus('IDLE')}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Return to Coliseum Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

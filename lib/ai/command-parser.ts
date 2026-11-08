import { MoveType } from '../solana/types';

export interface ParsedCommandResult {
  move: MoveType;
  confidence: number;
  explanation: string;
  energyCost: number;
  estimatedDamage: number;
  suggestedDialogue: string;
}

const COMMAND_RULES: Array<{
  move: MoveType;
  keywords: string[];
  explanation: string;
  energyCost: number;
  estimatedDamage: number;
  dialogue: string;
}> = [
  {
    move: 'LIGHTNING_BOLT',
    keywords: ['lightning', 'bolt', 'shock', 'zap', 'thunder', 'magic', 'arc', 'electrocute', 'volt', 'storm'],
    explanation: 'Unleashes a concentrated ionic storm causing heavy magical damage, bypassing partial armor.',
    energyCost: 40,
    estimatedDamage: 38,
    dialogue: 'Channeling high-frequency storm energy into an overcharged ionic discharge!',
  },
  {
    move: 'HEAVY_STRIKE',
    keywords: ['heavy', 'crush', 'smash', 'slam', 'sunder', 'devastate', 'execute', 'all out', 'hard', 'maximum', 'power'],
    explanation: 'Delivers a punishing kinetic blow with increased critical hit probability.',
    energyCost: 30,
    estimatedDamage: 30,
    dialogue: 'Compressing pneumatic servos for a devastating kinetic impact!',
  },
  {
    move: 'SHIELD_BLOCK',
    keywords: ['shield', 'block', 'defend', 'protect', 'barrier', 'guard', 'brace', 'aegis', 'absorb', 'defensive', 'cover'],
    explanation: 'Fortifies personal barrier, generating +45 Shield to absorb incoming enemy damage.',
    energyCost: 20,
    estimatedDamage: 0,
    dialogue: 'Deploying crystalline kinetic deflector. Absorbing 45 incoming damage.',
  },
  {
    move: 'HEAL_POTION',
    keywords: ['heal', 'potion', 'repair', 'drink', 'restore', 'cure', 'nanite', 'salve', 'recover', 'health', 'first aid'],
    explanation: 'Consumes a nanite injection to restore up to +40 Health points.',
    energyCost: 25,
    estimatedDamage: 0,
    dialogue: 'Synthesizing nanite bio-repair formula. Restoring structural integrity.',
  },
  {
    move: 'ATTACK',
    keywords: ['attack', 'strike', 'slash', 'hit', 'punch', 'shoot', 'stab', 'plasma', 'fire', 'laser', 'quick'],
    explanation: 'Quick and reliable basic strike that builds +15 Energy while dealing steady damage.',
    energyCost: 0,
    estimatedDamage: 18,
    dialogue: 'Target acquired. Firing rapid pulse salvo.',
  },
];

export async function parseNaturalLanguageCommand(prompt: string): Promise<ParsedCommandResult> {
  const clean = prompt.trim().toLowerCase();

  // Try API route if available
  try {
    const res = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: clean }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.move) {
        return data as ParsedCommandResult;
      }
    }
  } catch {
    // Graceful fallback to client parser
  }

  // Fallback Semantic Pattern Matcher
  let bestMatch = COMMAND_RULES[4]; // default ATTACK
  let maxScore = 0;

  for (const rule of COMMAND_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (clean.includes(kw)) {
        score += kw.length; // weight longer matches higher
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  const confidence = maxScore > 0 ? Math.min(0.7 + (maxScore * 0.05), 0.98) : 0.5;

  return {
    move: bestMatch.move,
    confidence,
    explanation: bestMatch.explanation,
    energyCost: bestMatch.energyCost,
    estimatedDamage: bestMatch.estimatedDamage,
    suggestedDialogue: bestMatch.dialogue,
  };
}

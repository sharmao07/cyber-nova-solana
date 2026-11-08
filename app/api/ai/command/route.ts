import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const clean = prompt.toLowerCase();

    // Semantic Intent Classifier
    if (clean.includes('lightning') || clean.includes('zap') || clean.includes('shock') || clean.includes('thunder') || clean.includes('magic')) {
      return NextResponse.json({
        move: 'LIGHTNING_BOLT',
        confidence: 0.96,
        explanation: 'AI detected spellcasting intent. Preparing high-yield ionic lightning discharge.',
        energyCost: 40,
        estimatedDamage: 38,
        suggestedDialogue: 'Executing ionic conduit! 38 magical damage ready to sign on-chain.',
      });
    }

    if (clean.includes('shield') || clean.includes('block') || clean.includes('defend') || clean.includes('protect') || clean.includes('barrier') || clean.includes('guard')) {
      return NextResponse.json({
        move: 'SHIELD_BLOCK',
        confidence: 0.95,
        explanation: 'AI detected defensive strategy. Preparing crystalline energy barrier (+45 Shield).',
        energyCost: 20,
        estimatedDamage: 0,
        suggestedDialogue: 'Defensive parameters established. Fortifying shield matrix.',
      });
    }

    if (clean.includes('heavy') || clean.includes('crush') || clean.includes('smash') || clean.includes('hard') || clean.includes('all out') || clean.includes('slam')) {
      return NextResponse.json({
        move: 'HEAVY_STRIKE',
        confidence: 0.94,
        explanation: 'AI detected high-impact kinetic intent. Preparing heavy sunder strike.',
        energyCost: 30,
        estimatedDamage: 30,
        suggestedDialogue: 'Overcharging pneumatic strike actuators. High crit probability.',
      });
    }

    if (clean.includes('heal') || clean.includes('potion') || clean.includes('repair') || clean.includes('recover') || clean.includes('health') || clean.includes('nanite')) {
      return NextResponse.json({
        move: 'HEAL_POTION',
        confidence: 0.95,
        explanation: 'AI detected recovery command. Administering nanite bio-repair (+40 HP).',
        energyCost: 25,
        estimatedDamage: 0,
        suggestedDialogue: 'Bio-restoration authorized. Injecting emergency medical nanites.',
      });
    }

    // Default basic attack
    return NextResponse.json({
      move: 'ATTACK',
      confidence: 0.88,
      explanation: 'AI detected standard attack command. Preparing rapid kinetic salvo (+15 Energy gain).',
      energyCost: 0,
      estimatedDamage: 18,
      suggestedDialogue: 'Rapid assault vector computed. Firing baseline plasma salvo.',
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Parser error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const clean = prompt.toLowerCase();

    // Natural Language intent classification for Oracle Toad
    if (clean.includes('airdrop') || clean.includes('faucet') || clean.includes('sol')) {
      return NextResponse.json({
        action: 'AIRDROP',
        confidence: 0.98,
        reply: '⚡ Airdrop request initiated! I’ve triggered your instant 0.5 Devnet SOL disbursement directly from our funded treasury keypair.',
      });
    }

    if (clean.includes('swap') || clean.includes('dex') || clean.includes('coin')) {
      return NextResponse.json({
        action: 'SWAP',
        confidence: 0.95,
        reply: '🍄 Opening Mushroom Swap AMM! You can exchange your in-game coins collected from breaking blocks directly into real Devnet SOL with 0.3% LP fees.',
      });
    }

    if (clean.includes('stake') || clean.includes('yield') || clean.includes('farm')) {
      return NextResponse.json({
        action: 'STAKE',
        confidence: 0.96,
        reply: '🌱 Staking in Yoshi’s Farm earns 18.5% streaming APY and immediately grants you the Coin Magnet aura and Super Jump perk in Mario!',
      });
    }

    if (clean.includes('bowser') || clean.includes('boss') || clean.includes('castle') || clean.includes('1-4')) {
      return NextResponse.json({
        action: 'BOSS_GUIDE',
        confidence: 0.94,
        reply: '🏰 Pro tip for World 1-4: Bowser periodically leaps into the air. Time your dash to run under his jump or sprint along the upper brick ledge to hit the Golden Solana Axe, collapsing the bridge into the lava pit!',
      });
    }

    return NextResponse.json({
      action: 'GENERAL',
      confidence: 0.88,
      reply: `✨ Oracle Toad analyzed your query: "${prompt}". Try asking about Airdrops, AMM Swaps, Staking perks, or Bowser boss tips!`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parser error' },
      { status: 500 }
    );
  }
}

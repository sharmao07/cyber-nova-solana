import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const clean = prompt.toLowerCase();

    // Natural Language intent classification for A.R.I.A. AI Copilot
    if (clean.includes('airdrop') || clean.includes('faucet') || clean.includes('sol')) {
      return NextResponse.json({
        action: 'AIRDROP',
        confidence: 0.98,
        reply: '⚡ Airdrop request initiated! I’ve triggered your instant 0.5 Devnet SOL disbursement directly from our funded treasury keypair to your burner wallet.',
      });
    }

    if (clean.includes('swap') || clean.includes('dex') || clean.includes('shard') || clean.includes('coin')) {
      return NextResponse.json({
        action: 'SWAP',
        confidence: 0.95,
        reply: '🔄 Routing to Quantum AMM Swap! You can exchange your in-game $SHARD energy tokens collected during flight directly into real Devnet SOL via our constant-product (x * y = k) liquidity pool.',
      });
    }

    if (clean.includes('stake') || clean.includes('yield') || clean.includes('reactor')) {
      return NextResponse.json({
        action: 'STAKE',
        confidence: 0.96,
        reply: '🌱 Solar Staking Reactor online: Earn 18.5% streaming APY while unlocking in-game Kinetic Energy Shields and Shard Magnetism for your jetpack runs!',
      });
    }

    if (clean.includes('missile') || clean.includes('seeker') || clean.includes('homing') || clean.includes('warning')) {
      return NextResponse.json({
        action: 'EVASION_GUIDE',
        confidence: 0.94,
        reply: '🚀 Tactical Advisory for Homing Missiles: When the red [ ! ] siren tracking alarm sounds, Nova has 36-75 frames to shift altitude. Wait for the alarm to lock, then tap thrust or cut engines to glide out of its flight corridor!',
      });
    }

    if (clean.includes('zapper') || clean.includes('laser') || clean.includes('hazard')) {
      return NextResponse.json({
        action: 'HAZARD_GUIDE',
        confidence: 0.93,
        reply: '⚡ Quantum Zapper Clearance: Rotating and diagonal zappers feature a dynamic clearance window. Gauge the gap above versus below—if gap > 90px, feather your thrusters to glide through the upper sector safely.',
      });
    }

    if (clean.includes('vehicle') || clean.includes('drifter') || clean.includes('mech') || clean.includes('cycle')) {
      return NextResponse.json({
        action: 'VEHICLE_GUIDE',
        confidence: 0.95,
        reply: '🏎️ Experimental Cyber Vehicles: 1) Gravity Drifter inverts gravity on tap, 2) Mech Breaker stomps with heavy hydraulic jumps, 3) Warp Cycle blazes at 1.4x cruise speed. All vehicles feature Eject-Armor that absorbs 1 fatal hit!',
      });
    }

    return NextResponse.json({
      action: 'GENERAL',
      confidence: 0.88,
      reply: `✨ A.R.I.A. analyzed your query: "${prompt}". Try asking about Airdrops, AMM Swaps, Staking perks, Homing Missile evasion, or Cyber Vehicles!`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parser error' },
      { status: 500 }
    );
  }
}

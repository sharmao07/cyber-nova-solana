#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "⚡ CYBER NOVA: Sol-Runner Odyssey — Solana Devnet Deployer"
echo "=========================================================="

# 1. Check prerequisites
echo ""
echo "▶ 1. Checking Environment & CLI Tools..."

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required. Please install Node.js 18+."
  exit 1
fi
echo "✓ Node.js version: $(node --version)"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "⚠️ pnpm not found, falling back to npm"
  PKG_MGR="npm"
else
  PKG_MGR="pnpm"
  echo "✓ Package Manager: pnpm $(pnpm --version)"
fi

# 2. Check Solana CLI
if command -v solana >/dev/null 2>&1; then
  echo "✓ Solana CLI detected: $(solana --version)"
  echo "▶ Setting RPC URL to Solana Devnet..."
  solana config set --url https://api.devnet.solana.com
  CURRENT_PUBKEY=$(solana address 2>/dev/null || true)
  if [ -n "$CURRENT_PUBKEY" ]; then
    echo "✓ Active CLI Address: $CURRENT_PUBKEY"
    echo "▶ Querying Devnet balance..."
    solana balance || true
  fi
else
  echo "ℹ️ Solana CLI not found in PATH. Using JavaScript Web3 SDK with built-in funded treasury."
fi

# 3. Test Solana Devnet connectivity using TypeScript script
echo ""
echo "▶ 2. Verifying Devnet RPC & Treasury Account..."
$PKG_MGR run test:solana

# 4. Build Production Bundle
echo ""
echo "▶ 3. Compiling Production Next.js Bundle..."
$PKG_MGR run build

echo ""
echo "=========================================================="
echo "🎉 CYBER NOVA IS PRODUCTION & DEVNET READY!"
echo "=========================================================="
echo ""
echo "To run locally in production mode:"
echo "  $PKG_MGR run start"
echo ""
echo "To run locally in hot-reload dev mode:"
echo "  $PKG_MGR run dev"
echo ""
echo "To deploy to Vercel:"
echo "  1. Push code to GitHub: git push origin main"
echo "  2. Import repository in https://vercel.com"
echo "  3. Configure environment variable: NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com"
echo "  4. Click Deploy!"
echo "=========================================================="

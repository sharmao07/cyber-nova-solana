import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CYBER NOVA | On-Chain Cyber-Platformer, Autonomous AI & DeFi on Solana",
  description: "A full working 60fps retro cyber-runner platformer powered natively by Solana Devnet. Features autonomous AI speedrun copilot (A.R.I.A.), in-game Constant-Product AMM DEX ($SHARD <-> $SOL), Solar Staking Reactor, speedrun wager escrows, and 1-click burner wallet onboarding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
    </html>
  );
}

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
  title: "Super Solario | On-Chain Mario Platformer, Autonomous AI & DeFi on Solana",
  description: "A full working 60fps retro Mario-style 2D platformer powered natively by Solana Devnet. Features autonomous AI speedrun copilot, in-game Constant-Product AMM DEX ($COIN <-> $SOL), Yoshi staking farm, speedrun wager escrows, and 1-click burner wallet onboarding.",
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

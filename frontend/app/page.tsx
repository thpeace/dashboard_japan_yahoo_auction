"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Gavel,
  Crosshair,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
  Globe2,
  RefreshCw
} from "lucide-react";
import ThreeHeroVisualizer from "@/components/ThreeHeroVisualizer";
import AuctionCard from "@/components/AuctionCard";
import BidModal from "@/components/BidModal";
import { fetchAuctions, fetchDashboardStats, fetchClientWallet } from "@/lib/api";
import { AuctionItem, DashboardStats } from "@/lib/types";
import { formatYen } from "@/lib/utils";

export default function HomePage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isEnglish, setIsEnglish] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [clientBalanceYen, setClientBalanceYen] = useState<number>(518000);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [auctionData, statData, clientData] = await Promise.all([
        fetchAuctions({ size: 6 }),
        fetchDashboardStats(),
        fetchClientWallet(1),
      ]);
      setAuctions(auctionData.content);
      setStats(statData);
      setClientBalanceYen(clientData.walletBalanceYen);
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, []);

  const categories = [
    "ALL",
    "Watches & Jewelry",
    "Figures & Anime",
    "Retro Gaming",
    "Vintage Cameras",
    "JDM Automotive",
  ];

  const filteredAuctions = selectedCategory === "ALL"
    ? auctions
    : auctions.filter((a) => a.category === selectedCategory);

  const handleOpenBid = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    setIsBidModalOpen(true);
  };

  return (
    <div className="flex flex-col space-y-16 pb-20">

      {/* 1. HERO SECTION WITH THREE.JS CANVAS */}
      <section className="relative w-full pt-12 pb-8 sm:pt-16 sm:pb-12 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-yahoo-dark to-slate-950">

        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-red-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Headline & Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Tokyo Residential Proxy Gateway 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Japan&apos;s Yahoo Auctions,{" "}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  Automated.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Never lose a rare timepiece, JDM part, or vintage collectible. Our proxy engine bids on your behalf using verified corporate Japanese accounts and stealth headless browsers—eliminating IP bans and timezone barriers.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  href="/auctions"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 group transition-all"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Browse Live Auctions</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 flex items-center justify-center space-x-2 transition-all"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Operator Control Room</span>
                </Link>
              </div>

              {/* Trust & Guarantee bullets */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-left">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Proxy Shield</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Zero client IP ban risk</span>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    <span>Sniper Bot</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Precision T-8s execution</span>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>Auto Escrow</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Instant refund if outbid</span>
                </div>
              </div>
            </div>

            {/* Right Three.js 3D Visualizer */}
            <div className="lg:col-span-5 relative">
              <ThreeHeroVisualizer />
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE KPI STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">Tracked Auctions</span>
              <span className="text-xl font-extrabold text-white font-mono">
                {stats ? stats.totalAuctionsTracked : 6}
              </span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">Win Rate</span>
              <span className="text-xl font-extrabold text-white font-mono">
                {stats ? `${stats.winRatePercentage}%` : "100.0%"}
              </span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">Active Bids in Flight</span>
              <span className="text-xl font-extrabold text-white font-mono">
                {stats ? stats.activeBidsCount : 2}
              </span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">Resident Proxy Pool</span>
              <span className="text-xl font-extrabold text-white font-mono">
                {stats ? `${stats.healthyProxiesCount}/${stats.totalProxiesCount} Healthy` : "4/4 Healthy"}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED LIVE AUCTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header with Bilingual Toggle & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Yahoo Japan Auctions</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Monitored directly from Yahoo! Japan servers via residential Japanese proxies.
            </p>
          </div>

          {/* Bilingual Switch & View All */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <button
                onClick={() => setIsEnglish(false)}
                className={`px-2.5 py-1 rounded transition-colors ${!isEnglish ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
              >
                JP 日本語
              </button>
              <button
                onClick={() => setIsEnglish(true)}
                className={`px-2.5 py-1 rounded transition-colors ${isEnglish ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
              >
                EN English
              </button>
            </div>

            <Link
              href="/auctions"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                  ? "bg-slate-200 text-slate-900 font-bold shadow-md shadow-white/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              showEnglishTitle={isEnglish}
              onOpenBidModal={handleOpenBid}
            />
          ))}
        </div>
      </section>

      {/* 4. ARCHITECTURAL COMPARISON (DIRECT FROM YAHOO_AUCTION_PROXY_ARCHITECTURE.MD) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">

          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Architecture Analysis
            </span>
            <h3 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Account Strategy: Why the Proxy Model Wins
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Yahoo! Japan monitors automated behavior ruthlessly. Here is why our platform architecture utilizes company-owned proxy accounts with Japanese residential IP rotation.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">Strategy</th>
                  <th className="pb-3 font-semibold">Risk Level</th>
                  <th className="pb-3 font-semibold">Feasibility</th>
                  <th className="pb-3 font-semibold">Operational Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr className="bg-emerald-500/5">
                  <td className="py-3.5 pr-4 font-bold text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Proxy Model (Our System)</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LOW RISK
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-slate-200">High</td>
                  <td className="py-3.5 text-slate-300">
                    Platform manages 1-3 highly vetted company Yahoo accounts. Risk is centralized and mitigated by residential Japanese proxies and session persistence.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-slate-400 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Client Account Model</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      EXTREME RISK
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400">Very Low</td>
                  <td className="py-3.5 text-slate-400">
                    Allowing clients to link personal accounts triggers immediate security lockouts due to IP mismatches (server IP vs client residential IP).
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-slate-400 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Secondary Accounts</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      HIGH RISK
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400">Medium</td>
                  <td className="py-3.5 text-slate-400">
                    Yahoo! Japan requires Japanese mobile SMS verification for every account, making maintaining disposable accounts difficult.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        auction={selectedAuction}
        clientBalanceYen={clientBalanceYen}
        onBidSuccess={loadData}
      />

    </div>
  );
}


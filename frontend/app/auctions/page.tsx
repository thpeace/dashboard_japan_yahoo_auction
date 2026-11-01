"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Gavel,
  ShieldCheck
} from "lucide-react";
import AuctionCard from "@/components/AuctionCard";
import BidModal from "@/components/BidModal";
import { fetchAuctions, fetchClientWallet } from "@/lib/api";
import { AuctionItem } from "@/lib/types";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isEnglish, setIsEnglish] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [clientBalanceYen, setClientBalanceYen] = useState<number>(518000);

  const loadAuctions = async () => {
    setIsLoading(true);
    try {
      const [data, wallet] = await Promise.all([
        fetchAuctions({
          keyword: searchQuery || undefined,
          category: selectedCategory === "ALL" ? undefined : selectedCategory,
          status: selectedStatus === "ALL" ? undefined : selectedStatus,
          size: 24,
        }),
        fetchClientWallet(1),
      ]);
      setAuctions(data.content);
      setClientBalanceYen(wallet.walletBalanceYen);
    } catch (err) {
      console.error("Failed to load auctions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadAuctions();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const categories = [
    "ALL",
    "Watches & Jewelry",
    "Figures & Anime",
    "Retro Gaming",
    "Vintage Cameras",
    "JDM Automotive",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Page Title & Bilingual Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Layers className="w-7 h-7 text-blue-500" />
            <span>Yahoo! Japan Auction Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time scraped items with automated proxy bidding and sniper execution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
            <button
              onClick={() => setIsEnglish(false)}
              className={`px-3 py-1 rounded transition-colors ${!isEnglish ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
            >
              JP 日本語
            </button>
            <button
              onClick={() => setIsEnglish(true)}
              className={`px-3 py-1 rounded transition-colors ${isEnglish ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
            >
              EN English
            </button>
          </div>

          <button
            onClick={loadAuctions}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh auctions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keyword (e.g. Grand Seiko, R34, 64DD) or Yahoo Auction ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-300 outline-none focus:border-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Status: Active</option>
            <option value="WON_BY_US">Status: Won By Us</option>
            <option value="ENDED">Status: Ended</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Fetching latest Yahoo Japan auctions...</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-slate-800 p-8">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No auctions found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              showEnglishTitle={isEnglish}
              onOpenBidModal={(item) => {
                setSelectedAuction(item);
                setIsBidModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        auction={selectedAuction}
        clientBalanceYen={clientBalanceYen}
        onBidSuccess={loadAuctions}
      />

    </div>
  );
}


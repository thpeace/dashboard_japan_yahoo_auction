"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ExternalLink,
  Gavel,
  User,
  ShieldCheck,
  Sliders,
  Clock,
  ArrowRight
} from "lucide-react";
import { fetchAuctions } from "@/lib/api";
import { AuctionItem } from "@/lib/types";
import { formatYen } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AuctionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      fetchAuctions({ size: 5 })
        .then((res) => setResults(res.content))
        .catch(() => setResults([]));
    } else {
      fetchAuctions({ keyword: query.trim(), size: 8 })
        .then((res) => setResults(res.content))
        .catch(() => setResults([]));
    }
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: number) => {
    onClose();
    router.push(`/auctions/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">

        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-blue-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Yahoo Auction ID (e.g. m1092837190), keywords, or accounts..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 outline-none font-sans"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Quick Jump Shortcuts */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center space-x-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Quick Links:</span>
          <button
            onClick={() => { onClose(); router.push("/auctions"); }}
            className="hover:text-blue-400 flex items-center space-x-1"
          >
            <span>All Auctions</span>
          </button>
          <span>•</span>
          <button
            onClick={() => { onClose(); router.push("/dashboard"); }}
            className="hover:text-blue-400 flex items-center space-x-1"
          >
            <span>Operator Control</span>
          </button>
          <span>•</span>
          <button
            onClick={() => { onClose(); router.push("/wallet"); }}
            className="hover:text-blue-400 flex items-center space-x-1"
          >
            <span>Escrow Wallet</span>
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No matching auctions or records found for &quot;{query}&quot;.
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${idx === selectedIndex
                    ? "bg-blue-600/20 border border-blue-500/30"
                    : "hover:bg-slate-800/60 border border-transparent"
                  }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.titleEn || item.titleJp}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/20">
                        {item.yahooAuctionId}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 line-clamp-1 mt-0.5">
                      {item.titleEn || item.titleJp}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4 flex items-center space-x-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {formatYen(item.currentPriceYen)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {item.bidCount} bids
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}


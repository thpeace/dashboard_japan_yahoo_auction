"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Flame,
  ExternalLink,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  Gavel
} from "lucide-react";
import { AuctionItem } from "@/lib/types";
import { formatYen, yenToUsd, getTimeRemaining, getStatusBadgeStyle } from "@/lib/utils";

interface AuctionCardProps {
  auction: AuctionItem;
  onOpenBidModal: (auction: AuctionItem) => void;
  showEnglishTitle?: boolean;
}

export default function AuctionCard({
  auction,
  onOpenBidModal,
  showEnglishTitle = true,
}: AuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(auction.endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const badge = getStatusBadgeStyle(
    auction.isSnipeArmed
      ? "SCHEDULED"
      : auction.status === "ACTIVE"
        ? (auction.winningBidder?.includes("yj_corp") ? "WINNING" : "ACTIVE")
        : auction.status
  );

  const isEndingSoon = !timeRemaining.isEnded && timeRemaining.totalSeconds < 1800; // Under 30 mins

  return (
    <div className="glass-panel glass-panel-hover rounded-xl overflow-hidden flex flex-col group border border-slate-800 bg-slate-900/60">

      {/* Image with overlay badges */}
      <div className="relative w-full h-48 sm:h-52 bg-slate-950 overflow-hidden">
        <img
          src={auction.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"}
          alt={auction.titleEn || auction.titleJp}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
            {auction.category}
          </span>

          {/* Yahoo ID */}
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-red-950/80 backdrop-blur-md text-red-300 border border-red-500/30">
            {auction.yahooAuctionId}
          </span>
        </div>

        {/* Bottom Floating Countdown */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div
            className={`px-2.5 py-1 rounded-md backdrop-blur-md text-xs font-mono font-semibold flex items-center space-x-1.5 border shadow-lg ${timeRemaining.isEnded
                ? "bg-slate-900/80 text-slate-400 border-slate-700"
                : isEndingSoon
                  ? "bg-red-950/90 text-red-300 border-red-500/50 animate-pulse"
                  : "bg-slate-900/80 text-slate-200 border-slate-700"
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemaining.formatted}</span>
          </div>

          {auction.bidCount > 0 && (
            <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-300 text-[11px] font-mono flex items-center space-x-1 border border-amber-500/20">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{auction.bidCount} bids</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">

        {/* Title */}
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>

          <Link href={`/auctions/${auction.id}`} className="group/link block">
            <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover/link:text-blue-400 transition-colors">
              {showEnglishTitle && auction.titleEn ? auction.titleEn : auction.titleJp}
            </h3>
          </Link>

          {showEnglishTitle && auction.titleEn && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-mono">
              JP: {auction.titleJp}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-800/80 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Current Bid</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-bold text-white font-mono">{formatYen(auction.currentPriceYen)}</span>
              <span className="text-xs text-slate-400 font-mono">≈ {yenToUsd(auction.currentPriceYen)}</span>
            </div>
          </div>

          <button
            onClick={() => onOpenBidModal(auction)}
            disabled={timeRemaining.isEnded || auction.status === "ENDED" || auction.status === "WON_BY_US"}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center space-x-1.5"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Place Bid</span>
          </button>
        </div>

      </div>
    </div>
  );
}


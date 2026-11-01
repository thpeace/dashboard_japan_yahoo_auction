"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Flame,
  ExternalLink,
  Gavel,
  Crosshair,
  ShieldCheck,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  Wallet
} from "lucide-react";
import { fetchAuctionById, fetchClientWallet, placeBidOrder } from "@/lib/api";
import { AuctionItem, BidStrategy } from "@/lib/types";
import { formatYen, yenToUsd, getTimeRemaining, getStatusBadgeStyle } from "@/lib/utils";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [clientBalanceYen, setClientBalanceYen] = useState<number>(518000);
  const [maxBid, setMaxBid] = useState<number>(0);
  const [strategy, setStrategy] = useState<BidStrategy>("YAHOO_AUTO_BID");
  const [snipeSeconds, setSnipeSeconds] = useState<number>(8);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showOriginalJp, setShowOriginalJp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ formatted: "", isEnded: false });

  const loadAuction = async () => {
    if (!id) return;
    try {
      const [item, wallet] = await Promise.all([
        fetchAuctionById(id),
        fetchClientWallet(1),
      ]);
      setAuction(item);
      setClientBalanceYen(wallet.walletBalanceYen);
      setMaxBid(item.currentPriceYen + 2000);
      setTimeRemaining(getTimeRemaining(item.endTime));
    } catch (err) {
      console.error("Failed to load auction:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuction();
    const interval = setInterval(() => {
      if (auction) {
        setTimeRemaining(getTimeRemaining(auction.endTime));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading || !auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-mono">Loading auction details...</p>
      </div>
    );
  }

  const badge = getStatusBadgeStyle(
    auction.isSnipeArmed
      ? "SCHEDULED"
      : auction.status === "ACTIVE"
        ? (auction.winningBidder?.includes("yj_corp") ? "WINNING" : "ACTIVE")
        : auction.status
  );

  const hasEnoughFunds = clientBalanceYen >= maxBid;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (maxBid <= auction.currentPriceYen) {
      setErrorMsg(`Maximum bid must exceed current price of ${formatYen(auction.currentPriceYen)}`);
      return;
    }

    if (!hasEnoughFunds) {
      setErrorMsg(`Insufficient wallet funds. Required: ${formatYen(maxBid)}, Available: ${formatYen(clientBalanceYen)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBidOrder({
        clientId: 1,
        auctionId: auction.id,
        maxBidYen: maxBid,
        strategy: strategy,
        snipeSecondsBeforeEnd: strategy === "SNIPER_BOT" ? snipeSeconds : 8,
      });

      setSuccessMsg(
        strategy === "SNIPER_BOT"
          ? `Sniper Bot armed! Scheduled dispatch at T-${snipeSeconds}s before auction close.`
          : `Yahoo Auto-Bid committed! Ceiling set to ${formatYen(maxBid)}.`
      );
      loadAuction();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit bid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Back link */}
      <Link
        href="/auctions"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Image & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Main Photo Card */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-3">
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-900">
              <img
                src={auction.imageUrl}
                alt={auction.titleEn || auction.titleJp}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border} backdrop-blur-md`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Description & Item Specs */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Item Description</h3>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => setShowOriginalJp(false)}
                  className={`px-2.5 py-1 rounded transition-colors ${!showOriginalJp ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                >
                  AI Translation (EN)
                </button>
                <button
                  onClick={() => setShowOriginalJp(true)}
                  className={`px-2.5 py-1 rounded transition-colors ${showOriginalJp ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                >
                  Original (JP)
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {showOriginalJp
                ? auction.descriptionJp
                : auction.descriptionEn || auction.descriptionJp}
            </p>

            {/* Seller & Verification Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Seller ID:</span>
                <span className="font-semibold text-white flex items-center space-x-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>{auction.sellerId || "verified_jp_seller"}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-mono">Category:</span>
                <span className="font-semibold text-white mt-0.5 block">{auction.category}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-mono">Start Time:</span>
                <span className="text-slate-300 font-mono mt-0.5 block">
                  {new Date(auction.startTime).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-mono">End Time:</span>
                <span className="text-slate-300 font-mono mt-0.5 block">
                  {new Date(auction.endTime).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Bidding & Escrow Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl space-y-5">

            {/* Header / Titles */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
                <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-500/20">
                  {auction.yahooAuctionId}
                </span>
                <span>•</span>
                <span>Yahoo! JAPAN Auctions</span>
              </div>
              <h1 className="text-lg font-bold text-white leading-snug">
                {auction.titleEn || auction.titleJp}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                JP: {auction.titleJp}
              </p>
            </div>

            {/* Price & Countdown Hero Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Current Bid</span>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatYen(auction.currentPriceYen)}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">≈ {yenToUsd(auction.currentPriceYen)}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Time Remaining</span>
                  <div className="flex items-center space-x-1.5 text-base font-bold text-amber-400 font-mono justify-end">
                    <Clock className="w-4 h-4" />
                    <span>{timeRemaining.formatted}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{auction.bidCount} total bids</span>
                </div>
              </div>

              {auction.buyoutPriceYen && (
                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Buyout Price (Instant Win):</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatYen(auction.buyoutPriceYen)}</span>
                </div>
              )}
            </div>

            {/* Error / Success Banners */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Bidding Form */}
            <form onSubmit={handlePlaceBid} className="space-y-4">

              {/* Strategy Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Bidding Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStrategy("YAHOO_AUTO_BID")}
                    className={`p-3 rounded-xl text-left border transition-all ${strategy === "YAHOO_AUTO_BID"
                        ? "bg-blue-600/15 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Gavel className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-bold">Auto-Bid</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Yahoo native ceiling. Safe against bot bans.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStrategy("SNIPER_BOT")}
                    className={`p-3 rounded-xl text-left border transition-all ${strategy === "SNIPER_BOT"
                        ? "bg-cyan-600/15 border-cyan-500 text-white shadow-sm shadow-cyan-500/20"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold">Sniper Bot</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Dispatches T-8s before end to avoid price wars.
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Ceiling Bid Amount (¥ JPY)
                </label>
                <input
                  type="number"
                  min={auction.currentPriceYen + 1000}
                  step={500}
                  value={maxBid}
                  onChange={(e) => setMaxBid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white font-mono text-base font-bold outline-none"
                  required
                />
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                  ≈ {yenToUsd(maxBid)}
                </span>
              </div>

              {/* Escrow Balance Status */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" />
                    <span>Your Escrow Balance:</span>
                  </span>
                  <span className={`font-mono font-bold ${hasEnoughFunds ? "text-emerald-400" : "text-red-400"}`}>
                    {formatYen(clientBalanceYen)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !hasEnoughFunds || timeRemaining.isEnded}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center space-x-2"
              >
                <Gavel className="w-4 h-4" />
                <span>{isSubmitting ? "Locking & Dispatching..." : "Submit Proxy Bid"}</span>
              </button>

            </form>

            {/* Yahoo Japan Original Link */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <a
                href={`https://page.auctions.yahoo.co.jp/jp/auction/${auction.yahooAuctionId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono"
              >
                <span>View on Yahoo! Japan (Official)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


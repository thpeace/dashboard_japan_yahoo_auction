"use client";

import React, { useState } from "react";
import {
  X,
  Gavel,
  Crosshair,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Clock,
  Sparkles
} from "lucide-react";
import { AuctionItem, BidStrategy } from "@/lib/types";
import { formatYen, yenToUsd } from "@/lib/utils";
import { placeBidOrder } from "@/lib/api";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: AuctionItem | null;
  clientBalanceYen: number;
  onBidSuccess: () => void;
}

export default function BidModal({
  isOpen,
  onClose,
  auction,
  clientBalanceYen,
  onBidSuccess,
}: BidModalProps) {
  if (!isOpen || !auction) return null;

  const minBid = auction.currentPriceYen + 1000;
  const [maxBid, setMaxBid] = useState<number>(minBid);
  const [strategy, setStrategy] = useState<BidStrategy>("YAHOO_AUTO_BID");
  const [snipeSeconds, setSnipeSeconds] = useState<number>(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hasEnoughFunds = clientBalanceYen >= maxBid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (maxBid <= auction.currentPriceYen) {
      setErrorMsg(`Maximum bid must exceed current price of ${formatYen(auction.currentPriceYen)}`);
      return;
    }

    if (!hasEnoughFunds) {
      setErrorMsg(`Insufficient wallet funds. You need ${formatYen(maxBid)}, but available balance is ${formatYen(clientBalanceYen)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBidOrder({
        clientId: 1, // Default active demo user
        auctionId: auction.id,
        maxBidYen: maxBid,
        strategy: strategy,
        snipeSecondsBeforeEnd: strategy === "SNIPER_BOT" ? snipeSeconds : 8,
      });

      setSuccessMsg(
        strategy === "SNIPER_BOT"
          ? `Sniper Bot successfully armed! Dispatching bid at T-${snipeSeconds}s via stealth proxy.`
          : `Yahoo Auto-Bid registered! System ceiling placed at ${formatYen(maxBid)}.`
      );

      setTimeout(() => {
        onBidSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit bid order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Proxy Bidding Engine</h2>
            <p className="text-xs text-slate-400 font-mono">Yahoo Japan Auction #{auction.yahooAuctionId}</p>
          </div>
        </div>

        {/* Item Summary Banner */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5 flex items-center space-x-3">
          <img
            src={auction.imageUrl}
            alt={auction.titleEn || auction.titleJp}
            className="w-14 h-14 rounded-lg object-cover border border-slate-800"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white line-clamp-1">
              {auction.titleEn || auction.titleJp}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-slate-400">Current:</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {formatYen(auction.currentPriceYen)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({auction.bidCount} bids)</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Strategy Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Bidding Strategy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStrategy("YAHOO_AUTO_BID")}
                className={`p-3 rounded-xl text-left border transition-all ${strategy === "YAHOO_AUTO_BID"
                    ? "bg-blue-600/15 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Gavel className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">Yahoo Auto-Bid</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Official native bidding. Safe against bot bans. Automatically outbids competitors incrementally.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStrategy("SNIPER_BOT")}
                className={`p-3 rounded-xl text-left border transition-all ${strategy === "SNIPER_BOT"
                    ? "bg-cyan-600/15 border-cyan-500 text-white shadow-sm shadow-cyan-500/20"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold">Sniper Bot (T-8s)</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Dispatches stealth headless bid seconds before close to avoid price wars.
                </p>
              </button>
            </div>
          </div>

          {/* Sniper Seconds Input (conditional) */}
          {strategy === "SNIPER_BOT" && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-200">Dispatch Trigger:</span>
              </div>
              <div className="flex items-center space-x-2">
                {[6, 8, 12].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSnipeSeconds(s)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${snipeSeconds === s
                        ? "bg-cyan-500 text-black"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                  >
                    T-{s}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Max Bid Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Your Maximum Bid Ceiling (¥ JPY)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Min: {formatYen(minBid)}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={minBid}
                step={500}
                value={maxBid}
                onChange={(e) => setMaxBid(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-white font-mono text-base font-bold outline-none"
                placeholder="Enter ceiling amount in Yen"
                required
              />
              <span className="absolute right-4 top-3.5 text-xs font-mono text-slate-400">
                ≈ {yenToUsd(maxBid)}
              </span>
            </div>
          </div>

          {/* Wallet Balance Comparison */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                <span>Available Client Escrow:</span>
              </span>
              <span className={`font-mono font-bold ${hasEnoughFunds ? "text-emerald-400" : "text-red-400"}`}>
                {formatYen(clientBalanceYen)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Required Escrow Hold:</span>
              <span className="font-mono text-white">{formatYen(maxBid)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasEnoughFunds || maxBid <= auction.currentPriceYen}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center space-x-1.5"
            >
              <Gavel className="w-4 h-4" />
              <span>{isSubmitting ? "Committing Bid..." : "Lock & Confirm Bid"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}


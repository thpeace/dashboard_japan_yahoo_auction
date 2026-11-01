"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Receipt
} from "lucide-react";
import { fetchClientWallet, fetchWalletTransactions, depositWallet } from "@/lib/api";
import { ClientUser, WalletTransaction } from "@/lib/types";
import { formatYen, yenToUsd } from "@/lib/utils";

export default function WalletPage() {
  const [client, setClient] = useState<ClientUser | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadWallet = async () => {
    try {
      const [clientData, txData] = await Promise.all([
        fetchClientWallet(1),
        fetchWalletTransactions(1),
      ]);
      setClient(clientData);
      setTransactions(txData);
    } catch (err) {
      console.error("Wallet loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await depositWallet({
        clientId: 1,
        amount: depositAmount,
        currency: "JPY",
        notes: "Instant bank wire simulation top-up",
      });
      setStatusMsg(`Successfully credited ${formatYen(depositAmount)} to your wallet escrow!`);
      loadWallet();
      setTimeout(() => {
        setIsDepositOpen(false);
        setStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Wallet className="w-7 h-7 text-blue-500" />
            <span>Client Escrow Wallet &amp; Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your bidding deposits, active escrow locks, and view immutable transaction receipts.
          </p>
        </div>

        <button
          onClick={() => setIsDepositOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 flex items-center space-x-2 self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Top Up Funds</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main Available Balance */}
        <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-blue-300 font-semibold">Available Bidding Balance</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {client ? formatYen(client.walletBalanceYen) : "¥0"}
          </div>
          <span className="text-xs text-slate-400 font-mono block">
            ≈ {client ? yenToUsd(client.walletBalanceYen) : "$0.00"} USD
          </span>
        </div>

        {/* Client User Info */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold">Verified Account</span>
          <div className="text-lg font-bold text-white">
            {client?.fullName || "Alex Rivera"}
          </div>
          <span className="text-xs text-slate-400 font-mono block">
            {client?.email || "alex@tokyo-import.com"}
          </span>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-1">
            KYC VERIFIED • HIGH CEILING TIER
          </span>
        </div>

        {/* Security & Escrow Guarantee */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase">Automated Escrow Protocol</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Funds are locked only when an active bid is submitted. If outbid or if an order is cancelled, held funds are instantaneously restored to your balance.
          </p>
        </div>

      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Transaction &amp; Escrow Ledger</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Postgres Immutable Records</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 font-mono text-slate-400">
                <tr>
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount (¥)</th>
                  <th className="py-3 px-4">Description / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No transaction records found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-white font-bold">{tx.referenceId}</td>
                        <td className="py-3 px-4 text-slate-400 font-sans">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === "DEPOSIT"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : tx.type === "BID_HOLD"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 font-bold ${isPositive ? "text-emerald-400" : "text-amber-400"
                            }`}
                        >
                          {isPositive ? `+${formatYen(tx.amount)}` : formatYen(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans">{tx.notes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Top Up Escrow Balance</h3>
            <p className="text-xs text-slate-400">
              Simulate instant funding via wire transfer or Japanese domestic bank deposit.
            </p>

            {statusMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Deposit Amount (¥ JPY)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[50000, 100000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${depositAmount === amt
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                    >
                      +{formatYen(amt)}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm font-bold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || depositAmount <= 0}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  {isSubmitting ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


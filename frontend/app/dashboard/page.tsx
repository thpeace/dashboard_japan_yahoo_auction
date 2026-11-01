"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Globe,
  Crosshair,
  Gavel,
  Server,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchAccounts,
  fetchProxies,
  fetchOrders,
  fetchAuditLogs,
  refreshAccountSession,
  checkProxies,
  forceExecuteSnipe,
  cancelBidOrder
} from "@/lib/api";
import {
  DashboardStats,
  YahooAccount,
  ResidentialProxy,
  BidOrder,
  BiddingAuditLog
} from "@/lib/types";
import { formatYen, getStatusBadgeStyle } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [accounts, setAccounts] = useState<YahooAccount[]>([]);
  const [proxies, setProxies] = useState<ResidentialProxy[]>([]);
  const [orders, setOrders] = useState<BidOrder[]>([]);
  const [logs, setLogs] = useState<BiddingAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [statData, accountData, proxyData, orderData, logData] = await Promise.all([
        fetchDashboardStats(),
        fetchAccounts(),
        fetchProxies(),
        fetchOrders(),
        fetchAuditLogs(),
      ]);
      setStats(statData);
      setAccounts(accountData);
      setProxies(proxyData);
      setOrders(orderData.content);
      setLogs(logData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 6000); // 6s live polling
    return () => clearInterval(interval);
  }, []);

  const handleRefreshCookies = async (id: number) => {
    try {
      await refreshAccountSession(id);
      setActionMessage(`Refreshed session cookies for account #${id}`);
      loadAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckProxies = async () => {
    try {
      await checkProxies();
      setActionMessage("Tested latency for all Japanese residential proxies");
      loadAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleForceSnipe = async (id: number) => {
    try {
      await forceExecuteSnipe(id);
      setActionMessage(`Dispatched Sniper Bot execution for order #${id}`);
      loadAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (id: number) => {
    try {
      await cancelBidOrder(id);
      setActionMessage(`Order #${id} cancelled and funds released`);
      loadAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Sliders className="w-7 h-7 text-blue-500" />
              <span>Operator &amp; Engine Control Room</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervise company Yahoo Japan accounts, residential proxy health, active sniper queues, and automated audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {actionMessage && (
            <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-in fade-in">
              {actionMessage}
            </span>
          )}

          <button
            onClick={loadAll}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
            <span>Poll Now</span>
          </button>
        </div>
      </div>

      {/* 1. HEALTH ALERT NOTIFICATION (If any account requires SMS verification) */}
      {accounts.some((a) => a.status === "SMS_VERIFICATION_REQUIRED") && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start space-x-3 text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-300">Action Required: Japan SMS Verification Needed</span>
            <p className="mt-0.5 text-amber-200/80">
              One or more company accounts (e.g. yj_corp_gamma_fukuoka) have been flagged for 2FA SMS verification by Yahoo! Japan. Automated bidding on this account is temporarily paused.
            </p>
          </div>
        </div>
      )}

      {/* 2. COMPANY YAHOO ACCOUNTS (PROXY MODEL) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Company Yahoo! Accounts Pool (Proxy Model)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">1-3 Vetted Corporate Accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {accounts.map((acct) => {
            const isSmsRequired = acct.status === "SMS_VERIFICATION_REQUIRED";
            return (
              <div
                key={acct.id}
                className={`glass-panel p-5 rounded-2xl border space-y-4 ${isSmsRequired
                    ? "border-amber-500/40 bg-amber-950/10"
                    : "border-slate-800 bg-slate-900/60"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-white block">{acct.username}</span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{acct.proxyIp}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${isSmsRequired
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                  >
                    {acct.status}
                  </span>
                </div>

                {/* Quota & Balance */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Daily Bids</span>
                    <span className="font-mono font-bold text-white">
                      {acct.dailyBidCount} / {acct.maxDailyBids}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Available Fund</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatYen(acct.balanceYen)}
                    </span>
                  </div>
                </div>

                {/* Refresh Session Button */}
                <button
                  onClick={() => handleRefreshCookies(acct.id)}
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Verify / Refresh Session Cookies</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. RESIDENTIAL PROXY POOL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Japanese Residential Proxy Nodes</h2>
          </div>
          <button
            onClick={handleCheckProxies}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Ping All Nodes</span>
          </button>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 font-mono text-slate-400">
                <tr>
                  <th className="py-3 px-4">IP Address : Port</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {proxies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-white font-bold">{p.ipAddress}:{p.port}</td>
                    <td className="py-3 px-4 text-slate-300">{p.region}</td>
                    <td className="py-3 px-4 text-slate-400">{p.provider}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold">{p.latencyMs} ms</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE SNIPER QUEUE & ORDERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Live Bidding Orders &amp; Sniper Queue</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">TanStack Headless Data Grid</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 font-mono text-slate-400">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Auction Item</th>
                  <th className="py-3 px-4">Ceiling (¥)</th>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {orders.map((order) => {
                  const badge = getStatusBadgeStyle(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono text-white font-bold">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{order.client?.username}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                          {order.auction?.titleEn || order.auction?.titleJp}
                        </span>
                        <span className="text-[10px] text-red-400 font-mono">
                          {order.auction?.yahooAuctionId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {formatYen(order.maxBidYen)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                        {order.strategy}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {order.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleForceSnipe(order.id)}
                            className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold transition-colors"
                          >
                            Force Snipe
                          </button>
                        )}
                        {order.status !== "WON" && order.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-mono transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. LIVE AUDIT LOG STREAM */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Engine Audit Trail &amp; Scraper Feed</h2>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 text-slate-300 pb-1.5 border-b border-slate-900">
              <span className="text-slate-500 text-[10px] whitespace-nowrap">
                {new Date(log.loggedAt).toLocaleTimeString()}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-blue-300 border border-slate-700">
                {log.action}
              </span>
              <span className="text-slate-300 flex-1 leading-snug">{log.details}</span>
              {log.executedByProxy && (
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  via {log.executedByProxy}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}


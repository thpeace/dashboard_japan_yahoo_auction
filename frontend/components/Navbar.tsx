"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Search,
  Wallet,
  Sliders,
  ShieldCheck,
  Menu,
  X,
  Layers,
  Activity
} from "lucide-react";
import { formatYen, yenToUsd } from "@/lib/utils";
import { fetchClientWallet } from "@/lib/api";

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export default function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balanceYen, setBalanceYen] = useState<number>(518000);

  useEffect(() => {
    fetchClientWallet(1)
      .then((user) => setBalanceYen(user.walletBalanceYen))
      .catch(() => setBalanceYen(518000));
  }, [pathname]);

  const navLinks = [
    { name: "Live Auctions", href: "/auctions", icon: Layers },
    { name: "Operator Control", href: "/dashboard", icon: Sliders },
    { name: "Wallet & Ledger", href: "/wallet", icon: Wallet },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-yahoo-dark/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold tracking-tight text-white text-base">YAHOO! JP</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                    PROXY
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono -mt-0.5">Automated Bidding Engine</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 ml-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Header: Search & Wallet */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search auctions or IDs...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Ctrl K
              </kbd>
            </button>

            {/* Proxy Health Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xl:inline font-mono">Tokyo-Node: 32ms</span>
            </div>

            {/* Client Escrow Wallet Pill */}
            <Link
              href="/wallet"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 text-xs hover:border-blue-400 transition-all group"
            >
              <Wallet className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-right">
                <span className="font-bold text-white font-mono">{formatYen(balanceYen)}</span>
                <span className="text-[10px] text-blue-300/70 font-mono">≈ {yenToUsd(balanceYen)}</span>
              </div>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenCommandPalette}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-yahoo-dark px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Escrow Balance:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{formatYen(balanceYen)}</span>
          </div>
        </div>
      )}
    </nav>
  );
}


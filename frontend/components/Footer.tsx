import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Database, Server, Cpu, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-white text-sm">YAHOO! JP PROXY</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Automated high-concurrency proxy bidding gateway for Yahoo! Japan Auctions. Utilizing verified corporate accounts, headless browser stealth sessions, and Japanese residential proxies.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL Cluster 10.10.0.20:5432</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-3">System Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/auctions" className="hover:text-blue-400 transition-colors">Live Auctions Catalog</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Operator Control Center</Link></li>
              <li><Link href="/wallet" className="hover:text-blue-400 transition-colors">Escrow Wallet &amp; Ledger</Link></li>
              <li><a href="http://localhost:8085/swagger-ui.html" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Swagger API Docs</a></li>
            </ul>
          </div>

          {/* Architecture Pillars */}
          <div>
            <h4 className="text-white font-semibold mb-3">Core Microservices</h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Monitoring Engine (Scraper)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sniper Bot (T-8s Dispatch)</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Account &amp; Cookie Rotator</span>
              </li>
              <li className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Spring Data JPA + Postgres</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack 2026 */}
          <div>
            <h4 className="text-white font-semibold mb-3">Platform Specs</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Frontend:</span>
                <span className="text-slate-200">Next.js 15 + Three.js</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Backend:</span>
                <span className="text-slate-200">Spring Boot 3.3.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Database:</span>
                <span className="text-slate-200">PostgreSQL 16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proxies:</span>
                <span className="text-slate-200">JP Residential IPv4</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-slate-900 text-center text-slate-500 text-[11px]">
          Yahoo Auction Proxy &amp; Auto Bidding Platform • Engineered for high-frequency reliability &amp; zero account bans.
        </div>
      </div>
    </footer>
  );
}


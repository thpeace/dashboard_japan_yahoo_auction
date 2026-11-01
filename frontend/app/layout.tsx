"use client";

import "./globals.css";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>Yahoo! Japan Auction Proxy &amp; Auto-Bidding Platform</title>
        <meta
          name="description"
          content="Automated bidding and proxy management platform for Yahoo! Japan Auctions built with Next.js, Three.js, Spring Boot, and PostgreSQL."
        />
      </head>
      <body className="min-h-screen bg-yahoo-dark flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      </body>
    </html>
  );
}


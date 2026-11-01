# 💻 Frontend Developer Guide: Next.js 15 & Three.js UI

Welcome to the **Yahoo Japan Auction Proxy Client & Control Center**! This frontend is built with **Next.js 15 (App Router)**, **React 19**, **Three.js**, **Tailwind CSS**, and **Lucide React**.

---

## 📋 1. Prerequisites Checklist

Before running the application, make sure you have:

```powershell
# Node.js version 20 or higher (Node v24 tested)
node -v

# npm version 10 or higher
npm.cmd -v
```

> [!TIP]
> **Windows PowerShell Tip**: If PowerShell gives a `PSSecurityException` error saying `File npm.ps1 cannot be loaded because running scripts is disabled`, use **`npm.cmd`** and **`npx.cmd`** instead of `npm`/`npx`.

---

## ⚙️ 2. Configuration & Environment Variables

### A. API Connection
The frontend connects to the Spring Boot backend via `frontend/lib/api.ts`.
By default, it talks to:
```text
http://localhost:8085/api
```

If you wish to override the backend address, create a file named `.env.local` inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8085/api
```

### B. Next.js Rewrites (`next.config.mjs`)
All calls to `/backend-api/*` are automatically rewritten by Next.js to forward to `http://localhost:8085/api/*`, avoiding cross-origin issues during local development.

### C. Port Configuration
By default, this app runs on **port `3005`** (to prevent conflicts with any existing service on port `3000`).

---

## 🏃 3. Step-by-Step: How to Run Locally

### Step 1: Open Terminal in the Frontend Folder
```powershell
cd f:\project_free\threejs+nextjs+springboot+postgres\frontend
```

### Step 2: Install NPM Dependencies
*(Only needed once or after updating dependencies)*
```powershell
npm.cmd install
```

### Step 3: Run in Development Mode (with Fast Refresh)
```powershell
npm.cmd run dev
```

Open your browser to:
👉 **[http://localhost:3005](http://localhost:3005)**

### Alternative: Run Optimized Production Build
```powershell
# Build static & dynamic routes
npm.cmd run build

# Start production server
npm.cmd start
```

---

## 🗺️ 4. Application Routes & Key Features

| Route | Page | Key Features |
| :--- | :--- | :--- |
| **`/`** | **Landing Page** | • **Three.js 3D Interactive Visualizer**: Geodesic 3D globe with Tokyo/Osaka proxy nodes, particle swarm, mouse parallax.<br>• **Live KPI Counters**: Tracked auctions, win rate, active bids.<br>• **Proxy vs Client Account Comparison**: Table based on architectural spec.<br>• **Featured Live Auctions**: Real-time ticking countdown badges. |
| **`/auctions`** | **Auction Catalog** | • **Full Marketplace Search**: Filter by keyword, category, status.<br>• **Bilingual Toggle**: Switch between `JP 日本語` and `EN English` translations.<br>• **Countdown Pulse**: Visual pulse effect when under 30 minutes left. |
| **`/auctions/[id]`** | **Auction Detail** | • **High-Res Gallery & Specs**: Original Japanese and AI English description.<br>• **Bidding Action Panel**: Auto-bid ceiling vs Sniper Bot (T-8s) mode.<br>• **Escrow Hold Preview**: Live calculation against client balance. |
| **`/dashboard`** | **Operator Control** | • **Corporate Yahoo Accounts**: Session cookie health, refresh button, SMS alerts.<br>• **Residential Proxy Pool**: Tokyo, Osaka, Fukuoka, Nagoya latency table with re-ping.<br>• **Sniper Queue Grid**: TanStack-style table with **Force Snipe** and **Cancel** actions.<br>• **Audit Log Feed**: Real-time scraper and engine logs. |
| **`/wallet`** | **Escrow Wallet** | • **Balance Summary**: Yen and approx USD balance.<br>• **Instant Top-Up Modal**: Simulate deposit additions.<br>• **Transaction Ledger**: Immutable history of escrow holds, releases, and deposits. |

---

## 🔍 5. Global Command Palette (`Ctrl + K`)

Press **`Ctrl + K`** (or `Cmd + K` on Mac) anywhere on the site or click the search pill in the navbar.
- Instantly searches Yahoo Japan auction IDs (e.g. `m1092837190` or `r1076542199`).
- Search keywords across titles in both Japanese and English.
- Quick navigation shortcuts to Operator Control and Wallet.

---

## 🎨 6. How the Three.js 3D Visualizer Works

Located in [`components/ThreeHeroVisualizer.tsx`](file:///f:/project_free/threejs+nextjs+springboot+postgres/frontend/components/ThreeHeroVisualizer.tsx):
1. **Scene Setup**: Uses standard Three.js WebGLRenderer with alpha transparency and device pixel ratio capping.
2. **Geodesic Globe**: An `IcosahedronGeometry` wireframe core with glowing inner sphere.
3. **Japan Coordinate Pins**: Mathematical conversion from GPS Latitude/Longitude to 3D sphere Cartesian coordinates:
   - Tokyo (`35.6762° N, 139.6503° E`)
   - Osaka (`34.6937° N, 135.5023° E`)
   - Fukuoka (`33.5904° N, 130.4017° E`)
   - Nagoya (`35.1815° N, 136.9066° E`)
4. **Data Stream Splines**: Connecting Bezier 3D tube curves carrying simulated bids.
5. **Particle Swarm**: Over 400 floating points simulating high-frequency automated proxy traffic.
6. **Interaction**: Mouse movement creates smooth parallax camera tilting.
7. **Lifecycle & Cleanup**: Fully disposes geometries, materials, and cancels animation frames on unmount to prevent memory leaks.

---

## 🛠️ 7. Troubleshooting Common Issues

### Issue 1: `Port 3005 is already in use`
Edit `package.json` and change `-p 3005` to another port (e.g. `-p 3010`), or run:
```powershell
npx.cmd next dev -p 3010
```

### Issue 2: Auction images don't load
Check `next.config.mjs` — external image domains must be whitelisted under `images.remotePatterns`. We have pre-configured `images.unsplash.com` and `auctions.c.yimg.jp`.

### Issue 3: "Failed to fetch" on placing bids
Make sure the Spring Boot backend is running on `http://localhost:8085`. You can verify by opening `http://localhost:8085/api/dashboard/stats` in your browser.


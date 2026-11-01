# 👋 Welcome New Joiner! Full-Stack Local Setup Guide

Welcome to the **Yahoo! Japan Auction Proxy & Automated Bidding Platform** team! This guide will help you understand the architecture, configure your local environment, and run both the backend and frontend in under **5 minutes**.

---

## 🧭 1. What Are We Building? (30-Second Overview)

Yahoo! Japan Auctions (ヤフオク) is Japan's largest auction marketplace. However, foreign buyers face severe hurdles:
1. **Aggressive Anti-Bot & IP Bans**: Scraping or bidding from outside Japan or cloud datacenters triggers instant CAPTCHAs or permanent account lockouts.
2. **Japanese Mobile SMS Verification**: Every Yahoo Japan account requires SMS verification from a physical Japanese phone number.
3. **No Official Bidding API**: Bids must be placed by simulating human interactions.

### Our Solution: The Company-Owned Proxy Model
- Clients place intent on our web platform and deposit funds into their escrow wallet.
- Our **Spring Boot microservice** monitors auctions and rotates bids through **1-3 highly vetted corporate Yahoo accounts** using **Japanese residential proxies (Tokyo, Osaka, Fukuoka, Nagoya)**.
- Bids are executed either via **Yahoo's native incremental Auto-Bid** (safe ceiling) or **Precision Sniper Bot** (dispatched at `T-8s` before close via stealth headless browsers).

---

## 📂 2. Repository Map

```text
f:\project_free\threejs+nextjs+springboot+postgres\
│
├── 📄 README.md                        # Master project documentation & system overview
├── 📄 NEW_JOINER_GUIDE.md              # THIS FILE - 5-minute onboarding & setup guide
├── 📄 prepare_build.md                 # Initial product & database specifications
├── 📄 yahoo_auction_proxy_architecture.md # Technical whitepaper on proxy bidding & anti-bot evasion
├── 📄 frontend_ui_framework_strategy.md # UI component strategy (shadcn/ui, Three.js, Tailwind)
│
├── 📁 backend/                         # Spring Boot 3.3.5 (Java 21) REST Backend
│   ├── 📄 README.md                    # Detailed backend guide (JPA, DB, Swagger, Scheduler)
│   ├── 📄 pom.xml                      # Maven dependencies
│   └── src/
│       ├── main/java/com/yahoo/auction/
│       │   ├── entity/                 # 7 JPA domain models (PostgreSQL)
│       │   ├── repository/             # Spring Data JPA with dynamic Specifications
│       │   ├── service/                # Business logic & simulation worker
│       │   ├── controller/             # REST API endpoints
│       │   └── config/                 # CORS, Swagger OpenAPI, and Data Initializer
│       └── main/resources/
│           ├── application.yml         # Core config & port 8085
│           ├── application-postgres.yml# Connection to 10.10.0.20:5432
│           └── schema.sql              # Complete PostgreSQL DDL schema
│
└── 📁 frontend/                        # Next.js 15 (React 19, Three.js, Tailwind CSS)
    ├── 📄 README.md                    # Detailed frontend guide (Routes, Three.js, State)
    ├── 📄 package.json                 # Dependencies (Three.js, Lucide, Tailwind)
    ├── 📄 next.config.mjs              # Image domains & API rewrites
    ├── app/                            # Next.js App Router pages
    │   ├── page.tsx                    # Landing Page + Three.js 3D Visualizer
    │   ├── auctions/                   # Live catalog with bilingual JP/EN toggle
    │   ├── dashboard/                  # Operator Control Room (Accounts, Proxies, Snipes)
    │   └── wallet/                     # Escrow balances & immutable ledger
    ├── components/                     # ThreeHeroVisualizer, Navbar, CommandPalette, BidModal
    └── lib/                            # API client, TypeScript types, formatters
```

---

## ⚡ 3. 5-Minute Quickstart

### Prerequisites
Make sure your workstation has:
1. **Java 21 LTS** (`java -version`)
2. **Maven 3.9+** (`mvn -version`)
3. **Node.js 20+** (`node -v`)
4. **npm 10+** (`npm.cmd -v`)

---

### Step 1: Start the Backend (Terminal 1)
```powershell
cd f:\project_free\threejs+nextjs+springboot+postgres\backend
mvn clean compile
mvn spring-boot:run
```
✅ **Success Indicator**:
You will see: `Tomcat started on port 8085 (http)` and `Started YahooAuctionProxyApplication`.

---

### Step 2: Start the Frontend (Terminal 2)
```powershell
cd f:\project_free\threejs+nextjs+springboot+postgres\frontend
npm.cmd install
npm.cmd run dev
```
✅ **Success Indicator**:
You will see: `▲ Next.js 15.5.28 - Local: http://localhost:3005`.

---

### Step 3: Open in Your Browser
- 🖥️ **Web App**: [http://localhost:3005](http://localhost:3005)
- 🎛️ **Operator Control Room**: [http://localhost:3005/dashboard](http://localhost:3005/dashboard)
- 📚 **Interactive Swagger API**: [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html)

---

## 🗄️ 4. Database Setup & Configuration

The application is pre-configured to connect to the team PostgreSQL database:
- **Server IP**: `10.10.0.20`
- **Port**: `5432`
- **Database**: `yahoo_auction`
- **Schema**: `yahoo_auction_schema`
- **User**: `admin`
- **Password**: `P@$$w0rd`

### Automatic Seed Data
On first launch, [`DataInitializer.java`](file:///f:/project_free/threejs+nextjs+springboot+postgres/backend/src/main/java/com/yahoo/auction/config/DataInitializer.java) automatically populates:
- **3 Company Yahoo Accounts** (`yj_corp_alpha_tokyo`, `yj_corp_beta_osaka`, `yj_corp_gamma_fukuoka`)
- **4 Japanese Residential Proxies** (Tokyo 32ms, Osaka 41ms, Fukuoka 48ms, Nagoya 65ms)
- **6 Realistic Yahoo Japan items** (Grand Seiko watch, Fate figure, Nintendo 64DD, R34 GT-R cluster, Leica M3)
- **Client user** `alex_collector` with an active escrow balance of **¥518,000**.

> [!TIP]
> **Working Offline?** If you are not on the company network/VPN and cannot reach `10.10.0.20`, you can run the backend completely offline with the in-memory H2 database:
> ```powershell
> mvn spring-boot:run -Dspring-boot.run.profiles=h2
> ```

---

## 🎯 5. Verification Checklist for New Joiners

Try these steps to verify your local environment is functioning 100%:

1. [ ] **3D Canvas**: Open [http://localhost:3005](http://localhost:3005) and move your mouse over the hero section. The 3D globe should smoothly rotate with Japan proxy pins and floating particle waves.
2. [ ] **Bilingual Switcher**: In the live auction grid, toggle between **JP (日本語)** and **EN (English)**. The item titles should immediately switch language.
3. [ ] **Command Palette**: Press **`Ctrl + K`** on your keyboard. Type `m1092837190` or `Grand Seiko` to jump directly to an auction.
4. [ ] **Place a Bid**: Click **Place Bid** on any item, select **Sniper Bot (T-8s)**, set your ceiling, and click **Lock & Confirm Bid**. Your wallet balance will decrease, and an escrow hold will appear in the ledger.
5. [ ] **Operator Dashboard**: Go to [http://localhost:3005/dashboard](http://localhost:3005/dashboard). Check the Japanese proxy nodes, click **Re-Ping All Nodes**, and click **Force Snipe** to test immediate execution.
6. [ ] **Swagger Test**: Open [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html) and execute `GET /api/dashboard/stats`. It should return HTTP 200 with real-time stats.

---

## 💡 6. Deep Dive Sub-Guides
For deeper component-level documentation:
- 📖 [Backend In-Depth Setup & Architecture](backend/README.md)
- 💻 [Frontend In-Depth Setup & Three.js Guide](frontend/README.md)
- 📑 [Yahoo Japan Proxy Architecture Whitepaper](yahoo_auction_proxy_architecture.md)
- 🎨 [UI Strategy & Component Guidelines](frontend_ui_framework_strategy.md)


# 🚀 Backend Developer Guide: Yahoo Auction Proxy Engine

Welcome to the **Yahoo Japan Auction Auto Bidding & Proxy Management Backend**! This service is built with **Spring Boot 3.3.5** and **Java 21 LTS**, powered by **Spring Data JPA** and **PostgreSQL**.

---

## 📋 1. Prerequisites Checklist

Before you begin, verify your machine has the required runtimes:

```powershell
# Check Java version (Must be Java 21 or higher)
java -version

# Check Maven version (Must be 3.9 or higher)
mvn -version
```

If you don't have Java 21, download it from [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21) or install via SDKMAN / Winget (`winget install Oracle.JDK.21`).

---

## ⚙️ 2. Local Configuration & Profiles

Configuration is managed in `src/main/resources/`:
- `application.yml`: Core web server, port (`8085`), JPA formatting, and active profile selector.
- `application-postgres.yml`: PostgreSQL connection settings.
- `application-h2.yml`: Offline in-memory H2 database fallback for testing without external networks.

### Database Settings (`application-postgres.yml`)
By default, the application connects to the team PostgreSQL database:
- **Host**: `10.10.0.20`
- **Port**: `5432`
- **Database**: `yahoo_auction`
- **Schema**: `yahoo_auction_schema`
- **User**: `admin`
- **Password**: `P@$$w0rd`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://10.10.0.20:5432/yahoo_auction?currentSchema=yahoo_auction_schema
    username: admin
    password: P@$$w0rd
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    properties:
      hibernate:
        default_schema: yahoo_auction_schema
```

> [!NOTE]
> **PostgreSQL 15+ Schema Isolation**: 
> Notice that the JDBC URL specifies `?currentSchema=yahoo_auction_schema`. In PostgreSQL 15+, non-superusers do not have default write access to the `public` schema. Using `yahoo_auction_schema` owned by `admin` ensures zero permission errors.

### Running with Offline In-Memory Database (No Network Needed)
If you are developing on a plane or outside the office network where `10.10.0.20` is unreachable, simply activate the H2 profile:
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

---

## 🏃 3. Step-by-Step: How to Run Locally

### Step 1: Open Terminal in the Backend Folder
```powershell
cd f:\project_free\threejs+nextjs+springboot+postgres\backend
```

### Step 2: Compile and Build
```powershell
mvn clean compile
```

### Step 3: Start the Spring Boot Application
```powershell
mvn spring-boot:run
```

Once started, look for this log output:
```text
Tomcat started on port 8085 (http) with context path '/'
Started YahooAuctionProxyApplication in 11.372 seconds
```

### Step 4: Verify Health
Open your browser or run:
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/api/dashboard/stats"
```

---

## 📖 4. API Documentation & Interactive Swagger UI

Springdoc OpenAPI is fully integrated. Once the backend is running:

| Resource | URL |
| :--- | :--- |
| **Interactive Swagger UI** | [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html) |
| **OpenAPI Specification (JSON)** | [http://localhost:8085/v3/api-docs](http://localhost:8085/v3/api-docs) |

You can execute queries, test placing bids, inspect account balances, and trigger proxy checks directly from Swagger UI!

---

## 🏛️ 5. Project Architecture & Codebase Map

The code adheres to clean domain-driven architecture under `com.yahoo.auction`:

```text
src/main/java/com/yahoo/auction/
├── config/
│   ├── CorsConfig.java           # Cross-origin policy for frontend (port 3000 / 3005)
│   ├── OpenApiConfig.java        # Swagger/OpenAPI documentation definitions
│   └── DataInitializer.java     # Seeds rich sample auctions, accounts, and proxies on 1st boot
├── controller/                   # REST API Endpoints
│   ├── AuctionController.java    # /api/auctions (search, filter, poll price)
│   ├── BidOrderController.java   # /api/bids (place bid, cancel, force snipe)
│   ├── YahooAccountController.java# /api/accounts (manage corporate accounts)
│   ├── ProxyController.java      # /api/proxies (residential proxy health)
│   ├── WalletController.java     # /api/wallet (client balances & ledger)
│   └── DashboardController.java  # /api/dashboard (KPI stats & audit logs)
├── dto/                          # Data Transfer Objects & Request Validations
├── entity/                       # JPA Database Entities
│   ├── AuctionItem.java          # Yahoo auction items with indexed auction IDs
│   ├── ClientUser.java           # Users, roles, and balance in Yen/USD
│   ├── YahooAccount.java         # Corporate proxy accounts with session tokens
│   ├── BidOrder.java             # Bid intents (YAHOO_AUTO_BID or SNIPER_BOT)
│   ├── WalletTransaction.java    # Escrow ledger (DEPOSIT, BID_HOLD, BID_RELEASE)
│   ├── ResidentialProxy.java     # Japanese proxy nodes (Tokyo, Osaka, etc.)
│   └── BiddingAuditLog.java      # Real-time audit logs of scraper & bot actions
├── repository/                   # Spring Data JPA Repositories + Dynamic Specifications
└── service/                      # Core Business Logic
    ├── AuctionService.java       # Catalog search & scraper integration
    ├── BidOrderService.java      # Escrow validation & bid submission
    ├── YahooAccountService.java  # Cookie verification & session health
    ├── WalletService.java        # Escrow holds and releases
    ├── DashboardService.java     # Aggregated stats
    └── ProxyBiddingSimulationService.java # Scheduled worker (T-8s sniper dispatch & auction settlements)
```

---

## ⚡ 6. How the Automated Bidding Engine Works

The system implements the **Proxy Model** recommended in the architectural brief:

1. **Native Yahoo Auto-Bid (`YAHOO_AUTO_BID`)**:
   - Submits client maximum bid ceiling to Yahoo Japan via company proxy account.
   - Yahoo automatically bids the lowest increment necessary to outbid rivals.
   - **Advantage**: Zero risk of CAPTCHAs or account bans.

2. **Sniper Bot (`SNIPER_BOT`)**:
   - Holds the bid intent in status `SCHEDULED`.
   - The scheduled worker (`ProxyBiddingSimulationService`) monitors countdowns every few seconds.
   - When time remaining hits the threshold (e.g. `T-8 seconds`), it dispatches the bid via stealth headless browser session through a Japanese residential proxy.
   - **Advantage**: Prevents premature bidding wars.

3. **Escrow Guarantee**:
   - When placing a bid, the maximum amount is locked from client wallet (`BID_HOLD`).
   - If cancelled or outbid, the funds are instantly released back to available balance (`BID_RELEASE`).

---

## 🛠️ 7. Troubleshooting Common Issues

### Issue 1: Port `8085` is already in use
**Solution**:
Run the app on another port by passing `--server.port=8090`:
```powershell
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8090"
```
Remember to update `frontend/lib/api.ts` or set `NEXT_PUBLIC_API_URL=http://localhost:8090/api` in frontend.

### Issue 2: `PSQLException: Connection refused`
**Solution**:
Check network connectivity to the database server:
```powershell
Test-NetConnection -ComputerName 10.10.0.20 -Port 5432
```
If not on the company network/VPN, run with the in-memory H2 profile:
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### Issue 3: How to reset sample data
The database tables are automatically managed by Hibernate (`ddl-auto: update`). If you want to recreate all tables cleanly:
1. Re-run `src/main/resources/schema.sql` against PostgreSQL.
2. Restart the backend; `DataInitializer` will automatically seed fresh auctions and proxies.


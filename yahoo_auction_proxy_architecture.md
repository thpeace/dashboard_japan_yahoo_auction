# Concept: Yahoo! Japan Auction Proxy Bidding System

## 1. Executive Summary
A web application designed to allow clients or internal staff to place and monitor bids on Yahoo! Japan Auctions. The system acts as a proxy, utilizing verified, company-owned accounts to bid on behalf of users, ensuring continuous monitoring and automated bidding to prevent lost auctions.

## 2. System Architecture (Microservices)
To ensure scalability and fault tolerance, the backend should be divided into three core microservices:

*   **Monitoring Engine:** A highly concurrent scraping service that continuously polls Yahoo Auctions for targeted Auction IDs to fetch current prices, time remaining, and highest bidder status.
*   **Bidding Worker:** A scheduled job executor (e.g., Node.js/Python script managed by CRON, BullMQ, or Apache Airflow). It executes the actual bid via a headless browser (Puppeteer/Playwright). 
*   **Account Manager:** A centralized service that manages the state of company Yahoo accounts. It handles login sessions, cookies, and rotates accounts to distribute traffic and minimize the risk of rate-limiting or bans.

## 3. Account Strategy
**Recommendation: Proxy Model (Company-Owned Accounts)**
Clients should deposit funds or place intent on your platform, and your system executes the bid using your internal company accounts. 

| Strategy | Risk Level | Feasibility | Description |
| :--- | :--- | :--- | :--- |
| **Proxy Model (Recommended)** | **Low** | High | The platform manages 1-3 highly vetted company Yahoo accounts. Risk is centralized and managed by the backend. |
| **Client Account Model** | **Extreme** | Very Low | Allowing clients to link personal accounts triggers immediate security lockouts due to IP mismatches (server IP vs. client's residential IP). |
| **Secondary Accounts** | **High** | Medium | Yahoo! Japan requires SMS verification from a Japanese mobile number for *every* account, making maintaining multiple accounts difficult. |

## 4. Technical & Compliance Roadblocks
Building this system requires navigating Yahoo's strict ecosystem:

1.  **No Official Bidding API:** Yahoo removed public API access for bidding. All bids must be executed by simulating human interaction using web scraping and headless browser automation.
2.  **Aggressive Anti-Bot Measures:** Yahoo monitors for automated behavior. Rapid requests, missing browser fingerprints, or high traffic from datacenter IPs will result in CAPTCHAs or permanent account bans. *Mitigation requires high-quality residential Japanese proxies and stealth browser configurations.*
3.  **The "Sniper" vs. "Auto-Bid" Dilemma:** 
    *   *Sniper Bot:* Executing bids 5-10 seconds before the auction ends avoids bidding wars but requires pinpoint accuracy and carries a high risk of failure if the bot is temporarily blocked.
    *   *Yahoo's Auto-Bid (Recommended):* Yahoo has a native "Auto-Bid" (自動入札) system. Your system can simply submit the client's maximum bid early. Yahoo's servers will automatically outbid competitors incrementally. This perfectly mimics human behavior and is technically much safer.

## 5. Strategic Next Steps
*   **Procure Residential Proxies:** Secure reliable Japanese residential proxy IPs.
*   **Proof of Concept (PoC):** Build a small script using Playwright-Stealth to log into a test Yahoo account and successfully place a manual bid without triggering a CAPTCHA.
*   **Session Management:** Develop a secure way to store and refresh Yahoo login cookies in your database so the headless browser doesn't have to log in from scratch every time.
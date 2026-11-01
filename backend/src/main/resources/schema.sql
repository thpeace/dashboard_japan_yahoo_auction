-- ==============================================================================
-- Yahoo Auction Proxy & Bidding System Schema
-- Compatible with PostgreSQL 14 / 15 / 16 / 17
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS yahoo_auction_schema;
SET search_path TO yahoo_auction_schema, public;

CREATE TABLE IF NOT EXISTS client_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150),
    wallet_balance_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    wallet_balance_yen NUMERIC(14, 0) NOT NULL DEFAULT 0,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS yahoo_accounts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    session_cookie TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    proxy_ip VARCHAR(100),
    balance_yen NUMERIC(14, 0) NOT NULL DEFAULT 0,
    daily_bid_count INTEGER NOT NULL DEFAULT 0,
    max_daily_bids INTEGER NOT NULL DEFAULT 50,
    last_used_at TIMESTAMP WITHOUT TIME ZONE,
    last_cookie_refresh TIMESTAMP WITHOUT TIME ZONE,
    notes VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS residential_proxies (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(100) NOT NULL,
    port INTEGER NOT NULL,
    region VARCHAR(100),
    provider VARCHAR(100),
    latency_ms INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY',
    last_checked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auction_items (
    id BIGSERIAL PRIMARY KEY,
    yahoo_auction_id VARCHAR(50) NOT NULL UNIQUE,
    title_jp VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    seller_id VARCHAR(100),
    current_price_yen NUMERIC(14, 0) NOT NULL DEFAULT 0,
    buyout_price_yen NUMERIC(14, 0),
    bid_count INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    image_url TEXT,
    description_jp TEXT,
    description_en TEXT,
    start_time TIMESTAMP WITHOUT TIME ZONE,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    winning_bidder VARCHAR(100),
    is_snipe_armed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_yahoo_auction_id ON auction_items (yahoo_auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_status ON auction_items (status);
CREATE INDEX IF NOT EXISTS idx_auction_end_time ON auction_items (end_time);

CREATE TABLE IF NOT EXISTS bid_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    client_id BIGINT NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
    auction_id BIGINT NOT NULL REFERENCES auction_items(id) ON DELETE CASCADE,
    max_bid_yen NUMERIC(14, 0) NOT NULL,
    current_placed_bid_yen NUMERIC(14, 0) NOT NULL DEFAULT 0,
    strategy VARCHAR(30) NOT NULL DEFAULT 'YAHOO_AUTO_BID',
    snipe_seconds_before_end INTEGER NOT NULL DEFAULT 8,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    assigned_account_id BIGINT REFERENCES yahoo_accounts(id) ON DELETE SET NULL,
    failure_reason VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_bid_order_status ON bid_orders (status);
CREATE INDEX IF NOT EXISTS idx_bid_order_num ON bid_orders (order_number);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'JPY',
    type VARCHAR(30) NOT NULL,
    reference_id VARCHAR(100),
    notes VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bidding_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT,
    bid_order_id BIGINT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    executed_by_proxy VARCHAR(100),
    logged_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_auction ON bidding_audit_logs (auction_id);
CREATE INDEX IF NOT EXISTS idx_audit_logged_at ON bidding_audit_logs (logged_at);


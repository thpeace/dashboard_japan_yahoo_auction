package com.yahoo.auction.entity;

public enum BidStrategy {
    YAHOO_AUTO_BID,    // Native Yahoo auto-bidding (recommended by architecture doc)
    SNIPER_BOT         // Bids T minus N seconds before auction closes
}


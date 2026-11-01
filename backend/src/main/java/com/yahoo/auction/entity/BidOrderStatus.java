package com.yahoo.auction.entity;

public enum BidOrderStatus {
    PENDING,            // Placed by client, awaiting verification or schedule
    SCHEDULED,          // Armed and ready (especially for sniper)
    PLACING_BID,        // Headless browser worker currently dispatching bid
    WINNING,            // Currently the highest bidder on Yahoo
    OUTBID,             // Someone outbid us; client can top up
    WON,                // Auction ended and our proxy won
    LOST,               // Auction ended with another bidder winning
    CANCELLED           // User cancelled before bid was committed
}


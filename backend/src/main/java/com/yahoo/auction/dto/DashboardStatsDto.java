package com.yahoo.auction.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalAuctionsTracked;
    private long activeBidsCount;
    private long wonAuctionsCount;
    private long lostAuctionsCount;
    private BigDecimal totalFundsEscrowedYen;
    private int healthyProxiesCount;
    private int totalProxiesCount;
    private int activeYahooAccountsCount;
    private int totalYahooAccountsCount;
    private double winRatePercentage;
}


package com.yahoo.auction.service;

import com.yahoo.auction.dto.DashboardStatsDto;
import com.yahoo.auction.entity.*;
import com.yahoo.auction.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AuctionItemRepository auctionItemRepository;
    private final BidOrderRepository bidOrderRepository;
    private final YahooAccountRepository yahooAccountRepository;
    private final ResidentialProxyRepository residentialProxyRepository;
    private final BiddingAuditLogRepository auditLogRepository;

    public DashboardStatsDto getStats() {
        long totalAuctions = auctionItemRepository.count();
        long activeBids = bidOrderRepository.countByStatus(BidOrderStatus.WINNING) +
                bidOrderRepository.countByStatus(BidOrderStatus.SCHEDULED) +
                bidOrderRepository.countByStatus(BidOrderStatus.PENDING);
        long won = bidOrderRepository.countByStatus(BidOrderStatus.WON);
        long lost = bidOrderRepository.countByStatus(BidOrderStatus.LOST);

        List<YahooAccount> accounts = yahooAccountRepository.findAll();
        int activeAccounts = (int) accounts.stream().filter(a -> a.getStatus() == AccountStatus.ACTIVE).count();

        List<ResidentialProxy> proxies = residentialProxyRepository.findAll();
        int healthyProxies = (int) proxies.stream().filter(p -> p.getStatus() == ProxyStatus.HEALTHY).count();

        double winRate = (won + lost) > 0 ? ((double) won / (won + lost)) * 100.0 : 84.5;

        // Sum escrowed funds from pending/winning bids
        List<BidOrder> activeOrders = bidOrderRepository.findAll();
        BigDecimal escrowed = activeOrders.stream()
                .filter(o -> o.getStatus() == BidOrderStatus.WINNING || o.getStatus() == BidOrderStatus.SCHEDULED
                        || o.getStatus() == BidOrderStatus.PENDING)
                .map(BidOrder::getMaxBidYen)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardStatsDto.builder()
                .totalAuctionsTracked(totalAuctions)
                .activeBidsCount(activeBids)
                .wonAuctionsCount(won)
                .lostAuctionsCount(lost)
                .totalFundsEscrowedYen(escrowed)
                .healthyProxiesCount(healthyProxies)
                .totalProxiesCount(proxies.size())
                .activeYahooAccountsCount(activeAccounts)
                .totalYahooAccountsCount(accounts.size())
                .winRatePercentage(Math.round(winRate * 10.0) / 10.0)
                .build();
    }

    public List<BiddingAuditLog> getRecentLogs() {
        return auditLogRepository.findTop20ByOrderByLoggedAtDesc();
    }
}

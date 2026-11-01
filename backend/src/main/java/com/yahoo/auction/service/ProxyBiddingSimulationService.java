package com.yahoo.auction.service;

import com.yahoo.auction.entity.*;
import com.yahoo.auction.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class ProxyBiddingSimulationService {

    private final AuctionItemRepository auctionItemRepository;
    private final BidOrderRepository bidOrderRepository;
    private final BiddingAuditLogRepository auditLogRepository;
    private final Random random = new Random();

    /**
     * Ticks every 10 seconds to simulate real-time auction engine polling and
     * sniper triggers.
     */
    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void runAuctionEngineCycle() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Check for auctions that have ended
        List<AuctionItem> activeAuctions = auctionItemRepository.findByStatus(AuctionStatus.ACTIVE);
        for (AuctionItem auction : activeAuctions) {
            if (auction.getEndTime().isBefore(now)) {
                // Settle auction
                auction.setStatus(AuctionStatus.ENDED);

                List<BidOrder> orders = bidOrderRepository.findByAuctionId(auction.getId());
                boolean wonByUs = false;
                for (BidOrder order : orders) {
                    if (order.getStatus() == BidOrderStatus.WINNING) {
                        order.setStatus(BidOrderStatus.WON);
                        wonByUs = true;
                    } else if (order.getStatus() == BidOrderStatus.SCHEDULED
                            || order.getStatus() == BidOrderStatus.OUTBID) {
                        order.setStatus(BidOrderStatus.LOST);
                    }
                    bidOrderRepository.save(order);
                }

                if (wonByUs) {
                    auction.setStatus(AuctionStatus.WON_BY_US);
                    auditLogRepository.save(BiddingAuditLog.builder()
                            .auctionId(auction.getId())
                            .action("AUCTION_WON")
                            .details("Auction " + auction.getYahooAuctionId() + " successfully WON at final price ¥"
                                    + auction.getCurrentPriceYen())
                            .executedByProxy("Settlement-Service")
                            .build());
                } else {
                    auditLogRepository.save(BiddingAuditLog.builder()
                            .auctionId(auction.getId())
                            .action("AUCTION_ENDED")
                            .details("Auction " + auction.getYahooAuctionId() + " ended.")
                            .executedByProxy("Settlement-Service")
                            .build());
                }
                auctionItemRepository.save(auction);
            } else {
                // Check if sniper trigger is armed within threshold
                long secondsLeft = java.time.Duration.between(now, auction.getEndTime()).getSeconds();
                List<BidOrder> scheduledSnipes = bidOrderRepository.findByAuctionId(auction.getId()).stream()
                        .filter(o -> o.getStatus() == BidOrderStatus.SCHEDULED
                                && o.getStrategy() == BidStrategy.SNIPER_BOT)
                        .toList();

                for (BidOrder snipe : scheduledSnipes) {
                    if (secondsLeft <= snipe.getSnipeSecondsBeforeEnd()) {
                        // Fire sniper!
                        snipe.setStatus(BidOrderStatus.WINNING);
                        BigDecimal newBid = auction.getCurrentPriceYen().add(BigDecimal.valueOf(500));
                        snipe.setCurrentPlacedBidYen(newBid);
                        auction.setCurrentPriceYen(newBid);
                        auction.setBidCount(auction.getBidCount() + 1);
                        auction.setWinningBidder(
                                snipe.getAssignedAccount() != null ? snipe.getAssignedAccount().getUsername()
                                        : "proxy_sniper");
                        auction.setIsSnipeArmed(false);

                        bidOrderRepository.save(snipe);
                        auctionItemRepository.save(auction);

                        auditLogRepository.save(BiddingAuditLog.builder()
                                .auctionId(auction.getId())
                                .bidOrderId(snipe.getId())
                                .action("SNIPER_FIRED")
                                .details("Sniper executed at T-" + secondsLeft + "s! Dispatched bid ¥" + newBid
                                        + " for " + auction.getYahooAuctionId())
                                .executedByProxy(
                                        snipe.getAssignedAccount() != null ? snipe.getAssignedAccount().getProxyIp()
                                                : "Stealth-Node-JP")
                                .build());
                    }
                }
            }
        }
    }
}

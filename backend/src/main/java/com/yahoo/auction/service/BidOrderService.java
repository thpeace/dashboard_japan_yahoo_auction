package com.yahoo.auction.service;

import com.yahoo.auction.dto.BidRequestDto;
import com.yahoo.auction.entity.*;
import com.yahoo.auction.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BidOrderService {

    private final BidOrderRepository bidOrderRepository;
    private final AuctionItemRepository auctionItemRepository;
    private final ClientUserRepository clientUserRepository;
    private final YahooAccountRepository yahooAccountRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BiddingAuditLogRepository auditLogRepository;

    public Page<BidOrder> getOrders(Long clientId, BidOrderStatus status, Pageable pageable) {
        Specification<BidOrder> spec = Specification.where(null);
        if (clientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("client").get("id"), clientId));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        return bidOrderRepository.findAll(spec, pageable);
    }

    public List<BidOrder> getOrdersByClient(Long clientId) {
        return bidOrderRepository.findByClientId(clientId);
    }

    public BidOrder getOrderById(Long id) {
        return bidOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bid order not found with ID: " + id));
    }

    @Transactional
    public BidOrder placeBid(BidRequestDto request) {
        ClientUser client = clientUserRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        AuctionItem auction = auctionItemRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new IllegalArgumentException("Auction not found with ID: " + request.getAuctionId()));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new IllegalStateException("Auction is not active. Status: " + auction.getStatus());
        }

        if (request.getMaxBidYen().compareTo(auction.getCurrentPriceYen()) <= 0) {
            throw new IllegalArgumentException("Max bid must be strictly greater than current price ¥" + auction.getCurrentPriceYen());
        }

        if (client.getWalletBalanceYen().compareTo(request.getMaxBidYen()) < 0) {
            throw new IllegalStateException("Insufficient wallet balance. Available: ¥" + client.getWalletBalanceYen() + ", Required: ¥" + request.getMaxBidYen());
        }

        // Deduct/Hold from client wallet
        client.setWalletBalanceYen(client.getWalletBalanceYen().subtract(request.getMaxBidYen()));
        clientUserRepository.save(client);

        String orderNum = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        walletTransactionRepository.save(WalletTransaction.builder()
                .client(client)
                .amount(request.getMaxBidYen().negate())
                .currency("JPY")
                .type(TransactionType.BID_HOLD)
                .referenceId(orderNum)
                .notes("Escrow lock for Yahoo Auction " + auction.getYahooAuctionId())
                .build());

        // Assign active proxy account
        List<YahooAccount> activeAccounts = yahooAccountRepository.findByStatus(AccountStatus.ACTIVE);
        YahooAccount assignedAccount = activeAccounts.isEmpty() ? null : activeAccounts.get(0);

        BidOrderStatus initialStatus = (request.getStrategy() == BidStrategy.SNIPER_BOT)
                ? BidOrderStatus.SCHEDULED
                : BidOrderStatus.WINNING;

        BigDecimal initialPlacedBid = (request.getStrategy() == BidStrategy.SNIPER_BOT)
                ? BigDecimal.ZERO
                : auction.getCurrentPriceYen().add(BigDecimal.valueOf(500));

        if (request.getStrategy() == BidStrategy.YAHOO_AUTO_BID) {
            auction.setCurrentPriceYen(initialPlacedBid);
            auction.setBidCount(auction.getBidCount() + 1);
            auction.setWinningBidder(assignedAccount != null ? assignedAccount.getUsername() : "proxy_user");
            auctionItemRepository.save(auction);
        } else {
            auction.setIsSnipeArmed(true);
            auctionItemRepository.save(auction);
        }

        BidOrder bidOrder = BidOrder.builder()
                .orderNumber(orderNum)
                .client(client)
                .auction(auction)
                .maxBidYen(request.getMaxBidYen())
                .currentPlacedBidYen(initialPlacedBid)
                .strategy(request.getStrategy())
                .snipeSecondsBeforeEnd(request.getSnipeSecondsBeforeEnd() != null ? request.getSnipeSecondsBeforeEnd() : 8)
                .status(initialStatus)
                .assignedAccount(assignedAccount)
                .build();

        BidOrder saved = bidOrderRepository.save(bidOrder);

        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(auction.getId())
                .bidOrderId(saved.getId())
                .action(request.getStrategy() == BidStrategy.SNIPER_BOT ? "SNIPER_ARMED" : "AUTO_BID_SUBMIT")
                .details(String.format("Placed %s bid max ¥%s on %s via account %s",
                        request.getStrategy(), request.getMaxBidYen(), auction.getYahooAuctionId(),
                        assignedAccount != null ? assignedAccount.getUsername() : "unassigned"))
                .executedByProxy(assignedAccount != null ? assignedAccount.getProxyIp() : "127.0.0.1")
                .build());

        return saved;
    }

    @Transactional
    public BidOrder executeSnipe(Long bidOrderId) {
        BidOrder order = getOrderById(bidOrderId);
        AuctionItem auction = order.getAuction();

        if (order.getStatus() == BidOrderStatus.WON || order.getStatus() == BidOrderStatus.CANCELLED) {
            return order;
        }

        order.setStatus(BidOrderStatus.WINNING);
        order.setCurrentPlacedBidYen(auction.getCurrentPriceYen().add(BigDecimal.valueOf(500)));
        auction.setCurrentPriceYen(order.getCurrentPlacedBidYen());
        auction.setBidCount(auction.getBidCount() + 1);
        auction.setWinningBidder(order.getAssignedAccount() != null ? order.getAssignedAccount().getUsername() : "proxy_bot");
        
        auctionItemRepository.save(auction);
        BidOrder saved = bidOrderRepository.save(order);

        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(auction.getId())
                .bidOrderId(order.getId())
                .action("SNIPER_TRIGGER")
                .details(String.format("Sniper BOT fired! Dispatched bid ¥%s with 8s remaining via headless browser Playwright stealth instance.",
                        order.getCurrentPlacedBidYen()))
                .executedByProxy(order.getAssignedAccount() != null ? order.getAssignedAccount().getProxyIp() : "Tokyo-Stealth-01")
                .build());

        return saved;
    }

    @Transactional
    public BidOrder cancelBid(Long bidOrderId) {
        BidOrder order = getOrderById(bidOrderId);
        if (order.getStatus() == BidOrderStatus.WON || order.getStatus() == BidOrderStatus.LOST) {
            throw new IllegalStateException("Cannot cancel an ended auction order.");
        }

        // Release wallet hold
        ClientUser client = order.getClient();
        client.setWalletBalanceYen(client.getWalletBalanceYen().add(order.getMaxBidYen()));
        clientUserRepository.save(client);

        walletTransactionRepository.save(WalletTransaction.builder()
                .client(client)
                .amount(order.getMaxBidYen())
                .currency("JPY")
                .type(TransactionType.BID_RELEASE)
                .referenceId(order.getOrderNumber())
                .notes("Hold release after bid cancellation for " + order.getOrderNumber())
                .build());

        order.setStatus(BidOrderStatus.CANCELLED);
        BidOrder saved = bidOrderRepository.save(order);

        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(order.getAuction().getId())
                .bidOrderId(order.getId())
                .action("BID_CANCELLED")
                .details("Client cancelled order " + order.getOrderNumber() + ". Funds released to wallet.")
                .executedByProxy("System-Gateway")
                .build());

        return saved;
    }
}

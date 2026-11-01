package com.yahoo.auction.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid_orders", indexes = {
    @Index(name = "idx_bid_order_status", columnList = "status"),
    @Index(name = "idx_bid_order_num", columnList = "order_number", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private ClientUser client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auction_id", nullable = false)
    private AuctionItem auction;

    @Column(name = "max_bid_yen", precision = 14, scale = 0, nullable = false)
    private BigDecimal maxBidYen;

    @Column(name = "current_placed_bid_yen", precision = 14, scale = 0, nullable = false)
    @Builder.Default
    private BigDecimal currentPlacedBidYen = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BidStrategy strategy = BidStrategy.YAHOO_AUTO_BID;

    @Column(name = "snipe_seconds_before_end", nullable = false)
    @Builder.Default
    private Integer snipeSecondsBeforeEnd = 8;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BidOrderStatus status = BidOrderStatus.PENDING;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_account_id")
    private YahooAccount assignedAccount;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}


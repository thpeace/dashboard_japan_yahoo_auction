package com.yahoo.auction.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction_items", indexes = {
    @Index(name = "idx_yahoo_auction_id", columnList = "yahoo_auction_id", unique = true),
    @Index(name = "idx_auction_status", columnList = "status"),
    @Index(name = "idx_auction_end_time", columnList = "end_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "yahoo_auction_id", nullable = false, unique = true, length = 50)
    private String yahooAuctionId;

    @Column(name = "title_jp", nullable = false, length = 500)
    private String titleJp;

    @Column(name = "title_en", length = 500)
    private String titleEn;

    @Column(name = "seller_id", length = 100)
    private String sellerId;

    @Column(name = "current_price_yen", precision = 14, scale = 0, nullable = false)
    @Builder.Default
    private BigDecimal currentPriceYen = BigDecimal.ZERO;

    @Column(name = "buyout_price_yen", precision = 14, scale = 0)
    private BigDecimal buyoutPriceYen;

    @Column(name = "bid_count", nullable = false)
    @Builder.Default
    private Integer bidCount = 0;

    @Column(length = 100)
    private String category;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "description_jp", columnDefinition = "TEXT")
    private String descriptionJp;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.ACTIVE;

    @Column(name = "winning_bidder", length = 100)
    private String winningBidder;

    @Column(name = "is_snipe_armed")
    @Builder.Default
    private Boolean isSnipeArmed = false;

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


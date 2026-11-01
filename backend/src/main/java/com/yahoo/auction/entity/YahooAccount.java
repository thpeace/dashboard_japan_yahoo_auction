package com.yahoo.auction.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "yahoo_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YahooAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "session_cookie", columnDefinition = "TEXT")
    private String sessionCookie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(name = "proxy_ip", length = 100)
    private String proxyIp;

    @Column(name = "balance_yen", precision = 14, scale = 0, nullable = false)
    @Builder.Default
    private BigDecimal balanceYen = BigDecimal.ZERO;

    @Column(name = "daily_bid_count", nullable = false)
    @Builder.Default
    private Integer dailyBidCount = 0;

    @Column(name = "max_daily_bids", nullable = false)
    @Builder.Default
    private Integer maxDailyBids = 50;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "last_cookie_refresh")
    private LocalDateTime lastCookieRefresh;

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.lastCookieRefresh == null) {
            this.lastCookieRefresh = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

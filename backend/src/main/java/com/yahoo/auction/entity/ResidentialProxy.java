package com.yahoo.auction.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "residential_proxies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentialProxy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", nullable = false, length = 100)
    private String ipAddress;

    @Column(nullable = false)
    private Integer port;

    @Column(length = 100)
    private String region; // e.g. "Tokyo, Japan", "Osaka, Japan"

    @Column(length = 100)
    private String provider; // e.g. "BrightData JP Residential", "Oxylabs Tokyo"

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ProxyStatus status = ProxyStatus.HEALTHY;

    @Column(name = "last_checked_at")
    private LocalDateTime lastCheckedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        if (this.lastCheckedAt == null) {
            this.lastCheckedAt = LocalDateTime.now();
        }
    }
}


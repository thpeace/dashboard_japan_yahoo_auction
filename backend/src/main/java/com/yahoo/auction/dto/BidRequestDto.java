package com.yahoo.auction.dto;

import com.yahoo.auction.entity.BidStrategy;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidRequestDto {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Max bid amount is required")
    @DecimalMin(value = "1.0", message = "Max bid must be at least 1 Yen")
    private BigDecimal maxBidYen;

    @Builder.Default
    private BidStrategy strategy = BidStrategy.YAHOO_AUTO_BID;

    @Builder.Default
    private Integer snipeSecondsBeforeEnd = 8;
}


package com.yahoo.auction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletDepositDto {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "Deposit amount is required")
    @DecimalMin(value = "100.0", message = "Deposit must be at least 100")
    private BigDecimal amount;

    @Builder.Default
    private String currency = "JPY";

    private String notes;
}


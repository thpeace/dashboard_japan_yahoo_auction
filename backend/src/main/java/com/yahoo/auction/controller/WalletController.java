package com.yahoo.auction.controller;

import com.yahoo.auction.dto.WalletDepositDto;
import com.yahoo.auction.entity.ClientUser;
import com.yahoo.auction.entity.WalletTransaction;
import com.yahoo.auction.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "Endpoints for client balance, deposits, and transaction ledger")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/{clientId}")
    @Operation(summary = "Get client user information and wallet balance")
    public ResponseEntity<ClientUser> getClientWallet(@PathVariable Long clientId) {
        return ResponseEntity.ok(walletService.getClient(clientId));
    }

    @GetMapping("/{clientId}/transactions")
    @Operation(summary = "Get transaction history for a client")
    public ResponseEntity<List<WalletTransaction>> getTransactions(@PathVariable Long clientId) {
        return ResponseEntity.ok(walletService.getTransactions(clientId));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Top up funds into client balance")
    public ResponseEntity<ClientUser> deposit(@Valid @RequestBody WalletDepositDto dto) {
        return ResponseEntity.ok(walletService.deposit(dto));
    }
}


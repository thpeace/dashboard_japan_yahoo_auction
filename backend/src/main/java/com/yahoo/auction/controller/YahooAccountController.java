package com.yahoo.auction.controller;

import com.yahoo.auction.entity.AccountStatus;
import com.yahoo.auction.entity.YahooAccount;
import com.yahoo.auction.service.YahooAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Yahoo Accounts", description = "Endpoints for managing company Yahoo Japan bidding accounts")
public class YahooAccountController {

    private final YahooAccountService accountService;

    @GetMapping
    @Operation(summary = "List all registered company Yahoo accounts")
    public ResponseEntity<List<YahooAccount>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single account details")
    public ResponseEntity<YahooAccount> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update account status (ACTIVE, SMS_VERIFICATION_REQUIRED, SUSPENDED)")
    public ResponseEntity<YahooAccount> updateStatus(
            @PathVariable Long id,
            @RequestParam AccountStatus status) {
        return ResponseEntity.ok(accountService.updateStatus(id, status));
    }

    @PostMapping("/{id}/refresh-session")
    @Operation(summary = "Verify & refresh Yahoo Japan session cookies")
    public ResponseEntity<YahooAccount> refreshSession(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.refreshSessionCookie(id));
    }

    @PostMapping
    @Operation(summary = "Register a new company Yahoo account")
    public ResponseEntity<YahooAccount> createAccount(@RequestBody YahooAccount account) {
        return ResponseEntity.ok(accountService.createAccount(account));
    }
}


package com.yahoo.auction.service;

import com.yahoo.auction.dto.WalletDepositDto;
import com.yahoo.auction.entity.ClientUser;
import com.yahoo.auction.entity.TransactionType;
import com.yahoo.auction.entity.WalletTransaction;
import com.yahoo.auction.repository.ClientUserRepository;
import com.yahoo.auction.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final ClientUserRepository clientUserRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public ClientUser getClient(Long clientId) {
        return clientUserRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found: " + clientId));
    }

    public List<WalletTransaction> getTransactions(Long clientId) {
        return walletTransactionRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    @Transactional
    public ClientUser deposit(WalletDepositDto dto) {
        ClientUser client = getClient(dto.getClientId());
        client.setWalletBalanceYen(client.getWalletBalanceYen().add(dto.getAmount()));
        client.setUpdatedAt(LocalDateTime.now());
        ClientUser saved = clientUserRepository.save(client);

        walletTransactionRepository.save(WalletTransaction.builder()
                .client(client)
                .amount(dto.getAmount())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "JPY")
                .type(TransactionType.DEPOSIT)
                .referenceId("DEP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .notes(dto.getNotes() != null ? dto.getNotes() : "Instant top-up via Bank Wire / Stripe")
                .build());

        return saved;
    }
}

package com.yahoo.auction.repository;

import com.yahoo.auction.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByClientIdOrderByCreatedAtDesc(Long clientId);
    Page<WalletTransaction> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
}


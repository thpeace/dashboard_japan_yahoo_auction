package com.yahoo.auction.repository;

import com.yahoo.auction.entity.BiddingAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BiddingAuditLogRepository extends JpaRepository<BiddingAuditLog, Long> {
    List<BiddingAuditLog> findTop20ByOrderByLoggedAtDesc();

    List<BiddingAuditLog> findByAuctionIdOrderByLoggedAtDesc(Long auctionId);

    Page<BiddingAuditLog> findAllByOrderByLoggedAtDesc(Pageable pageable);
}

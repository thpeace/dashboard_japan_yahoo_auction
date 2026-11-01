package com.yahoo.auction.repository;

import com.yahoo.auction.entity.AuctionItem;
import com.yahoo.auction.entity.AuctionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionItemRepository extends JpaRepository<AuctionItem, Long>, JpaSpecificationExecutor<AuctionItem> {
    Optional<AuctionItem> findByYahooAuctionId(String yahooAuctionId);
    
    List<AuctionItem> findByStatus(AuctionStatus status);
    
    List<AuctionItem> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime threshold);
}

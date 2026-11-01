package com.yahoo.auction.repository;

import com.yahoo.auction.entity.BidOrder;
import com.yahoo.auction.entity.BidOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidOrderRepository extends JpaRepository<BidOrder, Long>, JpaSpecificationExecutor<BidOrder> {
    Optional<BidOrder> findByOrderNumber(String orderNumber);
    List<BidOrder> findByClientId(Long clientId);
    List<BidOrder> findByAuctionId(Long auctionId);
    List<BidOrder> findByStatus(BidOrderStatus status);

    long countByStatus(BidOrderStatus status);
}

package com.yahoo.auction.service;

import com.yahoo.auction.entity.AuctionItem;
import com.yahoo.auction.entity.AuctionStatus;
import com.yahoo.auction.entity.BiddingAuditLog;
import com.yahoo.auction.repository.AuctionItemRepository;
import com.yahoo.auction.repository.BiddingAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {

    private final AuctionItemRepository auctionItemRepository;
    private final BiddingAuditLogRepository auditLogRepository;
    private final Random random = new Random();

    public Page<AuctionItem> searchAuctions(String keyword, String category, AuctionStatus status, Pageable pageable) {
        Specification<AuctionItem> spec = Specification.where(null);
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = "%" + keyword.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("titleJp")), kw),
                    cb.like(cb.lower(root.get("titleEn")), kw),
                    cb.like(cb.lower(root.get("yahooAuctionId")), kw)
            ));
        }
        if (category != null && !category.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category.trim()));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        return auctionItemRepository.findAll(spec, pageable);
    }

    public List<AuctionItem> getAllActiveAuctions() {
        return auctionItemRepository.findByStatus(AuctionStatus.ACTIVE);
    }

    public AuctionItem getAuctionById(Long id) {
        return auctionItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found with ID: " + id));
    }

    public AuctionItem getByYahooId(String yahooAuctionId) {
        return auctionItemRepository.findByYahooAuctionId(yahooAuctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found with Yahoo ID: " + yahooAuctionId));
    }

    @Transactional
    public AuctionItem createOrTrackAuction(AuctionItem item) {
        if (item.getEndTime() == null) {
            item.setEndTime(LocalDateTime.now().plusHours(24));
        }
        if (item.getStatus() == null) {
            item.setStatus(AuctionStatus.ACTIVE);
        }
        AuctionItem saved = auctionItemRepository.save(item);
        
        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(saved.getId())
                .action("AUCTION_TRACKED")
                .details("Registered Yahoo Auction ID " + saved.getYahooAuctionId() + " into proxy monitoring engine.")
                .executedByProxy("Residential-JP-Tokyo")
                .build());

        return saved;
    }

    @Transactional
    public AuctionItem refreshAuction(Long id) {
        AuctionItem auction = getAuctionById(id);
        
        // Simulate live scrape poll
        int increment = (random.nextInt(3) + 1) * 500;
        auction.setCurrentPriceYen(auction.getCurrentPriceYen().add(BigDecimal.valueOf(increment)));
        auction.setBidCount(auction.getBidCount() + 1);
        auction.setUpdatedAt(LocalDateTime.now());
        
        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(auction.getId())
                .action("PRICE_POLL")
                .details("Scraped Yahoo Japan for " + auction.getYahooAuctionId() + ". New price: ¥" + auction.getCurrentPriceYen() + " (" + auction.getBidCount() + " bids)")
                .executedByProxy("Tokyo-Node-01")
                .build());

        return auctionItemRepository.save(auction);
    }
}

package com.yahoo.auction.controller;

import com.yahoo.auction.entity.AuctionItem;
import com.yahoo.auction.entity.AuctionStatus;
import com.yahoo.auction.service.AuctionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@Tag(name = "Auctions", description = "Yahoo Japan Auction catalog & live monitoring endpoints")
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping
    @Operation(summary = "Search and list auctions with filtering")
    public ResponseEntity<Page<AuctionItem>> getAuctions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) AuctionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "endTime") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<AuctionItem> results = auctionService.searchAuctions(keyword, category, status, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single auction details")
    public ResponseEntity<AuctionItem> getAuctionById(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @GetMapping("/yahoo/{yahooAuctionId}")
    @Operation(summary = "Get auction by Yahoo Auction ID")
    public ResponseEntity<AuctionItem> getByYahooId(@PathVariable String yahooAuctionId) {
        return ResponseEntity.ok(auctionService.getByYahooId(yahooAuctionId));
    }

    @PostMapping
    @Operation(summary = "Register/Track a new Yahoo Japan auction")
    public ResponseEntity<AuctionItem> trackAuction(@RequestBody AuctionItem item) {
        return ResponseEntity.ok(auctionService.createOrTrackAuction(item));
    }

    @PostMapping("/{id}/refresh")
    @Operation(summary = "Poll/Scrape latest price and bid count for auction")
    public ResponseEntity<AuctionItem> refreshAuction(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.refreshAuction(id));
    }
}


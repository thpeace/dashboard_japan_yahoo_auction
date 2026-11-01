package com.yahoo.auction.controller;

import com.yahoo.auction.dto.BidRequestDto;
import com.yahoo.auction.entity.BidOrder;
import com.yahoo.auction.entity.BidOrderStatus;
import com.yahoo.auction.service.BidOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@Tag(name = "Bidding Orders", description = "Endpoints for proxy and sniper bidding operations")
public class BidOrderController {

    private final BidOrderService bidOrderService;

    @GetMapping
    @Operation(summary = "Get list of bidding orders")
    public ResponseEntity<Page<BidOrder>> getOrders(
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) BidOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(bidOrderService.getOrders(clientId, status, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get orders placed by specific client")
    public ResponseEntity<List<BidOrder>> getClientOrders(@PathVariable Long clientId) {
        return ResponseEntity.ok(bidOrderService.getOrdersByClient(clientId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bid order details")
    public ResponseEntity<BidOrder> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(bidOrderService.getOrderById(id));
    }

    @PostMapping
    @Operation(summary = "Submit a new auto-bid or sniper request")
    public ResponseEntity<BidOrder> placeBid(@Valid @RequestBody BidRequestDto request) {
        return ResponseEntity.ok(bidOrderService.placeBid(request));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a bid order and release escrowed balance")
    public ResponseEntity<BidOrder> cancelBid(@PathVariable Long id) {
        return ResponseEntity.ok(bidOrderService.cancelBid(id));
    }

    @PostMapping("/{id}/execute-snipe")
    @Operation(summary = "Manually trigger sniper bot execution")
    public ResponseEntity<BidOrder> executeSnipe(@PathVariable Long id) {
        return ResponseEntity.ok(bidOrderService.executeSnipe(id));
    }
}


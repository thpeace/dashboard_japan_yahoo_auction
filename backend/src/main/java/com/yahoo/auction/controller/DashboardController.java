package com.yahoo.auction.controller;

import com.yahoo.auction.dto.DashboardStatsDto;
import com.yahoo.auction.entity.BiddingAuditLog;
import com.yahoo.auction.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints for proxy system health, KPIs, and audit trails")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get aggregated KPI statistics")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/logs")
    @Operation(summary = "Get recent bidding engine audit logs")
    public ResponseEntity<List<BiddingAuditLog>> getLogs() {
        return ResponseEntity.ok(dashboardService.getRecentLogs());
    }
}


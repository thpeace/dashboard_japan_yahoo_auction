package com.yahoo.auction.controller;

import com.yahoo.auction.entity.ResidentialProxy;
import com.yahoo.auction.service.ProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proxies")
@RequiredArgsConstructor
@Tag(name = "Residential Proxies", description = "Endpoints for managing Japanese residential proxy pool")
public class ProxyController {

    private final ProxyService proxyService;

    @GetMapping
    @Operation(summary = "List all Japanese residential proxies in the pool")
    public ResponseEntity<List<ResidentialProxy>> getAllProxies() {
        return ResponseEntity.ok(proxyService.getAllProxies());
    }

    @PostMapping("/check-all")
    @Operation(summary = "Ping and re-verify latency for all proxy nodes")
    public ResponseEntity<String> checkAll() {
        proxyService.testAndRefreshAll();
        return ResponseEntity.ok("Proxy pool health check completed");
    }
}


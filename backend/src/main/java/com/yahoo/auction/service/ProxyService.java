package com.yahoo.auction.service;

import com.yahoo.auction.entity.ProxyStatus;
import com.yahoo.auction.entity.ResidentialProxy;
import com.yahoo.auction.repository.ResidentialProxyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ProxyService {

    private final ResidentialProxyRepository proxyRepository;
    private final Random random = new Random();

    public List<ResidentialProxy> getAllProxies() {
        return proxyRepository.findAll();
    }

    @Transactional
    public void testAndRefreshAll() {
        List<ResidentialProxy> proxies = proxyRepository.findAll();
        for (ResidentialProxy p : proxies) {
            int latency = 25 + random.nextInt(45);
            p.setLatencyMs(latency);
            p.setStatus(latency > 150 ? ProxyStatus.HIGH_LATENCY : ProxyStatus.HEALTHY);
            p.setLastCheckedAt(LocalDateTime.now());
        }
        proxyRepository.saveAll(proxies);
    }
}

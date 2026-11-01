package com.yahoo.auction.repository;

import com.yahoo.auction.entity.ProxyStatus;
import com.yahoo.auction.entity.ResidentialProxy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidentialProxyRepository extends JpaRepository<ResidentialProxy, Long> {
    List<ResidentialProxy> findByStatus(ProxyStatus status);
}


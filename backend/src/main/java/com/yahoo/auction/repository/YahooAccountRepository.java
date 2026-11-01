package com.yahoo.auction.repository;

import com.yahoo.auction.entity.AccountStatus;
import com.yahoo.auction.entity.YahooAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YahooAccountRepository extends JpaRepository<YahooAccount, Long> {
    Optional<YahooAccount> findByUsername(String username);

    List<YahooAccount> findByStatus(AccountStatus status);
}

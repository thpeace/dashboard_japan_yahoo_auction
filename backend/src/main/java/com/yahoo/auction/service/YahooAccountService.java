package com.yahoo.auction.service;

import com.yahoo.auction.entity.AccountStatus;
import com.yahoo.auction.entity.BiddingAuditLog;
import com.yahoo.auction.entity.YahooAccount;
import com.yahoo.auction.repository.BiddingAuditLogRepository;
import com.yahoo.auction.repository.YahooAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class YahooAccountService {

    private final YahooAccountRepository yahooAccountRepository;
    private final BiddingAuditLogRepository auditLogRepository;

    public List<YahooAccount> getAllAccounts() {
        return yahooAccountRepository.findAll();
    }

    public YahooAccount getAccountById(Long id) {
        return yahooAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Yahoo account not found with ID: " + id));
    }

    @Transactional
    public YahooAccount updateStatus(Long id, AccountStatus status) {
        YahooAccount account = getAccountById(id);
        account.setStatus(status);
        account.setUpdatedAt(LocalDateTime.now());

        auditLogRepository.save(BiddingAuditLog.builder()
                .action("ACCOUNT_STATUS_CHANGE")
                .details("Account " + account.getUsername() + " status changed to " + status)
                .executedByProxy(account.getProxyIp())
                .build());

        return yahooAccountRepository.save(account);
    }

    @Transactional
    public YahooAccount refreshSessionCookie(Long id) {
        YahooAccount account = getAccountById(id);
        account.setLastCookieRefresh(LocalDateTime.now());
        account.setStatus(AccountStatus.ACTIVE);

        auditLogRepository.save(BiddingAuditLog.builder()
                .action("COOKIE_VERIFY")
                .details("Headless browser refreshed session cookies for " + account.getUsername()
                        + " via residential proxy " + account.getProxyIp())
                .executedByProxy(account.getProxyIp())
                .build());

        return yahooAccountRepository.save(account);
    }

    @Transactional
    public YahooAccount createAccount(YahooAccount account) {
        return yahooAccountRepository.save(account);
    }
}

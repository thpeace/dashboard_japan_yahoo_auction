package com.yahoo.auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YahooAuctionProxyApplication {

    public static void main(String[] args) {
        SpringApplication.run(YahooAuctionProxyApplication.class, args);
    }
}


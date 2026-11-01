package com.yahoo.auction.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Yahoo Japan Auction Proxy & Auto-Bidding API")
                        .version("1.0.0")
                        .description("Microservice architecture for managing company Yahoo accounts, monitoring auctions, executing auto-bids, and sniper bot schedules.")
                        .contact(new Contact().name("System Engineering Team").email("proxy-admin@auction-jp.internal"))
                        .license(new License().name("Proprietary System 2026")));
    }
}


package com.yahoo.auction.config;

import com.yahoo.auction.entity.*;
import com.yahoo.auction.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ClientUserRepository clientUserRepository;
    private final YahooAccountRepository yahooAccountRepository;
    private final ResidentialProxyRepository residentialProxyRepository;
    private final AuctionItemRepository auctionItemRepository;
    private final BidOrderRepository bidOrderRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BiddingAuditLogRepository auditLogRepository;

    @Override
    public void run(String... args) {
        if (clientUserRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data population.");
            return;
        }

        log.info("Starting initial seed data population for Yahoo Auction Proxy...");

        // 1. Seed Client Users
        ClientUser client1 = clientUserRepository.save(ClientUser.builder()
                .username("alex_collector")
                .email("alex@tokyo-import.com")
                .fullName("Alex Rivera")
                .walletBalanceUsd(new BigDecimal("3500.00"))
                .walletBalanceYen(new BigDecimal("550000"))
                .role(UserRole.CLIENT)
                .build());

        ClientUser client2 = clientUserRepository.save(ClientUser.builder()
                .username("kenji_dealer")
                .email("kenji@osaka-vintage.jp")
                .fullName("Kenji Sato")
                .walletBalanceUsd(new BigDecimal("8200.00"))
                .walletBalanceYen(new BigDecimal("1280000"))
                .role(UserRole.CLIENT)
                .build());

        ClientUser adminUser = clientUserRepository.save(ClientUser.builder()
                .username("proxy_operator_1")
                .email("admin@auctionproxy.internal")
                .fullName("Operations Lead")
                .walletBalanceUsd(new BigDecimal("0.00"))
                .walletBalanceYen(new BigDecimal("0"))
                .role(UserRole.OPERATOR)
                .build());

        // Initial wallet transactions for Client 1
        walletTransactionRepository.save(WalletTransaction.builder()
                .client(client1)
                .amount(new BigDecimal("550000"))
                .currency("JPY")
                .type(TransactionType.DEPOSIT)
                .referenceId("DEP-INIT-001")
                .notes("Initial account funding via Japanese Wire Transfer")
                .build());

        // 2. Seed Company Yahoo Accounts (Proxy Model: 1-3 vetted accounts)
        YahooAccount acct1 = yahooAccountRepository.save(YahooAccount.builder()
                .username("yj_corp_alpha_tokyo")
                .sessionCookie("T_COOKIE=eyJzZXNzaW9uSWQiOiJ5al9hbHBoYV85OTIifQ==; Y_AUTH=verified_tokyo_01")
                .status(AccountStatus.ACTIVE)
                .proxyIp("163.43.112.44:3128 (Tokyo)")
                .balanceYen(new BigDecimal("3200000"))
                .dailyBidCount(14)
                .maxDailyBids(50)
                .lastUsedAt(LocalDateTime.now().minusMinutes(12))
                .lastCookieRefresh(LocalDateTime.now().minusHours(2))
                .notes("Primary high-limit corporate Yahoo Japan verified bidding account")
                .build());

        YahooAccount acct2 = yahooAccountRepository.save(YahooAccount.builder()
                .username("yj_corp_beta_osaka")
                .sessionCookie("T_COOKIE=eyJzZXNzaW9uSWQiOiJ5al9iZXRhXzg4MSJ9; Y_AUTH=verified_osaka_02")
                .status(AccountStatus.ACTIVE)
                .proxyIp("133.242.18.90:3128 (Osaka)")
                .balanceYen(new BigDecimal("1850000"))
                .dailyBidCount(8)
                .maxDailyBids(50)
                .lastUsedAt(LocalDateTime.now().minusMinutes(45))
                .lastCookieRefresh(LocalDateTime.now().minusHours(4))
                .notes("Secondary backup account for Kansai auctions")
                .build());

        YahooAccount acct3 = yahooAccountRepository.save(YahooAccount.builder()
                .username("yj_corp_gamma_fukuoka")
                .sessionCookie("T_COOKIE=expired_or_pending; Y_AUTH=sms_required")
                .status(AccountStatus.SMS_VERIFICATION_REQUIRED)
                .proxyIp("150.95.140.21:3128 (Fukuoka)")
                .balanceYen(new BigDecimal("940000"))
                .dailyBidCount(0)
                .maxDailyBids(50)
                .lastUsedAt(LocalDateTime.now().minusDays(1))
                .lastCookieRefresh(LocalDateTime.now().minusDays(1))
                .notes("Requires Japan SMS re-verification token before dispatching bids")
                .build());

        // 3. Seed Japanese Residential Proxies
        residentialProxyRepository.saveAll(List.of(
                ResidentialProxy.builder()
                        .ipAddress("163.43.112.44")
                        .port(3128)
                        .region("Tokyo, Japan")
                        .provider("BrightData Residential JP")
                        .latencyMs(32)
                        .status(ProxyStatus.HEALTHY)
                        .build(),
                ResidentialProxy.builder()
                        .ipAddress("133.242.18.90")
                        .port(3128)
                        .region("Osaka, Japan")
                        .provider("Oxylabs Residential Tokyo/Osaka")
                        .latencyMs(41)
                        .status(ProxyStatus.HEALTHY)
                        .build(),
                ResidentialProxy.builder()
                        .ipAddress("150.95.140.21")
                        .port(3128)
                        .region("Fukuoka, Japan")
                        .provider("Smartproxy JP Pool")
                        .latencyMs(48)
                        .status(ProxyStatus.HEALTHY)
                        .build(),
                ResidentialProxy.builder()
                        .ipAddress("210.140.10.88")
                        .port(3128)
                        .region("Nagoya, Japan")
                        .provider("IPRoyal Residential JP")
                        .latencyMs(65)
                        .status(ProxyStatus.HEALTHY)
                        .build()
        ));

        // 4. Seed Yahoo Japan Auction Items (Realistic high-demand Japanese items)
        AuctionItem item1 = auctionItemRepository.save(AuctionItem.builder()
                .yahooAuctionId("m1092837190")
                .titleJp("グランドセイコー Grand Seiko ヘリテージ スノーフレーク SBGA211 スプリングドライブ 極美品 箱保付")
                .titleEn("Grand Seiko Heritage Collection Snowflake SBGA211 Spring Drive - Mint Condition Box & Papers")
                .sellerId("ginza_rasin_watch")
                .currentPriceYen(new BigDecimal("485000"))
                .buyoutPriceYen(new BigDecimal("550000"))
                .bidCount(42)
                .category("Watches & Jewelry")
                .imageUrl("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80")
                .descriptionJp("国内正規店購入品。チタンケース、スノーフレーク文字盤。日差良好、目立つ傷のない極上品です。付属品全て完備。")
                .descriptionEn("Purchased from authorized domestic boutique. High-intensity titanium case with iconic textured snowflake dial. Running flawlessly with full set.")
                .startTime(LocalDateTime.now().minusDays(3))
                .endTime(LocalDateTime.now().plusHours(3).plusMinutes(24))
                .status(AuctionStatus.ACTIVE)
                .winningBidder(acct1.getUsername())
                .isSnipeArmed(false)
                .build());

        AuctionItem item2 = auctionItemRepository.save(AuctionItem.builder()
                .yahooAuctionId("v1089234811")
                .titleJp("アルター Fate/Grand Order ライダー/アルトリア・ペンドラゴン [サンタオルタ] 1/7 未開封新品")
                .titleEn("Alter Fate/Grand Order Rider/Artoria Pendragon [Santa Alter] 1/7 Scale Figure - Brand New Sealed")
                .sellerId("akiba_hobby_japan")
                .currentPriceYen(new BigDecimal("28500"))
                .buyoutPriceYen(new BigDecimal("35000"))
                .bidCount(18)
                .category("Figures & Anime")
                .imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80")
                .descriptionJp("暗所にて大切に保管しておりました国内正規品です。薄紙付きの完全未開封品になります。")
                .descriptionEn("Authentic Japanese edition carefully preserved in climate-controlled dark storage. Factory thin paper intact.")
                .startTime(LocalDateTime.now().minusDays(2))
                .endTime(LocalDateTime.now().plusHours(1).plusMinutes(15))
                .status(AuctionStatus.ACTIVE)
                .winningBidder("hobby_hunter_jp")
                .isSnipeArmed(true)
                .build());

        AuctionItem item3 = auctionItemRepository.save(AuctionItem.builder()
                .yahooAuctionId("r1076542199")
                .titleJp("ニンテンドー64DD ランドネット 拡張キット 本体一式 元箱 取扱説明書付き 動作確認済み 希少")
                .titleEn("Nintendo 64DD Randnet Expansion Kit Console Complete in Box - Tested & Fully Working Rare")
                .sellerId("super_potato_retro")
                .currentPriceYen(new BigDecimal("142000"))
                .buyoutPriceYen(new BigDecimal("180000"))
                .bidCount(27)
                .category("Retro Gaming")
                .imageUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80")
                .descriptionJp("希少な64DD本体セットです。磁気ディスク読み込みテスト正常完了。マザーユニットとの接続動作も良好です。")
                .descriptionEn("Extremely rare magnetic disk 64DD peripheral. Disk head tracking and motor verified. Complete with Randnet disc and accessories.")
                .startTime(LocalDateTime.now().minusDays(4))
                .endTime(LocalDateTime.now().plusMinutes(28))
                .status(AuctionStatus.ACTIVE)
                .winningBidder(acct1.getUsername())
                .isSnipeArmed(true)
                .build());

        AuctionItem item4 = auctionItemRepository.save(AuctionItem.builder()
                .yahooAuctionId("k1098451203")
                .titleJp("ライカ Leica M3 シングルストローク 後期型 100万番台 元箱付 シャッター快調 ドイツ製")
                .titleEn("Leica M3 Single Stroke Late Serial 1,000,000+ Range with Original Box - Working Shutter")
                .sellerId("ginza_camera_do")
                .currentPriceYen(new BigDecimal("320000"))
                .buyoutPriceYen(null)
                .bidCount(35)
                .category("Vintage Cameras")
                .imageUrl("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80")
                .descriptionJp("シリアル100万番台、人気のシングルストロークモデル。ファインダー二重像合致、全速シャッター切れております。")
                .descriptionEn("Late production single stroke Leica M3. Clear double image coincidence in rangefinder, curtain speeds tested within specification.")
                .startTime(LocalDateTime.now().minusDays(1))
                .endTime(LocalDateTime.now().plusHours(18))
                .status(AuctionStatus.ACTIVE)
                .winningBidder("vintage_shutter_jp")
                .isSnipeArmed(false)
                .build());

        AuctionItem item5 = auctionItemRepository.save(AuctionItem.builder()
                .yahooAuctionId("n1067823901")
                .titleJp("NISMO 日産純正 R34 スカイライン GT-R 320km/h フルスケール ホワイトメーター 美品 実動品")
                .titleEn("NISMO Genuine Nissan R34 Skyline GT-R 320km/h Full Scale White Speedometer Cluster - Mint Condition")
                .sellerId("jdm_tuning_garage")
                .currentPriceYen(new BigDecimal("210000"))
                .buyoutPriceYen(new BigDecimal("260000"))
                .bidCount(19)
                .category("JDM Automotive")
                .imageUrl("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80")
                .descriptionJp("BNR34 V-spec II 取り外し。実走行距離表示確認済み。液晶抜けなし、照明点灯良好です。")
                .descriptionEn("Dismantled from authentic BNR34 V-spec II. Backlight and gauge stepped motors fully verified.")
                .startTime(LocalDateTime.now().minusDays(5))
                .endTime(LocalDateTime.now().plusHours(8))
                .status(AuctionStatus.ACTIVE)
                .winningBidder(acct2.getUsername())
                .isSnipeArmed(false)
                .build());

        AuctionItem item6 = auctionItemRepository.save(AuctionItem.builder()
                .yahooAuctionId("p1054321980")
                .titleJp("プレイステーション2 オーシャンブルー ゼンブラック SCPH-37000 本体 コントローラー付き")
                .titleEn("PlayStation 2 Ocean Blue Limited Edition SCPH-37000 Console - Japan Exclusive Complete")
                .sellerId("retro_osaka_store")
                .currentPriceYen(new BigDecimal("24000"))
                .buyoutPriceYen(new BigDecimal("30000"))
                .bidCount(12)
                .category("Retro Gaming")
                .imageUrl("https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&auto=format&fit=crop&q=80")
                .descriptionJp("日本限定スケルトンカラーのオーシャンブルーPS2本体です。DVD、PS1、PS2ディスク全読込確認済み。")
                .descriptionEn("Japan exclusive translucent ocean blue edition. Optical drive laser calibrated to read PS1 and PS2 discs seamlessly.")
                .startTime(LocalDateTime.now().minusDays(6))
                .endTime(LocalDateTime.now().minusHours(1))
                .status(AuctionStatus.WON_BY_US)
                .winningBidder(acct1.getUsername())
                .isSnipeArmed(false)
                .build());

        // 5. Seed Bid Orders
        bidOrderRepository.save(BidOrder.builder()
                .orderNumber("ORD-2026-GS01")
                .client(client1)
                .auction(item1)
                .maxBidYen(new BigDecimal("500000"))
                .currentPlacedBidYen(new BigDecimal("485000"))
                .strategy(BidStrategy.YAHOO_AUTO_BID)
                .snipeSecondsBeforeEnd(8)
                .status(BidOrderStatus.WINNING)
                .assignedAccount(acct1)
                .build());

        bidOrderRepository.save(BidOrder.builder()
                .orderNumber("ORD-2026-N64DD")
                .client(client1)
                .auction(item3)
                .maxBidYen(new BigDecimal("160000"))
                .currentPlacedBidYen(new BigDecimal("142000"))
                .strategy(BidStrategy.SNIPER_BOT)
                .snipeSecondsBeforeEnd(6)
                .status(BidOrderStatus.SCHEDULED)
                .assignedAccount(acct1)
                .build());

        bidOrderRepository.save(BidOrder.builder()
                .orderNumber("ORD-2026-PS2WIN")
                .client(client2)
                .auction(item6)
                .maxBidYen(new BigDecimal("28000"))
                .currentPlacedBidYen(new BigDecimal("24000"))
                .strategy(BidStrategy.YAHOO_AUTO_BID)
                .snipeSecondsBeforeEnd(8)
                .status(BidOrderStatus.WON)
                .assignedAccount(acct1)
                .build());

        // 6. Seed Bidding Audit Logs
        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(item1.getId())
                .action("PRICE_POLL")
                .details("Polled Yahoo Japan auction m1092837190. Current price: ¥485,000, 42 bids.")
                .executedByProxy(acct1.getProxyIp())
                .build());

        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(item1.getId())
                .action("AUTO_BID_SUBMIT")
                .details("Dispatched Yahoo native auto-bid incremental ceiling ¥500,000 for client alex_collector.")
                .executedByProxy(acct1.getProxyIp())
                .build());

        auditLogRepository.save(BiddingAuditLog.builder()
                .auctionId(item3.getId())
                .action("SNIPER_ARMED")
                .details("Sniper Bot armed for N64DD (r1076542199). Target dispatch: T-6 seconds before auction close.")
                .executedByProxy(acct1.getProxyIp())
                .build());

        log.info("Seed data population successfully finished!");
    }
}


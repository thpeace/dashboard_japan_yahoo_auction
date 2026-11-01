export type AuctionStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'WON_BY_US' | 'LOST';
export type BidStrategy = 'YAHOO_AUTO_BID' | 'SNIPER_BOT';
export type BidOrderStatus = 'PENDING' | 'SCHEDULED' | 'PLACING_BID' | 'WINNING' | 'OUTBID' | 'WON' | 'LOST' | 'CANCELLED';
export type AccountStatus = 'ACTIVE' | 'SMS_VERIFICATION_REQUIRED' | 'SUSPENDED' | 'RATE_LIMITED';
export type ProxyStatus = 'HEALTHY' | 'HIGH_LATENCY' | 'OFFLINE';
export type TransactionType = 'DEPOSIT' | 'BID_HOLD' | 'BID_RELEASE' | 'PURCHASE_SETTLEMENT' | 'REFUND';

export interface AuctionItem {
  id: number;
  yahooAuctionId: string;
  titleJp: string;
  titleEn: string;
  sellerId: string;
  currentPriceYen: number;
  buyoutPriceYen: number | null;
  bidCount: number;
  category: string;
  imageUrl: string;
  descriptionJp: string;
  descriptionEn: string;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  winningBidder: string | null;
  isSnipeArmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  walletBalanceUsd: number;
  walletBalanceYen: number;
  role: string;
  createdAt: string;
}

export interface YahooAccount {
  id: number;
  username: string;
  sessionCookie: string;
  status: AccountStatus;
  proxyIp: string;
  balanceYen: number;
  dailyBidCount: number;
  maxDailyBids: number;
  lastUsedAt: string | null;
  lastCookieRefresh: string | null;
  notes: string | null;
}

export interface BidOrder {
  id: number;
  orderNumber: string;
  client: ClientUser;
  auction: AuctionItem;
  maxBidYen: number;
  currentPlacedBidYen: number;
  strategy: BidStrategy;
  snipeSecondsBeforeEnd: number;
  status: BidOrderStatus;
  assignedAccount: YahooAccount | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResidentialProxy {
  id: number;
  ipAddress: string;
  port: number;
  region: string;
  provider: string;
  latencyMs: number;
  status: ProxyStatus;
  lastCheckedAt: string;
}

export interface BiddingAuditLog {
  id: number;
  auctionId: number | null;
  bidOrderId: number | null;
  action: string;
  details: string;
  executedByProxy: string | null;
  loggedAt: string;
}

export interface DashboardStats {
  totalAuctionsTracked: number;
  activeBidsCount: number;
  wonAuctionsCount: number;
  lostAuctionsCount: number;
  totalFundsEscrowedYen: number;
  healthyProxiesCount: number;
  totalProxiesCount: number;
  activeYahooAccountsCount: number;
  totalYahooAccountsCount: number;
  winRatePercentage: number;
}

export interface WalletTransaction {
  id: number;
  client: ClientUser;
  amount: number;
  currency: string;
  type: TransactionType;
  referenceId: string;
  notes: string;
  createdAt: string;
}


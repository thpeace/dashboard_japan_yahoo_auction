import {
  AuctionItem,
  BidOrder,
  ClientUser,
  DashboardStats,
  ResidentialProxy,
  YahooAccount,
  BiddingAuditLog,
  WalletTransaction,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api";

export async function fetchAuctions(params?: {
  keyword?: string;
  category?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<{ content: AuctionItem[]; totalElements: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 12));

  const res = await fetch(`${BASE_URL}/auctions?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch auctions");
  return res.json();
}

export async function fetchAuctionById(id: number | string): Promise<AuctionItem> {
  const res = await fetch(`${BASE_URL}/auctions/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch auction details");
  return res.json();
}

export async function placeBidOrder(data: {
  clientId: number;
  auctionId: number;
  maxBidYen: number;
  strategy: string;
  snipeSecondsBeforeEnd?: number;
}): Promise<BidOrder> {
  const res = await fetch(`${BASE_URL}/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to place bid");
  }
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE_URL}/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchAuditLogs(): Promise<BiddingAuditLog[]> {
  const res = await fetch(`${BASE_URL}/dashboard/logs`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export async function fetchAccounts(): Promise<YahooAccount[]> {
  const res = await fetch(`${BASE_URL}/accounts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function refreshAccountSession(id: number): Promise<YahooAccount> {
  const res = await fetch(`${BASE_URL}/accounts/${id}/refresh-session`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh session");
  return res.json();
}

export async function fetchProxies(): Promise<ResidentialProxy[]> {
  const res = await fetch(`${BASE_URL}/proxies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch proxies");
  return res.json();
}

export async function checkProxies(): Promise<string> {
  const res = await fetch(`${BASE_URL}/proxies/check-all`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to check proxies");
  return res.text();
}

export async function fetchClientWallet(clientId: number = 1): Promise<ClientUser> {
  const res = await fetch(`${BASE_URL}/wallet/${clientId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch client wallet");
  return res.json();
}

export async function fetchWalletTransactions(clientId: number = 1): Promise<WalletTransaction[]> {
  const res = await fetch(`${BASE_URL}/wallet/${clientId}/transactions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch wallet transactions");
  return res.json();
}

export async function depositWallet(data: {
  clientId: number;
  amount: number;
  currency?: string;
  notes?: string;
}): Promise<ClientUser> {
  const res = await fetch(`${BASE_URL}/wallet/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to process deposit");
  return res.json();
}

export async function fetchOrders(clientId?: number): Promise<{ content: BidOrder[] }> {
  const query = clientId ? `?clientId=${clientId}` : "";
  const res = await fetch(`${BASE_URL}/bids${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function cancelBidOrder(id: number): Promise<BidOrder> {
  const res = await fetch(`${BASE_URL}/bids/${id}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to cancel bid");
  return res.json();
}

export async function forceExecuteSnipe(id: number): Promise<BidOrder> {
  const res = await fetch(`${BASE_URL}/bids/${id}/execute-snipe`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to execute sniper");
  return res.json();
}


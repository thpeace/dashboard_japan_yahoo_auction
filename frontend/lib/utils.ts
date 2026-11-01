import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BidOrderStatus, AuctionStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function yenToUsd(yen: number): string {
  // Approximate exchange rate ~155 JPY per USD
  return formatUsd(yen / 155);
}

export interface TimeRemaining {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
  formatted: string;
}

export function getTimeRemaining(endTimeStr: string): TimeRemaining {
  const diff = Math.max(0, new Date(endTimeStr).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isEnded = totalSeconds <= 0;

  let formatted = "";
  if (isEnded) {
    formatted = "Ended";
  } else if (hours > 24) {
    const days = Math.floor(hours / 24);
    formatted = `${days}d ${hours % 24}h remaining`;
  } else {
    formatted = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return { totalSeconds, hours, minutes, seconds, isEnded, formatted };
}

export function getStatusBadgeStyle(status: BidOrderStatus | AuctionStatus | string): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case "WINNING":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        label: "Winning Bid",
      };
    case "WON":
    case "WON_BY_US":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/30",
        label: "Won Auction",
      };
    case "SCHEDULED":
      return {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/30",
        label: "Sniper Bot Armed",
      };
    case "OUTBID":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
        label: "Outbid - Action Needed",
      };
    case "LOST":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        label: "Lost",
      };
    case "ACTIVE":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/30",
        label: "Active Auction",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/30",
        label: status,
      };
  }
}


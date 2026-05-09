"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { formatDate, formatPercent } from "@/lib/formatters";
import type { Trade } from "@/types/trading";
import { Eye, TrendingUp, TrendingDown } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  OPEN: "warning",
  CLOSED: "secondary",
  CANCELLED: "danger",
};

const statusLabel: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export function TradeTable({ trades }: TradeTableProps): React.JSX.Element {
  if (trades.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center text-muted-foreground">
        Belum ada transaksi. <Link href="/trades/new" className="text-primary underline">Catat transaksi baru</Link>.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Tanggal</th>
            <th className="px-4 py-3 text-left font-medium">Saham</th>
            <th className="px-4 py-3 text-left font-medium">Arah</th>
            <th className="px-4 py-3 text-right font-medium">Lot</th>
            <th className="px-4 py-3 text-right font-medium">Entry</th>
            <th className="px-4 py-3 text-right font-medium">Exit</th>
            <th className="px-4 py-3 text-right font-medium">PnL</th>
            <th className="px-4 py-3 text-right font-medium">PnL%</th>
            <th className="px-4 py-3 text-right font-medium">R:R</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(trade.entryDate)}
              </td>
              <td className="px-4 py-3 font-medium">
                <div>{trade.symbol}</div>
                {trade.stockName && (
                  <div className="text-xs text-muted-foreground">{trade.stockName}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`flex items-center gap-1 text-xs font-medium ${trade.direction === "LONG" ? "text-emerald-600" : "text-red-500"}`}>
                  {trade.direction === "LONG" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trade.direction}
                </span>
              </td>
              <td className="px-4 py-3 text-right">{trade.lotSize}</td>
              <td className="px-4 py-3 text-right">
                <CurrencyDisplay amount={trade.entryPrice} />
              </td>
              <td className="px-4 py-3 text-right">
                {trade.exitPrice != null ? <CurrencyDisplay amount={trade.exitPrice} /> : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3 text-right">
                {trade.realizedPnL != null ? (
                  <CurrencyDisplay amount={trade.realizedPnL} colorize />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {trade.realizedPnLPercent != null ? (
                  <span className={trade.realizedPnLPercent >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {formatPercent(trade.realizedPnLPercent)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {trade.rewardRiskRatio != null
                  ? `1:${Number(trade.rewardRiskRatio).toFixed(2)}`
                  : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant={statusVariant[trade.status]}>{statusLabel[trade.status]}</Badge>
              </td>
              <td className="px-4 py-3 text-center">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/trades/${trade.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

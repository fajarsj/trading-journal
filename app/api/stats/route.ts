import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTradeStatistics } from "@/lib/calculations";
import { format } from "date-fns";
import type { ApiResponse, TradeStatistics, MonthlyPnL, EquityPoint } from "@/types/trading";

interface StatsResponse {
  statistics: TradeStatistics;
  monthlyPnL: MonthlyPnL[];
  equityCurve: EquityPoint[];
}

export async function GET(): Promise<NextResponse<ApiResponse<StatsResponse>>> {
  try {
    const closedTrades = await prisma.trade.findMany({
      where: { status: "CLOSED", deletedAt: null },
      orderBy: { exitDate: "asc" },
      select: {
        realizedPnL: true,
        rewardRiskRatio: true,
        entryValue: true,
        exitDate: true,
      },
    });

    const mappedTrades = closedTrades.map((t) => ({
      realizedPnL: Number(t.realizedPnL ?? 0),
      rewardRiskRatio: t.rewardRiskRatio != null ? Number(t.rewardRiskRatio) : null,
      entryValue: Number(t.entryValue),
    }));

    const statistics = calculateTradeStatistics(mappedTrades);

    // Monthly PnL grouped by month
    const monthlyMap = new Map<string, number>();
    for (const t of closedTrades) {
      if (!t.exitDate) continue;
      const month = format(new Date(t.exitDate), "yyyy-MM");
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + Number(t.realizedPnL ?? 0));
    }
    const monthlyPnL: MonthlyPnL[] = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pnl]) => ({ month, pnl }));

    // Equity curve: cumulative PnL over each trade
    let cumulative = 0;
    const equityCurve: EquityPoint[] = closedTrades.map((t) => {
      cumulative += Number(t.realizedPnL ?? 0);
      return {
        date: t.exitDate ? format(new Date(t.exitDate), "yyyy-MM-dd") : "",
        equity: cumulative,
      };
    });

    return NextResponse.json({
      data: { statistics, monthlyPnL, equityCurve },
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch stats", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

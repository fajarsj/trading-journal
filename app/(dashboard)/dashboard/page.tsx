import Link from "next/link";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { ChecklistWidget } from "@/components/checklist/ChecklistWidget";
import { TradeTable } from "@/components/trades/TradeTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Trade, TradeStatistics, UserSettings, MonthlyPnL, EquityPoint } from "@/types/trading";

async function getStats(): Promise<{ statistics: TradeStatistics; monthlyPnL: MonthlyPnL[]; equityCurve: EquityPoint[] } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/stats`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function getSettings(): Promise<UserSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/settings`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function getRecentTrades(): Promise<Trade[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/trades?limit=5`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getOpenCount(): Promise<number> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/trades?status=OPEN&limit=1`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.meta?.total ?? 0;
  } catch {
    return 0;
  }
}

const EMPTY_STATS: TradeStatistics = {
  totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
  avgWin: 0, avgLoss: 0, avgRR: 0, expectancy: 0, totalPnL: 0,
  maxDrawdown: 0, profitFactor: 0, largestWin: 0, largestLoss: 0,
};

const DEFAULT_SETTINGS: UserSettings = {
  id: 0, capitalTotal: 0, maxRiskPercentPerTrade: 2, maxOpenPositions: 5,
  defaultBrokerageFee: 0.0019, defaultSellFee: 0.0029, updatedAt: new Date().toISOString(),
};

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [statsData, settings, recentTrades, openCount] = await Promise.all([
    getStats(),
    getSettings(),
    getRecentTrades(),
    getOpenCount(),
  ]);

  const stats = statsData?.statistics ?? EMPTY_STATS;
  const s = settings ?? DEFAULT_SETTINGS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Ringkasan performa trading IDX Anda</p>
        </div>
        <Button asChild>
          <Link href="/trades/new">
            <Plus className="h-4 w-4" /> Transaksi Baru
          </Link>
        </Button>
      </div>

      <StatsGrid stats={stats} settings={s} openPositions={openCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PnLChart data={statsData?.monthlyPnL ?? []} />
        </div>
        <div className="space-y-4">
          <ChecklistWidget />
          <WinRateChart stats={stats} />
        </div>
      </div>

      <EquityCurve data={statsData?.equityCurve ?? []} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Transaksi Terbaru</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/trades">Lihat Semua</Link>
          </Button>
        </div>
        <TradeTable trades={recentTrades} />
      </div>
    </div>
  );
}

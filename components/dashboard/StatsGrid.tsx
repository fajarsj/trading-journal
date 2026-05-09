import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { formatPercent } from "@/lib/formatters";
import type { TradeStatistics, UserSettings } from "@/types/trading";
import { TrendingUp, TrendingDown, Target, BarChart2, Activity, DollarSign } from "lucide-react";

interface StatsGridProps {
  stats: TradeStatistics;
  settings: UserSettings;
  openPositions: number;
}

export function StatsGrid({ stats, settings, openPositions }: StatsGridProps): React.JSX.Element {
  const items = [
    {
      label: "Total Modal",
      value: <CurrencyDisplay amount={settings.capitalTotal} />,
      icon: DollarSign,
      sub: "Total kapital trading",
    },
    {
      label: "Realized PnL",
      value: <CurrencyDisplay amount={stats.totalPnL} colorize />,
      icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown,
      sub: `${stats.totalTrades} total transaksi`,
    },
    {
      label: "Win Rate",
      value: <span>{formatPercent(stats.winRate)}</span>,
      icon: Target,
      sub: `${stats.winningTrades}W / ${stats.losingTrades}L`,
    },
    {
      label: "Avg R:R",
      value: <span>1:{stats.avgRR.toFixed(2)}</span>,
      icon: BarChart2,
      sub: "Rata-rata reward:risk",
    },
    {
      label: "Open Positions",
      value: <span>{openPositions}</span>,
      icon: Activity,
      sub: `Max ${settings.maxOpenPositions} posisi`,
    },
    {
      label: "Profit Factor",
      value: <span>{isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"}</span>,
      icon: TrendingUp,
      sub: "Gross profit / gross loss",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({ label, value, icon: Icon, sub }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

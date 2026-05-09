"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TradeStatistics } from "@/types/trading";

interface WinRateChartProps {
  stats: TradeStatistics;
}

export function WinRateChart({ stats }: WinRateChartProps): React.JSX.Element {
  const data = [
    { name: "Profit", value: stats.winningTrades },
    { name: "Loss", value: stats.losingTrades },
    { name: "Breakeven", value: stats.totalTrades - stats.winningTrades - stats.losingTrades },
  ].filter((d) => d.value > 0);

  const COLORS = ["#10b981", "#ef4444", "#6b7280"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribusi Hasil</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Belum ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} transaksi`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

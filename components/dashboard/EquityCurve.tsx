"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/formatters";
import type { EquityPoint } from "@/types/trading";

interface EquityCurveProps {
  data: EquityPoint[];
}

export function EquityCurve({ data }: EquityCurveProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Belum ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis
                tickFormatter={(v: number) => formatIDR(v)}
                tick={{ fontSize: 10 }}
                width={90}
              />
              <Tooltip formatter={(v) => [formatIDR(Number(v)), "Cumulative PnL"]} />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

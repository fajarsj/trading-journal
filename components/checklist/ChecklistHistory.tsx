"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWIBDate } from "@/lib/timezone";

interface HistoryRecord {
  id: number;
  date: string;
  completedItems: number;
  totalItems: number;
  isReady: boolean;
  notes: string | null;
}

export function ChecklistHistory(): React.JSX.Element {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/checklist/history?limit=30")
      .then((r) => r.json())
      .then((j: { data: HistoryRecord[] }) => setRecords(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground py-4">Memuat riwayat...</div>;
  if (records.length === 0) {
    return <div className="text-sm text-muted-foreground py-4">Belum ada riwayat checklist.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Riwayat 30 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tanggal</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Progres</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const pct = r.totalItems > 0 ? r.completedItems / r.totalItems : 0;
                const statusVariant =
                  r.completedItems === r.totalItems
                    ? "success"
                    : pct >= 0.7
                      ? "warning"
                      : "secondary";
                const statusLabel =
                  r.completedItems === r.totalItems
                    ? "Lengkap"
                    : pct >= 0.7
                      ? "Hampir"
                      : "Parsial";

                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 capitalize">
                      {formatWIBDate(new Date(r.date))}
                    </td>
                    <td className="px-4 py-2.5 text-center tabular-nums">
                      <span className={r.completedItems === r.totalItems ? "text-emerald-600 font-medium" : ""}>
                        {r.completedItems}/{r.totalItems}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={statusVariant as "success" | "warning" | "secondary"}>
                        {statusLabel}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

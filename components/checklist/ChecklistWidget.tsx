"use client";

import Link from "next/link";
import { useChecklist } from "@/hooks/useChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ClipboardCheck, Shield } from "lucide-react";
import { REGIME_CONFIGS } from "@/lib/trading-rules";

export function ChecklistWidget(): React.JSX.Element {
  const { checklist, isLoading } = useChecklist();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!checklist) return <></>;

  const pct =
    checklist.totalItems > 0
      ? Math.round((checklist.completedItems / checklist.totalItems) * 100)
      : 0;

  const progressColor =
    pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";

  const regimeConfig = checklist.marketRegime
    ? REGIME_CONFIGS.find((r) => r.value === checklist.marketRegime)
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Pre-Market Checklist
        </CardTitle>
        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold tabular-nums">
            {checklist.completedItems}
            <span className="text-base font-normal text-muted-foreground">
              /{checklist.totalItems}
            </span>
          </span>
          {checklist.isReady ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Siap
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
              <XCircle className="h-4 w-4" /> Belum siap
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Regime + rules badges */}
        <div className="flex flex-wrap gap-1.5">
          {regimeConfig ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${regimeConfig.borderColor} ${regimeConfig.bgColor} ${regimeConfig.color}`}
            >
              {regimeConfig.emoji} {regimeConfig.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-xs text-muted-foreground">
              Belum set regime
            </span>
          )}
          {checklist.rulesAcknowledged ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <Shield className="h-3 w-3" /> Sumpah
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" /> Belum sumpah
            </span>
          )}
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/checklist">
            {pct === 100 ? "Lihat Checklist" : "Lanjutkan Checklist"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

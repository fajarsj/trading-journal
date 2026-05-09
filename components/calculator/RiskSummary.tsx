"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { formatIDR, formatPercent } from "@/lib/formatters";
import {
  calculateBlendedPosition,
  calculateBreakEvenPrice,
  calculateRewardRiskRatio,
} from "@/lib/calculations";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { EntryLeg } from "@/store/calculatorStore";

interface ResolvedLeg extends EntryLeg {
  lots: number;
}

interface RiskSummaryProps {
  capitalIDR: number;
  riskPercent: number;
  resolvedEntries: ResolvedLeg[];
  stopLossPrice: number;
  takeProfitPrice: number;
  buyFeeRate: number;
  sellFeeRate: number;
  userMaxRisk: number;
  totalCapital: number;
}

interface Warning {
  level: "yellow" | "orange" | "red";
  message: string;
}

export function RiskSummary({
  capitalIDR,
  riskPercent,
  resolvedEntries,
  stopLossPrice,
  takeProfitPrice,
  buyFeeRate,
  sellFeeRate,
  userMaxRisk,
  totalCapital,
}: RiskSummaryProps): React.JSX.Element {
  const hasValidEntry = resolvedEntries.some((e) => e.price > 0 && e.lots > 0);
  const isReady = hasValidEntry && stopLossPrice > 0;

  const blended = isReady
    ? calculateBlendedPosition(
        resolvedEntries.map((e) => ({ price: e.price, lots: e.lots })),
        stopLossPrice,
        capitalIDR
      )
    : null;

  const breakEven =
    blended && blended.blendedPrice > 0
      ? calculateBreakEvenPrice(blended.blendedPrice, buyFeeRate, sellFeeRate)
      : null;

  const rr =
    blended && blended.blendedPrice > 0 && takeProfitPrice > 0
      ? calculateRewardRiskRatio(blended.blendedPrice, stopLossPrice, takeProfitPrice)
      : null;

  const targetExitValue =
    blended && takeProfitPrice > 0 ? takeProfitPrice * blended.totalShares : null;

  const warnings: Warning[] = [];
  if (rr != null && rr < 1.5) {
    warnings.push({ level: "yellow", message: `R:R ${rr.toFixed(2)} di bawah minimum 1:1.5` });
  }
  if (blended && blended.riskPercent > userMaxRisk) {
    warnings.push({
      level: "red",
      message: `Risk ${blended.riskPercent.toFixed(2)}% melebihi batas maksimum ${userMaxRisk}%`,
    });
  }
  if (totalCapital > 0 && blended && blended.totalCapitalRequired > totalCapital * 0.3) {
    warnings.push({ level: "orange", message: "Konsentrasi posisi melebihi 30% dari total modal" });
  }

  const warningColor = {
    yellow: "bg-amber-50 border-amber-200 text-amber-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  const isMultiEntry = resolvedEntries.length > 1;

  // Build "Save as Trade" link using blended entry price and total lots
  const saveParams =
    blended && blended.totalLots > 0
      ? new URLSearchParams({
          entryPrice: String(Math.round(blended.blendedPrice)),
          stopLossPrice: String(stopLossPrice),
          takeProfitPrice: String(takeProfitPrice),
          lotSize: String(blended.totalLots),
        }).toString()
      : "";

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Hasil Kalkulasi</h2>

      {!isReady ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Isi modal, harga entry, dan stop loss untuk melihat hasil
          </CardContent>
        </Card>
      ) : (
        <>
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${warningColor[w.level]}`}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              {w.message}
            </div>
          ))}

          {warnings.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Semua parameter dalam batas risiko yang aman
            </div>
          )}

          {/* Per-entry breakdown — only shown when >1 entry */}
          {isMultiEntry && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Breakdown per Entry</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Harga</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Lot</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Modal</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Risiko</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedEntries.map((leg, i) => {
                      const shares = leg.lots * 100;
                      const capital = leg.price * shares;
                      const risk = Math.abs(leg.price - stopLossPrice) * shares;
                      return (
                        <tr key={leg.id} className="border-b last:border-0">
                          <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{formatIDR(leg.price)}</td>
                          <td className="px-4 py-2 text-right tabular-nums font-medium">
                            {leg.lots}
                            <span className="text-muted-foreground font-normal"> lot</span>
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums">{formatIDR(capital)}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-red-600">{formatIDR(risk)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-semibold">
                      <td className="px-4 py-2 text-muted-foreground">Total</td>
                      <td className="px-4 py-2 text-right tabular-nums text-primary">
                        {formatIDR(blended!.blendedPrice)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">(avg)</span>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{blended!.totalLots} lot</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatIDR(blended!.totalCapitalRequired)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-red-600">
                        {formatIDR(blended!.totalRiskAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Position summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                {isMultiEntry ? "Posisi Blended" : "Ukuran Posisi"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isMultiEntry && (
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Harga Entry Rata-rata</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatIDR(blended!.blendedPrice)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Total Lot</span>
                <span className="text-3xl font-bold text-primary">{blended!.totalLots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lembar Saham</span>
                <span>{blended!.totalShares.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Modal Dibutuhkan</span>
                <CurrencyDisplay amount={blended!.totalCapitalRequired} />
              </div>
            </CardContent>
          </Card>

          {/* Risk summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Manajemen Risiko</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Risiko</span>
                <span>
                  <CurrencyDisplay amount={blended!.totalRiskAmount} />{" "}
                  <span className="text-muted-foreground">({formatPercent(blended!.riskPercent)})</span>
                </span>
              </div>
              {rr != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward:Risk</span>
                  <span
                    className={
                      rr >= 1.5 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"
                    }
                  >
                    1:{rr.toFixed(2)}
                  </span>
                </div>
              )}
              {breakEven != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Break-even Price</span>
                  <span>{formatIDR(breakEven)}</span>
                </div>
              )}
              {targetExitValue != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Exit Value</span>
                  <CurrencyDisplay amount={targetExitValue} />
                </div>
              )}
            </CardContent>
          </Card>

          {blended!.totalLots > 0 && (
            <Button asChild className="w-full">
              <Link href={`/trades/new?${saveParams}`}>Simpan sebagai Transaksi Baru</Link>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

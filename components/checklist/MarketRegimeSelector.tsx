"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { REGIME_CONFIGS, type MarketRegime } from "@/lib/trading-rules";
import type { IHSGData } from "@/app/api/market/ihsg/route";

interface MarketRegimeSelectorProps {
  currentRegime: string | null;
  setAt: string | null;
  onSave: (regime: MarketRegime) => Promise<void>;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Keyakinan Tinggi",
  medium: "Keyakinan Sedang",
  low: "Keyakinan Rendah",
};

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((d) => d.data as IHSGData | null);

export function MarketRegimeSelector({
  currentRegime,
  setAt,
  onSave,
}: MarketRegimeSelectorProps): React.JSX.Element {
  const [selected, setSelected] = useState<MarketRegime | null>(
    (currentRegime as MarketRegime | null) ?? null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!currentRegime);

  const {
    data: ihsg,
    isLoading: ihsgLoading,
    mutate: refreshIHSG,
    isValidating,
  } = useSWR<IHSGData | null>("/api/market/ihsg", fetcher, {
    refreshInterval: 1000,
    revalidateOnFocus: false,
  });

  const selectedConfig = selected ? REGIME_CONFIGS.find((r) => r.value === selected) : null;
  const suggestedConfig = ihsg ? REGIME_CONFIGS.find((r) => r.value === ihsg.suggestedRegime) : null;

  async function handleSave(): Promise<void> {
    if (!selected) return;
    setSaving(true);
    try {
      await onSave(selected);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  function applyIHSGSuggestion(): void {
    if (!ihsg) return;
    setSelected(ihsg.suggestedRegime);
    setSaved(false);
  }

  const isDirty = selected !== (currentRegime as MarketRegime | null);

  function formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Kondisi Market Hari Ini</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── IHSG Live Data ─────────────────────────────────── */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              IHSG Live Data
            </span>
            <div className="flex items-center gap-3">
              {ihsg && (
                <span
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    ihsg.isMarketOpen ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ihsg.isMarketOpen ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  {ihsg.isMarketOpen ? "Pasar Buka" : "Pasar Tutup"}
                </span>
              )}
              <button
                type="button"
                onClick={() => refreshIHSG()}
                disabled={isValidating}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Perbarui data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {ihsgLoading ? (
            <p className="text-sm text-muted-foreground">Memuat data IHSG...</p>
          ) : ihsg ? (
            <>
              {/* Price row + indicators */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Price */}
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2.5 tabular-nums">
                    <span className="text-2xl font-bold">
                      {ihsg.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={`text-base font-medium ${
                        (ihsg.changePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {(ihsg.change ?? 0) >= 0 ? "+" : ""}
                      {(ihsg.change ?? 0).toFixed(2)}{" "}
                      ({(ihsg.changePercent ?? 0) >= 0 ? "+" : ""}
                      {(ihsg.changePercent ?? 0).toFixed(2)}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(ihsg.timestamp)}
                  </p>
                </div>

                {/* Indicator pills */}
                <div className="flex gap-2">
                  {[
                    { label: "MA20", value: ihsg.indicators.sma20.toFixed(0) },
                    { label: "MA50", value: ihsg.indicators.sma50.toFixed(0) },
                    { label: "ATR14", value: `${ihsg.indicators.atr14Pct.toFixed(2)}%` },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-center min-w-[64px]"
                    >
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestion row */}
              {suggestedConfig && (
                <div
                  className={`flex flex-col sm:flex-row sm:items-start gap-3 rounded-md border ${suggestedConfig.borderColor} ${suggestedConfig.bgColor} p-3`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{suggestedConfig.emoji}</span>
                      <span className={`text-sm font-semibold ${suggestedConfig.color}`}>
                        {suggestedConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        — {CONFIDENCE_LABEL[ihsg.confidence]}
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {ihsg.reasoning.map((line, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          • {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 self-start"
                    onClick={applyIHSGSuggestion}
                    disabled={selected === ihsg.suggestedRegime}
                  >
                    {selected === ihsg.suggestedRegime ? "Diterapkan" : "Terapkan Saran"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Data IHSG tidak tersedia — pilih kondisi secara manual.
            </p>
          )}
        </div>

        {/* ── Regime Selector ────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGIME_CONFIGS.map((cfg) => (
            <button
              key={cfg.value}
              type="button"
              onClick={() => {
                setSelected(cfg.value);
                setSaved(false);
              }}
              className={[
                "flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all",
                selected === cfg.value
                  ? `${cfg.borderColor} ${cfg.bgColor}`
                  : "border-border hover:border-muted-foreground/30 hover:bg-muted/40",
              ].join(" ")}
            >
              <span className="text-lg leading-none">{cfg.emoji}</span>
              <span className={`text-sm font-semibold ${selected === cfg.value ? cfg.color : ""}`}>
                {cfg.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Selected regime detail ─────────────────────────── */}
        {selectedConfig && (
          <div
            className={`rounded-lg border ${selectedConfig.borderColor} ${selectedConfig.bgColor} p-4 space-y-3`}
          >
            <p className={`text-sm ${selectedConfig.color}`}>{selectedConfig.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">Yang harus dilakukan:</p>
                <ul className="space-y-1">
                  {selectedConfig.actions.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-0.5 text-emerald-600 shrink-0">+</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">Hindari:</p>
                <ul className="space-y-1">
                  {selectedConfig.avoid.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-red-500 shrink-0">−</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Save ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={!selected || !isDirty || saving}
            onClick={handleSave}
            className="flex-1 sm:flex-none sm:min-w-[160px]"
          >
            {saving ? "Menyimpan..." : "Simpan Kondisi"}
          </Button>
          {saved && !isDirty && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {setAt ? "Tersimpan" : "Tersimpan"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

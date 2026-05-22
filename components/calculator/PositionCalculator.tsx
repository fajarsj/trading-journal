"use client";

import { useCalculatorStore } from "@/store/calculatorStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { RiskSummary } from "./RiskSummary";
import { formatIDR } from "@/lib/formatters";
import { calculateAutoLots } from "@/lib/calculations";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import type { UserSettings } from "@/types/trading";
import { SavedSetups } from "./SavedSetups";

interface PositionCalculatorProps {
  settings: UserSettings;
}

export function PositionCalculator({ settings }: PositionCalculatorProps): React.JSX.Element {
  const store = useCalculatorStore();
  const capital = store.capitalIDR || settings.capitalTotal;

  const totalRiskIDR = capital * (store.riskPercent / 100);
  const riskPerLeg = store.entries.length > 0 ? totalRiskIDR / store.entries.length : totalRiskIDR;

  // Resolve each leg's actual lots (auto or manual)
  const resolvedEntries = store.entries.map((leg) => {
    const autoLots =
      leg.isAuto && leg.price > 0 && store.stopLossPrice > 0 && leg.price !== store.stopLossPrice
        ? calculateAutoLots(leg.price, store.stopLossPrice, riskPerLeg)
        : 0;
    return { ...leg, lots: leg.isAuto ? autoLots : leg.manualLots };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left: inputs ── */}
      <div className="space-y-5">
        <h2 className="font-semibold text-lg">Parameter</h2>

        {/* Capital */}
        <div className="space-y-2">
          <Label>Total Modal (IDR)</Label>
          <CurrencyInput value={capital} onChange={store.setCapitalIDR} />
        </div>

        {/* Risk % */}
        <div className="space-y-2">
          <Label>Risk % per Transaksi</Label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              min={0.1}
              max={10}
              value={store.riskPercent}
              onChange={(e) => store.setRiskPercent(Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Budget risiko total: {formatIDR(totalRiskIDR)}
            {store.entries.length > 1 && ` ÷ ${store.entries.length} = ${formatIDR(riskPerLeg)} / entry`}
          </p>
        </div>

        {/* Entry legs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Harga Entry</Label>
            {store.entries.length > 1 && (
              <span className="text-xs text-muted-foreground">{store.entries.length} entry</span>
            )}
          </div>

          <div className="space-y-2">
            {resolvedEntries.map((leg, i) => (
              <div key={leg.id} className="flex items-center gap-2">
                {/* Entry number badge */}
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>

                {/* Price input */}
                <CurrencyInput
                  value={leg.price}
                  onChange={(v) => store.updateEntryPrice(leg.id, v)}
                  className="flex-1"
                />

                {/* Lots — auto or manual */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => store.toggleEntryAuto(leg.id)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      leg.isAuto
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input text-muted-foreground hover:bg-muted"
                    }`}
                    title={leg.isAuto ? "Auto — klik untuk manual" : "Manual — klik untuk auto"}
                  >
                    {leg.isAuto ? "auto" : "manual"}
                  </button>

                  {leg.isAuto ? (
                    <span className="w-14 text-center text-sm font-semibold tabular-nums">
                      {leg.lots} lot
                    </span>
                  ) : (
                    <Input
                      type="number"
                      min={1}
                      value={leg.manualLots}
                      onChange={(e) => store.updateEntryLots(leg.id, Number(e.target.value))}
                      className="w-20 text-center"
                    />
                  )}
                </div>

                {/* Remove button (only when >1 entry) */}
                {store.entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => store.removeEntry(leg.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={store.addEntry}
            className="w-full gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Entry (Averaging)
          </Button>
        </div>

        {/* Stop Loss */}
        <div className="space-y-2">
          <Label>Stop Loss (IDR)</Label>
          <CurrencyInput value={store.stopLossPrice} onChange={store.setStopLossPrice} />
        </div>

        {/* Take Profit */}
        <div className="space-y-2">
          <Label>Take Profit (IDR) — opsional</Label>
          <CurrencyInput value={store.takeProfitPrice} onChange={store.setTakeProfitPrice} />
        </div>

        {/* Fees */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Fee Beli (%)</Label>
            <Input
              type="number"
              step="0.0001"
              value={store.buyFeeRate}
              onChange={(e) => store.setBuyFeeRate(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Fee Jual (%)</Label>
            <Input
              type="number"
              step="0.0001"
              value={store.sellFeeRate}
              onChange={(e) => store.setSellFeeRate(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Reset */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={store.reset}
          className="gap-1.5 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>

        <SavedSetups />
      </div>

      {/* ── Right: results ── */}
      <RiskSummary
        capitalIDR={capital}
        riskPercent={store.riskPercent}
        resolvedEntries={resolvedEntries}
        stopLossPrice={store.stopLossPrice}
        takeProfitPrice={store.takeProfitPrice}
        buyFeeRate={store.buyFeeRate}
        sellFeeRate={store.sellFeeRate}
        userMaxRisk={settings.maxRiskPercentPerTrade}
        totalCapital={settings.capitalTotal}
      />
    </div>
  );
}

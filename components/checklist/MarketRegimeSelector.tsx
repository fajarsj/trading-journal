"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { REGIME_CONFIGS, type MarketRegime } from "@/lib/trading-rules";

interface MarketRegimeSelectorProps {
  currentRegime: string | null;
  setAt: string | null;
  onSave: (regime: MarketRegime) => Promise<void>;
}

export function MarketRegimeSelector({ currentRegime, setAt, onSave }: MarketRegimeSelectorProps): React.JSX.Element {
  const [selected, setSelected] = useState<MarketRegime | null>(
    (currentRegime as MarketRegime | null) ?? null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!currentRegime);

  const selectedConfig = selected ? REGIME_CONFIGS.find((r) => r.value === selected) : null;

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

  const isDirty = selected !== (currentRegime as MarketRegime | null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Kondisi Market Hari Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {REGIME_CONFIGS.map((cfg) => (
            <button
              key={cfg.value}
              type="button"
              onClick={() => {
                setSelected(cfg.value);
                setSaved(false);
              }}
              className={[
                "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
                selected === cfg.value
                  ? `${cfg.borderColor} ${cfg.bgColor}`
                  : "border-border hover:border-muted-foreground/30 hover:bg-muted/40",
              ].join(" ")}
            >
              <span className="text-base leading-none">{cfg.emoji}</span>
              <span className={`text-sm font-semibold ${selected === cfg.value ? cfg.color : ""}`}>
                {cfg.label}
              </span>
            </button>
          ))}
        </div>

        {selectedConfig && (
          <div className={`rounded-lg border ${selectedConfig.borderColor} ${selectedConfig.bgColor} p-3 space-y-2`}>
            <p className={`text-xs ${selectedConfig.color}`}>{selectedConfig.description}</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Yang harus dilakukan:</p>
              <ul className="space-y-0.5">
                {selectedConfig.actions.map((a) => (
                  <li key={a} className="flex items-start gap-1.5 text-xs text-foreground">
                    <span className="mt-0.5 text-emerald-600">+</span> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Hindari:</p>
              <ul className="space-y-0.5">
                {selectedConfig.avoid.map((a) => (
                  <li key={a} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 text-red-500">-</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={!selected || !isDirty || saving}
            onClick={handleSave}
            className="flex-1"
          >
            {saving ? "Menyimpan..." : "Simpan Kondisi"}
          </Button>
          {saved && !isDirty && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {setAt ? `Tersimpan` : "Tersimpan"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

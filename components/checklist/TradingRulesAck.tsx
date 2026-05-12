"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield } from "lucide-react";
import { TRADING_RULES } from "@/lib/trading-rules";
import { formatWIBDate } from "@/lib/timezone";

interface TradingRulesAckProps {
  rulesAcknowledged: boolean;
  rulesAcknowledgedAt: string | null;
  acknowledgedRules: string[] | null;
  onAcknowledge: (acknowledgedRules: string[]) => Promise<void>;
}

export function TradingRulesAck({
  rulesAcknowledged,
  rulesAcknowledgedAt,
  acknowledgedRules: savedRules,
  onAcknowledge,
}: TradingRulesAckProps): React.JSX.Element {
  const allRuleIds = TRADING_RULES.map((r) => r.id);
  const [checked, setChecked] = useState<Set<string>>(
    new Set(savedRules ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const allChecked = TRADING_RULES.every((r) => checked.has(r.id));
  const criticalChecked = TRADING_RULES.filter((r) => r.isCritical).every((r) => checked.has(r.id));

  function toggle(id: string): void {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll(): void {
    setChecked(new Set(allRuleIds));
  }

  async function handleAcknowledge(): Promise<void> {
    if (!allChecked) return;
    setSaving(true);
    try {
      await onAcknowledge(Array.from(checked));
      setReviewing(false);
    } finally {
      setSaving(false);
    }
  }

  if (rulesAcknowledged && savedRules && !saving && !reviewing) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Sumpah Trading Telah Diucapkan</p>
              {rulesAcknowledgedAt && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  {formatWIBDate(rulesAcknowledgedAt)}
                </p>
              )}
              <p className="text-xs text-emerald-700 mt-1">
                {savedRules.length} dari {TRADING_RULES.length} aturan diakui
              </p>
              <button
                type="button"
                className="mt-2 text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800"
                onClick={() => {
                  setChecked(new Set(savedRules));
                  setReviewing(true);
                }}
              >
                Tinjau kembali
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Sumpah Trading Harian</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Baca dan centang setiap aturan sebagai komitmen trading hari ini.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2.5">
          {TRADING_RULES.map((rule) => (
            <li key={rule.id}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked.has(rule.id)}
                  onChange={() => toggle(rule.id)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary shrink-0"
                />
                <span
                  className={[
                    "text-sm leading-snug",
                    checked.has(rule.id)
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                    rule.isCritical ? "font-medium" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {rule.text}
                  {rule.isCritical && (
                    <span className="ml-1.5 inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                      Wajib
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {!allChecked && (
          <button
            type="button"
            className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
            onClick={selectAll}
          >
            Centang semua
          </button>
        )}

        <Button
          className="w-full"
          disabled={!allChecked || !criticalChecked || saving}
          onClick={handleAcknowledge}
        >
          {saving ? (
            "Menyimpan..."
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Saya Berkomitmen pada Aturan Ini
            </span>
          )}
        </Button>

        {!criticalChecked && (
          <p className="text-xs text-red-500 text-center">
            Semua aturan wajib harus dicentang terlebih dahulu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

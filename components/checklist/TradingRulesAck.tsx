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
  const [checked, setChecked] = useState<Set<string>>(new Set(savedRules ?? []));
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const allChecked = TRADING_RULES.every((r) => checked.has(r.id));
  const criticalChecked = TRADING_RULES.filter((r) => r.isCritical).every((r) =>
    checked.has(r.id)
  );

  function toggle(id: string): void {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  /* ── Completed state ─────────────────────────────────────── */
  if (rulesAcknowledged && savedRules && !saving && !reviewing) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-100 p-2.5 shrink-0">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800">
                Sumpah Trading Telah Diucapkan
              </p>
              {rulesAcknowledgedAt && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  {formatWIBDate(rulesAcknowledgedAt)}
                </p>
              )}
              <p className="text-xs text-emerald-700 mt-1">
                {savedRules.length} dari {TRADING_RULES.length} aturan diakui
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800"
              onClick={() => {
                setChecked(new Set(savedRules));
                setReviewing(true);
              }}
            >
              Tinjau kembali
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ── Form state ──────────────────────────────────────────── */
  const criticalRules = TRADING_RULES.filter((r) => r.isCritical);
  const optionalRules = TRADING_RULES.filter((r) => !r.isCritical);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">Sumpah Trading Harian</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Baca dan centang setiap aturan sebagai komitmen trading hari ini.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Critical rules */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Aturan Wajib
          </p>
          <ul className="space-y-0">
            {criticalRules.map((rule) => (
              <li key={rule.id}>
                <label
                  className={[
                    "flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
                    checked.has(rule.id) ? "bg-primary/5" : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(rule.id)}
                    onChange={() => toggle(rule.id)}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary shrink-0"
                  />
                  <span
                    className={[
                      "text-sm leading-relaxed font-medium",
                      checked.has(rule.id) ? "text-foreground" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {rule.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Optional rules */}
        {optionalRules.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Aturan Tambahan
            </p>
            <ul className="space-y-0">
              {optionalRules.map((rule) => (
                <li key={rule.id}>
                  <label
                    className={[
                      "flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
                      checked.has(rule.id) ? "bg-muted/60" : "hover:bg-muted/50",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(rule.id)}
                      onChange={() => toggle(rule.id)}
                      className="mt-0.5 h-4 w-4 rounded border-input accent-primary shrink-0"
                    />
                    <span
                      className={[
                        "text-sm leading-relaxed",
                        checked.has(rule.id) ? "text-foreground" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {rule.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <Button
            className="w-full sm:w-auto sm:flex-1"
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

          {!allChecked && (
            <button
              type="button"
              className="text-sm text-primary underline underline-offset-2 hover:opacity-80 shrink-0"
              onClick={() => setChecked(new Set(allRuleIds))}
            >
              Centang semua
            </button>
          )}
        </div>

        {!criticalChecked && (
          <p className="text-xs text-red-500">
            Semua aturan wajib harus dicentang terlebih dahulu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

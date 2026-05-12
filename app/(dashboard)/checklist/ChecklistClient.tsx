"use client";

import { useRef } from "react";
import { useChecklist } from "@/hooks/useChecklist";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ChecklistGateBar } from "@/components/checklist/ChecklistGateBar";
import { ChecklistVerdict } from "@/components/checklist/ChecklistVerdict";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";
import { ChecklistHistory } from "@/components/checklist/ChecklistHistory";
import { MarketRegimeSelector } from "@/components/checklist/MarketRegimeSelector";
import { TradingRulesAck } from "@/components/checklist/TradingRulesAck";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatWIBDate } from "@/lib/timezone";
import { RotateCcw, History } from "lucide-react";
import type { MarketRegime } from "@/lib/trading-rules";

export function ChecklistClient(): React.JSX.Element {
  const { checklist, isLoading, toggleItem, saveInputValue, saveNotes, resetChecklist, saveRegime, saveRules } =
    useChecklist();
  const notesRef = useRef<HTMLTextAreaElement>(null);

  if (isLoading || !checklist) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    );
  }

  const criticalComplete = checklist.sections
    .filter((s) => s.isCritical)
    .every((s) => s.completionRate === 1);

  async function handleReset(): Promise<void> {
    if (!confirm("Reset semua checklist hari ini?")) return;
    await resetChecklist();
    if (notesRef.current) notesRef.current.value = "";
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pre-Market Checklist</h1>
          <p className="text-muted-foreground text-sm capitalize mt-0.5">
            {formatWIBDate(new Date(checklist.date))}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1.5 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      {/* Progress + gate bar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border bg-card p-5">
        <ChecklistProgress completed={checklist.completedItems} total={checklist.totalItems} />
        <div className="flex-1 space-y-3">
          <ChecklistGateBar sections={checklist.sections} />
          <ChecklistVerdict
            completed={checklist.completedItems}
            total={checklist.totalItems}
            isReady={checklist.isReady}
            criticalComplete={criticalComplete}
          />
        </div>
      </div>

      {/* Market Regime + Trading Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MarketRegimeSelector
          currentRegime={checklist.marketRegime}
          setAt={checklist.marketRegimeSetAt}
          onSave={(regime: MarketRegime) => saveRegime(regime)}
        />
        <TradingRulesAck
          rulesAcknowledged={checklist.rulesAcknowledged}
          rulesAcknowledgedAt={checklist.rulesAcknowledgedAt}
          acknowledgedRules={checklist.acknowledgedRules}
          onAcknowledge={(rules) => saveRules(rules)}
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {checklist.sections.map((section) => (
          <ChecklistSection
            key={section.section}
            section={section}
            onToggle={toggleItem}
            onInputSave={saveInputValue}
          />
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Catatan Hari Ini</label>
        <Textarea
          ref={notesRef}
          defaultValue={checklist.notes ?? ""}
          rows={3}
          placeholder="Kondisi market, rencana khusus, atau hal yang perlu diperhatikan hari ini..."
          onBlur={(e) => saveNotes(e.target.value)}
        />
      </div>

      <Separator />

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Riwayat Checklist</h2>
        </div>
        <ChecklistHistory />
      </div>
    </div>
  );
}

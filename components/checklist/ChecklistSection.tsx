"use client";

import { useState } from "react";
import { ChevronDown, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChecklistItem } from "./ChecklistItem";
import type { ChecklistSectionResponse, ChecklistItemResponse } from "@/app/api/checklist/today/route";

interface ChecklistSectionProps {
  section: ChecklistSectionResponse;
  onToggle: (id: number, checked: boolean) => void;
  onInputSave: (id: number, value: string) => void;
}

export function ChecklistSection({ section, onToggle, onInputSave }: ChecklistSectionProps): React.JSX.Element {
  const [open, setOpen] = useState(true);
  const done = section.items.filter((i: ChecklistItemResponse) => i.isChecked).length;
  const total = section.items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const progressColor =
    pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
      >
        {/* Progress bar pill */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold">{section.sectionLabel}</span>
            {section.isCritical && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                <ShieldAlert className="h-3 w-3" /> Gate
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {done}/{total}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", progressColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Items */}
      {open && (
        <div className="p-3 space-y-2">
          {section.items.map((item: ChecklistItemResponse) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              onInputSave={onInputSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

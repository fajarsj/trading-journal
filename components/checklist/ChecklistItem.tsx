"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChecklistItemResponse } from "@/app/api/checklist/today/route";

interface ChecklistItemProps {
  item: ChecklistItemResponse;
  onToggle: (id: number, checked: boolean) => void;
  onInputSave: (id: number, value: string) => void;
}

export function ChecklistItem({ item, onToggle, onInputSave }: ChecklistItemProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "group rounded-lg border px-4 py-3 transition-colors",
        item.isChecked
          ? "bg-emerald-50/60 border-emerald-200"
          : "bg-background hover:bg-muted/30 border-border"
      )}
    >
      <button
        type="button"
        className="flex items-start gap-3 w-full text-left"
        onClick={() => onToggle(item.id, !item.isChecked)}
      >
        {/* Custom checkbox */}
        <span
          className={cn(
            "mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
            item.isChecked
              ? "bg-emerald-500 border-emerald-500"
              : "border-muted-foreground/40 group-hover:border-primary"
          )}
        >
          {item.isChecked && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm leading-snug", item.isChecked && "line-through text-muted-foreground")}>
            {item.label}
          </p>
          {item.note && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
          )}
        </div>
      </button>

      {/* Text input for items that require a value */}
      {item.hasInput && (
        <div className="mt-2 ml-8">
          <input
            ref={inputRef}
            type="text"
            defaultValue={item.inputValue ?? ""}
            placeholder={item.inputPlaceholder ?? ""}
            onBlur={(e) => onInputSave(item.id, e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}

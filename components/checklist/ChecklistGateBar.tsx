import type { ChecklistSectionResponse } from "@/app/api/checklist/today/route";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface ChecklistGateBarProps {
  sections: ChecklistSectionResponse[];
}

export function ChecklistGateBar({ sections }: ChecklistGateBarProps): React.JSX.Element {
  const criticalSections = sections.filter((s) => s.isCritical);
  if (criticalSections.length === 0) return <></>;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gates:</span>
      {criticalSections.map((sec) => {
        const done = sec.completionRate === 1;
        return (
          <span
            key={sec.section}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
              done
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {done ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            {sec.sectionLabel}
          </span>
        );
      })}
    </div>
  );
}

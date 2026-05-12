interface ChecklistProgressProps {
  completed: number;
  total: number;
}

export function ChecklistProgress({ completed, total }: ChecklistProgressProps): React.JSX.Element {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct === 100 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
        {/* Percentage text — rotated back upright */}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90"
          style={{ transform: "rotate(90deg)", transformOrigin: "60px 60px" }}
          fill={color}
          fontSize="20"
          fontWeight="bold"
        >
          {pct}%
        </text>
      </svg>
      <p className="text-sm font-medium tabular-nums">
        {completed} / {total}
      </p>
      <p className="text-xs text-muted-foreground">items selesai</p>
    </div>
  );
}

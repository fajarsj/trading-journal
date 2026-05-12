import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

interface ChecklistVerdictProps {
  completed: number;
  total: number;
  isReady: boolean;
  criticalComplete: boolean;
}

export function ChecklistVerdict({
  completed,
  total,
  isReady,
  criticalComplete,
}: ChecklistVerdictProps): React.JSX.Element {
  const pct = total > 0 ? completed / total : 0;

  let config: {
    icon: React.ReactNode;
    title: string;
    description: string;
    className: string;
  };

  if (completed === total && total > 0) {
    config = {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Siap Trading",
      description: "Semua item checklist selesai. Anda siap menghadapi market!",
      className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    };
  } else if (!criticalComplete) {
    config = {
      icon: <XCircle className="h-6 w-6" />,
      title: "Belum Siap — Risk Gates Belum Selesai",
      description: "Selesaikan semua item Risk Management Gates sebelum mulai trading.",
      className: "bg-red-50 border-red-200 text-red-800",
    };
  } else if (pct >= 0.7) {
    config = {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Hampir Siap",
      description: "Risk gates sudah selesai, tapi beberapa item persiapan masih belum diceklis.",
      className: "bg-amber-50 border-amber-200 text-amber-800",
    };
  } else {
    config = {
      icon: <Clock className="h-6 w-6" />,
      title: "Sedang Dalam Proses",
      description: "Lanjutkan checklist pre-market Anda sebelum market buka pukul 09.00 WIB.",
      className: "bg-muted border-border text-foreground",
    };
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border-2 p-4 ${config.className}`}>
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div>
        <p className="font-semibold">{config.title}</p>
        <p className="text-sm mt-0.5 opacity-80">{config.description}</p>
      </div>
    </div>
  );
}

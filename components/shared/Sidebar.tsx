"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  ListOrdered,
  BookOpen,
  Settings,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChecklist } from "@/hooks/useChecklist";

function ChecklistBadge(): React.JSX.Element | null {
  const { checklist } = useChecklist();
  if (!checklist) return null;
  if (checklist.isReady) {
    return (
      <span className="ml-auto text-xs rounded-full px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-medium">
        Siap
      </span>
    );
  }
  const remaining = checklist.totalItems - checklist.completedItems;
  if (remaining === 0) return null;
  return (
    <span className="ml-auto text-xs rounded-full px-1.5 py-0.5 bg-amber-100 text-amber-700 font-medium tabular-nums">
      {remaining}
    </span>
  );
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklist", label: "Pre-Market", icon: ClipboardCheck, badge: true },
  { href: "/calculator", label: "Kalkulator", icon: Calculator },
  { href: "/trades", label: "Log Transaksi", icon: ListOrdered },
  { href: "/journal", label: "Jurnal", icon: BookOpen },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg tracking-tight">Trading Journal</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {badge && <ChecklistBadge />}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        IDX Trading Journal v1.0
      </div>
    </aside>
  );
}

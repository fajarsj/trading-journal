import Link from "next/link";
import { TradeTable } from "@/components/trades/TradeTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Trade } from "@/types/trading";

async function getTrades(status?: string): Promise<{ trades: Trade[]; total: number }> {
  try {
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/trades?${params}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    return { trades: json.data ?? [], total: json.meta?.total ?? 0 };
  } catch {
    return { trades: [], total: 0 };
  }
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}): Promise<React.JSX.Element> {
  const sp = await searchParams;
  const { trades, total } = await getTrades(sp.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Log Transaksi</h1>
          <p className="text-muted-foreground text-sm">{total} transaksi ditemukan</p>
        </div>
        <Button asChild>
          <Link href="/trades/new">
            <Plus className="h-4 w-4" /> Transaksi Baru
          </Link>
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {[
          { label: "Semua", value: undefined },
          { label: "Open", value: "OPEN" },
          { label: "Closed", value: "CLOSED" },
          { label: "Cancelled", value: "CANCELLED" },
        ].map(({ label, value }) => (
          <Button
            key={label}
            variant={sp.status === value ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={value ? `/trades?status=${value}` : "/trades"}>{label}</Link>
          </Button>
        ))}
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}

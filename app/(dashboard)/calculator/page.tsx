import { PositionCalculator } from "@/components/calculator/PositionCalculator";
import type { UserSettings } from "@/types/trading";

async function getSettings(): Promise<UserSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/settings`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.data;
  } catch {
    return {
      id: 0, capitalTotal: 0, maxRiskPercentPerTrade: 2, maxOpenPositions: 5,
      defaultBrokerageFee: 0.0019, defaultSellFee: 0.0029, updatedAt: new Date().toISOString(),
    };
  }
}

export default async function CalculatorPage(): Promise<React.JSX.Element> {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kalkulator Posisi</h1>
        <p className="text-muted-foreground text-sm">
          Hitung ukuran posisi optimal berdasarkan risiko yang bisa Anda tanggung
        </p>
      </div>
      <PositionCalculator settings={settings} />
    </div>
  );
}

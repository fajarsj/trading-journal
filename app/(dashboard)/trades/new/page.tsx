import { TradeForm } from "@/components/trades/TradeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewTradePage({
  searchParams,
}: {
  searchParams: Promise<{
    entryPrice?: string;
    stopLossPrice?: string;
    takeProfitPrice?: string;
    lotSize?: string;
  }>;
}): Promise<React.JSX.Element> {
  const sp = await searchParams;

  const defaultValues = {
    entryPrice: sp.entryPrice ? Number(sp.entryPrice) : undefined,
    stopLossPrice: sp.stopLossPrice ? Number(sp.stopLossPrice) : undefined,
    takeProfitPrice: sp.takeProfitPrice ? Number(sp.takeProfitPrice) : undefined,
    lotSize: sp.lotSize ? Number(sp.lotSize) : undefined,
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Catat Transaksi Baru</h1>
        <p className="text-muted-foreground text-sm">Log transaksi saham IDX baru</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeForm defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}

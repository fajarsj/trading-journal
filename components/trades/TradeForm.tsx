"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

const schema = z.object({
  symbol: z.string().min(1, "Kode saham wajib diisi"),
  stockName: z.string().optional(),
  direction: z.enum(["LONG", "SHORT"]),
  entryDate: z.string().min(1, "Tanggal entry wajib diisi"),
  entryPrice: z.number().positive("Harga entry harus positif"),
  lotSize: z.number().int().positive("Jumlah lot harus positif"),
  stopLossPrice: z.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  takeProfitPrice: z.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  strategy: z.string().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
  emotionEntry: z.enum(["CONFIDENT", "UNCERTAIN", "FOMO", "DISCIPLINED"]).optional(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TradeFormProps {
  defaultValues?: Partial<FormValues>;
}

export function TradeForm({ defaultValues }: TradeFormProps): React.JSX.Element {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      direction: "LONG",
      entryDate: new Date().toISOString().slice(0, 16),
      entryPrice: 0,
      lotSize: 1,
      ...defaultValues,
    },
  });

  const entryPrice = watch("entryPrice");
  const stopLossPrice = watch("stopLossPrice");
  const takeProfitPrice = watch("takeProfitPrice");

  async function onSubmit(data: FormValues): Promise<void> {
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        entryDate: new Date(data.entryDate).toISOString(),
      }),
    });
    if (res.ok) {
      router.push("/trades");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Symbol */}
        <div className="space-y-2">
          <Label htmlFor="symbol">Kode Saham *</Label>
          <Input
            id="symbol"
            placeholder="BBCA"
            {...register("symbol")}
            className="uppercase"
          />
          {errors.symbol && <p className="text-xs text-red-500">{errors.symbol.message}</p>}
        </div>

        {/* Stock name */}
        <div className="space-y-2">
          <Label htmlFor="stockName">Nama Perusahaan</Label>
          <Input id="stockName" placeholder="Bank Central Asia Tbk" {...register("stockName")} />
        </div>

        {/* Direction */}
        <div className="space-y-2">
          <Label>Arah *</Label>
          <Select
            defaultValue="LONG"
            onValueChange={(v) => setValue("direction", v as "LONG" | "SHORT")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LONG">Long (Beli)</SelectItem>
              <SelectItem value="SHORT">Short (Jual)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entry Date */}
        <div className="space-y-2">
          <Label htmlFor="entryDate">Tanggal & Jam Entry *</Label>
          <Input
            id="entryDate"
            type="datetime-local"
            {...register("entryDate")}
          />
          {errors.entryDate && <p className="text-xs text-red-500">{errors.entryDate.message}</p>}
        </div>

        {/* Entry Price */}
        <div className="space-y-2">
          <Label>Harga Entry *</Label>
          <CurrencyInput
            value={entryPrice ?? 0}
            onChange={(v) => setValue("entryPrice", v)}
          />
          {errors.entryPrice && <p className="text-xs text-red-500">{errors.entryPrice.message}</p>}
        </div>

        {/* Lot Size */}
        <div className="space-y-2">
          <Label htmlFor="lotSize">Jumlah Lot *</Label>
          <Input
            id="lotSize"
            type="number"
            min={1}
            {...register("lotSize", { valueAsNumber: true })}
          />
          {errors.lotSize && <p className="text-xs text-red-500">{errors.lotSize.message}</p>}
        </div>

        {/* Stop Loss */}
        <div className="space-y-2">
          <Label>Stop Loss</Label>
          <CurrencyInput
            value={stopLossPrice ?? 0}
            onChange={(v) => setValue("stopLossPrice", v || undefined)}
          />
        </div>

        {/* Take Profit */}
        <div className="space-y-2">
          <Label>Take Profit</Label>
          <CurrencyInput
            value={takeProfitPrice ?? 0}
            onChange={(v) => setValue("takeProfitPrice", v || undefined)}
          />
        </div>

        {/* Strategy */}
        <div className="space-y-2">
          <Label htmlFor="strategy">Strategi</Label>
          <Input id="strategy" placeholder="Breakout, Pullback, Swing..." {...register("strategy")} />
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label htmlFor="sector">Sektor</Label>
          <Input id="sector" placeholder="Perbankan, Teknologi..." {...register("sector")} />
        </div>

        {/* Emotion */}
        <div className="space-y-2">
          <Label>Emosi Saat Entry</Label>
          <Select onValueChange={(v) => setValue("emotionEntry", v as FormValues["emotionEntry"])}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih emosi..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONFIDENT">Confident</SelectItem>
              <SelectItem value="DISCIPLINED">Disciplined</SelectItem>
              <SelectItem value="UNCERTAIN">Uncertain</SelectItem>
              <SelectItem value="FOMO">FOMO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" placeholder="breakout,IDX30,q1" {...register("tags")} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          placeholder="Alasan masuk, kondisi market, setup..."
          rows={3}
          {...register("notes")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}

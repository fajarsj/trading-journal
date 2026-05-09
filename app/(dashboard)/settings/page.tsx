"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import type { SettingsInput } from "@/lib/validations";

export default function SettingsPage(): React.JSX.Element {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      capitalTotal: 10000000,
      maxRiskPercentPerTrade: 2,
      maxOpenPositions: 5,
      defaultBrokerageFee: 0.0015,
      defaultSellFee: 0.0025,
    },
  });

  const capital = watch("capitalTotal");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => { if (j.data) reset(j.data); });
  }, [reset]);

  async function onSubmit(data: SettingsInput): Promise<void> {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground text-sm">Profil risiko dan preferensi trading Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modal & Risiko</CardTitle>
            <CardDescription>Konfigurasi modal total dan batas risiko per transaksi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Total Modal (IDR)</Label>
              <CurrencyInput value={capital} onChange={(v) => setValue("capitalTotal", v)} />
              {errors.capitalTotal && <p className="text-xs text-red-500">{errors.capitalTotal.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Maksimum Risiko per Transaksi (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min={0.1}
                  max={100}
                  {...register("maxRiskPercentPerTrade", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              </div>
              {errors.maxRiskPercentPerTrade && (
                <p className="text-xs text-red-500">{errors.maxRiskPercentPerTrade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Maksimum Posisi Terbuka</Label>
              <Input
                type="number"
                min={1}
                {...register("maxOpenPositions", { valueAsNumber: true })}
              />
              {errors.maxOpenPositions && <p className="text-xs text-red-500">{errors.maxOpenPositions.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biaya Broker</CardTitle>
            <CardDescription>Fee standar IDX. 0.0015 = 0.15%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fee Beli (default: 0.0015)</Label>
              <Input
                type="number"
                step="0.0001"
                {...register("defaultBrokerageFee", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fee Jual (default: 0.0025)</Label>
              <Input
                type="number"
                step="0.0001"
                {...register("defaultSellFee", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
          {saved && <span className="text-sm text-emerald-600">Tersimpan!</span>}
        </div>
      </form>
    </div>
  );
}

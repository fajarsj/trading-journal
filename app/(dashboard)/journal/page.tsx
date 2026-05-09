"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import type { JournalEntry } from "@/types/trading";

const schema = z.object({
  date: z.string().min(1),
  marketCondition: z.enum(["BULLISH", "BEARISH", "SIDEWAYS", "VOLATILE"]),
  body: z.string().min(1, "Catatan tidak boleh kosong"),
  mood: z.enum(["GREAT", "GOOD", "NEUTRAL", "BAD", "TERRIBLE"]),
});

type FormValues = z.infer<typeof schema>;

const moodEmoji: Record<string, string> = {
  GREAT: "😄", GOOD: "🙂", NEUTRAL: "😐", BAD: "😔", TERRIBLE: "😞",
};

const conditionColor: Record<string, string> = {
  BULLISH: "success", BEARISH: "danger", SIDEWAYS: "secondary", VOLATILE: "warning",
};

export default function JournalPage(): React.JSX.Element {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        date: new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
        marketCondition: "SIDEWAYS",
        mood: "NEUTRAL",
        body: "",
      },
    });

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((j) => setEntries(j.data ?? []));
  }, []);

  async function onSubmit(data: FormValues): Promise<void> {
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.data) {
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.date === json.data.date);
        return idx >= 0 ? prev.map((e, i) => (i === idx ? json.data : e)) : [json.data, ...prev];
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      reset();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jurnal Trading</h1>
        <p className="text-muted-foreground text-sm">Catat kondisi market dan refleksi harian Anda</p>
      </div>

      {/* New entry form */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tambah Entri Harian</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    setValue("date", d.toISOString());
                  }}
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kondisi Market</Label>
                <Select
                  defaultValue="SIDEWAYS"
                  onValueChange={(v) => setValue("marketCondition", v as FormValues["marketCondition"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BULLISH">Bullish 📈</SelectItem>
                    <SelectItem value="BEARISH">Bearish 📉</SelectItem>
                    <SelectItem value="SIDEWAYS">Sideways ↔</SelectItem>
                    <SelectItem value="VOLATILE">Volatile ⚡</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mood</Label>
                <Select
                  defaultValue="NEUTRAL"
                  onValueChange={(v) => setValue("mood", v as FormValues["mood"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(moodEmoji).map(([v, e]) => (
                      <SelectItem key={v} value={v}>{e} {v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                {...register("body")}
                rows={4}
                placeholder="Bagaimana kondisi market hari ini? Apa yang Anda pelajari? Keputusan apa yang Anda ambil?"
              />
              {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Entri"}
              </Button>
              {saved && <span className="text-sm text-emerald-600">Tersimpan!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Past entries */}
      <div className="space-y-4">
        {entries.length === 0 && (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Belum ada entri jurnal. Mulai catat refleksi trading Anda!
          </div>
        )}
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{formatDate(entry.date)}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={conditionColor[entry.marketCondition] as "success" | "danger" | "secondary" | "warning"}>
                    {entry.marketCondition}
                  </Badge>
                  <span className="text-lg">{moodEmoji[entry.mood]}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{entry.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

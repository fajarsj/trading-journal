"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPercent } from "@/lib/formatters";
import type { Trade } from "@/types/trading";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

export default function TradeDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  // Close trade form state
  const [exitPrice, setExitPrice] = useState(0);
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 16));
  const [exitReason, setExitReason] = useState("");
  const [exitEmotion, setExitEmotion] = useState("");
  const [exitNotes, setExitNotes] = useState("");

  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then((r) => r.json())
      .then((j) => setTrade(j.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleClose(): Promise<void> {
    if (!exitPrice || !exitDate) return;
    setClosing(true);
    await fetch(`/api/trades/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exitPrice,
        exitDate: new Date(exitDate).toISOString(),
        exitReason: exitReason || undefined,
        emotionExit: exitEmotion || undefined,
        notes: exitNotes || trade?.notes,
      }),
    });
    router.push("/trades");
    router.refresh();
  }

  async function handleDelete(): Promise<void> {
    if (!confirm("Hapus transaksi ini?")) return;
    await fetch(`/api/trades/${id}`, { method: "DELETE" });
    router.push("/trades");
    router.refresh();
  }

  if (loading) {
    return <div className="text-muted-foreground">Memuat data...</div>;
  }
  if (!trade) {
    return <div className="text-muted-foreground">Transaksi tidak ditemukan.</div>;
  }

  const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
    OPEN: "warning", CLOSED: "secondary", CANCELLED: "danger",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{trade.symbol}</h1>
            <Badge variant={statusVariant[trade.status]}>{trade.status}</Badge>
            <span className={`flex items-center gap-1 text-sm font-medium ${trade.direction === "LONG" ? "text-emerald-600" : "text-red-500"}`}>
              {trade.direction === "LONG" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {trade.direction}
            </span>
          </div>
          {trade.stockName && <p className="text-muted-foreground text-sm">{trade.stockName}</p>}
        </div>
      </div>

      {/* Entry details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Detail Entry</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Tanggal Entry" value={formatDate(trade.entryDate)} />
          <Row label="Harga Entry" value={<CurrencyDisplay amount={trade.entryPrice} />} />
          <Row label="Lot" value={`${trade.lotSize} lot (${trade.shares.toLocaleString("id-ID")} lembar)`} />
          <Row label="Nilai Entry" value={<CurrencyDisplay amount={trade.entryValue} />} />
          <Row label="Fee Beli" value={<CurrencyDisplay amount={trade.brokerageFeeEntry} />} />
          {trade.stopLossPrice != null && (
            <Row label="Stop Loss" value={<CurrencyDisplay amount={trade.stopLossPrice} />} />
          )}
          {trade.takeProfitPrice != null && (
            <Row label="Take Profit" value={<CurrencyDisplay amount={trade.takeProfitPrice} />} />
          )}
          {trade.riskAmount != null && (
            <Row label="Risiko" value={
              <span>
                <CurrencyDisplay amount={trade.riskAmount} />
                {trade.riskPercent != null && ` (${formatPercent(trade.riskPercent)})`}
              </span>
            } />
          )}
          {trade.rewardRiskRatio != null && (
            <Row label="R:R Direncanakan" value={`1:${Number(trade.rewardRiskRatio).toFixed(2)}`} />
          )}
          {trade.strategy && <Row label="Strategi" value={trade.strategy} />}
          {trade.sector && <Row label="Sektor" value={trade.sector} />}
          {trade.emotionEntry && <Row label="Emosi Entry" value={trade.emotionEntry} />}
          {trade.notes && (
            <div>
              <p className="text-muted-foreground mb-1">Catatan</p>
              <p className="whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exit details */}
      {trade.status === "CLOSED" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Detail Exit</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {trade.exitDate && <Row label="Tanggal Exit" value={formatDate(trade.exitDate)} />}
            {trade.exitPrice != null && <Row label="Harga Exit" value={<CurrencyDisplay amount={trade.exitPrice} />} />}
            {trade.exitValue != null && <Row label="Nilai Exit" value={<CurrencyDisplay amount={trade.exitValue} />} />}
            {trade.brokerageFeeExit != null && <Row label="Fee Jual" value={<CurrencyDisplay amount={trade.brokerageFeeExit} />} />}
            {trade.realizedPnL != null && (
              <Row
                label="Realized PnL"
                value={
                  <span className={trade.realizedPnL >= 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                    <CurrencyDisplay amount={trade.realizedPnL} colorize />
                    {trade.realizedPnLPercent != null && ` (${formatPercent(trade.realizedPnLPercent)})`}
                  </span>
                }
              />
            )}
            {trade.exitReason && <Row label="Alasan Exit" value={trade.exitReason} />}
            {trade.emotionExit && <Row label="Emosi Exit" value={trade.emotionExit} />}
          </CardContent>
        </Card>
      )}

      {/* Close trade form */}
      {trade.status === "OPEN" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tutup Transaksi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Exit</Label>
                <CurrencyInput value={exitPrice} onChange={setExitPrice} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Exit</Label>
                <Input type="datetime-local" value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Alasan Exit</Label>
                <Select onValueChange={setExitReason}>
                  <SelectTrigger><SelectValue placeholder="Pilih alasan..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TAKE_PROFIT">Take Profit</SelectItem>
                    <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emosi Saat Exit</Label>
                <Select onValueChange={setExitEmotion}>
                  <SelectTrigger><SelectValue placeholder="Pilih emosi..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SATISFIED">Satisfied</SelectItem>
                    <SelectItem value="REGRET">Regret</SelectItem>
                    <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    <SelectItem value="FEAR">Fear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catatan Exit</Label>
              <Textarea value={exitNotes} onChange={(e) => setExitNotes(e.target.value)} placeholder="Alasan keluar..." rows={2} />
            </div>
            <Button onClick={handleClose} disabled={closing || exitPrice === 0}>
              {closing ? "Menutup..." : "Tutup Transaksi"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />
      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Hapus Transaksi
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

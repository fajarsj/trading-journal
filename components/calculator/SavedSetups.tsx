"use client";

import { useState, useEffect } from "react";
import { useCalculatorStore, type CalculatorSnapshot } from "@/store/calculatorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Save, Trash2, FolderOpen } from "lucide-react";
import { formatIDR } from "@/lib/formatters";

const LS_KEY = "calculator_saved_setups";

function readStorage(): CalculatorSnapshot[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as CalculatorSnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(setups: CalculatorSnapshot[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(setups));
}

export function SavedSetups(): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [setups, setSetups] = useState<CalculatorSnapshot[]>([]);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const store = useCalculatorStore();

  useEffect(() => {
    setMounted(true);
    setSetups(readStorage());
  }, []);

  if (!mounted) return <></>;

  function handleSave(): void {
    const label = name.trim() || `Setup ${new Date().toLocaleDateString("id-ID")}`;
    const snapshot: CalculatorSnapshot = {
      id: crypto.randomUUID(),
      name: label,
      savedAt: new Date().toISOString(),
      capitalIDR: store.capitalIDR,
      riskPercent: store.riskPercent,
      entries: store.entries,
      stopLossPrice: store.stopLossPrice,
      takeProfitPrice: store.takeProfitPrice,
      buyFeeRate: store.buyFeeRate,
      sellFeeRate: store.sellFeeRate,
    };
    const next = [snapshot, ...setups];
    setSetups(next);
    writeStorage(next);
    setName("");
    setSaving(false);
  }

  function handleDelete(id: string): void {
    const next = setups.filter((s) => s.id !== id);
    setSetups(next);
    writeStorage(next);
  }

  const entryLabel = (snap: CalculatorSnapshot): string => {
    if (snap.entries.length === 1) {
      return snap.entries[0].price > 0 ? `Entry ${formatIDR(snap.entries[0].price)}` : "Entry —";
    }
    return `${snap.entries.length} entries`;
  };

  return (
    <div className="space-y-3">
      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Setup Tersimpan</span>
        {!saving ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSaving(true)}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Simpan Setup Ini
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              placeholder="Nama setup..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setSaving(false);
                  setName("");
                }
              }}
              className="h-8 w-36 text-sm"
            />
            <Button size="sm" onClick={handleSave} className="h-8">
              Simpan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSaving(false);
                setName("");
              }}
              className="h-8"
            >
              Batal
            </Button>
          </div>
        )}
      </div>

      {setups.length === 0 ? (
        <p className="text-xs text-muted-foreground">Belum ada setup tersimpan.</p>
      ) : (
        <ul className="space-y-2">
          {setups.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {entryLabel(s)} · SL {s.stopLossPrice > 0 ? formatIDR(s.stopLossPrice) : "—"} · Risk{" "}
                  {s.riskPercent}%
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => store.loadSnapshot(s)}
                  className="h-7 gap-1 text-xs"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Muat
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { create } from "zustand";

export interface EntryLeg {
  id: string;
  price: number;
  manualLots: number;
  isAuto: boolean;
}

export interface CalculatorSnapshot {
  id: string;
  name: string;
  savedAt: string;
  capitalIDR: number;
  riskPercent: number;
  entries: EntryLeg[];
  stopLossPrice: number;
  takeProfitPrice: number;
  buyFeeRate: number;
  sellFeeRate: number;
}

interface CalculatorState {
  capitalIDR: number;
  riskPercent: number;
  entries: EntryLeg[];
  stopLossPrice: number;
  takeProfitPrice: number;
  buyFeeRate: number;
  sellFeeRate: number;
  setCapitalIDR: (v: number) => void;
  setRiskPercent: (v: number) => void;
  setStopLossPrice: (v: number) => void;
  setTakeProfitPrice: (v: number) => void;
  setBuyFeeRate: (v: number) => void;
  setSellFeeRate: (v: number) => void;
  addEntry: () => void;
  removeEntry: (id: string) => void;
  updateEntryPrice: (id: string, price: number) => void;
  updateEntryLots: (id: string, lots: number) => void;
  toggleEntryAuto: (id: string) => void;
  loadSnapshot: (snap: CalculatorSnapshot) => void;
  reset: () => void;
}

function newLeg(price = 0): EntryLeg {
  return { id: crypto.randomUUID(), price, manualLots: 1, isAuto: true };
}

const DEFAULT_STATE = {
  capitalIDR: 0,
  riskPercent: 2,
  entries: [newLeg()],
  stopLossPrice: 0,
  takeProfitPrice: 0,
  buyFeeRate: 0.0015,
  sellFeeRate: 0.0025,
};

export const useCalculatorStore = create<CalculatorState>((set) => ({
  ...DEFAULT_STATE,
  setCapitalIDR: (v) => set({ capitalIDR: v }),
  setRiskPercent: (v) => set({ riskPercent: v }),
  setStopLossPrice: (v) => set({ stopLossPrice: v }),
  setTakeProfitPrice: (v) => set({ takeProfitPrice: v }),
  setBuyFeeRate: (v) => set({ buyFeeRate: v }),
  setSellFeeRate: (v) => set({ sellFeeRate: v }),
  addEntry: () =>
    set((s) => ({ entries: [...s.entries, newLeg()] })),
  removeEntry: (id) =>
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
  updateEntryPrice: (id, price) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, price } : e)),
    })),
  updateEntryLots: (id, lots) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, manualLots: lots, isAuto: false } : e
      ),
    })),
  toggleEntryAuto: (id) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, isAuto: !e.isAuto } : e
      ),
    })),
  loadSnapshot: (snap) =>
    set({
      capitalIDR: snap.capitalIDR,
      riskPercent: snap.riskPercent,
      entries: snap.entries.map((e) => ({ ...e, id: crypto.randomUUID() })),
      stopLossPrice: snap.stopLossPrice,
      takeProfitPrice: snap.takeProfitPrice,
      buyFeeRate: snap.buyFeeRate,
      sellFeeRate: snap.sellFeeRate,
    }),
  reset: () => set({ ...DEFAULT_STATE, entries: [newLeg()] }),
}));

"use client";

import useSWR from "swr";
import type { ChecklistTodayResponse } from "@/app/api/checklist/today/route";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((r: { data: ChecklistTodayResponse }) => r.data);

export function useChecklist() {
  const { data, error, isLoading, mutate } = useSWR<ChecklistTodayResponse>(
    "/api/checklist/today",
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  async function toggleItem(completionId: number, isChecked: boolean): Promise<void> {
    // Optimistic update
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          sections: current.sections.map((sec) => ({
            ...sec,
            items: sec.items.map((item) =>
              item.id === completionId ? { ...item, isChecked } : item
            ),
            completionRate:
              sec.items.filter((item) =>
                item.id === completionId ? isChecked : item.isChecked
              ).length / sec.items.length,
          })),
          completedItems: current.sections
            .flatMap((s) => s.items)
            .filter((item) => (item.id === completionId ? isChecked : item.isChecked)).length,
        };
      },
      false
    );

    await fetch(`/api/checklist/today/items/${completionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isChecked }),
    });
    mutate();
  }

  async function saveInputValue(completionId: number, inputValue: string): Promise<void> {
    await fetch(`/api/checklist/today/items/${completionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputValue }),
    });
    mutate();
  }

  async function saveNotes(notes: string): Promise<void> {
    await fetch("/api/checklist/today", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    mutate();
  }

  async function resetChecklist(): Promise<void> {
    await fetch("/api/checklist/today/reset", { method: "DELETE" });
    mutate();
  }

  async function saveRegime(marketRegime: string): Promise<void> {
    mutate(
      (current) => current ? { ...current, marketRegime, marketRegimeSetAt: new Date().toISOString() } : current,
      false
    );
    await fetch("/api/checklist/today/regime", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketRegime }),
    });
    mutate();
  }

  async function saveRules(acknowledgedRules: string[]): Promise<void> {
    mutate(
      (current) =>
        current
          ? {
              ...current,
              rulesAcknowledged: true,
              rulesAcknowledgedAt: new Date().toISOString(),
              acknowledgedRules,
            }
          : current,
      false
    );
    await fetch("/api/checklist/today/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acknowledgedRules }),
    });
    mutate();
  }

  return { checklist: data, isLoading, error, toggleItem, saveInputValue, saveNotes, resetChecklist, saveRegime, saveRules, mutate };
}

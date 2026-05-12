import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWIBToday } from "@/lib/timezone";
import { z } from "zod";
import type { ApiResponse } from "@/types/trading";

export interface ChecklistItemResponse {
  id: number;           // completion id
  itemId: number;
  label: string;
  note: string | null;
  hasInput: boolean;
  inputPlaceholder: string | null;
  isCritical: boolean;
  isChecked: boolean;
  inputValue: string | null;
  checkedAt: string | null;
}

export interface ChecklistSectionResponse {
  section: string;
  sectionLabel: string;
  isCritical: boolean;
  completionRate: number;
  items: ChecklistItemResponse[];
}

export interface ChecklistTodayResponse {
  id: number;
  date: string;
  isReady: boolean;
  completedItems: number;
  totalItems: number;
  notes: string | null;
  marketRegime: string | null;
  marketRegimeSetAt: string | null;
  rulesAcknowledged: boolean;
  rulesAcknowledgedAt: string | null;
  acknowledgedRules: string[] | null;
  sections: ChecklistSectionResponse[];
}

async function getOrCreateToday(): Promise<ChecklistTodayResponse> {
  const today = getWIBToday();

  const existing = await prisma.dailyChecklist.findUnique({
    where: { date: today },
    include: {
      completions: {
        include: { checklistItem: true },
        orderBy: [
          { checklistItem: { section: "asc" } },
          { checklistItem: { order: "asc" } },
        ],
      },
    },
  });

  if (existing) return serialize(existing);

  // Auto-init: create DailyChecklist + one completion per active item
  const activeItems = await prisma.checklistItem.findMany({
    where: { isActive: true },
    orderBy: [{ section: "asc" }, { order: "asc" }],
  });

  const daily = await prisma.$transaction(async (tx) => {
    const d = await tx.dailyChecklist.create({
      data: {
        date: today,
        totalItems: activeItems.length,
        completedItems: 0,
        isReady: false,
      },
    });
    await tx.dailyChecklistCompletion.createMany({
      data: activeItems.map((item) => ({
        dailyChecklistId: d.id,
        checklistItemId: item.id,
        isChecked: false,
      })),
    });
    return tx.dailyChecklist.findUnique({
      where: { id: d.id },
      include: {
        completions: {
          include: { checklistItem: true },
          orderBy: [
            { checklistItem: { section: "asc" } },
            { checklistItem: { order: "asc" } },
          ],
        },
      },
    });
  });

  return serialize(daily!);
}

interface DailyWithCompletions {
  id: number;
  date: Date;
  isReady: boolean;
  totalItems: number;
  completedItems: number;
  notes: string | null;
  marketRegime: string | null;
  marketRegimeSetAt: Date | null;
  rulesAcknowledged: boolean;
  rulesAcknowledgedAt: Date | null;
  acknowledgedRules: unknown;
  completions: Array<{
    id: number;
    isChecked: boolean;
    inputValue: string | null;
    checkedAt: Date | null;
    checklistItem: {
      id: number;
      section: string;
      sectionLabel: string;
      isCritical: boolean;
      label: string;
      note: string | null;
      hasInput: boolean;
      inputPlaceholder: string | null;
    };
  }>;
}

function serialize(daily: DailyWithCompletions): ChecklistTodayResponse {
  // Group completions by section
  const sectionMap = new Map<string, ChecklistSectionResponse>();
  for (const c of daily.completions) {
    const item = c.checklistItem;
    if (!sectionMap.has(item.section)) {
      sectionMap.set(item.section, {
        section: item.section,
        sectionLabel: item.sectionLabel,
        isCritical: item.isCritical,
        completionRate: 0,
        items: [],
      });
    }
    sectionMap.get(item.section)!.items.push({
      id: c.id,
      itemId: item.id,
      label: item.label,
      note: item.note,
      hasInput: item.hasInput,
      inputPlaceholder: item.inputPlaceholder,
      isCritical: item.isCritical,
      isChecked: c.isChecked,
      inputValue: c.inputValue,
      checkedAt: c.checkedAt ? c.checkedAt.toISOString() : null,
    });
  }

  // Compute completion rate per section
  const sections = Array.from(sectionMap.values()).map((sec) => ({
    ...sec,
    completionRate:
      sec.items.length > 0
        ? sec.items.filter((i) => i.isChecked).length / sec.items.length
        : 0,
  }));

  const rules = daily.acknowledgedRules;
  const acknowledgedRules = Array.isArray(rules) ? (rules as string[]) : null;

  return {
    id: daily.id,
    date: daily.date.toISOString(),
    isReady: daily.isReady,
    completedItems: daily.completedItems,
    totalItems: daily.totalItems,
    notes: daily.notes,
    marketRegime: daily.marketRegime,
    marketRegimeSetAt: daily.marketRegimeSetAt ? daily.marketRegimeSetAt.toISOString() : null,
    rulesAcknowledged: daily.rulesAcknowledged,
    rulesAcknowledgedAt: daily.rulesAcknowledgedAt ? daily.rulesAcknowledgedAt.toISOString() : null,
    acknowledgedRules,
    sections,
  };
}

export async function GET(): Promise<NextResponse<ApiResponse<ChecklistTodayResponse>>> {
  try {
    const data = await getOrCreateToday();
    return NextResponse.json({ data, error: null });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch checklist", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

const notesSchema = z.object({ notes: z.string() });

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<{ notes: string | null }>>> {
  try {
    const body = await req.json();
    const parsed = notesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    const today = getWIBToday();
    const daily = await prisma.dailyChecklist.findUnique({ where: { date: today } });
    if (!daily) {
      return NextResponse.json(
        { data: null, error: { message: "No checklist for today", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }
    const updated = await prisma.dailyChecklist.update({
      where: { id: daily.id },
      data: { notes: parsed.data.notes },
    });
    return NextResponse.json({ data: { notes: updated.notes }, error: null });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to update notes", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

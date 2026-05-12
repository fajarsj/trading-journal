import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWIBToday } from "@/lib/timezone";
import type { ApiResponse } from "@/types/trading";

export async function DELETE(): Promise<NextResponse<ApiResponse<{ ok: boolean }>>> {
  try {
    const today = getWIBToday();
    const daily = await prisma.dailyChecklist.findUnique({ where: { date: today } });
    if (!daily) {
      return NextResponse.json({ data: { ok: true }, error: null });
    }
    await prisma.$transaction([
      prisma.dailyChecklistCompletion.updateMany({
        where: { dailyChecklistId: daily.id },
        data: { isChecked: false, inputValue: null, checkedAt: null },
      }),
      prisma.dailyChecklist.update({
        where: { id: daily.id },
        data: { completedItems: 0, isReady: false },
      }),
    ]);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to reset checklist", code: "RESET_ERROR" } },
      { status: 500 }
    );
  }
}

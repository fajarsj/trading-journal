import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ApiResponse } from "@/types/trading";

const patchSchema = z.object({
  isChecked: z.boolean().optional(),
  inputValue: z.string().optional(),
});

interface DailySummary {
  completedItems: number;
  totalItems: number;
  isReady: boolean;
}

type RouteContext = { params: Promise<{ completionId: string }> };

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<DailySummary>>> {
  const { completionId } = await params;
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const id = Number(completionId);
    const { isChecked, inputValue } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      // Update the completion record
      const completion = await tx.dailyChecklistCompletion.update({
        where: { id },
        data: {
          ...(isChecked !== undefined && {
            isChecked,
            checkedAt: isChecked ? new Date() : null,
          }),
          ...(inputValue !== undefined && { inputValue }),
        },
        include: {
          dailyChecklist: {
            include: {
              completions: { include: { checklistItem: true } },
            },
          },
        },
      });

      const daily = completion.dailyChecklist;
      const completedItems = daily.completions.filter((c) => c.isChecked).length;

      // isReady = all critical-section items are checked
      const criticalItems = daily.completions.filter((c) => c.checklistItem.isCritical);
      const isReady = criticalItems.length > 0 && criticalItems.every((c) => c.isChecked);

      await tx.dailyChecklist.update({
        where: { id: daily.id },
        data: { completedItems, isReady },
      });

      return { completedItems, totalItems: daily.totalItems, isReady };
    });

    return NextResponse.json({ data: updated, error: null });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to update item", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWIBToday } from "@/lib/timezone";
import { z } from "zod";
import type { ApiResponse } from "@/types/trading";

const rulesSchema = z.object({
  acknowledgedRules: z.array(z.string()).min(1),
});

interface RulesResponse {
  rulesAcknowledged: boolean;
  rulesAcknowledgedAt: string;
  acknowledgedRules: string[];
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<RulesResponse>>> {
  try {
    const body = await req.json();
    const parsed = rulesSchema.safeParse(body);
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

    const now = new Date();
    const updated = await prisma.dailyChecklist.update({
      where: { id: daily.id },
      data: {
        rulesAcknowledged: true,
        rulesAcknowledgedAt: now,
        acknowledgedRules: parsed.data.acknowledgedRules,
      },
    });

    return NextResponse.json({
      data: {
        rulesAcknowledged: updated.rulesAcknowledged,
        rulesAcknowledgedAt: now.toISOString(),
        acknowledgedRules: parsed.data.acknowledgedRules,
      },
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to save rules acknowledgment", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWIBToday } from "@/lib/timezone";
import { z } from "zod";
import type { ApiResponse } from "@/types/trading";
import type { MarketRegime } from "@/lib/trading-rules";

const regimeSchema = z.object({
  marketRegime: z.enum(["UPTREND", "SIDEWAYS", "DOWNTREND", "VOLATILE"]),
});

interface RegimeResponse {
  marketRegime: MarketRegime;
  marketRegimeSetAt: string;
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<RegimeResponse>>> {
  try {
    const body = await req.json();
    const parsed = regimeSchema.safeParse(body);
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
        marketRegime: parsed.data.marketRegime,
        marketRegimeSetAt: now,
      },
    });

    return NextResponse.json({
      data: {
        marketRegime: updated.marketRegime as MarketRegime,
        marketRegimeSetAt: now.toISOString(),
      },
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to save market regime", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

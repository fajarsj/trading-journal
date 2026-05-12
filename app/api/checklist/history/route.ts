import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/trading";

interface HistoryRecord {
  id: number;
  date: string;
  completedItems: number;
  totalItems: number;
  isReady: boolean;
  notes: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<HistoryRecord[]>>> {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit") ?? "30"), 90);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);

    const [records, total] = await Promise.all([
      prisma.dailyChecklist.findMany({
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, date: true, completedItems: true, totalItems: true, isReady: true, notes: true },
      }),
      prisma.dailyChecklist.count(),
    ]);

    return NextResponse.json({
      data: records.map((r) => ({ ...r, date: r.date.toISOString() })),
      error: null,
      meta: { total, page, limit },
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch history", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

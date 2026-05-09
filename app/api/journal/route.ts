import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { journalEntrySchema } from "@/lib/validations";
import type { ApiResponse, JournalEntry } from "@/types/trading";

export async function GET(): Promise<NextResponse<ApiResponse<JournalEntry[]>>> {
  try {
    const entries = await prisma.journalEntry.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({
      data: entries.map((e) => ({ ...e, date: e.date.toISOString() })) as JournalEntry[],
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch journal entries", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<JournalEntry>>> {
  try {
    const body = await req.json();
    const parsed = journalEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    const entry = await prisma.journalEntry.upsert({
      where: { date: new Date(parsed.data.date) },
      update: {
        marketCondition: parsed.data.marketCondition,
        body: parsed.data.body,
        mood: parsed.data.mood,
      },
      create: {
        date: new Date(parsed.data.date),
        marketCondition: parsed.data.marketCondition,
        body: parsed.data.body,
        mood: parsed.data.mood,
      },
    });
    return NextResponse.json(
      { data: { ...entry, date: entry.date.toISOString() } as JournalEntry, error: null },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to save journal entry", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}

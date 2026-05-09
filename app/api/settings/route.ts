import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations";
import type { ApiResponse, UserSettings } from "@/types/trading";

export async function GET(): Promise<NextResponse<ApiResponse<UserSettings>>> {
  try {
    let settings = await prisma.userSettings.findFirst();
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          capitalTotal: 10000000,
          maxRiskPercentPerTrade: 2,
          maxOpenPositions: 5,
          defaultBrokerageFee: 0.0015,
          defaultSellFee: 0.0025,
        },
      });
    }
    return NextResponse.json({
      data: {
        ...settings,
        capitalTotal: Number(settings.capitalTotal),
        maxRiskPercentPerTrade: Number(settings.maxRiskPercentPerTrade),
        defaultBrokerageFee: Number(settings.defaultBrokerageFee),
        defaultSellFee: Number(settings.defaultSellFee),
        updatedAt: settings.updatedAt.toISOString(),
      },
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch settings", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<UserSettings>>> {
  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    const existing = await prisma.userSettings.findFirst();
    const settings = existing
      ? await prisma.userSettings.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.userSettings.create({ data: parsed.data });

    return NextResponse.json({
      data: {
        ...settings,
        capitalTotal: Number(settings.capitalTotal),
        maxRiskPercentPerTrade: Number(settings.maxRiskPercentPerTrade),
        defaultBrokerageFee: Number(settings.defaultBrokerageFee),
        defaultSellFee: Number(settings.defaultSellFee),
        updatedAt: settings.updatedAt.toISOString(),
      },
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to update settings", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

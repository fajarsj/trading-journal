import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTradeSchema } from "@/lib/validations";
import {
  calculateBrokerageFee,
  calculateRealizedPnL,
} from "@/lib/calculations";
import type { ApiResponse, Trade } from "@/types/trading";

function serializeTrade(t: Record<string, unknown>): Trade {
  return {
    ...t,
    entryPrice: Number(t.entryPrice),
    exitPrice: t.exitPrice != null ? Number(t.exitPrice) : null,
    entryValue: Number(t.entryValue),
    exitValue: t.exitValue != null ? Number(t.exitValue) : null,
    brokerageFeeEntry: Number(t.brokerageFeeEntry),
    brokerageFeeExit: t.brokerageFeeExit != null ? Number(t.brokerageFeeExit) : null,
    stopLossPrice: t.stopLossPrice != null ? Number(t.stopLossPrice) : null,
    takeProfitPrice: t.takeProfitPrice != null ? Number(t.takeProfitPrice) : null,
    riskAmount: t.riskAmount != null ? Number(t.riskAmount) : null,
    riskPercent: t.riskPercent != null ? Number(t.riskPercent) : null,
    rewardRiskRatio: t.rewardRiskRatio != null ? Number(t.rewardRiskRatio) : null,
    realizedPnL: t.realizedPnL != null ? Number(t.realizedPnL) : null,
    realizedPnLPercent: t.realizedPnLPercent != null ? Number(t.realizedPnLPercent) : null,
  } as Trade;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Trade>>> {
  const { id } = await params;
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: Number(id), deletedAt: null },
    });
    if (!trade) {
      return NextResponse.json(
        { data: null, error: { message: "Trade not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }
    return NextResponse.json({
      data: serializeTrade(trade as unknown as Record<string, unknown>),
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch trade", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Trade>>> {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = updateTradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    const existing = await prisma.trade.findFirst({
      where: { id: Number(id), deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json(
        { data: null, error: { message: "Trade not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const d = parsed.data;
    const updateData: Record<string, unknown> = { ...d };

    // Auto-compute closing fields when exitPrice and exitDate are provided
    if (d.exitPrice != null && d.exitDate != null) {
      const settings = await prisma.userSettings.findFirst();
      const sellFeeRate = settings ? Number(settings.defaultSellFee) : 0.0025;
      const shares = existing.shares;
      const exitValue = d.exitPrice * shares;
      const brokerageFeeExit = calculateBrokerageFee(exitValue, sellFeeRate);
      const realizedPnL = calculateRealizedPnL(
        Number(existing.entryValue),
        exitValue,
        Number(existing.brokerageFeeEntry),
        brokerageFeeExit
      );
      const realizedPnLPercent = (realizedPnL / Number(existing.entryValue)) * 100;

      updateData.exitValue = exitValue;
      updateData.brokerageFeeExit = brokerageFeeExit;
      updateData.realizedPnL = realizedPnL;
      updateData.realizedPnLPercent = realizedPnLPercent;
      updateData.status = "CLOSED";
    }

    if (d.exitDate) updateData.exitDate = new Date(d.exitDate);
    if (d.entryDate) updateData.entryDate = new Date(d.entryDate);

    const trade = await prisma.trade.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return NextResponse.json({
      data: serializeTrade(trade as unknown as Record<string, unknown>),
      error: null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to update trade", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<{ id: number }>>> {
  const { id } = await params;
  try {
    await prisma.trade.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ data: { id: Number(id) }, error: null });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to delete trade", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}

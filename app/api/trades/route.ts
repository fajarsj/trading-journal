import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTradeSchema, tradeQuerySchema } from "@/lib/validations";
import { calculateBrokerageFee, calculateRiskAmount, calculateRiskPercent, calculateRewardRiskRatio } from "@/lib/calculations";
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

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Trade[]>>> {
  try {
    const { searchParams } = req.nextUrl;
    const query = tradeQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json(
        { data: null, error: { message: query.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    const { status, symbol, strategy, dateFrom, dateTo, page, limit } = query.data;
    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(symbol && { symbol: { contains: symbol.toUpperCase() } }),
      ...(strategy && { strategy: { contains: strategy } }),
      ...(dateFrom || dateTo
        ? {
            entryDate: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { entryDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trade.count({ where }),
    ]);
    return NextResponse.json({
      data: trades.map((t) => serializeTrade(t as unknown as Record<string, unknown>)),
      error: null,
      meta: { total, page, limit },
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch trades", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Trade>>> {
  try {
    const body = await req.json();
    const parsed = createTradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const shares = d.lotSize * 100;
    const entryValue = d.entryPrice * shares;

    const settings = await prisma.userSettings.findFirst();
    const buyFeeRate = settings ? Number(settings.defaultBrokerageFee) : 0.0015;
    const sellFeeRate = settings ? Number(settings.defaultSellFee) : 0.0025;
    const capital = settings ? Number(settings.capitalTotal) : 0;

    const brokerageFeeEntry = calculateBrokerageFee(entryValue, buyFeeRate);
    const riskAmount =
      d.stopLossPrice != null
        ? calculateRiskAmount(d.entryPrice, d.stopLossPrice, shares)
        : undefined;
    const riskPercent =
      riskAmount != null && capital > 0
        ? calculateRiskPercent(riskAmount, capital)
        : undefined;
    const rewardRiskRatio =
      d.stopLossPrice != null && d.takeProfitPrice != null
        ? calculateRewardRiskRatio(d.entryPrice, d.stopLossPrice, d.takeProfitPrice)
        : undefined;

    const trade = await prisma.trade.create({
      data: {
        symbol: d.symbol,
        stockName: d.stockName,
        direction: d.direction,
        status: "OPEN",
        entryDate: new Date(d.entryDate),
        entryPrice: d.entryPrice,
        lotSize: d.lotSize,
        shares,
        entryValue,
        brokerageFeeEntry,
        stopLossPrice: d.stopLossPrice,
        takeProfitPrice: d.takeProfitPrice,
        riskAmount,
        riskPercent,
        rewardRiskRatio,
        strategy: d.strategy,
        sector: d.sector,
        notes: d.notes,
        emotionEntry: d.emotionEntry,
        tags: d.tags,
      },
    });
    return NextResponse.json(
      { data: serializeTrade(trade as unknown as Record<string, unknown>), error: null },
      { status: 201 }
    );
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { data: null, error: { message: "Failed to create trade", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}

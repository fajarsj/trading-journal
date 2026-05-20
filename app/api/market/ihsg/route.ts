import { NextResponse } from "next/server";
import type { MarketRegime } from "@/lib/trading-rules";

export const dynamic = "force-dynamic";

export interface IHSGIndicators {
  sma20: number;
  sma50: number;
  atr14: number;
  atr14Pct: number;
  roc5: number;
}

export interface IHSGData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: string;
  isMarketOpen: boolean;
  indicators: IHSGIndicators;
  suggestedRegime: MarketRegime;
  confidence: "high" | "medium" | "low";
  reasoning: string[];
}

// Module-level 5-minute cache (best-effort; resets on cold start in serverless)
let _cache: { data: IHSGData; at: number } | null = null;
const CACHE_TTL = 15 * 1000;

function calcSMA(arr: number[], period: number): number {
  const slice = arr.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function calcATR(highs: number[], lows: number[], closes: number[], period: number): number {
  const trs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    trs.push(
      Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      )
    );
  }
  const slice = trs.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function determineRegime(
  price: number,
  sma20: number,
  sma50: number,
  atr14Pct: number,
  roc5: number,
  changePercent: number
): { regime: MarketRegime; confidence: "high" | "medium" | "low"; reasoning: string[] } {
  const r: string[] = [];

  // Volatility check first — overrides trend
  if (atr14Pct > 1.5 || Math.abs(changePercent) > 2.5) {
    r.push(`ATR14 ${atr14Pct.toFixed(2)}% dari harga — volatilitas di atas normal`);
    if (Math.abs(changePercent) > 2.5)
      r.push(`Pergerakan harian ${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}% — gejolak besar`);
    return {
      regime: "VOLATILE",
      confidence: atr14Pct > 2.5 || Math.abs(changePercent) > 3.5 ? "high" : "medium",
      reasoning: r,
    };
  }

  // Uptrend: price above both MAs and positive momentum
  if (price > sma20 && sma20 > sma50 && roc5 > 0) {
    r.push(`IHSG ${price.toFixed(0)} > MA20 ${sma20.toFixed(0)} > MA50 ${sma50.toFixed(0)}`);
    r.push(`ROC 5-hari: +${roc5.toFixed(2)}% — momentum positif`);
    return {
      regime: "UPTREND",
      confidence: roc5 > 1.5 ? "high" : "medium",
      reasoning: r,
    };
  }

  // Downtrend: price below both MAs and negative momentum
  if (price < sma20 && sma20 < sma50 && roc5 < 0) {
    r.push(`IHSG ${price.toFixed(0)} < MA20 ${sma20.toFixed(0)} < MA50 ${sma50.toFixed(0)}`);
    r.push(`ROC 5-hari: ${roc5.toFixed(2)}% — tekanan jual berlanjut`);
    return {
      regime: "DOWNTREND",
      confidence: roc5 < -1.5 ? "high" : "medium",
      reasoning: r,
    };
  }

  // Sideways: price between MAs or mixed signals
  r.push(`IHSG bergerak di antara MA20 ${sma20.toFixed(0)} dan MA50 ${sma50.toFixed(0)}`);
  r.push(`ROC 5-hari: ${roc5 >= 0 ? "+" : ""}${roc5.toFixed(2)}% — tidak ada tren dominan`);
  return { regime: "SIDEWAYS", confidence: "medium", reasoning: r };
}

function isWIBMarketOpen(): boolean {
  const wib = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const day = wib.getDay();
  if (day === 0 || day === 6) return false;
  const mins = wib.getHours() * 60 + wib.getMinutes();
  // BEI session 1: 09:00–11:30, session 2: 13:30–15:50
  return (mins >= 540 && mins <= 690) || (mins >= 810 && mins <= 950);
}

export async function GET(): Promise<NextResponse> {
  if (_cache && Date.now() - _cache.at < CACHE_TTL) {
    return NextResponse.json({ data: _cache.data, error: null });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE?interval=1d&range=60d",
      {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Yahoo Finance: HTTP ${res.status}`);

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error("Empty chart result");

    const meta = result.meta as {
      regularMarketPrice: number | null;
      regularMarketPreviousClose: number | null;
      previousClose: number | null;
      regularMarketTime: number;
    };
    const rawQuotes = result.indicators?.quote?.[0] as {
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      close: (number | null)[];
    };
    const timestamps: number[] = result.timestamp ?? [];

    // Filter out null entries (holidays, early close)
    const closes: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (
        rawQuotes.close[i] != null &&
        rawQuotes.high[i] != null &&
        rawQuotes.low[i] != null
      ) {
        closes.push(rawQuotes.close[i] as number);
        highs.push(rawQuotes.high[i] as number);
        lows.push(rawQuotes.low[i] as number);
      }
    }

    if (closes.length < 52) throw new Error("Insufficient history");

    const price = meta.regularMarketPrice ?? closes[closes.length - 1];
    // chartPreviousClose = close at chart range start (60d ago), NOT yesterday — never use it here
    const previousClose =
      meta.regularMarketPreviousClose ??
      meta.previousClose ??
      closes[closes.length - 2];
    const change = price - previousClose;
    // Guard: if previousClose is somehow 0 or non-finite, fallback to 0
    const changePercent =
      previousClose && isFinite(price / previousClose)
        ? (change / previousClose) * 100
        : 0;
    const timestamp = new Date(meta.regularMarketTime * 1000).toISOString();

    const sma20 = calcSMA(closes, 20);
    const sma50 = calcSMA(closes, 50);
    const atr14 = calcATR(highs, lows, closes, 14);
    const atr14Pct = (atr14 / price) * 100;
    const roc5 =
      closes.length >= 6
        ? ((closes[closes.length - 1] - closes[closes.length - 6]) /
            closes[closes.length - 6]) *
          100
        : 0;

    const { regime, confidence, reasoning } = determineRegime(
      price,
      sma20,
      sma50,
      atr14Pct,
      roc5,
      changePercent
    );

    const data: IHSGData = {
      price,
      previousClose,
      change,
      changePercent,
      timestamp,
      isMarketOpen: isWIBMarketOpen(),
      indicators: { sma20, sma50, atr14, atr14Pct, roc5 },
      suggestedRegime: regime,
      confidence,
      reasoning,
    };

    _cache = { data, at: Date.now() };
    return NextResponse.json({ data, error: null });
  } catch (e: unknown) {
    clearTimeout(timeout);
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("IHSG fetch error:", message);
    return NextResponse.json(
      { data: null, error: { message: "Gagal mengambil data IHSG", code: "FETCH_ERROR" } },
      { status: 503 }
    );
  }
}

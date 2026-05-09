import type { ClosedTrade, TradeStatistics, PositionSizeResult } from "@/types/trading";

export interface EntryLegInput {
  price: number;
  lots: number;
}

export interface BlendedPositionResult {
  totalLots: number;
  totalShares: number;
  blendedPrice: number;
  totalCapitalRequired: number;
  totalRiskAmount: number;
  riskPercent: number;
}

/**
 * Given a risk budget in IDR and an entry/stop pair, returns the max lots (floored).
 */
export function calculateAutoLots(
  entryPrice: number,
  stopLossPrice: number,
  riskBudgetIDR: number
): number {
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  if (riskPerShare === 0) return 0;
  return Math.floor(riskBudgetIDR / riskPerShare / 100);
}

/**
 * Computes aggregate stats for a multi-entry position.
 * blendedPrice = lot-weighted average of all entry prices.
 * totalRiskAmount = sum of per-leg risk vs a shared stop loss level.
 */
export function calculateBlendedPosition(
  entries: EntryLegInput[],
  stopLossPrice: number,
  capital: number
): BlendedPositionResult {
  const valid = entries.filter((e) => e.lots > 0 && e.price > 0);
  if (valid.length === 0) {
    return { totalLots: 0, totalShares: 0, blendedPrice: 0, totalCapitalRequired: 0, totalRiskAmount: 0, riskPercent: 0 };
  }
  const totalLots = valid.reduce((s, e) => s + e.lots, 0);
  const totalShares = totalLots * 100;
  const weightedSum = valid.reduce((s, e) => s + e.price * (e.lots * 100), 0);
  const blendedPrice = weightedSum / totalShares;
  const totalCapitalRequired = weightedSum;
  const totalRiskAmount = valid.reduce(
    (s, e) => s + Math.abs(e.price - stopLossPrice) * (e.lots * 100),
    0
  );
  const riskPct = capital > 0 ? (totalRiskAmount / capital) * 100 : 0;
  return { totalLots, totalShares, blendedPrice, totalCapitalRequired, totalRiskAmount, riskPercent: riskPct };
}

/**
 * Calculates the recommended position size in lots given risk parameters.
 * Formula: riskAmount = capital × (riskPercent / 100)
 *          riskPerShare = entryPrice - stopLossPrice
 *          shares = riskAmount / riskPerShare
 *          lots = Math.floor(shares / 100)
 */
export function calculatePositionSize(
  capitalIDR: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number
): PositionSizeResult {
  const riskAmount = capitalIDR * (riskPercent / 100);
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  if (riskPerShare === 0) return { lots: 0, shares: 0, riskAmount };
  const rawShares = riskAmount / riskPerShare;
  const lots = Math.floor(rawShares / 100);
  const shares = lots * 100;
  return { lots, shares, riskAmount };
}

/**
 * Returns the IDR amount at risk for a given position.
 * riskAmount = (entryPrice - stopLossPrice) × shares
 */
export function calculateRiskAmount(
  entryPrice: number,
  stopLossPrice: number,
  shares: number
): number {
  return Math.abs(entryPrice - stopLossPrice) * shares;
}

/**
 * Returns the risk as a percentage of total capital.
 */
export function calculateRiskPercent(riskAmount: number, capital: number): number {
  if (capital === 0) return 0;
  return (riskAmount / capital) * 100;
}

/**
 * Calculates the Reward:Risk ratio.
 * ratio = (takeProfitPrice - entryPrice) / (entryPrice - stopLossPrice)
 */
export function calculateRewardRiskRatio(
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number
): number {
  const risk = Math.abs(entryPrice - stopLossPrice);
  if (risk === 0) return 0;
  const reward = Math.abs(takeProfitPrice - entryPrice);
  return reward / risk;
}

/**
 * Calculates the brokerage fee for a trade value.
 * fee = value × feeRate
 */
export function calculateBrokerageFee(value: number, feeRate: number): number {
  return value * feeRate;
}

/**
 * Calculates the break-even exit price after accounting for both buy and sell fees.
 * breakeven = entryPrice × (1 + buyFeeRate) / (1 - sellFeeRate)
 */
export function calculateBreakEvenPrice(
  entryPrice: number,
  buyFeeRate: number,
  sellFeeRate: number
): number {
  if (sellFeeRate >= 1) return entryPrice;
  return (entryPrice * (1 + buyFeeRate)) / (1 - sellFeeRate);
}

/**
 * Calculates realized PnL after all fees.
 * pnl = exitValue - entryValue - entryFee - exitFee
 */
export function calculateRealizedPnL(
  entryValue: number,
  exitValue: number,
  entryFee: number,
  exitFee: number
): number {
  return exitValue - entryValue - entryFee - exitFee;
}

/**
 * Returns the IDX price tick size (fraksi harga) for a given price.
 */
export function getPriceTick(price: number): number {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

/**
 * Rounds a price down to the nearest valid IDX tick.
 */
export function roundToTick(price: number): number {
  const tick = getPriceTick(price);
  return Math.floor(price / tick) * tick;
}

/**
 * Calculates aggregate trade statistics from an array of closed trades.
 */
export function calculateTradeStatistics(trades: ClosedTrade[]): TradeStatistics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      avgRR: 0,
      expectancy: 0,
      totalPnL: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  const winners = trades.filter((t) => t.realizedPnL > 0);
  const losers = trades.filter((t) => t.realizedPnL < 0);

  const totalPnL = trades.reduce((sum, t) => sum + t.realizedPnL, 0);
  const grossProfit = winners.reduce((sum, t) => sum + t.realizedPnL, 0);
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.realizedPnL, 0));

  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
  const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;
  const winRate = (winners.length / trades.length) * 100;

  const rrValues = trades
    .map((t) => t.rewardRiskRatio)
    .filter((v): v is number => v != null && v > 0);
  const avgRR = rrValues.length > 0 ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0;

  const expectancy =
    winRate / 100 * avgWin - (1 - winRate / 100) * avgLoss;

  // Max drawdown: largest peak-to-trough in cumulative PnL
  let peak = 0;
  let cumulative = 0;
  let maxDrawdown = 0;
  for (const trade of trades) {
    cumulative += trade.realizedPnL;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const largestWin = winners.length > 0 ? Math.max(...winners.map((t) => t.realizedPnL)) : 0;
  const largestLoss = losers.length > 0 ? Math.min(...losers.map((t) => t.realizedPnL)) : 0;

  return {
    totalTrades: trades.length,
    winningTrades: winners.length,
    losingTrades: losers.length,
    winRate,
    avgWin,
    avgLoss,
    avgRR,
    expectancy,
    totalPnL,
    maxDrawdown,
    profitFactor,
    largestWin,
    largestLoss: Math.abs(largestLoss),
  };
}

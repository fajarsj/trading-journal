export type Direction = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type ExitReason = "TAKE_PROFIT" | "STOP_LOSS" | "MANUAL" | "EXPIRED";
export type EmotionEntry = "CONFIDENT" | "UNCERTAIN" | "FOMO" | "DISCIPLINED";
export type EmotionExit = "SATISFIED" | "REGRET" | "NEUTRAL" | "FEAR";
export type MarketCondition = "BULLISH" | "BEARISH" | "SIDEWAYS" | "VOLATILE";
export type Mood = "GREAT" | "GOOD" | "NEUTRAL" | "BAD" | "TERRIBLE";

export interface Trade {
  id: number;
  symbol: string;
  stockName?: string | null;
  direction: Direction;
  status: TradeStatus;
  entryDate: Date | string;
  exitDate?: Date | string | null;
  entryPrice: number;
  exitPrice?: number | null;
  lotSize: number;
  shares: number;
  entryValue: number;
  exitValue?: number | null;
  brokerageFeeEntry: number;
  brokerageFeeExit?: number | null;
  stopLossPrice?: number | null;
  takeProfitPrice?: number | null;
  riskAmount?: number | null;
  riskPercent?: number | null;
  rewardRiskRatio?: number | null;
  realizedPnL?: number | null;
  realizedPnLPercent?: number | null;
  strategy?: string | null;
  sector?: string | null;
  notes?: string | null;
  exitReason?: ExitReason | null;
  emotionEntry?: EmotionEntry | null;
  emotionExit?: EmotionExit | null;
  tags?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserSettings {
  id: number;
  capitalTotal: number;
  maxRiskPercentPerTrade: number;
  maxOpenPositions: number;
  defaultBrokerageFee: number;
  defaultSellFee: number;
  updatedAt: Date | string;
}

export interface JournalEntry {
  id: number;
  date: Date | string;
  marketCondition: MarketCondition;
  body: string;
  mood: Mood;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ClosedTrade {
  realizedPnL: number;
  rewardRiskRatio?: number | null;
  entryValue: number;
}

export interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number;
  expectancy: number;
  totalPnL: number;
  maxDrawdown: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
}

export interface PositionSizeResult {
  lots: number;
  shares: number;
  riskAmount: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code: string } | null;
  meta?: { total?: number; page?: number; limit?: number };
}

export interface MonthlyPnL {
  month: string;
  pnl: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

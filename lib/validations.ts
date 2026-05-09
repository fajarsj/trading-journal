import { z } from "zod";

export const createTradeSchema = z.object({
  symbol: z.string().min(1).max(10).transform((v) => v.trim().toUpperCase()),
  stockName: z.string().optional(),
  direction: z.enum(["LONG", "SHORT"]),
  entryDate: z.string().datetime(),
  entryPrice: z.number().positive(),
  lotSize: z.number().int().positive(),
  stopLossPrice: z.number().positive().optional(),
  takeProfitPrice: z.number().positive().optional(),
  strategy: z.string().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
  emotionEntry: z.enum(["CONFIDENT", "UNCERTAIN", "FOMO", "DISCIPLINED"]).optional(),
  tags: z.string().optional(),
});

export const closeTradeSchema = z.object({
  exitPrice: z.number().positive(),
  exitDate: z.string().datetime(),
  exitReason: z.enum(["TAKE_PROFIT", "STOP_LOSS", "MANUAL", "EXPIRED"]).optional(),
  emotionExit: z.enum(["SATISFIED", "REGRET", "NEUTRAL", "FEAR"]).optional(),
  notes: z.string().optional(),
});

export const updateTradeSchema = createTradeSchema.partial().merge(
  closeTradeSchema.partial()
);

export const settingsSchema = z.object({
  capitalTotal: z.number().positive(),
  maxRiskPercentPerTrade: z.number().positive().max(100),
  maxOpenPositions: z.number().int().positive(),
  defaultBrokerageFee: z.number().positive(),
  defaultSellFee: z.number().positive(),
});

export const journalEntrySchema = z.object({
  date: z.string().datetime(),
  marketCondition: z.enum(["BULLISH", "BEARISH", "SIDEWAYS", "VOLATILE"]),
  body: z.string().min(1),
  mood: z.enum(["GREAT", "GOOD", "NEUTRAL", "BAD", "TERRIBLE"]),
});

export const tradeQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).optional(),
  symbol: z.string().optional(),
  strategy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type CloseTradeInput = z.infer<typeof closeTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type TradeQueryInput = z.infer<typeof tradeQuerySchema>;

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const idrFormatterDecimals = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as IDR currency string.
 * e.g. 1250000 → "Rp 1.250.000"
 */
export function formatIDR(amount: number, showDecimals = false): string {
  const formatter = showDecimals ? idrFormatterDecimals : idrFormatter;
  // Intl uses "Rp" prefix with non-breaking space; normalize to "Rp "
  return formatter
    .format(amount)
    .replace(/ /g, " ")
    .replace("IDR", "Rp");
}

/**
 * Parses an IDR string back to a number.
 * e.g. "Rp 1.250.000" → 1250000
 */
export function parseIDR(value: string): number {
  const cleaned = value
    .replace(/[Rp\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Formats a number as a percentage string using Indonesian convention.
 * e.g. 2.5 → "2,50%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value) + "%";
}

/**
 * Formats a date for display in Indonesian format.
 * e.g. Date → "15 Jan 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

/**
 * Formats a date-time in WIB (UTC+7) for display.
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(d) + " WIB";
}

/**
 * Normalizes a stock ticker to uppercase and trims whitespace.
 * e.g. " bbca " → "BBCA"
 */
export function formatTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

/**
 * Formats a number as a ratio string.
 * e.g. 2.5 → "1:2.50"
 */
export function formatRatio(value: number): string {
  return `1:${value.toFixed(2)}`;
}

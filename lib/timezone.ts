/**
 * Returns today's date in WIB (UTC+7), normalized to midnight, for use as a DB date key.
 */
export function getWIBToday(): Date {
  const now = new Date();
  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  wib.setHours(0, 0, 0, 0);
  return wib;
}

/**
 * Formats a date as a human-readable Indonesian date string.
 * e.g. "Senin, 6 Januari 2025"
 */
export function formatWIBDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

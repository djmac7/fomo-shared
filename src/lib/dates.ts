// All date logic is anchored to Asia/Manila so "today" matches the audience.

export const MANILA_TZ = "Asia/Manila";

/** YYYY-MM-DD for a given Date in Manila time. */
export function manilaDateStr(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Rolling window of date strings starting today (Manila). */
export function dateWindow(days: number, from: Date = new Date()): string[] {
  const base = manilaDateStr(from);
  const [y, m, d] = base.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    // Use UTC math on the Manila calendar date — safe, no TZ drift for date-only.
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Fri, Jul 26" style label from a YYYY-MM-DD string. */
export function labelForDate(dateStr: string, today?: string): { weekday: string; day: number; month: string; isToday: boolean; isTomorrow: boolean } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const t = today ?? manilaDateStr();
  const tomorrow = dateWindow(2, new Date(`${t}T00:00:00+08:00`))[1];
  return {
    weekday: WEEKDAYS[dt.getUTCDay()],
    day: d,
    month: MONTHS[m - 1],
    isToday: dateStr === t,
    isTomorrow: dateStr === tomorrow,
  };
}

/** "2h 21m" from minutes. */
export function runtimeLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** 24h "19:30" -> "7:30 PM". */
export function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${period}`;
}

/** Human "July 23, 2026" from YYYY-MM-DD. */
export function fullDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${["January","February","March","April","May","June","July","August","September","October","November","December"][m - 1]} ${d}, ${y}`;
}

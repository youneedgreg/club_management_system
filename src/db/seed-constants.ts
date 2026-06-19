/**
 * Anchors for the seed dataset (all in 2026, Africa/Nairobi).
 *
 * The prototype is "tonight"-centric. We pin tonight to **Sat 13 Jun 2026** — a
 * real Saturday (15 Jun 2026 is the Monday the prototype's lineup week starts
 * on). A trading night runs ~8pm→4am, so sales after midnight carry the
 * previous calendar day as their `businessDate`.
 */

/** Calendar date the trading night opens on (Sat). */
export const NIGHT = "2026-06-13";
/** Calendar date after midnight, still part of the same trading night. */
export const MORNING = "2026-06-14";
/** Nairobi UTC offset (no DST). */
const TZ = "+03:00";

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "10 Jun" → "2026-06-10"; "24 May" → "2026-05-24". */
export function dmyToISO(label: string, year = 2026): string {
  const [day, mon] = label.trim().split(/\s+/);
  const mm = MONTHS[mon] ?? "06";
  return `${year}-${mm}-${pad2(parseInt(day, 10))}`;
}

/** "Jan" → "2026-01-01" (first of month). */
export function monthFirstISO(label: string, year = 2026): string {
  return `${year}-${MONTHS[label] ?? "01"}-01`;
}

/**
 * Clock label → ISO timestamp inside the trading night.
 * - 12-hour "h:mm AM" → early morning (MORNING); "h:mm PM" → evening (NIGHT).
 * - 24-hour "HH:mm" (the sales/orders feed, all 00:00–04:00) → MORNING.
 */
export function nightTs(label: string): string {
  const s = label.trim();
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    const pm = /pm/i.test(m12[3]);
    let h = parseInt(m12[1], 10) % 12;
    if (pm) h += 12;
    const day = pm ? NIGHT : MORNING;
    return `${day}T${pad2(h)}:${m12[2]}:00${TZ}`;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const day = h < 8 ? MORNING : NIGHT;
    return `${day}T${pad2(h)}:${m24[2]}:00${TZ}`;
  }
  return `${NIGHT}T20:00:00${TZ}`;
}

/** Weekly P&L day label → trading date (Mon 8 Jun … Sun 14 Jun 2026). */
export const WEEK_DATES: Record<string, string> = {
  Mon: "2026-06-08",
  Tue: "2026-06-09",
  Wed: "2026-06-10",
  Thu: "2026-06-11",
  Fri: "2026-06-12",
  Sat: "2026-06-13",
  Sun: "2026-06-14",
};

/** Lineup day-of-month string ("15") → ISO date (next week, 15–21 Jun). */
export function lineupDateISO(dayOfMonth: string): string {
  return `2026-06-${dayOfMonth.padStart(2, "0")}`;
}

/** Month (first-of-month) the tonight expense breakdown belongs to. */
export const EXPENSE_MONTH = "2026-06-01";

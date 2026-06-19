import { db } from "@/db/client";

import { isPctUnknown, sumBy } from "./calc";

export type BookingStatus = "paid" | "partial" | "unpaid" | "pct";

export interface BookingView {
  id: string;
  actName: string;
  role: "actDj" | "actMc" | "actHost";
  setTime: string | null;
  feeType: "fixed" | "pct";
  fee: number;
  pct: number | null;
  guest: boolean;
  paid: number;
  /** Remaining owed; `null` when a pct fee is still unknown. */
  remaining: number | null;
  status: BookingStatus;
}

export interface NightView {
  id: string;
  date: string;
  label: string | null;
  flagship: boolean;
  closed: boolean;
  bookings: BookingView[];
}

function toBookingView(b: {
  id: string;
  actName: string;
  role: BookingView["role"];
  setTime: string | null;
  feeType: "fixed" | "pct";
  fee: number;
  pct: string | null;
  guest: boolean;
  payments: { amount: number }[];
}): BookingView {
  const paid = sumBy(b.payments, (p) => p.amount);
  const pctUnknown = isPctUnknown({ feeType: b.feeType, fee: b.fee, paid });
  const full = b.fee > 0 && paid >= b.fee;
  const status: BookingStatus = pctUnknown
    ? "pct"
    : full
      ? "paid"
      : paid > 0
        ? "partial"
        : "unpaid";
  return {
    id: b.id,
    actName: b.actName,
    role: b.role,
    setTime: b.setTime,
    feeType: b.feeType,
    fee: b.fee,
    pct: b.pct != null ? Number(b.pct) : null,
    guest: b.guest,
    paid,
    remaining: pctUnknown ? null : Math.max(0, b.fee - paid),
    status,
  };
}

/** The lineup calendar for a club: nights with their booked acts and pay status. */
export async function getLineup(clubId: string): Promise<NightView[]> {
  const nights = await db.query.lineupNights.findMany({
    where: (n, { eq }) => eq(n.clubId, clubId),
    orderBy: (n, { asc }) => asc(n.date),
    with: {
      bookings: {
        orderBy: (b, { asc }) => asc(b.actName),
        with: { payments: true },
      },
    },
  });

  return nights.map((n) => ({
    id: n.id,
    date: n.date,
    label: n.label,
    flagship: n.flagship,
    closed: n.closed,
    bookings: n.bookings.map(toBookingView),
  }));
}

export interface LineupSummary {
  /** Total fees owed across acts (excludes pct-unknown). */
  total: number;
  paid: number;
  outstanding: number;
  paidActs: number;
  owedCount: number;
}

/**
 * Totals owed to acts, mirroring the prototype: pct-unknown bookings are skipped
 * from `total`/`paid` but still counted as owed.
 */
export async function getLineupSummary(clubId: string): Promise<LineupSummary> {
  const nights = await getLineup(clubId);
  const bookings = nights.flatMap((n) => n.bookings);

  let total = 0;
  let paid = 0;
  let paidActs = 0;
  let owedCount = 0;

  for (const b of bookings) {
    const pctUnknown = b.status === "pct";
    if (!pctUnknown) {
      total += b.fee;
      paid += Math.min(b.paid, b.fee);
    }
    if (b.fee > 0 && b.paid >= b.fee) paidActs++;
    if (pctUnknown || b.paid < b.fee) owedCount++;
  }

  return { total, paid, outstanding: total - paid, paidActs, owedCount };
}

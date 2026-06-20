/**
 * Pure aggregation helpers — no database access. These mirror the prototype's
 * in-app `reduce`/payroll math exactly (see `black stars html/modules_*.jsx`)
 * so the server reproduces the same figures. Kept db-free so both the
 * repositories and the verification script (and Phase 19 unit tests) can use
 * them.
 */

/** Bar vs kitchen — income and expenses are tracked separately. */
export type Domain = "bar" | "kitchen";

/** Sum a numeric projection over a list. */
export const sumBy = <T>(rows: readonly T[], fn: (row: T) => number): number =>
  rows.reduce((acc, row) => acc + fn(row), 0);

/**
 * Whole-day difference between an ISO date (`YYYY-MM-DD`) and `asOf`, in UTC to
 * avoid timezone/DST drift. Returns `null` for a missing date.
 */
export function agingDays(fromISO: string | null, asOf: Date | string = new Date()): number | null {
  if (!fromISO) return null;
  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to =
    typeof asOf === "string"
      ? Date.parse(`${asOf}T00:00:00Z`)
      : Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  return Math.floor((to - from) / 86_400_000);
}

/** Credit tabs are overdue past 7 days (prototype: `c.age > 7`). */
export const CREDIT_OVERDUE_DAYS = 7;

/** Payment terms label → days (prototype `termsDays`). "Monthly" → 30. */
export const termsDays = (terms: string | null): number =>
  terms === "Monthly" ? 30 : parseInt(terms ?? "", 10) || 0;

/** Net margin as a whole percentage (prototype: `round(net / income * 100)`). */
export const marginPct = (net: number, income: number): number =>
  income > 0 ? Math.round((net / income) * 100) : 0;

/**
 * Whole-percent change of `current` against `previous` (e.g. tonight vs
 * yesterday). Returns `null` when there's no positive base to compare against,
 * so callers can omit the delta rather than render a meaningless figure.
 */
export const pctDelta = (current: number, previous: number): number | null =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

// ----- Payroll -----

export interface PermanentInput {
  salary: number;
  nhif: number;
  nssf: number;
  paye: number;
  advance: number;
}

/** Permanent net pay: deductions = nhif + nssf + paye + advance; net = salary − deductions. */
export function permanentPay(s: PermanentInput) {
  const deductions = s.nhif + s.nssf + s.paye + s.advance;
  return { deductions, net: s.salary - deductions };
}

export interface CasualInput {
  dailyRate: number;
  daysWorked: number;
  deduction: number;
  advance: number;
  posSales: number;
  commissionPct: number;
}

/**
 * Casual pay: base = dailyRate × daysWorked; commission = round(posSales ×
 * commissionPct / 100); gross = base + commission; net = gross − deduction −
 * advance.
 */
export function casualPay(s: CasualInput) {
  const base = s.dailyRate * s.daysWorked;
  const commission = Math.round((s.posSales * s.commissionPct) / 100);
  const gross = base + commission;
  return { base, commission, gross, net: gross - s.deduction - s.advance };
}

// ----- Lineup fees -----

/** Percentage-of-night fee for a pct booking against a known gross. */
export const pctFee = (pct: number, gross: number): number => Math.round((pct / 100) * gross);

/** A pct booking whose fee is still unknown (no gross, nothing paid). */
export const isPctUnknown = (b: { feeType: string; fee: number; paid: number }): boolean =>
  b.feeType === "pct" && b.fee === 0 && b.paid === 0;

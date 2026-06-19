import { eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { agingDays, CREDIT_OVERDUE_DAYS, sumBy } from "./calc";

const { creditCustomers } = schema;

export interface CreditRow {
  id: string;
  name: string;
  note: string | null;
  phone: string | null;
  balance: number;
  lastPaidAt: string | null;
  /** Days since last payment. */
  age: number | null;
  /** age > 7 days. */
  overdue: boolean;
}

export interface CreditSummary {
  rows: CreditRow[];
  totalOwed: number;
  overdueAmt: number;
  currentAmt: number;
  overdueCount: number;
}

/**
 * Credit ledger ("Deni") with aging from `lastPaidAt`. Overdue mirrors the
 * prototype `c.age > 7`. `asOf` defaults to now; the verify script pins it.
 */
export async function getCredit(
  clubId: string,
  asOf: Date | string = new Date(),
): Promise<CreditSummary> {
  const rows = await db.select().from(creditCustomers).where(eq(creditCustomers.clubId, clubId));

  const mapped: CreditRow[] = rows
    .map((c) => {
      const age = agingDays(c.lastPaidAt, asOf);
      return {
        id: c.id,
        name: c.name,
        note: c.note,
        phone: c.phone,
        balance: c.balance,
        lastPaidAt: c.lastPaidAt,
        age,
        overdue: age !== null && age > CREDIT_OVERDUE_DAYS,
      };
    })
    .sort((a, b) => b.balance - a.balance);

  const totalOwed = sumBy(mapped, (r) => r.balance);
  const overdueAmt = sumBy(
    mapped.filter((r) => r.overdue),
    (r) => r.balance,
  );

  return {
    rows: mapped,
    totalOwed,
    overdueAmt,
    currentAmt: totalOwed - overdueAmt,
    overdueCount: mapped.filter((r) => r.overdue).length,
  };
}

/** Count of overdue credit tabs (for the sidebar badge). */
export async function overdueCreditCount(
  clubId: string,
  asOf: Date | string = new Date(),
): Promise<number> {
  return (await getCredit(clubId, asOf)).overdueCount;
}

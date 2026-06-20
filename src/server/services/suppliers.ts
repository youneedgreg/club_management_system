import { asc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { agingDays, sumBy, termsDays } from "./calc";

const { suppliers } = schema;

/** Suppliers for a club as `{ id, name }` options (e.g. stock form dropdown). */
export function listSuppliers(clubId: string) {
  return db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.clubId, clubId))
    .orderBy(asc(suppliers.name));
}

export interface PayableRow {
  id: string;
  name: string;
  category: (typeof suppliers.$inferSelect)["category"];
  phone: string | null;
  terms: string | null;
  balance: number;
  lastOrderAt: string | null;
  dueDate: string | null;
  /** Days since last order. */
  age: number | null;
  /** balance > 0 and past terms. */
  overdue: boolean;
}

export interface PayablesSummary {
  rows: PayableRow[];
  totalPayable: number;
  overdueAmt: number;
  dueAmt: number;
  activeCount: number;
}

/**
 * Suppliers as accounts payable, with aging from `lastOrderAt`. Overdue mirrors
 * the prototype: `balance > 0 && age > termsDays(terms)`. `asOf` defaults to now;
 * the verify script pins it to reproduce the prototype's `age` field.
 */
export async function getPayables(
  clubId: string,
  asOf: Date | string = new Date(),
): Promise<PayablesSummary> {
  const rows = await db.select().from(suppliers).where(eq(suppliers.clubId, clubId));

  const mapped: PayableRow[] = rows
    .map((s) => {
      const age = agingDays(s.lastOrderAt, asOf);
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        phone: s.phone,
        terms: s.terms,
        balance: s.owed,
        lastOrderAt: s.lastOrderAt,
        dueDate: s.dueDate,
        age,
        overdue: s.owed > 0 && age !== null && age > termsDays(s.terms),
      };
    })
    .sort((a, b) => b.balance - a.balance);

  const totalPayable = sumBy(mapped, (r) => r.balance);
  const overdueAmt = sumBy(
    mapped.filter((r) => r.overdue),
    (r) => r.balance,
  );

  return {
    rows: mapped,
    totalPayable,
    overdueAmt,
    dueAmt: totalPayable - overdueAmt,
    activeCount: mapped.filter((r) => r.balance > 0).length,
  };
}

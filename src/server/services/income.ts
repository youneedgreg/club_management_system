import { and, asc, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { sumBy, type Domain } from "./calc";

const { revenueByHour, incomeByCategory, paymentMix, topSellers } = schema;

export type { Domain };

/** Revenue-by-hour points for a night (ordered for charting). */
export function getRevenueByHour(clubId: string, businessDate: string, domain: Domain = "bar") {
  return db
    .select()
    .from(revenueByHour)
    .where(
      and(
        eq(revenueByHour.clubId, clubId),
        eq(revenueByHour.businessDate, businessDate),
        eq(revenueByHour.domain, domain),
      ),
    )
    .orderBy(asc(revenueByHour.sortOrder));
}

/** Total income for a night = Σ revenue-by-hour (prototype `byHour.reduce`). */
export async function getTotalIncome(clubId: string, businessDate: string, domain: Domain = "bar") {
  const rows = await getRevenueByHour(clubId, businessDate, domain);
  return sumBy(rows, (r) => r.amount);
}

/** Income split by category for a night. */
export function getIncomeByCategory(clubId: string, businessDate: string, domain: Domain = "bar") {
  return db
    .select()
    .from(incomeByCategory)
    .where(
      and(
        eq(incomeByCategory.clubId, clubId),
        eq(incomeByCategory.businessDate, businessDate),
        eq(incomeByCategory.domain, domain),
      ),
    )
    .orderBy(desc(incomeByCategory.amount));
}

/** Payment-method mix for a night (M-Pesa / cash / card). */
export function getPaymentMix(clubId: string, businessDate: string) {
  return db
    .select()
    .from(paymentMix)
    .where(and(eq(paymentMix.clubId, clubId), eq(paymentMix.businessDate, businessDate)))
    .orderBy(desc(paymentMix.amount));
}

/** Top-selling products for a night. */
export function getTopSellers(clubId: string, businessDate: string) {
  return db
    .select()
    .from(topSellers)
    .where(and(eq(topSellers.clubId, clubId), eq(topSellers.businessDate, businessDate)))
    .orderBy(desc(topSellers.revenue));
}

import { and, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { sumBy, type Domain } from "./calc";

const { expenses, expenseByCategory } = schema;

/** Expenses logged on a night for a domain (bar or kitchen), newest first. */
export function getExpenses(clubId: string, businessDate: string, domain: Domain = "bar") {
  return db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.clubId, clubId),
        eq(expenses.businessDate, businessDate),
        eq(expenses.domain, domain),
      ),
    )
    .orderBy(desc(expenses.occurredAt));
}

/** Total expenses for a night/domain (prototype `expensesTonight.reduce`). */
export async function getTotalExpenses(
  clubId: string,
  businessDate: string,
  domain: Domain = "bar",
) {
  const rows = await getExpenses(clubId, businessDate, domain);
  return sumBy(rows, (e) => e.amount);
}

/** Monthly expense split by category for a domain. */
export function getExpenseByCategory(clubId: string, periodMonth: string, domain: Domain = "bar") {
  return db
    .select()
    .from(expenseByCategory)
    .where(
      and(
        eq(expenseByCategory.clubId, clubId),
        eq(expenseByCategory.periodMonth, periodMonth),
        eq(expenseByCategory.domain, domain),
      ),
    )
    .orderBy(desc(expenseByCategory.amount));
}

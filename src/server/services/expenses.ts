import { and, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { getTonightDate } from "./period";
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

export interface ExpenseRow {
  id: string;
  label: string;
  categoryKey: string;
  amount: number;
  recurring: boolean;
  /** Wall-clock label, e.g. "7:30 PM" (Africa/Nairobi). */
  time: string;
}

/** Tonight's expenses as serializable rows (time pre-formatted for the client). */
export async function listExpenses(
  clubId: string,
  businessDate: string,
  domain: Domain = "bar",
): Promise<ExpenseRow[]> {
  const rows = await getExpenses(clubId, businessDate, domain);
  return rows.map((e) => ({
    id: e.id,
    label: e.label,
    categoryKey: e.categoryKey,
    amount: e.amount,
    recurring: e.recurring,
    time: e.occurredAt.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Africa/Nairobi",
    }),
  }));
}

export interface NewExpenseInput {
  label: string;
  categoryKey: string;
  amount: number;
  recurring: boolean;
}

/** Log a bar expense on tonight's trading date. */
export async function createExpense(
  clubId: string,
  input: NewExpenseInput,
  userId?: string | null,
): Promise<string> {
  const businessDate = await getTonightDate(clubId);
  const [row] = await db
    .insert(expenses)
    .values({
      clubId,
      label: input.label,
      categoryKey: input.categoryKey,
      domain: "bar",
      amount: input.amount,
      recurring: input.recurring,
      occurredAt: new Date(),
      businessDate,
      createdBy: userId ?? null,
    })
    .returning({ id: expenses.id });
  return row.id;
}

export interface ExpensePatch {
  label?: string;
  categoryKey?: string;
  amount?: number;
  recurring?: boolean;
}

/** Update a bar expense (club-scoped). */
export async function updateExpense(
  clubId: string,
  id: string,
  patch: ExpensePatch,
): Promise<boolean> {
  const res = await db
    .update(expenses)
    .set(patch)
    .where(and(eq(expenses.id, id), eq(expenses.clubId, clubId)))
    .returning({ id: expenses.id });
  return res.length > 0;
}

/** Delete a bar expense (club-scoped). */
export async function deleteExpense(clubId: string, id: string): Promise<boolean> {
  const res = await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.clubId, clubId)))
    .returning({ id: expenses.id });
  return res.length > 0;
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

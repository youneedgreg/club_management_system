import { and, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { sumBy } from "./calc";
import { getIncomeByCategory, getRevenueByHour, getTotalIncome } from "./income";
import { getExpenseByCategory, getExpenses, getTotalExpenses } from "./expenses";

const { kitchenOrders } = schema;

/** Kitchen tickets for a night, newest first. */
export function getKitchenOrders(clubId: string, businessDate: string) {
  return db
    .select()
    .from(kitchenOrders)
    .where(and(eq(kitchenOrders.clubId, clubId), eq(kitchenOrders.businessDate, businessDate)))
    .orderBy(desc(kitchenOrders.occurredAt));
}

/** Kitchen revenue-by-hour for charting. */
export const getKitchenRevenueByHour = (clubId: string, businessDate: string) =>
  getRevenueByHour(clubId, businessDate, "kitchen");

/** Kitchen income split by category. */
export const getKitchenIncomeByCategory = (clubId: string, businessDate: string) =>
  getIncomeByCategory(clubId, businessDate, "kitchen");

/** Kitchen monthly expense split by category. */
export const getKitchenExpenseByCategory = (clubId: string, periodMonth: string) =>
  getExpenseByCategory(clubId, periodMonth, "kitchen");

/** Kitchen P&L for a night (food income − food expenses), kept distinct from the bar. */
export async function getKitchenPnl(clubId: string, businessDate: string) {
  const [income, expenses, orders] = await Promise.all([
    getTotalIncome(clubId, businessDate, "kitchen"),
    getTotalExpenses(clubId, businessDate, "kitchen"),
    getExpenses(clubId, businessDate, "kitchen"),
  ]);
  return {
    income,
    expenses,
    net: income - expenses,
    orderCount: (await getKitchenOrders(clubId, businessDate)).length,
    expenseRows: orders,
  };
}

/** Total kitchen expenses logged on a night (helper for summaries). */
export async function getKitchenExpenseTotal(clubId: string, businessDate: string) {
  const rows = await getExpenses(clubId, businessDate, "kitchen");
  return sumBy(rows, (e) => e.amount);
}

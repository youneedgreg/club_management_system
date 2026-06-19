import { and, asc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { marginPct, sumBy } from "./calc";
import { getTotalExpenses } from "./expenses";
import { getTotalIncome } from "./income";
import { getTonightDate } from "./period";

const { nightlySnapshots, nightStats, monthlyRevenue } = schema;

async function getNightStats(clubId: string, businessDate: string) {
  const [row] = await db
    .select()
    .from(nightStats)
    .where(and(eq(nightStats.clubId, clubId), eq(nightStats.businessDate, businessDate)))
    .limit(1);
  return row ?? null;
}

export interface TonightPnl {
  date: string;
  income: number;
  expenses: number;
  net: number;
  margin: number;
  footfall: number;
  tablesOpen: number;
  biggestSale: number;
  peakHour: string | null;
}

/**
 * Tonight's P&L hero: income (Σ revenue-by-hour) − expenses, with margin and
 * footfall. Mirrors the prototype Reports/Dashboard `reduce` math.
 */
export async function getTonightPnl(clubId: string, businessDate?: string): Promise<TonightPnl> {
  const date = businessDate ?? (await getTonightDate(clubId));
  const [income, expenses, stats] = await Promise.all([
    getTotalIncome(clubId, date, "bar"),
    getTotalExpenses(clubId, date, "bar"),
    getNightStats(clubId, date),
  ]);
  const net = income - expenses;
  return {
    date,
    income,
    expenses,
    net,
    margin: marginPct(net, income),
    footfall: stats?.doorEntries ?? 0,
    tablesOpen: stats?.tablesOpen ?? 0,
    biggestSale: stats?.biggestSale ?? 0,
    peakHour: stats?.peakHour ?? null,
  };
}

/** Net position (income − expenses) for the dashboard hero card. */
export async function getNetPosition(clubId: string, businessDate?: string): Promise<number> {
  return (await getTonightPnl(clubId, businessDate)).net;
}

type Night = typeof nightlySnapshots.$inferSelect;

export interface WeeklyPnl {
  rows: Night[];
  revenue: number;
  cost: number;
  net: number;
  best: Night | null;
}

/** Last-week P&L (one row per night) with totals and best night. */
export async function getWeeklyPnl(clubId: string): Promise<WeeklyPnl> {
  const rows = await db
    .select()
    .from(nightlySnapshots)
    .where(eq(nightlySnapshots.clubId, clubId))
    .orderBy(asc(nightlySnapshots.businessDate));

  const revenue = sumBy(rows, (r) => r.revenue);
  const cost = sumBy(rows, (r) => r.cost);
  const open = rows.filter((r) => !r.closed);
  const best = open.reduce<Night | null>(
    (a, b) => (a === null || b.revenue > a.revenue ? b : a),
    null,
  );

  return { rows, revenue, cost, net: revenue - cost, best };
}

/** Monthly revenue trend (oldest → newest). */
export function getMonthlyTrend(clubId: string) {
  return db
    .select()
    .from(monthlyRevenue)
    .where(eq(monthlyRevenue.clubId, clubId))
    .orderBy(asc(monthlyRevenue.month));
}

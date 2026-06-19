import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { domainEnum, paymentMethodEnum } from "./enums";

/**
 * Pre-aggregated reporting snapshots.
 *
 * The prototype's `byHour`, `incomeByCategory`, `paymentMix`, `topSellers`,
 * `weekly`, `monthly` and `expenseByCategory` are summary figures, not derived
 * from its sample sale/order feeds. We persist them as end-of-night snapshots
 * (the "nightly snapshot persisted at close" of Phase 14). Aggregation helpers
 * reduce over these to reproduce the prototype's dashboard/report numbers; live
 * modules can recompute from the transactional tables as those fill in.
 */

/** Weekly P&L — one row per trading night. */
export const nightlySnapshots = pgTable(
  "nightly_snapshots",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    /** Short weekday label, e.g. "Mon". */
    dayLabel: text(),
    /** Event label, e.g. "Ladies night". */
    label: text(),
    revenue: money().notNull().default(0),
    cost: money().notNull().default(0),
    closed: boolean().notNull().default(false),
    flagship: boolean().notNull().default(false),
    isTonight: boolean().notNull().default(false),
    ...timestamps,
  },
  (t) => [unique("nightly_snapshots_club_date_uniq").on(t.clubId, t.businessDate)],
);

/** Tonight headline stats (door/tables/biggest sale/peak hour). */
export const nightStats = pgTable(
  "night_stats",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    doorEntries: integer().notNull().default(0),
    tablesOpen: integer().notNull().default(0),
    biggestSale: money().notNull().default(0),
    peakHour: text(),
    ...timestamps,
  },
  (t) => [unique("night_stats_club_date_uniq").on(t.clubId, t.businessDate)],
);

/** Revenue by hour for a night (bar or kitchen). */
export const revenueByHour = pgTable(
  "revenue_by_hour",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    domain: domainEnum().notNull().default("bar"),
    /** Display label, e.g. "8pm". */
    hour: text().notNull(),
    sortOrder: integer().notNull().default(0),
    amount: money().notNull(),
    ...timestamps,
  },
  (t) => [index("revenue_by_hour_idx").on(t.clubId, t.businessDate, t.domain)],
);

/** Income split by category for a night (bar or kitchen). */
export const incomeByCategory = pgTable(
  "income_by_category",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    domain: domainEnum().notNull().default("bar"),
    categoryKey: text().notNull(),
    amount: money().notNull(),
    ...timestamps,
  },
  (t) => [index("income_by_category_idx").on(t.clubId, t.businessDate, t.domain)],
);

/** Payment-method mix for a night. */
export const paymentMix = pgTable(
  "payment_mix",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    method: paymentMethodEnum().notNull(),
    pct: numeric({ precision: 5, scale: 2 }).notNull(),
    amount: money().notNull(),
    ...timestamps,
  },
  (t) => [index("payment_mix_idx").on(t.clubId, t.businessDate)],
);

/** Top-selling products for a night. */
export const topSellers = pgTable(
  "top_sellers",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    productName: text().notNull(),
    category: text().notNull(),
    units: integer().notNull(),
    revenue: money().notNull(),
    ...timestamps,
  },
  (t) => [index("top_sellers_idx").on(t.clubId, t.businessDate)],
);

/** Expense split by category for a month (bar or kitchen). */
export const expenseByCategory = pgTable(
  "expense_by_category",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    /** First day of the month. */
    periodMonth: date({ mode: "string" }).notNull(),
    domain: domainEnum().notNull().default("bar"),
    categoryKey: text().notNull(),
    amount: money().notNull(),
    ...timestamps,
  },
  (t) => [index("expense_by_category_idx").on(t.clubId, t.periodMonth, t.domain)],
);

/** Monthly revenue trend. */
export const monthlyRevenue = pgTable(
  "monthly_revenue",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    /** First day of the month. */
    month: date({ mode: "string" }).notNull(),
    /** Short month label, e.g. "Jan". */
    monthLabel: text(),
    revenue: money().notNull(),
    partial: boolean().notNull().default(false),
    ...timestamps,
  },
  (t) => [unique("monthly_revenue_club_month_uniq").on(t.clubId, t.month)],
);

import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ledgerStamps, money, pk, timestamps } from "./_shared";
import { incomeCategories } from "./categories";
import { clubs } from "./clubs";
import { paymentMethodEnum } from "./enums";
import { products } from "./inventory";
import { staff } from "./staff";

/**
 * Bar sales. `businessDate` is the trading night the sale belongs to (a night
 * spans ~8pm–4am, so it differs from the calendar date after midnight).
 * `location` is the table/bar/door. `incomeCategoryKey` lets a sale roll up
 * into the income-by-category breakdown; `staffId` attributes it.
 */
export const sales = pgTable(
  "sales",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    businessDate: date({ mode: "string" }).notNull(),
    location: text(),
    description: text(),
    paymentMethod: paymentMethodEnum().notNull(),
    amount: money().notNull(),
    incomeCategoryKey: text().references(() => incomeCategories.key, {
      onDelete: "set null",
    }),
    staffId: uuid().references(() => staff.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [
    index("sales_club_date_idx").on(t.clubId, t.businessDate),
    index("sales_payment_idx").on(t.paymentMethod),
  ],
);

/** Line items on a sale, optionally linked to a stock product. */
export const saleItems = pgTable(
  "sale_items",
  {
    id: pk(),
    saleId: uuid()
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    description: text(),
    qty: integer().notNull().default(1),
    unitPrice: money().notNull().default(0),
    lineTotal: money().notNull().default(0),
    ...ledgerStamps,
  },
  (t) => [index("sale_items_sale_idx").on(t.saleId)],
);

import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ledgerStamps, money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { productCategoryEnum, stockMovementTypeEnum } from "./enums";
import { suppliers } from "./suppliers";

/**
 * Bar stock catalogue + current state. `onHand`/`par` are in the product's
 * `unit` (btl, crate, head…); `cost`/`sell` are per-unit KES. Low-stock is
 * `onHand < par`. Margin is `sell - cost`.
 */
export const products = pgTable(
  "products",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    category: productCategoryEnum().notNull(),
    unit: text().notNull(),
    onHand: integer().notNull().default(0),
    par: integer().notNull().default(0),
    cost: money().notNull().default(0),
    sell: money().notNull().default(0),
    supplierId: uuid().references(() => suppliers.id, { onDelete: "set null" }),
    deliveredAt: date({ mode: "string" }),
    ...timestamps,
  },
  (t) => [
    index("products_club_idx").on(t.clubId),
    index("products_category_idx").on(t.clubId, t.category),
  ],
);

/**
 * Append-only ledger of stock changes behind `products.onHand`. `qty` is
 * signed: positive for deliveries/counts up, negative for sales/shrinkage.
 */
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: pk(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: stockMovementTypeEnum().notNull(),
    qty: integer().notNull(),
    note: text(),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    ...ledgerStamps,
  },
  (t) => [index("stock_movements_product_idx").on(t.productId, t.occurredAt)],
);

import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { orderStatusEnum } from "./enums";

/**
 * Kitchen tickets — the food side, kept distinct from bar sales. Each order
 * moves `preparing → served`. Kitchen income/expense categories live in the
 * shared category tables with `domain = "kitchen"`.
 */
export const kitchenOrders = pgTable(
  "kitchen_orders",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    businessDate: date({ mode: "string" }).notNull(),
    location: text(),
    item: text().notNull(),
    qty: integer().notNull().default(1),
    amount: money().notNull(),
    status: orderStatusEnum().notNull().default("preparing"),
    ...timestamps,
  },
  (t) => [index("kitchen_orders_club_date_idx").on(t.clubId, t.businessDate, t.status)],
);

import { boolean, date, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { money, pk, timestamps } from "./_shared";
import { expenseCategories } from "./categories";
import { clubs } from "./clubs";
import { domainEnum } from "./enums";

/**
 * Expenses for both the bar and the kitchen (`domain`). `recurring` flags
 * standing costs (wages, restocks); `businessDate` ties tonight's expenses to
 * the trading night for the nightly P&L.
 */
export const expenses = pgTable(
  "expenses",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    label: text().notNull(),
    categoryKey: text()
      .notNull()
      .references(() => expenseCategories.key, { onDelete: "restrict" }),
    domain: domainEnum().notNull(),
    amount: money().notNull(),
    recurring: boolean().notNull().default(false),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    businessDate: date({ mode: "string" }).notNull(),
    ...timestamps,
  },
  (t) => [index("expenses_club_date_idx").on(t.clubId, t.businessDate, t.domain)],
);

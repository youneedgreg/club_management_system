import { date, index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { ledgerStamps, money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { paymentMethodEnum } from "./enums";

/**
 * Credit ledger ("Deni"): customers who owe a running tab. `balance` is the
 * outstanding amount; `creditPayments` is the repayment ledger that reduces it.
 * Aging is derived from `lastPaidAt` at read time (overdue when > 7 days).
 */
export const creditCustomers = pgTable(
  "credit_customers",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    note: text(),
    phone: text(),
    balance: money().notNull().default(0),
    lastPaidAt: date({ mode: "string" }),
    ...timestamps,
  },
  (t) => [index("credit_customers_club_idx").on(t.clubId)],
);

export const creditPayments = pgTable(
  "credit_payments",
  {
    id: pk(),
    customerId: uuid()
      .notNull()
      .references(() => creditCustomers.id, { onDelete: "cascade" }),
    amount: money().notNull(),
    method: paymentMethodEnum().notNull(),
    occurredAt: date({ mode: "string" }).notNull(),
    ...ledgerStamps,
  },
  (t) => [index("credit_payments_customer_idx").on(t.customerId)],
);

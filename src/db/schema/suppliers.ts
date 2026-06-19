import { date, index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { ledgerStamps, money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { paymentMethodEnum, supplierCategoryEnum } from "./enums";

/**
 * Suppliers and the accounts payable owed to them. `owed` is the running
 * payable balance; `supplierPayments` is the ledger that reduces it. Aging is
 * derived from `dueDate` at read time.
 */
export const suppliers = pgTable(
  "suppliers",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    category: supplierCategoryEnum().notNull(),
    phone: text(),
    /** Payment terms label, e.g. "7 days" / "Monthly". */
    terms: text(),
    owed: money().notNull().default(0),
    lastOrderAt: date({ mode: "string" }),
    dueDate: date({ mode: "string" }),
    ...timestamps,
  },
  (t) => [index("suppliers_club_idx").on(t.clubId)],
);

export const supplierPayments = pgTable(
  "supplier_payments",
  {
    id: pk(),
    supplierId: uuid()
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    amount: money().notNull(),
    method: paymentMethodEnum().notNull(),
    reference: text(),
    occurredAt: date({ mode: "string" }).notNull(),
    ...ledgerStamps,
  },
  (t) => [index("supplier_payments_supplier_idx").on(t.supplierId)],
);

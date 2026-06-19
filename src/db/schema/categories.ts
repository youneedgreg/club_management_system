import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { domainEnum } from "./enums";

/**
 * Income & expense categories — global reference data shared across clubs. The
 * `key` is the i18n key from the prototype (`spirits`, `wages`, `grills`…) so
 * labels resolve via the message catalogs. `label` is the English fallback.
 */
export const incomeCategories = pgTable("income_categories", {
  key: text().primaryKey(),
  label: text().notNull(),
  domain: domainEnum().notNull(),
  sortOrder: integer().notNull().default(0),
});

export const expenseCategories = pgTable("expense_categories", {
  key: text().primaryKey(),
  label: text().notNull(),
  domain: domainEnum().notNull(),
  sortOrder: integer().notNull().default(0),
});

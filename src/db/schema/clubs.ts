import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { pk, timestamps } from "./_shared";

/**
 * Venues. Every domain table scopes to a club so a second venue can be added
 * without a data migration (Phase 4 multi-tenant).
 */
export const clubs = pgTable("clubs", {
  id: pk(),
  name: text().notNull(),
  tagline: text(),
  location: text(),
  owner: text(),
  /** Display strings, e.g. "8:00 PM" / "4:00 AM". */
  openTime: text(),
  closeTime: text(),
  currency: text().notNull().default("KSh"),
  mpesaPaybill: text(),
  /** Low-stock alert threshold; 0 means "use each product's par level". */
  lowStockThreshold: integer().notNull().default(0),
  /** IANA timezone used to compute the trading night / business date. */
  timezone: text().notNull().default("Africa/Nairobi"),
  ...timestamps,
});

/**
 * Shared application types for Black Stars.
 *
 * The domain model lives in the Drizzle schema (`src/db/schema`); infer row
 * types from there. Keep hand-written types here for cross-cutting concerns
 * (money, payment methods, locales) that are not tied to a single table.
 */

/**
 * A money amount in **whole KES shillings** (no sub-unit). KES has no
 * practically-used minor unit — the prototype, M-Pesa and the `money()`/
 * `moneyK()` helpers all work in whole shillings, and the database stores money
 * as `bigint` shillings. See `docs/decisions/0002-money-storage.md`.
 */
export type Money = number;

/** Supported UI locales. Arabic renders right-to-left. */
export type Locale = "en" | "fr" | "ar";

/** Payment methods used across sales, bookings, credit and payables. */
export type PaymentMethod = "mpesa" | "cash" | "card";

export {};

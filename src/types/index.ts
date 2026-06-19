/**
 * Shared application types for Black Stars.
 *
 * Domain model types are added in Phase 3 (mirroring `black stars html/data.js`).
 * Prefer inferring DB row types from the Drizzle schema where possible, and keep
 * hand-written types here for cross-cutting concerns (money, roles, payment
 * methods, locales) that are not tied to a single table.
 */

/** ISO 4217 minor-unit amount. All money in the app is KES. */
export type Money = number;

/** Supported UI locales. Arabic renders right-to-left. */
export type Locale = "en" | "fr" | "ar";

/** Payment methods used across sales, bookings, credit and payables. */
export type PaymentMethod = "mpesa" | "cash" | "card";

export {};

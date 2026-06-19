import { boolean, date, index, numeric, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import { ledgerStamps, money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { bookingRoleEnum, feeTypeEnum, paymentMethodEnum } from "./enums";

/**
 * One row per night in the lineup calendar, carrying the event label and
 * flagged states (flagship Saturday, closed Monday/Tuesday). Bookings hang off
 * a night.
 */
export const lineupNights = pgTable(
  "lineup_nights",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    date: date({ mode: "string" }).notNull(),
    label: text(),
    flagship: boolean().notNull().default(false),
    closed: boolean().notNull().default(false),
    ...timestamps,
  },
  (t) => [unique("lineup_nights_club_date_uniq").on(t.clubId, t.date)],
);

/**
 * Booked acts (DJ/MC/host). Fee is either a fixed amount or a percentage of the
 * night's gross (`feeType = "pct"`, with `pct` set and `fee` computed at
 * payment time). `booking_payments` records partial payments toward the fee.
 */
export const bookings = pgTable(
  "bookings",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    nightId: uuid().references(() => lineupNights.id, { onDelete: "set null" }),
    bookingDate: date({ mode: "string" }).notNull(),
    actName: text().notNull(),
    role: bookingRoleEnum().notNull(),
    /** Display set time, e.g. "10:00 PM" / "all night". */
    setTime: text(),
    feeType: feeTypeEnum().notNull().default("fixed"),
    fee: money().notNull().default(0),
    /** Percentage of night gross when `feeType = "pct"`, e.g. 15. */
    pct: numeric({ precision: 5, scale: 2 }),
    guest: boolean().notNull().default(false),
    ...timestamps,
  },
  (t) => [index("bookings_club_date_idx").on(t.clubId, t.bookingDate)],
);

export const bookingPayments = pgTable(
  "booking_payments",
  {
    id: pk(),
    bookingId: uuid()
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    amount: money().notNull(),
    method: paymentMethodEnum().notNull(),
    mpesaCode: text(),
    receiptNo: text(),
    occurredAt: date({ mode: "string" }).notNull(),
    ...ledgerStamps,
  },
  (t) => [index("booking_payments_booking_idx").on(t.bookingId)],
);

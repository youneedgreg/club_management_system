import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { ledgerStamps, money, pk, timestamps } from "./_shared";
import { clubs } from "./clubs";
import { attendanceStatusEnum, payStatusEnum, staffRoleEnum, staffTypeEnum } from "./enums";

/**
 * Staff members. One row per person per club; `type` tags their primary
 * population (a permanent supervisor who also appears on tonight's roster is a
 * single row). `(clubId, name)` is unique so the seed can resolve identity
 * across the prototype's separate arrays.
 */
export const staff = pgTable(
  "staff",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    role: staffRoleEnum().notNull(),
    type: staffTypeEnum().notNull(),
    ...timestamps,
  },
  (t) => [
    index("staff_club_idx").on(t.clubId),
    unique("staff_club_name_uniq").on(t.clubId, t.name),
  ],
);

/** Tonight's roster: attendance, clock-in and the night's wage. */
export const attendance = pgTable(
  "attendance",
  {
    id: pk(),
    staffId: uuid()
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    status: attendanceStatusEnum().notNull(),
    clockIn: timestamp({ withTimezone: true }),
    wage: money().notNull().default(0),
    /** A flat set fee (e.g. the DJ) rather than an hourly/shift wage. */
    isFee: boolean().notNull().default(false),
    ...timestamps,
  },
  (t) => [
    unique("attendance_staff_date_uniq").on(t.staffId, t.businessDate),
    index("attendance_date_idx").on(t.businessDate),
  ],
);

/** Permanent staff payroll detail (1:1 with staff). */
export const staffPermanent = pgTable("staff_permanent", {
  staffId: uuid()
    .primaryKey()
    .references(() => staff.id, { onDelete: "cascade" }),
  salary: money().notNull(),
  nhif: money().notNull().default(0),
  nssf: money().notNull().default(0),
  paye: money().notNull().default(0),
  /** Standing advance balance to deduct from net pay. */
  advance: money().notNull().default(0),
  payStatus: payStatusEnum().notNull().default("pending"),
  ...timestamps,
});

/** Casual staff payroll detail (1:1 with staff). */
export const staffCasuals = pgTable("staff_casuals", {
  staffId: uuid()
    .primaryKey()
    .references(() => staff.id, { onDelete: "cascade" }),
  dailyRate: money().notNull(),
  daysWorked: integer().notNull().default(0),
  deduction: money().notNull().default(0),
  advance: money().notNull().default(0),
  posLinked: boolean().notNull().default(false),
  posSales: money().notNull().default(0),
  /** Commission rate as a percentage of POS sales, e.g. 1.5. */
  commissionPct: numeric({ precision: 5, scale: 2 }).notNull().default("0"),
  ...timestamps,
});

/** Salary-advance ledger (reduces a staff member's net pay). */
export const advances = pgTable(
  "advances",
  {
    id: pk(),
    staffId: uuid()
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    amount: money().notNull(),
    note: text(),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    ...ledgerStamps,
  },
  (t) => [index("advances_staff_idx").on(t.staffId)],
);

/** Live POS feed: sales auto-attributed to casual staff with commission. */
export const posAttributions = pgTable(
  "pos_attributions",
  {
    id: pk(),
    clubId: uuid()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    staffId: uuid()
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    businessDate: date({ mode: "string" }).notNull(),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    location: text(),
    amount: money().notNull(),
    commission: money().notNull().default(0),
    ...ledgerStamps,
  },
  (t) => [index("pos_attributions_staff_idx").on(t.staffId, t.businessDate)],
);

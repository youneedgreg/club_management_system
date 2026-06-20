import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Closed-set enums. Values that double as i18n keys (roles, categories) keep
 * the exact key from the prototype's `i18n.js` so labels resolve unchanged.
 */

/** Bar vs kitchen — income & expenses are tracked separately. */
export const domainEnum = pgEnum("domain", ["bar", "kitchen"]);

export const paymentMethodEnum = pgEnum("payment_method", ["mpesa", "cash", "card"]);

export const productCategoryEnum = pgEnum("product_category", [
  "spirits",
  "beer",
  "wine",
  "soft",
  "shisha",
  "cigarettes",
]);

export const supplierCategoryEnum = pgEnum("supplier_category", [
  "drinks",
  "food",
  "utilities",
  "services",
]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "delivery",
  "sale",
  "adjustment",
  "count",
]);

export const orderStatusEnum = pgEnum("order_status", ["preparing", "served"]);

/** Staff populations — tonight roster, monthly permanent, daily casuals. */
export const staffTypeEnum = pgEnum("staff_type", ["tonight", "permanent", "casual"]);

/** i18n role keys (`securityRole` avoids clashing with the `security` expense). */
export const staffRoleEnum = pgEnum("staff_role", [
  "supervisor",
  "cashier",
  "bartender",
  "waiter",
  "securityRole",
  "dj",
  "mc",
  "host",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent"]);

export const payStatusEnum = pgEnum("pay_status", ["pending", "paid"]);

/** Lineup act roles (i18n keys). */
export const bookingRoleEnum = pgEnum("booking_role", ["actDj", "actMc", "actHost"]);

/** Fixed fee vs percentage-of-night. */
export const feeTypeEnum = pgEnum("fee_type", ["fixed", "pct"]);

/**
 * Club membership roles (authorization tiers). `owner` has full access;
 * `manager` runs the floor but not money-owed/salaries/settings; `cashier`
 * records sales/expenses only. See `club_members`.
 */
export const memberRoleEnum = pgEnum("member_role", ["owner", "manager", "cashier"]);

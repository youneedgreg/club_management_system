import { relations } from "drizzle-orm";

import { incomeCategories } from "./categories";
import { creditCustomers, creditPayments } from "./credit";
import { products, stockMovements } from "./inventory";
import { bookingPayments, bookings, lineupNights } from "./lineup";
import { saleItems, sales } from "./sales";
import {
  advances,
  attendance,
  posAttributions,
  staff,
  staffCasuals,
  staffPermanent,
} from "./staff";
import { supplierPayments, suppliers } from "./suppliers";

/**
 * Relation graph for the Drizzle relational query API (`db.query.*`). Covers the
 * joins the repositories actually traverse; scoping FKs to `clubs` are omitted
 * here to keep the graph focused.
 */

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  payments: many(supplierPayments),
}));

export const supplierPaymentsRelations = relations(supplierPayments, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierPayments.supplierId],
    references: [suppliers.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  saleItems: many(saleItems),
  movements: many(stockMovements),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  items: many(saleItems),
  staff: one(staff, { fields: [sales.staffId], references: [staff.id] }),
  category: one(incomeCategories, {
    fields: [sales.incomeCategoryKey],
    references: [incomeCategories.key],
  }),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  permanent: one(staffPermanent, {
    fields: [staff.id],
    references: [staffPermanent.staffId],
  }),
  casual: one(staffCasuals, { fields: [staff.id], references: [staffCasuals.staffId] }),
  attendance: many(attendance),
  advances: many(advances),
  posAttributions: many(posAttributions),
}));

export const staffPermanentRelations = relations(staffPermanent, ({ one }) => ({
  staff: one(staff, { fields: [staffPermanent.staffId], references: [staff.id] }),
}));

export const staffCasualsRelations = relations(staffCasuals, ({ one }) => ({
  staff: one(staff, { fields: [staffCasuals.staffId], references: [staff.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  staff: one(staff, { fields: [attendance.staffId], references: [staff.id] }),
}));

export const advancesRelations = relations(advances, ({ one }) => ({
  staff: one(staff, { fields: [advances.staffId], references: [staff.id] }),
}));

export const posAttributionsRelations = relations(posAttributions, ({ one }) => ({
  staff: one(staff, { fields: [posAttributions.staffId], references: [staff.id] }),
}));

export const creditCustomersRelations = relations(creditCustomers, ({ many }) => ({
  payments: many(creditPayments),
}));

export const creditPaymentsRelations = relations(creditPayments, ({ one }) => ({
  customer: one(creditCustomers, {
    fields: [creditPayments.customerId],
    references: [creditCustomers.id],
  }),
}));

export const lineupNightsRelations = relations(lineupNights, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  night: one(lineupNights, {
    fields: [bookings.nightId],
    references: [lineupNights.id],
  }),
  payments: many(bookingPayments),
}));

export const bookingPaymentsRelations = relations(bookingPayments, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPayments.bookingId],
    references: [bookings.id],
  }),
}));

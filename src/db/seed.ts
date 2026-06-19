/**
 * Seed the Black Stars dev dataset from the prototype (`src/lib/data.ts`, the
 * typed port of `black stars html/data.js`).
 *
 * Idempotent: truncates every table (RESTART IDENTITY CASCADE) then re-inserts,
 * so `pnpm db:seed` can be run repeatedly. Run with `pnpm db:seed` (env loaded
 * via `--env-file=.env`). The `--reset` flag is accepted for symmetry but the
 * seed always resets.
 *
 * Modelling notes:
 * - Money is whole KES shillings (see `_shared.ts`).
 * - The prototype's `byHour`/`incomeByCategory`/`paymentMix`/`topSellers`/
 *   `weekly`/`monthly`/`expenseByCategory` are pre-aggregated summaries, not
 *   derived from its sample feeds, so they seed the reporting snapshot tables.
 *   The `sales`/`kitchen.orders` arrays are the recent-feed *samples* and seed
 *   the transactional tables.
 */
import { sql } from "drizzle-orm";

import { DATA } from "@/lib/data";

import { db, schema } from "./client";
import {
  dmyToISO,
  EXPENSE_MONTH,
  lineupDateISO,
  monthFirstISO,
  NIGHT,
  nightTs,
  WEEK_DATES,
} from "./seed-constants";

const {
  clubs,
  incomeCategories,
  expenseCategories,
  suppliers,
  products,
  stockMovements,
  sales,
  expenses,
  kitchenOrders,
  creditCustomers,
  staff,
  attendance,
  staffPermanent,
  staffCasuals,
  advances,
  posAttributions,
  lineupNights,
  bookings,
  bookingPayments,
  nightlySnapshots,
  nightStats,
  revenueByHour,
  incomeByCategory,
  paymentMix,
  topSellers,
  expenseByCategory,
  monthlyRevenue,
} = schema;

// Every table, child-before-parent order is irrelevant under CASCADE.
const ALL_TABLES = [
  "clubs",
  "income_categories",
  "expense_categories",
  "suppliers",
  "supplier_payments",
  "products",
  "stock_movements",
  "sales",
  "sale_items",
  "expenses",
  "kitchen_orders",
  "credit_customers",
  "credit_payments",
  "staff",
  "attendance",
  "staff_permanent",
  "staff_casuals",
  "advances",
  "pos_attributions",
  "lineup_nights",
  "bookings",
  "booking_payments",
  "nightly_snapshots",
  "night_stats",
  "revenue_by_hour",
  "income_by_category",
  "payment_mix",
  "top_sellers",
  "expense_by_category",
  "monthly_revenue",
];

const INCOME_CATEGORY_LABELS: Record<string, string> = {
  spirits: "Spirits",
  wine: "Wine",
  beer: "Beer",
  shisha: "Shisha",
  soft: "Soft drinks",
  door: "Door & cover",
  grills: "Grills",
  mainCourse: "Main course",
  snacksSides: "Snacks & sides",
  soupsStews: "Soups & stews",
  desserts: "Desserts",
};

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  suppliers: "Suppliers",
  wages: "Wages",
  entertainment: "Entertainment",
  rentLicense: "Rent & license",
  security: "Security",
  utilities: "Utilities",
  misc: "Miscellaneous",
  ingredients: "Ingredients",
  kitchenWages: "Kitchen wages",
  gas: "Gas",
  packaging: "Packaging",
  maintenance: "Maintenance",
};

const INCOME_BAR_KEYS = ["spirits", "wine", "beer", "shisha", "soft", "door"];
const INCOME_KITCHEN_KEYS = ["grills", "mainCourse", "snacksSides", "soupsStews", "desserts"];
const EXPENSE_BAR_KEYS = [
  "suppliers",
  "wages",
  "entertainment",
  "rentLicense",
  "security",
  "utilities",
  "misc",
];
const EXPENSE_KITCHEN_KEYS = ["ingredients", "kitchenWages", "gas", "packaging", "maintenance"];

async function truncateAll() {
  await db.execute(sql.raw(`TRUNCATE TABLE ${ALL_TABLES.join(", ")} RESTART IDENTITY CASCADE`));
}

async function seed() {
  console.log("→ Truncating all tables…");
  await truncateAll();

  // ---- Club ----
  const [club] = await db
    .insert(clubs)
    .values({
      name: DATA.meta.club,
      tagline: DATA.meta.tagline,
      location: DATA.meta.location,
      owner: DATA.meta.owner,
      openTime: DATA.meta.open,
      closeTime: DATA.meta.close,
      currency: DATA.meta.currency,
      mpesaPaybill: "247247",
    })
    .returning({ id: clubs.id });
  const clubId = club.id;

  // ---- Categories (global reference) ----
  await db.insert(incomeCategories).values([
    ...INCOME_BAR_KEYS.map((key, i) => ({
      key,
      label: INCOME_CATEGORY_LABELS[key],
      domain: "bar" as const,
      sortOrder: i,
    })),
    ...INCOME_KITCHEN_KEYS.map((key, i) => ({
      key,
      label: INCOME_CATEGORY_LABELS[key],
      domain: "kitchen" as const,
      sortOrder: i,
    })),
  ]);
  await db.insert(expenseCategories).values([
    ...EXPENSE_BAR_KEYS.map((key, i) => ({
      key,
      label: EXPENSE_CATEGORY_LABELS[key],
      domain: "bar" as const,
      sortOrder: i,
    })),
    ...EXPENSE_KITCHEN_KEYS.map((key, i) => ({
      key,
      label: EXPENSE_CATEGORY_LABELS[key],
      domain: "kitchen" as const,
      sortOrder: i,
    })),
  ]);

  // ---- Suppliers ----
  const supplierRows = await db
    .insert(suppliers)
    .values(
      DATA.suppliers.map((s) => ({
        clubId,
        name: s.name,
        category: s.category,
        phone: s.phone,
        terms: s.terms,
        owed: s.owed,
        lastOrderAt: dmyToISO(s.lastOrder),
        dueDate: dmyToISO(s.dueDate),
      })),
    )
    .returning({ id: suppliers.id, name: suppliers.name });
  const supplierByName = new Map(supplierRows.map((r) => [r.name, r.id]));

  // ---- Products + opening stock movements ----
  const productRows = await db
    .insert(products)
    .values(
      DATA.stock.map((p) => ({
        clubId,
        name: p.name,
        category: p.cat as (typeof products.$inferInsert)["category"],
        unit: p.unit,
        onHand: p.onHand,
        par: p.par,
        cost: p.cost,
        sell: p.sell,
        supplierId: supplierByName.get(p.supplier) ?? null,
        deliveredAt: dmyToISO(p.delivered),
      })),
    )
    .returning({ id: products.id, name: products.name });
  const productByName = new Map(productRows.map((r) => [r.name, r.id]));

  await db.insert(stockMovements).values(
    DATA.stock.map((p) => ({
      productId: productByName.get(p.name)!,
      type: "delivery" as const,
      qty: p.onHand,
      note: "Opening stock",
      occurredAt: new Date(`${dmyToISO(p.delivered)}T12:00:00+03:00`),
    })),
  );

  // ---- Staff (identity resolved across the three prototype arrays) ----
  type StaffSeed = {
    role: (typeof staff.$inferInsert)["role"];
    type: "tonight" | "permanent" | "casual";
  };
  const staffSeed = new Map<string, StaffSeed>();
  for (const s of DATA.staff) staffSeed.set(s.name, { role: s.role, type: "tonight" });
  for (const s of DATA.staffCasuals) staffSeed.set(s.name, { role: s.role, type: "casual" });
  for (const s of DATA.staffPermanent) staffSeed.set(s.name, { role: s.role, type: "permanent" });

  const staffRows = await db
    .insert(staff)
    .values([...staffSeed].map(([name, v]) => ({ clubId, name, role: v.role, type: v.type })))
    .returning({ id: staff.id, name: staff.name });
  const staffByName = new Map(staffRows.map((r) => [r.name, r.id]));

  // Tonight roster → attendance
  await db.insert(attendance).values(
    DATA.staff.map((s) => ({
      staffId: staffByName.get(s.name)!,
      businessDate: NIGHT,
      status: s.status,
      clockIn: s.in ? new Date(nightTs(s.in)) : null,
      wage: s.wage,
      isFee: s.isFee ?? false,
    })),
  );

  // Permanent payroll detail
  await db.insert(staffPermanent).values(
    DATA.staffPermanent.map((s) => ({
      staffId: staffByName.get(s.name)!,
      salary: s.salary,
      nhif: s.nhif,
      nssf: s.nssf,
      paye: s.paye,
      advance: s.advance,
      payStatus: s.status,
    })),
  );

  // Casual payroll detail
  await db.insert(staffCasuals).values(
    DATA.staffCasuals.map((s) => ({
      staffId: staffByName.get(s.name)!,
      dailyRate: s.dailyRate,
      daysWorked: s.daysWorked,
      deduction: s.deduction,
      advance: s.advance,
      posLinked: s.posLinked,
      posSales: s.posSales,
      commissionPct: String(s.commissionPct),
    })),
  );

  // Advance ledger (opening balances behind the standing advances)
  const advanceSeed = [
    ...DATA.staffPermanent
      .filter((s) => s.advance > 0)
      .map((s) => ({ name: s.name, amount: s.advance })),
    ...DATA.staffCasuals
      .filter((s) => s.advance > 0)
      .map((s) => ({ name: s.name, amount: s.advance })),
  ];
  await db.insert(advances).values(
    advanceSeed.map((a) => ({
      staffId: staffByName.get(a.name)!,
      amount: a.amount,
      note: "Opening advance",
      occurredAt: new Date("2026-06-10T12:00:00+03:00"),
    })),
  );

  // POS attribution feed
  await db.insert(posAttributions).values(
    DATA.posFeed.map((f) => ({
      clubId,
      staffId: staffByName.get(f.staff)!,
      businessDate: NIGHT,
      occurredAt: new Date(nightTs(f.t)),
      location: f.table,
      amount: f.amt,
      commission: f.commission,
    })),
  );

  // ---- Sales (recent-feed sample) ----
  const tableToStaff = new Map(DATA.posFeed.map((f) => [f.table, f.staff]));
  await db.insert(sales).values(
    DATA.sales.map((s) => {
      const attrName = tableToStaff.get(s.loc);
      return {
        clubId,
        occurredAt: new Date(nightTs(s.t)),
        businessDate: NIGHT,
        location: s.loc,
        description: s.desc,
        paymentMethod: s.pay,
        amount: s.amt,
        incomeCategoryKey: s.loc === "Door" ? "door" : null,
        staffId: attrName ? (staffByName.get(attrName) ?? null) : null,
      };
    }),
  );

  // ---- Bar expenses tonight ----
  await db.insert(expenses).values(
    DATA.expensesTonight.map((e) => ({
      clubId,
      label: e.label,
      categoryKey: e.cat,
      domain: "bar" as const,
      amount: e.amt,
      recurring: e.recurring,
      occurredAt: new Date(nightTs(e.t)),
      businessDate: NIGHT,
    })),
  );

  // ---- Kitchen orders + expenses ----
  await db.insert(kitchenOrders).values(
    DATA.kitchen.orders.map((o) => ({
      clubId,
      occurredAt: new Date(nightTs(o.t)),
      businessDate: NIGHT,
      location: o.table,
      item: o.item,
      qty: o.qty,
      amount: o.amt,
      status: o.status,
    })),
  );
  await db.insert(expenses).values(
    DATA.kitchen.expensesToday.map((e) => ({
      clubId,
      label: e.label,
      categoryKey: e.cat,
      domain: "kitchen" as const,
      amount: e.amt,
      recurring: e.recurring,
      occurredAt: new Date(nightTs(e.t)),
      businessDate: NIGHT,
    })),
  );

  // ---- Credit customers ----
  await db.insert(creditCustomers).values(
    DATA.credit.map((c) => ({
      clubId,
      name: c.name,
      note: c.note,
      phone: c.phone,
      balance: c.bal,
      lastPaidAt: dmyToISO(c.lastPaid),
    })),
  );

  // ---- Lineup nights + bookings + payments ----
  const nightRows = await db
    .insert(lineupNights)
    .values(
      DATA.lineup.days.map((d) => ({
        clubId,
        date: lineupDateISO(d.date),
        label: d.label ?? null,
        flagship: d.flagship ?? false,
        closed: d.closed ?? false,
      })),
    )
    .returning({ id: lineupNights.id, date: lineupNights.date });
  const nightByDate = new Map(nightRows.map((r) => [r.date, r.id]));

  for (const day of DATA.lineup.days) {
    if (!day.acts?.length) continue;
    const date = lineupDateISO(day.date);
    const inserted = await db
      .insert(bookings)
      .values(
        day.acts.map((a) => ({
          clubId,
          nightId: nightByDate.get(date) ?? null,
          bookingDate: date,
          actName: a.name,
          role: a.role,
          setTime: a.time,
          feeType: a.feeType === "pct" ? ("pct" as const) : ("fixed" as const),
          fee: a.fee,
          pct: a.pct != null ? String(a.pct) : null,
          guest: a.guest ?? false,
        })),
      )
      .returning({ id: bookings.id, actName: bookings.actName });

    // Paid fixed-fee acts get one full payment; partial/unpaid get none.
    const payments = day.acts
      .map((a, i) => ({ act: a, id: inserted[i].id }))
      .filter(({ act }) => act.paid && act.feeType !== "pct")
      .map(({ act, id }) => ({
        bookingId: id,
        amount: act.fee,
        method: "mpesa" as const,
        occurredAt: date,
      }));
    if (payments.length) await db.insert(bookingPayments).values(payments);
  }

  // ---- Reporting snapshots ----
  await db.insert(nightlySnapshots).values(
    DATA.weekly.map((w) => ({
      clubId,
      businessDate: WEEK_DATES[w.day],
      dayLabel: w.day,
      label: w.label ?? null,
      revenue: w.rev,
      cost: w.cost,
      closed: w.closed ?? false,
      isTonight: w.tonight ?? false,
    })),
  );

  await db.insert(nightStats).values({
    clubId,
    businessDate: NIGHT,
    doorEntries: DATA.tonight.doorEntries,
    tablesOpen: DATA.tonight.tablesOpen,
    biggestSale: DATA.tonight.biggestSale,
    peakHour: DATA.tonight.peakHour,
  });

  await db.insert(revenueByHour).values([
    ...DATA.byHour.map((h, i) => ({
      clubId,
      businessDate: NIGHT,
      domain: "bar" as const,
      hour: h.h,
      sortOrder: i,
      amount: h.v,
    })),
    ...DATA.kitchen.byHour.map((h, i) => ({
      clubId,
      businessDate: NIGHT,
      domain: "kitchen" as const,
      hour: h.h,
      sortOrder: i,
      amount: h.v,
    })),
  ]);

  await db.insert(incomeByCategory).values([
    ...DATA.incomeByCategory.map((c) => ({
      clubId,
      businessDate: NIGHT,
      domain: "bar" as const,
      categoryKey: c.key,
      amount: c.v,
    })),
    ...DATA.kitchen.incomeByCategory.map((c) => ({
      clubId,
      businessDate: NIGHT,
      domain: "kitchen" as const,
      categoryKey: c.key,
      amount: c.v,
    })),
  ]);

  await db.insert(paymentMix).values(
    DATA.paymentMix.map((p) => ({
      clubId,
      businessDate: NIGHT,
      method: p.key,
      pct: String(p.pct),
      amount: p.v,
    })),
  );

  await db.insert(topSellers).values(
    DATA.topSellers.map((s) => ({
      clubId,
      businessDate: NIGHT,
      productName: s.name,
      category: s.cat,
      units: s.units,
      revenue: s.rev,
    })),
  );

  await db.insert(expenseByCategory).values([
    ...DATA.expenseByCategory.map((c) => ({
      clubId,
      periodMonth: EXPENSE_MONTH,
      domain: "bar" as const,
      categoryKey: c.key,
      amount: c.v,
    })),
    ...DATA.kitchen.expenseByCategory.map((c) => ({
      clubId,
      periodMonth: EXPENSE_MONTH,
      domain: "kitchen" as const,
      categoryKey: c.key,
      amount: c.v,
    })),
  ]);

  await db.insert(monthlyRevenue).values(
    DATA.monthly.map((m) => ({
      clubId,
      month: monthFirstISO(m.m),
      monthLabel: m.m,
      revenue: m.v,
      partial: m.partial ?? false,
    })),
  );

  console.log("✓ Seed complete.");
  console.log(`  club ${clubId}`);
  console.log(
    `  ${supplierRows.length} suppliers · ${productRows.length} products · ${staffRows.length} staff · ${DATA.sales.length} sales`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });

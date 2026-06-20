import { and, asc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

const { products, stockMovements, suppliers } = schema;

type ProductCategory = (typeof products.$inferSelect)["category"];

export interface ProductRow {
  id: string;
  name: string;
  category: (typeof products.$inferSelect)["category"];
  unit: string;
  onHand: number;
  par: number;
  cost: number;
  sell: number;
  supplierId: string | null;
  supplierName: string | null;
  deliveredAt: string | null;
  /** Per-unit gross margin (sell − cost). */
  margin: number;
  /** Below par level → flag for reorder. */
  low: boolean;
  /** onHand / par, for sorting the low-stock list. */
  ratio: number;
}

const toRow = (p: typeof products.$inferSelect & { supplierName: string | null }): ProductRow => ({
  id: p.id,
  name: p.name,
  category: p.category,
  unit: p.unit,
  onHand: p.onHand,
  par: p.par,
  cost: p.cost,
  sell: p.sell,
  supplierId: p.supplierId,
  supplierName: p.supplierName,
  deliveredAt: p.deliveredAt,
  margin: p.sell - p.cost,
  low: p.onHand < p.par,
  ratio: p.par > 0 ? p.onHand / p.par : 1,
});

/** All stock for a club with supplier name, margin and low-stock flag. */
export async function listProducts(clubId: string): Promise<ProductRow[]> {
  const rows = await db
    .select({
      product: products,
      supplierName: suppliers.name,
    })
    .from(products)
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(eq(products.clubId, clubId))
    .orderBy(asc(products.name));
  return rows.map((r) => toRow({ ...r.product, supplierName: r.supplierName }));
}

/** Low-stock items (onHand < par), most depleted first. */
export async function listLowStock(clubId: string): Promise<ProductRow[]> {
  const rows = await listProducts(clubId);
  return rows.filter((r) => r.low).sort((a, b) => a.ratio - b.ratio);
}

/** Count of low-stock items (for the sidebar badge). */
export async function lowStockCount(clubId: string): Promise<number> {
  const rows = await db
    .select({ onHand: products.onHand, par: products.par })
    .from(products)
    .where(eq(products.clubId, clubId));
  return rows.filter((r) => r.onHand < r.par).length;
}

/** Stock-movement ledger for a product, newest first. */
export function listStockMovements(productId: string) {
  return db.query.stockMovements.findMany({
    where: (m, { eq: e }) => e(m.productId, productId),
    orderBy: (m, { desc }) => desc(m.occurredAt),
  });
}

// ----- Mutations (called from Server Actions) -----

/** Today as a `YYYY-MM-DD` date string (for `deliveredAt`). */
const todayISO = (): string => new Date().toISOString().slice(0, 10);

/** A single product row scoped to its club (ownership check before writes). */
async function getProduct(clubId: string, id: string) {
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.clubId, clubId)))
    .limit(1);
  return row ?? null;
}

export interface NewProductInput {
  name: string;
  category: ProductCategory;
  unit: string;
  onHand: number;
  par: number;
  cost: number;
  sell: number;
  supplierId?: string | null;
  deliveredAt?: string | null;
}

/** Create a product; records the opening stock as a `count` movement. */
export async function createProduct(
  clubId: string,
  input: NewProductInput,
  userId?: string | null,
): Promise<string> {
  const id = crypto.randomUUID();
  const insertProduct = db.insert(products).values({
    id,
    clubId,
    name: input.name,
    category: input.category,
    unit: input.unit,
    onHand: input.onHand,
    par: input.par,
    cost: input.cost,
    sell: input.sell,
    supplierId: input.supplierId ?? null,
    deliveredAt: input.deliveredAt ?? null,
    createdBy: userId ?? null,
  });

  if (input.onHand > 0) {
    await db.batch([
      insertProduct,
      db.insert(stockMovements).values({
        productId: id,
        type: "count",
        qty: input.onHand,
        note: "Opening stock",
        createdBy: userId ?? null,
      }),
    ]);
  } else {
    await insertProduct;
  }
  return id;
}

export interface ProductPatch {
  name?: string;
  category?: ProductCategory;
  unit?: string;
  par?: number;
  cost?: number;
  sell?: number;
  supplierId?: string | null;
  deliveredAt?: string | null;
}

/** Update product details (not on-hand — use {@link adjustStock} for that). */
export async function updateProduct(
  clubId: string,
  id: string,
  patch: ProductPatch,
): Promise<boolean> {
  const res = await db
    .update(products)
    .set(patch)
    .where(and(eq(products.id, id), eq(products.clubId, clubId)))
    .returning({ id: products.id });
  return res.length > 0;
}

/**
 * Stock-changing operations:
 * - `delivery` — receive `qty` units (onHand += |qty|, stamps `deliveredAt`).
 * - `count` — set onHand to the absolute `qty` (ledger records the delta).
 * - `adjustment` — signed correction (spillage/shrinkage), onHand += qty.
 * - `sale` — signed depletion from a recorded sale (Phase 7 income).
 */
export type AdjustType = "delivery" | "count" | "adjustment" | "sale";

/** Apply a stock movement and keep `products.onHand` in sync (atomic batch). */
export async function adjustStock(
  clubId: string,
  id: string,
  args: { type: AdjustType; qty: number; note?: string | null },
  userId?: string | null,
): Promise<boolean> {
  const product = await getProduct(clubId, id);
  if (!product) return false;

  let qty: number; // signed delta written to the ledger
  let newOnHand: number;
  if (args.type === "delivery") {
    qty = Math.abs(args.qty);
    newOnHand = product.onHand + qty;
  } else if (args.type === "count") {
    newOnHand = Math.max(0, Math.round(args.qty));
    qty = newOnHand - product.onHand;
  } else {
    // adjustment / sale — signed
    qty = Math.round(args.qty);
    newOnHand = Math.max(0, product.onHand + qty);
  }

  const set: { onHand: number; deliveredAt?: string } = { onHand: newOnHand };
  if (args.type === "delivery") set.deliveredAt = todayISO();

  await db.batch([
    db
      .update(products)
      .set(set)
      .where(and(eq(products.id, id), eq(products.clubId, clubId))),
    db.insert(stockMovements).values({
      productId: id,
      type: args.type,
      qty,
      note: args.note ?? null,
      createdBy: userId ?? null,
    }),
  ]);
  return true;
}

/** Delete a product (its movement ledger cascades). */
export async function deleteProduct(clubId: string, id: string): Promise<boolean> {
  const res = await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.clubId, clubId)))
    .returning({ id: products.id });
  return res.length > 0;
}

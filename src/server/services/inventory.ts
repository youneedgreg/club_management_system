import { asc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

const { products, suppliers } = schema;

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

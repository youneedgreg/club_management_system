import { and, count, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { adjustStock } from "./inventory";
import { getTonightDate } from "./period";

const { sales, saleItems, staffCasuals, posAttributions } = schema;

/** Recent sales feed for a night, newest first. */
export function getRecentSales(clubId: string, businessDate: string, limit = 20) {
  return db
    .select()
    .from(sales)
    .where(and(eq(sales.clubId, clubId), eq(sales.businessDate, businessDate)))
    .orderBy(desc(sales.occurredAt))
    .limit(limit);
}

/** Number of sales recorded on a night (the "transactions" stat). */
export async function countSales(clubId: string, businessDate: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(sales)
    .where(and(eq(sales.clubId, clubId), eq(sales.businessDate, businessDate)));
  return row?.n ?? 0;
}

export type PaymentMethod = (typeof sales.$inferSelect)["paymentMethod"];

export interface RecordSaleInput {
  location?: string | null;
  description?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  staffId?: string | null;
  incomeCategoryKey?: string | null;
  /** Optional stock link — depletes on-hand and records a sale line. */
  productId?: string | null;
  qty?: number;
}

/**
 * Record a bar sale on tonight's trading date. When a product is linked the
 * sale depletes its stock (a `sale` movement); when the attributed staffer is a
 * POS-linked casual, the sale is mirrored to the POS feed with commission.
 */
export async function recordSale(
  clubId: string,
  input: RecordSaleInput,
  userId?: string | null,
): Promise<string> {
  const businessDate = await getTonightDate(clubId);
  const saleId = crypto.randomUUID();
  const occurredAt = new Date();
  const qty = input.qty ?? 0;
  const linked = Boolean(input.productId) && qty > 0;

  await db.insert(sales).values({
    id: saleId,
    clubId,
    occurredAt,
    businessDate,
    location: input.location ?? null,
    description: input.description ?? null,
    paymentMethod: input.paymentMethod,
    amount: input.amount,
    incomeCategoryKey: input.incomeCategoryKey ?? null,
    staffId: input.staffId ?? null,
    createdBy: userId ?? null,
  });

  if (linked) {
    await db.insert(saleItems).values({
      saleId,
      productId: input.productId!,
      description: input.description ?? null,
      qty,
      unitPrice: Math.round(input.amount / qty),
      lineTotal: input.amount,
    });
    await adjustStock(clubId, input.productId!, { type: "sale", qty: -qty, note: "Sale" }, userId);
  }

  if (input.staffId) {
    const [casual] = await db
      .select({ posLinked: staffCasuals.posLinked, commissionPct: staffCasuals.commissionPct })
      .from(staffCasuals)
      .where(eq(staffCasuals.staffId, input.staffId))
      .limit(1);
    if (casual?.posLinked) {
      const commission = Math.round((input.amount * Number(casual.commissionPct)) / 100);
      await db.insert(posAttributions).values({
        clubId,
        staffId: input.staffId,
        businessDate,
        occurredAt,
        location: input.location ?? null,
        amount: input.amount,
        commission,
        createdBy: userId ?? null,
      });
    }
  }

  return saleId;
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMembership } from "@/lib/auth/session";
import { adjustStock, createProduct, deleteProduct, updateProduct } from "@/server/services";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const categoryEnum = z.enum(["spirits", "beer", "wine", "soft", "shisha", "cigarettes"]);
const uuid = z.string().uuid();

const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: categoryEnum,
  unit: z.string().trim().min(1).max(24),
  onHand: z.number().int().min(0).max(1_000_000),
  par: z.number().int().min(0).max(1_000_000),
  cost: z.number().int().min(0).max(100_000_000),
  sell: z.number().int().min(0).max(100_000_000),
  supplierId: uuid.nullish(),
  deliveredAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
});

const adjustSchema = z.object({
  type: z.enum(["delivery", "count", "adjustment"]),
  qty: z.number().int().min(-1_000_000).max(1_000_000),
  note: z.string().trim().max(200).nullish(),
});

/** Stock figures feed both the table and the dashboard low-stock card + badge. */
function revalidateStock() {
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function createProductAction(input: unknown): Promise<ActionResult> {
  const { user, clubId } = await requireMembership();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid product details" };
  await createProduct(clubId, parsed.data, user.id);
  revalidateStock();
  return { ok: true };
}

export async function updateProductAction(id: unknown, input: unknown): Promise<ActionResult> {
  const { clubId } = await requireMembership();
  const idCheck = uuid.safeParse(id);
  const parsed = productSchema.omit({ onHand: true }).safeParse(input);
  if (!idCheck.success || !parsed.success) return { ok: false, error: "Invalid product details" };
  const ok = await updateProduct(clubId, idCheck.data, parsed.data);
  return ok ? (revalidateStock(), { ok: true }) : { ok: false, error: "Product not found" };
}

export async function adjustStockAction(id: unknown, input: unknown): Promise<ActionResult> {
  const { user, clubId } = await requireMembership();
  const idCheck = uuid.safeParse(id);
  const parsed = adjustSchema.safeParse(input);
  if (!idCheck.success || !parsed.success) return { ok: false, error: "Invalid adjustment" };
  const ok = await adjustStock(clubId, idCheck.data, parsed.data, user.id);
  return ok ? (revalidateStock(), { ok: true }) : { ok: false, error: "Product not found" };
}

export async function deleteProductAction(id: unknown): Promise<ActionResult> {
  const { clubId } = await requireMembership();
  const idCheck = uuid.safeParse(id);
  if (!idCheck.success) return { ok: false, error: "Invalid product" };
  const ok = await deleteProduct(clubId, idCheck.data);
  return ok ? (revalidateStock(), { ok: true }) : { ok: false, error: "Product not found" };
}

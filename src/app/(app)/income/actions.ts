"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMembership } from "@/lib/auth/session";
import { recordSale } from "@/server/services";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const uuid = z.string().uuid();

const saleSchema = z.object({
  location: z.string().trim().max(60).nullish(),
  description: z.string().trim().max(200).nullish(),
  amount: z.number().int().min(1).max(100_000_000),
  paymentMethod: z.enum(["mpesa", "cash", "card"]),
  staffId: uuid.nullish(),
  productId: uuid.nullish(),
  qty: z.number().int().min(0).max(100_000).optional(),
});

export async function recordSaleAction(input: unknown): Promise<ActionResult> {
  const { user, clubId } = await requireMembership();
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid sale" };
  if (!parsed.data.description && !parsed.data.productId) {
    return { ok: false, error: "Add a description or pick a product" };
  }
  await recordSale(clubId, parsed.data, user.id);
  // Feed + transaction count here; net position on the dashboard; stock on depletion.
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/stock");
  return { ok: true };
}

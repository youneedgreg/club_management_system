"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMembership } from "@/lib/auth/session";
import { createExpense, deleteExpense, updateExpense } from "@/server/services";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const uuid = z.string().uuid();
const categoryEnum = z.enum([
  "suppliers",
  "wages",
  "entertainment",
  "rentLicense",
  "security",
  "utilities",
  "misc",
]);

const expenseSchema = z.object({
  label: z.string().trim().min(1).max(120),
  categoryKey: categoryEnum,
  amount: z.number().int().min(1).max(100_000_000),
  recurring: z.boolean(),
});

function revalidateExpenses() {
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function createExpenseAction(input: unknown): Promise<ActionResult> {
  const { user, clubId } = await requireMembership();
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid expense" };
  await createExpense(clubId, parsed.data, user.id);
  revalidateExpenses();
  return { ok: true };
}

export async function updateExpenseAction(id: unknown, input: unknown): Promise<ActionResult> {
  const { clubId } = await requireMembership();
  const idCheck = uuid.safeParse(id);
  const parsed = expenseSchema.safeParse(input);
  if (!idCheck.success || !parsed.success) return { ok: false, error: "Invalid expense" };
  const ok = await updateExpense(clubId, idCheck.data, parsed.data);
  return ok ? (revalidateExpenses(), { ok: true }) : { ok: false, error: "Expense not found" };
}

export async function deleteExpenseAction(id: unknown): Promise<ActionResult> {
  const { clubId } = await requireMembership();
  const idCheck = uuid.safeParse(id);
  if (!idCheck.success) return { ok: false, error: "Invalid expense" };
  const ok = await deleteExpense(clubId, idCheck.data);
  return ok ? (revalidateExpenses(), { ok: true }) : { ok: false, error: "Expense not found" };
}

/**
 * Role hierarchy and module-level authorization — pure, no imports, so both the
 * client nav and the server data-access layer share one source of truth.
 *
 * Tiers: `owner` (full access) > `manager` (runs the floor) > `cashier`
 * (records sales/expenses). Sensitive modules — payables, salaries, settings,
 * user management — are owner-only, per Phase 4.
 */
export type MemberRole = "owner" | "manager" | "cashier";

const RANK: Record<MemberRole, number> = { cashier: 1, manager: 2, owner: 3 };

/** True when `role` is at least `min` in the hierarchy. */
export const atLeast = (role: MemberRole, min: MemberRole): boolean => RANK[role] >= RANK[min];

/**
 * Minimum role to access each module (keyed by nav segment) and a few sensitive
 * sub-capabilities (`salaries` = permanent payroll, `manageUsers`).
 */
export const MODULE_MIN_ROLE: Record<string, MemberRole> = {
  dashboard: "cashier",
  stock: "cashier",
  income: "cashier",
  expenses: "cashier",
  kitchen: "cashier",
  lineup: "manager",
  credit: "manager",
  reports: "manager",
  staff: "manager",
  payables: "owner",
  settings: "owner",
  salaries: "owner",
  manageUsers: "owner",
};

/** Whether a role may access a module/capability key (unknown keys default open). */
export function canAccess(role: MemberRole, moduleKey: string): boolean {
  const min = MODULE_MIN_ROLE[moduleKey];
  return min ? atLeast(role, min) : true;
}

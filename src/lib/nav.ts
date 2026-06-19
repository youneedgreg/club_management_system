/** Navigation config — order, icons, badge sources, and route paths. */
import type { IconName } from "@/components/icons";
import { DATA } from "@/lib/data";

export type BadgeKey = "low" | "overdue";

export interface NavEntry {
  /** i18n key, also used as the route segment. */
  k: string;
  /** Route path. */
  href: string;
  /** Icon name. */
  ic: IconName;
  /** Optional badge source. */
  badge?: BadgeKey;
}

export const NAV: NavEntry[] = [
  { k: "dashboard", href: "/dashboard", ic: "dashboard" },
  { k: "stock", href: "/stock", ic: "stock", badge: "low" },
  { k: "income", href: "/income", ic: "income" },
  { k: "expenses", href: "/expenses", ic: "expenses" },
  { k: "kitchen", href: "/kitchen", ic: "pot" },
  { k: "lineup", href: "/lineup", ic: "calendar" },
  { k: "credit", href: "/credit", ic: "credit", badge: "overdue" },
  { k: "payables", href: "/payables", ic: "banknote" },
  { k: "staff", href: "/staff", ic: "staff" },
  { k: "reports", href: "/reports", ic: "reports" },
  { k: "settings", href: "/settings", ic: "settings" },
];

/** Primary destinations shown in the mobile bottom nav (plus a "More" sheet). */
export const PRIMARY = ["dashboard", "stock", "income", "expenses"];

/** Count of stock items below par. */
export const lowCount = DATA.stock.filter((s) => s.onHand < s.par).length;

/** Count of credit customers overdue (> 7 days). */
export const overdueCount = DATA.credit.filter((c) => c.age > 7).length;

export const badgeVal = (b?: BadgeKey): number =>
  b === "low" ? lowCount : b === "overdue" ? overdueCount : 0;

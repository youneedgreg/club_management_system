/**
 * Category / payment / role metadata — color + icon per key.
 * Ported from the prototype `ui.jsx`. Colors reference CSS theme variables so
 * they adapt to dark/light automatically.
 */
import type { IconName } from "@/components/icons";

export interface Meta {
  c: string;
  ic: IconName;
}

/** Bar income categories. */
export const CAT: Record<string, Meta> = {
  spirits: { c: "var(--gold)", ic: "bottle" },
  beer: { c: "var(--blue)", ic: "beer" },
  wine: { c: "var(--violet)", ic: "bottle" },
  shisha: { c: "var(--green)", ic: "smoke" },
  soft: { c: "#5fd0c4", ic: "bottle" },
  cigarettes: { c: "#c3bba9", ic: "smoke" },
  door: { c: "var(--gold-2)", ic: "door" },
};

/** Payment methods. */
export const PAY: Record<string, Meta> = {
  mpesa: { c: "var(--mpesa)", ic: "wallet" },
  cash: { c: "var(--gold)", ic: "cash" },
  card: { c: "var(--blue)", ic: "card" },
};

/** Bar expense categories. */
export const ECAT: Record<string, Meta> = {
  suppliers: { c: "var(--blue)", ic: "truck" },
  wages: { c: "var(--gold)", ic: "users" },
  entertainment: { c: "var(--violet)", ic: "music" },
  rentLicense: { c: "#5fd0c4", ic: "pin" },
  security: { c: "var(--red)", ic: "shield" },
  utilities: { c: "var(--green)", ic: "bolt" },
  misc: { c: "#c3bba9", ic: "receipt" },
};

/** Staff role accent colors. */
export const ROLE: Record<string, string> = {
  supervisor: "var(--gold)",
  cashier: "var(--blue)",
  bartender: "var(--green)",
  waiter: "#5fd0c4",
  securityRole: "var(--red)",
  dj: "var(--violet)",
};

/** Kitchen income categories. */
export const KCAT: Record<string, Meta> = {
  grills: { c: "var(--red)", ic: "flame" },
  mainCourse: { c: "var(--gold)", ic: "pot" },
  snacksSides: { c: "var(--green)", ic: "receipt" },
  soupsStews: { c: "var(--blue)", ic: "pot" },
  desserts: { c: "var(--violet)", ic: "sparkles" },
};

/** Kitchen expense categories. */
export const KECAT: Record<string, Meta> = {
  ingredients: { c: "var(--green)", ic: "pot" },
  kitchenWages: { c: "var(--gold)", ic: "users" },
  gas: { c: "var(--red)", ic: "flame" },
  packaging: { c: "#5fd0c4", ic: "receipt" },
  maintenance: { c: "var(--violet)", ic: "settings" },
};

/** Supplier categories. */
export const SCAT: Record<string, Meta> = {
  drinks: { c: "var(--blue)", ic: "bottle" },
  food: { c: "var(--green)", ic: "pot" },
  utilities: { c: "var(--gold)", ic: "bolt" },
  services: { c: "var(--violet)", ic: "shield" },
};

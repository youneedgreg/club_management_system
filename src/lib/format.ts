/** Money / number formatting helpers — KES, thousands separators. */

/** Full amount with thousands separators, e.g. 593960 → "593,960". */
export const money = (n: number): string => Math.round(n).toLocaleString("en-US");

/** Compact amount, e.g. 593960 → "594k", 14200000 → "14.2M". */
export const moneyK = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.0+$/, "") + "M";
  if (a >= 1e3) return Math.round(n / 1e3) + "k";
  return "" + Math.round(n);
};

/** Translucent fill from a CSS color, matching the prototype's chip backgrounds. */
export const softBg = (c: string): string => `color-mix(in srgb, ${c} 15%, transparent)`;

const AVATAR_COLORS = ["#ecbb4e", "#6aa6ff", "#3fd6a0", "#b591ff", "#ff8f6f", "#5fd0c4", "#54c265"];

/** Deterministic avatar color from a name. */
export const avatarColor = (name: string): string => {
  let s = 0;
  for (const ch of name) s += ch.charCodeAt(0);
  return AVATAR_COLORS[s % AVATAR_COLORS.length];
};

/** Up-to-two-letter initials from a name (splits on spaces and em dashes). */
export const initials = (name: string): string =>
  name
    .split(/[\s—]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

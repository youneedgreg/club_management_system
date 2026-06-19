/**
 * Locale-aware number & date formatting (Intl-based).
 *
 * Note: financial figures keep Western digits + grouping via `money`/`moneyK`
 * in `./format` — that's a deliberate design choice carried over from the
 * prototype (KES amounts read the same in every locale). These helpers are for
 * locale-sensitive display of generic counts, percentages and dates (e.g.
 * Reports). In client components prefer next-intl's `useFormatter()`.
 */
import type { Locale } from "@/lib/i18n";

/** BCP-47 tags for our app locales. */
const INTL_LOCALE: Record<Locale, string> = {
  en: "en-KE",
  fr: "fr-FR",
  ar: "ar-KE",
};

export const intlLocale = (locale: Locale): string => INTL_LOCALE[locale] ?? "en-KE";

/** Locale-aware integer/decimal grouping. */
export const formatNumber = (
  n: number,
  locale: Locale = "en",
  options?: Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(intlLocale(locale), options).format(n);

/** Locale-aware percentage, e.g. 62 → "62 %" (fr) / "62%" (en). */
export const formatPercent = (n: number, locale: Locale = "en"): string =>
  new Intl.NumberFormat(intlLocale(locale), { style: "percent", maximumFractionDigits: 0 }).format(
    n / 100,
  );

/** Locale-aware date formatting. */
export const formatDate = (
  date: Date | number,
  locale: Locale = "en",
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string => new Intl.DateTimeFormat(intlLocale(locale), options).format(date);

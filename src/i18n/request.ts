import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/i18n/locale";
import { I18N } from "@/lib/i18n";

/**
 * Per-request i18n config. The message catalogs are the trilingual dictionary
 * ported in Phase 1 (`src/lib/i18n.ts`), so there's a single source of truth.
 * Missing keys fall back to the key itself (mirrors the prototype behaviour).
 */
export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: I18N[locale],
    getMessageFallback: ({ key }) => key,
    onError() {
      /* swallow MISSING_MESSAGE — fallback returns the key */
    },
  };
});

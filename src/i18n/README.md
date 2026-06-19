# `src/i18n` — Internationalization (next-intl)

Locales: `en`, `fr`, `ar` (Arabic = RTL). Approach: **next-intl, cookie-based
locale (no URL prefix)** — URLs stay `/dashboard`, `/stock`, … and the active
locale lives in the `NEXT_LOCALE` cookie (replacing the prototype's `bs_lang`).

- `locale.ts` — server actions `getUserLocale` / `setUserLocale` (read/write the
  cookie). The locale switcher calls `setUserLocale` inside a transition.
- `request.ts` — `getRequestConfig`: resolves the locale and loads messages from
  the trilingual dictionary in [`src/lib/i18n.ts`](../lib/i18n.ts) (single source
  of truth). Missing keys fall back to the key itself.

Rendering: the root layout reads the locale server-side and sets `<html lang>` +
`dir`, then wraps the tree in `NextIntlClientProvider` (via
[`IntlProvider`](../components/intl-provider.tsx)). `useT()` in
[`providers.tsx`](../components/providers.tsx) exposes translation + locale +
theme to client components. Locale-aware number/date helpers live in
[`src/lib/intl-format.ts`](../lib/intl-format.ts).

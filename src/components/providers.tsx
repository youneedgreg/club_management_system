"use client";

/**
 * Black Stars — client providers.
 *
 * Language now comes from next-intl (cookie-based locale, SSR-translated); this
 * module owns the *theme* (dark/light) only, persisted to `bs_theme`. `useT()`
 * keeps the Phase 1 API — `{ t, lang, setLang, dir, theme, setTheme }` — so
 * components don't change; it just reads translation/locale from next-intl.
 */
import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setUserLocale } from "@/i18n/locale";
import { I18N, type Dir, type Locale } from "@/lib/i18n";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (th: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Hydrate from localStorage once, after mount (matches the pre-paint script).
  useEffect(() => {
    const stored = localStorage.getItem("bs_theme") as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from persisted prefs
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = useCallback((th: Theme) => {
    setThemeState(th);
    localStorage.setItem("bs_theme", th);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

interface I18nApi {
  t: (key: string) => string;
  lang: Locale;
  setLang: (l: Locale) => void;
  dir: Dir;
  theme: Theme;
  setTheme: (th: Theme) => void;
}

/**
 * Combined translation + locale + theme accessor. Switching language sets the
 * locale cookie via a server action inside a transition; the route re-renders
 * with the new messages and `<html lang/dir>`.
 */
export function useT(): I18nApi {
  const translate = useTranslations();
  const locale = useLocale() as Locale;
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();

  const setLang = useCallback(
    (l: Locale) => {
      startTransition(() => {
        void setUserLocale(l);
      });
    },
    [startTransition],
  );

  return {
    t: (key: string) => translate(key),
    lang: locale,
    setLang,
    dir: I18N[locale]._dir,
    theme,
    setTheme,
  };
}

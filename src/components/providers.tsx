"use client";

/**
 * Black Stars — client providers: theme (dark/light) + language (en/fr/ar).
 *
 * Mirrors the prototype's `App` state: persists `bs_theme` / `bs_lang`, sets
 * `data-theme`, `lang`, and `dir` on <html>. A blocking inline script in the
 * root layout applies these before paint to avoid a flash; this provider keeps
 * React state in sync and exposes `useT()`.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { I18N, translate, type Dir, type Locale } from "@/lib/i18n";

export type Theme = "dark" | "light";

interface I18nContextValue {
  t: (key: string) => string;
  lang: Locale;
  setLang: (l: Locale) => void;
  dir: Dir;
  theme: Theme;
  setTheme: (th: Theme) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within <Providers>");
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");
  const [theme, setThemeState] = useState<Theme>("dark");

  // Hydrate from localStorage once, after mount. Reading it during render/SSR
  // would diverge from the server-rendered "en"/"dark" defaults and tear
  // translated text; syncing post-hydration is the intended pattern here.
  useEffect(() => {
    const storedLang = localStorage.getItem("bs_lang") as Locale | null;
    const storedTheme = localStorage.getItem("bs_theme") as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from persisted prefs
    if (storedLang && I18N[storedLang]) setLangState(storedLang);

    if (storedTheme === "light" || storedTheme === "dark") setThemeState(storedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = I18N[lang]._dir;
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    localStorage.setItem("bs_lang", l);
  }, []);

  const setTheme = useCallback((th: Theme) => {
    setThemeState(th);
    localStorage.setItem("bs_theme", th);
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);
  const dir = I18N[lang]._dir;

  return (
    <I18nContext.Provider value={{ t, lang, setLang, dir, theme, setTheme }}>
      {children}
    </I18nContext.Provider>
  );
}

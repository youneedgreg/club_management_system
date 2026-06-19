"use server";

/**
 * Cookie-based locale service (no URL prefix). The locale persists in the
 * `NEXT_LOCALE` cookie so the server can render the right language/direction —
 * this replaces the prototype's `bs_lang` localStorage key.
 */
import { cookies } from "next/headers";
import { LOCALES, type Locale } from "@/lib/i18n";

const COOKIE = "NEXT_LOCALE";
const DEFAULT_LOCALE: Locale = "en";

function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as string[]).includes(v);
}

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  (await cookies()).set(COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

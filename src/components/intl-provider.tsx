"use client";

/**
 * Client wrapper around NextIntlClientProvider. Lives in a client component so
 * the `onError` / `getMessageFallback` handlers (functions) can be attached —
 * they can't cross the server→client boundary as props. Missing keys fall back
 * to the key itself, matching the prototype's `translate()` behaviour.
 */
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={({ key }) => key}
      onError={() => {
        /* swallow MISSING_MESSAGE — fallback returns the key */
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}

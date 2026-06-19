import type { Metadata, Viewport } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { IntlProvider } from "@/components/intl-provider";
import { ThemeProvider } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";
import { I18N, type Locale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Black Stars — Club Manager",
  description: "Lounge & nightclub management for Black Stars, Westlands · Nairobi.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090c",
};

/**
 * Blocking script: apply the persisted theme to <html> before paint to avoid a
 * flash. Locale/direction are server-rendered from the cookie (below), so no
 * client correction is needed for language.
 */
const PRE_PAINT = `try{
  var t=localStorage.getItem('bs_theme')||'dark';
  document.documentElement.dataset.theme=t;
  if(t==='dark')document.documentElement.classList.add('dark');
}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const dir = I18N[locale]._dir;

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        <IntlProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </IntlProvider>
      </body>
    </html>
  );
}

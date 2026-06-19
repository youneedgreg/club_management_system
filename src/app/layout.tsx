import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";
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
 * Blocking script: apply persisted theme/language to <html> before paint to
 * avoid a flash. The Providers component keeps React state in sync afterwards.
 */
const PRE_PAINT = `try{
  var t=localStorage.getItem('bs_theme')||'dark';
  document.documentElement.dataset.theme=t;
  if(t==='dark')document.documentElement.classList.add('dark');
  var l=localStorage.getItem('bs_lang')||'en';
  document.documentElement.lang=l;
  document.documentElement.dir=l==='ar'?'rtl':'ltr';
}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

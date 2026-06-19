import { Space_Grotesk, Hanken_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";

/** Body / UI font — maps to `--sans` (and shadcn `--font-sans`). */
export const fontSans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

/** Display / numeric font — maps to `--disp`. */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-disp",
  display: "swap",
});

/** Arabic font — used for both body and display when `lang="ar"`. */
export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ar",
  display: "swap",
});

export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontArabic.variable}`;

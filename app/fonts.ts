import { Cormorant_Garamond, Manrope } from "next/font/google";

// The site's faces, shared by the root layout and the global error page (which replaces it).

export const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// The blueprint's functional sans: navigation, body, forms and figures.
export const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const fontVariables = `${display.variable} ${manrope.variable}`;

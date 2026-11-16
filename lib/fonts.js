import { Source_Serif_4 } from "next/font/google";

// Reading font for long-form blog content (title + body), Medium-style.
export const articleSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-article",
  display: "swap",
});

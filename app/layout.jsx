import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tpicpc.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TPI CPC - Thakurgaon Polytechnic Institute Computer & Programming Club",
    template: "%s | TPI CPC",
  },
  description:
    "Thakurgaon Polytechnic Institute Computer & Programming Club — Workshops, contests, hackathons, and a community of 1000+ students learning to code, build, and compete.",
  keywords: ["TPI CPC", "Programming Club", "Thakurgaon Polytechnic", "Coding", "Workshops"],
  icons: { icon: "/tpicpc_logo.png" },
  openGraph: {
    title: "TPI CPC — Computer & Programming Club",
    description: "Workshops, contests, hackathons & a community of 1000+ student coders.",
    url: siteUrl,
    siteName: "TPI CPC",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

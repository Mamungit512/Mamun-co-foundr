import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";

import SiteAnalytics from "@/components/site/analytics/SiteAnalytics";
import Footer from "@/components/site/shell/Footer";
import Header from "@/components/site/shell/Header";
import "./site.css";

// Root layout for the marketing site. It is separate from the app's
// document on purpose: no Clerk, PostHog, Elfsight or other third-party
// scripts load on these pages (build spec §2, §16).

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mamuncofoundr.com"),
  title: {
    default: "Mamun — the co-founder engine, run by your institution",
    template: "%s — Mamun",
  },
  description:
    "Co-founder matching in one FERPA-compliant platform your campus controls.",
};

// Pinch-zoom must keep working: no maximum-scale, no user-scalable=no.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-8 focus:left-8 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-18 focus:py-12 focus:text-white focus:type-button"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <SiteAnalytics />
      </body>
    </html>
  );
}

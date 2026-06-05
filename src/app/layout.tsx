import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script";

import "./globals.css";
import QueryProvider from "./_providers/QueryProvider";
import { PostHogProvider } from "./_providers/PostHogProvider";
import { Toaster } from "react-hot-toast";
import ReferralTracker from "@/components/referrals/referral-tracker";
import IntroSurveyModal from "@/components/IntroSurveyModal";

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.ttf",
});

export const metadata: Metadata = {
  title: "Mamun Cofounder Platform",
  description: "Cofounding Platform for the Muslim Community",
  icons: {
    icon: "/img/mamun-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Analytics />
      <html lang="en">
        <body
          className={`${satoshi.className} scroll-smooth bg-(--charcoal-black) antialiased lg:text-lg`}
        >
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
          />

          <Suspense fallback={null}>
            <PostHogProvider>
              <QueryProvider>
                <ReferralTracker />
                {children}
              </QueryProvider>
            </PostHogProvider>
          </Suspense>
          <Suspense fallback={null}>
            <IntroSurveyModal />
          </Suspense>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

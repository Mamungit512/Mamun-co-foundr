import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";
import QueryProvider from "./_providers/QueryProvider";
import { PostHogProvider } from "./_providers/PostHogProvider";
import { Toaster } from "react-hot-toast";
import ReferralTracker from "@/components/referrals/referral-tracker";

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.ttf",
});

export const metadata: Metadata = {
  title: "Mamun Cofounder Platform",
  description: "Cofounding Platform for the Muslim Community",
  icons: {
    icon: "/img/favicon.jpg",
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
          <PostHogProvider>
            <QueryProvider>
              <ReferralTracker />
              <Header />
              {children}
              <Socials />
              <Footer />
            </QueryProvider>
          </PostHogProvider>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

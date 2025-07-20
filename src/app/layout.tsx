import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";

import "./globals.css";
import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";
import QueryProvider from "./_providers/QueryProvider";

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.ttf",
});

export const metadata: Metadata = {
  title: "Mamun Cofounder Platform",
  description: "Cofounding Platform for the Muslim Community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${satoshi.className} scroll-smooth bg-(--charcoal-black) antialiased lg:text-lg`}
        >
          <QueryProvider>
            <Header />
            {children}
            <Socials />
            <Footer />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

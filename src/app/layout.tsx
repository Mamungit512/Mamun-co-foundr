import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";

import "./globals.css";
import Header from "@/components/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/Footer";

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
          className={`${satoshi.className} bg-(--charcoal-black) text-lg antialiased`}
        >
          <Header />
          {children}
          <Socials />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

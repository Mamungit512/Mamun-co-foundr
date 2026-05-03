"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSchoolRoute = pathname.startsWith("/school/");

  return (
    <>
      {!isSchoolRoute && <Header />}
      {children}
      {!isSchoolRoute && <Socials />}
      {!isSchoolRoute && <Footer />}
    </>
  );
}

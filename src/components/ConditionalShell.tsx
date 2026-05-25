"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";

const APEX_HOSTS = new Set([
  "mamuncofoundr.com",
  "www.mamuncofoundr.com",
  "localhost",
]);

function isSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const bare = window.location.hostname.toLowerCase();
  if (APEX_HOSTS.has(bare) || bare.endsWith(".vercel.app")) return false;
  return bare.split(".").length >= 3;
}

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSchoolRoute = pathname.startsWith("/school/") || isSubdomain();

  return (
    <>
      {!isSchoolRoute && <Header />}
      {children}
      {!isSchoolRoute && <Socials />}
      {!isSchoolRoute && <Footer />}
    </>
  );
}

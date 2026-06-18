import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";
import SchoolUserGuard from "@/components/SchoolUserGuard";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SchoolUserGuard />
      <Header />
      {children}
      <Socials />
      <Footer />
    </>
  );
}

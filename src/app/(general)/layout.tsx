import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Socials />
      <Footer />
    </>
  );
}

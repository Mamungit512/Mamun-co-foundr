import Header from "@/components/header_footer/Header";
import Socials from "@/components/Socials";
import Footer from "@/components/header_footer/Footer";
import AppDocument, { appMetadata } from "../_shell/AppDocument";

export const metadata = appMetadata;

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDocument>
      <Header />
      {children}
      <Socials />
      <Footer />
    </AppDocument>
  );
}

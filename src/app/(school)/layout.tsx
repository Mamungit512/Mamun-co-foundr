import AppDocument, { appMetadata } from "../_shell/AppDocument";

export const metadata = appMetadata;

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppDocument>{children}</AppDocument>;
}

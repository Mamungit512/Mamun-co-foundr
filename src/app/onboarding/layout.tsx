import { redirect } from "next/navigation";
// import { auth } from "@clerk/nextjs/server"; // Clerk devre dışı ise yorumlayabilirsiniz

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Clerk key yoksa geçici mock kullanıcı
  const user = {
    sessionClaims: { metadata: { onboardingComplete: false } },
  };

  // Eğer gerçek Clerk key eklediyseniz bunu kullanabilirsiniz:
  // const user = await auth();

  if (user.sessionClaims?.metadata?.onboardingComplete === true) {
    redirect("/cofoundr-matching");
  }

  return <>{children}</>;
}


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mamun Co-Foundr — Under Maintenance",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-(--charcoal-black) px-6 py-20 text-center text-(--mist-white)">
      <h1 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">
        MAMUN
      </h1>
      <p className="mt-6 max-w-md text-base text-gray-300 sm:text-lg">
        Currently under maintenance — thank you for your patience.
      </p>
    </main>
  );
}

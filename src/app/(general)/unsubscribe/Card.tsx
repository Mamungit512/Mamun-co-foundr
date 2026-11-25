function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-gray-900 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bf5700]">
          UT co-foundr matching
        </p>
        <h1 className="mt-3 font-serif text-2xl">{title}</h1>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-gray-700">{children}</div>
      </div>
    </main>
  );
}

export default Card;

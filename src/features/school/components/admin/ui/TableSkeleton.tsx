import Skeleton from "@/components/ui/Skeleton";

// Placeholder shaped like the real tables so the page does not jump when data
// arrives. Cards on mobile, a table frame on desktop.
export default function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2 md:hidden">
        {Array.from({ length: Math.min(rows, 4) }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border p-3"
            style={{ borderColor: "var(--ui-border)" }}
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-56" />
          </div>
        ))}
      </div>
      <div
        className="hidden overflow-hidden rounded-xl border md:block"
        style={{ borderColor: "var(--ui-border)" }}
      >
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: "var(--ui-border)",
            backgroundColor: "var(--ui-surface)",
          }}
        >
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b px-4 py-3 last:border-b-0"
            style={{ borderColor: "var(--ui-border)" }}
          >
            <div className="w-48 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

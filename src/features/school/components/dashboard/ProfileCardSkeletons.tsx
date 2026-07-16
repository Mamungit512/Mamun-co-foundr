import Skeleton from "@/components/ui/Skeleton";

export function SwipeCardSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      <div className="flex-1 overflow-y-auto p-5">
        {/* Avatar + Name row */}
        <div className="mb-4 flex items-start gap-3">
          <Skeleton className="h-16 w-16 flex-shrink-0 rounded-full" />
          <div className="flex flex-1 min-w-0 flex-col gap-1">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* About box */}
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-[var(--ui-border)] p-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>

        {/* Tag row */}
        <div className="mb-1 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--ui-border)] px-5 py-4">
        <Skeleton className="h-11 w-11 flex-shrink-0 rounded-full" />
        <Skeleton className="h-11 w-28 flex-shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export function SearchResultCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      <div className="p-4">
        {/* Avatar + name row */}
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Bio snippet */}
        <div className="mb-3 flex flex-col gap-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Sector tags */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-[var(--ui-border)] px-4 py-3">
        <Skeleton className="h-10 w-24 flex-shrink-0 rounded-full" />
      </div>
    </div>
  );
}

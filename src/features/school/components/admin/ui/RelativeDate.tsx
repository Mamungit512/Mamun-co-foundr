import { formatRelativeTime } from "../lib/freshness";

// "2d ago" with the exact date on hover. Re-renders with the page clock, so
// it stays current without its own timer.
export default function RelativeDate({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString()}>
      {formatRelativeTime(iso)}
    </time>
  );
}

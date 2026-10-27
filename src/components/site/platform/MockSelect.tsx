// A select-style field inside a dark mock (not a real control).
export default function MockSelect({ value }: { value: string }) {
  return (
    <div className="flex min-h-44 items-center justify-between rounded-nested border border-dark-line px-12 py-11 font-normal text-dk-body type-m-13 lg:min-h-0">
      <span>{value}</span>
      <span className="text-dk-muted">⌄</span>
    </div>
  );
}

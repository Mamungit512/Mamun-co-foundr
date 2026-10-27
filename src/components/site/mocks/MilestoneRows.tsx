import type { Milestone, MilestoneState } from "@/content/site/home";

const TITLE: Record<MilestoneState, string> = {
  done: "font-medium text-dk-muted line-through",
  current: "font-medium text-white",
  next: "font-normal text-dk-muted",
  planned: "font-normal text-dk-muted",
};

const STATUS: Record<MilestoneState, string> = {
  done: "text-lime",
  current: "text-white",
  next: "text-white",
  planned: "text-dk-muted",
};

function StateDot({ state, pulse }: { state: MilestoneState; pulse?: string }) {
  if (state === "done") {
    return (
      <span className="flex size-18 flex-none items-center justify-center rounded-full bg-lime text-ink type-m-tick">
        ✓
      </span>
    );
  }
  if (state === "current") {
    return (
      <span
        data-dm={pulse ? "live" : undefined}
        data-at={pulse}
        className="block size-18 flex-none rounded-full border-2 border-lime"
      />
    );
  }
  return <span className="block size-18 flex-none rounded-full border border-dark-line" />;
}

type Props = {
  milestones: Milestone[];
  /** data-at step when the rows start rising in. */
  at: string;
  /** data-at step for the live pulse on the in-progress dot, if any. */
  pulseAt?: string;
  className?: string;
};

// Milestone rows shared by the dark timeline and workspace mocks: they rise
// in one by one, completed ticks pop, the live dot can pulse.
export default function MilestoneRows({ milestones, at, pulseAt, className = "" }: Props) {
  return (
    <div data-dm="rise" data-ticks="" data-at={at} className={`flex flex-col ${className}`}>
      {milestones.map((m, i) => (
        <div
          key={m.title}
          className={`flex items-center gap-14 py-13 ${
            i < milestones.length - 1 ? "border-b border-dark-row" : ""
          }`}
        >
          <StateDot state={m.state} pulse={pulseAt} />
          <span className={`flex-auto type-m-row ${TITLE[m.state]}`}>{m.title}</span>
          <span className="whitespace-nowrap text-dk-muted type-m-meta">{m.date}</span>
          <span className={`w-82 text-right whitespace-nowrap type-m-status ${STATUS[m.state]}`}>
            {m.status}
          </span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { BarChart3, MapPin, ShieldCheck } from "lucide-react";
import { BTN_BIG_CLS } from "@/features/school/onboarding/quick/ui";

const POINTS = [
  {
    Icon: ShieldCheck,
    title: "UT only, verified.",
    body: "Everyone signs in with a UT email, so every card is a real Longhorn.",
  },
  {
    Icon: BarChart3,
    title: "Ranked by fit.",
    body: "Your matches are sorted by how well your answers line up.",
  },
  {
    Icon: MapPin,
    title: "Meet on campus.",
    body: "Once you both say yes, message each other and meet up at Gates Dell, the Union or PCL.",
  },
];

// Decorative, anonymous previews of what a finished card looks like.
const PREVIEWS = [
  {
    meta: "Cockrell Engineering · Class of 2027",
    tags: ["Seeking to join", "Technical", "AI/ML"],
    line: "Own the whole technical stack for a team with real domain insight.",
    rotate: "-rotate-2 top-0 left-[6%] right-[4%]",
  },
  {
    meta: "McCombs Business · Class of 2026",
    tags: ["Looking for a co-founder", "Media"],
    line: "Connect student creators with local businesses for game weekends.",
    rotate: "rotate-[1.5deg] top-[125px] left-0 right-[10%]",
  },
  {
    meta: "School of Information · Class of 2028",
    tags: ["Open to either", "UX"],
    line: "Make research tools usable by the people doing the research.",
    rotate: "-rotate-1 top-[250px] left-[10%] right-0",
  },
];

export default function WelcomeCard({ onStart }: { onStart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="grid items-center gap-7 rounded-2xl border border-[var(--ui-border)] bg-[var(--org-bg)] px-[18px] py-5 sm:p-7 min-[901px]:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] min-[901px]:gap-10 min-[901px]:p-10">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-[30px] leading-[1.1] font-semibold tracking-tight outline-none sm:text-[38px]"
        >
          Find your co-founder{" "}
          <em className="whitespace-nowrap text-[var(--org-primary)] not-italic">at UT.</em>
        </h2>
        <p className="mt-3 max-w-[470px] text-[15px] leading-relaxed text-[var(--ui-text-muted)] sm:text-base">
          Answer four quick steps and your Fit Card goes live in the Fall ’26 founder pool. Matches
          show up the moment you finish.
        </p>

        <div className="mt-6 mb-6 flex flex-col gap-2.5">
          {POINTS.map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3 text-sm leading-normal text-[var(--ui-text-muted)]">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--ui-surface-active)] text-[var(--org-primary)]">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span>
                <b className="text-[var(--ui-text)]">{title}</b> {body}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          <button type="button" onClick={onStart} className={BTN_BIG_CLS}>
            Get started →
          </button>
          <small className="text-[13px] text-[var(--ui-text-muted)]">About 3 minutes · saves as you go</small>
        </div>
      </div>

      <div aria-hidden className="relative h-[410px] w-full max-w-[440px] min-[901px]:max-w-none">
        {PREVIEWS.map((card) => (
          <div
            key={card.meta}
            className={`absolute flex flex-col gap-2.5 rounded-2xl border border-[var(--ui-border)] bg-[var(--org-bg)] p-3 shadow-lg sm:p-3.5 ${card.rotate}`}
          >
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 shrink-0 rounded-full bg-[var(--ui-surface-active)]" />
              <div>
                <div className="flex flex-wrap items-center gap-2 text-base font-semibold">
                  UT founder
                  <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    ✓ Verified UT
                  </span>
                </div>
                <div className="text-[13px] text-[var(--ui-text-muted)]">{card.meta}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`rounded-md border border-[var(--org-primary)] px-2.5 py-1 text-xs font-semibold ${
                    i === 0 ? "rounded-full text-[var(--org-primary)]" : tag === "Technical" ? "bg-[var(--org-primary)] text-white" : "text-[var(--org-primary)]"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-[13px] leading-snug text-[var(--ui-text-muted)] blur-[4px] select-none">{card.line}</div>
          </div>
        ))}
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--ui-text)] px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap text-[var(--org-bg)] shadow-lg">
          Finish your card to see who fits you
        </span>
      </div>
    </div>
  );
}

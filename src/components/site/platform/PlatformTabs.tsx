"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PLATFORM_TABS, toView, type PlatformView } from "@/content/site/platform";
import { trackEvent } from "../analytics/events";

const VIEWS = PLATFORM_TABS.map((tab) => tab.view) as PlatformView[];

type Props = {
  initial: PlatformView;
  /** Every panel is rendered on the server; inactive ones are hidden. */
  panels: Record<PlatformView, React.ReactNode>;
  /** Shown under the active panel, inside the dark band. */
  note: React.ReactNode;
};

// /platform tabs (spec §7, §14): tablist / tab / tabpanel with arrow keys,
// synced to ?view= so each tab is linkable.
export default function PlatformTabs({ initial, panels, note }: Props) {
  const [active, setActive] = useState<PlatformView>(initial);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Follow ?view= when it changes from elsewhere (e.g. "See it in the dashboard").
  const viewParam = searchParams.get("view");
  useEffect(() => {
    setActive(toView(viewParam));
  }, [viewParam]);

  const select = (view: PlatformView, focus = false) => {
    setActive(view);
    trackEvent("platform_tab_view", { tab: view });
    router.replace(`${pathname}?view=${view}`, { scroll: false });
    if (focus) tabRefs.current[view]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const i = VIEWS.indexOf(active);
    const next =
      event.key === "ArrowRight" ? VIEWS[(i + 1) % VIEWS.length]
      : event.key === "ArrowLeft" ? VIEWS[(i - 1 + VIEWS.length) % VIEWS.length]
      : event.key === "Home" ? VIEWS[0]
      : event.key === "End" ? VIEWS[VIEWS.length - 1]
      : null;
    if (next) {
      event.preventDefault();
      select(next, true);
    }
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Platform screens"
        onKeyDown={onKeyDown}
        className="scrollbar-none flex items-end gap-8 overflow-x-auto border-b border-rule px-gutter pr-20 lg:flex-wrap lg:overflow-visible lg:pr-gutter"
      >
        {PLATFORM_TABS.map((tab) => {
          const selected = tab.view === active;
          return (
            <button
              key={tab.view}
              ref={(el) => {
                tabRefs.current[tab.view] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.view}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.view}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.view)}
              className={`min-h-44 flex-none cursor-pointer border-0 border-b-2 bg-transparent px-18 py-14 whitespace-nowrap font-sans type-tab ${
                selected
                  ? "border-lime font-semibold text-ink"
                  : "border-transparent font-medium text-text-eyebrow"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-24 bg-dark px-gutter pt-fluid-40 pb-56">
        {PLATFORM_TABS.map((tab) => (
          <div
            key={tab.view}
            role="tabpanel"
            id={`panel-${tab.view}`}
            aria-labelledby={`tab-${tab.view}`}
            hidden={tab.view !== active}
          >
            {panels[tab.view]}
          </div>
        ))}
        {note}
      </div>
    </>
  );
}

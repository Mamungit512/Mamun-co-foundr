import Link from "next/link";

import { CONNECTIONS_TAB as C } from "@/content/site/platform";
import DemoFrame from "../mocks/DemoFrame";
import MockTag from "../mocks/MockTag";

// Platform · Connections tab: Liked, Messages and We Match are three states
// of one list. Rows slide in, match states pop, the We Match pulses.
export default function ConnectionsTabMock() {
  return (
    <DemoFrame
      name="conn"
      description={C.description}
      className="flex min-h-mock flex-col overflow-x-auto rounded-card border border-dark-rule bg-dark-mock"
      footer={
        <div className="mt-auto flex flex-wrap items-center justify-between gap-24 border-t border-dark-rule px-24 py-22">
          <p className="max-w-540 font-normal leading-150 text-dk-muted type-m-13">{C.footer}</p>
          <Link
            href="/platform?view=admin"
            scroll={false}
            className="whitespace-nowrap font-semibold text-lime type-m-13"
          >
            {C.dashboardLink} <span aria-hidden="true">→</span>
          </Link>
        </div>
      }
    >
      <div data-dm="pops" className="flex flex-wrap gap-8 border-b border-dark-rule px-24 py-20">
        {C.filters.map((filter) => (
          <MockTag key={filter.label} variant={filter.selected ? "filled" : "outline"} tone="dark" size="lg">
            {filter.label}
          </MockTag>
        ))}
      </div>

      <div data-dm="slide-r" data-at="3" data-step="mid" className="flex flex-col">
        {C.rows.map((row, i) => (
          <div
            key={row.name}
            className={`flex items-center gap-16 border-b border-dark-rule px-24 py-22 ${row.highlight ? "bg-dark-row-alt" : ""}`}
          >
            {row.photo ? (
              <div className="box-content size-46 flex-none border border-dark-line bg-photo" />
            ) : (
              <div className="box-content flex size-46 flex-none items-center justify-center rounded-full border border-dark-line font-semibold text-dk-muted type-m-14">
                {row.initials}
              </div>
            )}
            <div className="flex flex-auto flex-col gap-5">
              <span className="font-semibold text-white type-m-155">{row.name}</span>
              <span className="font-normal text-dk-muted type-m-13">{row.meta}</span>
            </div>
            {row.state === "We Match" ? (
              <span data-dm="live" data-at={row.at} className="rounded-badge">
                <MockTag variant="filled" size="md" nowrap>
                  {row.state}
                </MockTag>
              </span>
            ) : (
              <span data-dm="pop" data-at={row.at}>
                <MockTag variant="outline" tone="dark" size="md" nowrap>
                  {row.state}
                </MockTag>
              </span>
            )}
            <span
              className={`flex-none rounded-pill px-16 py-11 whitespace-nowrap font-semibold type-m-125 ${
                i === 0 ? "bg-lime text-ink" : "border border-dark-line text-white"
              }`}
            >
              {C.action}
            </span>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}

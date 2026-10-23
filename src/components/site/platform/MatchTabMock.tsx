import { MATCH_TAB as M } from "@/content/site/platform";
import DemoFrame from "../mocks/DemoFrame";
import MockTag from "../mocks/MockTag";
import MockSelect from "./MockSelect";

function FilterGroup({ label, gap = "gap-10", children }: { label: string; gap?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col ${gap}`}>
      <span className="text-dk-muted type-m-label-lg">{label}</span>
      {children}
    </div>
  );
}

// Platform · Matching tab: filters on the left, a profile on the right.
// The interest chips pop, the profile rises, Like is pressed, a toast confirms.
export default function MatchTabMock() {
  const p = M.profile;
  return (
    <DemoFrame
      name="match"
      description={M.description}
      className="grid min-h-mock grid-cols-1 overflow-x-auto rounded-card border border-dark-rule bg-dark-mock md:grid-cols-2 lg:grid-cols-filters"
    >
      <div className="flex flex-col gap-26 border-r border-dark-rule p-24">
        <span className="font-semibold text-white type-m-14">{M.filtersTitle}</span>
        <FilterGroup label={M.department.label}>
          <MockSelect value={M.department.value} />
        </FilterGroup>
        <FilterGroup label={M.industry.label} gap="gap-11">
          <div data-dm="pops" data-at="1" data-step="fast" className="flex flex-wrap gap-6">
            {M.industry.selected.map((tag) => (
              <MockTag key={tag} variant="filled" size="md">
                {tag}
              </MockTag>
            ))}
            {M.industry.others.map((tag) => (
              <MockTag key={tag} variant="outline" tone="dark" size="md">
                {tag}
              </MockTag>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup label={M.year.label}>
          <MockSelect value={M.year.value} />
        </FilterGroup>
        <FilterGroup label={M.intent.label} gap="gap-11">
          <div className="flex flex-col gap-9">
            <span className="font-medium text-lime type-m-135">{M.intent.selected}</span>
            {M.intent.others.map((option) => (
              <span key={option} className="font-normal text-dk-muted type-m-135">
                {option}
              </span>
            ))}
          </div>
        </FilterGroup>
        <div className="mt-auto flex flex-col gap-9 border-t border-dark-rule pt-20">
          <span className="text-dk-muted type-m-label-lg">{M.data.label}</span>
          <span className="font-normal leading-150 text-dk-muted type-m-125">{M.data.body}</span>
        </div>
      </div>

      <div data-dm="rise" data-at="2" className="relative flex flex-col gap-24 px-36 py-32">
        <div className="flex items-start justify-between gap-24">
          <div className="flex gap-18">
            <div
              data-dm="pop"
              data-at="4"
              className="box-content flex size-76 flex-none items-center justify-center rounded-full border border-dark-line text-dk-body type-m-monogram"
            >
              {p.initials}
            </div>
            <div className="flex flex-col gap-7">
              <span className="text-white type-m-display">{p.name}</span>
              <span className="font-normal text-dk-body type-m-14">{p.role}</span>
              <span className="font-normal text-dk-muted type-m-135">{p.school}</span>
              <div className="flex flex-wrap gap-8 pt-5">
                <MockTag variant="filled" size="dense">
                  {p.verified}
                </MockTag>
                {p.tags.map((tag) => (
                  <MockTag key={tag} variant="outline" tone="dark" size="dense">
                    {tag}
                  </MockTag>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-8">
            <span className="rounded-pill border border-lime px-10 py-7 whitespace-nowrap font-semibold text-lime type-m-115">
              {p.intent}
            </span>
            <span className="font-normal text-dk-muted type-m-12">{p.joined}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-dark-rule bg-dark-rule md:grid-cols-2">
          {p.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-7 bg-dark-tile p-20">
              <span className="text-dk-muted type-m-label-tight">{fact.label}</span>
              <span className="font-normal leading-150 text-dk-strong type-m-14">{fact.body}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-11">
          <span className="text-dk-muted type-m-label-lg">{p.plansLabel}</span>
          <div className="flex flex-wrap gap-24">
            {p.plans.map((plan) => (
              <span key={plan.label} className="font-normal leading-140 whitespace-nowrap text-dk-muted type-m-135">
                {plan.label} · <span className="text-white">{plan.value}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-12 border-t border-dark-rule pt-20">
          <span
            data-dm="press"
            data-at="14"
            className="flex-none rounded-pill bg-lime px-22 py-14 whitespace-nowrap font-semibold text-ink type-m-135"
          >
            {p.actions.like}
          </span>
          <span className="flex-none rounded-pill border border-dark-line px-22 py-14 whitespace-nowrap font-semibold text-white type-m-135">
            {p.actions.message}
          </span>
          <span className="flex-none rounded-pill border border-dark-line px-22 py-14 whitespace-nowrap font-semibold text-dk-muted type-m-135">
            {p.actions.skip}
          </span>
          <span className="ml-auto font-normal leading-140 text-dk-muted type-m-125">{p.hint}</span>
        </div>

        <span
          data-dm="toast"
          data-at="15"
          className="absolute right-18 bottom-78 z-5 inline-flex max-w-toast items-center gap-8 rounded-pill border border-dark-line bg-ink px-14 py-10 text-white shadow-toast type-toast"
        >
          <span className="block size-8 flex-none rounded-full bg-lime" />
          {p.toast}
        </span>
      </div>
    </DemoFrame>
  );
}

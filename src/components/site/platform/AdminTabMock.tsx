import { ADMIN_TAB as A } from "@/content/site/platform";
import DemoFrame from "../mocks/DemoFrame";
import MockTag from "../mocks/MockTag";

const FRAME = "rounded-card border border-dark-rule bg-dark-mock";

// Platform · Admin dashboard tab. The FERPA notice comes first. Stat figures
// roll in, the technical split draws, the roster rises and the report
// fields pop. The roster scrolls sideways inside its own frame on phones.
export default function AdminTabMock() {
  return (
    <DemoFrame name="admin" description={A.description} className="flex flex-col gap-20">
      <div className="flex flex-wrap gap-10 rounded-card border border-lime px-20 py-16">
        <span className="font-semibold leading-150 text-lime type-m-125">{A.ferpa.title}</span>
        <span className="font-normal leading-150 text-dk-body type-m-125">{A.ferpa.body}</span>
      </div>

      <div className={`flex flex-col ${FRAME}`}>
        <div className="flex flex-wrap items-center justify-between gap-20 border-b border-dark-rule px-24 py-20">
          <div className="flex flex-wrap gap-8">
            {A.tabs.map((tab) => (
              <MockTag key={tab.label} variant={tab.selected ? "filled" : "outline"} tone="dark" size="lg">
                {tab.label}
              </MockTag>
            ))}
          </div>
          <span className="font-normal text-dk-muted type-m-125">{A.term}</span>
        </div>

        <div className="flex flex-col gap-20 p-24">
          <div data-dm="rise" data-roll="" data-at="1" className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {A.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-7 rounded-nested border border-dark-rule p-20">
                <span className={`type-m-stat ${stat.lime ? "text-lime" : "text-white"}`}>{stat.value}</span>
                <span className="font-normal leading-135 text-dk-muted type-m-125">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-12 rounded-nested border border-dark-rule p-20">
            <span className="text-dk-muted type-m-label-lg">{A.split.label}</span>
            <div data-dm="draw" data-at="6" className="flex h-10 w-full">
              {/* Bar widths are chart data from the content file, not layout. */}
              <span className="block bg-lime" style={{ width: `${A.split.technicalShare}%` }} />
              <span className="block flex-auto bg-dark-line" />
            </div>
            <div className="flex gap-22">
              <span className="font-normal text-lime type-m-125">{A.split.technical}</span>
              <span className="font-normal text-dk-muted type-m-125">{A.split.nonTechnical}</span>
            </div>
          </div>
        </div>
      </div>

      <div data-dm="rise" data-at="7" data-step="fast" className={`flex flex-col overflow-x-auto ${FRAME}`}>
        <div className="flex min-w-roster items-center justify-between gap-20 border-b border-dark-rule px-24 py-20">
          <span className="font-semibold text-white type-m-15">{A.roster.title}</span>
          <span className="rounded-pill border border-dark-line px-14 py-10 whitespace-nowrap font-semibold text-white type-m-125">
            {A.roster.export}
          </span>
        </div>
        <div className="grid min-w-roster grid-cols-roster gap-16 border-b border-dark-rule px-20 py-14">
          {A.roster.columns.map((column) => (
            <span key={column} className="text-dk-muted type-m-label-lg">
              {column}
            </span>
          ))}
        </div>
        {A.roster.rows.map((row, i) => (
          <div
            key={row.name}
            className={`grid min-w-roster grid-cols-roster gap-16 px-20 py-16 ${
              i < A.roster.rows.length - 1 ? "border-b border-dark-table" : ""
            }`}
          >
            <div className="flex flex-col gap-4">
              <span className="font-semibold leading-130 text-white type-m-135">{row.name}</span>
              <span className="font-normal leading-130 text-text-eyebrow type-m-12">{row.role}</span>
            </div>
            <span className="font-normal leading-140 text-dk-body type-m-125">{row.education}</span>
            <span className="font-normal leading-140 text-dk-muted type-m-125">{row.location}</span>
            <span
              className={`self-center font-medium type-m-115 ${row.type === "Technical" ? "text-lime" : "text-dk-body"}`}
            >
              {row.type}
            </span>
            <span className="self-center font-normal text-dk-muted type-m-125">{row.joined}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
        {A.reports.map((report) => (
          <div key={report.title} className={`flex flex-col gap-16 p-24 ${FRAME}`}>
            <div className="flex flex-col gap-7">
              <span className="font-semibold leading-130 text-white type-m-16">{report.title}</span>
              <span className="font-normal leading-150 text-dk-muted type-m-135">{report.body}</span>
            </div>
            {report.fields.length > 0 && (
              <div data-dm="pops" data-at="12" data-step="fast" className="flex flex-wrap gap-6">
                {report.fields.map((field) => (
                  <MockTag key={field} variant="outline" tone="dark" size="md">
                    {field}
                  </MockTag>
                ))}
              </div>
            )}
            <span
              className={`mt-auto self-start rounded-pill px-18 py-13 whitespace-nowrap font-semibold type-m-13 ${
                report.primary ? "bg-lime text-ink" : "border border-dark-line text-white"
              }`}
            >
              {A.export}
            </span>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}

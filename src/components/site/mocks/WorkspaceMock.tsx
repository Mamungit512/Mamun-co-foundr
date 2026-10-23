import { WORKSPACE_MOCK as W } from "@/content/site/matching";
import DemoFrame from "./DemoFrame";
import MilestoneRows from "./MilestoneRows";
import MockTag from "./MockTag";

function OptionGroup({
  label,
  options,
  selected,
}: {
  label: string;
  options: string[];
  selected: string;
}) {
  return (
    <div className="flex items-center gap-10">
      <span className="text-dk-muted type-m-label">{label}</span>
      <div className="flex gap-6">
        {options.map((option) => (
          <MockTag key={option} variant={option === selected ? "filled" : "outline"} tone="dark">
            {option}
          </MockTag>
        ))}
      </div>
    </div>
  );
}

// /matching workspace mock: frame and Replay only, no chrome or caption
// strip (build board). "Co-founder linked" pops, the progress dots pop in
// one by one, then the milestones rise and tick. Fictional people.
export default function WorkspaceMock() {
  return (
    <DemoFrame
      name="workspace"
      description={W.description}
      className="flex flex-col overflow-x-auto rounded-card border border-dark-rule bg-dark-mock"
    >
      <div className="flex flex-col gap-22 border-b border-dark-rule px-26 py-24">
        <div className="flex flex-wrap items-start justify-between gap-20">
          <div className="flex items-center gap-14">
            <div className="flex">
              {W.pair.map((person, i) => (
                <span
                  key={person.initials}
                  className={`box-content flex size-40 flex-none items-center justify-center rounded-full border border-dark-line text-dk-muted type-m-avatar-lg ${
                    i > 0 ? "-ml-10" : ""
                  }`}
                >
                  {person.initials}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-white type-m-heading">{W.title}</span>
              <span className="text-dk-muted type-m-sub">{W.roles}</span>
            </div>
          </div>
          <span data-dm="pop" data-at="2">
            <MockTag variant="filled">{W.linked}</MockTag>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-20">
          <OptionGroup label={W.statusLabel} options={W.status.options} selected={W.status.selected} />
          <OptionGroup label={W.lengthLabel} options={W.length.options} selected={W.length.selected} />
        </div>

        <div className="flex flex-col gap-9">
          <div data-dm="pops" data-at="3" data-step="mid" className="flex items-center gap-9">
            <span className="block size-11 rounded-full bg-lime" />
            <span className="block size-11 rounded-full bg-lime" />
            <span className="block size-11 rounded-full bg-lime" />
            <span className="block h-2 flex-auto bg-dark-line" />
            <span className="block size-11 rounded-full border-2 border-lime" />
            <span className="block size-11 rounded-full border border-dark-line" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dk-muted type-m-meta">{W.started}</span>
            <span className="text-dk-muted type-m-meta">{W.ends}</span>
          </div>
        </div>
      </div>

      <MilestoneRows milestones={W.milestones} at="5" className="px-26 pt-8 pb-20" />
    </DemoFrame>
  );
}

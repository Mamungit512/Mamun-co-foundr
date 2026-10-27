import { TIMELINE_MOCK as T } from "@/content/site/home";
import DemoFrame from "./DemoFrame";
import MilestoneRows from "./MilestoneRows";

// Homepage workspace mock (Main.dc.html, workspace section): the progress
// bar grows, milestones rise in and tick, the live one pulses, and the two
// notes slide in from either side. Fictional people.
export default function TimelineMock() {
  return (
    <DemoFrame
      name="timeline"
      description={T.description}
      className="flex flex-col overflow-x-auto rounded-card border border-dark-rule bg-dark-mock"
    >
      <div className="flex items-center justify-between gap-16 border-b border-dark-rule px-22 py-20">
        <span className="text-white type-m-title">{T.title}</span>
        <div className="flex items-center gap-12">
          <span className="flex h-5 w-96 bg-dark-line">
            <span data-dm="grow" data-at="2" className="block w-3/7 bg-lime" />
          </span>
          <span className="whitespace-nowrap text-dk-muted type-m-meta">{T.progress}</span>
        </div>
      </div>

      <MilestoneRows milestones={T.milestones} at="2" pulseAt="10" className="px-22 pt-8 pb-18" />

      <div className="flex flex-col gap-14 border-t border-dark-rule px-22 py-18">
        <div className="flex items-center justify-between">
          <span className="text-dk-muted type-m-label">{T.notesLabel}</span>
          <span className="text-dk-muted type-m-count">{T.notesCount}</span>
        </div>
        {T.notes.map((note, i) => (
          <div
            key={note.initials}
            data-dm={i === 0 ? "slide-l" : "slide-r"}
            data-at={i === 0 ? "11" : "13"}
            className="flex gap-12"
          >
            <span className="box-content flex size-28 flex-none items-center justify-center rounded-full border border-dark-line text-dk-muted type-m-avatar">
              {note.initials}
            </span>
            <div className="flex flex-col gap-4">
              <span className="text-white type-m-name">{note.author}</span>
              <span className="text-dk-muted type-m-note">{note.body}</span>
            </div>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}

import { COFOUNDERS_TAB as C } from "@/content/site/platform";
import DemoFrame from "../mocks/DemoFrame";
import MockSelect from "./MockSelect";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-dk-muted type-m-label-lg">{children}</span>;
}

// Platform · Co-founders tab: link a co-founder by school email. The linked
// card pops, the address is typed, Send invite is pressed, the past invite
// flips to Accepted.
export default function CofoundersTabMock() {
  return (
    <DemoFrame
      name="cof"
      description={C.description}
      className="grid min-h-mock grid-cols-1 overflow-x-auto rounded-card border border-dark-rule bg-dark-mock md:grid-cols-2"
    >
      <div className="flex flex-col gap-30 p-28">
        <div className="flex flex-col gap-14">
          <Label>{C.linkedLabel}</Label>
          <div data-dm="pop" data-at="1" className="flex items-center gap-16 rounded-nested border border-dark-rule px-20 py-18">
            <div className="box-content size-44 flex-none border border-dark-line bg-photo" />
            <div className="flex flex-auto flex-col gap-5">
              <span className="font-semibold text-white type-m-15">{C.linked.name}</span>
              <span className="font-normal text-dk-muted type-m-13">{C.linked.meta}</span>
            </div>
            <span className="flex-none rounded-pill border border-dark-line px-14 py-10 whitespace-nowrap font-semibold text-dk-body type-m-125">
              {C.linked.action}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-14 border-t border-dark-rule pt-26">
          <Label>{C.inviteLabel}</Label>
          <p className="max-w-560 font-normal leading-155 text-dk-muted type-m-135">
            {C.invitePrefix}
            {C.domains.map((domain, i) => (
              <span key={domain}>
                <span className="text-lime">{domain}</span>
                {i < C.domains.length - 2 ? ", " : i === C.domains.length - 2 ? " or " : ""}
              </span>
            ))}
            {C.inviteSuffix}
          </p>
          <div className="flex max-w-560 flex-col gap-12">
            <div className="rounded-nested border border-dark-line px-14 py-13 font-normal text-dk-muted type-m-135">
              <span data-dm="type" data-at="4">
                {C.email}
              </span>
            </div>
            <MockSelect value={C.role} />
            <div className="box-content h-76 rounded-nested border border-dark-line px-14 py-13 font-normal leading-150 text-dk-muted type-m-135">
              {C.note}
            </div>
            <span
              data-dm="press"
              data-at="11"
              className="rounded-pill bg-lime px-20 py-14 text-center whitespace-nowrap font-semibold text-ink type-m-135"
            >
              {C.send}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-12 border-t border-dark-rule pt-26">
          <Label>{C.pastLabel}</Label>
          <div className="flex max-w-560 items-center justify-between gap-16 rounded-nested border border-dark-rule px-18 py-14">
            <span className="font-normal text-dk-body type-m-135">{C.past.email}</span>
            <span data-dm="pop" data-at="13" className="font-semibold text-lime type-m-12">
              {C.past.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-26 border-l border-dark-rule px-24 py-28">
        <div className="flex flex-col gap-11">
          <Label>{C.whyLabel}</Label>
          <p className="font-normal leading-155 text-dk-body type-m-135">{C.why}</p>
        </div>
        <div className="flex flex-col gap-11 border-t border-dark-rule pt-22">
          <Label>{C.nextLabel}</Label>
          <div className="flex flex-col gap-10">
            {C.next.map((item, i) => (
              <span
                key={item}
                className={`font-medium leading-140 text-white type-m-135 ${
                  i < C.next.length - 1 ? "border-b border-dark-rule pb-10" : ""
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-9 border-t border-dark-rule pt-22">
          <Label>{C.gatingLabel}</Label>
          <p className="font-normal leading-150 text-dk-muted type-m-125">{C.gating}</p>
        </div>
      </div>
    </DemoFrame>
  );
}

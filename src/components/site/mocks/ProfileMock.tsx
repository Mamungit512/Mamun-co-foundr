import { PROFILE_MOCK as P } from "@/content/site/home";
import DemoFrame from "./DemoFrame";
import MockTag from "./MockTag";

// Homepage profile mock (Main.dc.html, matching section). Its rows rise in
// one by one, the avatar and badges pop, "Send invite" is pressed and a
// toast confirms it. Fictional person.
export default function ProfileMock() {
  return (
    <DemoFrame
      name="profile"
      dm="rise"
      step="mid"
      description={P.description}
      className="flex flex-col gap-18 rounded-card border border-rule-card bg-white p-26"
    >
      <div className="flex items-start justify-between gap-16">
        <div className="flex gap-14">
          <span
            data-dm="pop"
            data-at="3"
            className="box-content flex size-48 flex-none items-center justify-center rounded-full border border-rule-mock text-text-caption type-avatar"
          >
            {P.initials}
          </span>
          <div className="flex flex-col gap-5">
            <span className="text-ink type-profile-name">{P.name}</span>
            <span className="text-text-caption type-profile-sub">{P.program}</span>
          </div>
        </div>
        <span data-dm="pop" data-at="5" className="flex-none">
          <MockTag variant="filled" floor>
            {P.badge}
          </MockTag>
        </span>
      </div>

      <div className="flex flex-col gap-6 rounded-nested border border-rule-card bg-bone p-16">
        <span className="text-text-eyebrow type-label">{P.aboutLabel}</span>
        <span className="text-text-strong type-profile-body">{P.about}</span>
      </div>

      <div className="flex flex-col gap-8">
        <span className="text-text-eyebrow type-label">{P.interestsLabel}</span>
        <div data-dm="pops" data-at="6" className="flex flex-wrap gap-7">
          <MockTag variant="filled" floor>
            {P.interests.selected}
          </MockTag>
          {P.interests.others.map((interest) => (
            <MockTag key={interest} variant="outline" floor>
              {interest}
            </MockTag>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <span className="text-text-eyebrow type-label">{P.experienceLabel}</span>
        <span className="text-text-strong type-profile-body">{P.experience}</span>
      </div>

      <div className="flex items-center justify-between gap-16 border-t border-rule-mock pt-16">
        <span className="text-text-eyebrow type-profile-foot">{P.seeking}</span>
        <span
          data-dm="press"
          data-at="13"
          className="inline-block rounded-pill bg-ink px-18 py-12 whitespace-nowrap text-white type-mini-button"
        >
          {P.action}
        </span>
      </div>

      <span
        data-dm="toast"
        data-at="14"
        className="absolute right-18 bottom-78 z-5 inline-flex max-w-toast items-center gap-8 rounded-pill border border-dark-line bg-ink px-14 py-10 text-white shadow-toast type-toast"
      >
        <span className="block size-8 flex-none rounded-full bg-lime" />
        {P.toast}
      </span>
    </DemoFrame>
  );
}

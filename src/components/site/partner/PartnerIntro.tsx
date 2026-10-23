import { PARTNER_INTRO as P } from "@/content/site/partner";
import Eyebrow from "../ui/Eyebrow";

// /partner left column: intro, three numbered steps, "Already in motion".
export default function PartnerIntro() {
  return (
    <div className="flex flex-col gap-36 px-gutter py-fluid-80">
      <div className="flex flex-col gap-18">
        <Eyebrow>{P.eyebrow}</Eyebrow>
        <h1 id="partner-title" className="text-ink type-display-5">
          {P.title}
        </h1>
        <p className="text-text-body type-body-17-loose">{P.body}</p>
      </div>

      <ol className="m-0 flex list-none flex-col gap-20 border-t border-rule p-0 pt-32">
        {P.steps.map((step) => (
          <li key={step.index} className="flex gap-16">
            <span className="basis-index text-lime-deep type-step-index">{step.index}</span>
            <div className="flex flex-col gap-4">
              <h2 className="text-ink type-step-title">{step.title}</h2>
              <p className="text-text-caption type-note">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-10 border-t border-rule pt-28">
        <h2 className="text-text-eyebrow type-label-md">{P.motion.label}</h2>
        <p className="text-text-strong type-motion">{P.motion.body}</p>
      </div>
    </div>
  );
}

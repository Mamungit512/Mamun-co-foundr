import { WORKSPACE } from "@/content/site/home";
import TimelineMock from "../mocks/TimelineMock";
import ArrowLink from "../ui/ArrowLink";
import Eyebrow from "../ui/Eyebrow";
import FeatureBlock from "./FeatureBlock";

// 06 Shared workspace — full-bleed dark, timeline mock.
export default function WorkspaceFeature() {
  return (
    <FeatureBlock
      id="workspace-title"
      tone="dark"
      copy={
        <>
          <Eyebrow tone="dark">{WORKSPACE.eyebrow}</Eyebrow>
          <h2 id="workspace-title" className="text-white type-head-2">
            {WORKSPACE.title}
          </h2>
          <p className="text-dk-body type-lede">{WORKSPACE.body}</p>
          <ArrowLink href={WORKSPACE.link.href} tone="dark">
            {WORKSPACE.link.label}
          </ArrowLink>
        </>
      }
      mock={<TimelineMock />}
    />
  );
}

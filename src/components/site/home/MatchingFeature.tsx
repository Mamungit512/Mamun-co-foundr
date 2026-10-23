import { MATCHING } from "@/content/site/home";
import NodeMark from "../marks/NodeMark";
import ProfileMock from "../mocks/ProfileMock";
import ArrowLink from "../ui/ArrowLink";
import Eyebrow from "../ui/Eyebrow";
import FeatureBlock from "./FeatureBlock";

// 05 Matching — copy left, profile mock right.
export default function MatchingFeature() {
  return (
    <FeatureBlock
      id="matching-title"
      copy={
        <>
          <Eyebrow>{MATCHING.eyebrow}</Eyebrow>
          <h2 id="matching-title" className="flex items-center gap-14 text-ink type-head-2">
            <NodeMark size={34} />
            <span>{MATCHING.title}</span>
          </h2>
          <p className="text-text-body type-lede">{MATCHING.body}</p>
          <ArrowLink href={MATCHING.link.href}>{MATCHING.link.label}</ArrowLink>
        </>
      }
      mock={<ProfileMock />}
    />
  );
}

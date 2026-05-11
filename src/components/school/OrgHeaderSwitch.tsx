import SchoolHeader from "./SchoolHeader";
import PublicSchoolHeader from "./landing/PublicSchoolHeader";
import type { OrgConfig } from "@/orgs/types";

type Props = {
  slug: string;
  schoolName: string;
  config: OrgConfig;
  isSignedIn: boolean;
};

export default function OrgHeaderSwitch({ slug, schoolName, config, isSignedIn }: Props) {
  if (isSignedIn) {
    return <SchoolHeader slug={slug} schoolName={schoolName} config={config} />;
  }
  return <PublicSchoolHeader />;
}

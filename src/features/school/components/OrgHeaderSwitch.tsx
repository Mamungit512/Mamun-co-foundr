import SchoolHeader from "./SchoolHeader";
import PublicSchoolHeader from "./landing/PublicSchoolHeader";
import type { OrgConfig } from "@/features/school/registry/types";

type Props = {
  slug: string;
  schoolName: string;
  config: OrgConfig;
  isSignedIn: boolean;
  isAdmin: boolean;
};

export default function OrgHeaderSwitch({ slug, schoolName, config, isSignedIn, isAdmin }: Props) {
  if (isSignedIn) {
    return <SchoolHeader slug={slug} schoolName={schoolName} config={config} isAdmin={isAdmin} />;
  }
  return <PublicSchoolHeader />;
}

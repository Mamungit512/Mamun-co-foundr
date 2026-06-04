// Deprecated alias for /api/profile.
//
// The unified /api/profile endpoint detects school membership from the
// organization_id on the Clerk session and writes the school_profiles row when
// present, so a separate school endpoint is no longer needed. This re-export is
// kept temporarily for backward compatibility with any callers still pointing
// at /api/ut-profile and can be removed once none remain.
export { GET, POST } from "@/app/api/profile/route";

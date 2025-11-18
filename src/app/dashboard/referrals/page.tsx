import { getReferralStats } from "@/actions/referral-action";
import ReferralDashboard from "@/components/referrals/referral-dashboard";
import { redirect } from "next/navigation";

const EMPTY_REFERRAL_DATA = {
  referral_code: "",
  referral_url: "",
  invite_count: 0,
  earned_amount: 0,
  rank: null,
  referrals: [],
};

export default async function ReferralsPage() {
  const result = await getReferralStats();

  if (!result || result.error === "Unauthorized") {
    redirect("/sign-in");
  }

  if (result.error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error: {result.error}</p>
      </div>
    );
  }

  return (
    <ReferralDashboard
      initialData={result.data ?? EMPTY_REFERRAL_DATA}
    />
  );
}

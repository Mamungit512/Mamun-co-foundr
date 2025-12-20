"use client";

import { useState } from "react";
import { Copy, Check, Users, Award, TrendingUp, RefreshCw } from "lucide-react";
import { getReferralStats } from "@/actions/referral-action";
import posthog from "posthog-js";

interface ReferralData {
  referral_code: string;
  referral_url: string;
  invite_count: number;
  earned_amount: number;
  rank: number | null;
  referrals: {
    id: string;
    referrer_code: string;
    referred_user_id: string;
    fp_ref: string | null;
    status: string;
    created_at: string;
    referred_user_email?: string | null;
  }[];
}

export default function ReferralDashboard({
  initialData,
}: {
  initialData: ReferralData;
}) {
  const [data, setData] = useState<ReferralData>(
    initialData ?? {
      referral_code: "",
      referral_url: "",
      invite_count: 0,
      earned_amount: 0,
      rank: null,
      referrals: [],
    },
  );

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(data.referral_url);
    setCopied(true);

    posthog.capture("referral_link_shared", {
      referral_code: data.referral_code,
      share_method: "clipboard_copy",
      current_invite_count: data.invite_count,
    });

    setTimeout(() => setCopied(false), 1500);
  };

  // Refresh stats
  const refreshStats = async () => {
    setLoading(true);
    try {
      const result = await getReferralStats(); // server action

      if (result.ok && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Referrals</h1>

          <button
            onClick={refreshStats}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 py-2 transition-colors hover:bg-[#3a3a3a] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Invites */}
          <div className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Invites</p>
                <p className="text-2xl font-bold">{data.invite_count}</p>
              </div>
            </div>
          </div>

          {/* Earned amount */}
          <div className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Earned</p>
                <p className="text-2xl font-bold">${data.earned_amount}</p>
              </div>
            </div>
          </div>

          {/* Rank */}
          <div className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Rank</p>
                <p className="text-2xl font-bold">
                  {data.rank ? `#${data.rank}` : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] p-6">
          <h2 className="mb-4 text-xl font-semibold">Your Referral Link</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={data.referral_url}
              readOnly
              className="flex-1 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-4 py-2 text-gray-200"
            />

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Referrals</h2>

          {data.referrals.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No referrals yet. Share your link to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {data.referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between rounded-lg border border-[#3a3a3a] p-4 transition-colors hover:bg-[#333333]"
                >
                  <div>
                    <p className="font-medium">
                      {ref.referred_user_email ||
                        `User ${ref.referred_user_id.slice(0, 8)}...`}
                    </p>

                    <p className="text-sm text-gray-400 capitalize">
                      {ref.status}
                    </p>
                  </div>

                  <span className="text-sm text-gray-400">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

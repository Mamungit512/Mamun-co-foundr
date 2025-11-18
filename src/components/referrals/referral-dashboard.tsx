"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Users,
  Award,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { getReferralStats } from "@/actions/referral-action";

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
    }
  );

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Copy link
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(data.referral_url);
    setCopied(true);
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Referrals</h1>

        <button
          onClick={refreshStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Invites */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Invites</p>
              <p className="text-2xl font-bold">{data.invite_count}</p>
            </div>
          </div>
        </div>

        {/* Earned amount */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Earned</p>
              <p className="text-2xl font-bold">${data.earned_amount}</p>
            </div>
          </div>
        </div>

        {/* Rank */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Rank</p>
              <p className="text-2xl font-bold">
                {data.rank ? `#${data.rank}` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={data.referral_url}
            readOnly
            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
          />

          <button
            onClick={copyToClipboard}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Referrals</h2>

        {data.referrals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No referrals yet. Share your link to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {data.referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium">
                    {ref.referred_user_email ||
                      `User ${ref.referred_user_id.slice(0, 8)}...`}
                  </p>

                  <p className="text-sm text-gray-500 capitalize">
                    {ref.status}
                  </p>
                </div>

                <span className="text-sm text-gray-500">
                  {new Date(ref.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

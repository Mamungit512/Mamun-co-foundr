"use client";

import { isUserAdmin } from "@/features/auth/authService";
import { useSession, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminMatchPreviewPage() {
  const { user } = useUser();
  const { session } = useSession();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<OnboardingData[] | null>(
    null,
  );

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const token = await session?.getToken();
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const admin = await isUserAdmin(user.id, token);
      setIsAdmin(admin?.is_admin ? true : false);
    }
    checkAdmin();
  }, [user, session]);

  const loadFixture = () => {
    setJsonInput(
      JSON.stringify(
        [
          {
            user_id: "current_user_001",
            firstName: "Alex",
            lastName: "Khan",
            title: "Software Engineer",
            city: "London",
            country: "United Kingdom",
            satisfaction: "Happy",
            batteryLevel: "Energized",
            isTechnical: "yes",
            personalIntro: "Full-stack engineer building in AI.",
            ummah: "Building tools for Muslim founders.",
            education: "BSc CS, MIT",
            experience: "2 years at Google",
            lookingFor: "non-technical",
            preferredLocation: "same-country",
            hasStartup: "yes",
            startupName: "FoundrAI",
            responsibilities: ["Engineering", "Product"],
            priorityAreas: ["AI", "Healthcare", "Fintech"],
            linkedin: "",
            twitter: "",
            git: "",
            personalWebsite: "",
            isHiring: false,
          },
          {
            user_id: "sim_user_002",
            firstName: "Sarah",
            lastName: "Ahmed",
            title: "Product Manager",
            city: "London",
            country: "United Kingdom",
            satisfaction: "Content",
            batteryLevel: "Energized",
            isTechnical: "no",
            personalIntro: "PM with 5 years in fintech.",
            ummah: "Impact-driven products.",
            education: "MBA, LBS",
            experience: "Product at Revolut",
            lookingFor: "technical",
            preferredLocation: "same-city",
            hasStartup: "yes",
            responsibilities: ["Product", "Sales"],
            priorityAreas: ["AI", "Healthcare", "Fintech"],
            linkedin: "",
            twitter: "",
            git: "",
            personalWebsite: "",
            isHiring: false,
          },
          {
            user_id: "sim_user_003",
            firstName: "Omar",
            lastName: "Hassan",
            title: "Business Development",
            city: "Manchester",
            country: "United Kingdom",
            satisfaction: "Browsing",
            batteryLevel: "Content",
            isTechnical: "no",
            personalIntro: "BD lead scaling startups.",
            ummah: "Connecting founders globally.",
            education: "BA Economics, Oxford",
            experience: "BD at Seedcamp",
            lookingFor: "technical",
            preferredLocation: "remote",
            hasStartup: "no",
            priorityAreas: ["AI", "Fintech"],
            linkedin: "",
            twitter: "",
            git: "",
            personalWebsite: "",
            isHiring: false,
          },
        ],
        null,
        2,
      ),
    );
    setPreviewResult(null);
  };

  const handlePreview = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const profiles = Array.isArray(parsed) ? parsed : parsed?.profiles ?? parsed;
      if (!Array.isArray(profiles) || profiles.length < 2) {
        toast.error(
          "JSON must be an array of 2+ profiles. First = current user perspective, rest = candidates.",
        );
        return;
      }

      const [currentUser, ...candidates] = profiles;

      setLoading(true);
      setPreviewResult(null);
      const token = await session?.getToken();
      const res = await fetch("/api/admin/match-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentUser, candidates }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Preview failed");
        return;
      }

      setPreviewResult(data.profiles);
      toast.success(
        `Sorted ${data.profiles.length} candidates (JSON simulation, no DB)`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) return <p className="p-8 text-white/70">Loading...</p>;
  if (!isAdmin)
    return <p className="p-8 text-red-400">Access denied. Admins only.</p>;

  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="heading-5">Match Preview (JSON Simulation)</h1>
        <p className="text-sm text-white/60">
          Run the matching algorithm on JSON without any database writes. First
          profile = current user perspective, rest = candidates. Use the LLM
          prompt in docs to generate more.
        </p>

        <button
          type="button"
          onClick={loadFixture}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Load sample
        </button>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{"user_id": "you", "firstName": "...", ...}, {"user_id": "candidate_1", ...}]'
          className="h-64 w-full rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-sm text-white/90 placeholder-white/30 focus:border-white/25 focus:outline-none"
          spellCheck={false}
        />

        <button
          type="button"
          onClick={handlePreview}
          disabled={loading || !jsonInput.trim()}
          className="rounded-lg bg-white/20 px-6 py-2 font-medium hover:bg-white/25 disabled:opacity-50"
        >
          {loading ? "Running…" : "Preview"}
        </button>

        {previewResult && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="mb-3 font-medium">
              Sorted by relevance (rank 1 = best match):
            </p>
            <ol className="list-inside list-decimal space-y-1">
              {previewResult.map((p, i) => (
                <li key={p.user_id ?? i}>
                  {p.firstName} {p.lastName} ({p.user_id}) — {p.city},{" "}
                  {p.country}
                  {p.isTechnical === "yes" ? ", technical" : ", non-technical"}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

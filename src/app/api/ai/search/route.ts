import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAISearch = authResult?.has?.({ feature: "ai_search" });
    if (!hasAISearch) {
      return NextResponse.json(
        { error: "AI Search requires an active subscription" },
        { status: 403 },
      );
    }


    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 },
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: currentUserData, error: currentUserError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (currentUserError || !currentUserData) {
      return NextResponse.json(
        { error: "Current user profile not found" },
        { status: 404 },
      );
    }

    const { data: likedProfiles } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", userId);

    const likedIds = likedProfiles?.map((like) => like.liked_id) || [];

    let candidateQuery = supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userId)
      .is("deleted_at", null);

    if (likedIds.length > 0) {
      candidateQuery = candidateQuery.not(
        "user_id",
        "in",
        `(${likedIds.join(",")})`,
      );
    }

    const { data: profilesData, error: profilesError } =
      await candidateQuery.limit(200);

    if (profilesError) {
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 },
      );
    }

    if (!profilesData || profilesData.length === 0) {
      return NextResponse.json({ results: [], query: query.trim() });
    }

    const profileSummaries = profilesData
      .map((p) => {
        const parts = [
          `ID: ${p.user_id}`,
          `Name: ${p.first_name} ${p.last_name}`,
          `Title: ${p.title}`,
          `Location: ${[p.city, p.state, p.country].filter(Boolean).join(", ")}`,
          `Technical: ${p.is_technical ? "yes" : "no"}`,
          `Education: ${p.education || "N/A"}`,
          `Experience: ${p.experience || "N/A"}`,
          `Interests: ${p.interests || "N/A"}`,
          `Hobbies: ${p.hobbies || "N/A"}`,
          `Priority Areas: ${Array.isArray(p.priority_areas) ? p.priority_areas.join(", ") : "N/A"}`,
          `Responsibilities: ${Array.isArray(p.responsibilities) ? p.responsibilities.join(", ") : "N/A"}`,
          `Startup: ${p.has_startup ? `${p.startup_name || "Unnamed"} - ${p.startup_description || "No description"}` : "No startup"}`,
          `Bio: ${p.personal_intro || "N/A"}`,
          `Accomplishments: ${p.accomplishments || "N/A"}`,
        ];
        return parts.join(" | ");
      })
      .join("\n");

    const systemPrompt = `You are a co-founder matching assistant. Given a user's search query and a list of candidate profiles, return the top 3 best-matching profiles ranked by relevance.

Rules:
- Interpret the query intent broadly and flexibly
- "machine engineer" could mean "Mechanical Engineer", "Machine Learning Engineer", or similar
- Handle geographic fuzzy matching: "San Francisco" should match profiles in San Francisco, Bay Area, California, or nearby cities. "Istanbul" should match "Turkey" profiles too
- Match against ALL profile fields: title, education, experience, interests, startup description, bio, accomplishments, priority areas, responsibilities
- If no exact match exists, find the closest alternatives and explain why they are relevant
- Always return exactly 3 results (or fewer if there are fewer than 3 candidates)
- The match_reason should be a brief, clear explanation in the same language as the user's query

Return ONLY valid JSON in this exact format:
{
  "results": [
    {
      "user_id": "string",
      "relevance_score": number between 0 and 100,
      "match_reason": "Brief explanation of why this profile matches"
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [
                {
                  text: `Search query: "${query.trim()}"\n\nCandidate profiles:\n${profileSummaries}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return NextResponse.json(
        { error: "AI search failed" },
        { status: 500 },
      );
    }

    const json = await response.json();

    if (json.promptFeedback?.blockReason) {
      return NextResponse.json(
        { error: "Query was blocked by AI safety filter. Try rephrasing." },
        { status: 400 },
      );
    }

    let geminiResults: {
      results: Array<{
        user_id: string;
        relevance_score: number;
        match_reason: string;
      }>;
    } | null = null;

    try {
      const rawText = json.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim();

      if (rawText) {
        geminiResults = JSON.parse(rawText);
      }
    } catch {
      console.error("Failed to parse Gemini response");
      return NextResponse.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 500 },
      );
    }

    if (
      !geminiResults?.results ||
      !Array.isArray(geminiResults.results) ||
      geminiResults.results.length === 0
    ) {
      return NextResponse.json({ results: [], query: query.trim() });
    }

    const profileMap = new Map(
      profilesData.map((p) => [p.user_id, p]),
    );

    const hydratedResults = geminiResults.results
      .filter((r) => profileMap.has(r.user_id))
      .map((r) => {
        const dbProfile = profileMap.get(r.user_id)!;
        const mapped = mapProfileToOnboardingData(dbProfile);
        return {
          ...mapped,
          matchReason: r.match_reason,
          relevanceScore: r.relevance_score,
        };
      });

    return NextResponse.json({
      results: hydratedResults,
      query: query.trim(),
    });
  } catch (error) {
    console.error("Error in AI search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

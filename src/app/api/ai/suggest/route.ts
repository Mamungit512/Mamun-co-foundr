// src/app/api/ai/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, fieldType } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Count words with at least 3 characters
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word: string) => word.length >= 3);

    if (words.length < 2) {
      return NextResponse.json({
        suggestion: null,
        message: "Please continue writing...",
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 },
      );
    }

    // Get appropriate prompt based on field type
    const getPrompt = (type: string, inputText: string): string => {
      const contexts: Record<string, string> = {
        interests:
          "Fix typos and expand this into a complete list of 3-5 related professional interests/topics:",
        hobbies:
          "Fix typos and expand this into a complete list of 3-5 related hobbies:",
        title: "Fix typos and provide the complete professional job title:",
        startupDescription:
          "Fix typos and complete this into a compelling 1-2 sentence startup description:",
        startupTimeSpent:
          "Fix typos and complete with specific time and progress details:",
        startupFunding: "Fix typos and complete with specific funding details:",
        coFounderStatus: "Fix typos and complete with clear co-founder status:",
        fullTimeTimeline: "Fix typos and complete with specific timeline:",
        personalIntro:
          "Aggressively fix typos, complete ALL incomplete words, and expand this into a natural 2-3 sentence professional bio:",
        accomplishments:
          "Fix typos and expand into a list of 2-3 impressive accomplishments:",
        ummah: "Fix typos and complete this civilizational engineering idea:",
        education:
          "Fix typos and complete with full education details (degree, field, university, year):",
        experience:
          "Fix typos and complete with full work experience (job title, company, duration):",
      };

      const context =
        contexts[type] || "Fix typos and complete this naturally:";
      return `${context} ${inputText}`;
    };

    const promptText = getPrompt(fieldType || "message", text);

    const systemPrompt = `You are a professional text expansion assistant.

Rules:
- Detect input language and respond in the SAME language
- Fix typos and grammar aggressively
- Complete incomplete words intelligently (e.g., "perso" → "person", "pro" → "projects/professional")
- Expand abbreviations intelligently (e.g., "ux des" → "UX Designer")
- For very short/incomplete inputs, infer context and create meaningful professional text
- When words are cut off mid-sentence, intelligently complete them
- Keep output concise and professional
- Return ONLY the improved text, no explanations or markdown

Examples:
"dat" → "Data Science, Data Engineering, Data Analysis"
"ai ml" → "AI & Machine Learning Engineer"
"front dev" → "Frontend Developer"
"sofware eng" → "Software Engineer"
"read book" → "Reading books, journaling, creative writing"
"ım hardwork perso" → "I'm a hardworking person who values dedication and continuous improvement."
"ım good at working on pro" → "I'm good at working on projects that require problem-solving and collaboration."
"passionat about tech" → "Passionate about technology and innovation."
"veri makine mühend" → "Veri Bilimi ve Makine Öğrenmesi Mühendisi"`.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate suggestion" },
        { status: 500 },
      );
    }

    const json = await response.json();

    // Debug logging
    console.log("Full Response:", JSON.stringify(json, null, 2));

    if (json.promptFeedback?.blockReason) {
      console.log("Blocked reason:", json.promptFeedback.blockReason);
      return NextResponse.json({
        suggestion: null,
        message: "Try rephrasing (AI filter blocked).",
      });
    }

    let suggestion = null;

    if (json.candidates && json.candidates.length > 0) {
      const candidate = json.candidates[0];

      if (candidate.content?.parts && candidate.content.parts.length > 0) {
        suggestion = candidate.content.parts
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((part: any) => part.text || "")
          .join("")
          .trim();
      }

      if (!suggestion && candidate.text) {
        suggestion = candidate.text.trim();
      }
    }

    if (!suggestion || suggestion.length < 2) {
      console.log("No suggestion generated, using fallback");
      return NextResponse.json({
        suggestion: text.trim(),
        message: "Could not expand. Original text returned.",
      });
    }

    return NextResponse.json({
      suggestion,
      message: null,
    });
  } catch (error) {
    console.error("Error in AI suggest API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

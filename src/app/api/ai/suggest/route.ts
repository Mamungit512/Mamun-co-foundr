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
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    // Count words with at least 3 characters
    const words = text.trim().split(/\s+/).filter((word: string) => word.length >= 3);
    
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
        interests: "Fix typos and expand this into a complete list of 3-5 related professional interests/topics:",
        hobbies: "Fix typos and expand this into a complete list of 3-5 related hobbies:",
        title: "Fix typos and provide the complete professional job title:",
        startupDescription: "Fix typos and complete this into a compelling 1-2 sentence startup description:",
        startupTimeSpent: "Fix typos and complete with specific time and progress details:",
        startupFunding: "Fix typos and complete with specific funding details:",
        coFounderStatus: "Fix typos and complete with clear co-founder status:",
        fullTimeTimeline: "Fix typos and complete with specific timeline:",
        personalIntro: "Fix typos and expand this into a complete 2-3 sentence professional bio:",
        accomplishments: "Fix typos and expand into a list of 2-3 impressive accomplishments:",
        ummah: "Fix typos and complete this civilizational engineering idea:",
        education: "Fix typos and complete with full education details (degree, field, university, year):",
        experience: "Fix typos and complete with full work experience (job title, company, duration):",
      };

      const context = contexts[type] || "Fix typos and complete this naturally:";
      return `${context} ${inputText}`;
    };

    const promptText = getPrompt(fieldType || "message", text);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: "You are a text completion assistant. Fix typos and expand the input into a complete, helpful suggestion. ONLY return the completed text with related suggestions, NO explanations or introductions. Examples: 'dat' → 'Data Science, Data Engineering, Data Analysis' | 'sofware eng' → 'Software Engineer' | 'read book' → 'Reading books, journaling, creative writing'"
              }
            ]
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
            maxOutputTokens: 150,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate suggestion" },
        { status: 500 },
      );
    }

    const data = await response.json();
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!suggestion) {
      return NextResponse.json({
        suggestion: null,
        message: "Please continue writing...",
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
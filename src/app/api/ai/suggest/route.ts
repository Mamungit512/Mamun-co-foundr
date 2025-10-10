// src/app/api/ai/suggest/route.ts
// Bu dosyayı YENİ oluştur

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    // Count words with at least 3 characters
    const words = text.trim().split(/\s+/).filter(word => word.length >= 3);
    
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional multilingual writing assistant.
Detect the language of the input automatically.
Improve, rewrite, or complete the following message in the same language as the input.
Make it sound natural, polite, and suitable for professional or business communication.
Return only the improved or completed message — no explanations or alternatives.


Current text: "${text}"

Complete or improve this message:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      },
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
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
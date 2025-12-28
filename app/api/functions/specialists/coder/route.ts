import { getOpenAIClient } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { task, files } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use a strong model for coding
      messages: [
        {
          role: "system",
          content: "You are the GenTel™ Specialist Coder (Layer 2). Your goal is to provide high-quality, production-ready code and architectural advice. Focus on security, performance, and readability.",
        },
        {
          role: "user",
          content: `Task: ${task}\nRelevant Files: ${files?.join(", ") || "None provided"}`,
        },
      ],
    });

    return NextResponse.json({ 
      result: response.choices[0].message.content,
      ok: true 
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message, ok: false }, { status: 500 });
  }
}

import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { key, value, reasoning } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return new Response(JSON.stringify({ approved: true }), { status: 200 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Memory Judge for an agentic system. Your goal is to ensure only high-value, non-redundant, and accurate information is absorbed into the long-term memory. Evaluate the proposed memory write based on its relevance, confidence, and utility for future interactions.",
        },
        {
          role: "user",
          content: `Proposed Memory Write:
Key: ${key}
Value: ${value}
Reasoning: ${reasoning}

Should this be approved? Respond with a JSON object: { "approved": boolean, "confidence": number, "feedback": string }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return new Response(JSON.stringify({
      approved: result.approved,
      ttl: "permanent",
      metadata: {
        confidence: result.confidence || 1.0,
        feedback: result.feedback,
        source: "agentic_judgment"
      }
    }), { status: 200 });
  } catch (error) {
    console.error("Error in memory judge:", error);
    return new Response(JSON.stringify({ approved: true, error: "Judgment failed, defaulting to approval" }), { status: 200 });
  }
}

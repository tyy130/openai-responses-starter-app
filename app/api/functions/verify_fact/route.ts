import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { claim, evidence } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return new Response(JSON.stringify({ verified: true }), { status: 200 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Fact Verifier for an agentic system. Your goal is to cross-reference claims against provided evidence or citations. Be strict. If the evidence does not explicitly support the claim, mark it as unverified.",
        },
        {
          role: "user",
          content: `Claim: ${claim}\n\nEvidence: ${evidence}\n\nIs this claim verified? Respond with a JSON object: { "verified": boolean, "confidence": number, "analysis": string }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return new Response(JSON.stringify({
      verified: result.verified,
      confidence: result.confidence,
      analysis: result.analysis
    }), { status: 200 });
  } catch (error) {
    console.error("Error in verification:", error);
    return new Response(JSON.stringify({ verified: false, error: "Verification failed" }), { status: 500 });
  }
}

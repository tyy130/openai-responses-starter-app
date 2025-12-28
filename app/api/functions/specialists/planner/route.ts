import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { goal } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return new Response(JSON.stringify({ plan: [] }), { status: 200 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Specialist Planner for an agentic system. Your goal is to break down complex user goals into a sequence of tool calls. CRITICAL: Always prioritize checking Layer 4 (Memory) before external research. If the goal involves a domain the agent might already know, the first step should be `kv_get` or `kv_list`.",
        },
        {
          role: "user",
          content: `Goal: ${goal}

Generate a step-by-step plan. Respond with a JSON object: { "plan": [{ "step": number, "action": string, "tool": string }], "complexity": "low" | "medium" | "high" }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return new Response(JSON.stringify({
      plan: result.plan,
      complexity: result.complexity,
      estimated_tokens: result.plan.length * 500
    }), { status: 200 });
  } catch (error) {
    console.error("Error in planner:", error);
    return new Response(JSON.stringify({ error: "Planning failed" }), { status: 500 });
  }
}

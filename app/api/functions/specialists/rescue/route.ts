import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { tool_name, error_message, context } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return new Response(JSON.stringify({ 
        status: "failed", 
        diagnosis: "Rescue Team unavailable: OpenAI API key missing." 
      }), { status: 200 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the GenTel™ Rescue Team (Layer 7). 
Your mission is to diagnose tool failures and provide immediate recovery steps or fallbacks.
You have deep knowledge of the system architecture:
- Persistence: Neon Postgres (Drizzle ORM).
- AI: OpenAI GPT-4o.
- Tools: GitHub, Google Calendar, RSS, Web Fetch, KV Store.

When a tool fails, analyze the error and provide:
1. Diagnosis: What likely went wrong.
2. Recovery: Immediate steps the Orchestrator should take.
3. Fallback: An alternative way to achieve the user's goal.`,
        },
        {
          role: "user",
          content: `TOOL FAILURE REPORT:
Tool: ${tool_name}
Error: ${error_message}
Context: ${context || "No additional context provided."}

Provide a rescue plan.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return new Response(JSON.stringify({
      status: "rescued",
      diagnosis: result.diagnosis,
      recovery_steps: result.recovery,
      fallback_plan: result.fallback,
      timestamp: new Date().toISOString()
    }), { status: 200 });
  } catch (error) {
    console.error("Error in rescue team:", error);
    return new Response(JSON.stringify({ 
      status: "failed", 
      diagnosis: "Rescue Team encountered an internal error during diagnosis." 
    }), { status: 500 });
  }
}

import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500 }
      );
    }

    // Filter messages to get a clean context for title generation
    const context = messages
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(0, 4) // Use first few messages
      .map((m: any) => {
        const text = m.content?.[0]?.text || m.content || "";
        return `${m.role.toUpperCase()}: ${text}`;
      })
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use a smaller model for speed/cost
      messages: [
        {
          role: "system",
          content: "You are a title generator. Create a concise, descriptive, and uniform title (3-6 words) for the conversation based on the provided context. Do not use quotes or periods. Example: 'GitHub Repository Setup' or 'Weather in San Francisco'.",
        },
        {
          role: "user",
          content: `Generate a title for this conversation:\n\n${context}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.5,
    });

    const title = response.choices[0].message.content?.trim() || "New Conversation";

    return new Response(JSON.stringify({ title }), { status: 200 });
  } catch (error) {
    console.error("Error generating title:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate title" }),
      { status: 500 }
    );
  }
}

import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allSessions = await db.select().from(sessions).orderBy(desc(sessions.updatedAt));
    return new Response(JSON.stringify(allSessions), { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch sessions" }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, chatMessages, conversationItems } = await request.json();
    const [newSession] = await db.insert(sessions).values({
      title: title || "New Conversation",
      chatMessages: JSON.stringify(chatMessages || []),
      conversationItems: JSON.stringify(conversationItems || []),
    }).returning();
    
    return new Response(JSON.stringify(newSession), { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return new Response(JSON.stringify({ error: "Failed to create session" }), { status: 500 });
  }
}

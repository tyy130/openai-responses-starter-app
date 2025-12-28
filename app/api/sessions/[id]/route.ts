import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(session), { status: 200 });
  } catch (error) {
    console.error("Error fetching session:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch session" }), { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: any = { updatedAt: new Date() };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.chatMessages !== undefined) updateData.chatMessages = JSON.stringify(body.chatMessages);
    if (body.conversationItems !== undefined) updateData.conversationItems = JSON.stringify(body.conversationItems);
    
    const [updatedSession] = await db
      .update(sessions)
      .set(updateData)
      .where(eq(sessions.id, id))
      .returning();
      
    return new Response(JSON.stringify(updatedSession), { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return new Response(JSON.stringify({ error: "Failed to update session" }), { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(sessions).where(eq(sessions.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting session:", error);
    return new Response(JSON.stringify({ error: "Failed to delete session" }), { status: 500 });
  }
}

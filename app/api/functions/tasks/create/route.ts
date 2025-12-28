import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { title, due, priority = "medium", notes } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Parse due date if provided
    let dueDate: Date | null = null;
    if (due) {
      try {
        dueDate = new Date(due);
        if (isNaN(dueDate.getTime())) {
          return NextResponse.json({ error: "Invalid due date format" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid due date format" }, { status: 400 });
      }
    }

    const result = await db
      .insert(tasks)
      .values({
        title,
        due: dueDate,
        priority,
        notes: notes || null,
      })
      .returning();

    const task = result[0];

    return NextResponse.json({
      ok: true,
      task: {
        id: task.id,
        title: task.title,
        due: task.due?.toISOString() || null,
        priority: task.priority,
        notes: task.notes,
        created_at: task.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("tasks_create error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

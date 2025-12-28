import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ ok: false, error: "Key is required" }, { status: 400 });
    }

    const result = await db
      .delete(memories)
      .where(eq(memories.key, key))
      .returning({ key: memories.key });

    return NextResponse.json({ ok: result.length > 0 });
  } catch (error) {
    console.error("kv_delete error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

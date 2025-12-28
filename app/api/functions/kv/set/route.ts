import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ ok: false, error: "Key is required" }, { status: 400 });
    }

    const now = new Date();
    
    await db
      .insert(memories)
      .values({ key, value: value || "", updatedAt: now })
      .onConflictDoUpdate({
        target: memories.key,
        set: { value: value || "", updatedAt: now },
      });

    return NextResponse.json({ ok: true, etag: now.toISOString() });
  } catch (error) {
    console.error("kv_set error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

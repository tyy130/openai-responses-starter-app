import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ found: false, value: null, etag: null, error: "Key is required" }, { status: 400 });
    }

    const result = await db.select().from(memories).where(eq(memories.key, key)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ found: false, value: null, etag: null });
    }

    const record = result[0];
    const etag = record.updatedAt?.toISOString() || null;

    return NextResponse.json({ found: true, value: record.value, etag });
  } catch (error) {
    console.error("kv_get error:", error);
    return NextResponse.json({ found: false, value: null, etag: null, error: "Internal server error" }, { status: 500 });
  }
}

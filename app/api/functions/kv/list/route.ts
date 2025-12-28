import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { like } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let results;
    if (prefix) {
      results = await db
        .select({ key: memories.key })
        .from(memories)
        .where(like(memories.key, `${prefix}%`))
        .limit(limit);
    } else {
      results = await db
        .select({ key: memories.key })
        .from(memories)
        .limit(limit);
    }

    const keys = results.map((r: { key: string }) => r.key);

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("kv_list error:", error);
    return NextResponse.json({ keys: [], error: "Internal server error" }, { status: 500 });
  }
}

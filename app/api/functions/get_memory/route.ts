import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allMemories = await db.select().from(memories);
    return NextResponse.json(allMemories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch memory" }, { status: 500 });
  }
}

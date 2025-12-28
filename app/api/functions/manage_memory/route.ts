import { updateMemory } from "@/lib/memory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    const result = await updateMemory(key, value);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

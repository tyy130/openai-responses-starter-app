import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { name, mime, content, encoding = "text" } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!mime || typeof mime !== "string") {
      return NextResponse.json({ error: "MIME type is required" }, { status: 400 });
    }
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // If text encoding, convert to base64 for storage
    let storedContent = content;
    if (encoding === "text") {
      storedContent = Buffer.from(content, "utf-8").toString("base64");
    }

    const size = Buffer.from(storedContent, "base64").length;

    const result = await db
      .insert(files)
      .values({
        name,
        mime,
        size,
        content: storedContent,
      })
      .returning();

    const file = result[0];

    return NextResponse.json({
      ok: true,
      file_id: file.id,
      name: file.name,
      mime: file.mime,
      size: file.size,
      created_at: file.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("files_upload error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

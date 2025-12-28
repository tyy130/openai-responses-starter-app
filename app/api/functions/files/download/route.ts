import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("file_id");

    if (!fileId) {
      return NextResponse.json({ error: "file_id is required" }, { status: 400 });
    }

    const results = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId));

    if (results.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = results[0];

    // Decode base64 content to text for text files
    let content = file.content;
    const isText = file.mime.startsWith("text/") || 
                   file.mime === "application/json" ||
                   file.mime === "application/javascript" ||
                   file.mime === "application/xml";

    if (isText) {
      try {
        content = Buffer.from(file.content, "base64").toString("utf-8");
      } catch {
        // Keep as base64 if decode fails
      }
    }

    return NextResponse.json({
      file_id: file.id,
      name: file.name,
      mime: file.mime,
      size: file.size,
      content,
      encoding: isText ? "text" : "base64",
      created_at: file.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("files_download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

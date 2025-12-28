import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const results = await db
      .select({
        id: files.id,
        name: files.name,
        mime: files.mime,
        size: files.size,
        createdAt: files.createdAt,
      })
      .from(files)
      .orderBy(desc(files.createdAt))
      .limit(limit);

    const fileList = results.map((f: { id: string; name: string; mime: string; size: number; createdAt: Date }) => ({
      file_id: f.id,
      name: f.name,
      mime: f.mime,
      size: f.size,
      created_at: f.createdAt.toISOString(),
    }));

    return NextResponse.json({
      files: fileList,
      total: fileList.length,
    });
  } catch (error) {
    console.error("files_list error:", error);
    return NextResponse.json(
      { files: [], error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

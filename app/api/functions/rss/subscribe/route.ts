import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rssFeeds } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate it's a valid URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const feedId = uuidv4();

    await db.insert(rssFeeds).values({
      id: feedId,
      url: url,
      lastPolled: null,
    });

    return NextResponse.json({
      ok: true,
      feed_id: feedId,
      message: `Subscribed to RSS feed. Use feed_id "${feedId}" to poll for updates.`,
    });
  } catch (error) {
    console.error("rss_subscribe error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

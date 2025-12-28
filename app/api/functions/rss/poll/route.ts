import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rssFeeds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RssFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const { feed_id, since, limit = 20 } = await request.json();

    if (!feed_id || typeof feed_id !== "string") {
      return NextResponse.json({ error: "feed_id is required" }, { status: 400 });
    }

    // Get the feed URL from database
    const feeds = await db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.id, feed_id));

    if (feeds.length === 0) {
      return NextResponse.json(
        { error: "Feed not found. Subscribe first using rss_subscribe." },
        { status: 404 }
      );
    }

    const feed = feeds[0];

    // Fetch the RSS feed
    const response = await fetch(feed.url, {
      headers: {
        "User-Agent": "GenTel/1.0 (RSS Reader)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch feed: ${response.status}` },
        { status: 400 }
      );
    }

    const xml = await response.text();

    // Parse RSS/Atom feed (simple parser)
    const items: RssFeedItem[] = [];
    
    // RSS 2.0 items
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    for (const match of itemMatches) {
      const itemXml = match[1];
      const title = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || "";
      const link = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() || "";
      const pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || "";
      const description = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || "";

      items.push({ title, link, pubDate, description: description.substring(0, 500) });
    }

    // Atom entries (fallback)
    if (items.length === 0) {
      const entryMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi);
      for (const match of entryMatches) {
        const entryXml = match[1];
        const title = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || "";
        const link = entryXml.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1]?.trim() || "";
        const pubDate = entryXml.match(/<(?:published|updated)[^>]*>([\s\S]*?)<\/(?:published|updated)>/i)?.[1]?.trim() || "";
        const description = entryXml.match(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:summary|content)>/i)?.[1]?.trim() || "";

        items.push({ title, link, pubDate, description: description.substring(0, 500) });
      }
    }

    // Filter by since date if provided
    let filteredItems = items;
    if (since) {
      const sinceDate = new Date(since);
      filteredItems = items.filter((item) => {
        if (!item.pubDate) return true;
        try {
          return new Date(item.pubDate) > sinceDate;
        } catch {
          return true;
        }
      });
    }

    // Limit results
    const limitedItems = filteredItems.slice(0, limit);

    // Update last polled time
    await db
      .update(rssFeeds)
      .set({ lastPolled: new Date() })
      .where(eq(rssFeeds.id, feed_id));

    return NextResponse.json({
      feed_id,
      url: feed.url,
      items: limitedItems,
      total_items: limitedItems.length,
    });
  } catch (error) {
    console.error("rss_poll error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

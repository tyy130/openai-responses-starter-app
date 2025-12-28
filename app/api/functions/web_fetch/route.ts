import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url, extract = ["text"], max_chars = 50000 } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GenTel/1.0 (Web Fetch Bot)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content elements
    $("script, style, noscript, iframe, svg, nav, footer, header").remove();

    const result: {
      url: string;
      title: string;
      text?: string;
      links?: { href: string; text: string }[];
      tables?: string[][];
    } = {
      url,
      title: $("title").text().trim() || "",
    };

    // Extract text content
    if (extract.includes("text")) {
      let text = $("body").text();
      // Clean up whitespace
      text = text.replace(/\s+/g, " ").trim();
      // Truncate to max_chars
      if (text.length > max_chars) {
        text = text.substring(0, max_chars) + "... [truncated]";
      }
      result.text = text;
    }

    // Extract links
    if (extract.includes("links")) {
      const links: { href: string; text: string }[] = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        const text = $(el).text().trim();
        if (href && text && !href.startsWith("#") && !href.startsWith("javascript:")) {
          // Resolve relative URLs
          try {
            const absoluteUrl = new URL(href, url).toString();
            links.push({ href: absoluteUrl, text: text.substring(0, 200) });
          } catch {
            // Skip invalid URLs
          }
        }
      });
      // Limit to 100 links
      result.links = links.slice(0, 100);
    }

    // Extract tables
    if (extract.includes("tables")) {
      const tables: string[][] = [];
      $("table").each((_, table) => {
        const rows: string[] = [];
        $(table)
          .find("tr")
          .each((_, row) => {
            const cells: string[] = [];
            $(row)
              .find("td, th")
              .each((_, cell) => {
                cells.push($(cell).text().trim());
              });
            if (cells.length > 0) {
              rows.push(cells.join(" | "));
            }
          });
        if (rows.length > 0) {
          tables.push(rows);
        }
      });
      result.tables = tables.slice(0, 10); // Limit to 10 tables
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("web_fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

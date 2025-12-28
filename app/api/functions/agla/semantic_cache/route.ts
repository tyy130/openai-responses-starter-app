import { NextResponse } from "next/server";

// In-memory cache simulation (in production, use Redis or similar)
const semanticCache = new Map<string, { response: string; timestamp: number; hits: number }>();

export async function POST(req: Request) {
  try {
    const { operation, query, response } = await req.json();

    // Simulate semantic caching with query normalization
    const normalizedQuery = query.toLowerCase().trim().replace(/[?!.,]/g, "");
    const cacheKey = normalizedQuery.split(" ").sort().join("_").slice(0, 100);
    
    console.log(`AGLA Semantic Cache ${operation}: ${query}`);

    if (operation === "get") {
      // Check cache for semantically similar queries
      const cached = semanticCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour TTL
        cached.hits++;
        return NextResponse.json({
          ok: true,
          hit: true,
          cached_response: cached.response,
          metadata: {
            cache_key: cacheKey,
            age_seconds: Math.floor((Date.now() - cached.timestamp) / 1000),
            hit_count: cached.hits,
            similarity_score: 0.95
          }
        });
      }
      
      return NextResponse.json({
        ok: true,
        hit: false,
        message: "No semantically similar query found in cache.",
        metadata: {
          cache_key: cacheKey,
          cache_size: semanticCache.size,
          recommendation: "Proceed with full AGLA pipeline and cache the result."
        }
      });
    } else if (operation === "set") {
      if (response) {
        console.log(`Caching response for: ${cacheKey}`);
        semanticCache.set(cacheKey, {
          response,
          timestamp: Date.now(),
          hits: 0
        });
        
        return NextResponse.json({
          ok: true,
          message: "Response successfully cached for future semantic matches.",
          metadata: {
            cache_key: cacheKey,
            ttl_seconds: 3600,
            cache_size: semanticCache.size
          }
        });
      } else {
        return NextResponse.json({
          ok: false,
          error: "No response provided for caching."
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({
        ok: false,
        error: `Unknown operation: ${operation}. Use 'get' or 'set'.`
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

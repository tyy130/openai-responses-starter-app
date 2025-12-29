import { NextResponse } from "next/server";

// Semantic Cache with similarity matching
// In production: Use Redis with vector similarity search

interface CacheEntry {
  query: string;
  response: string;
  timestamp: number;
  hits: number;
  embedding?: number[]; // Simulated embedding for similarity
  tokens: Set<string>;
}

const semanticCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3600000; // 1 hour
const SIMILARITY_THRESHOLD = 0.75;

// Extract meaningful tokens from query
function tokenize(text: string): Set<string> {
  const stopWords = new Set(["what", "is", "the", "a", "an", "how", "do", "does", "can", "you", "i", "to", "for", "of", "in", "on", "with", "about", "me", "my", "tell", "explain"]);
  const tokens = text.toLowerCase()
    .replace(/[?!.,;:'"()]/g, "")
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));
  return new Set(tokens);
}

// Calculate Jaccard similarity between token sets
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Find semantically similar cached query
function findSimilarQuery(queryTokens: Set<string>): { key: string; entry: CacheEntry; similarity: number } | null {
  let bestMatch: { key: string; entry: CacheEntry; similarity: number } | null = null;
  
  for (const [key, entry] of semanticCache.entries()) {
    // Skip expired entries
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) continue;
    
    const similarity = jaccardSimilarity(queryTokens, entry.tokens);
    
    if (similarity >= SIMILARITY_THRESHOLD) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { key, entry, similarity };
      }
    }
  }
  
  return bestMatch;
}

// Generate cache key from query
function generateCacheKey(query: string): string {
  return query.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .sort()
    .join("_")
    .slice(0, 100);
}

// Clean expired entries periodically
function cleanExpiredEntries(): number {
  let cleaned = 0;
  const now = Date.now();
  
  for (const [key, entry] of semanticCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      semanticCache.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const { operation, query, response, ttl_override } = await req.json();
    
    const queryTokens = tokenize(query);
    const cacheKey = generateCacheKey(query);
    const effectiveTTL = ttl_override || CACHE_TTL_MS;
    
    console.log(`AGLA Semantic Cache ${operation}: "${query}" (tokens: ${[...queryTokens].join(", ")})`);

    if (operation === "get") {
      // First: Check exact key match
      const exactMatch = semanticCache.get(cacheKey);
      
      if (exactMatch && Date.now() - exactMatch.timestamp < effectiveTTL) {
        exactMatch.hits++;
        console.log(`Cache HIT (exact): ${cacheKey}`);
        return NextResponse.json({
          ok: true,
          hit: true,
          match_type: "exact",
          cached_response: exactMatch.response,
          metadata: {
            cache_key: cacheKey,
            original_query: exactMatch.query,
            similarity_score: 1.0,
            age_seconds: Math.floor((Date.now() - exactMatch.timestamp) / 1000),
            hit_count: exactMatch.hits,
            tokens_matched: [...queryTokens]
          }
        });
      }
      
      // Second: Find semantically similar query
      const similarMatch = findSimilarQuery(queryTokens);
      
      if (similarMatch) {
        similarMatch.entry.hits++;
        console.log(`Cache HIT (semantic): similarity=${similarMatch.similarity.toFixed(2)}`);
        return NextResponse.json({
          ok: true,
          hit: true,
          match_type: "semantic",
          cached_response: similarMatch.entry.response,
          metadata: {
            cache_key: similarMatch.key,
            original_query: similarMatch.entry.query,
            similarity_score: Math.round(similarMatch.similarity * 100) / 100,
            age_seconds: Math.floor((Date.now() - similarMatch.entry.timestamp) / 1000),
            hit_count: similarMatch.entry.hits,
            query_tokens: [...queryTokens],
            matched_tokens: [...queryTokens].filter(t => similarMatch.entry.tokens.has(t))
          }
        });
      }
      
      // Cache miss
      console.log(`Cache MISS: ${cacheKey}`);
      return NextResponse.json({
        ok: true,
        hit: false,
        match_type: null,
        message: "No semantically similar query found in cache.",
        metadata: {
          cache_key: cacheKey,
          cache_size: semanticCache.size,
          similarity_threshold: SIMILARITY_THRESHOLD,
          query_tokens: [...queryTokens],
          recommendation: "Execute full AGLA pipeline and cache the result with 'set' operation."
        }
      });
      
    } else if (operation === "set") {
      if (!response) {
        return NextResponse.json({
          ok: false,
          error: "No response provided for caching."
        }, { status: 400 });
      }
      
      // Store in cache
      const entry: CacheEntry = {
        query,
        response,
        timestamp: Date.now(),
        hits: 0,
        tokens: queryTokens
      };
      
      semanticCache.set(cacheKey, entry);
      console.log(`Cached: ${cacheKey} (${queryTokens.size} tokens)`);
      
      // Periodic cleanup (every 10 sets)
      const cleanedCount = semanticCache.size % 10 === 0 ? cleanExpiredEntries() : 0;
      
      return NextResponse.json({
        ok: true,
        operation: "set",
        message: "Response cached for semantic matching.",
        metadata: {
          cache_key: cacheKey,
          ttl_seconds: Math.floor(effectiveTTL / 1000),
          cache_size: semanticCache.size,
          tokens_indexed: [...queryTokens],
          entries_cleaned: cleanedCount
        }
      });
      
    } else if (operation === "invalidate") {
      // Invalidate specific key or all matching tokens
      let invalidated = 0;
      
      if (semanticCache.has(cacheKey)) {
        semanticCache.delete(cacheKey);
        invalidated++;
      }
      
      return NextResponse.json({
        ok: true,
        operation: "invalidate",
        invalidated_count: invalidated,
        cache_size: semanticCache.size
      });
      
    } else if (operation === "stats") {
      // Return cache statistics
      const entries = [...semanticCache.entries()];
      const validEntries = entries.filter(([, e]) => Date.now() - e.timestamp < CACHE_TTL_MS);
      const totalHits = validEntries.reduce((sum, [, e]) => sum + e.hits, 0);
      
      return NextResponse.json({
        ok: true,
        operation: "stats",
        stats: {
          total_entries: semanticCache.size,
          valid_entries: validEntries.length,
          total_hits: totalHits,
          avg_hits_per_entry: validEntries.length > 0 ? (totalHits / validEntries.length).toFixed(2) : 0,
          oldest_entry_age_seconds: validEntries.length > 0
            ? Math.floor((Date.now() - Math.min(...validEntries.map(([, e]) => e.timestamp))) / 1000)
            : 0,
          similarity_threshold: SIMILARITY_THRESHOLD,
          ttl_seconds: Math.floor(CACHE_TTL_MS / 1000)
        }
      });
      
    } else {
      return NextResponse.json({
        ok: false,
        error: `Unknown operation: ${operation}. Valid operations: get, set, invalidate, stats`
      }, { status: 400 });
    }
    
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const lowerQuery = query.toLowerCase();

    // Intelligent routing based on query complexity
    let route = "fast";
    let reasoning = "";
    let confidence = 0.9;

    // Complex queries requiring full pipeline
    if (
      lowerQuery.includes("compare") ||
      lowerQuery.includes("analyze") ||
      lowerQuery.includes("explain how") ||
      lowerQuery.includes("relationship between") ||
      lowerQuery.includes("multi-hop") ||
      query.length > 200
    ) {
      route = "complex";
      reasoning = "Query requires deep analysis, multi-step reasoning, or comparison. Full AGLA pipeline engaged.";
      confidence = 0.85;
    }
    // Graph queries for entity relationships
    else if (
      lowerQuery.includes("connected") ||
      lowerQuery.includes("related") ||
      lowerQuery.includes("architecture") ||
      lowerQuery.includes("setup") ||
      lowerQuery.includes("how does") ||
      lowerQuery.includes("how is") ||
      lowerQuery.includes("rag")
    ) {
      route = "graph";
      reasoning = "Query involves entity relationships or system architecture. Graph traversal recommended.";
      confidence = 0.88;
    }
    // Fast path for simple lookups
    else {
      route = "fast";
      reasoning = "Simple factual query. Hybrid search sufficient.";
      confidence = 0.92;
    }

    // Extract entities from query
    const entities = extractEntities(query);

    return NextResponse.json({
      ok: true,
      route,
      reasoning,
      confidence,
      query_analysis: {
        original_query: query,
        token_count: query.split(" ").length,
        complexity_score: route === "complex" ? 0.9 : route === "graph" ? 0.6 : 0.3,
        entities_detected: entities,
        recommended_tools: getRecommendedTools(route)
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

function extractEntities(query: string): string[] {
  const entities: string[] = [];
  const patterns = [
    /AGLA/gi, /RAG/gi, /GenTel/gi, /LightRAG/gi,
    /vector/gi, /graph/gi, /hybrid/gi, /search/gi,
    /retrieval/gi, /routing/gi, /cache/gi, /rerank/gi,
    /BM25/gi, /embedding/gi, /semantic/gi
  ];
  
  for (const pattern of patterns) {
    const matches = query.match(pattern);
    if (matches) {
      entities.push(...matches.map(m => m.toLowerCase()));
    }
  }
  
  return [...new Set(entities)];
}

function getRecommendedTools(route: string): string[] {
  switch (route) {
    case "complex":
      return ["agla_semantic_cache", "agla_graph_search", "agla_hybrid_search", "agla_rerank", "agla_grader"];
    case "graph":
      return ["agla_semantic_cache", "agla_graph_search", "agla_hybrid_search", "agla_grader"];
    default:
      return ["agla_semantic_cache", "agla_hybrid_search", "agla_grader"];
  }
}

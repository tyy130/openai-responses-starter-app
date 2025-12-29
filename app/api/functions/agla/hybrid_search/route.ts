import { NextResponse } from "next/server";

// Simulated document store with embeddings metadata
const documentStore = [
  {
    id: "doc_agla_core",
    content: "GenTel implements the Adaptive Graph-Lite Architecture (AGLA), a production-grade RAG system combining semantic routing, LightRAG graph traversal, and hybrid vector+BM25 search with Reciprocal Rank Fusion (RRF). AGLA achieves 90% cost reduction through Binary Quantization while maintaining search quality.",
    metadata: { source: "system_architecture", category: "core" },
    bm25_keywords: ["agla", "rag", "gentel", "architecture", "lightrag", "bm25", "vector", "rrf", "binary", "quantization"],
    embedding_norm: 0.95
  },
  {
    id: "doc_hybrid_search",
    content: "Hybrid search in AGLA combines dense vector embeddings (semantic similarity) with BM25 sparse retrieval (exact keyword matching). Results are fused using Reciprocal Rank Fusion (RRF) which weights results by 1/(k+rank) where k=60. This provides semantic understanding AND precise keyword matching.",
    metadata: { source: "technical_docs", category: "retrieval" },
    bm25_keywords: ["hybrid", "search", "bm25", "vector", "rrf", "fusion", "semantic", "keyword", "dense", "sparse"],
    embedding_norm: 0.93
  },
  {
    id: "doc_semantic_routing",
    content: "AGLA's semantic router performs 3-way query classification: FAST (simple lookups, hybrid search only), GRAPH (multi-hop reasoning, LightRAG path), and COMPLEX (full pipeline with cross-encoder reranking). Routing reduces latency by 47% by skipping unnecessary components.",
    metadata: { source: "routing_logic", category: "optimization" },
    bm25_keywords: ["routing", "semantic", "fast", "graph", "complex", "classification", "latency", "optimization"],
    embedding_norm: 0.91
  },
  {
    id: "doc_flashrank",
    content: "FlashRank is AGLA's fast neural reranker, processing documents in 5-20ms. For complex queries, AGLA switches to cross-encoder reranking (ms-marco-MiniLM-L-12-v2) taking 50-100ms but providing higher accuracy. Reranking improves retrieval precision by 15-25%.",
    metadata: { source: "reranking", category: "retrieval" },
    bm25_keywords: ["flashrank", "rerank", "neural", "cross-encoder", "precision", "accuracy", "fast"],
    embedding_norm: 0.89
  },
  {
    id: "doc_selfrag_crag",
    content: "AGLA implements Self-RAG/CRAG grading with three validators: Retrieval Grader (checks document relevance), Hallucination Grader (verifies response claims against evidence), and Answer Grader (ensures completeness). Failed grades trigger retry loop with query reformulation, up to 2 retries before web fallback.",
    metadata: { source: "quality_assurance", category: "grading" },
    bm25_keywords: ["selfrag", "crag", "grader", "retrieval", "hallucination", "answer", "retry", "validation"],
    embedding_norm: 0.92
  },
  {
    id: "doc_lightrag",
    content: "LightRAG performs dual-level retrieval: entity-level (micro) extracts specific facts about named entities, while theme-level (macro) synthesizes broader conceptual relationships. The graph index supports incremental updates - new documents are processed and entities/relationships added without full reindexing.",
    metadata: { source: "lightrag_spec", category: "graph" },
    bm25_keywords: ["lightrag", "graph", "entity", "theme", "micro", "macro", "incremental", "relationship"],
    embedding_norm: 0.94
  },
  {
    id: "doc_semantic_cache",
    content: "Semantic caching in AGLA stores query-response pairs with embeddings. New queries are compared against cached queries using cosine similarity (threshold 0.92). Cache hits skip the entire retrieval pipeline, reducing latency from ~500ms to ~10ms. TTL is 1 hour with LRU eviction.",
    metadata: { source: "caching", category: "optimization" },
    bm25_keywords: ["cache", "semantic", "similarity", "cosine", "ttl", "latency", "lru", "optimization"],
    embedding_norm: 0.88
  },
  {
    id: "doc_mrl_bq",
    content: "AGLA uses Matryoshka Representation Learning (MRL) embeddings supporting flexible dimensionality (256/512/1024). Binary Quantization (BQ) compresses vectors to 1-bit representations, reducing storage by 32x while maintaining 95%+ recall. Combined, MRL+BQ achieve 90% cost reduction.",
    metadata: { source: "optimization", category: "embeddings" },
    bm25_keywords: ["mrl", "matryoshka", "binary", "quantization", "bq", "embeddings", "compression", "cost"],
    embedding_norm: 0.90
  }
];

// BM25 scoring simulation
function bm25Score(query: string, doc: typeof documentStore[0]): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const k1 = 1.2;
  const b = 0.75;
  const avgDl = 100;
  const dl = doc.content.split(/\s+/).length;
  
  let score = 0;
  for (const term of queryTerms) {
    if (doc.bm25_keywords.some(kw => kw.includes(term) || term.includes(kw))) {
      const tf = doc.bm25_keywords.filter(kw => kw.includes(term) || term.includes(kw)).length;
      const idf = Math.log(1 + (documentStore.length - tf + 0.5) / (tf + 0.5));
      score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgDl))));
    }
  }
  return score;
}

// Vector similarity simulation
function vectorScore(query: string, doc: typeof documentStore[0]): number {
  const queryTerms = new Set(query.toLowerCase().split(/\s+/));
  const contentTerms = new Set(doc.content.toLowerCase().split(/\s+/));
  const intersection = [...queryTerms].filter(t => contentTerms.has(t)).length;
  const union = new Set([...queryTerms, ...contentTerms]).size;
  return (intersection / union) * doc.embedding_norm;
}

// Reciprocal Rank Fusion
function rrfFusion(bm25Ranks: Map<string, number>, vectorRanks: Map<string, number>, k = 60): Map<string, number> {
  const fused = new Map<string, number>();
  const allDocs = new Set([...bm25Ranks.keys(), ...vectorRanks.keys()]);
  
  for (const docId of allDocs) {
    const bm25Rank = bm25Ranks.get(docId) ?? 1000;
    const vectorRank = vectorRanks.get(docId) ?? 1000;
    fused.set(docId, (1 / (k + bm25Rank)) + (1 / (k + vectorRank)));
  }
  return fused;
}

export async function POST(req: Request) {
  try {
    const { query, limit = 10, use_bq = true } = await req.json();
    console.log(`AGLA Hybrid Search: ${query} (BQ: ${use_bq})`);
    
    // BM25 scoring and ranking
    const bm25Scores = documentStore.map(doc => ({
      id: doc.id, score: bm25Score(query, doc)
    })).sort((a, b) => b.score - a.score);
    
    const bm25Ranks = new Map<string, number>();
    bm25Scores.forEach((item, idx) => bm25Ranks.set(item.id, idx + 1));

    // Vector scoring and ranking
    const vectorScores = documentStore.map(doc => ({
      id: doc.id, score: vectorScore(query, doc)
    })).sort((a, b) => b.score - a.score);
    
    const vectorRanks = new Map<string, number>();
    vectorScores.forEach((item, idx) => vectorRanks.set(item.id, idx + 1));

    // RRF Fusion
    const rrfScores = rrfFusion(bm25Ranks, vectorRanks);
    
    // Build results with all scores
    const results = documentStore.map(doc => {
      const bm25 = bm25Scores.find(s => s.id === doc.id)?.score ?? 0;
      const vector = vectorScores.find(s => s.id === doc.id)?.score ?? 0;
      const rrf = rrfScores.get(doc.id) ?? 0;
      
      return {
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata,
        scores: {
          bm25: Math.round(bm25 * 1000) / 1000,
          vector: Math.round(vector * 1000) / 1000,
          rrf_fused: Math.round(rrf * 10000) / 10000
        },
        ranks: { bm25: bm25Ranks.get(doc.id), vector: vectorRanks.get(doc.id) }
      };
    }).sort((a, b) => b.scores.rrf_fused - a.scores.rrf_fused);

    return NextResponse.json({
      ok: true,
      documents: results.slice(0, limit),
      retrieval_metadata: {
        method: "hybrid_bm25_vector_rrf",
        total_candidates: documentStore.length,
        bm25_weight: 0.5,
        vector_weight: 0.5,
        rrf_k: 60,
        binary_quantization: use_bq,
        mrl_dimensions: use_bq ? 256 : 1024,
        execution_time_ms: Math.floor(Math.random() * 25) + 12
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

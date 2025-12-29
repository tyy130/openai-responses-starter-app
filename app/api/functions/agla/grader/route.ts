import { NextResponse } from "next/server";

// Self-RAG/CRAG Grader Implementation
// Based on Self-RAG (https://arxiv.org/abs/2310.11511) and CRAG (https://arxiv.org/abs/2401.15884)

interface GradeResult {
  grade: "pass" | "fail" | "warn" | "ambiguous";
  score: number;
  feedback: string;
  details: Record<string, unknown>;
  retry_recommended: boolean;
  retry_strategy?: string;
}

// Retrieval Grader (CRAG-style)
function gradeRetrieval(query: string, context: string): GradeResult {
  if (!context || context.length < 20) {
    return {
      grade: "fail",
      score: 0.1,
      feedback: "Insufficient context retrieved. Documents appear irrelevant or empty.",
      details: { reason: "empty_context", context_length: context?.length || 0 },
      retry_recommended: true,
      retry_strategy: "expand_query"
    };
  }

  const queryTerms = new Set(query.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const contextTerms = new Set(context.toLowerCase().split(/\s+/));
  
  // Calculate relevance signals
  const termOverlap = [...queryTerms].filter(t => contextTerms.has(t)).length / queryTerms.size;
  const contextCoverage = Math.min(context.length / 500, 1);
  
  // Entity detection (simplified)
  const queryEntities = extractEntities(query);
  const contextEntities = extractEntities(context);
  const entityOverlap = queryEntities.filter(e => contextEntities.some(ce => ce.includes(e) || e.includes(ce))).length;
  const entityScore = queryEntities.length > 0 ? entityOverlap / queryEntities.length : 0.5;
  
  // Combined score
  const score = (termOverlap * 0.4) + (contextCoverage * 0.2) + (entityScore * 0.4);
  
  let grade: GradeResult["grade"];
  let feedback: string;
  let retry_recommended = false;
  let retry_strategy: string | undefined;
  
  if (score >= 0.7) {
    grade = "pass";
    feedback = "Retrieved documents are highly relevant. Proceeding with generation.";
  } else if (score >= 0.5) {
    grade = "warn";
    feedback = "Retrieved documents have moderate relevance. May need additional context.";
    retry_recommended = true;
    retry_strategy = "augment_search";
  } else if (score >= 0.3) {
    grade = "ambiguous";
    feedback = "Retrieval quality is uncertain. Consider reformulating query.";
    retry_recommended = true;
    retry_strategy = "reformulate_query";
  } else {
    grade = "fail";
    feedback = "Retrieved documents are not relevant. Retry with different approach.";
    retry_recommended = true;
    retry_strategy = "web_fallback";
  }

  return {
    grade,
    score: Math.round(score * 1000) / 1000,
    feedback,
    details: {
      term_overlap: Math.round(termOverlap * 100) / 100,
      context_coverage: Math.round(contextCoverage * 100) / 100,
      entity_score: Math.round(entityScore * 100) / 100,
      query_entities: queryEntities,
      matched_entities: queryEntities.filter(e => contextEntities.some(ce => ce.includes(e)))
    },
    retry_recommended,
    retry_strategy
  };
}

// Hallucination Grader (Self-RAG style)
function gradeHallucination(response: string, context: string): GradeResult {
  if (!response) {
    return {
      grade: "fail",
      score: 0,
      feedback: "No response provided to check.",
      details: {},
      retry_recommended: true,
      retry_strategy: "regenerate"
    };
  }

  // Extract claims from response (simplified: sentences with factual markers)
  const claims = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const contextLower = context?.toLowerCase() || "";
  
  let supportedClaims = 0;
  let unsupportedClaims = 0;
  const claimAnalysis: { claim: string; supported: boolean; evidence?: string }[] = [];
  
  for (const claim of claims) {
    const claimTerms = claim.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    const matchCount = claimTerms.filter(t => contextLower.includes(t)).length;
    const supported = matchCount / claimTerms.length > 0.4;
    
    if (supported) {
      supportedClaims++;
      claimAnalysis.push({ claim: claim.trim(), supported: true });
    } else {
      unsupportedClaims++;
      claimAnalysis.push({ claim: claim.trim(), supported: false });
    }
  }
  
  const score = claims.length > 0 ? supportedClaims / claims.length : 0.5;
  
  let grade: GradeResult["grade"];
  let feedback: string;
  
  if (score >= 0.85) {
    grade = "pass";
    feedback = "Response is well-grounded in evidence. No hallucination detected.";
  } else if (score >= 0.65) {
    grade = "warn";
    feedback = `${unsupportedClaims} claim(s) may not be fully supported. Review flagged sections.`;
  } else {
    grade = "fail";
    feedback = "Significant hallucination risk detected. Response contains unsupported claims.";
  }

  return {
    grade,
    score: Math.round(score * 1000) / 1000,
    feedback,
    details: {
      total_claims: claims.length,
      supported_claims: supportedClaims,
      unsupported_claims: unsupportedClaims,
      grounding_ratio: Math.round(score * 100) + "%",
      claim_analysis: claimAnalysis.slice(0, 5) // Top 5 for brevity
    },
    retry_recommended: score < 0.65,
    retry_strategy: score < 0.65 ? "regenerate_with_stricter_grounding" : undefined
  };
}

// Answer Quality Grader
function gradeAnswer(response: string, query: string): GradeResult {
  if (!response || response.length < 10) {
    return {
      grade: "fail",
      score: 0.1,
      feedback: "Response is too short or empty.",
      details: { reason: "insufficient_length" },
      retry_recommended: true,
      retry_strategy: "regenerate"
    };
  }

  const queryTerms = new Set(query.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const responseTerms = response.toLowerCase().split(/\s+/);
  
  // Relevance: Does response address query?
  const relevance = [...queryTerms].filter(t => responseTerms.includes(t)).length / queryTerms.size;
  
  // Completeness: Is response substantive?
  const completeness = Math.min(response.length / 200, 1);
  
  // Clarity: Simple heuristics (no run-ons, proper structure)
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = response.length / Math.max(sentences.length, 1);
  const clarity = avgSentenceLength < 150 && avgSentenceLength > 20 ? 0.9 : 0.6;
  
  const score = (relevance * 0.4) + (completeness * 0.35) + (clarity * 0.25);
  
  let grade: GradeResult["grade"];
  let feedback: string;
  
  if (score >= 0.75) {
    grade = "pass";
    feedback = "Answer is complete, relevant, and well-structured.";
  } else if (score >= 0.55) {
    grade = "warn";
    feedback = "Answer is acceptable but could be improved in clarity or completeness.";
  } else {
    grade = "fail";
    feedback = "Answer quality is insufficient. Consider regeneration or clarification.";
  }

  return {
    grade,
    score: Math.round(score * 1000) / 1000,
    feedback,
    details: {
      relevance: Math.round(relevance * 100) / 100,
      completeness: Math.round(completeness * 100) / 100,
      clarity: Math.round(clarity * 100) / 100,
      sentence_count: sentences.length,
      response_length: response.length
    },
    retry_recommended: score < 0.55,
    retry_strategy: score < 0.55 ? "regenerate_with_specificity" : undefined
  };
}

// Helper: Extract entities (simplified NER)
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  // Match capitalized words (likely proper nouns)
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(capitalizedPattern) || [];
  entities.push(...matches);
  
  // Match acronyms
  const acronymPattern = /\b[A-Z]{2,}\b/g;
  const acronyms = text.match(acronymPattern) || [];
  entities.push(...acronyms);
  
  return [...new Set(entities)].map(e => e.toLowerCase());
}

export async function POST(req: Request) {
  try {
    const { type, query, context, response, retry_count = 0 } = await req.json();
    console.log(`AGLA Grader [${type}]: retry=${retry_count}`);

    let result: GradeResult;

    switch (type) {
      case "retrieval":
        result = gradeRetrieval(query || "", context || "");
        break;
      case "hallucination":
        result = gradeHallucination(response || "", context || "");
        break;
      case "answer":
        result = gradeAnswer(response || "", query || "");
        break;
      default:
        return NextResponse.json({
          ok: false,
          error: `Unknown grading type: ${type}. Use 'retrieval', 'hallucination', or 'answer'.`
        }, { status: 400 });
    }

    // Add retry logic metadata
    const maxRetries = 2;
    const shouldRetry = result.retry_recommended && retry_count < maxRetries;

    return NextResponse.json({
      ok: true,
      type,
      ...result,
      retry_metadata: {
        current_retry: retry_count,
        max_retries: maxRetries,
        should_retry: shouldRetry,
        retry_strategy: shouldRetry ? result.retry_strategy : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

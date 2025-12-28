import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, context, response } = await req.json();

    // Simulate grading (Retrieval, Hallucination, or Answer)
    let grade = "pass";
    let score = 1.0;
    let feedback = "";
    const details: Record<string, unknown> = {};

    switch (type) {
      case "retrieval":
        // Check if retrieved context is relevant
        score = context && context.length > 50 ? 0.92 : 0.65;
        grade = score > 0.7 ? "pass" : "fail";
        feedback = grade === "pass" 
          ? "Retrieved documents are relevant to the query. Proceeding with generation."
          : "Retrieved documents have low relevance. Consider reformulating query or expanding search.";
        details.relevance_signals = ["keyword_overlap", "semantic_similarity", "entity_match"];
        details.confidence = score;
        break;

      case "hallucination":
        // Check if response is grounded in context
        if (response && context) {
          // Simulate checking if response claims are in context
          const responseWords = new Set(response.toLowerCase().split(/\s+/));
          const contextWords = new Set(context.toLowerCase().split(/\s+/));
          const overlap = [...responseWords].filter(w => contextWords.has(w)).length;
          score = Math.min(overlap / responseWords.size + 0.3, 1.0);
        } else {
          score = 0.5;
        }
        grade = score > 0.75 ? "pass" : "warn";
        feedback = grade === "pass"
          ? "Response is well-grounded in the provided evidence. No hallucination detected."
          : "Some claims may not be fully supported by evidence. Review flagged sections.";
        details.grounding_score = score;
        details.claims_verified = Math.floor(score * 10);
        details.claims_unverified = Math.floor((1 - score) * 3);
        break;

      case "answer":
        // Check overall answer quality
        score = response && response.length > 20 ? 0.88 : 0.6;
        grade = score > 0.7 ? "pass" : "fail";
        feedback = grade === "pass"
          ? "Answer is complete, relevant, and well-structured."
          : "Answer may be incomplete or off-topic. Consider regeneration.";
        details.completeness = score > 0.8 ? "high" : "medium";
        details.relevance = score > 0.75 ? "high" : "medium";
        details.clarity = "high";
        break;

      default:
        grade = "unknown";
        score = 0;
        feedback = `Unknown grading type: ${type}. Use 'retrieval', 'hallucination', or 'answer'.`;
    }

    return NextResponse.json({
      ok: true,
      type,
      grade,
      score: Math.round(score * 100) / 100,
      feedback,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

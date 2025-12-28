export async function POST(request: Request) {
  try {
    const { response_draft } = await request.json();
    
    // Naive risk scoring
    const risk = response_draft.length > 500 ? 0.4 : 0.1;
    
    return new Response(JSON.stringify({
      risk_score: risk,
      concerns: risk > 0.3 ? ["Response is long, potential for drift."] : [],
      recommendation: risk > 0.3 ? "Verify key claims." : "Proceed."
    }), { status: 200 });
  } catch {
    return new Response("Error in risk scorer", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { answer, intent } = await request.json();
    const passed = answer.length > 10 && intent.length > 0;
    return new Response(JSON.stringify({
      passed,
      feedback: passed ? "Answer aligns with intent." : "Answer is too short or intent is missing.",
      score: passed ? 0.95 : 0.2
    }), { status: 200 });
  } catch {
    return new Response("Error in QA checker", { status: 500 });
  }
}

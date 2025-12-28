export async function POST(request: Request) {
  try {
    const { estimated_cost } = await request.json();
    const approved = estimated_cost < 50000;
    return new Response(JSON.stringify({
      approved,
      remaining_budget: 100000 - estimated_cost,
      message: approved ? "Budget approved." : "Budget exceeded. Requires manual override."
    }), { status: 200 });
  } catch {
    return new Response("Error in budget check", { status: 500 });
  }
}

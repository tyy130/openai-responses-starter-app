export async function POST(request: Request) {
  try {
    const { task_description } = await request.json();
    return new Response(JSON.stringify({
      estimated_tokens: task_description.length * 10,
      estimated_time_ms: 2000,
      resource_tier: "standard"
    }), { status: 200 });
  } catch {
    return new Response("Error in resource quote", { status: 500 });
  }
}

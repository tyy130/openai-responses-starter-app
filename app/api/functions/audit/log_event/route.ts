export async function POST(request: Request) {
  try {
    const { event_type, details } = await request.json();
    console.log(`[AUDIT] ${event_type}: ${details}`);
    return new Response(JSON.stringify({
      logged: true,
      audit_id: crypto.randomUUID()
    }), { status: 200 });
  } catch {
    return new Response("Error in audit log", { status: 500 });
  }
}

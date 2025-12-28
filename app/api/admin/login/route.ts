import { NextResponse } from "next/server";
import { logRequest } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body?.username;
    const password = body?.password;
    
    const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
    const ADMIN_AUTH_TOKEN = process.env.ADMIN_AUTH_TOKEN ?? "";

    if (!username || username !== ADMIN_USER || !password || password !== ADMIN_PASSWORD || !ADMIN_AUTH_TOKEN) {
      await logRequest("warn", "Admin Login: Failed attempt", { username });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await logRequest("info", "Admin Login: Success", { username });
    const res = NextResponse.json({ ok: true });
    // Set HttpOnly cookie for admin session (8 hours)
    res.headers.set(
      "Set-Cookie",
      `admin_auth=${ADMIN_AUTH_TOKEN}; Path=/; HttpOnly; Max-Age=${60 * 60 * 8}; SameSite=Strict; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`
    );
    return res;
  } catch {
    await logRequest("error", "Admin Login: Bad request");
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
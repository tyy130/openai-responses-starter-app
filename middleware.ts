import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define public paths that don't require authentication
  const isPublicPath = 
    pathname === "/login" || 
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/_next") || 
    pathname.includes("/favicon.ico") ||
    pathname.includes("/brain.svg");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Check for admin_auth cookie
  const adminAuth = request.cookies.get("admin_auth")?.value;
  const ADMIN_AUTH_TOKEN = process.env.ADMIN_AUTH_TOKEN;

  // 3. If no valid token, redirect to login
  if (!adminAuth || adminAuth !== ADMIN_AUTH_TOKEN) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|brain.svg).*)",
  ],
};

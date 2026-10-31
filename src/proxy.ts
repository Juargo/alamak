import { NextResponse, type NextRequest } from "next/server";
import { hasSession, SIGN_IN_PATH } from "@/modules/cuentas";

/**
 * Diary routes: redirects visitors without a session before any HTML is sent, and renews
 * the session cookie so daily use keeps the player signed in. Server Components cannot set
 * cookies; here Better Auth's `nextCookies` plugin writes the renewed one.
 */
export async function proxy(request: NextRequest) {
  const signedIn = await hasSession(request.headers);
  // Only page loads are redirected; Server Actions (POST) handle a missing session themselves.
  const isPageLoad = request.method === "GET" || request.method === "HEAD";
  return signedIn || !isPageLoad
    ? NextResponse.next()
    : NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
}

export const config = {
  matcher: ["/diario/:path*"],
};

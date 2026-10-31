import { NextResponse, type NextRequest } from "next/server";
import { DIARY_PATH, hasSession, SIGN_IN_PATH } from "@/modules/cuentas";

/**
 * Session routes: renews the session cookie so daily use keeps the player signed in, and
 * sends visitors without a session from the diary to the sign-in page before any HTML.
 * Server Components cannot set cookies; here Better Auth's `nextCookies` plugin writes it.
 */
export async function proxy(request: NextRequest) {
  const signedIn = await hasSession(request.headers);
  // Only page loads are redirected; Server Actions (POST) handle a missing session themselves.
  const isPageLoad = request.method === "GET" || request.method === "HEAD";
  const isDiary = request.nextUrl.pathname.startsWith(DIARY_PATH);
  return signedIn || !isPageLoad || !isDiary
    ? NextResponse.next()
    : NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
}

export const config = {
  matcher: ["/diario/:path*", "/ingresar"],
};

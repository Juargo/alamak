import { NextResponse, type NextRequest } from "next/server";
import { SIGN_IN_ERROR, signInErrorPath } from "@/app/ingresar/sign-in-errors";
import { DIARY_PATH, hasSession, SIGN_IN_PATH } from "@/modules/cuentas";

/**
 * Session routes: renews the session cookie so daily use keeps the player signed in, and
 * sends visitors without a session from the diary to the sign-in page before any HTML.
 * Server Components cannot set cookies; here Better Auth's `nextCookies` plugin writes it.
 */
export async function proxy(request: NextRequest) {
  // Only diary page loads are redirected; Server Actions (POST) and the sign-in page handle
  // a missing session themselves.
  const isPageLoad = request.method === "GET" || request.method === "HEAD";
  const guardsDiary = isPageLoad && request.nextUrl.pathname.startsWith(DIARY_PATH);

  let signedIn: boolean;
  try {
    signedIn = await hasSession(request.headers);
  } catch (error) {
    // If the session cannot be read, the diary sends the player to sign in with a message
    // to retry, and every other request goes on to its page.
    console.error("session check failed in proxy", { error });
    return guardsDiary
      ? NextResponse.redirect(
          new URL(signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.unavailable), request.url),
        )
      : NextResponse.next();
  }
  return signedIn || !guardsDiary
    ? NextResponse.next()
    : NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
}

export const config = {
  matcher: ["/diario/:path*", "/ingresar"],
};

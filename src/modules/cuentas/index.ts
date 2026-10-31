import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./infraestructura/auth";

export { getAuth };

export const SIGN_IN_PATH = "/ingresar";
export const DIARY_PATH = "/diario";

export type CurrentUser = { id: string; name: string; email: string };

/** The signed-in user, read only from the server session (ADR-0017), or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Read the request first: during the build this marks the page as dynamic before any
  // sign-in setting is needed.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
}

/** For diary screens: the signed-in user, or a redirect to the sign-in page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(SIGN_IN_PATH);
  return user;
}

// Discord and the email link are planned for later (#23 follow-up).
export const SIGN_IN_PROVIDERS = ["google"] as const;
export type SignInProvider = (typeof SIGN_IN_PROVIDERS)[number];

export function isSignInProvider(value: unknown): value is SignInProvider {
  return SIGN_IN_PROVIDERS.includes(value as SignInProvider);
}

/** Starts the provider's sign-in and returns the URL to send the player to. */
export async function startSignIn(
  provider: SignInProvider,
  paths: { callback: string; error: string },
): Promise<string> {
  const { url } = await getAuth().api.signInSocial({
    body: { provider, callbackURL: paths.callback, errorCallbackURL: paths.error },
    headers: await headers(),
  });
  if (!url) throw new Error(`Sign-in with ${provider} returned no URL`);
  return url;
}

/** Ends the current session only. */
export async function signOut(): Promise<void> {
  await getAuth().api.signOut({ headers: await headers() });
}

/**
 * Ends every session of the signed-in user, on all devices. Returns false when this device
 * had no session left (a page left open), so the other sessions could not be revoked.
 */
export async function signOutEverywhere(): Promise<boolean> {
  const requestHeaders = await headers();
  const hasCurrentSession = (await getAuth().api.getSession({ headers: requestHeaders })) !== null;
  if (hasCurrentSession) await getAuth().api.revokeSessions({ headers: requestHeaders });
  // Clears this device's cookie in every case.
  await getAuth().api.signOut({ headers: requestHeaders });
  return hasCurrentSession;
}

/** Checks the session of a request outside React (the proxy), renewing it when due. */
export async function hasSession(requestHeaders: Headers): Promise<boolean> {
  return (await getAuth().api.getSession({ headers: requestHeaders })) !== null;
}

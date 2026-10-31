import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./infraestructura/auth";

export { getAuth };

export const SIGN_IN_PATH = "/ingresar";

export type CurrentUser = { id: string; name: string; email: string };

/** The signed-in user, read only from the server session (ADR-0017), or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getAuth().api.getSession({ headers: await headers() });
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

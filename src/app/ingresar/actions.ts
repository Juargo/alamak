"use server";

import { redirect } from "next/navigation";
import { DIARY_PATH, isSignInProvider, SIGN_IN_PATH, startSignIn } from "@/modules/cuentas";

/** Sends the player to Google sign-in; they come back to the diary. */
export async function signInWith(formData: FormData): Promise<void> {
  const provider = formData.get("provider");
  if (!isSignInProvider(provider)) redirect(`${SIGN_IN_PATH}?error=proveedor`);
  const url = await startSignIn(provider, {
    callback: DIARY_PATH,
    error: `${SIGN_IN_PATH}?error=acceso`,
  });
  redirect(url);
}

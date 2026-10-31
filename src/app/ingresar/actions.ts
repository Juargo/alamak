"use server";

import { redirect } from "next/navigation";
import { DIARY_PATH, isSignInProvider, SIGN_IN_PATH, startSignIn } from "@/modules/cuentas";
import { SIGN_IN_ERROR, signInErrorPath } from "./sign-in-errors";

/** Sends the player to the provider's sign-in; they come back to the diary. */
export async function signInWith(formData: FormData): Promise<void> {
  const provider = formData.get("provider");
  if (!isSignInProvider(provider)) redirect(signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.failed));
  let url: string;
  try {
    // A failed return from the provider comes back here with Better Auth's error code.
    url = await startSignIn(provider, { callback: DIARY_PATH, error: SIGN_IN_PATH });
  } catch (error) {
    console.error("sign-in start failed", { provider, error });
    redirect(signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.failed));
  }
  redirect(url);
}

"use server";

import { redirect } from "next/navigation";
import { SIGN_IN_PATH, signOut, signOutEverywhere } from "@/modules/cuentas";
import { SIGN_IN_ERROR, signInErrorPath } from "../ingresar/sign-in-errors";

export async function signOutAction(): Promise<void> {
  try {
    await signOut();
  } catch (error) {
    console.error("sign-out failed", { error });
    redirect(signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.unavailable));
  }
  redirect(SIGN_IN_PATH);
}

export async function signOutEverywhereAction(): Promise<void> {
  let revoked: boolean;
  try {
    revoked = await signOutEverywhere();
  } catch (error) {
    console.error("sign-out everywhere failed", { error });
    redirect(signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.unavailable));
  }
  redirect(revoked ? SIGN_IN_PATH : signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.sessionExpired));
}

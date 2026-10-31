"use server";

import { redirect } from "next/navigation";
import { SIGN_IN_PATH, signOut, signOutEverywhere } from "@/modules/cuentas";
import { SIGN_IN_ERROR, signInErrorPath } from "../ingresar/sign-in-errors";

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(SIGN_IN_PATH);
}

export async function signOutEverywhereAction(): Promise<void> {
  const revoked = await signOutEverywhere();
  redirect(revoked ? SIGN_IN_PATH : signInErrorPath(SIGN_IN_PATH, SIGN_IN_ERROR.sessionExpired));
}

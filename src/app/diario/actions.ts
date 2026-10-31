"use server";

import { redirect } from "next/navigation";
import { SIGN_IN_PATH, signOut, signOutEverywhere } from "@/modules/cuentas";

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(SIGN_IN_PATH);
}

export async function signOutEverywhereAction(): Promise<void> {
  const revoked = await signOutEverywhere();
  redirect(revoked ? SIGN_IN_PATH : `${SIGN_IN_PATH}?error=sesion-vencida`);
}

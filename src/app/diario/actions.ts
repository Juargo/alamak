"use server";

import { redirect } from "next/navigation";
import { SIGN_IN_PATH, signOut, signOutEverywhere } from "@/modules/cuentas";

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(SIGN_IN_PATH);
}

export async function signOutEverywhereAction(): Promise<void> {
  await signOutEverywhere();
  redirect(SIGN_IN_PATH);
}

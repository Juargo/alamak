"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DIARY_PATH, requireUser } from "@/modules/cuentas";
import { checkOwnership } from "@/modules/partidas";

export type OwnershipState =
  | { status: "idle" }
  | { status: "mismatch" | "claimed" | "riot-unavailable" | "expired" }
  | { status: "too-soon"; retryAfterSeconds: number };

/** "Ya lo cambié": checks the icon; the diary then imports the games of a verified account. */
export async function checkOwnershipAction(): Promise<OwnershipState> {
  const user = await requireUser();
  let result;
  try {
    result = await checkOwnership(user.id);
  } catch (error) {
    console.error("ownership check failed", { error: String(error) });
    return { status: "riot-unavailable" };
  }
  switch (result.status) {
    case "verified":
      redirect(`${DIARY_PATH}?comprobada=1`);
    case "expired":
      // The page picks and shows a new icon.
      revalidatePath(DIARY_PATH);
      return { status: "expired" };
    case "too-soon":
      return { status: "too-soon", retryAfterSeconds: result.retryAfterSeconds };
    case "mismatch":
    case "claimed":
    case "riot-unavailable":
      return { status: result.status };
    default:
      // not-linked or not-started: the page shows the right step again.
      redirect(DIARY_PATH);
  }
}

"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { DIARY_PATH, requireUser } from "@/modules/cuentas";
import { checkOwnership, importRecentMatches } from "@/modules/partidas";

export type OwnershipState =
  | { status: "idle" }
  | { status: "mismatch" | "claimed" | "riot-unavailable" }
  | { status: "too-soon"; retryAfterSeconds: number };

/** "Ya lo cambié": checks the icon; once verified, imports the games after responding. */
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
      after(async () => {
        const outcome = await importRecentMatches(user.id).catch((error: unknown) => ({
          status: `error: ${String(error)}`,
        }));
        console.info("first import after verifying", { status: outcome.status });
      });
      redirect(`${DIARY_PATH}?comprobada=1`);
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

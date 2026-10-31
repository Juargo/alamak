"use server";

import { redirect } from "next/navigation";
import { DIARY_PATH, requireUser } from "@/modules/cuentas";
import { linkRiotAccount } from "@/modules/partidas";

export type LinkRiotState =
  | { status: "idle" }
  | {
      status: "error";
      reason: "riotId" | "region" | "not-found" | "riot-unavailable";
      values: { riotId: string; region: string };
    };

/** Links the signed-in player's Riot account; the player comes only from the session. */
export async function linkRiotAction(_: LinkRiotState, formData: FormData): Promise<LinkRiotState> {
  const user = await requireUser();
  const riotId = String(formData.get("riotId") ?? "");
  const region = String(formData.get("region") ?? "");

  const result = await linkRiotAccount(user.id, { riotId, region });
  switch (result.status) {
    case "linked":
    case "already-linked":
      redirect(DIARY_PATH);
    case "invalid":
      return { status: "error", reason: result.field, values: { riotId, region } };
    default:
      return { status: "error", reason: result.status, values: { riotId, region } };
  }
}

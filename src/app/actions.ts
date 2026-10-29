"use server";

import { enrollInWaitlist } from "@/modules/captacion";

export type JoinWaitlistState =
  | { status: "idle" }
  | { status: "enrolled" }
  | { status: "invalid"; field: "email" | "region" }
  | { status: "error" };

const HONEYPOT_FIELD = "website";

/** Server Action behind the waitlist form (used with useActionState). */
export async function joinWaitlist(
  _previous: JoinWaitlistState,
  formData: FormData,
): Promise<JoinWaitlistState> {
  // Honeypot: people never see the "website" field, bots fill it. Answer as if it worked.
  if (formData.get(HONEYPOT_FIELD)) return { status: "enrolled" };

  try {
    const result = await enrollInWaitlist({
      email: formData.get("email"),
      region: formData.get("region"),
    });
    // New and repeated emails get the same response, so the form cannot reveal who is on
    // the list; only the confirmation email tells the owner they were already enrolled.
    return result.status === "already-enrolled" ? { status: "enrolled" } : result;
  } catch (error) {
    // Never log the email: it is personal data (ADR-0011).
    console.error("joinWaitlist failed", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}

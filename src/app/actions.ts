"use server";

import { enrollInWaitlist, type Region } from "@/modules/captacion";

/** What the person submitted, sent back so the form shows it again after the action. */
export type WaitlistValues = { email: string; region: string };

export type JoinWaitlistState =
  | { status: "idle" }
  // `region` feeds the sign-up metric; null when the honeypot caught a bot, so it is not counted.
  | { status: "enrolled"; email: string; region: Region | null }
  | { status: "invalid"; field: "email" | "region"; values: WaitlistValues }
  | { status: "error"; values: WaitlistValues };

const HONEYPOT_FIELD = "website";

/** Server Action behind the waitlist form (used with useActionState). */
export async function joinWaitlist(
  _previous: JoinWaitlistState,
  formData: FormData,
): Promise<JoinWaitlistState> {
  const values = { email: text(formData, "email"), region: text(formData, "region") };
  const email = values.email.trim();

  // Honeypot: people never see the "website" field, bots fill it. Answer as if it worked.
  if (formData.get(HONEYPOT_FIELD)) return { status: "enrolled", email, region: null };

  try {
    const result = await enrollInWaitlist(values);
    if (result.status === "invalid") return { ...result, values };
    // New and repeated emails get the same response, so the form cannot reveal who is on
    // the list; only the confirmation email tells the owner they were already enrolled.
    return { status: "enrolled", email, region: result.region };
  } catch (error) {
    // Never log the email: it is personal data (ADR-0011).
    console.error("joinWaitlist failed", error instanceof Error ? error.message : error);
    return { status: "error", values };
  }
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

"use server";

import { enrollInWaitlist } from "@/modules/captacion";

/** What the person submitted, sent back so the form shows it again after the action. */
export type WaitlistValues = { email: string; region: string };

export type JoinWaitlistState =
  | { status: "idle" }
  | { status: "enrolled"; email: string }
  | { status: "invalid"; field: "email" | "region"; values: WaitlistValues }
  | { status: "error"; values: WaitlistValues };

const HONEYPOT_FIELD = "website";

/** Server Action behind the waitlist form (used with useActionState). */
export async function joinWaitlist(
  _previous: JoinWaitlistState,
  formData: FormData,
): Promise<JoinWaitlistState> {
  const values = { email: text(formData, "email"), region: text(formData, "region") };
  const enrolled = { status: "enrolled", email: values.email.trim() } as const;

  // Honeypot: people never see the "website" field, bots fill it. Answer as if it worked.
  if (formData.get(HONEYPOT_FIELD)) return enrolled;

  try {
    const result = await enrollInWaitlist(values);
    if (result.status === "invalid") return { ...result, values };
    // New and repeated emails get the same response, so the form cannot reveal who is on
    // the list; only the confirmation email tells the owner they were already enrolled.
    return enrolled;
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

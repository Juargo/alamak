"use server";

import { enrollInWaitlist, type EnrollmentResult } from "@/modules/captacion";

export type JoinWaitlistState = { status: "idle" } | EnrollmentResult | { status: "error" };

/** Server Action behind the waitlist form (used with useActionState). */
export async function joinWaitlist(
  _previous: JoinWaitlistState,
  formData: FormData,
): Promise<JoinWaitlistState> {
  try {
    return await enrollInWaitlist({ email: formData.get("email"), region: formData.get("region") });
  } catch (error) {
    // Never log the email: it is personal data (ADR-0011).
    console.error("joinWaitlist failed", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}

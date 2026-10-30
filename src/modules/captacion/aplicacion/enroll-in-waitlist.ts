import { parseWaitlistSignup, type WaitlistSignup } from "../dominio/waitlist";

export interface WaitlistRepository {
  /** Stores the sign-up unless the email is already on the list. */
  add(signup: WaitlistSignup): Promise<"created" | "already-exists">;
}

export type EnrollmentResult =
  | { status: "enrolled" }
  | { status: "already-enrolled" }
  | { status: "invalid"; field: "email" | "region" };

export function enrollInWaitlist(deps: { repository: WaitlistRepository }) {
  return async (input: { email: unknown; region: unknown }): Promise<EnrollmentResult> => {
    const parsed = parseWaitlistSignup(input);
    if (!parsed.ok) return { status: "invalid", field: parsed.field };

    const outcome = await deps.repository.add(parsed.signup);
    return outcome === "created" ? { status: "enrolled" } : { status: "already-enrolled" };
  };
}

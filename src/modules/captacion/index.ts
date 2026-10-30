import "server-only";
import { getDb } from "@/shared/db/drizzle";
import {
  enrollInWaitlist as enrollWith,
  type EnrollmentResult,
} from "./aplicacion/enroll-in-waitlist";
import { postgresWaitlistRepository } from "./infraestructura/postgres-waitlist-repository";

export { REGIONS, type Region } from "./dominio/waitlist";
export { preselectRegion } from "./dominio/region-preselection";
export type { EnrollmentResult } from "./aplicacion/enroll-in-waitlist";

/** Adds an email and region to the waitlist; repeating an email does not duplicate it. */
export function enrollInWaitlist(input: {
  email: unknown;
  region: unknown;
}): Promise<EnrollmentResult> {
  return enrollWith({ repository: postgresWaitlistRepository(getDb()) })(input);
}

import { headers } from "next/headers";
import { preselectRegion, REGIONS } from "@/modules/captacion";
import { WaitlistForm } from "./waitlist-form";

/** Reads the visitor's country (Vercel geolocation) to preselect the region. */
export async function WaitlistFormWithRegion() {
  const requestHeaders = await headers();
  const defaultRegion = preselectRegion({
    country: requestHeaders.get("x-vercel-ip-country"),
    acceptLanguage: requestHeaders.get("accept-language"),
  });
  return <WaitlistForm regions={REGIONS} defaultRegion={defaultRegion} />;
}

/** Rendered while the request headers stream in; same form with the default region. */
export function WaitlistFormFallback() {
  return <WaitlistForm regions={REGIONS} defaultRegion="LAS" />;
}

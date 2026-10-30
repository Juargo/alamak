import type { Region } from "./waitlist";

// Countries served by each Riot server in Alamak's markets. Assumption to confirm against
// Riot's server list; the visitor can always change the preselected region.
const REGION_BY_COUNTRY: Record<string, Region> = {
  AR: "LAS",
  BO: "LAS",
  CL: "LAS",
  PY: "LAS",
  UY: "LAS",
  MX: "LAN",
  GT: "LAN",
  HN: "LAN",
  SV: "LAN",
  NI: "LAN",
  CR: "LAN",
  PA: "LAN",
  CU: "LAN",
  DO: "LAN",
  PR: "LAN",
  CO: "LAN",
  VE: "LAN",
  EC: "LAN",
  PE: "LAN",
  ES: "EUW",
};

const DEFAULT_REGION: Region = "LAS";

/** First language tag's country, e.g. "es-MX,es;q=0.9" → "MX". */
function countryFromAcceptLanguage(acceptLanguage: string): string | undefined {
  const firstTag = acceptLanguage.split(",")[0]?.trim();
  return firstTag?.split("-")[1]?.toUpperCase();
}

/** Region to preselect in the waitlist form from the visitor's country or browser language. */
export function preselectRegion(input: {
  country: string | null;
  acceptLanguage: string | null;
}): Region {
  const country =
    input.country?.toUpperCase() ||
    (input.acceptLanguage ? countryFromAcceptLanguage(input.acceptLanguage) : undefined);
  return (country && REGION_BY_COUNTRY[country]) || DEFAULT_REGION;
}

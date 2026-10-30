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

/**
 * Placeholder with the form's size while the request headers stream in. It has no fields on
 * purpose: anything typed into a fallback form is lost when the real one replaces it.
 */
export function WaitlistFormSkeleton() {
  return (
    <div aria-hidden="true" className="flex w-full flex-col gap-3 md:w-[480px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="h-4 w-14 rounded bg-borde-defecto" />
          <span className="h-12 rounded-md bg-fondo-superficie" />
        </div>
        <div className="flex flex-col gap-1.5 md:w-[120px]">
          <span className="h-4 w-14 rounded bg-borde-defecto" />
          <span className="h-12 rounded-md bg-fondo-superficie" />
        </div>
      </div>
      <span className="h-11 rounded-md bg-marca-principal opacity-70" />
      <span className="h-4 w-56 rounded bg-borde-defecto" />
    </div>
  );
}

import posthog from "posthog-js";
import type { Region } from "@/modules/captacion/dominio/waitlist";

/**
 * Event catalog (ADR-0013, docs/analitica/eventos.md). Allowed properties only:
 * never an email, a Riot ID or any other direct identifier.
 */
type Events = {
  lista_espera_inscrito: { region: Region };
};

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

/** Starts cookieless analytics in the browser; without a key it stays off. */
export function initAnalytics() {
  if (!key) return;
  posthog.init(key, {
    api_host: host,
    // No cookies, no local or session storage, so the landing needs no cookie banner.
    cookieless_mode: "always",
    person_profiles: "never",
    capture_pageview: "history_change",
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
  });
}

export function trackEvent<E extends keyof Events>(event: E, properties: Events[E]) {
  if (!key) return;
  posthog.capture(event, properties);
}

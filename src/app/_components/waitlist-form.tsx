"use client";

import { useActionState } from "react";
import { joinWaitlist, type JoinWaitlistState } from "../actions";

const ERROR_MESSAGES = {
  email: "Revisa el correo: debe tener la forma nombre@dominio.com.",
  region: "Elige tu región: LAS, LAN o EUW.",
  server: "No pudimos inscribirte ahora. Inténtalo de nuevo en unos minutos.",
};

const fieldBox =
  "h-12 w-full rounded-md border bg-fondo-superficie px-3.5 text-cuerpo-m text-texto-primario outline-none focus-visible:ring-2 focus-visible:ring-marca-principal";

type Props = {
  regions: readonly string[];
  defaultRegion: string;
};

export function WaitlistForm({ regions, defaultRegion }: Props) {
  const [state, formAction, pending] = useActionState<JoinWaitlistState, FormData>(joinWaitlist, {
    status: "idle",
  });
  if (state.status === "enrolled") return <Enrolled email={state.email} />;

  const invalidField = state.status === "invalid" ? state.field : undefined;
  // Uncontrolled fields seeded from the action's echo: React resets the form after every
  // action, and the page may not be hydrated yet when the person submits.
  const values = "values" in state ? state.values : { email: "", region: defaultRegion };

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 md:w-[480px]" noValidate>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="waitlist-email" className="text-etiqueta-s font-medium">
            Correo
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="tu@correo.com"
            defaultValue={values.email}
            aria-invalid={invalidField === "email"}
            aria-describedby={invalidField === "email" ? "waitlist-email-error" : undefined}
            className={`${fieldBox} ${invalidField === "email" ? "border-estado-derrota" : "border-borde-fuerte"}`}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:w-[120px]">
          <label htmlFor="waitlist-region" className="text-etiqueta-s font-medium">
            Región
          </label>
          <div className="relative">
            {/* React ignores a changed defaultValue on a mounted select; the key remounts it. */}
            <select
              key={values.region}
              id="waitlist-region"
              name="region"
              defaultValue={values.region}
              aria-invalid={invalidField === "region"}
              aria-describedby={invalidField === "region" ? "waitlist-region-error" : undefined}
              className={`${fieldBox} appearance-none pr-9 ${invalidField === "region" ? "border-estado-derrota" : "border-borde-fuerte"}`}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative 18 px icon */}
            <img
              src="/icons/chevron.svg"
              alt=""
              width={18}
              height={18}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rotate-90"
            />
          </div>
        </div>
      </div>

      {/* Honeypot for bots: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="waitlist-website">No completes este campo</label>
        <input id="waitlist-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite" className="text-cuerpo-s text-estado-derrota empty:hidden">
        {invalidField === "email" && <p id="waitlist-email-error">{ERROR_MESSAGES.email}</p>}
        {invalidField === "region" && <p id="waitlist-region-error">{ERROR_MESSAGES.region}</p>}
        {state.status === "error" && <p>{ERROR_MESSAGES.server}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full cursor-pointer rounded-md bg-marca-principal px-4.5 text-etiqueta-m font-semibold text-texto-sobre-marca transition-opacity disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Inscribiendo…" : "Unirme a la lista de espera"}
      </button>
      <p className="text-nota font-medium text-texto-secundario">
        Al inscribirte aceptas la{" "}
        <a href="/privacidad" className="underline underline-offset-2">
          Política de privacidad
        </a>
        .
      </p>
    </form>
  );
}

function Enrolled({ email }: { email: string }) {
  return (
    <div
      role="status"
      className="flex w-full flex-col items-center gap-5 rounded-lg border border-borde-defecto bg-fondo-superficie p-8 text-center md:w-[480px] md:p-10"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-fondo-victoria-suave">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative 24 px icon */}
        <img src="/icons/check.svg" alt="" width={24} height={24} />
      </div>
      <p className="font-display text-titulo-l font-bold">Listo, estás en la lista</p>
      <p className="text-cuerpo-m text-texto-secundario">
        Te enviamos un correo a <span className="break-all">{email}</span> para confirmar tu
        inscripción. Te escribimos de nuevo cuando empiece la beta.
      </p>
      <a
        href="#inicio"
        className="flex h-11 w-full items-center justify-center rounded-md border border-borde-fuerte bg-fondo-superficie px-4.5 text-etiqueta-m font-semibold"
      >
        Volver al inicio
      </a>
      <p className="text-nota font-medium text-texto-secundario">
        ¿No te llegó? Revisa la carpeta de spam.
      </p>
    </div>
  );
}

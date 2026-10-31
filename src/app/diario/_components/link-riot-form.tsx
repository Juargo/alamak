"use client";

import { useActionState } from "react";
import { linkRiotAction, type LinkRiotState } from "../link-riot-action";

const ERROR_MESSAGES: Record<Exclude<LinkRiotState, { status: "idle" }>["reason"], string> = {
  riotId: "Escribe tu Riot ID como aparece en el cliente, por ejemplo Nombre#TAG.",
  region: "Elige tu región: LAS, LAN o EUW.",
  "not-found":
    "No encontramos esa cuenta en la región elegida. Revisa el nombre, el tag y la región.",
  "riot-unavailable": "Riot no responde en este momento. Vuelve a intentarlo en unos minutos.",
};

const fieldBox =
  "h-12 w-full rounded-md border bg-fondo-superficie px-3.5 text-cuerpo-m text-texto-primario outline-none focus-visible:ring-2 focus-visible:ring-marca-principal";

type Props = { regions: readonly string[]; defaultRegion: string };

export function LinkRiotForm({ regions, defaultRegion }: Props) {
  const [state, formAction, pending] = useActionState<LinkRiotState, FormData>(linkRiotAction, {
    status: "idle",
  });
  const reason = state.status === "error" ? state.reason : undefined;
  // Uncontrolled fields seeded from the action's echo: React resets the form after an action.
  const values = state.status === "error" ? state.values : { riotId: "", region: defaultRegion };
  const riotIdInvalid = reason === "riotId" || reason === "not-found";

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 md:w-[480px]" noValidate>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="riot-id" className="text-etiqueta-s font-medium">
            Riot ID
          </label>
          <input
            id="riot-id"
            name="riotId"
            type="text"
            required
            maxLength={30}
            autoComplete="off"
            placeholder="Nombre#TAG"
            defaultValue={values.riotId}
            aria-invalid={riotIdInvalid}
            aria-describedby={reason ? "link-riot-error" : undefined}
            className={`${fieldBox} ${riotIdInvalid ? "border-estado-derrota" : "border-borde-fuerte"}`}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:w-[120px]">
          <label htmlFor="riot-region" className="text-etiqueta-s font-medium">
            Región
          </label>
          <div className="relative">
            {/* React ignores a changed defaultValue on a mounted select; the key remounts it. */}
            <select
              key={values.region}
              id="riot-region"
              name="region"
              defaultValue={values.region}
              aria-invalid={reason === "region"}
              className={`${fieldBox} appearance-none pr-9 ${reason === "region" ? "border-estado-derrota" : "border-borde-fuerte"}`}
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

      <div aria-live="polite" className="text-cuerpo-s text-estado-derrota empty:hidden">
        {reason && <p id="link-riot-error">{ERROR_MESSAGES[reason]}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full cursor-pointer rounded-md bg-marca-principal px-4.5 text-etiqueta-m font-semibold text-texto-sobre-marca transition-opacity disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Buscando tu cuenta…" : "Vincular cuenta"}
      </button>
    </form>
  );
}

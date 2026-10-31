"use client";

import { useActionState } from "react";
import { checkOwnershipAction, type OwnershipState } from "../ownership-action";

function message(state: OwnershipState): string | null {
  switch (state.status) {
    case "mismatch":
      return "Todavía vemos otro ícono en tu cuenta. Riot puede tardar un momento en mostrar el cambio; vuelve a intentarlo en unos segundos.";
    case "too-soon":
      return `Espera ${state.retryAfterSeconds} segundos antes de volver a comprobar.`;
    case "claimed":
      return "Esta cuenta de Riot ya está comprobada en otra cuenta de Alamak. Si es tuya, escríbenos.";
    case "riot-unavailable":
      return "Riot no responde en este momento. Vuelve a intentarlo en unos minutos.";
    default:
      return null;
  }
}

export function OwnershipCheckForm() {
  const [state, formAction, pending] = useActionState<OwnershipState, FormData>(
    checkOwnershipAction,
    { status: "idle" },
  );
  const text = message(state);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div aria-live="polite" className="text-cuerpo-s text-estado-derrota empty:hidden">
        {text && <p>{text}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full cursor-pointer rounded-md bg-marca-principal px-4.5 text-etiqueta-m font-semibold text-texto-sobre-marca transition-opacity disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {pending ? "Comprobando…" : "Ya lo cambié"}
      </button>
    </form>
  );
}

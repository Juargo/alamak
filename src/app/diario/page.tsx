import type { Metadata } from "next";
import { requireUser } from "@/modules/cuentas";
import { signOutAction, signOutEverywhereAction } from "./actions";

export const metadata: Metadata = {
  title: "Tu diario · Alamak",
  robots: { index: false },
};

// Session pages render per request: they redirect before showing anything.
export const instant = false;

export default async function DiaryPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-10 px-4 pt-6 pb-16 md:px-8 md:pt-12 md:pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-titulo-l font-bold md:text-display-titulo">
          Hola, {user.name}
        </h1>
        <p className="text-cuerpo-l text-texto-secundario">
          Aquí vas a anotar cómo te sentiste después de cada partida. El siguiente paso será
          vincular tu cuenta de Riot.
        </p>
      </header>

      <section className="flex flex-col gap-3 sm:flex-row">
        <form action={signOutAction}>
          <button
            type="submit"
            className="h-11 w-full cursor-pointer rounded-md border border-borde-fuerte bg-fondo-superficie px-4.5 text-etiqueta-m font-semibold sm:w-auto"
          >
            Cerrar sesión
          </button>
        </form>
        <form action={signOutEverywhereAction}>
          <button
            type="submit"
            className="h-11 w-full cursor-pointer rounded-md px-4.5 text-etiqueta-m font-semibold text-marca-texto underline sm:w-auto"
          >
            Cerrar sesión en todos los dispositivos
          </button>
        </form>
      </section>
    </main>
  );
}

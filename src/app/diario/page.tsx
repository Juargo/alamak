import type { Metadata } from "next";
import { headers } from "next/headers";
import { preselectRegion, REGIONS } from "@/modules/captacion";
import { requireUser } from "@/modules/cuentas";
import { formatRiotId, getLinkedAccount, type LinkedAccount } from "@/modules/partidas";
import { LinkRiotForm } from "./_components/link-riot-form";
import { signOutAction, signOutEverywhereAction } from "./actions";

export const metadata: Metadata = {
  title: "Tu diario · Alamak",
  robots: { index: false },
};

// Session pages render per request: they redirect before showing anything.
export const instant = false;

export default async function DiaryPage() {
  const user = await requireUser();
  const account = await getLinkedAccount(user.id);

  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-10 px-4 pt-6 pb-16 md:px-8 md:pt-12 md:pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-titulo-l font-bold md:text-display-titulo">
          Hola, {user.name}
        </h1>
        <p className="text-cuerpo-l text-texto-secundario">
          Aquí vas a anotar cómo te sentiste después de cada partida.
        </p>
      </header>

      {account ? <LinkedRiotAccount account={account} /> : <LinkRiotAccount />}

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

async function LinkRiotAccount() {
  const requestHeaders = await headers();
  const defaultRegion = preselectRegion({
    country: requestHeaders.get("x-vercel-ip-country"),
    acceptLanguage: requestHeaders.get("accept-language"),
  });
  return (
    <section aria-labelledby="link-riot-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 id="link-riot-title" className="font-display text-titulo-m font-bold">
          Vincula tu cuenta de Riot
        </h2>
        <p className="text-cuerpo-m text-texto-secundario">
          Así el diario trae tus partidas ranked sin que las cargues a mano. Solo leemos los datos
          oficiales de tu propia cuenta.
        </p>
      </div>
      <LinkRiotForm regions={REGIONS} defaultRegion={defaultRegion} />
    </section>
  );
}

function LinkedRiotAccount({ account }: { account: LinkedAccount }) {
  return (
    <section
      aria-labelledby="linked-riot-title"
      className="flex flex-col gap-2 rounded-lg border border-borde-defecto bg-fondo-superficie p-5"
    >
      <h2 id="linked-riot-title" className="font-display text-titulo-m font-bold">
        Cuenta vinculada: {formatRiotId(account)} ({account.region})
      </h2>
      {account.verified ? null : (
        <p className="text-cuerpo-m text-texto-secundario">
          Falta comprobar que esta cuenta es tuya. Cuando lo hagas, traeremos tus partidas ranked de
          los últimos 30 días.
        </p>
      )}
    </section>
  );
}

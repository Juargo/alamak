import type { Metadata } from "next";
import { headers } from "next/headers";
import { after } from "next/server";
import { preselectRegion, REGIONS } from "@/modules/captacion";
import { requireUser } from "@/modules/cuentas";
import {
  countStoredMatches,
  formatRiotId,
  getLinkedAccount,
  importRecentMatches,
  profileIconImage,
  startOwnershipCheck,
  type LinkedAccount,
} from "@/modules/partidas";
import { LinkRiotForm } from "./_components/link-riot-form";
import { OwnershipCheckForm } from "./_components/ownership-check-form";
import { signOutAction, signOutEverywhereAction } from "./actions";

export const metadata: Metadata = {
  title: "Tu diario · Alamak",
  robots: { index: false },
};

// Session pages render per request: they redirect before showing anything.
export const instant = false;

export default async function DiaryPage({ searchParams }: PageProps<"/diario">) {
  const user = await requireUser();
  const account = await getLinkedAccount(user.id);
  const { comprobada } = await searchParams;

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

      {!account ? (
        <LinkRiotAccount />
      ) : account.verified ? (
        <VerifiedRiotAccount account={account} userId={user.id} justVerified={comprobada === "1"} />
      ) : (
        <OwnershipCheck account={account} userId={user.id} />
      )}

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

const STEPS = [
  "Abre el cliente de League of Legends.",
  "Haz clic en tu ícono de perfil, arriba a la derecha.",
  "Elige este ícono y guarda el cambio.",
  "Vuelve aquí y presiona «Ya lo cambié».",
];

const card = "flex flex-col gap-4 rounded-lg border border-borde-defecto bg-fondo-superficie p-5";

/** Step 2 (#26): the player sets a given icon so Riot confirms the account is theirs. */
async function OwnershipCheck({ account, userId }: { account: LinkedAccount; userId: string }) {
  const check = await startOwnershipCheck(userId).catch((error: unknown) => {
    console.error("starting the ownership check failed", { error: String(error) });
    return { status: "riot-unavailable" as const };
  });
  const iconSrc = check.status === "pending" ? await profileIconImage(check.iconId) : null;
  return (
    <section aria-labelledby="ownership-title" className={card}>
      <h2 id="ownership-title" className="font-display text-titulo-m font-bold">
        Comprueba que {formatRiotId(account)} ({account.region}) es tu cuenta
      </h2>
      {check.status === "pending" ? (
        <>
          <p className="text-cuerpo-m text-texto-secundario">
            Cambia tu ícono de perfil por este por un momento. Así sabemos que la cuenta es tuya y
            nadie más puede ver tus partidas.
          </p>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- Riot's CDN (Data Dragon) */}
            <img
              src={iconSrc ?? undefined}
              alt={`Ícono de perfil ${check.iconId}`}
              width={72}
              height={72}
              className="rounded-md border border-borde-defecto"
            />
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-cuerpo-m">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <OwnershipCheckForm />
        </>
      ) : (
        <p className="text-cuerpo-m text-texto-secundario">
          Riot no responde en este momento. Vuelve a abrir esta página en unos minutos.
        </p>
      )}
    </section>
  );
}

/** The verified account: games are imported in the background, and resumed on each visit. */
async function VerifiedRiotAccount({
  account,
  userId,
  justVerified,
}: {
  account: LinkedAccount;
  userId: string;
  justVerified: boolean;
}) {
  // The first import right after verifying, and the resume of one paused by Riot's rate
  // limit. Idempotent (automatic imports: #27).
  after(async () => {
    const outcome = await importRecentMatches(userId).catch((error: unknown) => ({
      status: `error: ${String(error)}`,
    }));
    if (outcome.status !== "done") console.info("match import", { status: outcome.status });
  });
  const stored = await countStoredMatches(userId);
  return (
    <section aria-labelledby="verified-title" className={card}>
      <h2 id="verified-title" className="font-display text-titulo-m font-bold">
        Cuenta comprobada: {formatRiotId(account)} ({account.region})
      </h2>
      {justVerified ? (
        <p role="status" className="text-cuerpo-m">
          Listo, ya comprobamos que la cuenta es tuya. Puedes volver a poner tu ícono de siempre.
        </p>
      ) : null}
      <p className="text-cuerpo-m text-texto-secundario">
        {stored === 0
          ? "Todavía no hay partidas ranked guardadas de los últimos 30 días. Si jugaste, aparecerán en unos minutos al volver a abrir el diario."
          : `Partidas ranked guardadas: ${stored}. Si falta alguna, la traemos la próxima vez que abras el diario.`}
      </p>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DIARY_PATH, getCurrentUser } from "@/modules/cuentas";
import { signInWith } from "./actions";

export const metadata: Metadata = {
  title: "Ingresar · Alamak",
  description: "Entra a tu diario de ranked con tu cuenta de Google, sin contraseña.",
};

// Session pages render per request: they redirect before showing anything.
export const instant = false;

const PROVIDERS = [{ id: "google", label: "Continuar con Google" }] as const;

export default async function SignInPage({ searchParams }: PageProps<"/ingresar">) {
  if (await getCurrentUser()) redirect(DIARY_PATH);
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-8 px-4 pt-6 pb-16 md:pt-16 md:pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-titulo-l font-bold md:text-display-titulo">
          Entra a tu diario
        </h1>
        <p className="text-cuerpo-l text-texto-secundario">
          Sin contraseña: usa la cuenta que ya tienes en Google.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-borde-defecto bg-fondo-superficie p-4 text-cuerpo-m"
        >
          {error === "sesion-vencida"
            ? "Tu sesión en este dispositivo ya había terminado, así que no pudimos cerrar las demás. Ingresa de nuevo y vuelve a intentarlo."
            : "No pudimos completar el ingreso. Vuelve a intentarlo."}
        </p>
      ) : null}

      <form action={signInWith} className="flex flex-col gap-3">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="submit"
            name="provider"
            value={provider.id}
            className="h-11 w-full cursor-pointer rounded-md border border-borde-fuerte bg-fondo-superficie px-4.5 text-etiqueta-m font-semibold"
          >
            {provider.label}
          </button>
        ))}
      </form>

      <p className="text-nota font-medium text-texto-secundario">
        Al ingresar aceptas que tratemos tus datos según la{" "}
        <Link href="/privacidad" className="text-marca-texto underline">
          política de privacidad
        </Link>
        .
      </p>
    </main>
  );
}

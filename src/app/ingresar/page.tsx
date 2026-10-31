import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  DIARY_PATH,
  getCurrentUser,
  SIGN_IN_PROVIDERS,
  type SignInProvider,
} from "@/modules/cuentas";
import { signInWith } from "./actions";
import { signInErrorMessage } from "./sign-in-errors";

export const metadata: Metadata = {
  title: "Ingresar · Alamak",
  description: "Entra a tu diario de ranked con tu cuenta de Google, sin contraseña.",
};

// Session pages render per request: they redirect before showing anything.
export const instant = false;

// Typed by the provider list, so adding a provider requires its button label.
const PROVIDER_LABELS: Record<SignInProvider, string> = {
  google: "Continuar con Google",
};

export default async function SignInPage({ searchParams }: PageProps<"/ingresar">) {
  if (await isSignedIn()) redirect(DIARY_PATH);
  const { error } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;

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

      {errorCode ? (
        <p
          role="alert"
          className="rounded-md border border-borde-defecto bg-fondo-superficie p-4 text-cuerpo-m"
        >
          {signInErrorMessage(errorCode)}
        </p>
      ) : null}

      <form action={signInWith} className="flex flex-col gap-3">
        {SIGN_IN_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="submit"
            name="provider"
            value={provider}
            className="h-11 w-full cursor-pointer rounded-md border border-borde-fuerte bg-fondo-superficie px-4.5 text-etiqueta-m font-semibold"
          >
            {PROVIDER_LABELS[provider]}
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

/** Whether a session exists; false also when it cannot be read, so the page shows and the player can retry. */
async function isSignedIn(): Promise<boolean> {
  try {
    return (await getCurrentUser()) !== null;
  } catch (error) {
    unstable_rethrow(error); // Next's own signals, such as the build marking the page dynamic.
    console.error("session check failed on sign-in page", { error });
    return false;
  }
}

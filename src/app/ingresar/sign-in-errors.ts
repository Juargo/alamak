// Codes in /ingresar?error=…; Better Auth also sends its own codes there after a failed
// return from the provider, and those get the generic message.
export const SIGN_IN_ERROR = {
  sessionExpired: "sesion-vencida",
  unavailable: "servicio",
  failed: "acceso",
} as const;

// A Map, because the code comes from the URL: a plain object would also answer inherited
// keys such as `__proto__`.
const MESSAGES = new Map<string, string>([
  [
    SIGN_IN_ERROR.sessionExpired,
    "Tu sesión en este dispositivo ya había terminado, así que no pudimos cerrar las demás. Ingresa de nuevo y vuelve a intentarlo.",
  ],
  [
    SIGN_IN_ERROR.unavailable,
    "No pudimos revisar tu sesión en este momento. Vuelve a intentarlo en unos minutos.",
  ],
]);

const GENERIC_MESSAGE = "No pudimos completar el ingreso. Vuelve a intentarlo.";

export function signInErrorMessage(code: string): string {
  return MESSAGES.get(code) ?? GENERIC_MESSAGE;
}

export function signInErrorPath(signInPath: string, code: string): string {
  return `${signInPath}?error=${code}`;
}

import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/modules/cuentas";

// Better Auth endpoints: OAuth callbacks, session and sign-out (ADR-0017).
export function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}

import { connection } from "next/server";
import { isDatabaseReachable } from "@/shared/db/database-health";

export async function GET() {
  await connection();
  const database = await isDatabaseReachable().catch(() => false);
  return Response.json({ ok: database, database }, { status: database ? 200 : 503 });
}

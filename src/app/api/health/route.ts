import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

/**
 * Prontidão. `migracoes` é quantas migrações o banco deste ambiente já aplicou, e serve para
 * conferir de fora, sem credencial, se um deploy migrou o banco: o número tem que bater com a
 * contagem de arquivos em drizzle/. Quando o build não roda o bootstrap, o banco fica para trás
 * e o número denuncia, em vez de o erro aparecer no meio de uma aula. Nenhum dado sensível sai daqui.
 */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    let migracoes: number | null = null;
    try {
      const r = await db.execute<{ n: string }>(sql`select count(*)::text as n from drizzle.__drizzle_migrations`);
      migracoes = Number((r.rows?.[0] as { n?: string } | undefined)?.n ?? NaN);
      if (!Number.isFinite(migracoes)) migracoes = null;
    } catch { migracoes = null; }
    return NextResponse.json({ ok: true, db: true, migracoes, time: new Date().toISOString() });
  } catch { return NextResponse.json({ ok: false, db: false }, { status: 503 }); }
}

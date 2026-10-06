import { request, type APIRequestContext, type Page } from "@playwright/test";
import { Client } from "pg";

export const BASE = process.env.APP_URL ?? "http://localhost:3000";
export const PROF = { email: "genaro.lins@gmail.com", password: "professor-dev-2026" };
export const ALUNO_A = { email: "aluno.a@example.test", password: "aluno-a-dev-2026" };
export const ALUNO_B = { email: "aluno.b@example.test", password: "aluno-b-dev-2026" };
export const OUTRA = { email: "aluno.outra@example.test", password: "aluno-outra-2026" };
export const MONITOR = { email: "monitor@example.test", password: "monitor-dev-2026" };
export const SEM = { email: "sem.matricula@example.test", password: "sem-matricula-2026" };

export async function apiAs(creds: { email: string; password: string } | null): Promise<APIRequestContext> {
  const ctx = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { "x-requested-with": "fetch" } });
  if (creds) {
    const r = await ctx.post("/api/auth/login", { data: creds });
    if (!r.ok()) throw new Error(`login falhou para ${creds.email}: ${await r.text()}`);
  }
  return ctx;
}

export async function loginUi(page: Page, creds: { email: string; password: string }) {
  await page.goto("/entrar");
  await page.fill("input[name=email]", creds.email);
  await page.fill("input[name=password]", creds.password);
  await page.click("button[type=submit]");
  await page.waitForURL((u) => !u.toString().includes("/entrar"));
}

export async function sql<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
  const c = new Client({ connectionString: process.env.DATABASE_URL ?? "postgres://curso:curso@localhost:5432/curso_dev" });
  await c.connect();
  try { const r = await c.query(query, params); return r.rows as T[]; } finally { await c.end(); }
}

export async function classId(code = "2026-A") {
  const rows = await sql<{ id: string }>("select id from classes where code=$1", [code]);
  return rows[0].id;
}
export const uid = () => Math.random().toString(36).slice(2, 10);
/**
 * Trabalho genérico para os testes de envio e nota. As entregas por aula (entrega-aula-N) saíram da visão do
 * aluno em 06/10/2026 e não servem mais para isso; este trabalho é criado uma vez pelo professor e reaproveitado.
 */
export async function trabalhoDeTeste(prof: APIRequestContext, cid: string): Promise<{ id: string }> {
  const lista = (await (await prof.get(`/api/professor/turmas/${cid}/trabalhos`)).json()).assignments as { id: string; slug: string }[];
  const achado = lista.find((a) => a.slug === "e2e-trabalho");
  if (achado) return achado;
  const r = await prof.post(`/api/professor/turmas/${cid}/trabalhos`, { data: { title: "Trabalho de teste (e2e)", slug: "e2e-trabalho", mode: "individual" } });
  return { id: (await r.json()).id };
}

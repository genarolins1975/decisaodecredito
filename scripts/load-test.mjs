/**
 * Carga representativa: N alunos simultâneos entrando na sessão, consultando o estado e respondendo.
 * Cria contas de teste temporárias (example.test), nunca envia e-mail. Uso: node scripts/load-test.mjs [N=100]
 * Requer o servidor em APP_URL e DATABASE_URL apontando para o mesmo banco.
 */
import pg from "pg";
import { performance } from "node:perf_hooks";
import { createHash, randomUUID } from "node:crypto";
const N = Number(process.argv[2] ?? 100);
const B = process.env.APP_URL ?? "http://localhost:3000";
const H = { "content-type": "application/json", "x-requested-with": "fetch" };
const client = new pg.Client({ connectionString: process.env.DATABASE_URL ?? "postgres://curso:curso@localhost:5432/curso_dev" }); await client.connect();
const jar = (cookie) => ({ ...H, cookie });
async function login(email, password) { const r = await fetch(`${B}/api/auth/login`, { method: "POST", headers: H, body: JSON.stringify({ email, password }) }); if (!r.ok) throw new Error("login " + email); return r.headers.get("set-cookie").split(";")[0]; }
const prof = await login("genaro.lins@gmail.com", process.env.SEED_PROFESSOR_PASSWORD ?? "professor-dev-2026");
const { rows: [{ id: cid }] } = await client.query("select id from classes where code='2026-A'");
// contas de carga (senha conhecida, hash argon2 gerado uma vez pelo app via /api não existe: inserimos via SQL com hash pré-calculado pela lib)
const { hash } = await import("@node-rs/argon2");
const pwHash = await hash("carga-2026", { memoryCost: 19456, timeCost: 2, parallelism: 1 });
const emails = [];
for (let i = 0; i < N; i++) {
  const email = `carga${i}@example.test`; emails.push(email);
  const id = createHash("sha1").update(email).digest("hex").slice(0, 21);
  await client.query("insert into users (id,email,name,password_hash,must_change_password,email_verified_at) values ($1,$2,$3,$4,false,now()) on conflict (email) do nothing", [id, email, `Carga ${i}`, pwHash]);
  await client.query("insert into enrollments (id,class_id,user_id,email,name,role,status,activated_at) values ($1,$2,(select id from users where email=$3),$3,$4,'aluno','ativo',now()) on conflict (class_id,email) do nothing", [id + "e", cid, email, `Carga ${i}`]);
}
// sessão e atividade
const meetings = await (await fetch(`${B}/api/professor/turmas/${cid}/encontros`, { headers: jar(prof) })).json();
const mid = meetings.meetings[0].id;
const { sessionId } = await (await fetch(`${B}/api/professor/turmas/${cid}/encontros/${mid}/sessao`, { method: "POST", headers: jar(prof), body: "{}" })).json();
await fetch(`${B}/api/aovivo/${sessionId}/status`, { method: "POST", headers: jar(prof), body: JSON.stringify({ status: "open" }) });
const { rows: [{ current_version_id: qv }] } = await client.query("select current_version_id from questions where slug='c3p7q' and edition_id=(select edition_id from classes where id=$1)", [cid]);
const { activityId } = await (await fetch(`${B}/api/aovivo/${sessionId}/atividades`, { method: "POST", headers: jar(prof), body: JSON.stringify({ questionVersionId: qv, pageSlug: "c3p7" }) })).json();
await fetch(`${B}/api/aovivo/${sessionId}/atividades/${activityId}`, { method: "PATCH", headers: jar(prof), body: JSON.stringify({ status: "open", maxAttempts: 1 }) });

const lat = { login: [], estado: [], responder: [], pagina: [] };
const timed = async (k, fn) => { const t = performance.now(); const r = await fn(); lat[k].push(performance.now() - t); return r; };
const t0 = performance.now();
const results = await Promise.all(emails.map(async (email, i) => {
  try {
    const c = await timed("login", () => login(email, "carga-2026"));
    await timed("estado", async () => { const r = await fetch(`${B}/api/aovivo/${sessionId}/estado`, { headers: jar(c) }); if (!r.ok) throw new Error("estado " + r.status); });
    await timed("pagina", async () => { const r = await fetch(`${B}/api/conteudo/pagina/c3p7?classId=${cid}`, { headers: jar(c) }); if (!r.ok) throw new Error("pagina " + r.status); });
    const r = await timed("responder", () => fetch(`${B}/api/aovivo/${sessionId}/responder`, { method: "POST", headers: jar(c), body: JSON.stringify({ activityId, answer: { choice: i % 3 }, clientRequestId: randomUUID() }) }));
    return r.ok ? "ok" : `responder ${r.status}`;
  } catch (e) { return String(e.message); }
}));
const total = performance.now() - t0;
const p = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]?.toFixed(0); };
const ok = results.filter((r) => r === "ok").length;
const { rows: [{ n }] } = await client.query("select count(*)::int as n from attempts where activity_id=$1", [activityId]);
console.log(JSON.stringify({ alunos: N, sucesso: ok, falhas: results.filter((r) => r !== "ok").slice(0, 5), tentativasGravadas: n, totalMs: Math.round(total),
  latenciaMs: Object.fromEntries(Object.entries(lat).map(([k, v]) => [k, { p50: p(v, .5), p95: p(v, .95), max: p(v, 1) }])), ambiente: { node: process.version, cpus: (await import("node:os")).cpus().length, modo: process.env.NODE_ENV ?? "dev" } }, null, 1));
await fetch(`${B}/api/aovivo/${sessionId}/status`, { method: "POST", headers: jar(prof), body: JSON.stringify({ status: "closed" }) });
await client.end();

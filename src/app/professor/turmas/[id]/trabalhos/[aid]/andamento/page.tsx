import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClassAccess } from "@/lib/auth/guard";
import { andamentoDoTrabalho, ETAPAS, type AndamentoAluno, type Etapa } from "@/lib/services/andamento";
import { Badge, StatusBadge } from "@/components/ui";
import { fmtDT, relative } from "@/lib/time";

export const metadata: Metadata = { title: "Andamento por aluno" };

const TOM_ETAPA: Record<Etapa, "alert" | "warn" | "ok" | "muted" | "ink"> = {
  sem_acesso: "alert", sem_grupo: "alert", sem_base: "alert", falta_congelar: "warn", congelado: "warn", oot_baixado: "warn", previsoes_enviadas: "ok",
};
const TOM_MISSAO: Record<string, "muted" | "warn" | "ok" | "ink"> = { pendente: "muted", em_andamento: "warn", concluida: "ok", validada: "ink" };
const ROTULO_MISSAO: Record<string, string> = { pendente: "pendente", em_andamento: "em andamento", concluida: "concluída", validada: "validada" };
const MATRICULA: Record<string, string> = { autorizado: "autorizado, convite ainda não aceito", convidado: "convidado, conta ainda não ativada", suspenso: "matrícula suspensa" };
const semAcento = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Andamento de cada aluno no trabalho: onde está no percurso, o que já fez (com data) e o próximo passo.
 * Responde perguntas como "o que a Michelle já concluiu?" sem abrir o painel de cada grupo.
 */
export default async function AndamentoPage({ params, searchParams }: { params: Promise<{ id: string; aid: string }>; searchParams: Promise<{ q?: string; etapa?: string }> }) {
  const { id, aid } = await params;
  const { q = "", etapa = "" } = await searchParams;
  await requireClassAccess(id, ["professor"]);
  let dados;
  try { dados = await andamentoDoTrabalho(id, aid); } catch { notFound(); }
  const { assignment, alunos, totalMissoes, livre } = dados;
  const busca = semAcento(q.trim());
  const filtrados = alunos.filter((a) => (!busca || semAcento(`${a.nome} ${a.email}`).includes(busca)) && (!etapa || a.testeCego?.etapa === etapa));
  const base = `/professor/turmas/${id}/trabalhos/${aid}/andamento`;
  const link = (e: string) => `${base}?${new URLSearchParams({ ...(q ? { q } : {}), ...(e ? { etapa: e } : {}) })}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href={`/professor/turmas/${id}/trabalhos/${aid}`} className="voltar">{assignment.title}</Link>
        <h2 className="text-xl mt-1">Andamento por aluno</h2>
        <p className="hint mt-1 max-w-[80ch]">Uma linha por aluno com matrícula vigente (as encerradas não entram). O andamento das missões é o que o grupo marcou na página do trabalho; &quot;validada&quot; é a missão conferida pelo professor. Downloads, manifestos e previsões vêm do registro de auditoria, com data e autor.</p>
      </div>

      <form method="get" action={base} className="flex flex-wrap items-end gap-2">
        <label className="text-[13px]">Buscar aluno<input name="q" defaultValue={q} className="input min-w-[260px]" placeholder="nome ou e-mail" /></label>
        {etapa && <input type="hidden" name="etapa" value={etapa} />}
        <button className="btn btn-sm" type="submit">Buscar</button>
        {(q || etapa) && <Link href={base} className="btn btn-sm btn-ghost">Limpar</Link>}
      </form>

      {assignment.blindTestEnabled && (
        <nav aria-label="Alunos por etapa do teste cego" className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {ETAPAS.map((e) => {
            const n = alunos.filter((a) => a.testeCego?.etapa === e.chave).length;
            const ativo = etapa === e.chave;
            return (
              <Link key={e.chave} href={link(ativo ? "" : e.chave)} aria-current={ativo ? "true" : undefined}
                className={`card-flat no-underline flex flex-col gap-1 ${ativo ? "border-gold" : ""}`}>
                <span className="font-serif text-ink font-bold text-[26px] tabular-nums leading-none">{n}</span>
                <span className="text-[13px] text-ink">{e.chave === "congelado" && livre ? "OOT liberado, não baixado" : e.rotulo}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <p className="hint">{filtrados.length} de {alunos.length} aluno(s){etapa ? ` na etapa "${ETAPAS.find((e) => e.chave === etapa)?.rotulo ?? etapa}"` : ""}{q ? ` com "${q}"` : ""}.</p>

      <ul className="list-none p-0 m-0 grid gap-3">
        {filtrados.map((a) => <AlunoCard key={a.email} a={a} total={totalMissoes} aberto={filtrados.length === 1} livre={livre} />)}
        {filtrados.length === 0 && <li className="hint">Nenhum aluno com esse filtro.</li>}
      </ul>
    </div>
  );
}

function AlunoCard({ a, total, aberto, livre }: { a: AndamentoAluno; total: number; aberto: boolean; livre: boolean }) {
  const tc = a.testeCego;
  const etapa = tc ? ETAPAS.find((e) => e.chave === tc.etapa)! : null;
  const feito: { quando: string | null; texto: string }[] = [];
  if (tc?.baixouBase) feito.push({ quando: tc.baixouBase, texto: "Baixou a base de desenvolvimento" });
  if (tc && tc.manifestosEnviados > 0) feito.push({ quando: tc.ultimoManifesto, texto: `Enviou ${tc.manifestosEnviados} arquivo(s) de manifesto (data do último)` });
  if (tc?.congelado) feito.push({ quando: tc.congelado.em, texto: `Grupo congelou o modelo (versão ${tc.congelado.versao}, ${tc.congelado.hashes} hash(es))` });
  if (tc?.baixouOot) feito.push({ quando: tc.baixouOot, texto: "Baixou o OOT sem desfecho" });
  else if (tc?.ootDoGrupo) feito.push({ quando: tc.ootDoGrupo, texto: "Um colega do grupo baixou o OOT sem desfecho" });
  if (tc && tc.previsoesRecusadas > 0) feito.push({ quando: tc.ultimaRecusa, texto: `Teve ${tc.previsoesRecusadas} arquivo(s) de previsões recusado(s) na validação (data do último)` });
  for (const p of tc?.previsoes ?? []) feito.push({ quando: p.em, texto: `Previsões OOT, submissão ${p.n}: ${p.valida ? "válida" : "inválida"}` });
  if (a.entrega?.enviadaEm) feito.push({ quando: a.entrega.enviadaEm, texto: `Entrega v${a.entrega.versao} (${a.entrega.arquivos} arquivo(s))${a.entrega.atraso ? ", com atraso" : ""}` });
  feito.sort((x, y) => (x.quando ?? "").localeCompare(y.quando ?? ""));

  return (
    <li className="card p-0">
      <details open={aberto}>
        <summary className="cursor-pointer p-4 grid gap-x-4 gap-y-2 items-center grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <span className="col-span-2 lg:col-span-1 min-w-0">
            <b className="text-ink">{a.nome}</b>
            <span className="hint block truncate">{a.email}{a.matricula !== "ativo" ? ` · ${MATRICULA[a.matricula] ?? `matrícula ${a.matricula}`}` : ""}</span>
          </span>
          <span className="text-[13.5px]">{a.grupo ? <>{a.grupo.nome}<span className="hint block">base {a.grupo.base ?? "não atribuída"}</span></> : <span className="hint">sem grupo</span>}</span>
          <span className="text-[13.5px] tabular-nums"><b>{a.concluidas}</b> de {total} missões<span className="hint block">{a.emAndamento} em andamento</span></span>
          <span>{etapa && <Badge tone={TOM_ETAPA[etapa.chave]}>{etapa.chave === "congelado" && livre ? "OOT liberado, não baixado" : etapa.rotulo}</Badge>}</span>
          <span className="hint text-[13px]">{a.ultimoAcesso ? <>último acesso {relative(a.ultimoAcesso)}</> : "nunca acessou"}</span>
        </summary>
        <div className="border-t border-rule p-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section aria-label={`Missões de ${a.nome}`}>
            <h3 className="text-base mb-2">Missões</h3>
            <ol className="list-none p-0 m-0 grid gap-1">
              {a.missoes.map((m) => (
                <li key={m.numero} className="flex flex-wrap items-center gap-2 text-[13.5px]">
                  <span className="w-6 h-6 rounded-full grid place-items-center bg-ink text-white font-mono text-[11px] font-bold shrink-0">{m.numero}</span>
                  <span className="flex-1 min-w-[160px]">{m.titulo}</span>
                  <Badge tone={TOM_MISSAO[m.status] ?? "muted"}>{ROTULO_MISSAO[m.status] ?? m.status}</Badge>
                  {m.em && m.status !== "pendente" && <span className="hint">{fmtDT(m.em)}</span>}
                  {m.nota && <span className="hint basis-full pl-8">{m.nota}</span>}
                </li>
              ))}
              {a.missoes.length === 0 && <li className="hint">Trabalho sem missões cadastradas.</li>}
            </ol>
          </section>
          <section aria-label={`O que ${a.nome} já fez`}>
            <h3 className="text-base mb-2">O que já fez</h3>
            {feito.length ? (
              <ul className="list-none p-0 m-0 grid gap-1 text-[13.5px]">
                {feito.map((f, i) => <li key={i}><span className="hint tabular-nums">{f.quando ? fmtDT(f.quando) : "sem data"}</span> · {f.texto}</li>)}
              </ul>
            ) : <p className="hint">Nenhum download, congelamento, previsão ou entrega registrado.</p>}
            <p className="mt-3 text-[13.5px]"><b>Entrega:</b> {a.entrega ? <><StatusBadge status={a.entrega.status} /> versão {a.entrega.versao}</> : <span className="hint">nenhuma versão iniciada</span>}</p>
            {a.nota && <p className="mt-1 text-[13.5px]"><b>Nota:</b> {a.nota.total ?? "sem nota"} · {a.nota.publicada ? "publicada" : "não publicada"}</p>}
            {a.grupo && a.grupo.colegas.length > 0 && <p className="mt-1 text-[13.5px]"><b>Colegas de grupo:</b> {a.grupo.colegas.join(", ")}</p>}
            {etapa && <p className="mt-3 text-[13.5px]"><b>Próximo passo:</b> {etapa.chave === "congelado" && livre ? "Baixar o OOT sem desfecho." : etapa.proximo}</p>}
          </section>
        </div>
      </details>
    </li>
  );
}

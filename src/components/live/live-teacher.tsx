"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLiveState } from "@/lib/client/use-live";
import { api, ClientApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/ui";
import { ErrorBox } from "@/components/forms";
import { fmtT } from "@/lib/time";

type Act = { id: string; status: string; round: string; closesAt: string | null; maxAttempts: number; timeLimitS: number | null; position: number;
  question: { versionId: string; slug: string; kind: string; label: string | null; prompt: string; options: { alternatives?: string[] } };
  answerKey: { correct: number | number[] | null }; respondents: number; correct: number; distribution: number[];
  names: { name: string; userId: string; answer: unknown; isCorrect: boolean | null; at: string | null }[]; texts: { name: string; text: string; isCorrect: boolean | null }[] };
type State = { session: { id: string; status: string; stateVersion: number; classId: string; meetingId: string }; currentPage: { slug: string; title: string } | null; enrolled: number; activities: Act[] };
type PageRef = { id: string; slug: string; title: string; chapter: number };
type QRef = { slug: string; kind: string; pageId: string | null; versionId: string; prompt: string };

export function LiveTeacher({ sessionId, classId, meeting, initial, pages, questions, isProfessor }: { sessionId: string; classId: string; meeting: { id: string; title: string; number: number }; initial: State; pages: PageRef[]; questions: QRef[]; isProfessor: boolean }) {
  const { state, channel, refresh } = useLiveState<State>(sessionId, initial);
  const st = state ?? initial;
  const [err, setErr] = useState<string | null>(null);
  const [privateNames, setPrivateNames] = useState(false);
  const [pageSlug, setPageSlug] = useState(st.currentPage?.slug ?? pages[0]?.slug ?? "");
  const [chamada, setChamada] = useState<{ id: string; code: string; secondsLeft: number; closesAt: string; kind: string }[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(10);
  const [lateAfter, setLateAfter] = useState(0);
  const run = async (fn: () => Promise<void>) => { setErr(null); try { await fn(); await refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };
  const currentPage = useMemo(() => pages.find((p) => p.slug === pageSlug), [pages, pageSlug]);
  const pageQuestions = useMemo(() => questions.filter((q) => q.pageId && currentPage && q.pageId === currentPage.id), [questions, currentPage]);

  // código de chamada (rotativo)
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    const load = async () => { try { const d = await api<{ windows: { id: string; code: string; secondsLeft: number; closesAt: string; kind: string }[] }>(`/api/aovivo/${sessionId}/checkin`); setChamada(d.windows); if (d.windows[0]) { const QR = (await import("qrcode")).default; setQr(await QR.toDataURL(`${location.origin}/ao-vivo/${sessionId}?codigo=${d.windows[0].code}`, { margin: 1, width: 220, color: { dark: "#00205B", light: "#FFFFFF" } })); } else setQr(null); } catch { /* sem chamada */ } };
    load(); t = setInterval(load, 5000); return () => clearInterval(t);
  }, [sessionId]);

  const kindLabel: Record<string, string> = { single: "alternativa única", multi: "múltiplas alternativas", numeric: "numérica", short_text: "texto curto", credit_decision: "decisão de crédito", simulator_output: "saída de simulador", predict: "previsão" };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div><p className="eyebrow">Encontro {meeting.number} · painel do professor</p><h1 className="text-xl">{meeting.title}</h1></div>
          <StatusBadge status={st.session.status} />
          <span className="hint">{channel === "sse" ? "tempo real" : "atualização periódica"} · {st.enrolled} alunos ativos na turma</span>
          <div className="flex-1" />
          {isProfessor && st.session.status !== "open" && <button className="btn btn-sm" onClick={() => run(async () => { await api(`/api/aovivo/${sessionId}/status`, { body: { status: "open" } }); })}>Abrir sessão</button>}
          {isProfessor && st.session.status === "open" && <button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Encerrar a sessão? Atividades abertas serão encerradas.")) run(async () => { await api(`/api/aovivo/${sessionId}/status`, { body: { status: "closed" } }); }); }}>Encerrar sessão</button>}
        </div>
        <ErrorBox message={err} />

        <section className="card" aria-labelledby="slide">
          <h2 id="slide" className="text-base mb-2">Slide apresentado</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-[13px] flex-1 min-w-[260px]">Página<select className="select" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)}>{pages.map((p) => <option key={p.id} value={p.slug}>{p.slug} · cap. {p.chapter} · {p.title}</option>)}</select></label>
            <button className="btn btn-sm" onClick={() => run(async () => { await api(`/api/aovivo/${sessionId}/pagina`, { body: { pageSlug } }); })}>Apresentar esta página</button>
            <Link href={`/apresentacao/${pageSlug}?sessao=${sessionId}`} className="btn btn-sm btn-secondary" target="_blank" rel="noreferrer">Abrir projeção (sincroniza ao navegar)</Link>
          </div>
          <p className="hint mt-2">Atual para os alunos: {st.currentPage ? `${st.currentPage.slug} · ${st.currentPage.title}` : "nenhuma"}</p>
        </section>

        <section className="card" aria-labelledby="pub">
          <h2 id="pub" className="text-base mb-2">Publicar questão</h2>
          <div className="flex flex-col gap-2">
            {pageQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 items-end">
                <label className="text-[13px] flex-1 min-w-[260px]">Questões desta página<select id="qsel" className="select">{pageQuestions.map((q) => <option key={q.versionId} value={q.versionId}>{q.slug} · {kindLabel[q.kind] ?? q.kind} · {q.prompt.slice(0, 80)}</option>)}</select></label>
                <label className="text-[13px]">Rodada<select id="qround" className="select"><option value="unica">única</option><option value="antes">antes da discussão</option><option value="depois">depois da discussão</option></select></label>
                <button className="btn btn-sm" onClick={() => run(async () => { const sel = (document.getElementById("qsel") as HTMLSelectElement).value; const round = (document.getElementById("qround") as HTMLSelectElement).value; await api(`/api/aovivo/${sessionId}/atividades`, { body: { questionVersionId: sel, pageSlug, round } }); })}>Adicionar (rascunho)</button>
              </div>
            )}
            <AdHoc sessionId={sessionId} pageSlug={pageSlug} onDone={refresh} />
          </div>
        </section>

        <section aria-labelledby="acts">
          <div className="flex items-center gap-3 mb-2"><h2 id="acts" className="text-base">Atividades da sessão</h2><label className="text-[13px] flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-ink" checked={privateNames} onChange={(e) => setPrivateNames(e.target.checked)} />Painel privado com nomes (não projete)</label></div>
          <div className="flex flex-col gap-3">
            {st.activities.length === 0 && <p className="hint">Nenhuma atividade ainda.</p>}
            {st.activities.map((a) => <ActivityCard key={a.id} a={a} sessionId={sessionId} privateNames={privateNames} run={run} />)}
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <section className="card" aria-labelledby="chamada">
          <h2 id="chamada" className="text-base mb-2">Chamada</h2>
          {chamada.length ? (
            <div className="text-center">
              <p className="eyebrow">código atual · renova em {chamada[0].secondsLeft}s</p>
              <p className="font-mono text-5xl font-bold text-ink tracking-[.2em] my-2" aria-live="polite">{chamada[0].code}</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- QR gerado no servidor como data URL; otimização de imagem não se aplica */}
              {qr && <img src={qr} alt="QR code com o link da sessão e o código atual" className="mx-auto" width={220} height={220} />}
              <p className="hint mt-2">aberta até {fmtT(chamada[0].closesAt)}. O código pode ser compartilhado por mensagem: confira a sala e valide manualmente no mapa de frequência quando necessário.</p>
              <button className="btn btn-sm btn-ghost mt-2" onClick={() => run(async () => { await api(`/api/professor/turmas/${classId}/chamadas/${chamada[0].id}`, { method: "DELETE" }); setChamada([]); })}>Fechar chamada</button>
            </div>
          ) : (
            <div className="form-grid">
              <label className="text-[13px]">Duração (min)<input type="number" className="input" min={1} max={240} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></label>
              <label className="text-[13px]">Atraso a partir de (min, 0 = sem regra)<input type="number" className="input" min={0} max={240} value={lateAfter} onChange={(e) => setLateAfter(Number(e.target.value))} /></label>
              <button className="btn btn-sm" onClick={() => run(async () => { await api(`/api/professor/turmas/${classId}/encontros/${meeting.id}/chamada`, { body: { minutes, lateAfterMinutes: lateAfter || null } }); const d = await api<{ windows: typeof chamada }>(`/api/aovivo/${sessionId}/checkin`); setChamada(d.windows); })}>Abrir chamada com código</button>
              <p className="hint">Check-in exige aluno autenticado, matrícula ativa, janela aberta e código válido, tudo validado no servidor. Sem câmera, biometria ou localização.</p>
            </div>
          )}
          <Link href={`/professor/turmas/${classId}/frequencia`} className="hint block mt-3">Mapa de frequência e validação docente</Link>
        </section>
      </aside>
    </div>
  );
}

function ActivityCard({ a, sessionId, privateNames, run }: { a: Act; sessionId: string; privateNames: boolean; run: (fn: () => Promise<void>) => Promise<void> }) {
  const alts = a.question.options.alternatives ?? [];
  const max = Math.max(1, ...a.distribution);
  const [limit, setLimit] = useState<string>(a.timeLimitS ? String(a.timeLimitS) : "");
  const [attempts, setAttempts] = useState<number>(a.maxAttempts);
  const set = (status: "open" | "closed" | "released") => run(async () => { await api(`/api/aovivo/${sessionId}/atividades/${a.id}`, { method: "PATCH", body: { status, timeLimitS: limit ? Number(limit) : null, maxAttempts: attempts } }); });
  const correct = typeof a.answerKey.correct === "number" ? a.answerKey.correct : null;
  return (
    <article className="card">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={a.status} />{a.round !== "unica" && <span className="badge badge-ink">rodada {a.round}</span>}
        <span className="hint">{a.question.slug} · {a.respondents} resposta(s){correct !== null || a.question.kind === "numeric" ? ` · ${a.correct} correta(s)` : ""}{a.closesAt && a.status === "open" ? ` · fecha ${fmtT(a.closesAt)}` : ""}</span>
        <div className="flex-1" />
        {a.status === "draft" && <><input className="input max-w-[110px]" placeholder="tempo (s)" value={limit} onChange={(e) => setLimit(e.target.value)} aria-label="Tempo limite em segundos" /><input type="number" className="input max-w-[90px]" min={1} max={10} value={attempts} onChange={(e) => setAttempts(Number(e.target.value))} aria-label="Tentativas" /><button className="btn btn-sm" onClick={() => set("open")}>Abrir</button></>}
        {a.status === "open" && <button className="btn btn-sm btn-secondary" onClick={() => set("closed")}>Encerrar</button>}
        {a.status === "closed" && <><button className="btn btn-sm btn-ghost" onClick={() => set("open")}>Reabrir</button><button className="btn btn-sm" onClick={() => set("released")}>Liberar resultados</button></>}
        {a.status === "released" && <button className="btn btn-sm btn-ghost" onClick={() => set("open")}>Reabrir (nova rodada)</button>}
      </div>
      <p className="font-semibold text-ink mt-2">{a.question.prompt}</p>
      {alts.length > 0 && (
        <ol className="mt-2 list-none p-0 m-0 grid gap-1" aria-label="Distribuição das respostas (agregada)">
          {alts.map((alt, i) => (
            <li key={i} className="grid grid-cols-[1fr_auto] gap-2 items-center text-[14px]">
              <div>
                <div className="flex justify-between"><span>{correct === i && a.status === "released" ? <b className="text-ok">✓ </b> : null}{alt}</span><span className="hint">{a.distribution[i] ?? 0}</span></div>
                <div className="h-2 bg-rule rounded"><div className={`h-2 rounded ${correct === i && a.status !== "draft" ? "bg-ok" : "bg-ink"}`} style={{ width: `${((a.distribution[i] ?? 0) / max) * 100}%` }} /></div>
              </div>
            </li>
          ))}
        </ol>
      )}
      {a.texts.length > 0 && !privateNames && <p className="hint mt-2">{a.texts.length} resposta(s) em texto. Ative o painel privado para ler com nomes.</p>}
      {privateNames && a.names.length > 0 && (
        <div className="mt-3 border-t border-gold pt-2 bg-gold-soft/30 rounded p-2">
          <p className="eyebrow mb-1">Painel privado · não projetar</p>
          <ul className="text-[13px] list-none p-0 m-0 grid gap-1 max-h-[240px] overflow-auto">
            {a.names.map((n) => <li key={n.userId}><b>{n.name}</b>: {formatAnswer(n.answer, alts)} {n.isCorrect === true ? <span className="text-ok">✓</span> : n.isCorrect === false ? <span className="text-alert">✗</span> : null}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}

function formatAnswer(ans: unknown, alts: string[]) {
  const a = ans as { choice?: number; choices?: number[]; text?: string; value?: number; decision?: string; justification?: string };
  if (typeof a.choice === "number") return alts[a.choice] ?? String(a.choice);
  if (Array.isArray(a.choices)) return a.choices.map((c) => alts[c] ?? c).join("; ");
  if (typeof a.value === "number") return String(a.value);
  if (a.decision) return `${a.decision}: ${a.justification ?? ""}`;
  return a.text ?? JSON.stringify(ans);
}

function AdHoc({ sessionId, pageSlug, onDone }: { sessionId: string; pageSlug: string; onDone: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("single");
  const [prompt, setPrompt] = useState("");
  const [alts, setAlts] = useState("");
  const [correct, setCorrect] = useState("");
  const [expected, setExpected] = useState("");
  const [tol, setTol] = useState("");
  const [unit, setUnit] = useState("");
  const [err, setErr] = useState<string | null>(null);
  if (!open) return <button className="btn btn-sm btn-ghost self-start" onClick={() => setOpen(true)}>Criar questão nova nesta sessão</button>;
  return (
    <form className="panel-soft form-grid" onSubmit={async (e) => {
      e.preventDefault(); setErr(null);
      const alternatives = alts.split("\n").map((s) => s.trim()).filter(Boolean);
      const options: Record<string, unknown> = {};
      let answerKey: Record<string, unknown> | undefined;
      if (["single", "multi", "predict"].includes(kind)) { if (alternatives.length < 2) { setErr("Informe ao menos duas alternativas (uma por linha)."); return; } options.alternatives = alternatives; if (kind === "single" && correct) answerKey = { correct: Number(correct) - 1 }; if (kind === "multi" && correct) answerKey = { correct: correct.split(",").map((s) => Number(s.trim()) - 1) }; }
      if (kind === "numeric") { options.unit = unit; answerKey = expected ? { expected: Number(expected.replace(",", ".")), tolerance: Number(tol.replace(",", ".") || 0), unit } : undefined; }
      try { await api(`/api/aovivo/${sessionId}/atividades`, { body: { pageSlug, newQuestion: { kind, prompt, options, answerKey } } }); setOpen(false); setPrompt(""); setAlts(""); await onDone(); } catch (ex) { setErr(ex instanceof ClientApiError ? ex.message : "Falha"); }
    }}>
      <ErrorBox message={err} />
      <label className="text-[13px]">Tipo<select className="select" value={kind} onChange={(e) => setKind(e.target.value)}><option value="single">alternativa única</option><option value="multi">múltiplas alternativas</option><option value="numeric">numérica com unidade e tolerância</option><option value="short_text">texto curto</option><option value="credit_decision">decisão de crédito com justificativa</option><option value="predict">previsão (sem gabarito)</option></select></label>
      <label className="text-[13px]">Enunciado<textarea className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} required /></label>
      {["single", "multi", "predict"].includes(kind) && <label className="text-[13px]">Alternativas (uma por linha)<textarea className="textarea" value={alts} onChange={(e) => setAlts(e.target.value)} /></label>}
      {kind === "single" && <label className="text-[13px]">Correta (número da linha, opcional)<input className="input max-w-[120px]" value={correct} onChange={(e) => setCorrect(e.target.value)} /></label>}
      {kind === "multi" && <label className="text-[13px]">Corretas (números separados por vírgula)<input className="input max-w-[200px]" value={correct} onChange={(e) => setCorrect(e.target.value)} /></label>}
      {kind === "numeric" && <div className="flex gap-2 flex-wrap"><label className="text-[13px]">Valor esperado<input className="input" value={expected} onChange={(e) => setExpected(e.target.value)} /></label><label className="text-[13px]">Tolerância ±<input className="input" value={tol} onChange={(e) => setTol(e.target.value)} /></label><label className="text-[13px]">Unidade<input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="%, R$, dias" /></label></div>}
      <div className="flex gap-2"><button className="btn btn-sm" type="submit">Adicionar (rascunho)</button><button className="btn btn-sm btn-ghost" type="button" onClick={() => setOpen(false)}>Cancelar</button></div>
    </form>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLiveState } from "@/lib/client/use-live";
import { api, ClientApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/ui";
import { ErrorBox } from "@/components/forms";
import { fmtT } from "@/lib/time";
import type { NotaSlideAula2, SlideAula2 } from "@/lib/content/roteiro-aula-2";

type Act = { id: string; status: string; round: string; closesAt: string | null; maxAttempts: number; timeLimitS: number | null; position: number;
  question: { versionId: string; slug: string; kind: string; label: string | null; prompt: string; options: { alternatives?: string[] } };
  answerKey: { correct: number | number[] | null }; respondents: number; correct: number; distribution: number[];
  names: { name: string; userId: string; answer: unknown; isCorrect: boolean | null; at: string | null }[]; texts: { name: string; text: string; isCorrect: boolean | null }[] };
type State = { session: { id: string; status: string; stateVersion: number; classId: string; meetingId: string }; currentPage: { slug: string; title: string } | null; currentSlide: string | null; enrolled: number; activities: Act[] };
type PageRef = { id: string; slug: string; title: string; chapter: number };
type QRef = { slug: string; kind: string; pageId: string | null; versionId: string; prompt: string };

export function LiveTeacher({ sessionId, classId, meeting, initial, pages, questions, isProfessor, slides, notas = {} }: { sessionId: string; classId: string; meeting: { id: string; title: string; number: number }; initial: State; pages: PageRef[]; questions: QRef[]; isProfessor: boolean; slides: SlideAula2[]; notas?: Record<string, NotaSlideAula2> }) {
  const { state, channel, refresh } = useLiveState<State>(sessionId, initial);
  const st = state ?? initial;
  const [err, setErr] = useState<string | null>(null);
  const [privateNames, setPrivateNames] = useState(false);
  const [pageSlug, setPageSlug] = useState(st.currentPage?.slug ?? pages[0]?.slug ?? "");
  const slideAtual = useMemo(() => slides.find((x) => x.n === st.currentSlide) ?? null, [slides, st.currentSlide]);
  // o título projetado vem da compilação do baralho; o do roteiro é o tema, que fica como apoio
  const tituloProjetado = (n: string) => notas[n]?.titulo ?? slides.find((x) => x.n === n)?.titulo ?? "";
  const notaAtual = st.currentSlide ? notas[st.currentSlide] : undefined;
  const irParaSlide = (n: string) => run(async () => { await api(`/api/aovivo/${sessionId}/slide`, { body: { slide: n } }); });
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
          <div><Link href={`/professor/turmas/${classId}/encontros`} className="voltar">Aulas ao vivo</Link><p className="eyebrow">Aula {meeting.number} · painel da aula</p><h1 className="text-xl">{meeting.title}</h1></div>
          <StatusBadge status={st.session.status} />
          <span className="hint">{channel === "sse" ? "tempo real" : "atualização periódica"} · {st.enrolled} alunos com acesso</span>
          <div className="flex-1" />
          {isProfessor && st.session.status !== "open" && <button className="btn btn-sm" onClick={() => run(async () => { await api(`/api/aovivo/${sessionId}/status`, { body: { status: "open" } }); })}>Iniciar aula ao vivo</button>}
          {isProfessor && st.session.status === "open" && <button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Encerrar a aula ao vivo? Perguntas abertas serão encerradas.")) run(async () => { await api(`/api/aovivo/${sessionId}/status`, { body: { status: "closed" } }); }); }}>Encerrar aula</button>}
        </div>
        <ErrorBox message={err} />

        {slides.length > 0 && (
          <section className="card" aria-labelledby="baralho">
            <h2 id="baralho" className="text-base mb-2">Conduzir pelos slides</h2>
            <div className="flex flex-wrap gap-2 items-end">
              <label className="text-[13px] flex-1 min-w-[280px]">Slide<select className="select" value={st.currentSlide ?? ""} onChange={(e) => irParaSlide(e.target.value)}>
                <option value="" disabled>escolha o slide</option>
                {slides.map((x) => <option key={x.n} value={x.n}>{x.n} · {x.bloco} · {tituloProjetado(x.n)}</option>)}
              </select></label>
              <button className="btn btn-sm btn-secondary" disabled={!st.currentSlide || st.currentSlide === slides[0].n}
                onClick={() => { const i = slides.findIndex((x) => x.n === st.currentSlide); if (i > 0) irParaSlide(slides[i - 1].n); }}>Anterior</button>
              <button className="btn btn-sm btn-secondary" disabled={st.currentSlide === slides[slides.length - 1].n}
                onClick={() => { const i = slides.findIndex((x) => x.n === st.currentSlide); irParaSlide(slides[Math.min(i + 1, slides.length - 1)].n); }}>Próximo</button>
              <a className="btn btn-sm" href={`/apresentacao/slides?sessao=${sessionId}`} target="_blank" rel="noreferrer">Projetar os slides</a>
            </div>
            <p className="hint mt-2">
              {st.currentSlide ? `Na tela dos alunos agora: slide ${st.currentSlide}, ${tituloProjetado(st.currentSlide)}.` : "Nenhum slide no ar ainda."}
              {" "}Na janela de projeção você navega com as setas e o slide dos alunos acompanha sozinho. A projeção não mostra as notas: elas ficam no roteiro abaixo, só na sua tela.
            </p>
            {slideAtual && slideAtual.paginas.length > 0 && (
              <p className="hint mt-1">Páginas do apêndice que este slide cobre:{" "}
                {slideAtual.paginas.map((sl) => (
                  <button key={sl} type="button" className="btn btn-ghost btn-sm" onClick={() => setPageSlug(sl)}>{sl}</button>
                ))}
                <span className="block">Escolher uma delas carrega as perguntas daquela página no bloco abaixo, sem trocar o que os alunos veem.</span>
              </p>
            )}
          </section>
        )}

        {slides.length > 0 && (
          <section className="card" aria-labelledby="roteiro-slide" data-testid="roteiro-slide">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h2 id="roteiro-slide" className="text-base">Roteiro do slide no ar <span className="hint font-normal">(só na sua tela, não projete)</span></h2>
              {notaAtual?.proximo && (
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => irParaSlide(notaAtual.proximo!.n)}>
                  Avançar para {notaAtual.proximo.n} · {notaAtual.proximo.titulo}
                </button>
              )}
            </div>
            {!st.currentSlide && <p className="hint">Escolha um slide acima ou navegue na janela de projeção: a condução, as respostas esperadas, os cuidados e a transição aparecem aqui.</p>}
            {st.currentSlide && !notaAtual && <p className="hint">Sem notas compiladas para o slide {st.currentSlide}. Gere content/slides/aula-2-notas.json com node aula_credito_html/build.mjs.</p>}
            {notaAtual && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="eyebrow">{notaAtual.n} · {notaAtual.blocoNome}{slideAtual ? ` · tema: ${slideAtual.titulo}` : ""}</p>
                  <p className="font-semibold text-ink">{notaAtual.titulo}</p>
                  {notaAtual.subtitulo && <p className="hint">{notaAtual.subtitulo}</p>}
                  {notaAtual.conclusao && <p className="mt-2 text-[14px]"><b>Mensagem que fecha o slide:</b> {notaAtual.conclusao}</p>}
                  {notaAtual.notas && notaAtual.notas.conducao.length > 0 && (
                    <><p className="eyebrow mt-3">Condução</p><ul className="text-[14px] list-disc pl-5 m-0 grid gap-1">{notaAtual.notas.conducao.map((t, i) => <li key={i}>{t}</li>)}</ul></>
                  )}
                  {notaAtual.notas?.transicao && <p className="mt-3 text-[14px]"><b>Transição:</b> {notaAtual.notas.transicao}</p>}
                </div>
                <div>
                  {notaAtual.notas && notaAtual.notas.respostas.length > 0 && (
                    <details className="callout">
                      <summary className="font-semibold text-ink cursor-pointer min-h-[32px] flex items-center">Respostas esperadas (abra quando quiser)</summary>
                      <ul className="text-[14px] list-disc pl-5 mt-2 mb-0 grid gap-1">{notaAtual.notas.respostas.map((t, i) => <li key={i}>{t}</li>)}</ul>
                    </details>
                  )}
                  {notaAtual.notas && notaAtual.notas.cuidados.length > 0 && (
                    <><p className="eyebrow mt-3">Cuidados e limites</p><ul className="text-[14px] list-disc pl-5 m-0 grid gap-1">{notaAtual.notas.cuidados.map((t, i) => <li key={i}>{t}</li>)}</ul></>
                  )}
                  {notaAtual.notas && notaAtual.notas.aprofundar.length > 0 && (
                    <details className="mt-3">
                      <summary className="font-semibold text-ink cursor-pointer min-h-[32px] flex items-center">Aprofundamento</summary>
                      <ul className="text-[14px] list-disc pl-5 mt-2 mb-0 grid gap-1">{notaAtual.notas.aprofundar.map((t, i) => <li key={i}>{t}</li>)}</ul>
                    </details>
                  )}
                  {notaAtual.fonte && <p className="hint mt-3">Fonte dos números: {notaAtual.fonte}.</p>}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="card" aria-labelledby="slide">
          <h2 id="slide" className="text-base mb-2">{slides.length > 0 ? "Mostrar uma página em vez do slide" : "O que os alunos veem"}</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-[13px] flex-1 min-w-[260px]">Página<select className="select" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)}>{pages.map((p) => <option key={p.id} value={p.slug}>{p.slug} · cap. {p.chapter} · {p.title}</option>)}</select></label>
            <button className="btn btn-sm" onClick={() => run(async () => { await api(`/api/aovivo/${sessionId}/pagina`, { body: { pageSlug } }); })}>Mostrar aos alunos</button>
            <Link href={`/apresentacao/${pageSlug}?sessao=${sessionId}`} className="btn btn-sm btn-secondary" target="_blank" rel="noreferrer">Projetar em tela cheia</Link>
          </div>
          <p className="hint mt-2">Na tela dos alunos agora: {st.currentPage ? `${st.currentPage.slug} · ${st.currentPage.title}` : "nada ainda"}. A projeção em tela cheia atualiza esta página sozinha conforme você avança.</p>
        </section>

        <section className="card" aria-labelledby="pub">
          <h2 id="pub" className="text-base mb-2">Perguntar à turma</h2>
          <div className="flex flex-col gap-2">
            {pageQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 items-end">
                <label className="text-[13px] flex-1 min-w-[260px]">Perguntas desta página<select id="qsel" className="select">{pageQuestions.map((q) => <option key={q.versionId} value={q.versionId}>{q.slug} · {kindLabel[q.kind] ?? q.kind} · {q.prompt.slice(0, 80)}</option>)}</select></label>
                <label className="text-[13px]">Rodada<select id="qround" className="select"><option value="unica">uma rodada</option><option value="antes">antes da discussão</option><option value="depois">depois da discussão</option></select></label>
                <button className="btn btn-sm" onClick={() => run(async () => { const sel = (document.getElementById("qsel") as HTMLSelectElement).value; const round = (document.getElementById("qround") as HTMLSelectElement).value; await api(`/api/aovivo/${sessionId}/atividades`, { body: { questionVersionId: sel, pageSlug, round } }); })}>Adicionar à lista</button>
              </div>
            )}
            <AdHoc sessionId={sessionId} pageSlug={pageSlug} onDone={refresh} />
          </div>
        </section>

        <section aria-labelledby="acts">
          <div className="flex items-center gap-3 mb-2"><h2 id="acts" className="text-base">Perguntas desta aula</h2><label className="text-[13px] flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-ink" checked={privateNames} onChange={(e) => setPrivateNames(e.target.checked)} />Mostrar nomes (só na sua tela, não projete)</label></div>
          <div className="flex flex-col gap-3">
            {st.activities.length === 0 && <p className="hint">Nenhuma pergunta ainda. Adicione uma acima e clique em Abrir quando quiser que a turma responda.</p>}
            {st.activities.map((a) => <ActivityCard key={a.id} a={a} sessionId={sessionId} privateNames={privateNames} run={run} />)}
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <section className="card" aria-labelledby="chamada">
          <h2 id="chamada" className="text-base mb-2">Presença</h2>
          {chamada.length ? (
            <div className="text-center">
              <p className="eyebrow">código atual · renova em {chamada[0].secondsLeft}s</p>
              <p className="font-mono text-5xl font-bold text-ink tracking-[.2em] my-2" aria-live="polite">{chamada[0].code}</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- QR gerado no servidor como data URL; otimização de imagem não se aplica */}
              {qr && <img src={qr} alt="QR code com o link da sessão e o código atual" className="mx-auto" width={220} height={220} />}
              <p className="hint mt-2">Aberta até {fmtT(chamada[0].closesAt)}. O código pode ser repassado por mensagem: confira a sala e corrija em Presença quando necessário.</p>
              <button className="btn btn-sm btn-ghost mt-2" onClick={() => run(async () => { await api(`/api/professor/turmas/${classId}/chamadas/${chamada[0].id}`, { method: "DELETE" }); setChamada([]); })}>Fechar chamada</button>
            </div>
          ) : (
            <div className="form-grid">
              <label className="text-[13px]">Duração (min)<input type="number" className="input" min={1} max={240} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></label>
              <label className="text-[13px]">Conta como atraso a partir de (min, 0 = não conta)<input type="number" className="input" min={0} max={240} value={lateAfter} onChange={(e) => setLateAfter(Number(e.target.value))} /></label>
              <button className="btn btn-sm" onClick={() => run(async () => { await api(`/api/professor/turmas/${classId}/encontros/${meeting.id}/chamada`, { body: { minutes, lateAfterMinutes: lateAfter || null } }); const d = await api<{ windows: typeof chamada }>(`/api/aovivo/${sessionId}/checkin`); setChamada(d.windows); })}>Abrir chamada</button>
              <p className="hint">O aluno digita o código na tela dele, em Ao vivo. O código muda a cada minuto e há QR para projetar.</p>
            </div>
          )}
          <Link href={`/professor/turmas/${classId}/frequencia`} className="hint block mt-3">Ver a presença da turma</Link>
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
        {a.status === "released" && <button className="btn btn-sm btn-ghost" onClick={() => set("open")}>Reabrir em nova rodada</button>}
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
  if (!open) return <button className="btn btn-sm btn-ghost self-start" onClick={() => setOpen(true)}>Criar uma pergunta nova</button>;
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

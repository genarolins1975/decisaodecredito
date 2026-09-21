"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLiveState } from "@/lib/client/use-live";
import { api, ClientApiError } from "@/lib/client/api";
import { ContentBlocks } from "@/components/content/blocks";
import { Question } from "@/components/content/question";
import { StatusBadge } from "@/components/ui";
import type { Block, PublicQuestion } from "@/lib/services/content";

type Activity = { id: string; status: string; round: string; closesAt: string | null; maxAttempts: number; question: PublicQuestion; myAttempt: { attemptNo: number; status: string; answer: unknown; isCorrect: boolean | null; feedback: never } | null; attemptsUsed: number };
type State = { session: { id: string; status: string; stateVersion: number; classId: string }; currentPage: { slug: string; title: string } | null; currentSlide: string | null; activities: Activity[] };
type PageData = { page: { slug: string; title: string; objective: string | null; support: string | null; chapter: { number: number; title: string; color: string | null } }; blocks: Block[]; questions: PublicQuestion[]; prev: string | null; next: string | null };

type ModoBaralho = "aluno" | "livre";
type JanelaBaralho = Window & { App?: { definirModo?: (modo: string) => boolean } };

export function LiveStudent({ sessionId, classId, userId, meeting, initial }: { sessionId: string; classId: string; userId: string; meeting: { id: string; title: string; number: number; videoUrl: string | null }; initial: State }) {
  const { state, channel, lastUpdate, stale, staleSinceMs } = useLiveState<State>(sessionId, initial);
  const [follow, setFollow] = useState(true);
  const [ownSlug, setSlug] = useState<string | null>(initial.currentPage?.slug ?? null);
  const [page, setPage] = useState<PageData | null>(null);
  const [checkinMsg, setCheckinMsg] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [windows, setWindows] = useState<{ id: string; meetingId: string; closesAt: string }[]>([]);

  const st = state ?? initial;
  /* Aula conduzida por slides. Seguindo o professor, o baralho vem em modo aluno, sem barra e sem
     as notas do professor. Navegando por conta própria, o aluno parte do último slide visto e usa
     a navegação do próprio baralho, ainda sem as notas. */
  const [meuSlide, setMeuSlide] = useState<string | null>(initial.currentSlide);
  const slide = follow ? st.currentSlide : meuSlide;
  const modo: ModoBaralho = follow ? "aluno" : "livre";
  const quadro = useRef<HTMLIFrameElement>(null);
  /* O src do iframe é fixado na primeira vez em que há slide e não muda mais: trocar o src
     recarregaria o arquivo e apagaria a exploração do aluno. O baralho navega por `#/slide/NN`
     e escuta hashchange; a troca entre seguir e navegar por conta própria entra por
     App.definirModo, da mesma origem, sem recarga. `estado` é um identificador opaco que separa,
     no navegador, o que este usuário explorou do que outro usuário exploraria na mesma máquina. */
  const [src, setSrc] = useState<string | null>(null);
  // estado derivado do primeiro slide: fixado uma vez, na própria renderização, e nunca mais trocado
  if (slide && src === null) setSrc(`/slides/aula-2?modo=${modo}&estado=${encodeURIComponent(userId)}#/slide/${slide}`);
  useEffect(() => {
    const f = quadro.current;
    if (!f || !slide) return;
    const alvo = `#/slide/${slide}`;
    const aplicar = () => {
      try {
        const w = f.contentWindow as JanelaBaralho | null;
        if (!w) return;
        w.App?.definirModo?.(modo);
        if (follow && w.location.hash !== alvo) w.location.hash = alvo;
      } catch { /* ainda carregando: o load abaixo aplica */ }
    };
    aplicar();
    f.addEventListener("load", aplicar);
    return () => f.removeEventListener("load", aplicar);
  }, [slide, follow, modo, src]);
  /* O baralho só entra em modo projeção acima de 1100px. Dentro da coluna da aula ele ficaria
     abaixo disso e cairia no modo estudo, cortado pela moldura. Então ele é desenhado em 1280 por
     720 e reduzido por transform até a largura disponível. Em tela estreita, o modo estudo do
     próprio baralho é melhor, e aí ele recebe a largura inteira e rola na vertical. */
  const PALCO = { w: 1280, h: 720 };
  const caixa = useRef<HTMLDivElement>(null);
  const [larguraCaixa, setLarguraCaixa] = useState(0);
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    // o observador dispara uma vez ao observar, então a medida inicial vem dele, não do corpo do efeito
    const ro = new ResizeObserver(() => setLarguraCaixa(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [slide]);
  const estreito = larguraCaixa > 0 && larguraCaixa < 900;
  const escala = estreito ? 1 : Math.min(1, (larguraCaixa || PALCO.w) / PALCO.w);
  const slug = follow ? (st.currentPage?.slug ?? ownSlug) : ownSlug;
  useEffect(() => { if (!slug) return; api<PageData>(`/api/conteudo/pagina/${slug}?classId=${classId}`).then(setPage).catch(() => setPage(null)); }, [slug, classId]);
  useEffect(() => {
    const load = () => api<{ windows: { id: string; meetingId: string; closesAt: string }[] }>(`/api/frequencia/chamada?classId=${classId}`).then((d) => setWindows(d.windows.filter((w) => w.meetingId === meeting.id))).catch(() => {});
    load(); const t = setInterval(load, 30000); return () => clearInterval(t);
  }, [classId, meeting.id, lastUpdate]);

  async function doCheckin() {
    setCheckinMsg(null);
    try { const r = await api<{ status: string }>("/api/frequencia/chamada", { body: { classId, code, meetingId: meeting.id } }); setCheckinMsg(`Presença registrada como "${r.status}".`); setCode(""); }
    catch (e) { setCheckinMsg(e instanceof ClientApiError ? e.message : "Falha de rede. Tente de novo."); }
  }

  const open = st.activities.filter((a) => a.status === "open");
  const others = st.activities.filter((a) => a.status !== "open");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div><Link href="/ao-vivo" className="voltar">Ao vivo</Link><p className="eyebrow">Aula {meeting.number} · ao vivo</p><h1 className="text-xl">{meeting.title}</h1></div>
          <StatusBadge status={st.session.status} />
          <span className="hint" aria-live="polite" role="status">
            {stale ? `Sem atualização há ${Math.round(staleSinceMs / 1000)} s: tentando reconectar` : channel === "sse" ? "Conectado" : channel === "polling" ? "Atualização periódica" : "Acesso revogado"}
            {lastUpdate > 0 ? ` · última atualização ${new Date(lastUpdate).toLocaleTimeString("pt-BR")}` : ""}
          </span>
          {meeting.videoUrl && <a className="btn btn-sm btn-secondary" href={meeting.videoUrl} target="_blank" rel="noreferrer">Videoconferência</a>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 no-print" role="group" aria-label="Modo de acompanhamento">
          <button type="button" className={`btn btn-sm ${follow ? "" : "btn-secondary"}`} aria-pressed={follow} onClick={() => setFollow(true)}>Seguir o professor</button>
          <button type="button" className={`btn btn-sm ${!follow ? "" : "btn-secondary"}`} aria-pressed={!follow} onClick={() => { setSlug(slug); setMeuSlide(st.currentSlide ?? meuSlide); setFollow(false); }}>Navegar por conta própria</button>
          {!follow && st.currentSlide && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setFollow(true)}>Voltar ao slide do professor: {st.currentSlide} de 50</button>}
          {!follow && !st.currentSlide && st.currentPage && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setFollow(true); setSlug(st.currentPage!.slug); }}>Voltar à página do professor: {st.currentPage.title}</button>}
        </div>
        {slide ? (
          <div className="card p-0 overflow-hidden">
            <div ref={caixa} style={{ height: estreito ? "70vh" : PALCO.h * escala }}>
              <iframe ref={quadro} title={`Slide ${slide} da aula`} src={src ?? undefined}
                style={estreito
                  ? { width: "100%", height: "100%", border: 0, display: "block" }
                  : { width: PALCO.w, height: PALCO.h, border: 0, display: "block", transform: `scale(${escala})`, transformOrigin: "top left" }} />
            </div>
            <p className="hint px-4 py-2 border-t border-rule m-0" data-testid="o-que-fica-salvo">
              <b>O que fica salvo:</b> suas respostas às perguntas do professor ficam no servidor e voltam quando você recarrega.
              O que você mexe nos slides (controles, exercícios, escolhas) fica só nesta aba deste navegador: sobrevive a recarregar a página, some ao fechar a aba e não aparece em outro aparelho.
            </p>
          </div>
        ) : page ? (
          <article className="card">
            <p className="eyebrow">Capítulo {page.page.chapter.number} · {page.page.chapter.title}</p>
            <h2 className="mt-1">{page.page.title}</h2>
            {page.page.objective && <p className="mt-2 text-[15px]"><span className="eyebrow text-[#7a5f16] mr-2">Objetivo</span>{page.page.objective}</p>}
            {page.page.support && <p className="mt-2">{page.page.support}</p>}
            <div className="mt-5"><ContentBlocks blocks={page.blocks} questions={page.questions} classId={classId} hideSlugs={st.activities.map((a) => a.question.slug)} pageSlug={page.page.slug} /></div>
            {!follow && (
              <div className="flex justify-between mt-6 pt-3 border-t border-rule">
                <button type="button" className="btn btn-sm btn-secondary" disabled={!page.prev} onClick={() => page.prev && setSlug(page.prev)}>← Anterior</button>
                <Link href={`/aulas/${page.page.slug}`} className="hint self-center">Abrir esta página em Aulas</Link>
                <button type="button" className="btn btn-sm btn-secondary" disabled={!page.next} onClick={() => page.next && setSlug(page.next)}>Próxima →</button>
              </div>
            )}
          </article>
        ) : <div className="panel-soft"><p className="hint">{st.currentPage ? "Carregando…" : "O professor ainda não mostrou nenhuma página."}</p></div>}
      </div>

      <aside className="flex flex-col gap-4" aria-label="Atividades e presença">
        <section className="card" aria-labelledby="chk">
          <h2 id="chk" className="text-base">Presença</h2>
          {windows.length ? (
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); doCheckin(); }}>
              <input className="input font-mono tracking-widest uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código" aria-label="Código de presença" maxLength={8} autoComplete="off" />
              <button className="btn btn-sm" type="submit" disabled={code.length < 4}>Registrar presença</button>
            </form>
          ) : <p className="hint mt-1">Quando o professor abrir a chamada, o campo do código aparece aqui.</p>}
          {checkinMsg && <p className="mt-2 text-[14px]" role="status">{checkinMsg}</p>}
        </section>
        <section aria-labelledby="ativ">
          <h2 id="ativ" className="text-base mb-2">Perguntas {open.length ? <span className="badge badge-ok ml-1">{open.length} aberta{open.length > 1 ? "s" : ""}</span> : null}</h2>
          {st.activities.length === 0 && <p className="hint">Quando o professor fizer uma pergunta, ela aparece aqui.</p>}
          <div className="flex flex-col gap-3">
            {[...open, ...others].map((a) => <LiveActivity key={a.id} a={a} sessionId={sessionId} />)}
          </div>
        </section>
      </aside>
    </div>
  );
}

function LiveActivity({ a, sessionId }: { a: Activity; sessionId: string }) {
  const counting = Boolean(a.closesAt) && a.status === "open";
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!counting) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [counting]);
  const left = counting && now !== null ? Math.max(0, Math.round((new Date(a.closesAt!).getTime() - now) / 1000)) : null;
  const canAnswer = a.status === "open" && a.attemptsUsed < a.maxAttempts && (a.myAttempt?.status !== "submitted" || a.attemptsUsed < a.maxAttempts);
  const initial = a.myAttempt && a.myAttempt.status === "submitted" ? { isCorrect: a.myAttempt.isCorrect, feedback: a.status === "released" ? a.myAttempt.feedback : null, attemptNo: a.myAttempt.attemptNo, answer: a.myAttempt.answer } : null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <StatusBadge status={a.status} />
        {a.round !== "unica" && <span className="badge badge-ink">rodada {a.round}</span>}
        {left !== null && <span className="hint" aria-live="polite">{left}s restantes</span>}
        {a.maxAttempts > 1 && <span className="hint">{a.attemptsUsed}/{a.maxAttempts} tentativas</span>}
      </div>
      <Question key={`${a.id}-${a.myAttempt?.attemptNo ?? 0}-${a.status}`} q={a.question} compact
        initial={initial} disabled={!canAnswer && !initial}
        submit={async (answer, clientRequestId) => {
          const r = await api<{ attemptNo: number; status: string }>(`/api/aovivo/${sessionId}/responder`, { body: { activityId: a.id, answer, clientRequestId } });
          return { isCorrect: null, feedback: null, attemptNo: r.attemptNo };
        }} />
      {a.status === "closed" && !a.myAttempt && <p className="hint mt-1">Encerrada sem resposta sua.</p>}
      {a.myAttempt?.status === "submitted" && a.status !== "released" && <p className="hint mt-1">Resposta enviada. O resultado aparece quando o professor liberar.</p>}
    </div>
  );
}

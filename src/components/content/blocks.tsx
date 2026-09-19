"use client";
import { useEffect, useRef, useState } from "react";
import type { Block, PublicQuestion } from "@/lib/services/content";
import { Question } from "./question";
import { LegacyFrame } from "./legacy-frame";
import { removerFiguraEstatica, visualNativo } from "@/components/visuais/registro";
import { AjusteAoPalco } from "./ajuste-ao-palco";
import { PALCO_PROPRIO } from "@/lib/visuais/palco-proprio";
import { api } from "@/lib/client/api";

type SubmitFn = (q: PublicQuestion, answer: unknown, clientRequestId: string) => Promise<{ isCorrect: boolean | null; feedback: never; attemptNo: number }>;

export function ContentBlocks({ blocks, questions, classId, mode = "estudo", liveSubmit, hideSlugs, pageSlug, palco, pagina }: {
  blocks: Block[]; questions: PublicQuestion[]; classId: string; mode?: "estudo" | "apresentacao" | "previa"; liveSubmit?: SubmitFn; hideSlugs?: string[]; pageSlug?: string;
  /** posição da página no capítulo, para visuais que desenham o próprio quadro de slide */
  pagina?: { index: number; total: number };
  /** Apresentação (deck): cada bloco vira um invólucro [data-bloco] que o compositor pagina; episódio e síntese ganham o leiaute de palco */
  palco?: boolean;
}) {
  const nativo = pageSlug ? visualNativo(pageSlug) : null;
  // a figura estática é substituída uma vez, no primeiro bloco HTML que a contém
  const idxFigura = nativo?.substitui === "figura" ? blocks.findIndex((b) => b.type === "html" && b.html.includes('class="svgfit"')) : -1;
  const byslug = new Map(questions.map((q) => [q.slug, q]));
  const revealRef = useRef<((slug: string, choice: number) => void) | null>(null);
  const [fetched, setFetched] = useState<Record<string, { isCorrect: boolean | null; feedback: never; attemptNo: number; answer: unknown }> | null>(null);
  const ids = questions.map((q) => q.versionId).join(",");
  const skipFetch = mode === "previa" || !ids;
  const initial = skipFetch ? {} : fetched;

  useEffect(() => {
    if (skipFetch) return;
    let cancelled = false;
    api<{ responses: Record<string, { isCorrect: boolean | null; feedback: never; attemptNo: number; answer: unknown }> }>(`/api/estudo/responder?classId=${classId}&versions=${ids}`)
      .then((d) => { if (!cancelled) setFetched(d.responses); }).catch(() => { if (!cancelled) setFetched({}); });
    return () => { cancelled = true; };
  }, [classId, ids, skipFetch]);

  const submit = (q: PublicQuestion) => async (answer: unknown, clientRequestId: string) => {
    if (mode === "previa") return { isCorrect: null, feedback: null, attemptNo: 0 };
    if (liveSubmit) return liveSubmit(q, answer, clientRequestId);
    return api<{ isCorrect: boolean | null; feedback: never; attemptNo: number }>("/api/estudo/responder", { body: { classId, questionVersionId: q.versionId, answer, clientRequestId } });
  };

  const reveal = (q: PublicQuestion) => async () => api<{ isCorrect: boolean | null; feedback: never; attemptNo: number; revealed: boolean; disclosedBefore: boolean }>("/api/estudo/responder", { body: { classId, questionVersionId: q.versionId, reveal: true } });

  const bloco = (i: number, filho: React.ReactNode) => filho == null ? null : <div key={i} data-bloco={i}>{filho}</div>;
  // visual de abertura: entra antes de todos os blocos; no palco, quando desenha o próprio quadro, é a página inteira
  const abertura = nativo?.substitui === "abertura" ? <AjusteAoPalco><nativo.Componente palco={palco} pagina={pagina} /></AjusteAoPalco> : null;
  if (abertura && palco && pageSlug && PALCO_PROPRIO.has(pageSlug)) return <div className="flex flex-col gap-4">{bloco(-1, abertura)}</div>;
  return (
    <div className="flex flex-col gap-4">
      {abertura && bloco(-1, abertura)}
      {blocks.flatMap((b, i) => {
        // figura estática substituída: o visual nativo e o texto restante viram dois blocos (i e i + 0,5), paginados separadamente
        if (b.type === "html" && i === idxFigura && nativo) return [bloco(i, <AjusteAoPalco><nativo.Componente palco={palco} /></AjusteAoPalco>), bloco(i + 0.5, <div className="conteudo" dangerouslySetInnerHTML={{ __html: removerFiguraEstatica(b.html) }} />)];
        return [bloco(i, renderBloco(b, i))];
      })}
    </div>
  );

  function renderBloco(b: Block, i: number): React.ReactNode {
        if (b.type === "html") return <div key={i} className="conteudo" dangerouslySetInnerHTML={{ __html: b.html }} />;
        if (b.type === "episode") return <Episode key={i} b={b} palco={palco} />;
        if (b.type === "checkpoint") return <Checkpoint key={i} b={b} palco={palco} />;
        if (b.type === "legacy") {
          const n = visualNativo(b.slug);
          if (n?.substitui === "legacy") return <AjusteAoPalco key={i}><n.Componente palco={palco} /></AjusteAoPalco>;
          return <LegacyFrame key={i} slug={b.slug} fallbackHtml={b.fallbackHtml} note={b.note} revealRef={revealRef} palco={palco} />;
        }
        if (b.type === "question") {
          const q = byslug.get(b.slug);
          if (!q) return null;
          if (hideSlugs?.includes(b.slug)) return <p key={i} className="hint border border-dashed border-rule rounded p-3">O professor fez esta pergunta à turma: responda no painel ao lado, em Perguntas.</p>;
          return <Question key={q.versionId} q={q} initial={initial ? initial[q.versionId] ?? null : null} submit={submit(q)} reveal={mode === "estudo" && !liveSubmit ? reveal(q) : undefined} onRevealed={(s, c) => revealRef.current?.(s, c)} disabled={initial === null} />;
        }
        return null;
  }
}

export function Episode({ b, palco }: { b: Extract<Block, { type: "episode" }>; palco?: boolean }) {
  const [i, setI] = useState(0);
  if (palco) {
    // palco: desafio em destaque e as etapas lado a lado, sem abas (tudo visível de uma vez)
    return (
      <section className="palco-episodio" aria-label="Desafio do capítulo">
        <div className="palco-episodio-cab">
          <p className="palco-episodio-num" aria-hidden="true">{String(b.number).padStart(2, "0")}</p>
          <div>
            <p className="eyebrow">O desafio deste capítulo</p>
            <h3 className="palco-episodio-desafio">{b.challenge}</h3>
            <p className="palco-episodio-texto">{b.text}</p>
          </div>
        </div>
        <ol className="palco-episodio-etapas" aria-label="Etapas do capítulo">
          {b.steps.map((s, k) => <li key={k}><span className="palco-episodio-n">{k + 1}</span><b>{s.title}</b><p>{s.detail}</p></li>)}
        </ol>
        {b.missions && (
          <ol className="palco-missoes" aria-label="12 missões do trabalho">
            {Array.from({ length: b.missions }, (_, k) => <li key={k}>{k + 1}</li>)}
          </ol>
        )}
      </section>
    );
  }
  return (
    <section className="grid md:grid-cols-[120px_1fr] gap-5 items-start" aria-label="Desafio do capítulo">
      <div className="text-center md:text-left">
        <p className="eyebrow">capítulo</p>
        <p className="font-serif text-5xl font-bold text-ink leading-none">{String(b.number).padStart(2, "0")}</p>
      </div>
      <div>
        <p className="eyebrow mb-1">O desafio deste capítulo</p>
        <h3 className="text-xl mb-2">{b.challenge}</h3>
        <p className="text-[15.5px] max-w-[62ch]">{b.text}</p>
        <div role="tablist" aria-label="Etapas do capítulo" className="flex flex-wrap gap-2 mt-4">
          {b.steps.map((s, k) => (
            <button key={k} role="tab" aria-selected={i === k} id={`ep-tab-${k}`} aria-controls="ep-panel" type="button" onClick={() => setI(k)}
              className={`btn btn-sm ${i === k ? "" : "btn-secondary"}`}>{k + 1}. {s.title}</button>
          ))}
        </div>
        <div id="ep-panel" role="tabpanel" aria-labelledby={`ep-tab-${i}`} className="callout mt-3 text-[15px]">{b.steps[i]?.detail}</div>
        {b.missions && (
          <ol className="flex flex-wrap gap-1.5 mt-3 list-none p-0 m-0" aria-label="12 missões do trabalho">
            {Array.from({ length: b.missions }, (_, k) => <li key={k} className="w-7 h-7 rounded-full grid place-items-center bg-gold-soft text-ink font-mono text-[11px] font-bold">{k + 1}</li>)}
          </ol>
        )}
      </div>
    </section>
  );
}

export function Checkpoint({ b, palco }: { b: Extract<Block, { type: "checkpoint" }>; palco?: boolean }) {
  const [i, setI] = useState(0);
  const it = b.items[i];
  if (palco) {
    // palco: as ideias lado a lado, pergunta e resposta visíveis, tipografia de síntese
    return (
      <section className="palco-sintese" aria-label="Síntese do capítulo">
        <header className="palco-sintese-cab">
          <p className="palco-sintese-num" aria-hidden="true">{b.count}</p>
          <div><h3 className="palco-sintese-tit">ideias para levar</h3><p className="palco-sintese-intro">{b.intro}</p></div>
        </header>
        <ol className="palco-sintese-cartoes">
          {b.items.map((x, k) => (
            <li key={k} className="palco-sintese-cartao">
              <p className="eyebrow">ideia {k + 1}</p>
              <h4>{x.title}</h4>
              <p className="palco-sintese-perg">{x.question}</p>
              <p className="palco-sintese-resp">{x.answer}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }
  return (
    <section className="grid md:grid-cols-[200px_1fr] gap-5 items-start" aria-label="Síntese do capítulo">
      <div className="panel-soft">
        <p className="font-serif text-4xl font-bold text-ink leading-none">{b.count}</p>
        <h3 className="text-base mt-1">ideias para levar</h3>
        <p className="hint mt-2">{b.intro}</p>
      </div>
      <div>
        <div role="tablist" aria-label="Ideias" className="flex flex-wrap gap-2">
          {b.items.map((x, k) => <button key={k} role="tab" aria-selected={i === k} type="button" onClick={() => setI(k)} className={`btn btn-sm ${i === k ? "" : "btn-secondary"}`}>{k + 1}. {x.title}</button>)}
        </div>
        {it && (
          <div role="tabpanel" className="card mt-3">
            <h3 className="mb-1">{it.title}</h3>
            <p className="text-[15px]">{it.question}</p>
            <p className="mt-2 pl-3 border-l-[3px] border-gold text-[15px] text-ink">{it.answer}</p>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import type { Block, PublicQuestion } from "@/lib/services/content";
import { Question } from "./question";
import { LegacyFrame } from "./legacy-frame";
import { api } from "@/lib/client/api";

type SubmitFn = (q: PublicQuestion, answer: unknown, clientRequestId: string) => Promise<{ isCorrect: boolean | null; feedback: never; attemptNo: number }>;

export function ContentBlocks({ blocks, questions, classId, mode = "estudo", liveSubmit, hideSlugs }: {
  blocks: Block[]; questions: PublicQuestion[]; classId: string; mode?: "estudo" | "apresentacao" | "previa"; liveSubmit?: SubmitFn; hideSlugs?: string[];
}) {
  const byslug = new Map(questions.map((q) => [q.slug, q]));
  const revealRef = useRef<((slug: string, choice: number) => void) | null>(null);
  const [initial, setInitial] = useState<Record<string, { isCorrect: boolean | null; feedback: never; attemptNo: number; answer: unknown }> | null>(null);

  useEffect(() => {
    if (mode === "previa") { setInitial({}); return; }
    const ids = questions.map((q) => q.versionId).join(",");
    if (!ids) { setInitial({}); return; }
    api<{ responses: Record<string, { isCorrect: boolean | null; feedback: never; attemptNo: number; answer: unknown }> }>(`/api/estudo/responder?classId=${classId}&versions=${ids}`)
      .then((d) => setInitial(d.responses)).catch(() => setInitial({}));
  }, [classId, questions, mode]);

  const submit = (q: PublicQuestion) => async (answer: unknown, clientRequestId: string) => {
    if (mode === "previa") return { isCorrect: null, feedback: null, attemptNo: 0 };
    if (liveSubmit) return liveSubmit(q, answer, clientRequestId);
    return api<{ isCorrect: boolean | null; feedback: never; attemptNo: number }>("/api/estudo/responder", { body: { classId, questionVersionId: q.versionId, answer, clientRequestId } });
  };

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        if (b.type === "html") return <div key={i} className="conteudo" dangerouslySetInnerHTML={{ __html: b.html }} />;
        if (b.type === "episode") return <Episode key={i} b={b} />;
        if (b.type === "checkpoint") return <Checkpoint key={i} b={b} />;
        if (b.type === "legacy") return <LegacyFrame key={i} slug={b.slug} fallbackHtml={b.fallbackHtml} note={b.note} revealRef={revealRef} />;
        if (b.type === "question") {
          const q = byslug.get(b.slug);
          if (!q) return null;
          if (hideSlugs?.includes(b.slug)) return <p key={i} className="hint border border-dashed border-rule rounded p-3">Esta questão foi publicada pelo professor na sessão: responda no painel de atividades.</p>;
          return <Question key={q.versionId} q={q} initial={initial ? initial[q.versionId] ?? null : null} submit={submit(q)} onRevealed={(s, c) => revealRef.current?.(s, c)} disabled={initial === null} />;
        }
        return null;
      })}
    </div>
  );
}

export function Episode({ b }: { b: Extract<Block, { type: "episode" }> }) {
  const [i, setI] = useState(0);
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

export function Checkpoint({ b }: { b: Extract<Block, { type: "checkpoint" }> }) {
  const [i, setI] = useState(0);
  const it = b.items[i];
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

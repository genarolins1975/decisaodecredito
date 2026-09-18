"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Block, PublicQuestion } from "@/lib/services/content";
import { ContentBlocks } from "./blocks";
import { InfograficoCapitulo } from "./infografico";
import { AjusteAoPalco } from "./ajuste-ao-palco";
import type { Infografico } from "@/lib/content/infograficos";
import { api } from "@/lib/client/api";

export function Slide(p: {
  slug: string; title: string; objective: string | null; support: string | null; connection: string | null;
  chapter: { number: number; title: string; color: string; soft: string }; unitLabel: string; pageIndex: number; pageCount: number;
  blocks: Block[]; questions: PublicQuestion[]; classId: string; prev: string | null; next: string | null; position: string;
  teacherGuide: Record<string, unknown> | null; sessionId: string | null; isStaff: boolean; minutes: number; level: string;
  infografico?: Infografico | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(false);
  const [reveal, setReveal] = useState(0); // revelação progressiva: 0 = título, 1 = objetivo e apoio, 2 = tudo ("Mostrar mais")
  const maxReveal = 2;
  const go = (slug: string | null) => { if (!slug) return; setReveal(0); router.push(`/apresentacao/${slug}${p.sessionId ? `?sessao=${p.sessionId}` : ""}`); };

  // sincroniza a sessão ao vivo (professor "apresenta" esta página)
  useEffect(() => {
    if (!p.sessionId || !p.isStaff) return;
    api(`/api/aovivo/${p.sessionId}/pagina`, { body: { pageSlug: p.slug } }).catch(() => {});
  }, [p.sessionId, p.slug, p.isStaff]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); if (reveal < maxReveal) setReveal(reveal + 1); else go(p.next); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); if (reveal > 0) setReveal(reveal - 1); else go(p.prev); }
      else if (e.key.toLowerCase() === "n" && p.teacherGuide) setNotes((v) => !v);
      else if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.().catch(() => {});
      else if (e.key === "Escape") router.push(`/aulas/${p.slug}`);
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <main id="conteudo" className="slide-stage min-h-screen flex flex-col">
      <div className="slide" style={{ ["--cap" as string]: p.chapter.color, ["--cap-soft" as string]: p.chapter.soft }}>
        <div className="slide-inner">
          <header className="flex items-center justify-between gap-3 eyebrow">
            <span>{p.unitLabel} · Capítulo {p.chapter.number} · {p.chapter.title}</span>
            <span className="flex items-center gap-3"><b>página {p.pageIndex} de {p.pageCount}</b><span>{p.minutes} min</span>{p.level === "complementar" && <span className="badge badge-muted">complementar</span>}</span>
          </header>
          <h1 className="mt-1 text-[clamp(22px,3.6cqh,48px)]">{p.title}</h1>
          <div className={`transition-opacity ${reveal >= 1 ? "opacity-100" : "opacity-0"}`} inert={reveal < 1}>
            {p.objective && <p className="objective"><span className="eyebrow text-[#7a5f16] mr-2">Objetivo</span>{p.objective}</p>}
            {p.support && <p className="objective max-w-[70ch]">{p.support}</p>}
          </div>
          <div className={`conteudo transition-opacity ${reveal >= 2 ? "opacity-100" : "opacity-0 pointer-events-none"}`} inert={reveal < 2}>
            {p.infografico && <div className="mb-3"><AjusteAoPalco><InfograficoCapitulo d={p.infografico} modo="apresentacao" /></AjusteAoPalco></div>}
            <ContentBlocks blocks={p.blocks} questions={p.questions} classId={p.classId} mode={p.isStaff ? "previa" : "estudo"} pageSlug={p.slug} />
          </div>
          {p.connection && reveal >= 2 && p.next && <p className="font-serif italic text-ink text-[.9em] border-t border-rule pt-1"><span className="eyebrow not-italic mr-2">A seguir</span>{p.connection}</p>}
        </div>
        <div className="absolute left-0 bottom-0 h-[3px] bg-gold" style={{ width: `${(p.pageIndex / p.pageCount) * 100}%` }} aria-hidden="true" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-white/85 text-[13px] no-print" role="toolbar" aria-label="Controles da apresentação">
        <div className="flex gap-2">
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => go(p.prev)} disabled={!p.prev}>‹ Anterior</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => reveal < maxReveal ? setReveal(reveal + 1) : go(p.next)}>{reveal < maxReveal ? "Mostrar mais" : "Próxima ›"}</button>
        </div>
        <span>página {p.position}<span className="hidden md:inline"> · setas ou espaço avançam · F tela cheia{p.teacherGuide ? " · N notas" : ""} · Esc sai</span></span>
        <div className="flex gap-2">
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>Tela cheia</button>
          {p.teacherGuide && <button type="button" className="btn btn-sm btn-secondary" aria-pressed={notes} onClick={() => setNotes(!notes)}>{notes ? "Ocultar notas" : "Notas do professor"}</button>}
          <Link href={`/aulas/${p.slug}`} className="btn btn-sm btn-ghost text-white">Sair da apresentação</Link>
        </div>
      </div>
      {notes && p.teacherGuide && (
        <aside className="mx-4 mb-4 rounded-md bg-white text-body p-4 max-w-[900px] text-[14px]" aria-label="Notas do professor (privadas)">
          <p className="eyebrow mb-2">Notas do professor · privado</p>
          <dl className="kv">
            {["funcao", "conducao", "leitura", "pergunta", "resposta", "interacao", "verificacao", "transicao"].map((k) => typeof p.teacherGuide![k] === "string" ? <div key={k} className="contents"><dt>{k}</dt><dd>{String(p.teacherGuide![k])}</dd></div> : null)}
          </dl>
        </aside>
      )}
    </main>
  );
}

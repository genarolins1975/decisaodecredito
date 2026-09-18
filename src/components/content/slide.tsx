"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Block, PublicQuestion } from "@/lib/services/content";
import { ContentBlocks } from "./blocks";
import { InfograficoCapitulo } from "./infografico";
import type { Infografico } from "@/lib/content/infograficos";
import { api } from "@/lib/client/api";

/**
 * Apresentação 16:9 como um deck de slides. Cada página vira uma sequência de telas, um bloco ou grupo de blocos por
 * tela, empacotados pela altura medida para caber sem rolagem, já com o título compacto no alto (o apoio aparece na
 * primeira tela). Uma tela que não cabe recebe zoom; nenhuma tela fica vazia. Setas e espaço avançam tela a tela e
 * depois de página. Página sem blocos mostra a capa.
 */
export function Slide(p: {
  slug: string; title: string; objective: string | null; support: string | null; connection: string | null;
  chapter: { number: number; title: string; color: string; soft: string }; unitLabel: string; pageIndex: number; pageCount: number;
  blocks: Block[]; questions: PublicQuestion[]; classId: string; prev: string | null; next: string | null; position: string;
  teacherGuide: Record<string, unknown> | null; sessionId: string | null; isStaff: boolean; minutes: number; level: string;
  infografico?: Infografico | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(false);
  const [tela, setTela] = useState(0); // índice da tela atual
  const [telas, setTelas] = useState<number[][] | null>(null); // índices de bloco por tela (−1 = infográfico); vazio = só a capa
  const areaRef = useRef<HTMLDivElement>(null);
  const telaRef = useRef<HTMLDivElement>(null);
  const indices = [...(p.infografico ? [-1] : []), ...p.blocks.map((_, i) => i)];
  const total = telas ? Math.max(1, telas.length) : 1;
  const go = (slug: string | null) => { if (!slug) return; router.push(`/apresentacao/${slug}${p.sessionId ? `?sessao=${p.sessionId}` : ""}`); };
  const avancar = () => { if (tela < total - 1) setTela(tela + 1); else go(p.next); };
  const voltar = () => { if (tela > 0) setTela(tela - 1); else go(p.prev); };

  // mede a altura natural de cada bloco (com o cabeçalho compacto) e empacota em telas que cabem
  useLayoutEffect(() => {
    const area = areaRef.current; if (!area) return;
    const disponivel = area.clientHeight; const gap = Math.max(8, disponivel * 0.015);
    const els = Array.from(area.querySelectorAll<HTMLElement>("[data-bloco]"));
    const grupos: number[][] = []; let atual: number[] = []; let soma = 0;
    for (const el of els) {
      const i = Number(el.dataset.bloco); const h = el.getBoundingClientRect().height;
      if (atual.length && soma + gap + h > disponivel) { grupos.push(atual); atual = []; soma = 0; }
      atual.push(i); soma += (soma ? gap : 0) + h;
    }
    if (atual.length) grupos.push(atual);
    setTelas(grupos); setTela(0);
  }, [p.slug]);

  // ajuste ao palco: a tela preenche a área como um slide. Escala para baixo quando não cabe e para cima (com reflow,
  // até 1,35) quando sobra espaço; a largura é compensada para o conteúdo continuar ocupando a área inteira.
  useEffect(() => {
    const el = telaRef.current, area = areaRef.current; if (!el || !area || !telas || tela === 0) return;
    let raf = 0; let ultimo = "";
    const ajustar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let z = Number(el.dataset.zoom || 1) || 1;
        const alvo = area.clientHeight - 4;
        const aplicar = (v: number) => { el.style.zoom = v.toFixed(3); el.style.width = `${(100 / v).toFixed(3)}%`; return el.getBoundingClientRect().height; };
        for (let k = 0; k < 8; k++) {
          const usado = aplicar(z); if (usado <= 0) break;
          const razao = alvo / usado;
          if (razao >= 1 && razao <= 1.03) break;
          z = Math.max(0.55, Math.min(1.35, z * razao * 0.985));
        }
        // nunca terminar com rolagem: correção final para baixo
        for (let k = 0; k < 6; k++) { const usado = aplicar(z); if (usado <= alvo || z <= 0.55) break; z = Math.max(0.55, z * (alvo / usado) * 0.99); }
        aplicar(z);
        el.dataset.zoom = z.toFixed(2); ultimo = el.dataset.zoom;
      });
    };
    ajustar();
    const ro = new ResizeObserver(() => { if (el.dataset.zoom === ultimo) ajustar(); });
    ro.observe(area); ro.observe(el);
    const fontes = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts; fontes?.ready.then(ajustar);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); el.style.zoom = "1"; el.style.width = ""; delete el.dataset.zoom; };
  }, [tela, telas]);

  // sincroniza a sessão ao vivo (professor "apresenta" esta página)
  useEffect(() => {
    if (!p.sessionId || !p.isStaff) return;
    api(`/api/aovivo/${p.sessionId}/pagina`, { body: { pageSlug: p.slug } }).catch(() => {});
  }, [p.sessionId, p.slug, p.isStaff]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); avancar(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); voltar(); }
      else if (e.key.toLowerCase() === "n" && p.teacherGuide) setNotes((v) => !v);
      else if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.().catch(() => {});
      else if (e.key === "Escape") router.push(`/aulas/${p.slug}`);
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const capa = telas !== null && telas.length === 0; // página sem blocos: mostra título, objetivo e apoio
  const visiveis = telas === null ? null : capa ? [] : telas[tela];
  const ultima = telas !== null && tela === total - 1;
  const mostra = (i: number) => visiveis === null || visiveis.includes(i);

  return (
    <main id="conteudo" className="slide-stage min-h-screen flex flex-col">
      <div className="slide" style={{ ["--cap" as string]: p.chapter.color, ["--cap-soft" as string]: p.chapter.soft }}>
        <div className={`slide-inner ${capa ? "slide-inner--capa" : "slide-inner--tela"}`}>
          <header className="flex items-center justify-between gap-3 eyebrow">
            <span>{p.unitLabel} · Capítulo {p.chapter.number} · {p.chapter.title}</span>
            <span className="flex items-center gap-3"><b>página {p.pageIndex} de {p.pageCount}</b><span>{p.minutes} min</span>{p.level === "complementar" && <span className="badge badge-muted">complementar</span>}</span>
          </header>
          {capa ? (
            <div className="slide-capa">
              <h1>{p.title}</h1>
              {p.objective && <p className="objective"><span className="eyebrow text-[#7a5f16] mr-2">Objetivo</span>{p.objective}</p>}
              {p.support && <p className="objective slide-capa-apoio">{p.support}</p>}
            </div>
          ) : (
            <div>
              <h1 className="slide-titulo-compacto">{p.title}{p.objective && <span className="slide-titulo-objetivo"> · {p.objective}</span>}</h1>
              {p.support && tela === 0 && <p className="slide-apoio-compacto">{p.support}</p>}
            </div>
          )}
          <div ref={areaRef} className={`conteudo slide-area ${capa ? "slide-area--capa" : ""}`}>
            <div ref={telaRef} className="palco-tela">
              {p.infografico && <div data-bloco={-1} className={mostra(-1) ? undefined : "hidden"}><InfograficoCapitulo d={p.infografico} modo="apresentacao" /></div>}
              <ContentBlocks blocks={p.blocks} questions={p.questions} classId={p.classId} mode={p.isStaff ? "previa" : "estudo"} pageSlug={p.slug} visiveis={visiveis} />
            </div>
          </div>
          {p.connection && ultima && p.next && <p className="font-serif italic text-ink text-[.9em] border-t border-rule pt-1"><span className="eyebrow not-italic mr-2">A seguir</span>{p.connection}</p>}
        </div>
        <div className="absolute left-0 bottom-0 h-[3px] bg-gold" style={{ width: `${(p.pageIndex / p.pageCount) * 100}%` }} aria-hidden="true" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-white/85 text-[13px] no-print" role="toolbar" aria-label="Controles da apresentação">
        <div className="flex gap-2">
          <button type="button" className="btn btn-sm btn-secondary" onClick={voltar} disabled={tela === 0 && !p.prev}>‹ Anterior</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={avancar} disabled={tela >= total - 1 && !p.next}>Próxima ›</button>
        </div>
        <span>página {p.position}{total > 1 ? ` · tela ${tela + 1} de ${total}` : ""}<span className="hidden md:inline"> · setas ou espaço avançam · F tela cheia{p.teacherGuide ? " · N notas" : ""} · Esc sai</span></span>
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

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Block, PublicQuestion } from "@/lib/services/content";
import { ContentBlocks } from "./blocks";
import { InfograficoCapitulo } from "./infografico";
import { ROTULOS_GUIA } from "./teacher-guide";
import type { Infografico } from "@/lib/content/infograficos";
import { PALCO_PROPRIO } from "@/lib/visuais/palco-proprio";
import { api } from "@/lib/client/api";
import { aplicarTela, compor, mostrarTudo, type Composicao } from "@/lib/palco/unidades";

/**
 * Apresentação 16:9 como um deck de slides. Cada página vira uma sequência de telas compostas a partir das unidades do
 * conteúdo (parágrafos, painéis, figuras, questões), inclusive dentro do HTML do material: o compositor mede cada
 * unidade e escolhe o menor número de telas que cabem, equilibradas entre si (src/lib/palco). Colunas do material
 * (.palcoflex) ficam lado a lado, com a figura persistindo enquanto o texto é paginado. Uma tela que ainda não cabe
 * recebe zoom; a que sobra espaço cresce até 1,5. Nenhuma tela fica vazia. Recompõe ao redimensionar (tela cheia).
 * Setas e espaço avançam tela a tela e depois de página. Página sem blocos mostra a capa.
 */
const NOTAS_NO_PALCO = new Set(["funcao", "conducao", "leitura", "pergunta", "resposta", "interacao", "verificacao", "transicao", "aula"]);

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
  const [comp, setComp] = useState<Composicao | null>(null); // unidades e telas; telas vazias = só a capa
  const areaRef = useRef<HTMLDivElement>(null);
  const telaRef = useRef<HTMLDivElement>(null);
  const total = comp ? Math.max(1, comp.telas.length) : 1;
  const go = (slug: string | null) => { if (!slug) return; router.push(`/apresentacao/${slug}${p.sessionId ? `?sessao=${p.sessionId}` : ""}`); };
  const avancar = () => { if (tela < total - 1) setTela(tela + 1); else go(p.next); };
  const voltar = () => { if (tela > 0) setTela(tela - 1); else go(p.prev); };

  // compõe as telas: mede as unidades com tudo visível e zoom 1, e refaz quando a área muda de altura (tela cheia).
  // A linha "A seguir" ocupa espaço em todas as telas (só fica visível na última) para a área não mudar de altura entre telas.
  useLayoutEffect(() => {
    const area = areaRef.current, el = telaRef.current; if (!area || !el) return;
    let alturaBase = 0; let raf = 0;
    const compor_ = () => {
      el.style.zoom = "1"; delete el.dataset.zoom;
      alturaBase = area.clientHeight;
      const c = compor(el, alturaBase);
      if (process.env.NODE_ENV !== "production") (window as unknown as { __composicao?: Composicao }).__composicao = c;
      setComp(c); setTela((t) => Math.min(t, Math.max(0, c.telas.length - 1)));
    };
    compor_(); setTela(0);
    const ro = new ResizeObserver(() => {
      const h = area.clientHeight; if (!alturaBase || Math.abs(h - alturaBase) / alturaBase < 0.04) return;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(compor_);
    });
    ro.observe(area);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); mostrarTudo(el); };
  }, [p.slug]);

  // mostra só as unidades da tela atual
  useLayoutEffect(() => {
    const el = telaRef.current; if (!el || !comp) return;
    aplicarTela(el, comp, tela);
  }, [tela, comp]);

  // ajuste ao palco: a tela preenche a área como um slide. Escala para baixo quando não cabe e para cima (com reflow,
  // até 1,5) quando sobra espaço. A largura fica em 100%: com o zoom padrão do navegador as porcentagens já se
  // resolvem no espaço ampliado, então compensar a largura faria o conteúdo sobrar ou faltar na horizontal.
  useEffect(() => {
    const el = telaRef.current, area = areaRef.current; if (!el || !area || !comp) return;
    let raf = 0; let ultimo = "";
    const ajustar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // estimativa única a partir da altura natural (zoom 1) e correção só para baixo: sem oscilação com o reflow
        const alvo = area.clientHeight - 4;
        const aplicar = (v: number) => { el.style.zoom = v.toFixed(3); return el.getBoundingClientRect().height; };
        // quadro próprio: já dimensionado pela altura da área; zoom fixo em 1
        if (PALCO_PROPRIO.has(p.slug)) { aplicar(1); el.dataset.zoom = "1.00"; ultimo = "1.00"; return; }
        const natural = aplicar(1); if (natural <= 0) return;
        // tela com iframe herdado não recebe zoom: o documento do iframe reflui com a largura e realimentaria o ajuste
        if (el.querySelector("iframe") && !el.querySelector("iframe")!.closest("[data-oculto]")) { el.dataset.zoom = "1.00"; ultimo = "1.00"; return; }
        let z = Math.max(0.55, Math.min(1.5, (alvo / natural) * 0.995));
        for (let k = 0; k < 6; k++) { const usado = aplicar(z); if (usado <= alvo || z <= 0.55) break; z = Math.max(0.55, z * (alvo / usado) * 0.99); }
        // o reflow pode ter deixado folga (colunas mais largas ao reduzir): tenta subir; se a subida estoura, bisseção
        // entre o valor que cabe e o que não cabe, sempre terminando num valor verificado
        for (let k = 0; k < 2; k++) {
          const usado = aplicar(z); if (usado >= alvo * 0.92 || z >= 1.5) break;
          let alto = Math.min(1.5, z * (alvo / usado) * 0.98);
          if (aplicar(alto) <= alvo) { z = alto; continue; }
          for (let b = 0; b < 4; b++) { const meio = (z + alto) / 2; if (aplicar(meio) <= alvo) z = meio; else alto = meio; }
          aplicar(z); break;
        }
        el.dataset.zoom = z.toFixed(2); ultimo = el.dataset.zoom;
      });
    };
    ajustar();
    const ro = new ResizeObserver(() => { if (el.dataset.zoom === ultimo) ajustar(); });
    ro.observe(el);
    const fontes = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts; fontes?.ready.then(ajustar);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); el.style.zoom = "1"; delete el.dataset.zoom; };
  }, [tela, comp]);

  // sincroniza a sessão ao vivo (professor "apresenta" esta página)
  useEffect(() => {
    if (!p.sessionId || !p.isStaff) return;
    api(`/api/aovivo/${p.sessionId}/pagina`, { body: { pageSlug: p.slug } }).catch(() => {});
  }, [p.sessionId, p.slug, p.isStaff]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(t.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); avancar(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); voltar(); }
      else if (e.key.toLowerCase() === "n" && p.teacherGuide) setNotes((v) => !v);
      else if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.().catch(() => {});
      else if (e.key === "Escape") router.push(`/aulas/${p.slug}`);
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const capa = comp !== null && comp.telas.length === 0; // página sem blocos: mostra título, objetivo e apoio
  const proprio = PALCO_PROPRIO.has(p.slug); // o visual desenha o próprio quadro: sem cabeçalho nem título da moldura
  const ultima = comp !== null && tela === total - 1;

  return (
    <main id="conteudo" className="slide-stage min-h-screen flex flex-col">
      <div className="slide" style={{ ["--cap" as string]: p.chapter.color, ["--cap-soft" as string]: p.chapter.soft }}>
        <div className={`slide-inner ${capa ? "slide-inner--capa" : "slide-inner--tela"}`}>
          {!proprio && <header className="flex items-center justify-between gap-3 eyebrow">
            <span>{p.unitLabel} · Capítulo {p.chapter.number} · {p.chapter.title}</span>
            <span className="flex items-center gap-3"><b>página {p.pageIndex} de {p.pageCount}</b><span>{p.minutes} min</span>{p.level === "complementar" && <span className="badge badge-muted">complementar</span>}</span>
          </header>}
          {proprio ? null : capa ? (
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
              {p.infografico && <div data-bloco={-1}><InfograficoCapitulo d={p.infografico} modo="apresentacao" /></div>}
              <ContentBlocks blocks={p.blocks} questions={p.questions} classId={p.classId} mode={p.isStaff ? "previa" : "estudo"} pageSlug={p.slug} palco pagina={{ index: p.pageIndex, total: p.pageCount }} />
            </div>
          </div>
          {p.connection && p.next && !proprio && <p className="font-serif italic text-ink text-[.9em] border-t border-rule pt-1" style={ultima ? undefined : { visibility: "hidden" }} aria-hidden={!ultima}><span className="eyebrow not-italic mr-2">A seguir</span>{p.connection}</p>}
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
            {/* no palco, só o que se usa com a turma diante da tela, com os mesmos rótulos da página de estudo */}
            {ROTULOS_GUIA.filter(([, k]) => NOTAS_NO_PALCO.has(k)).map(([rotulo, k]) => typeof p.teacherGuide![k] === "string" && p.teacherGuide![k] ? <div key={k} className="contents"><dt>{rotulo}</dt><dd>{String(p.teacherGuide![k])}</dd></div> : null)}
          </dl>
        </aside>
      )}
    </main>
  );
}

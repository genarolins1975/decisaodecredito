"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui";
import type { BlocoAula2, RoteiroSlideAula2, SlidePublico } from "@/lib/content/aula-2";
import { RoteiroSlide } from "./roteiro-slide";

const TOTAL = 50;
const hrefSlide = (n: string) => `/aulas/aula-2/slide/${n}`;
const hashDe = (n: string) => `#/slide/${n}`;
type JanelaBaralho = Window & { App?: { definirModo?: (modo: string) => boolean; trocar?: (n: string) => boolean } };
/** Leva o baralho ao slide sem recarga e sem tocar no src. App.trocar muda o slide sem entrada nova no
    histórico do navegador, para que Voltar desfaça um passo, e não dois; o hash é o caminho de reserva
    (um location.replace vindo de fora do quadro recarregaria o arquivo inteiro). */
function levarBaralhoA(w: Window | null | undefined, n: string) {
  try {
    if (!w || w.location.hash === hashDe(n)) return;
    const app = (w as JanelaBaralho).App;
    if (app?.trocar) app.trocar(n); else w.location.hash = hashDe(n);
  } catch { /* o baralho ainda não carregou: o load aplica */ }
}

/**
 * Um slide da Aula 2 com a mesma moldura das páginas das outras aulas: barra lateral com os 50
 * slides por bloco, cabeçalho do slide, o baralho embutido, o que o slide traz e Anterior/Próxima.
 *
 * O baralho é carregado uma única vez (trocar o src recarregaria o arquivo e apagaria a exploração
 * do aluno) e navega por `#/slide/NN`. Duas direções de sincronia: a casca muda o hash do baralho
 * quando o leitor clica na lista ou em Anterior e Próxima; o baralho avisa a casca, por hashchange,
 * quando o leitor navega com as setas, o índice ou a barra dele. O endereço da página acompanha
 * sem recarregar, por pushState (cliques na casca) e replaceState (navegação dentro do baralho).
 * Um clique na casca é uma troca de página como nas outras aulas: começa do alto, com o slide à vista.
 */
export function AulaSlides({ slides, blocos, inicial, userId, titulos, roteiros, unidadeTitulo }: {
  slides: SlidePublico[]; blocos: BlocoAula2[]; inicial: string; userId: string; titulos: Record<string, string>;
  roteiros: Record<string, RoteiroSlideAula2> | null; unidadeTitulo: string;
}) {
  const [atual, setAtual] = useState(inicial);
  // uma navegação do Next para outro slide (Voltar do navegador, link externo) chega como prop nova
  const [inicialVisto, setInicialVisto] = useState(inicial);
  if (inicial !== inicialVisto) { setInicialVisto(inicial); setAtual(inicial); }
  const quadro = useRef<HTMLIFrameElement>(null);
  const [src] = useState(() => `/slides/aula-2?modo=livre&estado=${encodeURIComponent(userId)}${hashDe(inicial)}`);

  const janela = useRef<Window | null>(null);
  const irPara = useCallback((n: string, empurrar: boolean) => {
    setAtual(n);
    // primeiro o endereço da página, depois o quadro: a entrada anterior do histórico guarda os dois no slide de antes
    const href = hrefSlide(n);
    if (window.location.pathname !== href) window.history[empurrar ? "pushState" : "replaceState"](null, "", href);
    levarBaralhoA(janela.current, n);
    if (empurrar) window.scrollTo({ top: 0 });
  }, []);

  // o baralho carregou ou navegou por conta própria: a casca acompanha
  useEffect(() => {
    const f = quadro.current;
    if (!f) return;
    const aoMudar = () => {
      try {
        const m = /#\/slide\/(\d\d)/.exec(janela.current?.location.hash ?? "");
        if (m) irPara(m[1], false);
      } catch { /* janela indisponível */ }
    };
    const ligar = () => {
      try {
        janela.current?.removeEventListener("hashchange", aoMudar);
        janela.current = f.contentWindow;
        janela.current?.addEventListener("hashchange", aoMudar);
        (janela.current as JanelaBaralho | null)?.App?.definirModo?.("livre");
        aoMudar();
      } catch { /* origem diferente não acontece: mesma origem */ }
    };
    f.addEventListener("load", ligar);
    /* A página chega do servidor com o iframe já no HTML: o baralho pode terminar de carregar
       antes de a hidratação ligar este efeito, e aí o load já passou. */
    try {
      const w = f.contentWindow;
      if (w && w.location.href !== "about:blank" && w.document.readyState === "complete") ligar();
    } catch { /* ainda carregando: o load acima liga */ }
    return () => { f.removeEventListener("load", ligar); try { janela.current?.removeEventListener("hashchange", aoMudar); } catch { /* já fechado */ } };
  }, [irPara]);

  // quando a prop muda (navegação do Next) ou o baralho acaba de carregar, ele recebe o slide
  useEffect(() => { levarBaralhoA(janela.current, atual); }, [atual]);

  // Voltar e Avançar do navegador entre slides já visitados
  useEffect(() => {
    const aoVoltar = () => {
      const m = /\/aulas\/aula-2\/slide\/(\d{1,2})(?:\/|$)/.exec(window.location.pathname);
      if (m) irPara(m[1].padStart(2, "0"), false);
    };
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, [irPara]);

  const i = slides.findIndex((s) => s.n === atual);
  const slide = slides[i] ?? slides[0];
  const anterior = i > 0 ? slides[i - 1] : null;
  const proximo = i >= 0 && i < slides.length - 1 ? slides[i + 1] : null;
  const bloco = blocos.find((b) => b.chave === slide.bloco) ?? blocos[0];

  /* As setas navegam também com o foco fora do baralho (na lista, em Anterior e Próxima, na página),
     como dentro dele; Alt com as setas continua valendo, como nas páginas das outras aulas. As teclas
     apertadas com o foco dentro do baralho não chegam aqui: o baralho as trata e avisa por hashchange. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === "ArrowRight" && proximo) { e.preventDefault(); irPara(proximo.n, true); }
      if (e.key === "ArrowLeft" && anterior) { e.preventDefault(); irPara(anterior.n, true); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anterior, proximo, irPara]);

  // a lista lateral acompanha o slide atual
  useEffect(() => {
    document.querySelector<HTMLElement>('[data-lista="slides"] a[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [atual]);

  /* O baralho entra em modo estudo abaixo de 1100px de largura. Na coluna da página ele é desenhado
     em 1280 por 720 e reduzido por transform até a largura disponível; em tela estreita recebe a
     largura inteira e o modo estudo do próprio baralho, que rola na vertical. */
  const PALCO = { w: 1280, h: 720 };
  const caixa = useRef<HTMLDivElement>(null);
  const [larguraCaixa, setLarguraCaixa] = useState(0);
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLarguraCaixa(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const estreito = larguraCaixa > 0 && larguraCaixa < 900;
  const escala = estreito ? 1 : Math.min(1, (larguraCaixa || PALCO.w) / PALCO.w);

  const cliqueEm = (n: string) => (e: React.MouseEvent) => { e.preventDefault(); irPara(n, true); };
  const lista = (compacta: boolean) => (
    <div className={compacta ? "mt-2" : "max-h-[60vh] overflow-auto"} data-lista={compacta ? undefined : "slides"}>
      {blocos.map((b) => (
        <div key={b.chave}>
          <p className="eyebrow mt-3 mb-1" style={{ color: b.cor }}>{b.nome}</p>
          <ol className="link-list list-none p-0 m-0 text-[13px]">
            {b.slides.map((s) => (
              <li key={s.n}><a href={hrefSlide(s.n)} onClick={cliqueEm(s.n)} aria-current={s.n === atual ? "page" : undefined}><span className="font-mono text-[11px] text-muted mr-2">{s.n}</span>{s.titulo}</a></li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-[100px] self-start no-print" aria-label="Slides da aula">
        <details className="lg:hidden panel-soft">
          <summary className="cursor-pointer font-semibold text-ink min-h-[44px] flex items-center">Aula 2 · slide {atual} de {TOTAL}</summary>
          {lista(true)}
          <div className="mt-3 flex gap-2 flex-wrap"><Link href="/aulas/aula-2" className="btn btn-secondary btn-sm">Abertura da aula</Link><a href={`/slides/aula-2${hashDe(atual)}`} className="btn btn-secondary btn-sm">Ver em tela cheia</a><Link href="/aulas" className="btn btn-ghost btn-sm">Todas as aulas</Link></div>
        </details>
        <div className="hidden lg:block">
          <Link href="/aulas" className="voltar mb-2">Aulas</Link>
          <p className="eyebrow mb-2">Aula 2 · {TOTAL} slides</p>
          <p className="font-serif font-bold text-ink text-[15px] mb-1"><Link href="/aulas/aula-2" className="no-underline hover:underline" title="Abertura da aula">{unidadeTitulo}</Link></p>
          {lista(false)}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/aulas/aula-2" className="btn btn-secondary btn-sm">Abertura da aula</Link>
            <a href={`/slides/aula-2${hashDe(atual)}`} className="btn btn-secondary btn-sm">Ver em tela cheia</a>
          </div>
        </div>
      </aside>
      <article className="min-w-0" style={{ ["--cap" as string]: bloco.cor, ["--cap-soft" as string]: bloco.suave }}>
        <div className="border-l-[3px] pl-4" style={{ borderColor: bloco.cor }}>
          <p className="eyebrow flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span>{slide.blocoNome}</span><b>slide {slide.n} de {TOTAL}</b>
            {slide.exercicio && <Badge tone="muted">exercício</Badge>}
          </p>
          <h1 className="mt-2">{slide.titulo}</h1>
          {slide.subtitulo && <p className="mt-2 text-[16px] max-w-[66ch]">{slide.subtitulo}</p>}
        </div>
        <div className="card p-0 overflow-hidden mt-5" data-testid="quadro-aula-2">
          <div ref={caixa} style={{ height: estreito ? "70vh" : PALCO.h * escala }}>
            <iframe ref={quadro} title={`Slide ${atual} da aula`} src={src}
              style={estreito
                ? { width: "100%", height: "100%", border: 0, display: "block" }
                : { width: PALCO.w, height: PALCO.h, border: 0, display: "block", transform: `scale(${escala})`, transformOrigin: "top left" }} />
          </div>
          <p className="hint px-4 py-2 border-t border-rule m-0" data-testid="o-que-fica-salvo">
            Setas, Índice, Estudo e Tela cheia funcionam dentro do slide. O que você mexe nos slides (controles, exercícios, escolhas) fica só nesta aba deste navegador: sobrevive a recarregar a página, some ao fechar a aba e não aparece em outro aparelho.
          </p>
        </div>
        {slide.resumo && <p className="mt-5 text-[15px] max-w-[72ch]"><span className="eyebrow text-[#7a5f16] mr-2">Neste slide</span>{slide.resumo}</p>}
        {slide.conclusao && <p className="mt-3 pt-3 border-t border-rule font-serif italic text-ink"><span className="eyebrow not-italic mr-2">Ideia para levar</span>{slide.conclusao}</p>}
        {slide.fonte && <p className="hint mt-1">{slide.fonte}</p>}
        {slide.paginas.length > 0 && (
          <p className="mt-3 text-[14px] text-muted max-w-[72ch]">
            <span className="eyebrow text-[#7a5f16] mr-2">No apêndice</span>
            {slide.paginas.map((s, k) => <span key={s}>{k > 0 && " · "}<Link href={`/aulas/${s}`} className="font-semibold" title={titulos[s] ?? s}>{titulos[s] ?? s}</Link></span>)}
          </p>
        )}
        {roteiros && <RoteiroSlide n={atual} roteiro={roteiros[atual]} />}
        <nav className="mt-8 flex items-center justify-between gap-3 border-t border-rule pt-4 no-print" aria-label="Navegação entre slides">
          {anterior ? <a href={hrefSlide(anterior.n)} onClick={cliqueEm(anterior.n)} className="btn btn-secondary" rel="prev">← Anterior</a> : <span />}
          <span className="hint text-center">slide {atual} de {TOTAL}<span className="hidden md:inline"> · ← e → também navegam</span></span>
          {proximo ? <a href={hrefSlide(proximo.n)} onClick={cliqueEm(proximo.n)} className="btn" rel="next">Próxima →</a> : <span />}
        </nav>
      </article>
    </div>
  );
}

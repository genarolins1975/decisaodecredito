"use client";
import { createContext, Fragment, useContext, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { PERGUNTAS, SLIDE, TOTAL, type Pergunta, type Slide } from "@/lib/capitulo7/roteiro";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tex } from "@/components/visuais/tex";

/**
 * Peças comuns dos quadros do capítulo 7: o quadro 16:9 com a trilha das quatro perguntas, o gráfico medido (viewBox
 * no tamanho real, letra na escala do quadro), números com denominador, controles, previsão antes de revelar,
 * expansão para fórmula e detalhe, legenda. CSS em src/app/capitulo7.css.
 */
export type Pagina = { index: number; total: number };
const ORDEM: Pergunta[] = ["ordenacao", "probabilidade", "decisao", "validacao"];
const dois = (n: number) => String(n).padStart(2, "0");

/**
 * Declaração da base em toda fonte: os números do capítulo saem da base sintética do curso. A que começa por "Janela
 * fora do tempo:" ganha semente e safras no lugar; a que já traz a semente da base, ou declara estar fora dela, fica
 * como está; as outras recebem a declaração antes do texto.
 */
const BASE_CURSO = "Base sintética (semente 20260501), safras 2023-08 a 2023-12";
export function declararBase(fonte: ReactNode, base = BASE_CURSO): ReactNode {
  // base vazia: o capítulo declara a origem dos dados na própria fonte de cada quadro (capítulo 12, dados públicos)
  if (typeof fonte !== "string" || !base) return fonte;
  if (/^Janela fora do tempo:/.test(fonte)) return fonte.replace(/^Janela fora do tempo:/, `${base}, janela fora do tempo:`);
  if (/20260501|fora da base/.test(fonte)) return fonte;
  return `${base}. ${fonte}`;
}

/**
 * Roteiro que o Quadro lê: o do capítulo 7 por padrão; outro capítulo envolve os seus quadros em ProvedorRoteiro com o
 * próprio roteiro, as próprias perguntas e a própria declaração da base.
 */
export type RoteiroQuadro = { SLIDE: Record<string, Slide>; PERGUNTAS: { id: string; nome: string; frase: string }[]; TOTAL: number; base?: string };
const RoteiroCtx = createContext<RoteiroQuadro>({ SLIDE, PERGUNTAS, TOTAL, base: BASE_CURSO });
export const ProvedorRoteiro = RoteiroCtx.Provider;

/** `titulo` e `sub` substituem os do roteiro enquanto uma previsão está aberta (pergunta antes, afirmação depois). */
export function Quadro({ slug, pagina, layout = "gl", conclusao, fonte, children, rotuloConclusao = "Leitura", sub, titulo }: {
  slug: string; pagina?: Pagina; layout?: "gl" | "lg" | "gg" | "g3" | "um" | "glx" | "qd"; conclusao?: ReactNode; fonte?: ReactNode; children: ReactNode; rotuloConclusao?: string; sub?: ReactNode; titulo?: ReactNode;
}) {
  const R = useContext(RoteiroCtx);
  const s = R.SLIDE[slug];
  const atual = ORDEM.indexOf(s.pergunta);
  const num = pagina ? `${dois(pagina.index)} / ${dois(pagina.total)}` : `${dois(s.n)} / ${dois(R.TOTAL)}`;
  return (
    <figure className="q7" data-q7={slug} data-pergunta={s.pergunta} aria-labelledby={`${slug}-tit`}>
      <div className="q7-slide">
        <header className="q7-cab">
          <div className="q7-trilha">
            <ol aria-label="As quatro perguntas do capítulo">
              {R.PERGUNTAS.map((p, i) => (
                <li key={p.id} data-on={p.id === s.pergunta ? "1" : "0"} data-feito={atual > i ? "1" : "0"} aria-current={p.id === s.pergunta ? "step" : undefined}><i aria-hidden="true" />{p.nome}</li>
              ))}
            </ol>
            <span className="q7-num" aria-label={`Slide ${num.replace(" / ", " de ")}`}>{s.nivel === "aprofundamento" ? "aprofundamento · " : s.nivel === "apendice" ? "apêndice · " : ""}{num}</span>
          </div>
          <h2 className="q7-tit" id={`${slug}-tit`}>{titulo ?? s.titulo}</h2>
          <p className="q7-sub">{sub ?? s.sub}</p>
        </header>
        <div className={`q7-corpo q7-l-${layout}`}>{children}</div>
        <footer className="q7-rod">
          {conclusao && <p className="q7-conclusao" aria-live="polite"><span>{rotuloConclusao}</span><span>{conclusao}</span></p>}
          {fonte && <p className="q7-fonte">{declararBase(fonte, R.base)}</p>}
        </footer>
      </div>
    </figure>
  );
}

export function Painel({ titulo, children, tom, className = "", estilo }: { titulo?: ReactNode; children: ReactNode; tom?: "plano" | "suave"; className?: string; estilo?: React.CSSProperties }) {
  return <section className={`q7-painel ${tom ? `q7-painel--${tom}` : ""} ${className}`} style={estilo}>{titulo && <p className="q7-k">{titulo}</p>}{children}</section>;
}

export function Kpi({ rotulo, valor, detalhe, tom, tam }: { rotulo: ReactNode; valor: ReactNode; detalhe?: ReactNode; tom?: "prob" | "dec" | "def" | "val"; tam?: "grande" | "mini" }) {
  return <div className={`q7-kpi ${tam ? `q7-kpi--${tam}` : ""}`} data-tom={tom}><span className="q7-kpi-r">{rotulo}</span><span className="q7-kpi-v">{valor}</span>{detalhe && <span className="q7-kpi-d">{detalhe}</span>}</div>;
}

export function Controle({ rotulo, valor, min, max, passo, onChange, mostrar, escala, id }: {
  rotulo: string; valor: number; min: number; max: number; passo: number; onChange: (v: number) => void; mostrar: string; escala?: [string, string]; id?: string;
}) {
  const auto = useId(); const iid = id ?? auto;
  return (
    <div className="q7-ctl">
      <label className="q7-ctl-cab" htmlFor={iid}><span>{rotulo}</span><b>{mostrar}</b></label>
      <input id={iid} type="range" min={min} max={max} step={passo} value={valor} aria-valuetext={`${rotulo}: ${mostrar}`} onChange={(e) => onChange(Number(e.target.value))} />
      {escala && <span className="q7-ctl-esc" aria-hidden="true"><span>{escala[0]}</span><span>{escala[1]}</span></span>}
    </div>
  );
}

export function Seg<T extends string | number>({ rotulo, opcoes, valor, onChange, cor, desab }: { rotulo: string; opcoes: { v: T; r: ReactNode }[]; valor: T; onChange: (v: T) => void; cor?: boolean; desab?: boolean }) {
  return (
    <div className="q7-seg" role="group" aria-label={rotulo}>
      {opcoes.map((o) => <button key={String(o.v)} type="button" className={`q7-btn ${cor ? "q7-btn--cor" : ""}`} aria-pressed={valor === o.v} disabled={desab} onClick={() => onChange(o.v)}>{o.r}</button>)}
    </div>
  );
}

export function Botao({ children, onClick, prim, sec, desab, rotulo }: { children: ReactNode; onClick: () => void; prim?: boolean; sec?: boolean; desab?: boolean; rotulo?: string }) {
  return <button type="button" className={`q7-btn ${prim ? "q7-btn--prim" : ""} ${sec ? "q7-btn--sec" : ""}`} onClick={onClick} disabled={desab} aria-label={rotulo}>{children}</button>;
}

export type Opcao = { texto: ReactNode; certa?: boolean; retorno: ReactNode };
/**
 * Previsão antes de revelar: a turma escolhe, o quadro só então mostra o resultado e o retorno da opção escolhida.
 * O retorno de uma opção errada nomeia a confusão; "Tentar outra" limpa a escolha. É recurso de aula, não nota: a
 * questão com veredito registrado fica no estudo, abaixo do quadro.
 */
export function Previsao({ pergunta, opcoes, escolha, onEscolha, rotulo = "Antes de revelar", recolher }: { pergunta: ReactNode; opcoes: Opcao[]; escolha: number | null; onEscolha: (i: number | null) => void; rotulo?: string; recolher?: boolean }) {
  const o = escolha === null ? null : opcoes[escolha];
  const so = recolher && escolha !== null;
  return (
    <div className="q7-prev">
      <p className="q7-k">{so && rotulo === "Antes de revelar" ? "Sua previsão" : rotulo}</p>
      {!so && <p className="q7-prev-q">{pergunta}</p>}
      <div className="q7-prev-ops" role="group" aria-label="Alternativas">
        {opcoes.map((op, i) => {
          if (so && i !== escolha) return null;
          const estado = escolha === null ? undefined : i === escolha ? (op.certa === undefined ? "escolhida" : op.certa ? "certa" : "errada") : undefined;
          return <button key={i} type="button" className="q7-prev-op" data-estado={estado} disabled={escolha !== null} aria-pressed={i === escolha} onClick={() => onEscolha(i)}><span className="q7-letra">{String.fromCharCode(65 + i)}</span><span>{op.texto}</span></button>;
        })}
      </div>
      {o && <p className="q7-retorno" data-tom={o.certa === undefined ? undefined : o.certa ? "certa" : "errada"} aria-live="polite">{o.retorno}</p>}
      {o && <div className="q7-botoes"><Botao sec onClick={() => onEscolha(null)}>Tentar outra</Botao></div>}
    </div>
  );
}

export function Expandir({ resumo, children, aberto }: { resumo: ReactNode; children: ReactNode; aberto?: boolean }) {
  // No quadro 16:9 nada pode ficar cortado: se o conteúdo aberto não cabe no painel, ele sobe sobre o painel, como um
  // cartão, em vez de empurrar o resto para fora. Em tela estreita (página rolável) fica no fluxo normal.
  const ref = useRef<HTMLDetailsElement>(null);
  const [sobe, setSobe] = useState<number | null>(null);
  const aoAlternar = () => {
    const d = ref.current; if (!d) return;
    if (!d.open) { setSobe(null); return; }
    const p = d.closest(".q7-painel") ?? d.closest(".q7-corpo");
    if (!p) return;
    // um aberto por vez no mesmo painel: abrir este fecha os vizinhos
    p.querySelectorAll<HTMLDetailsElement>("details.q7-exp[open]").forEach((o) => { if (o !== d) o.open = false; });
    const pr = p.getBoundingClientRect(), dr = d.getBoundingClientRect();
    const cortado = dr.bottom > pr.bottom + 1 || [...p.querySelectorAll("*")].some((e) => e.getBoundingClientRect().bottom > pr.bottom + 1);
    // altura disponível acima do resumo, dentro do painel
    setSobe(cortado ? Math.max(120, dr.top - pr.top - 8) : null);
  };
  return <details ref={ref} className="q7-exp" data-sobe={sobe !== null ? "1" : undefined} open={aberto} onToggle={aoAlternar}><summary>{resumo}</summary><div className="q7-exp-c" style={sobe !== null ? { maxHeight: sobe } : undefined}>{children}</div></details>;
}

/** Fórmula em KaTeX com a tradução dos símbolos logo abaixo. */
export function Formula({ f, simbolos, compacta }: { f: string; simbolos?: [string, ReactNode][]; compacta?: boolean }) {
  return (
    <>
      <div className={`q7-formula${compacta ? " q7-formula--compacta" : ""}`}><Tex f={f} bloco /></div>
      {simbolos && <dl className="q7-simbolos">{simbolos.map(([s, d], i) => <Fragment key={i}><dt><Tex f={s} /></dt><dd>{d}</dd></Fragment>)}</dl>}
    </>
  );
}

export function Legenda({ itens }: { itens: { mk: string; r: ReactNode }[] }) {
  return <ul className="q7-leg">{itens.map((it, i) => <li key={i}><span className={`q7-mk ${it.mk.split(" ").map((c) => `q7-mk--${c}`).join(" ")}`} aria-hidden="true" />{it.r}</li>)}</ul>;
}

/* ------------------------------------------------------------------ gráficos */

export type Dim = { w: number; h: number; fs: number };
/**
 * Gráfico medido: o SVG recebe a largura e a altura reais da área (1 unidade = 1 px) e a letra em em segue a escala do
 * quadro. Sem medida (renderização no servidor), usa a referência de 1920 × 1080. `tabela` é a versão acessível dos
 * dados, lida por leitor de tela.
 */
export function Grafico({ titulo, sub, rotulo, children, tabela, arCelular, estilo }: { titulo?: ReactNode; sub?: ReactNode; rotulo: string; children: (d: Dim) => ReactNode; tabela?: ReactNode; arCelular?: string; estilo?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const idTabela = useId();
  const [d, setD] = useState<Dim>({ w: 900, h: 480, fs: 21.5 });
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const medir = () => {
      const w = el.clientWidth, h = el.clientHeight, fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      if (w > 0 && h > 0) setD((a) => (Math.abs(a.w - w) < 0.5 && Math.abs(a.h - h) < 0.5 && Math.abs(a.fs - fs) < 0.05 ? a : { w, h, fs }));
    };
    medir(); const ro = new ResizeObserver(medir); ro.observe(el); return () => ro.disconnect();
  }, []);
  return (
    <div className="q7-graf" style={estilo}>
      {titulo && <p className="q7-graf-t">{titulo}{sub && <small>{sub}</small>}</p>}
      <div className="q7-gw" ref={ref} style={arCelular ? ({ ["--q7-ar-cel" as string]: arCelular }) : undefined}>
        <svg className="q7-svg" viewBox={`0 0 ${d.w} ${d.h}`} width={d.w} height={d.h} style={{ width: d.w, height: d.h }} role="img" aria-label={rotulo} aria-describedby={tabela ? idTabela : undefined}>{children(d)}</svg>
      </div>
      {/* a tabela de dados é a descrição do gráfico para leitor de tela; oculta na tela, lida via aria-describedby */}
      {tabela && <div hidden id={idTabela}>{tabela}</div>}
    </div>
  );
}

export type Escala = ((v: number) => number) & { d: [number, number]; r: [number, number]; inv: (p: number) => number };
export function escala(d: [number, number], r: [number, number]): Escala {
  const f = ((v: number) => r[0] + ((v - d[0]) / (d[1] - d[0])) * (r[1] - r[0])) as Escala;
  f.d = d; f.r = r; f.inv = (p: number) => d[0] + ((p - r[0]) / (r[1] - r[0])) * (d[1] - d[0]);
  return f;
}
/** Margens proporcionais à letra: o eixo cabe sem cortar rótulo em qualquer escala. */
export const margens = (fs: number, o: Partial<{ l: number; r: number; t: number; b: number }> = {}) => ({ l: fs * (o.l ?? 3.3), r: fs * (o.r ?? 1), t: fs * (o.t ?? 1), b: fs * (o.b ?? 2.8) });

export function Eixos({ x, y, xt, yt, fx, fy, xTit, yTit, grade = true }: {
  x: Escala; y: Escala; xt: number[]; yt: number[]; fx: (v: number) => string; fy: (v: number) => string; xTit?: string; yTit?: string; grade?: boolean;
}) {
  const [x0, x1] = x.r, [y0, y1] = y.r; // y0 é a base (maior coordenada)
  return (
    <g aria-hidden="true">
      {grade && yt.map((v) => <line key={`gy${v}`} className="q7-grade" x1={x0} x2={x1} y1={y(v)} y2={y(v)} />)}
      <line className="q7-eixo" x1={x0} x2={x1} y1={y0} y2={y0} />
      <line className="q7-eixo" x1={x0} x2={x0} y1={y0} y2={y1} />
      {xt.map((v) => <text key={`x${v}`} className="q7-tick" x={x(v)} y={y0} dy="1.25em" textAnchor="middle">{fx(v)}</text>)}
      {yt.map((v) => <text key={`y${v}`} className="q7-tick" x={x0} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{fy(v)}</text>)}
      {xTit && <text className="q7-eixo-t" x={(x0 + x1) / 2} y={y0} dy="2.6em" textAnchor="middle">{xTit}</text>}
      {yTit && <text className="q7-eixo-t" x={x0} y={y1} dy="-.55em" textAnchor="start">{yTit}</text>}
    </g>
  );
}

export const caminho = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");
/** Marca de classe: default é disco cheio vinho, adimplente é anel vazado; a forma carrega a classe junto com a cor. */
export function Marca({ x, y, r, def, destaque }: { x: number; y: number; r: number; def: boolean; destaque?: boolean }) {
  return def ? <circle cx={x} cy={y} r={r} className="q7-pt-def" strokeWidth={destaque ? 3 : undefined} stroke={destaque ? "#00205B" : undefined} />
    : <circle cx={x} cy={y} r={r * 0.86} className="q7-pt-adi" stroke={destaque ? "#00205B" : undefined} strokeWidth={destaque ? 3 : undefined} />;
}

/** Preferência por movimento reduzido. No servidor e na hidratação vale "sem preferência"; depois segue o sistema. */
const consultaMovimento = () => (typeof window !== "undefined" ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : undefined);
export function useMovimentoReduzido() {
  return useSyncExternalStore(
    (cb) => { const m = consultaMovimento(); m?.addEventListener?.("change", cb); return () => m?.removeEventListener?.("change", cb); },
    () => consultaMovimento()?.matches ?? false,
    () => false,
  );
}

/**
 * Link para outro slide do capítulo no mesmo modo em que o quadro está (apresentação ou estudo). Na sessão ao vivo e
 * em qualquer outro contexto, o link vira texto: navegar tiraria o aluno da sessão.
 */
export function LinkSlide({ slug, children, className, rotulo }: { slug: string; children: ReactNode; className?: string; rotulo?: string }) {
  const caminho = usePathname() ?? "";
  const base = caminho.startsWith("/apresentacao/") ? "/apresentacao" : caminho.startsWith("/aulas/") ? "/aulas" : null;
  if (!base) return <span className={className}>{children}</span>;
  return <Link href={`${base}/${slug}`} className={className} aria-label={rotulo}>{children}</Link>;
}

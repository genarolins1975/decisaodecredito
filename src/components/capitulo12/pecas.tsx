"use client";
import { Fragment, type ReactNode } from "react";
import { Grafico, LinkSlide, Quadro, type Dim, type Pagina } from "@/components/capitulo7/base";
import { BLOCOS, PERGUNTAS, SLIDE } from "@/lib/capitulo12/roteiro";
import { LUAS } from "@/lib/capitulo12/dados";
import { pixels } from "@/lib/capitulo12/metricas";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * Peças comuns do capítulo 12: a figura original da aula (imagem servida de /capitulo12, atrás do login), o dígito do
 * MNIST desenhado pixel a pixel, o bloco de código Python com destaque de linha, a matriz de confusão no formato da
 * aula (linhas são a classe real, colunas a prevista), o plano das duas luas com a região de decisão de um modelo e a
 * abertura de bloco (as quatro perguntas, uma peça própria do bloco e o fluxo de passos). CSS em src/app/capitulo12.css (prefixo q12-).
 */

/* ------------------------------------------------------------------ figura original */

/** Figura do material da aula, sempre com crédito. `alt` descreve o que a figura mostra, não o arquivo. */
export function Figura({ src, alt, credito, className = "", fundo = true }: { src: string; alt: string; credito: ReactNode; className?: string; fundo?: boolean }) {
  return (
    <figure className={`q12-fig ${fundo ? "q12-fig--fundo" : ""} ${className}`}>
      <div className="q12-fig-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/capitulo12/${src}.webp`} alt={alt} loading="lazy" decoding="async" />
      </div>
      <figcaption>{credito}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ dígito */

/** Imagem 28 × 28 do MNIST, um retângulo por pixel aceso; `grade` desenha a grade dos 784 pixels; `marca` realça um pixel. */
export function Digito({ px, rotulo, grade, marca, onPixel, tom = "ink", className = "" }: { px: string; rotulo: string; grade?: boolean; marca?: number | null; onPixel?: (i: number) => void; tom?: "ink" | "def" | "prob"; className?: string }) {
  const v = pixels(px);
  const cor = tom === "def" ? "140,35,50" : tom === "prob" ? "23,108,115" : "0,32,91";
  return (
    <svg className={`q12-dig ${className}`} viewBox="0 0 28 28" role="img" aria-label={rotulo}>
      <rect x={0} y={0} width={28} height={28} fill="#fff" />
      {v.map((p, i) => (p > 0 ? <rect key={i} x={i % 28} y={Math.floor(i / 28)} width={1.02} height={1.02} fill={`rgba(${cor},${(p / 255).toFixed(3)})`} /> : null))}
      {grade && Array.from({ length: 29 }, (_, k) => <Fragment key={k}><line x1={k} x2={k} y1={0} y2={28} stroke="#C9CDD5" strokeWidth={0.04} /><line y1={k} y2={k} x1={0} x2={28} stroke="#C9CDD5" strokeWidth={0.04} /></Fragment>)}
      {marca != null && <rect x={marca % 28} y={Math.floor(marca / 28)} width={1} height={1} fill="none" stroke="#C9A84C" strokeWidth={0.22} />}
      {onPixel && <rect x={0} y={0} width={28} height={28} fill="transparent" style={{ cursor: "crosshair" }} onClick={(e) => { const r = (e.currentTarget as SVGRectElement).getBoundingClientRect(); const cx = Math.floor(((e.clientX - r.left) / r.width) * 28), cy = Math.floor(((e.clientY - r.top) / r.height) * 28); onPixel(Math.min(783, Math.max(0, cy * 28 + cx))); }} />}
    </svg>
  );
}

/* ------------------------------------------------------------------ código */

const PALAVRAS = /\b(from|import|as|True|False|None|def|return|for|in)\b/;
/** Uma linha de Python com cores para palavra-chave, texto entre aspas, número e comentário. */
function LinhaPy({ s }: { s: string }) {
  const partes: ReactNode[] = [];
  const re = /(#.*$)|("[^"]*")|(\b\d+(?:\.\d+)?\b)|(\b(?:from|import|as|True|False|None|def|return|for|in)\b)/g;
  let ult = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(s))) {
    if (m.index > ult) partes.push(s.slice(ult, m.index));
    const cls = m[1] ? "q12-py-c" : m[2] ? "q12-py-s" : m[3] ? "q12-py-n" : PALAVRAS.test(m[0]) ? "q12-py-k" : "";
    partes.push(<span key={k++} className={cls}>{m[0]}</span>);
    ult = m.index + m[0].length;
  }
  if (ult < s.length) partes.push(s.slice(ult));
  return <>{partes}</>;
}
/** Bloco de código; `destaque` são os índices (0 a n − 1) das linhas realçadas, que o quadro liga à peça ao lado. */
export function Codigo({ linhas, destaque = [], rotulo, compacto }: { linhas: string[]; destaque?: number[]; rotulo: string; compacto?: boolean }) {
  return (
    <pre className={`q12-cod ${compacto ? "q12-cod--compacto" : ""}`} aria-label={rotulo} tabIndex={0}>
      <code>{linhas.map((l, i) => <span key={i} className="q12-cod-l" data-on={destaque.includes(i) ? "1" : undefined}><LinhaPy s={l} />{"\n"}</span>)}</code>
    </pre>
  );
}

/* ------------------------------------------------------------------ matriz de confusão */

export type Cel = "vn" | "fp" | "fn" | "vp";
/**
 * Matriz no formato da aula: linhas são a classe real, colunas a prevista; acertos na diagonal. `realce` pinta as
 * células que entram numa métrica (coluna da previsão positiva para precisão, linha da classe positiva para recall).
 */
export function MatrizReal({ vn, fp, fn, vp, pos = "5", neg = "não 5", realce = [], foco, onFoco, oculta = [], compacta }: {
  vn: number; fp: number; fn: number; vp: number; pos?: string; neg?: string; realce?: Cel[]; foco?: Cel | null; onFoco?: (c: Cel) => void; oculta?: Cel[]; compacta?: boolean;
}) {
  const nome: Record<Cel, [string, string]> = { vn: ["VN", "verdadeiro negativo"], fp: ["FP", "falso positivo"], fn: ["FN", "falso negativo"], vp: ["VP", "verdadeiro positivo"] };
  const val: Record<Cel, number> = { vn, fp, fn, vp };
  const cel = (c: Cel) => {
    const Tag = onFoco ? "button" : "div";
    const acerto = c === "vn" || c === "vp";
    // com clique, o botão fica dentro de uma célula: uma linha de tabela só aceita células como filhas
    const envolve = (x: ReactNode) => (onFoco ? <span role="cell" className="q12-mx-cel">{x}</span> : x);
    return envolve(
      <Tag type={onFoco ? "button" : undefined} className="q12-mx-c" data-cel={c} data-acerto={acerto ? "1" : "0"} data-realce={realce.includes(c) ? "1" : undefined} data-foco={foco === c ? "1" : undefined}
        onClick={onFoco ? () => onFoco(c) : undefined} aria-pressed={onFoco ? foco === c : undefined} role={onFoco ? undefined : "cell"}>
        <span className="q12-mx-v">{oculta.includes(c) ? "?" : int(val[c])}</span>
        {!compacta && <span className="q12-mx-n"><b>{nome[c][0]}</b> {nome[c][1]}</span>}
        {compacta && <span className="q12-mx-n"><b>{nome[c][0]}</b></span>}
      </Tag>,
    );
  };
  return (
    <div className={`q12-mx ${compacta ? "q12-mx--compacta" : ""}`} role="table" aria-label={`Matriz de confusão: ${int(vn)} verdadeiros negativos, ${int(fp)} falsos positivos, ${int(fn)} falsos negativos, ${int(vp)} verdadeiros positivos`}>
      <div className="q12-mx-cab" role="row"><span role="columnheader"><span className="q7-sr">Classe real</span></span><span role="columnheader">Previsto: {neg}</span><span role="columnheader">Previsto: {pos}</span></div>
      <div className="q12-mx-lin" role="row"><span className="q12-mx-r" role="rowheader">Real: {neg}</span>{cel("vn")}{cel("fp")}</div>
      <div className="q12-mx-lin" role="row"><span className="q12-mx-r" role="rowheader">Real: {pos}</span>{cel("fn")}{cel("vp")}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ duas luas */

/** Classe de cada célula da grade de decisão (0 ou 1), lida do texto gravado pela referência. */
export const GRADE = LUAS.grade;
export type RegiaoLua = string; // 96 × 60 caracteres "0" e "1", linha a linha de baixo para cima em y

/**
 * Plano das duas luas: pontos de treino ou de teste (classe 0 como círculo azul, classe 1 como triângulo verde) e,
 * se `regiao` vier, a região de decisão do modelo pintada por célula, com a fronteira em linha escura.
 */
export function PlanoLuas({ regiao, conjunto = "treino", erros, rotulo, titulo, sub, destaque, arCelular }: {
  regiao?: RegiaoLua | null; conjunto?: "treino" | "teste" | "ambos"; erros?: string | null; rotulo: string; titulo?: ReactNode; sub?: ReactNode; destaque?: number[]; arCelular?: string;
}) {
  const [x0, x1, nx] = GRADE.x as [number, number, number], [y0, y1, ny] = GRADE.y as [number, number, number];
  return (
    <Grafico titulo={titulo} sub={sub} rotulo={rotulo} arCelular={arCelular ?? "8 / 5"}>
      {(d: Dim) => {
        const m = { l: d.fs * 2.4, r: d.fs * 0.6, t: d.fs * 0.5, b: d.fs * 2 };
        const W = d.w - m.l - m.r, H = d.h - m.t - m.b;
        // mesma escala nos dois eixos: o plano não deforma as luas
        const k = Math.min(W / (x1 - x0), H / (y1 - y0));
        const ox = m.l + (W - k * (x1 - x0)) / 2, oy = m.t + (H - k * (y1 - y0)) / 2;
        const X = (v: number) => ox + (v - x0) * k, Y = (v: number) => oy + (y1 - v) * k;
        const dx = (x1 - x0) / (nx - 1), dy = (y1 - y0) / (ny - 1);
        const pts: { x: number; y: number; c: number; t: boolean; i: number }[] = [];
        if (conjunto !== "teste") LUAS.treino.x.forEach((p, i) => pts.push({ x: p[0], y: p[1], c: LUAS.treino.y[i], t: false, i }));
        if (conjunto !== "treino") LUAS.teste.x.forEach((p, i) => pts.push({ x: p[0], y: p[1], c: LUAS.teste.y[i], t: true, i }));
        const r = Math.max(2.2, d.fs * 0.2);
        const celulas: ReactNode[] = [];
        if (regiao) for (let j = 0; j < ny; j++) {
          // uma faixa por sequência de células da mesma classe na linha: menos elementos que um retângulo por célula
          let ini = 0;
          for (let i = 1; i <= nx; i++) {
            if (i === nx || regiao[j * nx + i] !== regiao[j * nx + ini]) {
              const c = regiao[j * nx + ini];
              celulas.push(<rect key={`${j}-${ini}`} x={X(x0 + (ini - 0.5) * dx)} y={Y(y0 + (j + 0.5) * dy)} width={(i - ini) * dx * k + 0.6} height={dy * k + 0.6} fill={c === "1" ? "#E3F1E8" : "#E7EDF7"} />);
              ini = i;
            }
          }
        }
        return (
          <g>
            <clipPath id="q12-luas-clip"><rect x={X(x0)} y={Y(y1)} width={(x1 - x0) * k} height={(y1 - y0) * k} /></clipPath>
            <g clipPath="url(#q12-luas-clip)">{celulas}</g>
            <rect x={X(x0)} y={Y(y1)} width={(x1 - x0) * k} height={(y1 - y0) * k} fill="none" stroke="#C9CDD5" />
            {[-1, 0, 1, 2].map((v) => <text key={`x${v}`} className="q7-tick" x={X(v)} y={Y(y0)} dy="1.25em" textAnchor="middle">{v}</text>)}
            {[-1, -0.5, 0, 0.5, 1, 1.5].map((v) => <text key={`y${v}`} className="q7-tick" x={X(x0)} dx="-.4em" y={Y(v)} dy=".34em" textAnchor="end">{String(v).replace(".", ",").replace("-", "−")}</text>)}
            {pts.filter((p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1).map((p) => {
              const errou = erros && p.t ? erros[p.i] !== String(p.c) : false;
              const on = destaque?.includes(p.i) && p.t;
              const cx = X(p.x), cy = Y(p.y), rr = on ? r * 1.6 : r;
              const cor = p.c ? "#2E6B4F" : "#3D5A8A";
              return (
                <g key={`${p.t ? "t" : "a"}${p.i}`} opacity={conjunto === "ambos" && !p.t ? 0.35 : 1}>
                  {p.c ? <path d={`M${cx} ${cy - rr * 1.15}L${cx + rr} ${cy + rr * 0.75}L${cx - rr} ${cy + rr * 0.75}Z`} fill={p.t ? "#fff" : cor} stroke={cor} strokeWidth={p.t ? 1.6 : 0.8} />
                    : <circle cx={cx} cy={cy} r={rr * 0.9} fill={p.t ? "#fff" : cor} stroke={cor} strokeWidth={p.t ? 1.6 : 0.8} />}
                  {errou && <circle cx={cx} cy={cy} r={rr * 2} fill="none" stroke="#8C2332" strokeWidth={2} />}
                </g>
              );
            })}
            <text className="q7-eixo-t" x={X(x1)} y={Y(y0)} dy="1.25em" dx="-.2em" textAnchor="end">x₁</text>
            <text className="q7-eixo-t" x={X(x0)} y={Y(y1)} dx=".4em" dy="1em">x₂</text>
          </g>
        );
      }}
    </Grafico>
  );
}

/* ------------------------------------------------------------------ abertura de bloco */

const SIMBOLO: Record<string, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
/**
 * Abertura de bloco: as quatro perguntas da aula com a deste bloco em destaque e o "Neste bloco" como fluxo de passos,
 * cada passo um link para o slide em que começa (no mesmo modo, apresentação ou estudo). Slide de navegação.
 */
export function AberturaBloco({ slug, pagina, conclusao, extra, fonte }: { slug: string; pagina?: Pagina; conclusao: ReactNode; extra: ReactNode; fonte?: ReactNode }) {
  const b = BLOCOS.find((x) => x.abre === slug)!;
  const iBloco = PERGUNTAS.findIndex((p) => p.id === b.pergunta);
  return (
    <Quadro slug={slug} pagina={pagina} layout="um" conclusao={conclusao} rotuloConclusao="Neste bloco" fonte={fonte}>
      <div className="q12-bloco">
        <ol className="q12-bloco-ps" aria-label="Os quatro blocos da aula">
          {PERGUNTAS.map((p, i) => {
            const bb = BLOCOS[i];
            return (
              <li key={p.id} data-p={p.id} data-on={i === iBloco ? "1" : undefined} data-feito={i < iBloco ? "1" : undefined}>
                <LinkSlide slug={bb.abre} className="q12-bloco-p" rotulo={`Bloco ${i + 1}, ${p.nome}: ${p.frase}`}>
                  <span className="q12-bloco-n">{String(i + 1).padStart(2, "0")} <i aria-hidden="true">{SIMBOLO[p.id]}</i></span>
                  <b>{p.nome}</b>
                  <span>{p.frase}</span>
                </LinkSlide>
              </li>
            );
          })}
        </ol>
        <div className="q12-bloco-extra">{extra}</div>
        <div className="q12-bloco-fluxo">
          <p className="q7-k">Neste bloco</p>
          <ol>
            {b.passos.map(([r, s], i) => (
              <li key={s}>
                <LinkSlide slug={s} className="q12-bloco-passo" rotulo={`${r}, slide ${SLIDE[s].n}`}><span>{r}</span><small>slide {SLIDE[s].n}</small></LinkSlide>
                {i < b.passos.length - 1 && <span className="q12-bloco-seta" aria-hidden="true">→</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Quadro>
  );
}

/** Rótulo de porcentagem com o denominador: "83,7% (3.530 de 4.217)". */
export const comDen = (a: number, b: number, casas = 1) => `${pct(a / b, casas)} (${int(a)} de ${int(b)})`;

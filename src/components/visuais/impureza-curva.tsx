"use client";
import { useRef, useState } from "react";
import { ATALHOS, cartoes, celulas, EIXO_X, EIXO_Y, entropiaP, fmtNum, fmtPct, FORMULAS, giniP, leitura, P_INICIAL, RODAPE, ROTULO_ATALHOS, ROTULO_SIMETRICO, ROTULO_TAXA, simetrico, SUB_QUADRADO, SUBTITULO, taxaErroP, TEX_ERRO, TITULO, TITULO_CTL, TITULO_GRAF, TITULO_QUADRADO, type Celula } from "@/lib/visuais/impureza";
import { pctTex } from "@/lib/visuais/tex";
import { Tex } from "./tex";

/**
 * Slide 4 do capítulo 5 (c5p4): impureza, na gramática do c4p2. Quadro 16:9 no sistema .rl: as duas fórmulas em
 * KaTeX na faixa; à esquerda, Gini e entropia contra a proporção p, com a taxa de erro do nó pontilhada por baixo,
 * rótulos diretos e o simétrico 1 − p sob demanda; ao centro, o quadrado da chance de errar ao rotular ao acaso, com
 * as quatro células legíveis; à direita, o painel. Clicar ou arrastar sobre o gráfico também move p. Contas em
 * src/lib/visuais/impureza.ts.
 */
// MR 30: o rótulo "100%", centrado na ponta do eixo, tem cerca de 54 de largura na letra de 19; com 22 perdia o % no celular, onde o desenho ocupa a caixa inteira.
const W = 640, H = 430, ML = 62, MR = 30, MT = 36, MB = 74, Y_MAX = 1.1;
const X0 = ML, X1 = W - MR, Y0 = H - MB;
const sx = (p: number) => X0 + p * (X1 - X0);
const sy = (v: number) => MT + (1 - v / Y_MAX) * (Y0 - MT);
const TICKS_X = [0, 0.25, 0.5, 0.75, 1] as const, TICKS_Y = [0, 0.25, 0.5, 0.75, 1] as const;
const caminho = (f: (p: number) => number) => Array.from({ length: 201 }, (_, i) => { const p = i / 200; return `${i ? "L" : "M"}${sx(p).toFixed(1)} ${sy(f(p)).toFixed(1)}`; }).join("");
const CURVA_G = caminho(giniP), CURVA_H = caminho(entropiaP), CURVA_E = caminho(taxaErroP);
const CARTOES = cartoes();

type Caixa = { x0: number; x1: number; y0: number; y1: number };
type Ancora = "start" | "end" | "middle";
const cruza = (a: Caixa, b: Caixa) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const folga = (c: Caixa, d: number): Caixa => ({ x0: c.x0 - d, x1: c.x1 + d, y0: c.y0 - d, y1: c.y1 + d });
const F_VALOR = 23, F_CURVA = 21, F_GUIA = 19;
/** Largura com folga para a fonte mais larga da pilha (Inter), não só para a que o navegador encontrar. */
const largura = (t: string, f: number) => [...t].reduce((s, ch) => s + (/\d/.test(ch) ? 0.62 : /[\s,.:]/.test(ch) ? 0.3 : 0.55), 0) * f + 6;
const caixaTexto = (x: number, y: number, ancora: Ancora, t: string, f: number): Caixa => {
  const w = largura(t, f), x0 = ancora === "start" ? x : ancora === "end" ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - 0.8 * f, y1: y + 0.2 * f };
};
const caixaPonto = (x: number, y: number, r: number): Caixa => ({ x0: x - r - 3, x1: x + r + 3, y0: y - r - 3, y1: y + r + 3 });
const AREA: Caixa = { x0: X0 + 4, x1: X1 - 4, y0: MT + 4, y1: Y0 - 4 };
const dentro = (c: Caixa) => c.x0 >= AREA.x0 && c.x1 <= AREA.x1 && c.y0 >= AREA.y0 && c.y1 <= AREA.y1;
/** A curva passa pela caixa quando, no trecho horizontal da caixa, as alturas que ela percorre encontram as da caixa. */
function cortaCurva(f: (p: number) => number, c: Caixa) {
  const a = Math.max(c.x0, X0), b = Math.min(c.x1, X1);
  if (a > b) return false;
  let lo = Infinity, hi = -Infinity;
  for (let x = a; ; x = Math.min(x + 2, b)) { const y = sy(f((x - X0) / (X1 - X0))); lo = Math.min(lo, y); hi = Math.max(hi, y); if (x >= b) break; }
  return lo <= c.y1 && hi >= c.y0;
}

/** Textos fixos: o nome de cada curva no pico e o da taxa de erro deitado no flanco oposto ao de p, abaixo da reta. */
const PICO_H = { x: sx(0.5), y: sy(1) - 20 }, PICO_G = { x: sx(0.5), y: sy(0.5) - 20 };
const FIXAS: Caixa[] = [caixaTexto(PICO_H.x, PICO_H.y, "middle", "Entropia, em bits", F_CURVA), caixaTexto(PICO_G.x, PICO_G.y, "middle", "Gini", F_CURVA)];
const ANG = Math.atan2(sy(0) - sy(0.5), sx(1) - sx(0.5));
function rotuloTaxa(lado: "dir" | "esq") {
  const pc = lado === "dir" ? 0.72 : 0.28, s = Math.sin(ANG), c = Math.cos(ANG);
  const u = lado === "dir" ? { x: c, y: s } : { x: c, y: -s }; // direção do texto, ao longo do flanco
  const n = lado === "dir" ? { x: -s, y: c } : { x: s, y: c }; // normal para baixo da reta, para dentro do triângulo
  const d = 8 + 0.72 * F_CURVA, bx = sx(pc) + n.x * d, by = sy(taxaErroP(pc)) + n.y * d, L = largura("taxa de erro do nó", F_CURVA);
  const caixas: Caixa[] = [];
  for (let i = 0; i < 8; i++) {
    const pts = [-L / 2 + (L * i) / 8, -L / 2 + (L * (i + 1)) / 8].flatMap((t) => {
      const px = bx + u.x * t, py = by + u.y * t;
      return [{ x: px - n.x * 0.8 * F_CURVA, y: py - n.y * 0.8 * F_CURVA }, { x: px + n.x * 0.2 * F_CURVA, y: py + n.y * 0.2 * F_CURVA }];
    });
    caixas.push({ x0: Math.min(...pts.map((q) => q.x)), x1: Math.max(...pts.map((q) => q.x)), y0: Math.min(...pts.map((q) => q.y)), y1: Math.max(...pts.map((q) => q.y)) });
  }
  return { x: bx, y: by, graus: ((lado === "dir" ? 1 : -1) * ANG * 180) / Math.PI, caixas };
}
const ROT_TAXA = { dir: rotuloTaxa("dir"), esq: rotuloTaxa("esq") };

type Rotulo = { chave: "h" | "g"; x: number; y: number; ancora: Ancora; texto: string; caixa: Caixa; guia: { x1: number; y1: number; x2: number; y2: number } | null };
const P_ROTULOS = 0.07;
const DY = [36, -24, 20, -20, 60, -48, 84, -72, 108, -96, 132, -120, -144], DX = [14, 28, 34, 44, 70, 100, 140], DY_MEIO = [44, -28, 68, -52];
/** A linha-guia atravessa a curva? Troca de lado entre amostras do segmento. */
const guiaCruzaCurva = (x1: number, y1: number, x2: number, y2: number, f: (p: number) => number) => {
  const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3));
  let lado = 0;
  for (let i = 0; i <= n; i++) {
    const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n;
    if (x < X0 || x > X1) continue;
    const d = Math.sign(y - sy(f((x - X0) / (X1 - X0))));
    if (d && lado && d !== lado) return true;
    if (d) lado = d;
  }
  return false;
};
/** O segmento cruza a caixa? Amostrado a cada 3 px, o bastante para caixas de texto. */
const segmentoCruza = (x1: number, y1: number, x2: number, y2: number, c: Caixa) => {
  const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3));
  for (let i = 0; i <= n; i++) { const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n; if (x > c.x0 && x < c.x1 && y > c.y0 && y < c.y1) return true; }
  return false;
};

/**
 * Rótulos do desenho para uma proporção: o nome da taxa de erro, o texto do grupo puro ou os valores de Gini e de
 * entropia em p (o da taxa de erro vai na leitura do painel). Cada valor fica na posição mais próxima do seu ponto que
 * não cruza as curvas de Gini e de entropia, os pontos, os textos fixos, o outro valor nem a borda; passar sobre a reta
 * pontilhada custa um pouco mais, e é permitido porque o rótulo tem fundo. Primeiro o lado do centro, onde as curvas
 * sobem; em 50%, a direita, para o valor do Gini ler-se ao lado do nome. Rótulo afastado ganha linha-guia. Exportado
 * para os testes.
 */
export function rotulosDoGrafico(p: number, sim: boolean) {
  const q = 1 - p, g = giniP(p), h = entropiaP(p), e = taxaErroP(p);
  const mostraSim = sim && Math.abs(p - 0.5) > 1e-9;
  const taxa = mostraSim ? null : ROT_TAXA[p < 0.5 ? "dir" : "esq"];
  if (p <= 0 || p >= 1) {
    const puro = { x: p <= 0 ? sx(0.16) : sx(0.84), y: Y0 - 16, ancora: (p <= 0 ? "start" : "end") as Ancora, texto: "Gini, entropia e erro: 0" };
    return { taxa, guiasSim: false, puro: { ...puro, caixa: caixaTexto(puro.x, puro.y, puro.ancora, puro.texto, F_VALOR) }, valores: [] as Rotulo[], fixas: [...FIXAS, ...(taxa?.caixas ?? [])] };
  }
  const pontos = [caixaPonto(sx(p), sy(h), 9), caixaPonto(sx(p), sy(g), 10), caixaPonto(sx(p), sy(e), 7)];
  if (mostraSim) pontos.push(caixaPonto(sx(q), sy(h), 8), caixaPonto(sx(q), sy(g), 9));
  // "p" e "1 − p" ao pé das guias, os dois ou nenhum: somem quando as guias se aproximam ou quando encostam num ponto
  const guiaT = [caixaTexto(sx(p), Y0 - 10, "middle", "p", F_GUIA), caixaTexto(sx(q), Y0 - 10, "middle", "1 − p", F_GUIA)];
  const guiasSim = mostraSim && Math.abs(sx(p) - sx(q)) >= 64 && !guiaT.some((k) => pontos.some((o) => cruza(folga(k, 2), o)));
  const fixas = [...FIXAS, ...(taxa?.caixas ?? []), ...(guiasSim ? guiaT : [])];
  // abaixo de 7% ou acima de 93%, os três pontos se juntam no canto: os valores ficam só no painel, ao lado
  if (p < P_ROTULOS - 1e-9 || p > 1 - P_ROTULOS + 1e-9) return { taxa, guiasSim, puro: null, valores: [] as Rotulo[], fixas };
  const ligacoes: Caixa[] = mostraSim ? [sy(g), sy(h)].map((y) => ({ x0: Math.min(sx(p), sx(q)), x1: Math.max(sx(p), sx(q)), y0: y - 2, y1: y + 2 })) : [];
  const pref = p <= 0.5 ? 1 : -1;
  const valores: Rotulo[] = [];
  for (const [chave, v, r] of [["h", h, 9], ["g", g, 10]] as const) {
    const px = sx(p), py = sy(v), texto = fmtNum(v, 4);
    const cands: { x: number; y: number; a: Ancora; custo: number; topo?: boolean }[] = [];
    // perto de 50%, o ponto está no pico, sob o nome da curva: o valor lê-se logo depois do nome
    if (Math.abs(p - 0.5) <= 0.05 + 1e-9) { const nome = FIXAS[chave === "h" ? 0 : 1], pico = chave === "h" ? PICO_H : PICO_G; cands.push({ x: nome.x1 + 6, y: pico.y, a: "start", custo: 10, topo: true }); }
    for (const dy of DY) for (const dx of DX) for (const lado of [pref, -pref]) cands.push({ x: px + lado * dx, y: py + dy, a: lado > 0 ? "start" : "end", custo: dx + Math.abs(dy) + (lado === pref ? 0 : 24) });
    for (const dy of DY_MEIO) cands.push({ x: px, y: py + dy, a: "middle", custo: Math.abs(dy) + 6 });
    let melhor: { c: (typeof cands)[number]; k: Caixa; custo: number; guia: Rotulo["guia"] } | null = null;
    for (const c of cands) {
      const k = caixaTexto(c.x, c.y, c.a, texto, F_VALOR), f = folga(k, 4);
      if (!(c.topo ? k.y0 >= 4 && k.x1 <= W - 4 : dentro(k)) || cortaCurva(giniP, f) || cortaCurva(entropiaP, f)) continue;
      if (pontos.some((o) => cruza(o, f)) || fixas.some((o) => cruza(o, f)) || valores.some((o) => cruza(folga(o.caixa, 3), f))) continue;
      const nx = Math.min(Math.max(px, k.x0), k.x1), ny = Math.min(Math.max(py, k.y0), k.y1), dist = Math.hypot(nx - px, ny - py);
      const guia = !c.topo && dist - r > 22 ? { x1: px + ((nx - px) / dist) * (r + 3), y1: py + ((ny - py) / dist) * (r + 3), x2: nx, y2: ny } : null;
      // linha-guia curta, sem atravessar texto nem as curvas de Gini e de entropia; sem lugar assim, o valor fica só no painel
      if (guia && (Math.hypot(guia.x2 - guia.x1, guia.y2 - guia.y1) > 70 || [...fixas, ...valores.map((o) => o.caixa)].some((o) => segmentoCruza(guia.x1, guia.y1, guia.x2, guia.y2, o))
        || guiaCruzaCurva(guia.x1, guia.y1, guia.x2, guia.y2, giniP) || guiaCruzaCurva(guia.x1, guia.y1, guia.x2, guia.y2, entropiaP))) continue;
      const custo = c.custo + (guia ? 15 : 0) + (cortaCurva(taxaErroP, f) ? 12 : 0) + (ligacoes.some((o) => cruza(o, f)) ? 12 : 0);
      if (!melhor || custo < melhor.custo) melhor = { c, k, custo, guia };
    }
    if (!melhor) return { taxa, guiasSim, puro: null, valores: [] as Rotulo[], fixas };
    valores.push({ chave, x: melhor.c.x, y: melhor.c.y, ancora: melhor.c.a, texto, caixa: melhor.k, guia: melhor.guia });
  }
  return { taxa, guiasSim, puro: null, valores, fixas };
}
/** Geometria do gráfico, para os testes conferirem os rótulos contra as curvas por conta própria. */
export const GEOMETRIA = { sx, sy, area: AREA, pontosFixos: FIXAS, pRotulos: P_ROTULOS, taxa: { comprimento: largura("taxa de erro do nó", F_CURVA), fonte: F_CURVA } };

function Curvas({ p, simetrico: sim, onP }: { p: number; simetrico: boolean; onP: (p: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const arrastando = useRef(false);
  const g = giniP(p), h = entropiaP(p), e = taxaErroP(p), q = 1 - p;
  const r = rotulosDoGrafico(p, sim);
  const mostraSim = sim && Math.abs(p - 0.5) > 1e-9;
  const mover = (ev: React.PointerEvent) => {
    const svg = svgRef.current; if (!svg) return;
    const m = svg.getScreenCTM(); if (!m) return;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(m.inverse());
    onP(Math.round(Math.min(1, Math.max(0, (loc.x - X0) / (X1 - X0))) * 100) / 100);
  };
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="im-svg" role="img"
      aria-label={`Gini, entropia e taxa de erro do nó em função da proporção de defaults. Em ${fmtPct(p)}, Gini ${fmtNum(g, 4)}, entropia ${fmtNum(h, 4)} bits e taxa de erro ${fmtNum(e, 4)}.`}>
      <rect x={X0} y={MT} width={X1 - X0} height={Y0 - MT} className="im-fundo" />
      {TICKS_Y.map((v) => <g key={v}><line x1={X0} x2={X1} y1={sy(v)} y2={sy(v)} className={v === 0 ? "im-base" : "im-grade"} /><text x={X0 - 10} y={sy(v) + 7} textAnchor="end" className="im-tick">{fmtNum(v, 2)}</text></g>)}
      {TICKS_X.map((v) => <text key={v} x={sx(v)} y={Y0 + 28} textAnchor="middle" className="im-tick">{fmtPct(v)}</text>)}
      <text x={(X0 + X1) / 2} y={H - 10} textAnchor="middle" className="im-eixo">{EIXO_X}</text>
      <text x={X0 - 52} y={MT - 14} className="im-eixo">{EIXO_Y}</text>
      <path d={CURVA_H} className="im-curva im-curva--h" />
      <path d={CURVA_E} className="im-curva im-curva--e" />
      <path d={CURVA_G} className="im-curva im-curva--g" />
      <text x={PICO_H.x} y={PICO_H.y} textAnchor="middle" className="im-curva-t im-curva-t--h">Entropia, em bits</text>
      <text x={PICO_G.x} y={PICO_G.y} textAnchor="middle" className="im-curva-t im-curva-t--g">Gini</text>
      {r.taxa && <text transform={`translate(${r.taxa.x.toFixed(1)}, ${r.taxa.y.toFixed(1)}) rotate(${r.taxa.graus.toFixed(2)})`} textAnchor="middle" className="im-curva-t im-curva-t--e">taxa de erro do nó</text>}
      {mostraSim && <g className="im-sim">
        <line x1={sx(q)} x2={sx(q)} y1={Y0} y2={sy(h)} className="im-guia im-guia--sim" />
        <line x1={sx(p)} x2={sx(q)} y1={sy(g)} y2={sy(g)} className="im-ligacao" />
        <line x1={sx(p)} x2={sx(q)} y1={sy(h)} y2={sy(h)} className="im-ligacao" />
        <circle cx={sx(q)} cy={sy(h)} r={8} className="im-ponto-sim im-ponto-sim--h" />
        <circle cx={sx(q)} cy={sy(g)} r={9} className="im-ponto-sim im-ponto-sim--g" />
        {r.guiasSim && <text x={sx(q)} y={Y0 - 10} textAnchor="middle" className="im-guia-t">1 − p</text>}
      </g>}
      <line x1={sx(p)} x2={sx(p)} y1={Y0} y2={sy(h)} className="im-guia" />
      {r.guiasSim && <text x={sx(p)} y={Y0 - 10} textAnchor="middle" className="im-guia-t">p</text>}
      {r.valores.map((v) => v.guia && <line key={`l${v.chave}`} x1={v.guia.x1} y1={v.guia.y1} x2={v.guia.x2} y2={v.guia.y2} className="im-rot-guia" />)}
      <circle cx={sx(p)} cy={sy(h)} r={9} className="im-ponto im-ponto--h" />
      <circle cx={sx(p)} cy={sy(e)} r={7} className="im-ponto im-ponto--e" />
      <circle cx={sx(p)} cy={sy(g)} r={10} className="im-ponto im-ponto--g" />
      {r.puro && <text x={r.puro.x} y={r.puro.y} textAnchor={r.puro.ancora} className="im-valor">{r.puro.texto}</text>}
      {r.valores.map((v) => (
        <g key={v.chave} className="im-rot">
          {v.caixa.y0 >= MT && <rect x={v.caixa.x0 - 2} y={v.caixa.y0 - 3} width={v.caixa.x1 - v.caixa.x0 + 4} height={v.caixa.y1 - v.caixa.y0 + 6} rx={5} className="im-rot-fundo" />}
          <text x={v.x} y={v.y} textAnchor={v.ancora} className={`im-valor im-valor--${v.chave}`}>{v.texto}</text>
        </g>
      ))}
      <rect x={X0} y={MT} width={X1 - X0} height={Y0 - MT} className="im-alvo" aria-hidden="true"
        onPointerDown={(ev) => { arrastando.current = true; ev.currentTarget.setPointerCapture(ev.pointerId); mover(ev); }}
        onPointerMove={(ev) => { if (arrastando.current) mover(ev); }}
        onPointerUp={() => { arrastando.current = false; }} onPointerCancel={() => { arrastando.current = false; }} />
    </svg>
  );
}

/** Quadrado da leitura do Gini: colunas pela proposta sorteada, linhas pelo rótulo sorteado, as duas de largura p e 1 − p. */
const QW = 420, QH = 416, QX = 128, QY = 82, QS = 280;
function Quadrado({ p }: { p: number }) {
  const cs = celulas(p);
  const larg = { default: QS * p, pagou: QS * (1 - p) };
  const xDe = (lado: Celula["proposta"]) => (lado === "default" ? QX : QX + larg.default);
  const yDe = (lado: Celula["rotulo"]) => (lado === "default" ? QY : QY + larg.default);
  // rótulos das linhas no meio de cada faixa, presos às bordas; os dois meios distam sempre metade do lado
  const yRot = { default: Math.max(QY + 20, QY + larg.default / 2), pagou: Math.min(QY + QS - 26, QY + larg.default + larg.pagou / 2) };
  return (
    <svg viewBox={`0 0 ${QW} ${QH}`} className="im-q-svg" role="img"
      aria-label={`Chance de errar ao rotular ao acaso: ${fmtPct(giniP(p), 2)}, soma das duas células de erro.`}>
      <text x={QX + QS / 2} y={26} textAnchor="middle" className="im-eixo">proposta sorteada</text>
      <text x={QX} y={62} className="im-q-cab">default · {fmtPct(p)}</text>
      <text x={QX + QS} y={62} textAnchor="end" className="im-q-cab">pagou · {fmtPct(1 - p)}</text>
      <text transform={`translate(26, ${QY + QS / 2}) rotate(-90)`} textAnchor="middle" className="im-eixo">rótulo sorteado</text>
      {p > 0 && <><text x={QX - 12} y={yRot.default} textAnchor="end" className="im-q-cab">default</text><text x={QX - 12} y={yRot.default + 24} textAnchor="end" className="im-q-cab im-q-cab--n">{fmtPct(p)}</text></>}
      {p < 1 && <><text x={QX - 12} y={yRot.pagou} textAnchor="end" className="im-q-cab">pagou</text><text x={QX - 12} y={yRot.pagou + 24} textAnchor="end" className="im-q-cab im-q-cab--n">{fmtPct(1 - p)}</text></>}
      {cs.map((c) => {
        const x = xDe(c.proposta), y = yDe(c.rotulo), w = larg[c.proposta], hh = larg[c.rotulo];
        if (w < 0.5 || hh < 0.5) return null;
        const v = fmtPct(c.prob, 2);
        const dois = w >= 90 && hh >= 60, deitado = !dois && w >= 80 && hh >= 24, empe = !dois && !deitado && hh >= 80 && w >= 24;
        return (
          <g key={c.chave} className={`im-cel ${c.erro ? "im-cel--erro" : "im-cel--acerto"}`}>
            <rect x={x + 1.5} y={y + 1.5} width={Math.max(0, w - 3)} height={Math.max(0, hh - 3)} rx={3} />
            {dois && <><text x={x + w / 2} y={y + hh / 2 - 6} textAnchor="middle" className="im-cel-k">{c.erro ? "erro" : "acerto"}</text><text x={x + w / 2} y={y + hh / 2 + 20} textAnchor="middle" className="im-cel-v">{v}</text></>}
            {deitado && <text x={x + w / 2} y={y + hh / 2 + 7} textAnchor="middle" className="im-cel-v im-cel-v--fino">{v}</text>}
            {empe && <text transform={`translate(${x + w / 2 + 7}, ${y + hh / 2}) rotate(-90)`} textAnchor="middle" className="im-cel-v im-cel-v--fino">{v}</text>}
          </g>
        );
      })}
      {p > 0 && p < 1 && <path d={`M${QX + larg.default} ${QY - 12} v12`} className="im-q-marca" />}
    </svg>
  );
}

export function ImpurezaCurva({ pagina }: { pagina?: { index: number; total: number } }) {
  const [p, setP] = useState(P_INICIAL);
  const [sim, setSim] = useState(false);
  const g = giniP(p), h = entropiaP(p);
  const restaurar = () => { setP(P_INICIAL); setSim(false); };
  const noAtalho = (a: number) => Math.abs(a - p) < 1e-9;
  return (
    <figure className="vz rl im" data-vz="impureza-curva">
      <section className="rl-slide" data-tela="4">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 5 · Árvores de decisão</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Impureza"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="im-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="im-eq-k">{f.k}</p><Tex f={f.tex} className="im-eq-f" /></div>)}
        </div>

        <div className="rl-corpo im-corpo">
          <div className="im-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="im-svg-wrap"><Curvas p={p} simetrico={sim} onP={setP} /></div>
            <p className="im-legenda"><span className="im-leg im-leg--g">Gini</span><span className="im-leg im-leg--h">Entropia, em bits</span><span className="im-leg im-leg--e">{ROTULO_TAXA}</span></p>
          </div>

          <div className="im-quad">
            <p className="rl-k">{TITULO_QUADRADO}</p>
            <p className="im-quad-sub">{SUB_QUADRADO}</p>
            <div className="im-q-wrap"><Quadrado p={p} /></div>
            <p className="im-erro" role="img" aria-label={`Pr(erro) = 2p(1 − p) = ${fmtPct(g, 2)}`}><Tex f={String.raw`${TEX_ERRO} = \mathbf{${pctTex(fmtPct(g, 2))}}`} /></p>
          </div>

          <aside className="im-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="im-ctl">
              <label htmlFor="im-range"><b>Defaults no grupo:</b> {fmtPct(p)}</label>
              <div className="im-atalhos" role="group" aria-label="Proporções de exemplo">
                <span>{ROTULO_ATALHOS}</span>
                {ATALHOS.map((a) => <button key={a} type="button" className={`rl-btn rl-btn--mini ${noAtalho(a) ? "rl-btn--on" : ""}`} aria-pressed={noAtalho(a)} onClick={() => setP(a)}>{fmtPct(a)}</button>)}
              </div>
              <input id="im-range" type="range" min={0} max={100} step={1} value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)}
                aria-valuetext={`${fmtPct(p)}; Gini ${fmtNum(g, 4)}; entropia ${fmtNum(h, 4)} bits`} />
            </div>
            <dl className="im-res" aria-live="polite">
              <div><dt>Gini</dt><dd className="im-res-g">{fmtNum(g, 4)}</dd></div>
              <div><dt>Entropia, em bits</dt><dd className="im-res-h">{fmtNum(h, 4)}</dd></div>
            </dl>
            <p className="im-lei">{leitura(p)}</p>
            <div className="im-acoes">
              <button type="button" className={`rl-btn rl-btn--mini ${sim ? "rl-btn--on" : ""}`} aria-pressed={sim} onClick={() => setSim((v) => !v)}>{ROTULO_SIMETRICO}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            {sim && <div className="im-comp-box" aria-live="polite"><p className="im-comp-v">{simetrico(p)}</p></div>}
          </aside>
        </div>

        <div className="im-base">
          {CARTOES.map((k) => <div key={k.k}><p className="im-base-k">{k.k}</p><p className="im-base-t">{k.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

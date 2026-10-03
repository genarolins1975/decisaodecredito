"use client";
import { useId, type ReactNode } from "react";
import { caminho, Eixos, escala, Grafico, margens, type Dim, type Escala } from "@/components/capitulo7/base";
import type { Barra } from "@/lib/capitulo12/b2";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * Peças do bloco 2 (desempenho) do capítulo 12: o histograma dos scores do detector por classe (os não 5 em barras
 * azuis cheias, os 5 em barras petróleo hachuradas e contornadas, para a classe não depender da cor), a grade de cem
 * marcas e o plano ROC com eixos, diagonal do acaso e canto do modelo perfeito. CSS em src/app/capitulo12-b2.css.
 */

export const COR = { neg: "#3D5A8A", pos: "#176C73", lim: "#A85A0C", erro: "#8C2332", ok: "#2E6B4F", mudo: "#5B6475" };
/** Score com separador de milhar e sinal de menos tipográfico. */
export const sc = (v: number) => num(v, 0);

/**
 * Histograma dos scores, uma barra por faixa de largura igual, com a altura na fração de cada classe (as duas classes
 * na mesma escala, embora os não 5 sejam dez vezes mais numerosos). `limiar` desenha a linha âmbar e a região em que o
 * modelo diz 5; `extra` recebe as escalas para anotações do slide.
 */
export function HistScores({ barras, limiar, rotulo, arCelular, extra, rotLimiar, nPos, nNeg }: {
  barras: Barra[]; limiar: number; rotulo: string; arCelular?: string; rotLimiar?: string; nPos: number; nNeg: number;
  extra?: (x: Escala, y: Escala, d: Dim) => ReactNode;
}) {
  const id = useId().replace(/:/g, "");
  const de = barras[0].de, ate = barras[barras.length - 1].ate;
  const ymax = Math.max(...barras.map((b) => Math.max(b.fPos, b.fNeg)));
  const passo = ymax > 0.12 ? 0.05 : ymax > 0.06 ? 0.02 : 0.01;
  const teto = Math.ceil((ymax * 1.08) / passo) * passo;
  const tab = (
    <table><caption>{rotulo}</caption><thead><tr><th>Faixa de score</th><th>5 (fração dos 5)</th><th>não 5 (fração dos não 5)</th></tr></thead>
      <tbody>{barras.map((b) => <tr key={b.de}><td>{sc(b.de)} a {sc(b.ate)}</td><td>{pct(b.fPos, 1)}</td><td>{pct(b.fNeg, 1)}</td></tr>)}</tbody></table>
  );
  return (
    <Grafico rotulo={rotulo} tabela={tab} arCelular={arCelular ?? "16 / 9"}>
      {(d) => {
        const m = margens(d.fs, { l: 2.6, b: 2.7, t: 1.5, r: 0.6 });
        const x = escala([de, ate], [m.l, d.w - m.r]), y = escala([0, teto], [d.h - m.b, m.t]);
        const passoX = (ate - de) / 4.5 > 15000 ? 20000 : 10000;
        const xt: number[] = []; for (let v = Math.ceil(de / passoX) * passoX; v <= ate; v += passoX) xt.push(v);
        const yt: number[] = []; for (let v = 0; v <= teto + 1e-9; v += passo) yt.push(Math.round(v * 1000) / 1000);
        const iNeg = barras.reduce((a, b, i) => (b.fNeg > barras[a].fNeg ? i : a), 0), iPos = barras.reduce((a, b, i) => (b.fPos > barras[a].fPos ? i : a), 0);
        const bw = x(barras[0].ate) - x(barras[0].de);
        const xl = x(Math.min(ate, Math.max(de, limiar)));
        return (
          <g>
            <defs>
              <pattern id={`${id}-h`} patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)"><line x1={0} y1={0} x2={0} y2={7} stroke={COR.pos} strokeWidth={2.4} /></pattern>
            </defs>
            <rect x={xl} y={m.t} width={Math.max(0, x(ate) - xl)} height={y(0) - m.t} fill="#FBF2E5" />
            <Eixos x={x} y={y} xt={xt} yt={yt} fx={sc} fy={(v) => pct(v, 0)} yTit="Fração de cada classe na faixa" />
            {barras.map((b) => <rect key={`n${b.de}`} x={x(b.de) + 0.5} y={y(b.fNeg)} width={Math.max(0.5, bw - 1)} height={y(0) - y(b.fNeg)} fill={COR.neg} fillOpacity={0.5} />)}
            {barras.map((b) => b.fPos > 0 && <rect key={`p${b.de}`} x={x(b.de) + 1} y={y(b.fPos)} width={Math.max(0.5, bw - 2)} height={y(0) - y(b.fPos)} fill={`url(#${id}-h)`} stroke={COR.pos} strokeWidth={1.6} />)}
            <line x1={xl} x2={xl} y1={m.t - d.fs * 0.3} y2={y(0)} stroke={COR.lim} strokeWidth={3} />
            <text className="q7-corte-t" x={xl - m.l < d.fs * 7 ? xl + d.fs * 0.35 : xl - d.fs * 0.35} textAnchor={xl - m.l < d.fs * 7 ? "start" : "end"} y={m.t + d.fs * 0.55}>{rotLimiar ?? `limiar ${sc(limiar)}`}</text>
            <text className="q7-rot--peq" x={x(barras[iNeg].de) - d.fs * 0.4} y={y(barras[iNeg].fNeg) - d.fs * 0.4} textAnchor="end" style={{ fill: COR.neg, fontWeight: 700 }}>■ não 5 ({int(nNeg)})</text>
            <text className="q7-rot--peq" x={x(barras[iPos].ate) + d.fs * 0.4} y={y(barras[iPos].fPos) - d.fs * 0.2} style={{ fill: COR.pos, fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>▨ 5 ({int(nPos)})</text>
            <text className="q7-eixo-t" x={(x(de) + x(ate)) / 2} y={y(0)} dy="2.45em" textAnchor="middle">Score do detector</text>
            {extra?.(x, y, d)}
          </g>
        );
      }}
    </Grafico>
  );
}

export type TipoMarca = "vp" | "fp" | "fn" | "vn" | "pos" | "neg";
/**
 * Grade de cem marcas (dez por dez), cada uma 1% de um total. A classe vai pela forma e pela cor: 5 é quadrado cheio
 * petróleo, não 5 é anel azul; erro (FP, FN) tem contorno vinho e um traço; acerto, a cor da classe.
 */
export function Marcas({ tipos, rotulo, colunas = 10 }: { tipos: TipoMarca[]; rotulo: string; colunas?: number }) {
  return (
    <div className="q12-b2-marcas" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }} role="img" aria-label={rotulo}>
      {tipos.map((t, i) => <i key={i} data-t={t} />)}
    </div>
  );
}

/** Repartição de 100 marcas que soma 100 (maiores restos): a grade não perde nem ganha marca no arredondamento. */
export function cem(partes: number[]): number[] {
  const tot = partes.reduce((a, b) => a + b, 0);
  const b = partes.map((p) => (p / tot) * 100), f = b.map(Math.floor);
  let falta = 100 - f.reduce((a, c) => a + c, 0);
  b.map((v, i) => [v - f[i], i] as const).sort((p, q) => q[0] - p[0]).forEach(([, i]) => { if (falta > 0) { f[i]++; falta--; } });
  return f;
}

/**
 * Plano ROC quadrado: FPR no eixo x, TPR no y, diagonal do acaso e o canto do modelo perfeito. O quadrado ocupa a
 * altura e fica à esquerda; `children` recebe as escalas para as curvas e os pontos do slide.
 */
export function PlanoRoc({ rotulo, tabela, children, xTit = "FPR: não 5 ditos 5", yTit = "TPR (recall): 5 encontrados", arCelular, rotAcaso = true, rotPerfeito = true, xMax = 1, rotPerfeitoEm }: {
  rotulo: string; tabela?: ReactNode; children: (x: Escala, y: Escala, d: Dim) => ReactNode; xTit?: string; yTit?: string; arCelular?: string; rotAcaso?: boolean; rotPerfeito?: boolean;
  /** Teto do eixo da FPR (1 = inteiro; 0,1 amplia a região de FPR baixa). */
  xMax?: number;
  /** Onde escrever "perfeito", em coordenadas do plano (FPR, TPR); o padrão fica junto do canto. */
  rotPerfeitoEm?: [number, number];
}) {
  return (
    <Grafico rotulo={rotulo} tabela={tabela} arCelular={arCelular ?? "1 / 1"}>
      {(d) => {
        const m = margens(d.fs, { l: 3.1, b: 2.9, t: 1.3, r: 0.9 });
        const lado = Math.max(40, Math.min(d.w - m.l - m.r, d.h - m.t - m.b));
        const x = escala([0, xMax], [m.l, m.l + lado]), y = escala([0, 1], [m.t + lado, m.t]);
        const t = [0, 0.25, 0.5, 0.75, 1], tx = t.map((v) => v * xMax);
        return (
          <g>
            <Eixos x={x} y={y} xt={tx} yt={t} fx={(v) => pct(v, xMax < 1 && v > 0 && v < xMax ? 1 : 0)} fy={(v) => pct(v, 0)} xTit={xTit} yTit={yTit} />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(xMax)} y2={y(xMax)} />
            {rotAcaso && xMax === 1 && <text className="q7-rot--peq" x={x(0.6)} y={y(0.6)} dy="1.5em" style={{ fill: COR.mudo }} transform={`rotate(-45 ${x(0.6)} ${y(0.6)})`}>acaso: AUC 0,5</text>}
            {rotPerfeito && <g><rect x={x(0) - d.fs * 0.32} y={y(1) - d.fs * 0.32} width={d.fs * 0.64} height={d.fs * 0.64} fill="#fff" stroke={COR.ok} strokeWidth={2.5} /><text className="q7-rot--peq" x={x(rotPerfeitoEm ? rotPerfeitoEm[0] : xMax * 0.03)} y={y(rotPerfeitoEm ? rotPerfeitoEm[1] : 1)} dy={rotPerfeitoEm ? undefined : "1.45em"} style={{ fill: COR.ok, fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>↖ perfeito (0%; 100%)</text></g>}
            {children(x, y, d)}
          </g>
        );
      }}
    </Grafico>
  );
}

/** Caminho de uma curva ROC (pontos de FPR e TPR) nas escalas do plano. */
export const caminhoRoc = (pts: { fpr: number; tpr: number }[], x: Escala, y: Escala) => caminho(pts.map((p) => ({ x: x(p.fpr), y: y(p.tpr) })));

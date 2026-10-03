"use client";
import { useState } from "react";
import { Botao, caminho, Controle, escala, Formula, Grafico, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { COR } from "../b2";
import { AUC_RF, AUC_SGD, FONTE_MNIST, HIST } from "@/lib/capitulo12/dados";
import { aucHistograma, gini } from "@/lib/capitulo12/metricas";
import { sortearPares } from "@/lib/capitulo12/b2";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 21 · c12p21 · AUC resume a curva; o Gini reescala a mesma informação. A régua alinha as duas escalas (AUC de 0,5 a 1
 * em cima, Gini = 2 × AUC − 1 de 0 a 1 embaixo) com o acaso, o detector SGD (AUC_SGD, do scikit-learn), a floresta
 * (AUC_RF) e o modelo perfeito; o controle move um cursor de AUC e mostra o Gini. A demonstração por pares sorteia, com
 * semente, pares (5, não 5) pelo histograma de scores da validação cruzada (sortearPares, mulberry32) e conta em
 * quantos o 5 tem score maior (meio ponto no empate de faixa): a fração converge para a AUC (aucHistograma, que difere
 * da do scikit-learn só na quinta casa). Estado inicial: cursor na AUC do detector, nenhum par sorteado. "Restaurar"
 * volta a ele.
 */
const SEMENTE = 20261003;
const NMAX = 10000;
const VIT = sortearPares(HIST, NMAX, SEMENTE);
const AUC_H = aucHistograma(HIST);
if (Math.abs(AUC_H - AUC_SGD) > 0.0005) throw new Error("s21: a AUC do histograma se afasta da do scikit-learn");
const PASSOS = [10, 100, 1000, NMAX];
const REFS = [
  { nome: "Acaso", auc: 0.5, tom: COR.mudo },
  { nome: "Detector SGD", auc: AUC_SGD, tom: COR.pos },
  { nome: "Floresta", auc: AUC_RF, tom: "#00205B" },
  { nome: "Perfeito", auc: 1, tom: COR.ok },
];

export function S21AucGini({ pagina }: { pagina?: Pagina }) {
  const [auc, setAuc] = useState(AUC_SGD);
  const [n, setN] = useState(0);
  const g = gini(auc), frac = n ? VIT[n - 1] / n : null;
  const ini = auc === AUC_SGD && n === 0;
  return (
    <Quadro slug="c12p21" pagina={pagina} layout="gl"
      conclusao={<>O detector tem AUC <b>{num(AUC_SGD, 4)}</b> e Gini <b>{num(gini(AUC_SGD), 3)}</b>: a mesma informação em duas escalas.{frac !== null ? <> Em {int(n)} pares sorteados, o 5 ficou acima em {pct(frac, 1)}.</> : ""} Um modelo isolado tem limites. E se combinarmos vários? (slide {SLIDE.c12p22.n})</>}
      fonte={`${FONTE_MNIST}. AUC de roc_auc_score; pares sorteados pelo histograma de scores (mulberry32, semente ${SEMENTE}), empate de faixa vale meio ponto; AUC do histograma ${num(AUC_H, 5)}.`}>
      <Painel className="q12-s21-esq">
        <div className="q12-s21-top">
          <Formula f={String.raw`\text{Gini}=2\times\text{AUC}-1`} />
          <p className="q7-p">A AUC é a probabilidade de um <b>5 sorteado</b> receber score maior que um <b>não 5 sorteado</b>.</p>
        </div>
        <Grafico rotulo={`Régua: AUC ${num(auc, 3)} corresponde a Gini ${num(g, 3)}; acaso 0,5 e 0; detector ${num(AUC_SGD, 4)}; floresta ${num(AUC_RF, 4)}; perfeito 1 e 1`} arCelular="16 / 7">
          {(d) => {
            const m = { l: d.fs * 4.2, r: d.fs * 1.4 };
            const x = escala([0.5, 1], [m.l, d.w - m.r]);
            const yA = d.h * 0.3, yG = d.h * 0.62;
            const ticks = [0.5, 0.6, 0.7, 0.8, 0.9, 1];
            return (
              <g>
                <text className="q7-eixo-t" x={0} y={yA} dy=".35em">AUC</text>
                <text className="q7-eixo-t" x={0} y={yG} dy=".35em">Gini</text>
                <line className="q7-eixo" x1={x(0.5)} x2={x(1)} y1={yA} y2={yA} />
                <line className="q7-eixo" x1={x(0.5)} x2={x(1)} y1={yG} y2={yG} />
                {ticks.map((t) => <g key={t}>
                  <line x1={x(t)} x2={x(t)} y1={yA - d.fs * 0.3} y2={yG + d.fs * 0.3} stroke="#E7E4DC" strokeWidth={1.2} />
                  <text className="q7-tick" x={x(t)} y={yA} dy="-.7em" textAnchor="middle">{num(t, 1)}</text>
                  <text className="q7-tick" x={x(t)} y={yG} dy="1.5em" textAnchor="middle">{num(gini(t), 1)}</text>
                </g>)}
                {REFS.map((r) => {
                  const cx = x(r.auc);
                  return <g key={r.nome}>
                    <line x1={cx} x2={cx} y1={yA} y2={yG} stroke={r.tom} strokeWidth={2.5} />
                    <circle cx={cx} cy={yA} r={d.fs * 0.3} fill={r.tom} /><circle cx={cx} cy={yG} r={d.fs * 0.3} fill={r.tom} />
                  </g>;
                })}
                {/* rótulos: acaso e detector em cima; floresta e perfeito, colados em 1, juntos embaixo */}
                <text className="q7-rot--peq" x={x(0.5)} y={yA} dy="-2.1em" style={{ fill: REFS[0].tom, fontWeight: 700 }}>{REFS[0].nome}</text>
                <text className="q7-rot--peq" x={x(AUC_SGD)} y={yA} dy="-2.1em" textAnchor="end" style={{ fill: REFS[1].tom, fontWeight: 700 }}>{REFS[1].nome} →</text>
                <text className="q7-rot--peq" x={x(1)} y={yG} dy="2.9em" textAnchor="end" style={{ fill: REFS[2].tom, fontWeight: 700 }}>Floresta e perfeito ↑</text>
                <line x1={x(auc)} x2={x(auc)} y1={yA - d.fs * 0.9} y2={yG + d.fs * 0.9} stroke={COR.lim} strokeWidth={3} />
                <rect x={x(auc) - d.fs * 0.4} y={(yA + yG) / 2 - d.fs * 0.4} width={d.fs * 0.8} height={d.fs * 0.8} fill={COR.lim} transform={`rotate(45 ${x(auc)} ${(yA + yG) / 2})`} />
              </g>
            );
          }}
        </Grafico>
        <div className="q12-s21-ctl">
          <Controle rotulo="AUC" valor={auc} min={0.5} max={1} passo={0.0005} onChange={setAuc} mostrar={`${num(auc, 4)} → Gini ${num(g, 3)}`} />
        </div>
        <table className="q7-tab q12-s21-tab">
          <thead><tr><th className="q7-t-l">Referência</th>{REFS.map((r) => <th key={r.nome}>{r.nome}</th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">AUC</th>{REFS.map((r) => <td key={r.nome}>{num(r.auc, r.auc === 0.5 || r.auc === 1 ? 2 : 4)}</td>)}</tr>
            <tr><th scope="row">Gini</th>{REFS.map((r) => <td key={r.nome}>{num(gini(r.auc), r.auc === 0.5 || r.auc === 1 ? 2 : 4)}</td>)}</tr>
          </tbody>
        </table>
      </Painel>
      <Painel titulo="Sorteie pares (5, não 5)">
        <div className="q7-botoes">{PASSOS.map((p) => <Botao key={p} onClick={() => setN(p)} desab={n === p} rotulo={`Sortear ${int(p)} pares`}>{int(p)}</Botao>)}</div>
        <p className="q12-s21-frac" data-on={frac !== null ? "1" : "0"}>{frac === null ? "?" : pct(frac, 1)}</p>
        <p className="q7-p">{frac === null ? "Sorteie pares: em quantos o 5 recebe score maior?" : <>O 5 ficou acima em {num(VIT[n - 1], VIT[n - 1] % 1 ? 1 : 0)} de {int(n)} pares.</>}</p>
        <Grafico titulo="Fração com o 5 acima" sub="pares em escala log" rotulo={`Fração de pares em que o 5 ficou acima, até ${int(n)} pares, contra a AUC ${num(AUC_SGD, 4)}`} arCelular="16 / 9">
          {(d) => {
            const m = { l: d.fs * 3, r: d.fs * 0.6, t: d.fs * 0.8, b: d.fs * 2 };
            const x = escala([0, 4], [m.l, d.w - m.r]), y = escala([0.8, 1], [d.h - m.b, m.t]);
            const pts: { x: number; y: number }[] = [];
            for (let k = 1; k <= n; k += k < 100 ? 1 : k < 1000 ? 5 : 25) pts.push({ x: x(Math.log10(k)), y: y(Math.max(0.8, VIT[k - 1] / k)) });
            if (n) pts.push({ x: x(Math.log10(n)), y: y(Math.max(0.8, frac!)) });
            return (
              <g>
                {[0.8, 0.9, 1].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.4em" y={y(v)} dy=".34em" textAnchor="end">{pct(v, 0)}</text></g>)}
                {[0, 1, 2, 3, 4].map((v) => <text key={v} className="q7-tick" x={x(v)} y={y(0.8)} dy="1.25em" textAnchor="middle">{int(10 ** v)}</text>)}
                <line x1={m.l} x2={d.w - m.r} y1={y(AUC_SGD)} y2={y(AUC_SGD)} stroke={COR.pos} strokeWidth={2} strokeDasharray="6 5" />
                <text className="q7-rot--peq" x={m.l + d.fs * 0.3} y={y(AUC_SGD)} dy="1.2em" style={{ fill: COR.pos, fontWeight: 600 }}>AUC {num(AUC_SGD, 4)}</text>
                {pts.length > 1 && <path className="q7-linha q7-linha--fina" stroke={COR.lim} d={caminho(pts)} />}
                {n > 0 && <circle cx={x(Math.log10(n))} cy={y(Math.max(0.8, frac!))} r={d.fs * 0.32} fill={COR.lim} />}
              </g>
            );
          }}
        </Grafico>
        <div className="q7-botoes"><Botao sec onClick={() => { setAuc(AUC_SGD); setN(0); }} desab={ini}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

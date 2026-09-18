"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { gini } from "@/lib/visuais/arvore";

/**
 * Impureza (capítulo 5, c5p4 e c5p5). A curva do Gini e da entropia contra a proporção de defaults, com a leitura
 * do Gini como probabilidade de errar ao rotular ao acaso; e o Gini da raiz calculado à mão sobre as 16 propostas,
 * ao lado de uma folha pura e de uma folha mista.
 */
export type ModoImpureza = "curva" | "raiz";
const BASE = did.base as Proposta[];
const entropia = (p: number) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));
const W = 640, H = 300, ML = 50, MR = 14, MT = 24, MB = 38;
const sx = (p: number) => ML + p * (W - ML - MR), sy = (v: number) => MT + (1 - v) * (H - MT - MB);

export function Impureza({ modo }: { modo: ModoImpureza }) {
  return modo === "curva" ? <Curva /> : <Raiz />;
}

function Curva() {
  const [p, setP] = useState(0.5);
  const g = 2 * p * (1 - p), h = entropia(p);
  const curvas = useMemo(() => { const gs: string[] = [], hs: string[] = []; for (let i = 0; i <= 100; i++) { const q = i / 100; gs.push(`${i ? "L" : "M"}${sx(q).toFixed(1)} ${sy(2 * q * (1 - q)).toFixed(1)}`); hs.push(`${i ? "L" : "M"}${sx(q).toFixed(1)} ${sy(entropia(q)).toFixed(1)}`); } return { g: gs.join(""), h: hs.join("") }; }, []);
  const leitura = p === 0 || p === 1 ? "Grupo puro. Nenhuma das duas medidas vê incerteza aqui, e a divisão não teria o que reduzir." : Math.abs(p - 0.5) < 0.02 ? "Grupo máximo em impureza. É o ponto de partida da raiz nesta base." : "Grupo desbalanceado. Quanto mais longe de meio a meio, menor a impureza.";
  const Q = 220; // quadrado da leitura do Gini
  return (
    <figure className="vz" data-vz="impureza-curva">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Impureza · quanto o grupo está misturado · Gini e entropia</p>
          <p className="vz-tit">Máxima meio a meio, zero quando todos têm o mesmo desfecho. É a quantidade que a divisão tenta reduzir.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Proporções de exemplo">
          {[0, 0.1, 0.5, 0.9].map((q) => <button key={q} type="button" className={`btn btn-sm ${Math.abs(p - q) < 1e-9 ? "" : "btn-secondary"}`} onClick={() => setP(q)}>{fmtPct(q)}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>Proporção de defaults {fmtPct(p)}:</b> Gini {fmtNum(g, 4)}, entropia {fmtNum(h, 4)} bits. {leitura}</div>
      <div className="vz-imp-grade">
        <div className="vz-imp-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Proporção de defaults no grupo</b> <span className="vz-slider-valor">{fmtPct(p)}</span></span>
            <input type="range" min={0} max={100} step={1} value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)} aria-valuetext={fmtPct(p)} /></label>
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">Gini</p><p className="vz-num">{fmtNum(g, 4)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Entropia, em bits</p><p className="vz-num vz-num--odds">{fmtNum(h, 4)}</p></div>
          </div>
          <div className="vz-formula">Gini = 2 × p × (1 − p) · entropia = − p × log₂(p) − (1 − p) × log₂(1 − p)</div>
          <div className="vz-grafico">
            <p className="vz-grafico-t">Como ler o Gini <span className="hint">sorteie uma proposta e um rótulo com a mesma proporção: a área rosa é a chance de errar</span></p>
            <svg viewBox={`0 0 ${Q + 150} ${Q + 52}`} role="img" aria-label={`Probabilidade de errar ${fmtPct(g, 1)}`} className="vz-imp-quadrado">
              <rect x={0} y={0} width={Q} height={Q} className="vz-imp-q-fundo" />
              <rect x={0} y={0} width={Q * p} height={Q * (1 - p)} className="vz-imp-q-erro" />
              <rect x={Q * p} y={Q * (1 - p)} width={Q * (1 - p)} height={Q * p} className="vz-imp-q-erro" />
              <line x1={Q * p} x2={Q * p} y1={0} y2={Q} className="vz-zero" /><line x1={0} x2={Q} y1={Q * (1 - p)} y2={Q * (1 - p)} className="vz-zero" />
              <text x={0} y={Q + 14} className="vz-tick">proposta default {fmtPct(p)}</text>
              <text x={Q} y={Q + 14} textAnchor="end" className="vz-tick">pagou {fmtPct(1 - p)}</text>
              <text x={Q + 8} y={Q * (1 - p) / 2 + 4} className="vz-tick">rótulo pagou {fmtPct(1 - p)}</text>
              <text x={Q + 8} y={Q * (1 - p) + Q * p / 2 + 4} className="vz-tick">rótulo default {fmtPct(p)}</text>
              <text x={0} y={Q + 40} className="vz-tick vz-tick--forte">erro = 2 × p × (1 − p) = {fmtPct(g, 1)}</text>
            </svg>
          </div>
        </div>
        <div className="vz-imp-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Impureza em função da proporção <span className="hint">Gini cheio, entropia tracejada</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Gini ${fmtNum(g, 4)} e entropia ${fmtNum(h, 4)} em ${fmtPct(p)}`}>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text>)}
              <text x={sx(0.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">proporção de defaults no grupo</text>
              <text x={ML + 4} y={MT - 9} className="vz-rotulo">impureza</text>
              <path d={curvas.h} className="vz-curva vz-curva--odds vz-int-tracejada" />
              <path d={curvas.g} className="vz-curva" />
              <line x1={sx(p)} x2={sx(p)} y1={sy(0)} y2={sy(Math.max(g, h))} className="vz-corte-linha" />
              <g className="vz-regua-ponto vz-lo-ponto--dobro" style={{ transform: `translate(${sx(p)}px, ${sy(h)}px)` }}><circle r={5} /></g>
              <g className="vz-regua-ponto" style={{ transform: `translate(${sx(p)}px, ${sy(g)}px)` }}><circle r={7} /><text x={p > 0.7 ? -12 : 12} y={22} textAnchor={p > 0.7 ? "end" : "start"} className="vz-ponto-t">Gini {fmtNum(g, 4)}</text></g>
            </svg>
          </div>
          <div className="vz-tile"><p className="eyebrow">Como ler o Gini</p><p className="vz-num vz-num--texto">É a probabilidade de errar ao classificar uma proposta sorteada do grupo usando um rótulo sorteado com a mesma proporção. Grupo puro: nunca erra, Gini zero. Grupo meio a meio: erra metade das vezes, Gini 0,5.</p></div>
          <p className="hint">Gini é a que este curso usa, por ser a que aparece na maioria das implementações e por dispensar logaritmo. A entropia produz árvores quase sempre idênticas nesta base.</p>
        </div>
      </div>
      <p className="vz-fonte">Gini = 2p(1 − p), máximo 0,5 em p = 50%; entropia em bits, máximo 1 no mesmo ponto. Com 10% de default, Gini 0,18 e entropia 0,469. As duas medidas ordenam os cortes candidatos quase sempre da mesma maneira.</p>
    </figure>
  );
}

const GRUPOS = {
  raiz: { nome: "raiz", titulo: "A raiz: as 16 propostas", n: 16, d: 8, texto: "Metade default, metade não default: máxima mistura." },
  pura: { nome: "folha pura", titulo: "Uma folha pura: utilização entre 27,5% e 57,5%", n: 6, d: 0, texto: "Nenhum default: Gini zero. Uma divisão aqui não teria o que reduzir." },
  mista: { nome: "folha mista", titulo: "Uma folha mista: utilização acima de 87,5%", n: 2, d: 1, texto: "Um default em duas propostas: meio a meio, Gini 0,5 de novo, mas com peso 2 em 16." },
};
type Grupo = keyof typeof GRUPOS;

function Raiz() {
  const [g, setG] = useState<Grupo>("raiz");
  const q = GRUPOS[g]; const p = q.d / q.n; const gi = gini(q.d, q.n);
  return (
    <figure className="vz" data-vz="impureza-raiz">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O Gini da raiz, calculado à mão · a referência contra a qual todo ganho será medido</p>
          <p className="vz-tit">Uma conta de duas linhas sobre as dezesseis propostas. Ela é a referência do capítulo inteiro.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Grupo">
          {(Object.keys(GRUPOS) as Grupo[]).map((k) => <button key={k} type="button" className={`btn btn-sm ${g === k ? "" : "btn-secondary"}`} onClick={() => setG(k)}>{GRUPOS[k].nome}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>{q.titulo}:</b> {q.d} default{q.d === 1 ? "" : "s"} em {q.n} propostas, p = {fmtNum(p, 4)}, Gini = 2 × {fmtNum(p, 3)} × {fmtNum(1 - p, 3)} = {fmtNum(gi, 5)}. {q.texto}</div>
      <div className="vz-imp-grade">
        <div className="vz-imp-painel">
          <div className="vz-grafico">
            <p className="vz-grafico-t">O grupo <span className="hint">D marca default, ✓ marca quem pagou</span></p>
            <svg viewBox="0 0 640 120" role="img" aria-label={`${q.d} defaults em ${q.n} propostas`}>
              {Array.from({ length: q.n }, (_, i) => { const def = i < q.d; const x = 8 + i * 39; return <g key={i} className="vz-imp-caixa"><rect x={x} y={20} width={32} height={32} rx={5} className={def ? "vz-cem--default" : "vz-cem--pagou"} /><text x={x + 16} y={41} textAnchor="middle" className="vz-imp-caixa-t">{def ? "D" : "✓"}</text></g>; })}
              <text x={8} y={84} className="vz-tick vz-tick--forte">{q.d} D e {q.n - q.d} ✓ · p = {q.d} ÷ {q.n} = {fmtNum(p, 4)}</text>
              <text x={8} y={106} className="vz-tick vz-tick--forte">Gini = 2 × p × (1 − p) = {fmtNum(gi, 5)}</text>
            </svg>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><tbody>
            <tr><th scope="row">Propostas no grupo</th><td>{q.n}</td></tr>
            <tr><th scope="row">Defaults</th><td>{q.d}</td></tr>
            <tr><th scope="row">Proporção p</th><td>{q.d} ÷ {q.n} = {fmtNum(p, 4)}</td></tr>
            <tr className="vz-t-on"><th scope="row">Gini = 2 × p × (1 − p)</th><td className="vz-t-forte">2 × {fmtNum(p, 3)} × {fmtNum(1 - p, 3)} = {fmtNum(gi, 5)}</td></tr>
          </tbody></table></div>
          <div className="vz-formula">Gini(t) = 2 × p(t) × (1 − p(t))</div>
          <p className="hint">Na raiz, 0,5 é o valor máximo que o Gini pode assumir com alvo binário. Esta base foi construída assim de propósito, para que os ganhos apareçam com números redondos. Em carteira real com 10% de default, o Gini da raiz seria {fmtNum(2 * 0.1 * 0.9, 4)}.</p>
        </div>
        <div className="vz-imp-lado">
          <div className="table-wrap vz-imp-base"><table className="table text-[.8em]"><thead><tr><th>#</th><th>Util.</th><th>Atraso</th><th>Default?</th></tr></thead><tbody>
            {BASE.map((r) => <tr key={r.id}><th scope="row">{r.id}</th><td>{r.util}%</td><td>{r.atraso} d</td><td className={r.y ? "vz-t-default" : "vz-t-ok"}>{r.y ? "sim" : "não"}</td></tr>)}
          </tbody></table></div>
          <p className="hint">Confira: conte os sim na última coluna.</p>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">O que significa reduzir a impureza</p><p className="vz-num vz-num--texto">Uma divisão reduz a impureza quando produz dois grupos mais homogêneos que o grupo original. O ganho é a diferença entre a impureza antes e a média ponderada das impurezas depois. Ponderada pelo tamanho, porque um grupo de doze pesa mais que um de quatro.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Raiz: 8 defaults em 16, p = 0,5, Gini 0,50000. A folha pura tem 0 em 6 e Gini 0; a folha mista tem 1 em 2 e Gini 0,5. Folhas da árvore de profundidade 2 crescida aqui sobre a base didática.</p>
    </figure>
  );
}

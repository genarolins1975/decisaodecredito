"use client";
import { useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { gini } from "@/lib/visuais/arvore";

/**
 * Impureza na raiz (capítulo 5, c5p5): o Gini da raiz calculado à mão sobre as 16 propostas, ao lado de uma folha
 * pura e de uma folha mista.
 */
const BASE = did.base as Proposta[];

/** O Gini da raiz calculado à mão (c5p5). A curva de Gini e entropia (c5p4) passou ao quadro .rl em impureza-curva.tsx. */
export function Impureza() {
  return <Raiz />;
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
          <p className="hint">0,5 é o máximo com alvo binário: a base foi montada meio a meio de propósito. Com 10% de default, o Gini da raiz seria {fmtNum(2 * 0.1 * 0.9, 4)}.</p>
        </div>
        <div className="vz-imp-lado">
          <div className="table-wrap vz-imp-base"><table className="table text-[.8em]"><thead><tr><th>#</th><th>Util.</th><th>Atraso</th><th>Default?</th></tr></thead><tbody>
            {BASE.map((r) => <tr key={r.id}><th scope="row">{r.id}</th><td>{r.util}%</td><td>{r.atraso} d</td><td className={r.y ? "vz-t-default" : "vz-t-ok"}>{r.y ? "sim" : "não"}</td></tr>)}
          </tbody></table></div>
          <p className="hint">Confira: conte os sim na última coluna.</p>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">O que significa reduzir a impureza</p><p className="vz-num vz-num--texto">Um corte reduz a impureza quando os dois grupos ficam menos misturados que o original. O ganho mede essa redução, pesando cada grupo pelo tamanho.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Raiz: 8 defaults em 16, p = 0,5, Gini 0,50000. A folha pura tem 0 em 6 e Gini 0; a folha mista tem 1 em 2 e Gini 0,5. Folhas da árvore de profundidade 2 crescida aqui sobre a base didática.</p>
    </figure>
  );
}

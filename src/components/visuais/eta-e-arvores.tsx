"use client";
import { useMemo } from "react";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";
import { boostingClassificacao } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";
import { SemCaixaAlta } from "./sem-caixa-alta";
import { ComTex } from "./tex";

/**
 * η e M são acoplados (c6p16). Para cada taxa, quantas árvores o boosting das 16 propostas precisa para a perda de
 * treino chegar a 0,50, e a perda de treino com 60 árvores. O produto η × árvores fica perto de 1,5: reduzir η pela
 * metade pede o dobro de árvores. Tabela e curva lado a lado, recalculadas aqui; substitui a página herdada, que
 * ocupava duas telas.
 */
const BASE = did.base as Proposta[];
const ETAS = [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1];
const ALVO = 0.5, MAX = 60, ETA_AULA = 0.4, K = 1.5;
const W = 520, H = 300, ML = 48, MR = 16, MT = 16, MB = 44, YMAX = 16;
const sx = (e: number) => ML + ((e - 0.05) / 1) * (W - ML - MR);
const sy = (m: number) => MT + (1 - m / YMAX) * (H - MT - MB);
export function tabelaEtaArvores() {
  return ETAS.map((eta) => { const ps = boostingClassificacao(BASE, eta, MAX); const m = ps.findIndex((p) => p.perda <= ALVO); return { eta, arvores: m, produto: eta * m, perda60: ps[MAX].perda }; });
}
/** Notas da base, com os trechos de fórmula entre cifrões (ComTex). */
export const NOTAS = [
  String.raw`$\eta \times \text{árvores}$ fica perto de 1,5: reduzir $\eta$ pela metade pede o dobro de árvores.`,
  String.raw`A última coluna é de treino: 0,06800 com $\eta = 1$ é memorização, não desempenho.`,
  "η pequeno custa tempo, mas dá à validação mais pontos onde parar.",
];

export function EtaEArvores() {
  const linhas = useMemo(() => tabelaEtaArvores(), []);
  const curva = linhas.map((l, i) => `${i ? "L" : "M"}${sx(l.eta).toFixed(1)} ${sy(l.arvores).toFixed(1)}`).join("");
  const hip = Array.from({ length: 91 }, (_, k) => 0.1 + k * 0.01).map((e, i) => `${i ? "L" : "M"}${sx(e).toFixed(1)} ${sy(Math.min(YMAX, K / e)).toFixed(1)}`).join("");
  return (
    <figure className="vz" data-vz="eta-e-arvores">
      <div className="vz-vf-grade">
        <div className="table-wrap"><table className="table vz-ma-tabela">
          <thead><tr><th><SemCaixaAlta>η</SemCaixaAlta></th><th>Árvores até perda {fmtNum(ALVO, 2)}</th><th><SemCaixaAlta>η × árvores</SemCaixaAlta></th><th>Perda, {MAX} árvores</th></tr></thead>
          <tbody>{linhas.map((l) => <tr key={l.eta} className={l.eta === ETA_AULA ? "vz-t-on" : ""}><th scope="row">{fmtNum(l.eta, 2)}</th><td>{l.arvores}</td><td className="vz-t-forte">{fmtNum(l.produto, 2)}</td><td>{fmtNum(l.perda60, 5)}</td></tr>)}</tbody>
        </table></div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">Árvores necessárias para a perda de treino chegar a {fmtNum(ALVO, 2)} <span className="hint">tracejada: 1,5 ÷ η</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Árvores necessárias por taxa de aprendizagem: 14 com η 0,1, 4 com η 0,4 e 2 com η 1; a curva acompanha 1,5 dividido por η">
            {[0, 4, 8, 12, 16].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 8} y={sy(v) + 4} textAnchor="end" className="vz-tick">{v}</text></g>)}
            {[0.1, 0.25, 0.5, 0.75, 1].map((e) => <text key={e} x={sx(e)} y={H - MB + 18} textAnchor="middle" className="vz-tick">{fmtNum(e, 2)}</text>)}
            <text x={(ML + W - MR) / 2} y={H - 8} textAnchor="middle" className="vz-rotulo">taxa de aprendizagem η</text>
            <path d={hip} className="vz-ma-hip" />
            <path d={curva} className="vz-vf-curva" />
            {linhas.map((l) => <circle key={l.eta} cx={sx(l.eta)} cy={sy(l.arvores)} r={l.eta === ETA_AULA ? 7 : 4.5} className={l.eta === ETA_AULA ? "vz-vf-otimo" : "vz-vf-cand"} />)}
            <text x={sx(ETA_AULA) + 10} y={sy(4) - 10} className="vz-vf-otimo-t">η = 0,4 da aula: 4 árvores</text>
          </svg>
        </div>
      </div>
      <ul className="vz-vf-notas">{NOTAS.map((n) => <li key={n}><ComTex t={n} /></li>)}</ul>
      <p className="vz-fonte">Boosting de classificação nas 16 propostas didáticas, árvores de profundidade 2 com mínimo de 2 por folha, partindo das log odds da prevalência. As duas colunas de perda são de treino.</p>
    </figure>
  );
}

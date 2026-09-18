"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import grid from "@/lib/visuais/grid-boosting.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { boostingClassificacao, rastro, rotuloCorteReg } from "@/lib/visuais/boosting";

/**
 * O que se perde, e o que se faz a respeito (capítulo 6, c6p18). Três limites do boosting, cada um com o seu sinal,
 * a resposta proporcional e uma evidência desta base: a grade do gerador para o sobreajuste, a árvore que muda ao
 * retirar uma proposta para a instabilidade, e as parcelas que se acumulam para a explicação.
 */
const BASE = did.base as Proposta[];
type Limite = "sobreajuste" | "instabilidade" | "explicacao";
const LIMITES: { k: Limite; nome: string; sinal: string; resposta: string }[] = [
  { k: "sobreajuste", nome: "Sobreajuste", sinal: "treino melhora; validação piora", resposta: "early stopping, menor profundidade e folha mínima maior" },
  { k: "instabilidade", nome: "Instabilidade", sinal: "pequenas mudanças alteram árvores", resposta: "regularização, sementes, validação temporal e análise por segmento" },
  { k: "explicacao", nome: "Explicação", sinal: "muitas correções somadas", resposta: "contribuições locais, efeito parcial com cautela e exemplos concretos" },
];
const PERDE = [["Coeficiente por variável", "não existe um número que resuma o efeito de utilização sobre a PD"], ["Monotonicidade garantida", "a PD estimada pode subir e descer com a mesma variável, sem hipótese econômica que sustente"], ["Explicação curta da decisão", "a decomposição existe, mas tem tantas parcelas quanto árvores"], ["Estabilidade da forma", "reestimar produz outro conjunto de árvores, ainda que com previsões parecidas"]];
const FAZ = [["Restrição de monotonicidade", "disponível na maioria das implementações. Impõe direção por variável e devolve a hipótese econômica"], ["Efeito parcial por variável", "mostra a forma da relação estimada, mesmo sem coeficiente"], ["Atribuição por observação", "decompõe a decisão individual em contribuições por variável, para o motivo de recusa"], ["Modelo de referência", "manter a logística em produção paralela, e exigir do desafiante ganho demonstrável"]];
const GRADE60 = (grid.grade as { max_iter: number; max_leaf_nodes: number; auc_val: number; auc_treino: number; auc_oot: number }[]).filter((g) => g.max_iter === 60).sort((a, b) => a.max_leaf_nodes - b.max_leaf_nodes);
const W = 640, H = 240, ML = 46, MR = 14, MT = 18, MB = 36;

export function TresLimites() {
  const [k, setK] = useState<Limite>("sobreajuste");
  const [M, setM] = useState(4);
  const l = LIMITES.find((x) => x.k === k)!;
  const inst = useMemo(() => [{ nome: "as 16 propostas", base: BASE }, { nome: "sem a #15", base: BASE.filter((p) => p.id !== 15) }, { nome: "sem a #16", base: BASE.filter((p) => p.id !== 16) }].map((c) => { const a = boostingClassificacao(c.base, 0.4, 1, 2, 2)[1].arvore!; const r = (n: typeof a | undefined) => (n?.corte ? rotuloCorteReg(n.corte.v, n.corte.valor) : "vira folha"); return { nome: c.nome, raiz: r(a), esq: r(a.esq), dir: r(a.dir) }; }), []);
  const parcelas = useMemo(() => rastro(boostingClassificacao(BASE, 0.4, M, 2, 2), 10, 0.4), [M]); // proposta #11
  const sy = (v: number) => MT + (1 - (v - 0.6) / 0.35) * (H - MT - MB);
  const evidencia = k === "sobreajuste" ? `Na grade do gerador com 60 árvores, a AUC de treino sobe de ${fmtNum(GRADE60[0].auc_treino, 4)} para ${fmtNum(GRADE60[2].auc_treino, 4)} ao passar de 4 para 16 folhas, e a de validação vai de ${fmtNum(GRADE60[0].auc_val, 4)} para ${fmtNum(GRADE60[2].auc_val, 4)}.`
    : k === "instabilidade" ? `Retirar uma proposta de dezesseis muda a primeira árvore: sem a #15 o nó direito vira folha; sem a #16 o corte da direita passa de 87,5% para 82,5%.`
    : `A PD da proposta #11 com ${M} árvores é F₀ mais ${M} parcelas em log odds: ${fmtPct(parcelas[parcelas.length - 1].p, 1)}. A explicação existe, mas tem tantas parcelas quanto árvores.`;
  return (
    <figure className="vz" data-vz="tres-limites">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Três limites do boosting · o sinal, a resposta proporcional e a evidência desta base</p>
          <p className="vz-tit">O boosting troca interpretação direta por flexibilidade. Nomeie a falha primeiro; depois escolha o controle correspondente.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Limite">{LIMITES.map((x) => <button key={x.k} type="button" className={`btn btn-sm ${k === x.k ? "" : "btn-secondary"}`} onClick={() => setK(x.k)}>{x.nome}</button>)}</div>
      </header>
      <div className="vz-estado"><b>{l.nome}. Sinal: {l.sinal}. Resposta proporcional: {l.resposta}.</b> {evidencia}</div>
      <div className="vz-tl-grade">
        <div className="vz-grafico">
          {k === "sobreajuste" && <>
            <p className="vz-grafico-t">AUC por número de folhas, 60 árvores, base de 5.000 do gerador <span className="hint">treino sobe; validação e fora do tempo não acompanham</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="AUC de treino, validação e fora do tempo por folhas">
              {[0.6, 0.7, 0.8, 0.9].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
              {GRADE60.map((g, i) => { const x0 = ML + 30 + i * 190; return <g key={g.max_leaf_nodes}>
                {[["treino", g.auc_treino, "vz-tl-b--treino"], ["validação", g.auc_val, "vz-tl-b--val"], ["fora do tempo", g.auc_oot, "vz-tl-b--oot"]].map(([n, v, c], j) => <g key={n as string}><rect x={x0 + j * 44} y={sy(v as number)} width={38} height={sy(0.6) - sy(v as number)} rx={3} className={`vz-tl-b ${c}`} /><text x={x0 + j * 44 + 19} y={sy(v as number) - 5} textAnchor="middle" className="vz-tick vz-tick--forte">{fmtNum(v as number, 3)}</text></g>)}
                <text x={x0 + 66} y={H - MB + 16} textAnchor="middle" className="vz-tick">{g.max_leaf_nodes} folhas por árvore</text>
              </g>; })}
              <text x={ML + 4} y={MT - 6} className="vz-rotulo">AUC</text>
            </svg>
            <div className="vz-legenda"><span><span className="vz-sw vz-sw--treino" /> treino</span><span><span className="vz-sw vz-sw--val" /> validação</span><span><span className="vz-sw vz-sw--oot" /> fora do tempo</span></div>
          </>}
          {k === "instabilidade" && <>
            <p className="vz-grafico-t">A primeira árvore, com e sem uma proposta <span className="hint">η 0,4, profundidade 2, mínimo 2, na base didática</span></p>
            <div className="vz-tl-inst">{inst.map((c) => <div key={c.nome} className={`vz-tile ${c.nome === "as 16 propostas" ? "" : "vz-tile--alerta"}`}><p className="eyebrow">{c.nome}</p><p className="vz-num vz-num--mono">{c.raiz}</p><p className="hint">esquerda: {c.esq} · direita: {c.dir}</p></div>)}</div>
          </>}
          {k === "explicacao" && <>
            <p className="vz-grafico-t">A PD da proposta #11 decomposta: F₀ e uma parcela por árvore <span className="hint">utilização 70%, atraso 5 dias, default</span></p>
            <div className="vz-acoes" role="group" aria-label="Número de árvores">{[4, 12, 40].map((m) => <button key={m} type="button" className={`btn btn-sm ${M === m ? "" : "btn-secondary"}`} onClick={() => setM(m)}>{m} árvores</button>)}</div>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${M} parcelas somadas; PD final ${fmtPct(parcelas[parcelas.length - 1].p, 1)}`}>
              {(() => { const bw = (W - ML - MR) / (M + 1); const ymax = Math.max(0.1, ...parcelas.map((p) => Math.max(Math.abs(p.parcela), Math.abs(p.F)))) * 1.1; const y0 = MT + (H - MT - MB) / 2; const sc = (H - MT - MB) / 2 / ymax; return <>
                <line x1={ML} x2={W - MR} y1={y0} y2={y0} className="vz-zero" />
                <polyline points={parcelas.map((p, i) => `${(ML + (i + 0.5) * bw).toFixed(1)},${(y0 - p.F * sc).toFixed(1)}`).join(" ")} className="vz-curva vz-curva--ouro" />
                {parcelas.map((p, i) => <rect key={p.m} x={ML + i * bw + 1} y={p.parcela >= 0 ? y0 - p.parcela * sc : y0} width={Math.max(1, bw - 2)} height={Math.abs(p.parcela) * sc} rx={2} className={`vz-tl-parc ${i === 0 ? "vz-tl-parc--f0" : p.parcela >= 0 ? "vz-tl-parc--mais" : "vz-tl-parc--menos"}`} />)}
                <text x={ML} y={H - MB + 16} className="vz-tick">F₀ = {fmtNum(parcelas[0].F, 3)}</text><text x={ML + 4} y={y0 - 6} className="vz-tick vz-tick--nota">barras: parcela de cada árvore · linha dourada: soma acumulada</text><text x={W - MR} y={H - MB + 16} textAnchor="end" className="vz-tick">árvore {M}</text>
                <text x={ML + 4} y={MT - 6} className="vz-rotulo">parcela em log odds</text>
                <text x={W - MR} y={MT + 8} textAnchor="end" className="vz-tick vz-tick--forte">soma {fmtNum(parcelas[parcelas.length - 1].F, 3)} → PD {fmtPct(parcelas[parcelas.length - 1].p, 1)}</text>
              </>; })()}
            </svg>
          </>}
        </div>
        <div className="vz-tl-lado">
          <div className="vz-tile"><p className="eyebrow">O que se perde</p><table className="table text-[.85em] vz-esc-usos"><tbody>{PERDE.map((r) => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td></tr>)}</tbody></table></div>
          <div className="vz-tile"><p className="eyebrow">O que se faz</p><table className="table text-[.85em] vz-esc-usos"><tbody>{FAZ.map((r) => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td></tr>)}</tbody></table></div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">A pergunta que o comitê fará</p><p className="vz-num vz-num--texto">O ganho de desempenho compensa a perda de explicação, dada a exigência regulatória de informar o motivo da recusa e a necessidade de sustentar o modelo em inspeção? A resposta depende da magnitude do ganho e da sua significância, e é isso que o capítulo 7 mede.</p></div>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">Uma posição defensável</p><p className="vz-num vz-num--texto">Adotar o desafiante quando o ganho for material e demonstrável fora do tempo, com teste apropriado, com monotonicidade imposta nas variáveis que têm direção econômica clara e com atribuição individual disponível para o motivo de recusa. Nenhuma dessas condições é exótica, e todas são verificáveis.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Grade do gerador com 60 árvores: 4 folhas dá AUC 0,7588 no treino e 0,6400 na validação; 8 folhas, 0,8196 e 0,6476; 16 folhas, 0,9114 e 0,6388. A configuração escolhida por validação foi 60 árvores e 8 folhas. Não existe correção universal: primeiro nomeie a falha, depois escolha o controle correspondente.</p>
    </figure>
  );
}

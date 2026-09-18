"use client";
import { useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { FILA_DIDATICA, pares } from "@/lib/visuais/avaliacao";
import { aucPorPares, fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * AUC é uma contagem de pares (capítulo 7, c7p5). Quatro defaults e cinco pagadores da fila didática formam 20 pares;
 * a turma revela um par de cada vez e vê a proporção de pares corretamente ordenados se formar: 12 de 20, 0,600. Na
 * janela real são 53.136 pares e 0,7257.
 */
const P = pares(FILA_DIDATICA); const REAL = aucPorPares(oot.y as number[], oot.pd as number[]);
export function Pares() {
  const [k, setK] = useState(0);
  const vistos = P.pares.slice(0, k); const corretos = vistos.filter((p) => p.estado === "correto").length; const empates = vistos.filter((p) => p.estado === "empate").length;
  const ds = FILA_DIDATICA.filter((f) => f.y), as = FILA_DIDATICA.filter((f) => !f.y);
  return (
    <figure className="vz" data-vz="pares">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">AUC é uma contagem de pares · 4 defaults × 5 pagadores da fila didática = 20 pares</p>
          <p className="vz-tit">A AUC é a chance de um default receber PD maior que um pagador sorteado. Conte os pares e ela aparece.</p>
        </div>
        <div className="vz-acoes"><button type="button" className="btn btn-sm" onClick={() => setK(Math.min(20, k + 1))} disabled={k >= 20}>Próximo par</button><button type="button" className="btn btn-sm btn-secondary" onClick={() => setK(20)} disabled={k >= 20}>Todos</button><button type="button" className="btn btn-sm btn-ghost" onClick={() => setK(0)}>Recomeçar</button></div>
      </header>
      <div className="vz-estado">{k === 0 ? <><b>Nenhum par revelado.</b> Cada célula é um par default × pagador; o par conta quando a PD do default é maior.</> : <><b>{k} de 20 pares: {corretos} corretos{empates ? `, ${empates} empates` : ""}, {k - corretos - empates} invertidos.</b> Proporção até aqui {fmtNum((corretos + 0.5 * empates) / k, 3)}. {k === 20 && "Com os 20 pares: 12 corretos, AUC 0,600."}</>}</div>
      <div className="vz-par-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Os 20 pares <span className="hint">linhas: defaults · colunas: pagadores · verde: default acima · vermelho: invertido</span></p>
          <table className="vz-par-tab" role="grid" aria-label="Pares default por pagador">
            <thead><tr><th scope="col" />{as.map((a) => <th key={a.id} scope="col">#{a.id}<small>{fmtPct(a.pd)}</small></th>)}</tr></thead>
            <tbody>{ds.map((d) => <tr key={d.id}><th scope="row">#{d.id}<small>{fmtPct(d.pd)}</small></th>{as.map((a) => { const idx = P.pares.findIndex((p) => p.d.id === d.id && p.a.id === a.id); const p = P.pares[idx]; const on = idx < k; return <td key={a.id} className={`vz-par-cel ${on ? `vz-par-cel--${p.estado}` : ""}`} onClick={() => setK(Math.max(k, idx + 1))}>{on ? (p.estado === "correto" ? "✓" : p.estado === "empate" ? "½" : "✗") : ""}</td>; })}</tr>)}</tbody>
          </table>
        </div>
        <div className="vz-par-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Exemplo didático</p><p className="vz-num">{k ? `${corretos + (empates ? ` + ½·${empates}` : "")} / ${k}` : "0 / 0"} {k === 20 && <span className="hint">= 0,600</span>}</p><p className="hint">pares corretos mais meio ponto por empate, sobre os pares revelados</p></div>
            <div className="vz-tile"><p className="eyebrow">Janela fora do tempo, logística</p><p className="vz-num">{fmtNum(REAL.auc, 4)}</p><p className="hint">{REAL.pares.toLocaleString("pt-BR")} pares default × pagador, 81 × 656</p></div>
            <div className="vz-tile"><p className="eyebrow">A fórmula</p><p className="vz-num vz-num--texto">AUC = (pares corretos + 0,5 × empates) ÷ pares default × pagador</p></div>
          </div>
        </div>
      </div>
      <p className="vz-fonte">Fila didática de nove propostas do capítulo 7: defaults #30 (20%), #54 (16%), #20 (8%) e #28 (5%); pagadores #0 (22%), #1 (11%), #3 (10%), #2 (3%) e #4 (3%). Doze dos vinte pares têm o default acima: AUC 0,600. Na janela, 0,7257.</p>
    </figure>
  );
}

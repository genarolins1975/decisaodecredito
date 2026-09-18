"use client";
import { useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { esperado, fmtReais, realizado } from "@/lib/visuais/economia";
import { wilson } from "@/lib/visuais/arvore";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Apertar o corte troca defaults evitados por bons recusados (capítulo 8, c8p7). Contagem retrospectiva na janela
 * fora do tempo: o que a recusa evitou, o que abandonou e o saldo em reais, com o corte na mão da turma.
 */
const Y = oot.y as number[], PD = oot.pd as number[], EAD = oot.ead as number[];
export function TrocaDoCorte() {
  const [corte, setCorte] = useState(0.1);
  const r = useMemo(() => {
    let rd = 0, rp = 0, expD = 0, expP = 0, evit = 0, aband = 0, todos = 0, aprovAp = 0, esp = 0, aprovados = 0;
    PD.forEach((p, i) => { const real = realizado(Y[i], EAD[i]); todos += real; if (p < corte) { aprovados++; aprovAp += real; esp += esperado(p, EAD[i]); return; } if (Y[i]) { rd++; expD += EAD[i]; evit -= real; } else { rp++; expP += EAD[i]; aband += real; } });
    return { rd, rp, expD, expP, evit, aband, todos, aprovAp, esp, aprovados };
  }, [corte]);
  const w = wilson(r.rd, r.rd + r.rp);
  return (
    <figure className="vz" data-vz="troca-do-corte">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A troca do corte · 737 propostas fora do tempo · revisão manual desligada para isolar o efeito</p>
          <p className="vz-tit">Toda mudança de corte evita defaults e recusa bons ao mesmo tempo. A decisão só existe quando a troca se conta em reais.</p>
        </div>
      </header>
      <div className="vz-estado"><b>Corte de aprovação em PD {fmtPct(corte, 1)}:</b> {r.aprovados} aprovados de 737 ({fmtPct(r.aprovados / 737, 1)}), resultado esperado {fmtReais(r.esp)} pelo motor. Retrospectivamente, a recusa evitou {fmtReais(r.evit)} e abandonou {fmtReais(r.aband)}: saldo {fmtReais(r.evit - r.aband)}.</div>
      <div className="vz-tdc-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">O que a recusa evitou e o que ela abandonou <span className="hint">contagem depois do fato, com o desfecho já conhecido</span></p>
          <div className="vz-tdc-barras" role="img" aria-label="Evitado contra abandonado">
            <div className="vz-tdc-linha"><span className="vz-tdc-rot">evitado<small>{r.rd} defaults recusados</small></span><span className="vz-tdc-trilho"><span className="vz-tdc-fill vz-tdc-fill--ok" style={{ width: `${Math.min(100, (r.evit / 1.2e6) * 100)}%` }} /></span><b>{fmtReais(r.evit)}</b></div>
            <div className="vz-tdc-linha"><span className="vz-tdc-rot">abandonado<small>{r.rp} bons recusados</small></span><span className="vz-tdc-trilho"><span className="vz-tdc-fill vz-tdc-fill--erro" style={{ width: `${Math.min(100, (r.aband / 1.2e6) * 100)}%` }} /></span><b>{fmtReais(r.aband)}</b></div>
            <div className="vz-tdc-linha vz-tdc-linha--saldo"><span className="vz-tdc-rot">saldo da recusa<small>{r.rd + r.rp} propostas</small></span><span className="vz-tdc-trilho"><span className={`vz-tdc-fill ${r.evit - r.aband >= 0 ? "vz-tdc-fill--ouro" : "vz-tdc-fill--erro"}`} style={{ width: `${Math.min(100, (Math.abs(r.evit - r.aband) / 1.2e6) * 100)}%` }} /></span><b>{fmtReais(r.evit - r.aband)}</b></div>
          </div>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte de aprovação em PD</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={2} max={40} step={0.5} value={corte * 100} onChange={(e) => setCorte(Number(e.target.value) / 100)} /></label>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Grupo recusado</th><th>Propostas</th><th>Exposição</th><th>Em reais</th></tr></thead><tbody>
            <tr><th scope="row">Recusados que deram default</th><td>{r.rd}</td><td>{fmtReais(r.expD)}</td><td className="vz-t-ok">{fmtReais(r.evit)} evitados</td></tr>
            <tr><th scope="row">Recusados que teriam pago</th><td>{r.rp}</td><td>{fmtReais(r.expP)}</td><td className="vz-t-baixo">{fmtReais(r.aband)} abandonados</td></tr>
            <tr className="vz-t-on"><th scope="row">Saldo da recusa</th><td>{r.rd + r.rp}</td><td>{fmtReais(r.expD + r.expP)}</td><td>{fmtReais(r.evit - r.aband)}</td></tr>
          </tbody></table></div>
        </div>
        <div className="vz-tdc-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Taxa de default entre os recusados</p><p className="vz-num">{r.rd + r.rp ? fmtPct(r.rd / (r.rd + r.rp), 1) : "—"}</p><p className="hint">intervalo de Wilson de {fmtPct(w.lo, 1)} a {fmtPct(w.hi, 1)} com {r.rd + r.rp} propostas</p></div>
            <div className="vz-tile"><p className="eyebrow">Conferência</p><p className="vz-num vz-num--texto">Realizado da carteira inteira {fmtReais(r.todos)}, mais o saldo da recusa {fmtReais(r.evit - r.aband)}, dá {fmtReais(r.todos + r.evit - r.aband)}: o realizado da carteira aprovada, {fmtReais(r.aprovAp)}. Fecha.</p></div>
            <div className="vz-tile"><p className="eyebrow">No momento da decisão</p><p className="vz-num vz-num--texto">O banco não sabe quem vai dar default: sabe a PD. Esta tela mede o preço da política depois do fato, que é o que um comitê de revisão faz.</p></div>
          </div>
        </div>
      </div>
      <p className="vz-fonte">Evitado é a perda realizada de cada default recusado; abandonado é o resultado realizado de cada pagador recusado. Corte de 10%: 469 aprovados e R$ 585 mil esperados; 55 defaults recusados com R$ 606 mil evitados, 213 bons recusados com R$ 330 mil abandonados, saldo R$ 276 mil; realizado da carteira inteira R$ 378 mil, os números da página.</p>
    </figure>
  );
}

"use client";
import { useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { avaliarCarteira } from "@/lib/visuais/politica";
import { fmtReais } from "@/lib/visuais/economia";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Reconciliação é condição de aceite (capítulo 8, c8p10). Resumo, ponte e detalhe lidos dos mesmos registros por
 * operação: as parcelas somam o total sem folga porque existe um único motor. O corte fica na mão da turma.
 */
const OPS = { pd: oot.pd as number[], ead: oot.ead as number[], y: oot.y as number[], pt: oot.pt as number[] };
export function Ponte() {
  const [corte, setCorte] = useState(0.14);
  const a = useMemo(() => avaliarCarteira(OPS, { corte, capacidade: 0 }), [corte]);
  const ap = a.reg.filter((r) => r.aprovado); const pdMedia = ap.length ? ap.reduce((s, r) => s + r.pd, 0) / ap.length : 0;
  const soma = a.receitaEsp - a.perda - a.funding - a.operacao - a.capital - a.revisoes; const folga = a.esperado - soma;
  const linhas = [["Receita esperada, ponderada por não default", a.receitaEsp], ["Perda esperada", -a.perda], ["Custo de funding", -a.funding], ["Custo operacional", -a.operacao], ["Custo de capital", -a.capital], ["Custo das revisões", -a.revisoes]] as const;
  return (
    <figure className="vz" data-vz="ponte">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Ponte de reconciliação · resumo, parcelas e total dos mesmos registros · 737 propostas fora do tempo</p>
          <p className="vz-tit">A ponte responde uma pergunta só: as parcelas que eu mostro somam o total que eu afirmo? Se não somam, o painel lê duas carteiras.</p>
        </div>
      </header>
      <div className="vz-estado"><b>Corte de aprovação {fmtPct(corte, 1)}:</b> {a.aprovados} aprovados, exposição {fmtReais(a.exposicao)}, perda esperada sobre exposição {fmtPct(a.exposicao ? a.perda / a.exposicao : 0, 2)}. PD média dos aprovados {fmtPct(pdMedia, 2)}, margem média por operação {fmtReais(a.aprovados ? a.esperado / a.aprovados : 0)}. Folga da ponte: {fmtReais(folga)}.</div>
      <div className="vz-pon-grade">
        <div className="vz-grafico">
          <div className="vz-tiles">
            <div className="vz-tile"><p className="eyebrow">Aprovados</p><p className="vz-num">{a.aprovados}</p></div>
            <div className="vz-tile"><p className="eyebrow">Exposição</p><p className="vz-num">{fmtReais(a.exposicao)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Perda esperada sobre exposição</p><p className="vz-num">{fmtPct(a.exposicao ? a.perda / a.exposicao : 0, 2)}</p></div>
          </div>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte de aprovação</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={2} max={40} step={0.5} value={corte * 100} onChange={(e) => setCorte(Number(e.target.value) / 100)} /></label>
          <div className="vz-tile"><p className="eyebrow">O que a ponte responde</p><p className="vz-num vz-num--texto">Não é conferência de arredondamento: é teste de identidade da carteira. Nesta aula existe um único motor, e resumo, curva do corte, composição por faixa e ponte leem os mesmos registros por operação. Num sistema real, com resumo de um relatório e detalhe de outro, a folga é o primeiro sintoma de que os dois se desencontraram.</p></div>
        </div>
        <div className="vz-pon-painel">
          <p className="vz-grafico-t">Ponte de reconciliação, corte em {fmtPct(corte, 1)}</p>
          <div className="table-wrap"><table className="table text-[.85em] vz-mesa-ponte"><tbody>{linhas.map(([r, v]) => <tr key={r}><th scope="row">{r}</th><td className={v < 0 ? "vz-t-baixo" : ""}>{fmtReais(v)}</td></tr>)}<tr className="vz-t-on"><th scope="row">Resultado esperado</th><td>{fmtReais(a.esperado)}</td></tr><tr><th scope="row">Folga entre parcelas e total</th><td className={Math.abs(folga) < 0.5 ? "vz-t-ok" : "vz-t-baixo"}>{fmtReais(folga)}</td></tr></tbody></table></div>
        </div>
      </div>
      <p className="vz-fonte">Corte de 14% sem revisão: 580 aprovados, exposição R$ 8,38 mi, perda esperada 4,13% da exposição, PD média 6,81%, margem média R$ 1.049 e resultado R$ 608 mil, folga R$ 0, os números da página.</p>
    </figure>
  );
}

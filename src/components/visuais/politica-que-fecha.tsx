"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { avaliarCarteira, POLITICA } from "@/lib/visuais/politica";
import { fmtReais, GRADE_CORTES } from "@/lib/visuais/economia";
import { assinarLab, decodificarLab, gravarLab, lerLab } from "@/lib/visuais/lab-estado";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Escolha a política e prove que ela fecha consigo mesma (capítulo 8, c8p12). Corte, teto, capacidade e qualidade na
 * mão; composição da carteira aprovada por faixa de PD usada, parcelas e total dos mesmos registros; a política
 * congelada fica guardada no navegador e volta no capítulo 10.
 */
const OPS = { pd: oot.pd as number[], ead: oot.ead as number[], y: oot.y as number[], pt: oot.pt as number[] };
const FAIXAS = [[0, 0.05, "0% a 5%"], [0.05, 0.1, "5% a 10%"], [0.1, 0.2, "10% a 20%"], [0.2, 1.01, "20% a 100%"]] as const;
export function PoliticaQueFecha() {
  const bruto = useSyncExternalStore(assinarLab, lerLab, () => "{}");
  const estado = useMemo(() => decodificarLab(bruto), [bruto]);
  const [corte, setCorte] = useState(POLITICA.corte);
  const [teto, setTeto] = useState(POLITICA.teto);
  const [capacidade, setCapacidade] = useState(POLITICA.capacidade);
  const [qualidade, setQualidade] = useState(POLITICA.qualidade);
  const a = useMemo(() => avaliarCarteira(OPS, { corte, teto, capacidade, qualidade }), [corte, teto, capacidade, qualidade]);
  const otimo = useMemo(() => GRADE_CORTES.reduce((b, c) => { const e = avaliarCarteira(OPS, { corte: c, teto: Math.max(c, teto), capacidade, qualidade }).esperado; return e > b.e ? { c, e } : b; }, { c: corte, e: -Infinity }), [teto, capacidade, qualidade, corte]);
  const faixas = FAIXAS.map(([lo, hi, rot]) => { const f = a.reg.filter((r) => r.aprovado && r.pdUsada >= lo && r.pdUsada < hi); return { rot, n: f.length, exp: f.reduce((s, r) => s + r.ead, 0), esp: f.reduce((s, r) => s + r.esperado, 0), d: f.reduce((s, r) => s + r.y, 0) }; });
  const tot = faixas.reduce((s, f) => ({ n: s.n + f.n, exp: s.exp + f.exp, esp: s.esp + f.esp, d: s.d + f.d }), { n: 0, exp: 0, esp: 0, d: 0 });
  const congelada = estado.rodada1 && Math.abs(estado.rodada1.corte - corte) < 1e-9 && Math.abs(estado.rodada1.teto - teto) < 1e-9 && estado.rodada1.capacidade === capacidade;
  return (
    <figure className="vz" data-vz="politica-que-fecha">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Escolha a política e prove que ela fecha · três zonas, revisão com capacidade · 737 propostas fora do tempo</p>
          <p className="vz-tit">Uma política é defensável quando composição por faixa, parcelas e total vêm do mesmo conjunto de operações.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => gravarLab({ ...estado, rodada1: { corte, teto, capacidade } })} disabled={!!congelada}>{congelada ? "Política congelada" : "Congelar esta política"}</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setCorte(otimo.c)}>Usar o corte ótimo ({fmtPct(otimo.c, 1)})</button>
        </div>
      </header>
      <div className="vz-estado"><b>Aprovados {a.aprovados}, {a.aprovadosNaRevisao} deles pela revisão. Resultado esperado {fmtReais(a.esperado)}</b>, líquido de {fmtReais(a.revisoes)} de revisões. {estado.rodada1 ? `Política congelada neste navegador: corte ${fmtPct(estado.rodada1.corte, 1)}, teto ${fmtPct(estado.rodada1.teto, 1)}, capacidade ${estado.rodada1.capacidade}; ela volta no capítulo 10 para ser comparada com a decisão tomada depois do choque.` : "A política congelada fica guardada e volta no capítulo 10."}</div>
      <div className="vz-pqf-grade">
        <div className="vz-grafico">
          <div className="vz-mesa-controles vz-mesa-controles--linha">
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte de aprovação automática</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={2} max={30} step={0.5} value={corte * 100} onChange={(e) => { const v = Number(e.target.value) / 100; setCorte(v); if (v > teto) setTeto(v); }} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Teto da faixa de revisão</span><span className="vz-slider-valor">{fmtPct(teto, 1)}</span></span><input type="range" min={5} max={60} step={1} value={teto * 100} onChange={(e) => setTeto(Math.max(corte, Number(e.target.value) / 100))} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Capacidade de revisão</span><span className="vz-slider-valor">{capacidade}</span></span><input type="range" min={0} max={300} step={10} value={capacidade} onChange={(e) => setCapacidade(Number(e.target.value))} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Qualidade do sinal do analista</span><span className="vz-slider-valor">{fmtPct(qualidade)}</span></span><input type="range" min={0} max={100} step={5} value={qualidade * 100} onChange={(e) => setQualidade(Number(e.target.value) / 100)} /></label>
          </div>
          <p className="vz-grafico-t">Composição da carteira aprovada por faixa de PD usada</p>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Faixa de PD usada</th><th>Operações</th><th>Exposição</th><th>Resultado esperado</th><th>Defaults observados</th></tr></thead><tbody>{faixas.map((f) => <tr key={f.rot}><th scope="row">{f.rot}</th><td>{f.n}</td><td>{fmtReais(f.exp)}</td><td>{fmtReais(f.esp)}</td><td>{f.d}</td></tr>)}<tr className="vz-t-on"><th scope="row">Total das faixas</th><td>{tot.n}</td><td>{fmtReais(tot.exp)}</td><td>{fmtReais(tot.esp)}</td><td>{tot.d}</td></tr></tbody></table></div>
        </div>
        <div className="vz-pqf-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Contagem</p><p className="vz-num vz-num--texto">As faixas somam {tot.n} operações e a carteira aprovada tem {a.aprovados}. {tot.n === a.aprovados ? "Fecha." : "Não fecha."}</p></div>
            <div className="vz-tile"><p className="eyebrow">Resultado</p><p className="vz-num vz-num--texto">As faixas somam {fmtReais(tot.esp)} antes do custo de revisão, e o resultado líquido é {fmtReais(a.esperado)} depois de {fmtReais(a.revisoes)}. {Math.abs(tot.esp - a.revisoes - a.esperado) < 0.5 ? "Fecha." : "Não fecha."}</p></div>
            <div className="vz-tile"><p className="eyebrow">Defaults</p><p className="vz-num vz-num--texto">As faixas somam {tot.d} defaults observados e a carteira aprovada tem {a.defaultsAprovados}. {tot.d === a.defaultsAprovados ? "Fecha." : "Não fecha."}</p></div>
          </div>
        </div>
      </div>
      <p className="vz-fonte">Corte 12%, teto 30%, capacidade 80 e qualidade 60%: 548 aprovados, 23 pela revisão, R$ 607 mil líquidos de R$ 7.200; faixas 213, 266, 69 e 0 operações com 8, 18, 10 e 0 defaults, os números da página. A política congelada usa a chave lab10.estado deste navegador.</p>
    </figure>
  );
}

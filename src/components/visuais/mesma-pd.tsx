"use client";
import { useState } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
const fmtReais = (v: number) => `${v < 0 ? "−" : ""}R$ ${Math.round(Math.abs(v)).toLocaleString("pt-BR")}`;

/**
 * Mesma PD, decisões econômicas diferentes (capítulo 1, c1p7). Duas operações com a mesma probabilidade de default e
 * resultados esperados opostos, porque exposição, receita e severidade mudam. Ordenar risco e escolher uma operação
 * são tarefas diferentes; o capítulo 8 constrói a conta completa.
 */
const FUNDING = 0.12, OPERACAO = 120;
const OPS = [
  { k: "A", nome: "Operação A", ead: 9000, rec: 3060, perda: 4050 },
  { k: "B", nome: "Operação B", ead: 15000, rec: 2850, perda: 12000 },
];
export const resultadoEsperado = (pd: number, o: { ead: number; rec: number; perda: number }) => (1 - pd) * o.rec - pd * o.perda - FUNDING * o.ead - OPERACAO;
const W = 640, H = 210, ML = 150, MR = 84, MT = 14, MB = 30;

export function MesmaPd() {
  const [pd, setPd] = useState(0.12);
  const [sel, setSel] = useState("A");
  const res = OPS.map((o) => ({ ...o, valor: resultadoEsperado(pd, o), parcelas: [{ n: "receita se pagar", v: (1 - pd) * o.rec }, { n: "perda se default", v: -pd * o.perda }, { n: "custo do funding", v: -FUNDING * o.ead }, { n: "custo operacional", v: -OPERACAO }] }));
  const melhor = res.reduce((m, o) => (o.valor > m.valor ? o : m), res[0]);
  const decisao = res.every((o) => o.valor < 0) ? "recusar as duas" : `preferir ${melhor.k}`;
  const o = res.find((x) => x.k === sel)!;
  const max = Math.max(...res.flatMap((r) => r.parcelas.map((p) => Math.abs(p.v))), Math.abs(o.valor)) * 1.1;
  const sx = (v: number) => ML + ((v + max) / (2 * max)) * (W - ML - MR);
  return (
    <figure className="vz" data-vz="mesma-pd">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Mesma PD, decisões econômicas diferentes · risco idêntico, valor esperado não</p>
          <p className="vz-tit">Ordenar o risco e escolher uma operação são tarefas diferentes. A PD é a mesma; a decisão muda porque exposição, receita e severidade mudam.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Operação">{OPS.map((x) => <button key={x.k} type="button" className={`btn btn-sm ${sel === x.k ? "" : "btn-secondary"}`} onClick={() => setSel(x.k)}>{x.nome}</button>)}</div>
      </header>
      <div className={`vz-estado ${o.valor >= 0 ? "vz-estado--ok" : "vz-estado--alterado"}`}><b>{o.nome}, PD {fmtPct(pd)}: resultado esperado {fmtReais(o.valor)}.</b> Com a mesma PD nas duas, A dá {fmtReais(res[0].valor)} e B dá {fmtReais(res[1].valor)}. Decisão: {decisao}.</div>
      <div className="vz-mpd-grade">
        <div className="vz-mpd-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>PD, fixa nas duas operações</b> <span className="vz-slider-valor">{fmtPct(pd)}</span></span><input type="range" min={2} max={40} step={1} value={Math.round(pd * 100)} onChange={(e) => setPd(Number(e.target.value) / 100)} aria-valuetext={fmtPct(pd)} /></label>
          <div className="vz-mpd-cards">
            {res.map((r) => <button key={r.k} type="button" className={`vz-tile vz-mpd-card ${sel === r.k ? "vz-mpd-card--on" : ""} ${r.valor >= 0 ? "vz-tile--ok" : "vz-tile--alerta"}`} onClick={() => setSel(r.k)}>
              <p className="eyebrow">{r.nome}</p><p className={`vz-num ${r.valor >= 0 ? "vz-num--ok" : "vz-num--default"}`}>{fmtReais(r.valor)}</p>
              <table className="table text-[.85em] vz-mpd-tabela"><tbody><tr><th scope="row">exposição</th><td>{fmtReais(r.ead)}</td></tr><tr><th scope="row">receita se pagar</th><td>{fmtReais(r.rec)}</td></tr><tr><th scope="row">perda se default</th><td>{fmtReais(r.perda)}</td></tr></tbody></table>
            </button>)}
          </div>
        </div>
        <div className="vz-mpd-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">As parcelas de {o.nome} <span className="hint">receita e perda ponderadas pela PD, funding de {fmtPct(FUNDING)} sobre a exposição e {fmtReais(OPERACAO)} de operação</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Parcelas de ${o.nome}: resultado ${fmtReais(o.valor)}`}>
              <line x1={sx(0)} x2={sx(0)} y1={MT} y2={H - MB} className="vz-zero" />
              {[...o.parcelas, { n: "resultado esperado", v: o.valor }].map((p, i) => { const y = MT + i * 36; const total = i === o.parcelas.length; return <g key={p.n}>
                <text x={ML - 8} y={y + 16} textAnchor="end" className={`vz-tick ${total ? "vz-tick--forte" : ""}`}>{p.n}</text>
                <rect x={Math.min(sx(0), sx(p.v))} y={y} width={Math.max(1, Math.abs(sx(p.v) - sx(0)))} height={24} rx={3} className={`vz-mpd-barra ${total ? (p.v >= 0 ? "vz-mpd-barra--total-ok" : "vz-mpd-barra--total-erro") : p.v >= 0 ? "vz-mpd-barra--mais" : "vz-mpd-barra--menos"}`} />
                <text x={p.v >= 0 ? sx(p.v) + 6 : sx(p.v) - 6} y={y + 16} textAnchor={p.v >= 0 ? "start" : "end"} className="vz-tick vz-tick--forte">{fmtReais(p.v)}</text>
              </g>; })}
            </svg>
          </div>
          <div className="vz-formula">resultado esperado = (1 − PD) × receita − PD × perda − funding × exposição − custo operacional</div>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">Decisão</p><p className="vz-num vz-num--texto">{decisao.charAt(0).toUpperCase() + decisao.slice(1)}. A PD ordena o risco; a operação se escolhe pelo valor esperado, e o capítulo 8 vai construir essa conta de forma completa, com provisão, capital e política.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Com PD de 12%: A tem exposição R$ 9.000, receita R$ 3.060 se pagar e perda R$ 4.050 se default, resultado R$ 1.007; B tem R$ 15.000, R$ 2.850 e R$ 12.000, resultado −R$ 852. Funding de 12% da exposição e R$ 120 de operação, os parâmetros do capítulo 8. Mova a PD: a partir de certo ponto nenhuma das duas compensa.</p>
    </figure>
  );
}

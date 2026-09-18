"use client";
import { useState } from "react";
import { esperado, fmtReais } from "@/lib/visuais/economia";
import { POLITICA } from "@/lib/visuais/politica";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Três clientes, três zonas (capítulo 10, c10p2). A cadeia PD → valor → ação para Helena, Rogério e Dalva, com o corte
 * e o teto da política na mão da turma: a pessoa e os dados são os do capítulo 1; o critério agora está declarado.
 */
const CLIENTES = [
  { nome: "Helena Braga", desc: "Autônoma. Pede R$ 9.000.", pd: 0.449, ead: 9000 },
  { nome: "Rogério Tavares", desc: "Assalariado. Pede R$ 15.000.", pd: 0.0516, ead: 15000 },
  { nome: "Dalva Menezes", desc: "Microempreendedora. Pede R$ 11.000.", pd: 0.2187, ead: 11000 },
];
const W = 600, H = 110, ML = 20, MR = 20;
const sx = (p: number) => ML + (p / 0.6) * (W - ML - MR);

export function TresZonas() {
  const [corte, setCorte] = useState(POLITICA.corte);
  const [teto, setTeto] = useState(POLITICA.teto);
  const [sel, setSel] = useState(0);
  const zona = (pd: number) => (pd <= corte ? "automática" : pd <= teto ? "revisão" : "recusa");
  const c = CLIENTES[sel]; const valor = esperado(c.pd, c.ead); const z = zona(c.pd);
  return (
    <figure className="vz" data-vz="tres-zonas">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Três clientes, três zonas · a política do capítulo 8 aplicada às pessoas do capítulo 1</p>
          <p className="vz-tit">A cadeia inteira: PD, depois valor esperado, depois a regra de política. Nada aqui é preferência de risco.</p>
        </div>
        <div className="vz-acoes">
          <div className="vz-seg" role="group" aria-label="Cliente">{CLIENTES.map((x, i) => <button key={x.nome} type="button" className={`vz-seg-b ${sel === i ? "vz-seg-b--on" : ""}`} onClick={() => setSel(i)}>{x.nome.split(" ")[0]}</button>)}</div>
        </div>
      </header>
      <div className="vz-estado"><b>{c.nome}, {c.desc}</b> PD em 12 meses {fmtPct(c.pd, 1)} → resultado esperado {fmtReais(valor)} → zona {z}. {z === "recusa" ? "Risco alto e valor negativo; a política aponta recusa." : z === "automática" ? "Risco baixo e valor positivo; a política permite aprovação automática." : "Caso intermediário; a política envia para revisão, não para decisão silenciosa."}</div>
      <div className="vz-zon-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">A régua da política <span className="hint">automática até o corte · revisão até o teto · recusa acima</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Zonas da política e os três clientes">
            <rect x={sx(0)} y={30} width={sx(corte) - sx(0)} height={30} className="vz-zon-auto" />
            <rect x={sx(corte)} y={30} width={sx(teto) - sx(corte)} height={30} className="vz-zon-rev" />
            <rect x={sx(teto)} y={30} width={sx(0.6) - sx(teto)} height={30} className="vz-zon-rec" />
            <text x={sx(corte / 2)} y={49} textAnchor="middle" className="vz-zon-t">automática</text>
            <text x={sx((corte + teto) / 2)} y={49} textAnchor="middle" className="vz-zon-t">revisão</text>
            <text x={sx((teto + 0.6) / 2)} y={49} textAnchor="middle" className="vz-zon-t vz-zon-t--claro">recusa</text>
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((p) => <text key={p} x={sx(p)} y={78} textAnchor="middle" className="vz-tick">{fmtPct(p)}</text>)}
            {CLIENTES.map((x, i) => <g key={x.nome} className="vz-res-clic" onClick={() => setSel(i)}>
              <line x1={sx(x.pd)} x2={sx(x.pd)} y1={22} y2={68} className={i === sel ? "vz-zon-marca vz-zon-marca--on" : "vz-zon-marca"} />
              <text x={sx(x.pd)} y={16} textAnchor="middle" className={`vz-ponto-t ${i === sel ? "" : "vz-zon-fraco"}`}>{x.nome.split(" ")[0]} {fmtPct(x.pd, 1)}</text>
            </g>)}
          </svg>
          <div className="vz-res-controles">
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte de aprovação automática</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={2} max={30} step={0.5} value={corte * 100} onChange={(e) => { const v = Number(e.target.value) / 100; setCorte(v); if (v > teto) setTeto(v); }} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Teto da faixa de revisão</span><span className="vz-slider-valor">{fmtPct(teto, 1)}</span></span><input type="range" min={5} max={60} step={1} value={teto * 100} onChange={(e) => setTeto(Math.max(corte, Number(e.target.value) / 100))} /></label>
          </div>
        </div>
        <div className="vz-zon-painel">
          <ol className="vz-zon-cadeia">
            <li><span className="eyebrow">1 · previsão de risco</span><b>{fmtPct(c.pd, 1)}</b><span className="hint">PD em 12 meses, modelo logístico</span></li>
            <li><span className="eyebrow">2 · resultado esperado</span><b className={valor < 0 ? "vz-zon-neg" : ""}>{fmtReais(valor)}</b><span className="hint">receita se pagar, perda se não pagar, funding, operação e capital</span></li>
            <li><span className="eyebrow">3 · regra de política</span><b>{z}</b><span className="hint">{z === "automática" ? `PD até o corte de ${fmtPct(corte, 1)}` : z === "revisão" ? `entre o corte e o teto de ${fmtPct(teto, 1)}` : `acima do teto de ${fmtPct(teto, 1)}`}</span></li>
          </ol>
          <div className="vz-tile"><p className="eyebrow">O que mudou desde o capítulo 1</p><p className="vz-num vz-num--texto">A pessoa e os dados são os mesmos; agora o critério está declarado e pode ser auditado.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Valor esperado com os parâmetros do capítulo 8: receita de 28% se pagar, perda de 65% no default, funding 12%, R$ 120 por operação, capital 2%. Helena 44,9% em R$ 9.000 dá −R$ 2.618; Rogério 5,2% em R$ 15.000 dá R$ 1.261; Dalva 21,9% em R$ 11.000 dá −R$ 817, os números da página.</p>
    </figure>
  );
}

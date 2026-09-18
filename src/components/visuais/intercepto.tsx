"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { BETA_AULA, escore, sigmoide, type Proposta } from "@/lib/visuais/logistica";

/**
 * O intercepto é a âncora do nível, não um coeficiente comum (capítulo 4, c4p13). Mover o intercepto desloca a PD de
 * toda a carteira e não troca nenhuma posição na fila; a fila de 16 propostas desliza inteira sobre a régua.
 */
const BASE = did.base as Proposta[];
const CASOS: [number, number][] = [[30, 5], [55, 10], [70, 5], [95, 20]];
const W = 640, ML = 30, MR = 30;
const xp = (p: number) => ML + p * (W - ML - MR);
const pdCom = (b0: number, u: number, a: number) => sigmoide(escore([b0, BETA_AULA[1], BETA_AULA[2]], u, a).z);

export function Intercepto() {
  const [b0, setB0] = useState(-5.65);
  const r = useMemo(() => {
    const pds = BASE.map((q) => ({ id: q.id, y: q.y, orig: pdCom(BETA_AULA[0], q.util, q.atraso), agora: pdCom(b0, q.util, q.atraso) }));
    const media = pds.reduce((s, q) => s + q.agora, 0) / pds.length;
    const ordem = [...pds].sort((a, c) => c.agora - a.agora).map((q) => q.id);
    const curvaO: string[] = [], curvaA: string[] = [];
    for (let u = 10; u <= 100; u++) { curvaO.push(`${u === 10 ? "M" : "L"}${cx(u).toFixed(1)} ${cy(pdCom(BETA_AULA[0], u, 10)).toFixed(1)}`); curvaA.push(`${u === 10 ? "M" : "L"}${cx(u).toFixed(1)} ${cy(pdCom(b0, u, 10)).toFixed(1)}`); }
    return { pds, media, ordem, curvaO: curvaO.join(""), curvaA: curvaA.join("") };
  }, [b0]);
  const fila = [...r.pds].sort((a, c) => a.agora - c.agora);
  return (
    <figure className="vz" data-vz="intercepto">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O intercepto é a âncora do nível · 16 propostas didáticas · coeficientes da aula</p>
          <p className="vz-tit">Mova o intercepto: a fila inteira desliza, ninguém troca de lugar. Mover um coeficiente é outra coisa.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Intercepto de exemplo">
          {[-7, BETA_AULA[0], -4].map((v) => <button key={v} type="button" className={`btn btn-sm ${Math.abs(b0 - v) < 1e-9 ? "" : "btn-secondary"}`} onClick={() => setB0(v)}>{v === BETA_AULA[0] ? "o da aula, −5,67" : fmtNum(v, 2)}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>Intercepto {fmtNum(b0, 2)}</b> (a aula estimou {fmtNum(BETA_AULA[0], 2)}): PD média das 16 em {fmtPct(r.media, 1)} e ordem de risco {r.ordem.slice(0, 6).map((i) => `#${i}`).join(" > ")} …, idêntica para qualquer intercepto.</div>
      <div className="vz-int-grade">
        <div className="vz-int-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Intercepto β₀</b> <span className="vz-slider-valor">{fmtNum(b0, 2)}</span></span>
            <input type="range" min={-800} max={-300} step={5} value={Math.round(b0 * 100)} onChange={(e) => setB0(Number(e.target.value) / 100)} aria-valuetext={fmtNum(b0, 2)} /></label>
          <div className="vz-grafico">
            <p className="vz-grafico-t">A fila desliza inteira <span className="hint">contorno: PD com o intercepto da aula · cheio: PD agora</span></p>
            <svg viewBox={`0 0 ${W} 140`} role="img" aria-label={`Dezesseis propostas em PD; ordem ${r.ordem.map((i) => "#" + i).join(", ")}`}>
              <line x1={ML} x2={W - MR} y1={92} y2={92} className="vz-regua" />
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={xp(v)} x2={xp(v)} y1={88} y2={96} className="vz-regua" /><text x={xp(v)} y={112} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text></g>)}
              <text x={xp(0.5)} y={130} textAnchor="middle" className="vz-rotulo">PD estimada</text>
              {fila.map((q, i) => { const alt = 30 + (i % 4) * 14; return <g key={q.id}>
                <line x1={xp(q.orig)} x2={xp(q.agora)} y1={92} y2={92} className="vz-int-rastro" />
                <circle cx={xp(q.orig)} cy={92} r={4} className={`vz-int-orig ${q.y ? "vz-int-orig--default" : "vz-int-orig--pagou"}`} />
                <g className="vz-int-ponto" style={{ transform: `translate(${xp(q.agora)}px, 0)` }}><line x1={0} x2={0} y1={alt + 6} y2={86} className="vz-int-haste" /><circle cy={92} r={6.5} className={q.y ? "vz-int-c--default" : "vz-int-c--pagou"} /><text y={alt} textAnchor="middle" className={`vz-tick vz-tick--forte ${q.y ? "vz-tick--default" : "vz-tick--pagou"}`}>#{q.id}</text></g>
              </g>; })}
            </svg>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Proposta</th><th>z</th><th>PD com intercepto da aula</th><th>PD agora</th></tr></thead><tbody>
            {CASOS.map(([u, a]) => <tr key={u}><th scope="row">util {u}%, atraso {a} d</th><td>{fmtNum(escore([b0, BETA_AULA[1], BETA_AULA[2]], u, a).z, 3)}</td><td>{fmtPct(pdCom(BETA_AULA[0], u, a), 2)}</td><td className="vz-t-forte">{fmtPct(pdCom(b0, u, a), 2)}</td></tr>)}
          </tbody></table></div>
          <p className="hint">Utilização de zero e atraso de zero não existem nesta carteira. O intercepto por isso não tem leitura própria como PD de um cliente real: ele é o ponto de partida matemático da soma.</p>
        </div>
        <div className="vz-int-lado">
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">PD média das 16</p><p className="vz-num">{fmtPct(r.media, 1)}</p><p className="hint">com o intercepto da aula, 50,0%</p></div>
            <div className="vz-tile"><p className="eyebrow">Ordem de risco</p><p className="vz-num vz-num--mono">{r.ordem.slice(0, 6).map((i) => `#${i}`).join(" > ")} …</p><p className="hint">idêntica para qualquer intercepto</p></div>
          </div>
          <div className="vz-grafico">
            <p className="vz-grafico-t">PD por utilização, com atraso fixo em 10 dias <span className="hint">tracejada: intercepto da aula</span></p>
            <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="PD estimada por utilização do limite, com o intercepto da aula e com o intercepto escolhido">
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={cx(10)} x2={cx(100)} y1={cy(v)} y2={cy(v)} className="vz-grade" /><text x={cx(10) - 6} y={cy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
              {[20, 40, 60, 80, 100].map((v) => <text key={v} x={cx(v)} y={250 - 20} textAnchor="middle" className="vz-tick">{v}%</text>)}
              <text x={cx(55)} y={246} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
              <path d={r.curvaO} className="vz-curva vz-curva--fraca vz-int-tracejada" />
              <path d={r.curvaA} className="vz-curva" />
            </svg>
          </div>
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Dois erros simétricos</p><p className="vz-num vz-num--texto">Interpretar o intercepto como PD de um cliente sem dívida e sem atraso é o primeiro. Concluir que ele é irrelevante porque não se interpreta é o segundo. Ele determina o nível de PD de toda a carteira e, com ele, provisão e preço.</p></div>
            <div className="vz-tile vz-tile--ok"><p className="eyebrow">Onde isso volta</p><p className="vz-num vz-num--texto">No capítulo 7, recalibrar um modelo cuja ordenação continua boa mas cujo nível deslocou é, na prática, reestimar o intercepto. A ordenação não muda e a AUC não se altera.</p></div>
          </div>
        </div>
      </div>
      <p className="vz-fonte">z = β₀ + 0,7453 × utilização em dezenas de pontos + 1,3955 × atraso em dezenas de dias; PD = 1 ÷ (1 + e^(−z)). Com β₀ = −5,65: util 30% e atraso 5 d dão z −2,716 e PD 6,20% (6,11% com o da aula); PD média 50,2%. A ordem #12 &gt; #14 &gt; #16 &gt; #9 &gt; #15 &gt; #13 não depende de β₀.</p>
    </figure>
  );
}

const CX0 = 46, CX1 = W - 14, CY0 = 14, CY1 = 250 - 36;
function cx(u: number) { return CX0 + ((u - 10) / 90) * (CX1 - CX0); }
function cy(p: number) { return CY0 + (1 - p) * (CY1 - CY0); }

"use client";
import { useState } from "react";
import { Botao, Eixos, Grafico, Painel, Quadro, Seg, escala, type Pagina } from "@/components/capitulo7/base";
import { AUC_TEMPO, BVS, QUEDAS_SIMPLES } from "@/lib/capitulo12/b4";
import { gini } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 42 · c12p42 · Fora do tempo, todo modelo perde discriminação. AUC de treino e de validação fora do tempo dos três
 * modelos do caso (CASO.auc, conforme as figuras do material), variação = validação ÷ treino − 1 e Gini = 2 × AUC − 1
 * (gini() de metricas.ts), tudo em b4.ts. A peça principal são halteres treino → validação por modelo; o seletor
 * troca a escala entre AUC e Gini (os pontos não se movem, porque o Gini é uma reescala linear da AUC; muda a régua e a
 * queda relativa). Clicar num modelo mostra as duas quedas dele. Estado inicial: AUC, exemplo BVS em foco; "Restaurar".
 */
type Met = "auc" | "gini";
const I_BVS = AUC_TEMPO.indexOf(BVS);
const fmt = (v: number) => num(v, 3);

export function S42AucTempo({ pagina }: { pagina?: Pagina }) {
  const [met, setMet] = useState<Met>("auc");
  const [sel, setSel] = useState(I_BVS);
  const a = AUC_TEMPO[sel];
  const val = (v: number) => (met === "auc" ? v : gini(v));
  const [qMin, qMax] = [Math.min(...QUEDAS_SIMPLES.map((q) => -q.variacao)), Math.max(...QUEDAS_SIMPLES.map((q) => -q.variacao))];
  return (
    <Quadro slug="c12p42" pagina={pagina} layout="gl"
      conclusao={<>Quedas de <b>{pct(qMin, 1)} e {pct(qMax, 1)}</b> na AUC contrastam com <b>{pct(-BVS.variacao, 1)}</b> no exemplo que o material classifica como sobreajuste. O slide {SLIDE.c12p43.n} abre esse exemplo.</>}
      fonte="Caso de crédito do material da aula: AUC de treino e de validação fora do tempo conforme as figuras do caso; Gini calculado como 2 × AUC − 1; variação = validação ÷ treino − 1.">
      <Painel className="q12-s42-esq">
        <Grafico titulo={met === "auc" ? "AUC no treino e fora do tempo" : "Gini no treino e fora do tempo"} sub="● treino · ■ validação fora do tempo"
          rotulo={`Halteres por modelo: ${AUC_TEMPO.map((m) => `${m.modelo}, ${met === "auc" ? "AUC" : "Gini"} de ${fmt(val(m.treino))} no treino para ${fmt(val(m.validacao))} na validação`).join("; ")}`} arCelular="4 / 3">
          {(d) => {
            const m = { l: d.fs * 1.4, r: d.fs * 1.4, t: d.fs * 0.6, b: d.fs * 2.8 };
            const x = escala([0.5, 0.9], [m.l, d.w - m.r]);
            const yb = d.h - m.b, hRow = (yb - m.t) / AUC_TEMPO.length;
            const y = escala([0, 1], [yb, m.t]);
            const ticks = [0.5, 0.6, 0.7, 0.8, 0.9];
            return (
              <g>
                <Eixos x={x} y={y} xt={ticks} yt={[]} fx={(v) => num(val(v), 1)} fy={() => ""} xTit={met === "auc" ? "AUC (0,5 = acaso)" : "Gini = 2 × AUC − 1 (0 = acaso)"} grade={false} />
                {ticks.map((t) => <line key={t} className="q7-grade" x1={x(t)} x2={x(t)} y1={m.t} y2={yb} />)}
                {AUC_TEMPO.map((mo, i) => {
                  const cy = m.t + hRow * (i + 0.62), on = i === sel;
                  const x1 = x(mo.treino), x2 = x(mo.validacao), r = d.fs * 0.5;
                  const queda = met === "auc" ? mo.variacao : mo.variacaoGini;
                  return (
                    <g key={mo.modelo} opacity={on ? 1 : 0.6} style={{ cursor: "pointer" }} onClick={() => setSel(i)}>
                      <text className="q7-rot" x={m.l} y={cy - d.fs * 1.05} style={{ fill: "#00205B", fontWeight: on ? 700 : 600 }}>{mo.modelo}{i === I_BVS ? " · sobreajuste, segundo o material" : ""}</text>
                      <line x1={x2 + r} x2={x1 - r} y1={cy} y2={cy} stroke={i === I_BVS ? "#8C2332" : "#5B6475"} strokeWidth={d.fs * 0.22} strokeLinecap="round" />
                      <circle cx={x1} cy={cy} r={r} fill="#3D5A8A" stroke="#fff" strokeWidth={2} />
                      <rect x={x2 - r} y={cy - r} width={2 * r} height={2 * r} fill="#2E6B4F" stroke="#fff" strokeWidth={2} />
                      <text className="q7-rot--peq" x={x1 + r * 1.4} y={cy} dy=".35em" style={{ fill: "#3D5A8A" }}>{fmt(val(mo.treino))}</text>
                      <text className="q7-rot--peq" x={x2 - r * 1.4} y={cy} dy=".35em" textAnchor="end" style={{ fill: "#2E6B4F" }}>{fmt(val(mo.validacao))}</text>
                      <text className="q7-rot" x={(x1 + x2) / 2} y={cy + d.fs * 1.35} textAnchor="middle" style={{ fill: i === I_BVS ? "#8C2332" : "#2A3342" }}>{pct(queda, 1)}</text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
        <table className="q7-tab q12-s42-tab" data-met={met}>
          <thead><tr><th className="q7-t-l">Modelo</th><th data-c="auc">AUC treino</th><th data-c="auc">AUC validação</th><th>Variação da AUC</th><th data-c="gini">Gini treino</th><th data-c="gini">Gini validação</th></tr></thead>
          <tbody>{AUC_TEMPO.map((mo, i) => (
            <tr key={mo.modelo} data-on={i === sel ? "1" : undefined}>
              <th className="q7-t-l"><button type="button" className="q12-s42-mod" aria-pressed={i === sel} onClick={() => setSel(i)}>{mo.modelo}</button></th>
              <td data-c="auc">{fmt(mo.treino)}</td><td data-c="auc">{fmt(mo.validacao)}</td><td>{pct(mo.variacao, 1)}</td><td data-c="gini">{fmt(mo.giniTreino)}</td><td data-c="gini">{fmt(mo.giniValidacao)}</td>
            </tr>
          ))}</tbody>
        </table>
      </Painel>
      <Painel>
        <div className="q12-s42-ctl">
          <Seg rotulo="Medida" opcoes={[{ v: "auc" as Met, r: "AUC" }, { v: "gini" as Met, r: "Gini" }]} valor={met} onChange={setMet} />
          <Botao sec onClick={() => { setMet("auc"); setSel(I_BVS); }} desab={met === "auc" && sel === I_BVS}>Restaurar</Botao>
        </div>
        <p className="q7-nota">{met === "auc" ? "Gini = 2 × AUC − 1: troque a medida e veja a mesma queda na outra régua." : "Mesmos pontos, outra régua: o Gini desconta o acaso, e a queda relativa fica maior."} Clique num modelo na tabela.</p>
        <div className="q12-s42-sel">
          <p className="q7-k">{a.modelo}</p>
          <p className="q7-p">AUC {fmt(a.treino)} → {fmt(a.validacao)} (<b>{pct(a.variacao, 1)}</b>); Gini {fmt(a.giniTreino)} → {fmt(a.giniValidacao)} (<b>{pct(a.variacaoGini, 1)}</b>).</p>
          <p className="q7-nota">O Gini mede a distância ao acaso: ({fmt(a.validacao)} − 0,5) ÷ ({fmt(a.treino)} − 0,5) − 1 = {pct(a.variacaoGini, 1)}. A variação relativa depende da régua: compare modelos sempre na mesma.</p>
        </div>
      </Painel>
    </Quadro>
  );
}

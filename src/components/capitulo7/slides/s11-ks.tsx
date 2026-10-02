"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Legenda, Painel, Quadro, margens, type Pagina } from "../base";
import { D, A, EAD, N, PL, Y } from "@/lib/capitulo7/dados";
import { confusao, curvaRoc, ks } from "@/lib/capitulo7/metricas";
import { curva, GRADE_CORTES, otimo } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 11 · c7p7 · KS. Para cada corte t, a fração dos defaults e a fração dos adimplentes com PD ≥ t (as acumuladas lidas
 * do pior escore para o melhor). O KS é a maior distância vertical entre as duas, igual ao maior TPR − FPR. O corte em
 * que o máximo ocorre é comparado com o corte de maior resultado esperado do capítulo 8, calculado pelo mesmo motor
 * econômico daquele capítulo (src/lib/visuais/economia.ts).
 */
const ROC = curvaRoc(Y, PL);
const KS = ks(Y, PL);
const ECON = otimo(curva(PL as number[], EAD as number[], GRADE_CORTES)).corte;
const MAXX = 0.4;
const FIM = confusao(Y, PL, MAXX);

export function S11Ks({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState(0.15);
  const c = confusao(Y, PL, t); const tpr = c.vp / D, fpr = c.fp / A;
  const noMax = Math.abs(t - KS.limiar) < 0.0025;
  return (
    <Quadro slug="c7p7" pagina={pagina} layout="gl"
      conclusao={noMax ? <>No corte de {pct(KS.limiar, 2)} a separação é máxima: <b>KS = {num(KS.ks, 4)}</b>. O resultado esperado, com as hipóteses do capítulo 8, é máximo em <b>{pct(ECON, 1)}</b>: o KS não sabe quanto custa cada erro.</>
        : <>No corte de {pct(t, 1)}: {pct(tpr, 1)} dos defaults e {pct(fpr, 1)} dos adimplentes têm PD acima dele; distância de <b>{num(tpr - fpr, 4)}</b>, contra o máximo de {num(KS.ks, 4)}.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults e ${A} adimplentes; PD da logística. Corte econômico: máximo do resultado esperado na grade de 0,5% a 60%, com receita de 28%, perda de 65% no default, funding de 12%, R$ 120 de operação e 2% de capital (capítulo 8).`}>
      <div className="q7-flex1 q7-gap">
      <Grafico titulo="Fração de cada classe com PD acima do corte" sub="as acumuladas, lidas do maior risco para o menor" rotulo={`Curvas acumuladas; KS ${num(KS.ks, 4)} em PD ${pct(KS.limiar, 2)}`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, MAXX], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
          const pts = ROC.filter((p) => p.limiar <= MAXX);
          const deg = (k: "tpr" | "fpr") => caminho([{ x: x(0), y: y(1) }, ...pts.slice().reverse().map((p) => ({ x: x(p.limiar), y: y(p[k]) })), { x: x(MAXX), y: y(k === "tpr" ? FIM.vp / D : FIM.fp / A) }]);
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="Corte de PD (recusa quando PD ≥ corte)" />
              <path className="q7-linha q7-linha--def" d={deg("tpr")} />
              <path className="q7-linha q7-linha--mudo" d={deg("fpr")} />
              <line x1={x(KS.limiar)} x2={x(KS.limiar)} y1={y(KS.fpr)} y2={y(KS.tpr)} stroke="#00205B" strokeWidth={5} />
              <text className="q7-rot" x={x(KS.limiar) - 10} y={y((KS.tpr + KS.fpr) / 2)} textAnchor="end" style={{ fill: "#00205B" }}>KS {num(KS.ks, 4)}</text>
              <line className="q7-corte" x1={x(ECON)} x2={x(ECON)} y1={y(0)} y2={y(1)} strokeDasharray="6 5" />
              <text className="q7-corte-t" x={x(ECON) + 6} y={y(0.97)}>corte econômico {pct(ECON, 1)}</text>
              <line x1={x(t)} x2={x(t)} y1={y(fpr)} y2={y(tpr)} stroke="#B8640F" strokeWidth={3} />
              <circle cx={x(t)} cy={y(tpr)} r={d.fs * 0.32} fill="#8C2332" /><circle cx={x(t)} cy={y(fpr)} r={d.fs * 0.32} fill="#fff" stroke="#5B6475" strokeWidth={2.4} />
            </g>
          );
        }}
      </Grafico>
        <Legenda itens={[{ mk: "linha def2", r: `defaults (${D})` }, { mk: "linha mudo", r: `adimplentes (${A})` }, { mk: "linha ink", r: "KS" }, { mk: "trac dec", r: "corte econômico" }]} />
      </div>
      <Painel>
        <Controle rotulo="Corte de PD" valor={t} min={0.02} max={0.4} passo={0.0025} onChange={setT} mostrar={pct(t, 1)} escala={["2%", "40%"]} />
        <div className="q7-botoes"><Botao onClick={() => setT(KS.limiar)}>Ir ao máximo</Botao><Botao onClick={() => setT(ECON)}>Corte econômico</Botao><Botao sec onClick={() => setT(0.15)}>Restaurar</Botao></div>
        <dl className="q7-lista">
          <div data-tom="def"><dt>Defaults acima (TPR)</dt><dd>{pct(tpr, 1)} · {c.vp} de {D}</dd></div>
          <div data-tom="mudo"><dt>Adimplentes acima (FPR)</dt><dd>{pct(fpr, 1)} · {c.fp} de {A}</dd></div>
          <div><dt>Distância TPR − FPR</dt><dd>{num(tpr - fpr, 4)}</dd></div>
          <div data-tom="prob"><dt>Máximo (KS), em {pct(KS.limiar, 2)}</dt><dd>{num(KS.ks, 4)}</dd></div>
        </dl>
        <Expandir resumo="Como reportar o KS">
          <Formula f={String.raw`\mathrm{KS}=\max_t\,\big[\mathrm{TPR}(t)-\mathrm{FPR}(t)\big]`} />
          <p className="q7-nota">Declare a amostra, o sentido da fila e o corte do máximo ({pct(KS.limiar, 2)}, {KS.recusados} recusadas).</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}

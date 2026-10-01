"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Quadro, margens, type Pagina } from "../base";
import { D, A, N, PL, Y } from "@/lib/capitulo7/dados";
import { areaTrapezio, confusao, curvaPR, precisaoMedia } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 14 · c7p26 · Precisão e recall com evento raro. Curva PR da logística na janela, com a referência da prevalência (a
 * precisão de sinalizar ao acaso). O segundo controle aplica as mesmas taxas TPR e FPR do corte a uma carteira com
 * outra prevalência (cálculo, não dado observado): precisão = TPR·π ÷ (TPR·π + FPR·(1 − π)). A precisão média segue a
 * definição de average_precision_score e não é a área trapezoidal.
 */
const PR = curvaPR(Y, PL);
const AP = precisaoMedia(Y, PL)!;
const TRAP = areaTrapezio([{ x: 0, y: 1 }, ...PR.map((p) => ({ x: p.recall, y: p.precisao }))]);
const PI = D / N;

export function S14PrecisaoRecall({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState(0.15);
  const [pi, setPi] = useState(PI);
  const c = confusao(Y, PL, t); const tpr = c.vp / D, fpr = c.fp / A;
  const precHip = tpr * pi + fpr * (1 - pi) > 0 ? (tpr * pi) / (tpr * pi + fpr * (1 - pi)) : null;
  const real = Math.abs(pi - PI) < 1e-9;
  return (
    <Quadro slug="c7p26" pagina={pagina} layout="gl"
      conclusao={c.vp + c.fp === 0 ? "Nenhuma proposta sinalizada: a precisão não existe (denominador zero)." : <>Sinalizando PD ≥ {pct(t, 1)}: <b>{pct(c.precisao!, 1)} dos sinalizados são default</b> (precisão) e {pct(c.sensibilidade!, 1)} dos defaults foram sinalizados (recall). {real ? "" : <>Numa carteira com {pct(pi, 0)} de default, as mesmas taxas dariam precisão de <b>{precHip === null ? "não definida" : pct(precHip, 1)}</b>.</>}</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults (prevalência ${pct(PI, 2)}); PD da logística. A carteira hipotética usa a TPR e a FPR do corte atual: é cálculo, não observação.`}>
      <Grafico titulo="Curva precisão e recall" sub="cada ponto é um corte" rotulo={`Curva PR; no corte ${pct(t, 1)}, precisão ${c.precisao === null ? "indefinida" : pct(c.precisao, 1)} e recall ${pct(tpr, 1)}`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.25, 0.5, 0.75, 1]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit={`Recall: defaults sinalizados, de ${D}`} yTit="Precisão: defaults entre os sinalizados" />
              <line x1={x(0)} x2={x(1)} y1={y(PI)} y2={y(PI)} stroke="#5B6475" strokeWidth={2} strokeDasharray="7 6" />
              <text className="q7-rot--peq" x={x(0.3)} y={y(PI) + d.fs * 1.15} style={{ fill: "#5B6475" }}>ao acaso: precisão = prevalência, {pct(PI, 1)}</text>
              <path className="q7-linha q7-linha--ord" d={caminho(PR.map((p) => ({ x: x(p.recall), y: y(p.precisao) })))} />
              {c.precisao !== null && <><circle cx={x(tpr)} cy={y(c.precisao)} r={d.fs * 0.42} fill="#B8640F" stroke="#fff" strokeWidth={2.5} /><text className="q7-corte-t" x={x(tpr) + d.fs * 0.6} y={y(c.precisao) - d.fs * 0.4}>corte {pct(t, 1)}</text></>}
            </g>
          );
        }}
      </Grafico>
      <Painel>
        <Controle rotulo="Corte de PD para sinalizar" valor={t} min={0.04} max={0.4} passo={0.005} onChange={setT} mostrar={`${pct(t, 1)} (${c.vp + c.fp} sinalizadas)`} />
        <dl className="q7-lista">
          <div data-tom="mudo"><dt>Sinalizadas: VP + FP</dt><dd>{c.vp} + {c.fp}</dd></div>
          <div data-tom="dec"><dt>Precisão = VP ÷ (VP + FP)</dt><dd>{c.precisao === null ? "não existe" : `${c.vp} ÷ ${c.vp + c.fp} = ${pct(c.precisao, 1)}`}</dd></div>
          <div><dt>Recall = VP ÷ (VP + FN)</dt><dd>{c.vp} ÷ {D} = {pct(tpr, 1)}</dd></div>
        </dl>
        <Controle rotulo="Prevalência de outra carteira (hipótese)" valor={pi} min={0.01} max={0.3} passo={0.005} onChange={setPi} mostrar={real ? `${pct(pi, 2)}, a da janela` : pct(pi, 1)} escala={["1%", "30%"]} />
        <div className="q7-botoes"><Botao sec onClick={() => { setT(0.15); setPi(PI); }}>Restaurar</Botao><Botao sec onClick={() => setPi(0.02)}>Carteira com 2%</Botao></div>
        <Expandir resumo="Precisão média não é a área trapezoidal">
          <Formula f={String.raw`\mathrm{AP}=\sum_k (R_k-R_{k-1})\,P_k`} simbolos={[["R_k", "recall no k-ésimo corte distinto"], ["P_k", "precisão no mesmo corte"]]} />
          <p className="q7-nota">Na janela: AP {num(AP, 4)} (como average_precision_score) e área trapezoidal {num(TRAP, 4)}. A trapezoidal interpola a precisão em linha reta e costuma ser otimista. Compare sempre na mesma população.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}

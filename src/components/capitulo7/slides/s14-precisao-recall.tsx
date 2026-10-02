"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Previsao, Quadro, margens, type Pagina } from "../base";
import { D, A, N, PL, Y } from "@/lib/capitulo7/dados";
import { areaTrapezio, confusao, curvaPR, curvaRoc, precisaoMedia, wilson } from "@/lib/capitulo7/metricas";
import { num, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 14 · c7p26 · Precisão e recall com evento raro. Curva PR da logística na janela, com a referência da prevalência (a
 * precisão de sinalizar ao acaso). Depois da previsão, o segundo controle aplica as mesmas taxas TPR e FPR de cada corte
 * a uma carteira com outra prevalência (cálculo, não dado observado): precisão = TPR·π ÷ (TPR·π + FPR·(1 − π)). A curva
 * inteira é redesenhada sob essa prevalência; a ROC não muda. A precisão média segue average_precision_score e não é a
 * área trapezoidal; nesta janela a trapezoidal fica abaixo da AP, e o sinal da diferença depende da curva. A curva
 * hipotética só aparece com a resposta certa; a precisão no corte traz o intervalo de Wilson com o n de sinalizadas.
 */
const PR = curvaPR(Y, PL);
const ROC = curvaRoc(Y, PL).slice(1);
const AP = precisaoMedia(Y, PL)!;
const TRAP = areaTrapezio([{ x: 0, y: 1 }, ...PR.map((p) => ({ x: p.recall, y: p.precisao }))]);
const PI = D / N;
const T0 = 0.15, PI2 = 0.02;
const precisaoEm = (tpr: number, fpr: number, pi: number) => (tpr * pi + fpr * (1 - pi) > 0 ? (tpr * pi) / (tpr * pi + fpr * (1 - pi)) : null);
const C0 = confusao(Y, PL, T0);
const TPR0 = C0.vp / D, FPR0 = C0.fp / A;
const P2 = precisaoEm(TPR0, FPR0, PI2)!;
const OPS = [
  { texto: `Fica perto de ${pct(C0.precisao!, 0)}: a fila é a mesma`, certa: false, retorno: <>As taxas do corte ficam, mas a precisão depende de quantos adimplentes há por default. Confunde precisão com a ROC, que não vê a prevalência.</> },
  { texto: `Cai para perto de ${pct(PI, 0)}, a prevalência da janela`, certa: false, retorno: <>{pct(PI, 1)} é o acaso <b>nesta</b> janela. Na carteira com {pct(PI2, 0)}, o próprio acaso cai para {pct(PI2, 0)}.</> },
  { texto: `Cai para perto de ${pct(P2, 0)}`, certa: true, retorno: <>Isso: mesmas taxas, {num((1 - PI2) / PI2, 0)} adimplentes por default. Precisão de {pct(P2, 1)}, {vezes(P2 / PI2, 1)} o acaso.</> },
];

export function S14PrecisaoRecall({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState(T0);
  const [pi, setPi] = useState(PI);
  const [esc, setEsc] = useState<number | null>(null);
  const c = confusao(Y, PL, t); const tpr = c.vp / D, fpr = c.fp / A;
  const precHip = precisaoEm(tpr, fpr, pi);
  const real = Math.abs(pi - PI) < 1e-9;
  const liberado = esc !== null && OPS[esc].certa;
  const escolher = (i: number | null) => { setEsc(i); if (i !== null && OPS[i].certa) { setT(T0); setPi(PI2); } else setPi(PI); };
  const icP = c.vp + c.fp > 0 ? wilson(c.vp, c.vp + c.fp) : null;
  return (
    <Quadro slug="c7p26" pagina={pagina} layout="gl"
      conclusao={c.vp + c.fp === 0 ? "Nenhuma proposta sinalizada: a precisão não existe (denominador zero)."
        : real ? <>Sinalizando PD ≥ {pct(t, 1)}: <b>{pct(c.precisao!, 1)} dos sinalizados são default</b>, contra {pct(PI, 1)} ao acaso ({vezes(c.precisao! / PI, 1)} a prevalência), e {pct(tpr, 1)} dos defaults foram sinalizados. A ROC do slide 9 não muda com a prevalência; a precisão muda.</>
        : <>Mesma fila, carteira com {pct(pi, 1)} de default: no corte de {pct(t, 1)} a precisão vai a <b>{precHip === null ? "não definida" : pct(precHip, 1)}</b> ({precHip === null ? "" : vezes(precHip / pi, 1)} o acaso), com o mesmo recall de {pct(tpr, 1)}. A curva inteira desce; a ROC ficaria igual.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults (prevalência ${pct(PI, 2)}); PD da logística. A carteira hipotética usa a TPR e a FPR de cada corte: é cálculo, não observação.`}>
      <div className="q7-flex1 q7-g2-col">
      <Grafico titulo="Curva precisão e recall" sub="cada ponto é um corte" rotulo={`Curva PR; no corte ${pct(t, 1)}, precisão ${c.precisao === null ? "indefinida" : pct(c.precisao, 1)} e recall ${pct(tpr, 1)}${real ? "" : `; sob prevalência de ${pct(pi, 1)}, precisão ${precHip === null ? "indefinida" : pct(precHip, 1)}`}`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
          const hip = real ? null : ROC.map((p) => ({ x: x(p.tpr), y: y(precisaoEm(p.tpr, p.fpr, pi) ?? 0) }));
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.25, 0.5, 0.75, 1]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit={`Recall: defaults sinalizados, de ${D}`} yTit="Precisão: defaults entre os sinalizados" />
              <line x1={x(0)} x2={x(1)} y1={y(PI)} y2={y(PI)} stroke="#5B6475" strokeWidth={2} strokeDasharray="7 6" />
              {real && <text className="q7-rot--peq" x={x(1)} y={y(PI) + d.fs * 1.15} textAnchor="end" style={{ fill: "#5B6475" }}>ao acaso: precisão = prevalência, {pct(PI, 1)}</text>}
              <path className={`q7-linha q7-linha--ord${real ? "" : " q7-linha--fina"}`} d={caminho(PR.map((p) => ({ x: x(p.recall), y: y(p.precisao) })))} opacity={real ? 1 : 0.45} />
              {hip && <>
                <line x1={x(0)} x2={x(1)} y1={y(pi)} y2={y(pi)} stroke="#3D5A8A" strokeWidth={1.6} strokeDasharray="3 5" />
                <path className="q7-linha q7-linha--ord" d={caminho(hip)} strokeDasharray="10 6" />
                <g>{[
                  { r: `janela: prevalência ${pct(PI, 1)}`, p: { stroke: "#3D5A8A", strokeWidth: 2.5, opacity: 0.45 } },
                  { r: `carteira com ${pct(pi, 1)}, mesmas taxas`, p: { stroke: "#3D5A8A", strokeWidth: 4, strokeDasharray: "10 6" } },
                  { r: `acaso na janela, ${pct(PI, 1)}`, p: { stroke: "#5B6475", strokeWidth: 2, strokeDasharray: "7 6" } },
                  { r: `acaso com ${pct(pi, 1)}`, p: { stroke: "#3D5A8A", strokeWidth: 1.6, strokeDasharray: "3 5" } },
                ].map((it, k) => <g key={k}><line x1={x(0.5)} x2={x(0.5) + d.fs * 2.2} y1={y(0.95) + k * d.fs * 1.25} y2={y(0.95) + k * d.fs * 1.25} {...it.p} /><text className="q7-rot--peq" x={x(0.5) + d.fs * 2.8} y={y(0.95) + k * d.fs * 1.25} dy=".35em">{it.r}</text></g>)}</g>
              </>}
              {c.precisao !== null && <><circle cx={x(tpr)} cy={y(c.precisao)} r={d.fs * 0.42} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} opacity={real ? 1 : 0.5} /><text className="q7-corte-t" x={x(tpr) + d.fs * 0.6} y={y(c.precisao) - d.fs * 0.4}>corte {pct(t, 1)}</text></>}
              {!real && precHip !== null && <rect x={x(tpr) - d.fs * 0.4} y={y(precHip) - d.fs * 0.4} width={d.fs * 0.8} height={d.fs * 0.8} fill="#A85A0C" stroke="#fff" strokeWidth={2} />}
            </g>
          );
        }}
      </Grafico>
      <div className="q7-g2-linha">
        {liberado ? <Controle rotulo="Prevalência de outra carteira (hipótese)" valor={pi} min={0.01} max={0.3} passo={0.005} onChange={setPi} mostrar={real ? `${pct(pi, 1)} (janela)` : pct(pi, 1)} escala={["1%", "30%"]} /> : <span />}
        <div className="q7-botoes">{liberado && !real && <Botao onClick={() => setPi(PI)}>Voltar à janela</Botao>}<Botao sec onClick={() => { setT(T0); setPi(PI); setEsc(null); }}>Restaurar</Botao></div>
      </div>
      </div>
      <Painel>
        <Controle rotulo="Corte de PD para sinalizar" valor={t} min={0.04} max={0.4} passo={0.005} onChange={setT} mostrar={pct(t, 1)} />
        <dl className="q7-lista">
          <div><dt>Precisão = VP ÷ (VP + FP)</dt><dd>{c.vp} ÷ {c.vp + c.fp} = {c.precisao === null ? "não existe" : pct(c.precisao, 1)}</dd></div>
          {icP && <div data-tom="mudo"><dt>Intervalo de 95% da precisão</dt><dd>{pct(icP.lo, 1)} a {pct(icP.hi, 1)}</dd></div>}
          <div><dt>Recall = VP ÷ (VP + FN)</dt><dd>{c.vp} ÷ {D} = {pct(tpr, 1)}</dd></div>
        </dl>
        <Previsao pergunta={`Corte de ${pct(T0, 0)}, carteira com ${pct(PI2, 0)} de default. A precisão:`} opcoes={OPS} escolha={esc} onEscolha={escolher} recolher />
        <Expandir resumo="AP não é a área trapezoidal">
          <Formula f={String.raw`\mathrm{AP}=\sum_k (R_k-R_{k-1})\,P_k`} simbolos={[["R_k", "recall no k-ésimo corte distinto"], ["P_k", "precisão no mesmo corte"]]} />
          <p className="q7-nota">Na janela: AP {num(AP, 4)} (como average_precision_score) e área trapezoidal {num(TRAP, 4)}. Aqui a trapezoidal fica {TRAP < AP ? "abaixo" : "acima"} da AP; a diferença muda de sinal conforme a curva, por isso o protocolo fixa a AP e compara sempre na mesma população.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}

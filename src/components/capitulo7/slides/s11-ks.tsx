"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Legenda, Painel, Previsao, Quadro, margens, type Opcao, type Pagina } from "../base";
import { D, A, EAD, N, PL, Y } from "@/lib/capitulo7/dados";
import { confusao, curvaRoc, ks } from "@/lib/capitulo7/metricas";
import { curva, GRADE_CORTES, otimo } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 11 · c7p7 · KS. Para cada corte t, a fração dos defaults e a fração dos adimplentes com PD ≥ t (as acumuladas lidas
 * do pior escore para o melhor). O KS é a maior distância vertical entre as duas, igual ao maior TPR − FPR. A turma
 * responde antes se o corte de maior separação coincide com o de maior resultado esperado; só então a barra do KS e o
 * corte econômico do capítulo 8 (mesmo motor, src/lib/visuais/economia.ts) aparecem no gráfico.
 */
const ROC = curvaRoc(Y, PL);
const KS = ks(Y, PL);
const ECON = otimo(curva(PL as number[], EAD as number[], GRADE_CORTES)).corte;
const MAXX = 0.4;
const FIM = confusao(Y, PL, MAXX);
const T0 = 0.15;
const OPCOES: Opcao[] = [
  { texto: "Sim: separação máxima dá resultado máximo", retorno: <>Confunde <b>separação com valor</b>. O KS pesa igual um default aprovado e um bom cliente recusado; o resultado esperado pesa cada erro pelo que ele custa.</> },
  { texto: "Não necessariamente: o KS ignora perda, receita e custo", certa: true, retorno: <>Isso. O KS está em {pct(KS.limiar, 2)}; o resultado esperado é máximo em {pct(ECON, 1)}. <b>KS não é corte.</b></> },
  { texto: "Sim, se a AUC do modelo for alta", retorno: <>A AUC também ignora custos. Um modelo melhor separa mais, mas o corte de maior resultado depende de <b>quanto custa cada erro</b>.</> },
];

export function S11Ks({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState(T0);
  const [esc, setEsc] = useState<number | null>(null);
  const rev = esc !== null;
  const c = confusao(Y, PL, t); const tpr = c.vp / D, fpr = c.fp / A;
  const noMax = Math.abs(t - KS.limiar) < 0.0025;
  return (
    <Quadro slug="c7p7" pagina={pagina} layout="gl"
      conclusao={noMax && rev ? <>No corte de {pct(KS.limiar, 2)} ({int(KS.recusados)} recusadas) a separação é máxima: <b>KS = {num(KS.ks, 4)}</b>. O resultado esperado, com as hipóteses do capítulo 8, é máximo em <b>{pct(ECON, 1)}</b>: o KS não sabe quanto custa cada erro.</>
        : noMax ? <>No corte de {pct(KS.limiar, 2)} a separação é máxima: <b>KS = {num(KS.ks, 4)}</b>. É também o melhor corte para recusar? Responda ao lado.</>
        : <>No corte de {pct(t, 1)}: {pct(tpr, 1)} dos defaults e {pct(fpr, 1)} dos adimplentes têm PD acima dele; distância de <b>{num(tpr - fpr, 4)}</b>{rev ? `, contra o máximo de ${num(KS.ks, 4)}.` : ". Onde ela é maior?"}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults e ${A} adimplentes; PD da logística. Corte econômico: máximo do resultado esperado na grade de 0,5% a 60%, com receita de 28%, perda de 65% no default, funding de 12%, R$ 120 de operação e 2% de capital (capítulo 8).`}>
      <div className="q7-flex1 q7-gap">
      <Grafico titulo="Fração de cada classe com PD acima do corte" sub="as acumuladas, lidas do maior risco para o menor" rotulo={`Curvas acumuladas; no corte de ${pct(t, 1)}, ${pct(tpr, 1)} dos defaults e ${pct(fpr, 1)} dos adimplentes${rev ? `; KS ${num(KS.ks, 4)} em PD ${pct(KS.limiar, 2)}; corte econômico ${pct(ECON, 1)}` : ""}`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, MAXX], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
          const pts = ROC.filter((p) => p.limiar <= MAXX);
          const deg = (k: "tpr" | "fpr") => caminho([{ x: x(0), y: y(1) }, ...pts.slice().reverse().map((p) => ({ x: x(p.limiar), y: y(p[k]) })), { x: x(MAXX), y: y(k === "tpr" ? FIM.vp / D : FIM.fp / A) }]);
          const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="Corte de PD (recusa quando PD ≥ corte)" />
              <path className="q7-linha q7-linha--def" d={deg("tpr")} />
              <path className="q7-linha q7-linha--mudo" d={deg("fpr")} />
              {rev && <>
                <line x1={x(KS.limiar)} x2={x(KS.limiar)} y1={y(KS.fpr)} y2={y(KS.tpr)} stroke="#00205B" strokeWidth={5} />
                <text className="q7-rot" x={x(KS.limiar) + d.fs * 0.45} y={y(KS.tpr) - d.fs * 1.7} style={{ fill: "#00205B", ...halo }}><tspan>KS</tspan><tspan x={x(KS.limiar) + d.fs * 0.45} dy="1.05em">{num(KS.ks, 4)}</tspan></text>
                <line className="q7-corte" x1={x(ECON)} x2={x(ECON)} y1={y(0)} y2={y(1)} strokeDasharray="6 5" />
                <text className="q7-corte-t" x={x(ECON) + 6} y={y(0.97)}>corte econômico {pct(ECON, 1)}</text>
              </>}
              <line x1={x(t)} x2={x(t)} y1={y(fpr)} y2={y(tpr)} stroke="#A85A0C" strokeWidth={3} />
              <circle cx={x(t)} cy={y(tpr)} r={d.fs * 0.32} fill="#8C2332" /><circle cx={x(t)} cy={y(fpr)} r={d.fs * 0.32} fill="#fff" stroke="#5B6475" strokeWidth={2.4} />
            </g>
          );
        }}
      </Grafico>
        <Legenda itens={[{ mk: "linha def2", r: `● defaults acima (TPR, de ${D})` }, { mk: "linha mudo", r: `○ adimplentes acima (FPR, de ${A})` }, ...(rev ? [{ mk: "linha ink", r: "KS" }, { mk: "trac dec", r: "corte econômico" }] : [])]} />
      </div>
      <Painel className="q7-s11-p">
        <Controle rotulo="Corte de PD" valor={t} min={0.02} max={MAXX} passo={0.0025} onChange={setT} mostrar={pct(t, 1)} escala={[pct(0.02, 0), pct(MAXX, 0)]} />
        <div className="q7-botoes"><Botao onClick={() => setT(KS.limiar)}>Ir ao máximo</Botao>{rev && <Botao onClick={() => setT(ECON)}>Corte econômico</Botao>}<Botao sec onClick={() => { setT(T0); setEsc(null); }}>Restaurar</Botao></div>
        <dl className="q7-lista">
          <div className="q7-s11-conta"><dt><span className="q7-s11-d">● {pct(tpr, 1)} · {c.vp} de {D}</span> − <span className="q7-s11-a">○ {pct(fpr, 1)} · {c.fp} de {A}</span></dt><dd>= {num(tpr - fpr, 4)}</dd></div>
          <div><dt>KS = máx (TPR − FPR){rev ? `, em ${pct(KS.limiar, 2)}` : ""}</dt><dd>{num(KS.ks, 4)}</dd></div>
        </dl>
        <Previsao rotulo="Antes de revelar" pergunta="O corte do KS, de maior separação, é o de maior resultado esperado?" opcoes={OPCOES} escolha={esc} onEscolha={setEsc} recolher />
      </Painel>
    </Quadro>
  );
}

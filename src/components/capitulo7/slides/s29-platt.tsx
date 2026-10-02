"use client";
import { useState } from "react";
import { Botao, caminho, escala, Formula, Legenda, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { CAL, CAL_PGR, D, N, PG, PGR, PLATT, Y } from "@/lib/capitulo7/dados";
import { ajustarPlatt, ajustarPlattSuavizado, aucPorPares, brier, faixasQuantis, logit, logLoss, media, sigmoide, slopeComIntervalo, transformar } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 29 · c7p13 · Platt: σ(a + b · logit p) sobre o boosting sem recalibrar. Três versões na mesma janela: sem calibrar,
 * o Platt do curso (parâmetros estimados antes da janela, na validação) e o Platt ajustado na amostra de calibração.
 * O ajuste aqui é máxima verossimilhança simples; o scikit-learn (CalibratedClassifierCV, method="sigmoid") usa a
 * suavização de alvos de Platt (1999) e escreve 1/(1 + exp(A f + B)); a nota mostra esse ajuste, calculado por
 * ajustarPlattSuavizado e conferido contra o _sigmoid_calibration do scikit-learn 1.9.1. A peça principal é a curva de
 * confiabilidade na janela, com a transformação em miniatura ao lado; a AUC aparece sobre o gráfico depois da previsão.
 * O slope de calibração vem com o intervalo de Wald da logística (slopeComIntervalo): com 81 defaults, ele é largo.
 */
type V = "bruto" | "curso" | "cal";
const PC = ajustarPlatt(CAL.y, CAL_PGR);
const SK = ajustarPlattSuavizado(CAL.y, CAL_PGR);
const P_CAL = transformar(PGR, PC.a, PC.b);
const VERS: Record<V, { nome: string; a: number | null; b: number | null; p: readonly number[]; classe: "mudo" | "ink" | "prob" }> = {
  bruto: { nome: "Sem calibrar", a: null, b: null, p: PGR, classe: "mudo" },
  curso: { nome: "Platt do curso", a: PLATT.a, b: PLATT.b, p: PG, classe: "ink" },
  cal: { nome: "Platt da calibração", a: PC.a, b: PC.b, p: P_CAL, classe: "prob" },
};
const ORDEM: V[] = ["bruto", "curso", "cal"];
const MET = Object.fromEntries(ORDEM.map((k) => { const p = VERS[k].p; return [k, { media: media(p)!, auc: aucPorPares(Y, p).auc!, brier: brier(Y, p), ll: logLoss(Y, p).valor, sl: slopeComIntervalo(Y, p) }]; })) as Record<V, { media: number; auc: number; brier: number; ll: number; sl: ReturnType<typeof slopeComIntervalo> }>;
const FAIXAS = Object.fromEntries(ORDEM.map((k) => [k, faixasQuantis(Y, VERS[k].p, 10)])) as Record<V, ReturnType<typeof faixasQuantis>>;
const ic = (k: V) => `${num(MET[k].sl.ic[0], 2)} a ${num(MET[k].sl.ic[1], 2)}`;

/** Índice da alternativa certa da previsão: a comparação só abre depois dela; errar mostra o retorno e pede nova tentativa. */
const CERTA = 1;

export function S29Platt({ pagina }: { pagina?: Pagina }) {
  const [v, setV] = useState<V>("bruto");
  const [prev, setPrev] = useState<number | null>(null);
  const [formula, setFormula] = useState(false);
  const m = MET[v];
  const revelado = prev === CERTA;
  return (
    <Quadro slug="c7p13" pagina={pagina} layout="gl"
      conclusao={!revelado ? <>Antes de comparar as três versões: o que Platt faz com a ordenação?</>
        : v === "bruto" ? <>O boosting sem calibrar tem PD média {pct(m.media, 2)} contra {pct(D / N, 2)} observados e slope de calibração {num(m.sl.slope, 2)} na janela, com IC de {ic("bruto")}: compatível com 1, com {D} defaults. Escolha um calibrador e veja a curva se mover sem que a AUC mude.</>
          : <>{VERS[v].nome}: a = {num(VERS[v].a!, 3)}, b = {num(VERS[v].b!, 3)}. PD média {pct(m.media, 2)}, Brier {num(m.brier, 5)} (sem calibrar {num(MET.bruto.brier, 5)}), log loss {num(m.ll, 4)} ({num(MET.bruto.ll, 4)}); a AUC continua <b>{num(m.auc, 4)}</b>. Com b {"<"} 1 Platt comprime as PDs; o slope na janela passa a {num(m.sl.slope, 2)} (IC {ic(v)}), <b>ainda compatível com 1</b> com {D} defaults.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults, decis da PD. Calibração sintética: ${int(CAL.n)} sorteios dos proponentes da janela, desfecho da PD verdadeira (semente ${CAL.semente}). Platt do curso: capítulo 6, estimado na validação. Slope: coeficiente de logit p numa logística de y na janela, IC de Wald de 95%.`}>
      <Painel>
        <Confiabilidade titulo="Confiabilidade na janela" sub="decis da PD; ao lado, a transformação" rotulo={`Curva de confiabilidade por decis: sem calibrar${v === "bruto" ? "" : ` e ${VERS[v].nome}`}${revelado ? `; AUC ${num(m.auc, 4)} nas três versões` : ""}`} max={0.3} ticks={[0, 0.1, 0.2, 0.3]} anotar={false} arCelular="4 / 3"
          series={[{ faixas: FAIXAS.bruto, classe: "mudo", linha: true }, ...(v === "bruto" ? [] : [{ faixas: FAIXAS[v], classe: VERS[v].classe, linha: true }])]}
          extra={(x, y, d) => {
            // miniatura da transformação, à direita do quadrado da curva
            const x0 = x(0.3) + d.fs * 4.2, lado = Math.min(d.w - x0 - d.fs * 0.6, (y(0) - y(0.3)) * 0.7);
            if (lado < d.fs * 5) return null;
            const tx = escala([0, 0.5], [x0, x0 + lado]), ty = escala([0, 0.5], [y(0.3) + d.fs * 1.4 + lado, y(0.3) + d.fs * 1.4]);
            const qs = Array.from({ length: 60 }, (_, i) => 0.003 + (i / 59) * 0.497);
            return (
              <g>
                <text className="q7-eixo-t" x={x0} y={ty(0.5) - d.fs * 0.6}>A transformação</text>
                <rect x={x0} y={ty(0.5)} width={lado} height={lado} fill="#FBFAF7" stroke="#E2DFD6" />
                <line className="q7-diag" x1={tx(0)} y1={ty(0)} x2={tx(0.5)} y2={ty(0.5)} />
                {(["curso", "cal"] as V[]).map((k) => <path key={k} className={`q7-linha q7-linha--fina q7-linha--${VERS[k].classe}`} strokeDasharray={k === "curso" ? "7 5" : undefined} style={{ opacity: v === "bruto" || v === k ? 1 : 0.3 }} d={caminho(qs.map((q) => ({ x: tx(q), y: ty(sigmoide(VERS[k].a! + VERS[k].b! * logit(q))) })))} />)}
                <text className="q7-tick" x={tx(0)} y={ty(0)} dy="1.2em">0%</text>
                <text className="q7-tick" x={tx(0.5)} y={ty(0)} dy="1.2em" textAnchor="end">50%</text>
                <text className="q7-tick" x={tx(0.5)} y={ty(0)} dy="2.4em" textAnchor="end">PD sem calibrar → calibrada</text>
                {revelado && <text className="q7-rot" x={x0} y={ty(0) + d.fs * 4.2} style={{ fill: "#3D5A8A" }}>AUC {num(m.auc, 4)}</text>}
                {revelado && <text className="q7-rot--peq" x={x0} y={ty(0) + d.fs * 5.3} style={{ fill: "#3D5A8A" }}>igual nas três versões: a fila não muda</text>}
              </g>
            );
          }} />
        <Legenda itens={[{ mk: "linha mudo", r: "sem calibrar" }, { mk: "trac ink", r: "Platt do curso" }, { mk: "linha prob", r: "Platt da amostra de calibração" }]} />
      </Painel>
      <Painel>
        {formula ? (
          <>
            <p className="q7-k">A fórmula e a convenção do scikit-learn</p>
            <Formula compacta f={String.raw`\begin{aligned}\text{aqui: }p'&=\sigma\big(a+b\,\operatorname{logit}p\big)\\ \text{scikit-learn: }p'&=\frac{1}{1+e^{A\,\operatorname{logit}p+B}}\\ \Rightarrow\ A&=-b,\ \ B=-a\end{aligned}`} />
            <p className="q7-nota">Aqui, máxima verossimilhança simples: b = {num(PC.b, 4)}, a = {num(PC.a, 4)}. O scikit-learn (CalibratedClassifierCV, method=&quot;sigmoid&quot;) suaviza os alvos como Platt (1999): o default vale (N₁ + 1)/(N₁ + 2) e o adimplente 1/(N₀ + 2). Na mesma amostra, isso dá b = {num(SK.b, 4)} e a = {num(SK.a, 4)}.</p>
          </>
        ) : !revelado ? (
          <Previsao pergunta="Platt com b positivo é aplicado às PDs do boosting. O que acontece com a AUC na janela?" escolha={prev} onEscolha={setPrev} recolher
            opcoes={[
              { texto: "Sobe, porque as PDs ficam mais corretas", retorno: "Confunde calibração com ordenação. Uma função estritamente crescente não troca ninguém de lugar; a AUC só depende da ordem." },
              { texto: "Fica igual", certa: true, retorno: "Isso: com b > 0, σ(a + b logit p) é estritamente crescente, a ordem das propostas é a mesma e a AUC não muda." },
              { texto: "Cai, porque Platt comprime as PDs", retorno: "Comprimir aproxima as PDs mas não inverte nenhum par; sem inversão nem empate novo, a AUC não muda." },
            ]} />
        ) : (
          <>
            <Seg rotulo="Versão" opcoes={ORDEM.map((k) => ({ v: k, r: k === "bruto" ? "Sem calibrar" : k === "curso" ? "Curso" : "Calibração" }))} valor={v} onChange={setV} cor />
            <table className="q7-tab">
              <thead><tr><th className="q7-t-l">Na janela</th><th>Sem</th><th>Curso</th><th>Calibração</th></tr></thead>
              <tbody>
                <tr><th>a ; b</th><td>·</td><td>{num(PLATT.a, 3)} ; {num(PLATT.b, 3)}</td><td>{num(PC.a, 3)} ; {num(PC.b, 3)}</td></tr>
                {([["PD média", (k: V) => pct(MET[k].media, 2)], ["AUC", (k: V) => num(MET[k].auc, 4)], ["Brier", (k: V) => num(MET[k].brier, 5)], ["Log loss", (k: V) => num(MET[k].ll, 4)], ["Slope", (k: V) => num(MET[k].sl.slope, 2)], ["IC 95% do slope", ic]] as const).map(([r, f]) => (
                  <tr key={r}><th>{r}</th>{ORDEM.map((k) => <td key={k} data-on={k === v ? "1" : undefined}>{f(k)}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <p className="q7-nota">Observado na janela: {pct(D / N, 2)}. Nenhuma das versões foi ajustada nela.</p>
          </>
        )}
        <div className="q7-botoes"><Botao onClick={() => setFormula(!formula)}>{formula ? "Voltar" : "A fórmula e o scikit-learn"}</Botao><Botao sec onClick={() => { setV("bruto"); setPrev(null); setFormula(false); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

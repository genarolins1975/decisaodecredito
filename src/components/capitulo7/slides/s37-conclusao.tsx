"use client";
import { useState, type ReactNode } from "react";
import { Botao, caminho, escala, Grafico, LinkSlide, Painel, Quadro, Seg, type Dim, type Pagina } from "../base";
import { ANCORA, D, EAD, MONITOR, N, PGR, PL, Y, monitoramento } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, ganho, jeffreys, ks, slopeComIntervalo, wilson, Z95 } from "@/lib/capitulo7/metricas";
import { N_JANELAS, SEMENTE_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";
import { CURTO } from "@/lib/capitulo7/roteiro";
import { curva, fmtReais, GRADE_CORTES, otimo } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 37 · c7p20 · Conclusão: as quatro respostas para a logística da janela, cada uma com uma miniatura do número que a
 * sustenta (AUC com IC de DeLong; PD média contra a taxa observada com Wilson; curva de resultado com o corte econômico
 * e o KS; diferença para o boosting com IC e a vantagem em janelas novas) e o que ainda falta. À direita, o fluxo de
 * diagnóstico: escolhido o sintoma, o quadro diz o que ele indica e para quais slides voltar; sem sintoma, o
 * procedimento que se aplica a uma carteira real. Números das mesmas funções dos slides anteriores. Rodada 2: a
 * resposta "Ordena?" traz a AUC esperada em janelas novas ao lado da janela; a de probabilidade, a perda esperada dos
 * calibradores (calibradores de janelas.ts); a síntese repete a decisão do slide 36 (manter, recalibrar o nível em
 * amostra própria, confirmar numa janela nova); o rótulo do KS sai de baixo da curva. Rodada 4: a síntese segue a nova
 * decisão do slide 36 (nível ancorado em várias safras maturadas, ANCORA de dados.ts, monitorado por safra com Jeffreys
 * e confirmado nas safras de 2024); o procedimento ganha os passos de recalibrar (com o critério de quando) e de
 * segmentos; as janelas novas viram réplicas sintéticas da janela. Rodada 5: a síntese diz a finalidade (que escolhe a
 * amostra do nível antes da janela) e o critério de troca; o procedimento começa pela pré-condição (congelar as
 * escolhas), usa "Jeffreys por faixa" e deriva o gatilho de duas rejeições seguidas como regra de controle contra
 * ruído, com a probabilidade de falso alarme calculada (falsoAlarmeSeguidas). A caixa do procedimento tem a altura do
 * conteúdo. Rodada 6: sai a regra das duas rejeições seguidas. A síntese responde à pergunta do slide 16 com o número:
 * a logística fica com o nível recalibrado em validação e janela (ANCORA.recentes), como decide o slide 36. O
 * procedimento separa o nível (finalidade declarada antes; safras maturadas mais recentes, depois da prova) do
 * monitoramento (Jeffreys no acumulado desde a calibração, 5% repartido entre 12 safras), com falso alarme e poder
 * simulados com semente (monitoramento de dados.ts): uma safra de 150 propostas quase não enxerga 1 ponto.
 */
type Sint = "auc" | "cal" | "dec" | "oot";
const DL = delong(Y, PL, PGR), KS_ = ks(Y, PL), G10 = ganho(Y, PL, 0.1), G = calibracaoGlobal(Y, PL), SL = slopeComIntervalo(Y, PL);
const JC = jeffreys(D, N, G.pdMedia!), OBS = wilson(D, N)!;
const CV = curva(PL as number[], EAD as number[], GRADE_CORTES.filter((c) => c <= 0.4)); const OT = otimo(CV);
const AN = ANCORA;
const COR = { ord: "#3D5A8A", prob: "#176C73", dec: "#A85A0C", val: "#2E6B4F" };

function MiniOrd({ d, esperada }: { d: Dim; esperada: number }) {
  const fs = d.fs, x = escala([0.6, 0.85], [fs * 0.6, d.w - fs * 0.8]), cy = fs * 2.1, lo = DL.auc1 - Z95 * DL.ep1, hi = DL.auc1 + Z95 * DL.ep1;
  return (
    <g>
      <line className="q7-eixo" x1={x(0.6)} x2={x(0.85)} y1={cy + fs * 0.9} y2={cy + fs * 0.9} />
      {[0.6, 0.7, 0.8].map((t) => <text key={t} className="q7-tick" x={x(t)} y={cy + fs * 0.9} dy="1em" textAnchor={t === 0.6 ? "start" : "middle"}>{num(t, 1)}</text>)}
      <line x1={x(lo)} x2={x(hi)} y1={cy} y2={cy} stroke={COR.ord} strokeWidth={4} strokeLinecap="round" />
      <circle cx={x(DL.auc1)} cy={cy} r={fs * 0.45} fill={COR.ord} stroke="#fff" strokeWidth={2} />
      <text className="q7-rot--peq" x={x(DL.auc1)} y={cy - fs * 0.8} textAnchor="middle" style={{ fill: COR.ord, fontWeight: 700 }}>AUC {num(DL.auc1, 4)}, IC {num(lo, 3)} a {num(hi, 3)}</text>
      <text className="q7-rot--peq" x={x(0.6)} y={cy + fs * 3.1} style={{ fill: "#2A3342" }}>nas {N_JANELAS} réplicas sintéticas da janela: {num(esperada, 4)}</text>
    </g>
  );
}
function MiniProb({ d }: { d: Dim }) {
  const fs = d.fs, x = escala([0.06, 0.16], [fs * 0.6, d.w - fs * 0.8]), cy = fs * 2.1;
  return (
    <g>
      <line className="q7-eixo" x1={x(0.06)} x2={x(0.16)} y1={cy + fs * 0.9} y2={cy + fs * 0.9} />
      {[0.06, 0.1, 0.14].map((t) => <text key={t} className="q7-tick" x={x(t)} y={cy + fs * 0.9} dy="1em" textAnchor={t === 0.06 ? "start" : "middle"}>{pct(t, 0)}</text>)}
      <line x1={x(OBS.lo)} x2={x(OBS.hi)} y1={cy} y2={cy} stroke="#5B6475" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      <rect x={x(OBS.p) - fs * 0.35} y={cy - fs * 0.35} width={fs * 0.7} height={fs * 0.7} fill="#fff" stroke="#2A3342" strokeWidth={2.5} />
      <path d={`M${x(G.pdMedia!)} ${cy - fs * 0.5}l${fs * 0.5} ${fs * 0.85}h${-fs}z`} fill={COR.prob} />
      <text className="q7-rot--peq" x={x(G.pdMedia!)} y={cy - fs * 0.8} textAnchor="end" style={{ fill: COR.prob, fontWeight: 700 }}>▲ PD {pct(G.pdMedia!, 1)}</text>
      <text className="q7-rot--peq" x={x(OBS.p)} y={cy - fs * 0.8} textAnchor="start" style={{ fill: "#2A3342", fontWeight: 700 }}>□ obs. {pct(OBS.p, 1)}</text>
      <text className="q7-rot--peq" x={x(0.06)} y={cy + fs * 3.1} style={{ fill: "#2A3342" }}>Jeffreys p = {num(JC, 2)}; slope {num(SL.slope, 2)}, IC {num(SL.ic[0], 2)} a {num(SL.ic[1], 2)}</text>
    </g>
  );
}
function MiniDec({ d }: { d: Dim }) {
  const fs = d.fs; const vals = CV.map((q) => q.parcelas.total); const hi = Math.max(...vals);
  const x = escala([0, 0.4], [fs * 0.6, d.w - fs * 0.8]), y = escala([0, hi * 1.25], [Math.min(d.h - fs * 1.2, fs * 4.4), fs * 0.3]);
  return (
    <g>
      <line className="q7-eixo" x1={x(0)} x2={x(0.4)} y1={y(0)} y2={y(0)} />
      {[0, 0.2, 0.4].map((t) => <text key={t} className="q7-tick" x={x(t)} y={y(0)} dy="1em" textAnchor={t === 0 ? "start" : t === 0.4 ? "end" : "middle"}>{pct(t, 0)}</text>)}
      <path className="q7-linha q7-linha--fina q7-linha--prob" d={caminho(CV.map((q) => ({ x: x(q.corte), y: y(q.parcelas.total) })))} />
      <line x1={x(KS_.limiar)} x2={x(KS_.limiar)} y1={y(0)} y2={fs * 0.2} stroke={COR.ord} strokeWidth={2} strokeDasharray="3 4" />
      <text className="q7-corte-t q7-corte-t--ord" x={x(KS_.limiar)} y={y(0)} dy="1em" textAnchor="middle">KS {pct(KS_.limiar, 1)}</text>
      <line className="q7-corte" x1={x(OT.corte)} x2={x(OT.corte)} y1={y(0)} y2={fs * 0.2} />
      <text className="q7-corte-t" x={x(OT.corte) + fs * 0.3} y={y(0) - fs * 0.4}>corte {pct(OT.corte, 1)}</text>
      <text className="q7-rot--peq" x={x(0.4)} y={y(CV[CV.length - 1].parcelas.total) - fs * 0.5} textAnchor="end" style={{ fill: COR.prob }}>esperado, máximo {fmtReais(OT.parcelas.total)}</text>
    </g>
  );
}
function MiniVal({ d, novas }: { d: Dim; novas: number }) {
  const fs = d.fs, x = escala([-0.01, 0.07], [fs * 0.6, d.w - fs * 0.8]), cy = fs * 2.1;
  return (
    <g>
      <line className="q7-eixo" x1={x(-0.01)} x2={x(0.07)} y1={cy + fs * 0.9} y2={cy + fs * 0.9} />
      {[0, 0.03, 0.06].map((t) => <text key={t} className="q7-tick" x={x(t)} y={cy + fs * 0.9} dy="1em" textAnchor="middle">{num(t, 2)}</text>)}
      <line x1={x(0)} x2={x(0)} y1={fs * 0.2} y2={cy + fs * 0.9} stroke="#5B6475" strokeWidth={2} />
      <line x1={x(DL.ic[0])} x2={x(DL.ic[1])} y1={cy} y2={cy} stroke={COR.val} strokeWidth={4} strokeLinecap="round" />
      <rect x={x(DL.dif) - fs * 0.38} y={cy - fs * 0.38} width={fs * 0.76} height={fs * 0.76} fill={COR.val} stroke="#fff" strokeWidth={2} />
      <text className="q7-rot--peq" x={x(DL.dif)} y={cy - fs * 0.8} textAnchor="middle" style={{ fill: COR.val, fontWeight: 700 }}>■ {num(DL.dif, 4)}, IC {num(DL.ic[0], 4)} a {num(DL.ic[1], 4)}</text>
      <text className="q7-rot--peq" x={x(-0.01)} y={cy + fs * 3.1} style={{ fill: "#2A3342" }}>nas {N_JANELAS} réplicas sintéticas da janela: {num(novas, 4)}</text>
    </g>
  );
}

const SINTOMAS: Record<Sint, { r: string; diag: string; voltar: string[] }> = {
  auc: { r: "AUC baixa", diag: "Problema de ordenação: as variáveis ou a forma do modelo não separam. Recalibrar não resolve; volte à modelagem.", voltar: ["c7p5", "c7p6", "c7p27"] },
  cal: { r: "AUC boa, curva fora da diagonal", diag: "Problema de probabilidade: nível ou inclinação. Corrija com intercepto ou Platt nas safras maturadas mais recentes, depois da prova, e monitore o acumulado.", voltar: ["c7p10", "c7p32", "c7p16", "c7p12"] },
  dec: { r: "PD boa, resultado ruim", diag: "Problema de decisão: corte, perda ou receita mal especificados. A PD não escolhe a política sozinha.", voltar: ["c7p37", "c7p18"] },
  oot: { r: "Bom na validação, ruim na janela", diag: "Problema de validação: sobreajuste, seleção feita olhando a janela ou mudança de população. Congele e use uma janela nova.", voltar: ["c7p15", "c7p17", "c7p14"] },
};
export function S37Conclusao({ pagina }: { pagina?: Pagina }) {
  const [s, setS] = useState<Sint | null>(null);
  const [jn] = useState(() => vantagemEmJanelasNovas());
  // monitoramento simulado sob demanda, ao abrir o slide (nunca no carregamento do módulo)
  const [mon] = useState(() => monitoramento());
  const x = s ? SINTOMAS[s] : null;
  const PASSOS: [string, string][] = [
    ["Antes", "declarar a finalidade, congelar escolhas"],
    ["Ordenação", "AUC com IC pareado"],
    ["Probabilidade", "O/E, Jeffreys, slope; segmentos"],
    ["Nível", "intercepto nas safras recentes, após a prova"],
    ["Monitorar", `Jeffreys no acumulado (${pct(MONITOR.alfa, 0)} ÷ ${MONITOR.safras}): em ${MONITOR.safras} safras de ${mon.m}, falso alarme ${pct(mon.falsoAcumulado, 1)}, poder ${pct(mon.poderAcumulado, 0)} contra 1 ponto; uma safra, ${pct(mon.poderSafra, 1)} (acaso, ${pct(mon.falsoSafra, 1)})`],
    ["Decisão", "corte pela conta"],
  ];
  const RESPOSTAS: { p: keyof typeof COR; s: string; t: string; r: string; mini: (d: Dim) => ReactNode; rot: string; falta: ReactNode }[] = [
    { p: "ord", s: "●", t: "Ordena?", r: "Sim, moderadamente.", mini: (d) => <MiniOrd d={d} esperada={jn.l} />, rot: `AUC ${num(DL.auc1, 4)} com IC de DeLong; esperada nas réplicas sintéticas da janela ${num(jn.l, 4)}; 10% piores com ${pct(G10.ganho!, 0)} dos defaults`, falta: "estabilidade no tempo." },
    { p: "prob", s: "▲", t: "Prevê bem a probabilidade?", r: `Nível baixo: recalibrado a ${pct(AN.recentes.pdMedia, 1)}.`, mini: (d) => <MiniProb d={d} />, rot: `PD média ${pct(G.pdMedia!, 1)} contra ${pct(OBS.p, 1)} observados, IC ${pct(OBS.lo, 1)} a ${pct(OBS.hi, 1)}; Jeffreys p = ${num(JC, 2)}`, falta: <>o nível novo no tempo (<LinkSlide slug="c7p16">slide 27</LinkSlide>).</> },
    { p: "dec", s: "◆", t: "Sustenta a decisão?", r: "Com hipóteses explícitas.", mini: (d) => <MiniDec d={d} />, rot: `Corte econômico ${pct(OT.corte, 1)}, KS ${pct(KS_.limiar, 1)}`, falta: "sensibilidade de perda e receita." },
    { p: "val", s: "■", t: "Prova fora da amostra?", r: "Uma vez, com margem estreita.", mini: (d) => <MiniVal d={d} novas={jn.vantagem} />, rot: `Diferença para o boosting ${num(DL.dif, 4)}, IC ${num(DL.ic[0], 4)} a ${num(DL.ic[1], 4)}; ${num(jn.vantagem, 4)} nas réplicas sintéticas da janela`, falta: "as safras de 2024, maduras em 2025." },
  ];
  return (
    <Quadro slug="c7p20" pagina={pagina} layout="gl" rotuloConclusao="Síntese"
      conclusao={<><b>A logística fica, com o nível recalibrado em validação e janela: PD média de {pct(AN.sem.pdMedia, 1)} para {pct(AN.recentes.pdMedia, 1)}</b> (pergunta do slide 16). Depois, <b>recalibrar quando o acumulado rejeitar</b>.</>}
      fonte={`Janela: ${int(N)} propostas, ${D} defaults; motor do slide 32; réplicas: semente ${SEMENTE_JANELAS}. Monitoramento: ${int(MONITOR.sorteios)} sorteios binomiais (semente ${MONITOR.semente}), PD ${pct(mon.p0, 1)}, Jeffreys bilateral.`}>
      <Painel titulo="Quatro respostas da logística">
        <div className="q7-s37-r">
          {RESPOSTAS.map((r) => (
            <section key={r.p} className="q7-s37-c q7-s37-c--m" data-p={({ ord: "ordenacao", prob: "probabilidade", dec: "decisao", val: "validacao" } as const)[r.p]}>
              <h3><span aria-hidden="true">{r.s}</span>{r.t}</h3>
              <p className="q7-s37-a">{r.r}</p>
              <Grafico rotulo={r.rot} arCelular="16 / 6">{r.mini}</Grafico>
              <p className="q7-s37-f"><b>Falta:</b> {r.falta}</p>
            </section>
          ))}
        </div>
      </Painel>
      <Painel titulo="Qual é o sintoma?">
        <div className="q7-s37-seg"><Seg rotulo="Sintoma" opcoes={(Object.keys(SINTOMAS) as Sint[]).map((k) => ({ v: k, r: SINTOMAS[k].r }))} valor={s ?? ("" as Sint)} onChange={setS} cor /></div>
        <div className="q7-s37-d q7-s37-d--m" aria-live="polite">
          {x ? (
            <>
              <p className="q7-p">{x.diag}</p>
              <p className="q7-k">Volte a</p>
              <ul className="q7-s01-l">{x.voltar.map((v) => <li key={v}><LinkSlide slug={v} className="q7-s01-k">{CURTO[v]}</LinkSlide></li>)}</ul>
            </>
          ) : (
            <>
              <p className="q7-k">Para aplicar amanhã</p>
              <ol className="q7-s37-pp q7-s37-pp--6">{PASSOS.map(([k, v]) => <li key={k}><b>{k}:</b> {v}.</li>)}</ol>
            </>
          )}
        </div>
        <div className="q7-botoes">
          <LinkSlide slug="c7p1" className="q7-s01-ir">Mapa</LinkSlide>
          <LinkSlide slug="c7p38" className="q7-s01-ir">Caso integrador</LinkSlide>
          <Botao sec onClick={() => setS(null)}>Restaurar</Botao>
        </div>
      </Painel>
    </Quadro>
  );
}

"use client";
import { useState, type ReactNode } from "react";
import { Botao, caminho, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Dim, type Pagina } from "../base";
import { ANCORA, D, EAD, N, PG, PL, PT, RES, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, faixasQuantis, jeffreys, slopeComIntervalo, Z95 } from "@/lib/capitulo7/metricas";
import { curva, esperado, fmtReais, GRADE_CORTES, otimo, realizado } from "@/lib/visuais/economia";
import { int, num, pct, reais } from "@/lib/capitulo7/formato";
import { N_JANELAS, SEMENTE_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";

/**
 * 36 · c7p38 · Caso integrador. O comitê recebe o boosting com Platt como candidato a substituir a logística. O dossiê
 * são quatro miniaturas sempre visíveis, uma por pergunta: AUC com o IC de DeLong dos dois modelos; curvas de
 * confiabilidade sobrepostas; curvas de resultado esperado com o corte e o realizado; AUC no treino, na validação e na
 * janela. Consultar um cartão abre a leitura com os números; a decisão só abre depois de três consultas, e cada
 * alternativa errada devolve a confusão que revela, com os números dos cartões. No cartão Probabilidade, o teste de
 * Jeffreys dos dois modelos: para a logística, a cauda de subestimação (p = F_Beta(PD)); para o candidato, que
 * superestima, a cauda oposta (1 − p), uma adaptação declarada na tela. As janelas novas são as de janelas.ts, as
 * mesmas dos slides 33 e 35. Rodada 2: a decisão certa é manter a logística, recalibrar o nível em amostra própria e
 * confirmar numa janela nova; a evidência é a perda esperada dos calibradores (calibradores de janelas.ts): intercepto e
 * Platt melhoram em expectativa e a janela de 81 defaults não escolhe entre eles. Na miniatura de decisão, os dois
 * realizados ficam lado a lado no corte, com rótulo direto. Rodada 3: os rótulos das miniaturas Decisão e
 * Probabilidade saem de cima das curvas e vão para uma coluna ao lado; slope e ICs vão para a leitura do cartão; a
 * decisão compara os modelos também pela PD verdadeira (o realizado de 81 defaults é ruidoso, slide 32); as quatro
 * alternativas têm o mesmo tamanho, para a certa não se denunciar pelo comprimento. Rodada 4: a decisão diz de onde
 * vem a amostra do nível. A taxa de default oscila entre treino, validação e janela; o intercepto ancorado em várias
 * safras maturadas antes da janela (treino e validação, ANCORA de dados.ts) leva a PD média da janela perto do
 * observado, e o ancorado só na validação passa do observado. Decisão: manter a logística, ancorar o nível em várias
 * safras, monitorar cada safra com Jeffreys e confirmar nas safras de 2024 quando maturarem. As janelas novas viram
 * réplicas sintéticas da janela. Rodada 5: a âncora do nível não se escolhe pela janela. Pela PD verdadeira média da
 * janela (só na base sintética), o intercepto da última safra e o de várias safras erram por cerca de 1 ponto, em
 * lados opostos; a amostra sai da finalidade, declarada antes (provisão pela 4.966: nível corrente, a safra maturada
 * mais recente; capital: média de várias safras). Ação: monitorar o O/E por safra com Jeffreys (definido no cartão
 * Probabilidade) e recalibrar o intercepto só quando o teste rejeitar em duas safras seguidas no mesmo sentido
 * (regra do slide 37, retirada na rodada 6). O cartão Validação liga os 13,2% do candidato
 * ao Platt ajustado na validação.
 * Rodada 6: a finalidade do caso fica na tela antes da decisão (provisão de estágio 1 pela 4.966 e corte do slide 32,
 * as duas com nível corrente; a norma não fixa as safras) e, com ela, o que a janela prova (a ordenação). A decisão
 * certa passa a ser manter a logística e recalibrar o nível nas safras maturadas mais recentes, validação e janela
 * (ANCORA.recentes de dados.ts), depois de encerrada a prova; manter sem recalibrar vira a alternativa errada, com o
 * O/E e a rejeição da validação no retorno. O retorno certo e a leitura dizem a mesma ação. Depois do acerto, a tabela
 * de conferência (só na base sintética) põe as quatro âncoras lado a lado: PD média, O/E observado, O/E pela PD
 * verdadeira e perda esperada em reais pelo motor do slide 32, contra a perda pela PD verdadeira. Ela ocupa o
 * painel do dossiê, com um seletor para voltar aos cartões, e abre com uma régua da PD média de cada âncora contra a
 * PD verdadeira e a taxa observada da janela.
 */
type P = "ord" | "prob" | "dec" | "val";
const DL = delong(Y, PL, PG);
const CAL_L = calibracaoGlobal(Y, PL), CAL_G = calibracaoGlobal(Y, PG);
const SL_L = slopeComIntervalo(Y, PL), SL_G = slopeComIntervalo(Y, PG);
/** os intervalos de Wald dos dois slopes contêm 1? (com 81 defaults, a inclinação não se distingue) */
const COM1 = [SL_L, SL_G].every((q) => q.ic[0] <= 1 && q.ic[1] >= 1);
const J_L = jeffreys(D, N, CAL_L.pdMedia!), J_G = 1 - jeffreys(D, N, CAL_G.pdMedia!);
const F_L = faixasQuantis(Y, PL, 10), F_G = faixasQuantis(Y, PG, 10);
const real = (p: readonly number[], c: number) => { let s = 0; for (let i = 0; i < N; i++) if (p[i] < c) s += realizado(Y[i], EAD[i]); return s; };
const CORTES = GRADE_CORTES.filter((c) => c <= 0.4);
const CV_L = curva(PL as number[], EAD as number[], CORTES), CV_G = curva(PG as number[], EAD as number[], CORTES);
const OT_L = otimo(CV_L), OT_G = otimo(CV_G);
const R_L = real(PL, OT_L.corte), R_G = real(PG, OT_G.corte);
/** O que os aprovados de cada modelo valem em média, pela PD verdadeira: sem a sorte dos 81 defaults da janela. */
const verd = (p: readonly number[], c: number) => { let s = 0; for (let i = 0; i < N; i++) if (p[i] < c) s += esperado(PT[i], EAD[i]); return s; };
const V_L = verd(PL, OT_L.corte), V_G = verd(PG, OT_G.corte);
const OBS = D / N;
const AUCS = { l: [RES.logit_treino.auc, RES.logit_val.auc, DL.auc1], g: [RES.gbm_treino.auc, RES.gbm_val.auc, DL.auc2] };
const AN = ANCORA;
/** as quatro âncoras do nível, na ordem do slide 27 */
const LINHAS_AN: [string, { pdMedia: number; oe: number; oeVerd: number; perda: number }, boolean][] = [
  ["Sem recalibrar (treino)", AN.sem, false], ["Validação", AN.soValidacao, false], ["Treino e validação", AN.variasSafras, false], ["Validação e janela", AN.recentes, true],
];
const mil = (v: number) => reais(v).replace("R$ ", "").replace(" mil", "");
const CERTA = 2;
const COR: Record<P, string> = { ord: "#3D5A8A", prob: "#176C73", dec: "#A85A0C", val: "#2E6B4F" };

/* miniaturas: logística sempre traço cheio e disco; candidato tracejado e quadrado vazado, na cor da pergunta */
function MiniOrd({ d }: { d: Dim }) {
  const fs = d.fs, x = escala([0.6, 0.8], [fs * 5.2, d.w - fs * 3.6]);
  const linhas = [{ r: "Logística", auc: DL.auc1, ep: DL.ep1, l: true }, { r: "Candidato", auc: DL.auc2, ep: DL.ep2, l: false }];
  const y0 = fs * 1.4, dy = (d.h - fs * 3.4) / 2;
  return (
    <g>
      {[0.6, 0.65, 0.7, 0.75, 0.8].map((t) => <g key={t}><line className="q7-grade" x1={x(t)} x2={x(t)} y1={y0 - fs * 0.6} y2={y0 + dy * 2 - fs * 0.4} /><text className="q7-tick" x={x(t)} y={y0 + dy * 2} dy=".9em" textAnchor="middle">{num(t, 2)}</text></g>)}
      {linhas.map((L, i) => { const cy = y0 + dy * i + dy / 2; return (
        <g key={L.r}>
          <text className="q7-rot--peq" x={0} y={cy} dy=".35em" style={{ fill: "#2A3342" }}>{L.r}</text>
          <line x1={x(L.auc - Z95 * L.ep)} x2={x(L.auc + Z95 * L.ep)} y1={cy} y2={cy} stroke={COR.ord} strokeWidth={3} strokeDasharray={L.l ? undefined : "6 4"} />
          {L.l ? <circle cx={x(L.auc)} cy={cy} r={fs * 0.42} fill={COR.ord} /> : <rect x={x(L.auc) - fs * 0.36} y={cy - fs * 0.36} width={fs * 0.72} height={fs * 0.72} fill="#fff" stroke={COR.ord} strokeWidth={2.5} />}
          <text className="q7-rot--peq" x={x(L.auc + Z95 * L.ep) + fs * 0.35} y={cy} dy=".35em" style={{ fill: COR.ord, fontWeight: 700 }}>{num(L.auc, 4)}</text>
        </g>
      ); })}
    </g>
  );
}
function MiniProb({ d }: { d: Dim }) {
  const fs = d.fs, lado = Math.min(d.h - fs * 0.9, d.w * 0.56), x0 = fs * 2.2, max = 0.3;
  const x = escala([0, max], [x0, x0 + lado]), y = escala([0, max], [fs * 0.4 + lado, fs * 0.4]);
  const pts = (f: typeof F_L) => f.filter((q) => q.pdMedia !== null && q.obs !== null).map((q) => ({ x: x(Math.min(max, q.pdMedia!)), y: y(Math.min(max, q.obs!)) }));
  const tx = x0 + lado + fs * 0.9;
  return (
    <g>
      <rect x={x(0)} y={y(max)} width={lado} height={lado} fill="#FBFAF7" stroke="#E2DFD6" />
      <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(max)} y2={y(max)} />
      <text className="q7-tick" x={x(0)} y={y(0)} dx="-.3em" dy=".35em" textAnchor="end">0</text>
      <text className="q7-tick" x={x(0)} y={y(max)} dx="-.3em" dy=".7em" textAnchor="end">30%</text>
      <path className="q7-linha q7-linha--fina q7-linha--prob" d={caminho(pts(F_L))} />
      <path className="q7-linha q7-linha--fina q7-linha--prob" strokeDasharray="6 4" d={caminho(pts(F_G))} />
      {pts(F_L).map((p, i) => <circle key={`l${i}`} cx={p.x} cy={p.y} r={fs * 0.22} fill={COR.prob} />)}
      {pts(F_G).map((p, i) => <rect key={`g${i}`} x={p.x - fs * 0.2} y={p.y - fs * 0.2} width={fs * 0.4} height={fs * 0.4} fill="#fff" stroke={COR.prob} strokeWidth={2} />)}
      {tx + fs * 6 < d.w && <>
        <text className="q7-rot--peq" x={tx} y={fs * 1.2} style={{ fill: COR.prob, fontWeight: 700 }}>● logística: PD {pct(CAL_L.pdMedia!, 1)}</text>
        <text className="q7-rot--peq" x={tx} y={fs * 2.45} style={{ fill: COR.prob, fontWeight: 700 }}>□ candidato: PD {pct(CAL_G.pdMedia!, 1)}</text>
        <text className="q7-rot--peq" x={tx} y={fs * 3.7} style={{ fill: "#2A3342" }}>observado: {pct(OBS, 1)}</text>
      </>}
    </g>
  );
}
function MiniDec({ d }: { d: Dim }) {
  const fs = d.fs; const vals = [...CV_L, ...CV_G].map((q) => q.parcelas.total); const lo = Math.min(0, ...vals), hi = Math.max(...vals, R_L, R_G);
  // a curva fica à esquerda; os números do corte, numa coluna à direita, longe das linhas
  const largo = d.w > fs * 22, xR = largo ? d.w - fs * 10.6 : d.w - fs * 0.6;
  const x = escala([0, 0.4], [fs * 3.4, xR]), y = escala([lo, hi * 1.08], [d.h - fs * 1.6, fs * 0.5]);
  const c = OT_L.corte, tx = xR + fs * 0.9;
  const mil = (v: number) => fmtReais(v).replace("R$ ", "").replace(" mil", "");
  return (
    <g>
      <line className="q7-eixo" x1={x(0)} x2={x(0.4)} y1={y(lo)} y2={y(lo)} />
      {[0, 0.2, 0.4].map((t) => <text key={t} className="q7-tick" x={x(t)} y={y(lo)} dy="1em" textAnchor="middle">{pct(t, 0)}</text>)}
      {[3e5, 6e5].filter((v) => v >= lo && v <= hi * 1.08).map((v) => <text key={v} className="q7-tick" x={x(0)} y={y(v)} dx="-.3em" dy=".35em" textAnchor="end">{fmtReais(v).replace("R$ ", "")}</text>)}
      <path className="q7-linha q7-linha--fina q7-linha--prob" d={caminho(CV_L.map((q) => ({ x: x(q.corte), y: y(q.parcelas.total) })))} />
      <path className="q7-linha q7-linha--fina q7-linha--prob" strokeDasharray="6 4" d={caminho(CV_G.map((q) => ({ x: x(q.corte), y: y(q.parcelas.total) })))} />
      <line className="q7-corte" x1={x(c)} x2={x(c)} y1={y(lo)} y2={fs * 0.3} />
      {[{ v: R_L, l: true }, { v: R_G, l: false }].map((r) => { const cx = x(c) + (r.l ? -fs * 0.5 : fs * 0.5); return (
        <path key={String(r.l)} d={`M${cx} ${y(r.v) - fs * 0.38}l${fs * 0.38} ${fs * 0.38}l${-fs * 0.38} ${fs * 0.38}l${-fs * 0.38} ${-fs * 0.38}z`} fill={r.l ? "#00205B" : "#fff"} stroke="#00205B" strokeWidth={2} />
      ); })}
      {largo && <>
        <text className="q7-rot--peq" x={tx} y={fs * 1.1} style={{ fill: COR.dec, fontWeight: 700 }}>corte {pct(c, 1)}, mil R$</text>
        <text className="q7-rot--peq" x={tx} y={fs * 2.4} style={{ fill: COR.prob, fontWeight: 700 }}>esperado: ● {mil(OT_L.parcelas.total)}, □ {mil(OT_G.parcelas.total)}</text>
        <text className="q7-rot--peq" x={tx} y={fs * 3.7} style={{ fill: "#00205B", fontWeight: 700 }}>realizado: ◆ {mil(R_L)}, ◇ {mil(R_G)}</text>
      </>}
    </g>
  );
}
function MiniVal({ d }: { d: Dim }) {
  const fs = d.fs, xs = [fs * 3.2, d.w * 0.5, d.w - fs * 4.4], y = escala([0.62, 0.84], [d.h - fs * 1.6, fs * 0.6]);
  const rot = ["Treino", "Validação", "Janela"];
  return (
    <g>
      {[0.65, 0.75].map((t) => <g key={t}><line className="q7-grade" x1={xs[0]} x2={xs[2]} y1={y(t)} y2={y(t)} /><text className="q7-tick" x={xs[0]} y={y(t)} dx="-.3em" dy=".35em" textAnchor="end">{num(t, 2)}</text></g>)}
      {rot.map((r, i) => <text key={r} className="q7-tick" x={xs[i]} y={d.h - fs * 1.6} dy="1.1em" textAnchor="middle">{r}</text>)}
      <path className="q7-linha q7-linha--fina q7-linha--val" d={caminho(AUCS.l.map((a, i) => ({ x: xs[i], y: y(a) })))} />
      <path className="q7-linha q7-linha--fina q7-linha--val" strokeDasharray="6 4" d={caminho(AUCS.g.map((a, i) => ({ x: xs[i], y: y(a) })))} />
      {AUCS.l.map((a, i) => <circle key={`l${i}`} cx={xs[i]} cy={y(a)} r={fs * 0.26} fill={COR.val} />)}
      {AUCS.g.map((a, i) => <rect key={`g${i}`} x={xs[i] - fs * 0.24} y={y(a) - fs * 0.24} width={fs * 0.48} height={fs * 0.48} fill="#fff" stroke={COR.val} strokeWidth={2} />)}
      <text className="q7-rot--peq" x={xs[0] + fs * 0.5} y={y(AUCS.g[0])} dy=".35em" style={{ fill: COR.val, fontWeight: 700 }}>{num(AUCS.g[0], 4)}</text>
      <text className="q7-rot--peq" x={xs[2] + fs * 0.5} y={y(AUCS.l[2])} dy=".35em" style={{ fill: COR.val, fontWeight: 700 }}>{num(AUCS.l[2], 4)}</text>
      <text className="q7-rot--peq" x={xs[2] + fs * 0.5} y={y(AUCS.g[2])} dy=".7em" style={{ fill: COR.val, fontWeight: 700 }}>{num(AUCS.g[2], 4)}</text>
    </g>
  );
}

/** régua da conferência: PD média de cada âncora na janela, contra a PD verdadeira e a taxa observada */
function ReguaNivel({ d }: { d: Dim }) {
  const fs = d.fs, vals = [...LINHAS_AN.map((l) => l[1].pdMedia), AN.ptJanela, OBS];
  const lo = Math.floor(Math.min(...vals) * 100) / 100, hi = Math.ceil(Math.max(...vals) * 100) / 100;
  const x = escala([lo, hi], [fs * 1.2, d.w - fs * 1.2]);
  // de baixo para cima: marcas do eixo, eixo, duas fileiras de rótulos das âncoras (alternadas pela ordem da PD) e, no topo, a PD verdadeira
  const cy = d.h - fs * 1.7, filas = [cy - fs * 0.85, cy - fs * 2.05];
  const ticks: number[] = []; for (let t = lo; t <= hi + 1e-9; t += 0.01) ticks.push(Math.round(t * 100) / 100);
  const ordem = LINHAS_AN.map((l, i) => ({ l, i })).sort((a, b) => a.l[1].pdMedia - b.l[1].pdMedia);
  const ancora = (xv: number) => (xv > d.w - fs * 5 ? "end" : xv < fs * 5 ? "start" : "middle");
  return (
    <g>
      <line className="q7-eixo" x1={x(lo)} x2={x(hi)} y1={cy} y2={cy} />
      {ticks.map((t) => <text key={t} className="q7-tick" x={x(t)} y={d.h - fs * 0.2} textAnchor="middle">{pct(t, 0)}</text>)}
      <line x1={x(AN.ptJanela)} x2={x(AN.ptJanela)} y1={fs * 0.3} y2={cy + fs * 0.6} stroke="#00205B" strokeWidth={2} strokeDasharray="6 4" />
      <text className="q7-rot--peq" x={x(AN.ptJanela) + fs * 0.3} y={fs * 1} style={{ fill: "#00205B", fontWeight: 700 }}>PD verdadeira {pct(AN.ptJanela, 1)}</text>
      <line x1={x(OBS)} x2={x(OBS)} y1={cy - fs * 0.6} y2={cy + fs * 0.6} stroke="#5B6475" strokeWidth={2.5} />
      <text className="q7-rot--peq" x={x(OBS) - fs * 0.3} y={filas[0]} textAnchor="end" style={{ fill: "#5B6475" }}>observado {pct(OBS, 1)}</text>
      {ordem.map(({ l: [r, a, on] }, k) => { const xv = x(a.pdMedia); return (
        <g key={r}>
          <circle cx={xv} cy={cy} r={fs * 0.42} fill={on ? COR.prob : "#fff"} stroke={COR.prob} strokeWidth={2.5} />
          <text className="q7-rot--peq" x={xv} y={filas[k % 2]} textAnchor={ancora(xv)} style={{ fill: on ? COR.prob : "#2A3342", fontWeight: on ? 700 : 400, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{r.replace(" (treino)", "")} {pct(a.pdMedia, 1)}</text>
        </g>
      ); })}
    </g>
  );
}

type Cartao = { k: P; t: string; s: string; mini: (d: Dim) => ReactNode; rot: string };
const CARTOES: Cartao[] = [
  { k: "ord", t: "Ordenação", s: "●", mini: (d) => <MiniOrd d={d} />, rot: `AUC na janela com IC de DeLong: logística ${num(DL.auc1, 4)}, candidato ${num(DL.auc2, 4)}` },
  { k: "prob", t: "Probabilidade", s: "▲", mini: (d) => <MiniProb d={d} />, rot: `Confiabilidade por decis: PD média da logística ${pct(CAL_L.pdMedia!, 1)}, do candidato ${pct(CAL_G.pdMedia!, 1)}, observado ${pct(OBS, 1)}` },
  { k: "dec", t: "Decisão", s: "◆", mini: (d) => <MiniDec d={d} />, rot: `Resultado esperado por corte; corte de ${pct(OT_L.corte, 1)} nos dois; realizado ${fmtReais(R_L)} na logística e ${fmtReais(R_G)} no candidato` },
  { k: "val", t: "Validação", s: "■", mini: (d) => <MiniVal d={d} />, rot: `AUC no treino, na validação e na janela: logística ${AUCS.l.map((a) => num(a, 4)).join(", ")}; candidato ${AUCS.g.map((a) => num(a, 4)).join(", ")}` },
];

export function S36CasoIntegrador({ pagina }: { pagina?: Pagina }) {
  const [vistos, setVistos] = useState<P[]>([]);
  const [esc, setEsc] = useState<number | null>(null);
  const [vista, setVista] = useState<"dossie" | "conf">("dossie");
  const decidir = (i: number | null) => { setEsc(i); setVista(i === CERTA ? "conf" : "dossie"); };
  const conf = esc === CERTA && vista === "conf";
  const [jn] = useState(() => vantagemEmJanelasNovas());
  const liberado = vistos.length >= 3;
  const consultar = (k: P) => { if (!vistos.includes(k)) setVistos([...vistos, k]); };
  const leitura: Record<P, ReactNode> = {
    ord: <>Logística melhor nesta janela (p = {num(DL.p, 3)}); nas {N_JANELAS} réplicas sintéticas da janela, a vantagem esperada cai a {num(jn.vantagem, 4)}.</>,
    prob: <>Jeffreys (unilateral, PD média contra os defaults observados, priori de Jeffreys, BCE): candidato O/E {num(CAL_G.razaoOE!, 3)}, 1 − p = {num(J_G, 3)}; logística p = {num(J_L, 2)}. Slopes {num(SL_L.slope, 2)} e {num(SL_G.slope, 2)}, {COM1 ? "ICs com 1" : "IC sem o 1"}.</>,
    dec: <>Corte {pct(OT_L.corte, 1)}, pela PD verdadeira: □ {fmtReais(V_G)}, ● {fmtReais(V_L)}. O □ prometia {fmtReais(OT_G.parcelas.total)}.</>,
    val: <>Treino {num(AUCS.g[0], 4)}, janela {num(AUCS.g[2], 4)}: sobreajuste e mudança entre safras. O Platt foi ajustado na validação, que teve {pct(RES.gbm_val.obs, 1)} de default: por isso o candidato prevê {pct(CAL_G.pdMedia!, 1)}.</>,
  };
  return (
    <Quadro slug="c7p38" pagina={pagina} layout="gl"
      conclusao={esc === null ? <>O comitê recebe o boosting com Platt para substituir a logística. Leia as quatro miniaturas e consulte pelo menos três cartões antes de decidir. {vistos.length ? `Consultados: ${vistos.length} de 4.` : ""}</>
        : esc === CERTA ? <><b>Manter a logística</b> (AUC {num(DL.auc1, 4)} contra {num(DL.auc2, 4)}, p = {num(DL.p, 3)}) <b>e recalibrar o intercepto em validação e janela: a PD média vai de {pct(AN.sem.pdMedia, 1)} a {pct(AN.recentes.pdMedia, 1)}.</b> A regra veio antes, da finalidade; a tabela é conferência. Daqui em diante, Jeffreys no acumulado desde a calibração (<LinkSlide slug="c7p20">slide 37</LinkSlide>).</>
          : <>Revise a evidência: a decisão escolhida ignora pelo menos uma das quatro perguntas. Tente outra.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. IC de DeLong; Jeffreys com a PD média (o do BCE testa subestimação; a cauda oposta, para o candidato, é adaptação); slope com IC de Wald; motor do slide 32. Réplicas sintéticas da janela: ${N_JANELAS} sorteios do desfecho pela PD verdadeira (semente ${SEMENTE_JANELAS}). Nível: intercepto que zera a equação de escore da janela somada à da validação agregada (aproximação, slide 27); perda esperada Σ PD × ${pct(AN.lgd, 0)} × EAD; PD verdadeira só na base sintética.`}>
      <Painel titulo={conf ? "Conferência do nível: só na base sintética, não é prova" : "Dossiê: logística (● cheio) contra candidato (□ vazado)"}>
        {esc === CERTA && <div className="q7-s36-vista"><Seg rotulo="O que ver" opcoes={[{ v: "dossie" as const, r: "Dossiê" }, { v: "conf" as const, r: "Conferência do nível" }]} valor={vista} onChange={setVista} /></div>}
        {conf ? (
          <div className="q7-s36-conf">
            <Grafico rotulo={`PD média na janela por âncora do nível: ${LINHAS_AN.map(([r, a]) => `${r} ${pct(a.pdMedia, 1)}`).join("; ")}; PD verdadeira ${pct(AN.ptJanela, 1)}; observado ${pct(OBS, 1)}`} arCelular="16 / 6">{(d) => <ReguaNivel d={d} />}</Grafico>
            <table className="q7-tab q7-tab--comp q7-s36-t">
              <thead><tr><th className="q7-t-l">Âncora do nível</th><th>PD média</th><th>O/E obs.</th><th>O/E verd.</th><th>Perda esperada, R$ mil</th></tr></thead>
              <tbody>
                {LINHAS_AN.map(([r, a, on]) => <tr key={r} data-on={on ? "1" : undefined}><th>{r}</th><td>{pct(a.pdMedia, 1)}</td><td>{num(a.oe, 3)}</td><td>{num(a.oeVerd, 3)}</td><td>{mil(a.perda)}</td></tr>)}
                <tr className="q7-s36-alvo"><th>PD verdadeira</th><td>{pct(AN.ptJanela, 1)}</td><td>{num(OBS / AN.ptJanela, 3)}</td><td>{num(1, 3)}</td><td>{mil(AN.perdaVerd)}</td></tr>
              </tbody>
            </table>
            <p className="q7-nota">A janela entra na última âncora: o O/E observado dela não testa nada. O/E verd. = PD verdadeira ÷ PD média; perda = Σ PD × {pct(AN.lgd, 0)} × EAD (<LinkSlide slug="c7p18">slide 32</LinkSlide>).</p>
          </div>
        ) : <div className="q7-s36-m">
          {CARTOES.map((c) => {
            const visto = vistos.includes(c.k);
            return (
              <section key={c.k} className="q7-s36-k" data-visto={visto ? "1" : "0"} style={{ borderLeftColor: COR[c.k] }}>
                <button type="button" className="q7-s36-h" aria-expanded={visto} onClick={() => consultar(c.k)}>
                  <span style={{ color: COR[c.k] }} aria-hidden="true">{c.s}</span>{c.t}<em>{visto ? "consultado" : "consultar"}</em>
                </button>
                <Grafico rotulo={c.rot} arCelular="16 / 7">{c.mini}</Grafico>
                {visto && <p className="q7-s36-l">{leitura[c.k]}</p>}
              </section>
            );
          })}
        </div>}
      </Painel>
      <Painel className="q7-s36-dir">
        <div className="q7-s36-fin">
          <p className="q7-k">Declarado antes da janela</p>
          <p><b>Finalidade:</b> PD de 12 meses para a provisão de estágio 1 (Res. CMN 4.966/2021, informação atual e prospectiva) e para o corte do <LinkSlide slug="c7p18">slide 32</LinkSlide>: nível corrente. A norma não fixa as safras.</p>
          <p><b>A janela prova:</b> a ordenação; o nível não entra na escolha do modelo.</p>
        </div>
        {liberado ? (
          <Previsao recolher rotulo="Sua decisão" pergunta="O que o comitê deve fazer?" escolha={esc} onEscolha={decidir}
            opcoes={[
              { certa: false, texto: "Aprovar o boosting com Platt", retorno: <>Confunde modelo novo com modelo melhor: AUC {num(DL.auc2, 4)} contra {num(DL.auc1, 4)} e PD média {pct(CAL_G.pdMedia!, 1)} contra {pct(OBS, 1)} observados.</> },
              { certa: false, texto: "Recalibrar o boosting na janela e aprovar", retorno: <>Usa a prova para ajustar (<LinkSlide slug="c7p16">slide 27</LinkSlide>): depois, a janela não mede mais nada. E recalibrar não tira a AUC de {num(DL.auc2, 4)}.</> },
              { texto: "Manter a logística e recalibrar o nível nas safras recentes", certa: true, retorno: <>Isso. Provada a ordenação, o nível vem das safras maturadas mais recentes, validação e janela: {AN.recentes.defaults} defaults em {int(AN.recentes.n)} ({pct(AN.recentes.taxa, 1)}).</> },
              { certa: false, texto: "Manter a logística sem recalibrar até o monitoramento rejeitar", retorno: <>Deixa em produção um nível que a validação já rejeitava (O/E {num(AN.validacao.oe, 2)}, Jeffreys p = {num(AN.validacao.jeffreys, 3)}); validação e janela juntas também rejeitam (p = {num(AN.recentes.jeffreys, 4)}). Esperar só adia a correção.</> },
            ]} />
        ) : (
          <div className="q7-s36-trava">
            <p className="q7-k">Decisão bloqueada</p>
            <p className="q7-p">Consulte pelo menos três cartões de evidência: <b>{vistos.length} de 4</b>.</p>
            <ul className="q7-nota">{CARTOES.map((c) => <li key={c.k}>{vistos.includes(c.k) ? "■" : "□"} {c.t}</li>)}</ul>
          </div>
        )}
        <div className="q7-botoes q7-s36-rest"><Botao sec onClick={() => { setVistos([]); decidir(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

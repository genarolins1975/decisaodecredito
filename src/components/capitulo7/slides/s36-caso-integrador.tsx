"use client";
import { useState, type ReactNode } from "react";
import { Botao, caminho, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, type Dim, type Pagina } from "../base";
import { D, EAD, N, PG, PL, RES, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, faixasQuantis, jeffreys, slopeComIntervalo, Z95 } from "@/lib/capitulo7/metricas";
import { curva, fmtReais, GRADE_CORTES, otimo, realizado } from "@/lib/visuais/economia";
import { num, pct } from "@/lib/capitulo7/formato";
import { N_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";

/**
 * 36 · c7p38 · Caso integrador. O comitê recebe o boosting com Platt como candidato a substituir a logística. O dossiê
 * são quatro miniaturas sempre visíveis, uma por pergunta: AUC com o IC de DeLong dos dois modelos; curvas de
 * confiabilidade sobrepostas; curvas de resultado esperado com o corte e o realizado; AUC no treino, na validação e na
 * janela. Consultar um cartão abre a leitura com os números; a decisão só abre depois de três consultas, e cada
 * alternativa errada devolve a confusão que revela, com os números dos cartões. No cartão Probabilidade, o teste de
 * Jeffreys dos dois modelos: para a logística, a cauda de subestimação (p = F_Beta(PD)); para o candidato, que
 * superestima, a cauda oposta (1 − p). As janelas novas são as de janelas.ts, as mesmas dos slides 33 e 35.
 */
type P = "ord" | "prob" | "dec" | "val";
const DL = delong(Y, PL, PG);
const CAL_L = calibracaoGlobal(Y, PL), CAL_G = calibracaoGlobal(Y, PG);
const SL_L = slopeComIntervalo(Y, PL), SL_G = slopeComIntervalo(Y, PG);
const J_L = jeffreys(D, N, CAL_L.pdMedia!), J_G = 1 - jeffreys(D, N, CAL_G.pdMedia!);
const F_L = faixasQuantis(Y, PL, 10), F_G = faixasQuantis(Y, PG, 10);
const real = (p: readonly number[], c: number) => { let s = 0; for (let i = 0; i < N; i++) if (p[i] < c) s += realizado(Y[i], EAD[i]); return s; };
const CORTES = GRADE_CORTES.filter((c) => c <= 0.4);
const CV_L = curva(PL as number[], EAD as number[], CORTES), CV_G = curva(PG as number[], EAD as number[], CORTES);
const OT_L = otimo(CV_L), OT_G = otimo(CV_G);
const R_L = real(PL, OT_L.corte), R_G = real(PG, OT_G.corte);
const OBS = D / N;
const AUCS = { l: [RES.logit_treino.auc, RES.logit_val.auc, DL.auc1], g: [RES.gbm_treino.auc, RES.gbm_val.auc, DL.auc2] };
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
  const fs = d.fs, lado = Math.min(d.h - fs * 1.6, d.w * 0.48), x0 = fs * 2.2, max = 0.3;
  const x = escala([0, max], [x0, x0 + lado]), y = escala([0, max], [fs * 0.4 + lado, fs * 0.4]);
  const pts = (f: typeof F_L) => f.filter((q) => q.pdMedia !== null && q.obs !== null).map((q) => ({ x: x(Math.min(max, q.pdMedia!)), y: y(Math.min(max, q.obs!)) }));
  const tx = x0 + lado + fs * 0.8;
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
        <text className="q7-rot--peq" x={tx} y={fs * 1.1} style={{ fill: "#2A3342" }}>PD média, obs. {pct(OBS, 1)}</text>
        <text className="q7-rot--peq" x={tx} y={fs * 2.3} style={{ fill: COR.prob, fontWeight: 700 }}>● logística {pct(CAL_L.pdMedia!, 1)}</text>
        <text className="q7-rot--peq" x={tx} y={fs * 3.4} style={{ fill: COR.prob, fontWeight: 700 }}>□ candidato {pct(CAL_G.pdMedia!, 1)}</text>
        <text className="q7-rot--peq" x={tx} y={fs * 4.7} style={{ fill: "#2A3342" }}>slope {num(SL_L.slope, 2)} (●) e {num(SL_G.slope, 2)} (□)</text>
        <text className="q7-rot--peq" x={tx} y={fs * 5.8} style={{ fill: "#2A3342" }}>ICs {num(SL_L.ic[0], 2)} a {num(SL_L.ic[1], 2)} e {num(SL_G.ic[0], 2)} a {num(SL_G.ic[1], 2)}</text>
      </>}
    </g>
  );
}
function MiniDec({ d }: { d: Dim }) {
  const fs = d.fs; const vals = [...CV_L, ...CV_G].map((q) => q.parcelas.total); const lo = Math.min(0, ...vals), hi = Math.max(...vals, R_L, R_G);
  const x = escala([0, 0.4], [fs * 3.4, d.w - fs * 0.6]), y = escala([lo, hi * 1.1], [d.h - fs * 1.6, fs * 0.5]);
  const c = OT_L.corte;
  return (
    <g>
      <line className="q7-eixo" x1={x(0)} x2={x(0.4)} y1={y(lo)} y2={y(lo)} />
      {[0, 0.2, 0.4].map((t) => <text key={t} className="q7-tick" x={x(t)} y={y(lo)} dy="1em" textAnchor="middle">{pct(t, 0)}</text>)}
      {[3e5, 6e5].filter((v) => v >= lo && v <= hi * 1.1).map((v) => <text key={v} className="q7-tick" x={x(0)} y={y(v)} dx="-.3em" dy=".35em" textAnchor="end">{fmtReais(v).replace("R$ ", "")}</text>)}
      <path className="q7-linha q7-linha--fina q7-linha--prob" d={caminho(CV_L.map((q) => ({ x: x(q.corte), y: y(q.parcelas.total) })))} />
      <path className="q7-linha q7-linha--fina q7-linha--prob" strokeDasharray="6 4" d={caminho(CV_G.map((q) => ({ x: x(q.corte), y: y(q.parcelas.total) })))} />
      <line className="q7-corte" x1={x(c)} x2={x(c)} y1={y(lo)} y2={fs * 0.3} />
      <text className="q7-corte-t" x={x(c) + fs * 0.35} y={y(lo) - fs * 0.4}>corte {pct(c, 1)}</text>
      {[{ v: R_L, l: true }, { v: R_G, l: false }].map((r) => <path key={String(r.l)} d={`M${x(c)} ${y(r.v) - fs * 0.38}l${fs * 0.38} ${fs * 0.38}l${-fs * 0.38} ${fs * 0.38}l${-fs * 0.38} ${-fs * 0.38}z`} fill={r.l ? "#00205B" : "#fff"} stroke="#00205B" strokeWidth={2} />)}
      <text className="q7-rot--peq" x={x(c) - fs * 0.7} y={y(Math.max(R_L, R_G))} dy=".35em" textAnchor="end" style={{ fill: "#00205B", fontWeight: 700 }}>realizado ◆</text>
      <text className="q7-rot--peq" x={x(0.4)} y={y(CV_L[CV_L.length - 1].parcelas.total) - fs * 0.5} textAnchor="end" style={{ fill: COR.prob }}>esperado pela PD</text>
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
  const [jn] = useState(() => vantagemEmJanelasNovas());
  const liberado = vistos.length >= 3;
  const consultar = (k: P) => { if (!vistos.includes(k)) setVistos([...vistos, k]); };
  const leitura: Record<P, ReactNode> = {
    ord: <>A logística ordena melhor nesta janela (p = {num(DL.p, 3)}); em {N_JANELAS} janelas novas, a vantagem cai a {num(jn.vantagem, 4)}.</>,
    prob: <>Candidato superestima: O/E {num(CAL_G.razaoOE!, 3)}, Jeffreys na cauda oposta, 1 − p = {num(J_G, 3)}. Logística baixa, sem prova: p = {num(J_L, 2)}.</>,
    dec: <>Mesmo corte: o candidato promete {fmtReais(OT_G.parcelas.total)} e realiza {fmtReais(R_G)}; a logística, {fmtReais(OT_L.parcelas.total)} e {fmtReais(R_L)}.</>,
    val: <>Do treino ({num(AUCS.g[0], 4)}) à janela ({num(AUCS.g[2], 4)}): sobreajuste; o Platt usou a validação já gasta.</>,
  };
  return (
    <Quadro slug="c7p38" pagina={pagina} layout="gl"
      conclusao={esc === null ? <>O comitê recebe o boosting com Platt para substituir a logística. Leia as quatro miniaturas e consulte pelo menos três cartões antes de decidir. {vistos.length ? `Consultados: ${vistos.length} de 4.` : ""}</>
        : esc === 2 ? <>Com os números da tela: AUC {num(DL.auc2, 4)} contra {num(DL.auc1, 4)} (p = {num(DL.p, 3)}); O/E {num(CAL_G.razaoOE!, 3)} no candidato; no corte de {pct(OT_L.corte, 1)}, {fmtReais(R_G)} realizados contra {fmtReais(R_L)}; Platt ajustado na validação já usada. <b>Manter a logística, corrigir o nível dela (<LinkSlide slug="c7p12">slide 28</LinkSlide>) e reavaliar o boosting numa janela nova.</b></>
          : <>Revise a evidência: a decisão escolhida ignora pelo menos uma das quatro perguntas. Tente outra.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Candidato: boosting com Platt do capítulo 6; incumbente: logística do capítulo 4. IC de DeLong; Jeffreys com a PD média da carteira; slope com IC de Wald. Motor econômico do capítulo 8. Janelas novas: ${N_JANELAS} sorteios do desfecho pela PD verdadeira para os mesmos proponentes, só em base sintética.`}>
      <Painel titulo="Dossiê: logística (● cheio) contra candidato (□ vazado)">
        <div className="q7-s36-m">
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
        </div>
      </Painel>
      <Painel>
        {liberado ? (
          <Previsao rotulo="Sua decisão" pergunta="O que o comitê deve fazer?" escolha={esc} onEscolha={setEsc}
            opcoes={[
              { certa: false, texto: "Aprovar o boosting com Platt", retorno: <>Confunde modelo novo com modelo melhor: AUC {num(DL.auc2, 4)} contra {num(DL.auc1, 4)} e PD média {pct(CAL_G.pdMedia!, 1)} contra {pct(OBS, 1)} observados.</> },
              { certa: false, texto: "Recalibrar o boosting na janela e aprovar", retorno: <>Usa a prova para ajustar (<LinkSlide slug="c7p16">slide 27</LinkSlide>): depois, a janela não mede mais nada. E recalibrar não tira a AUC de {num(DL.auc2, 4)}.</> },
              { texto: "Manter a logística, corrigir o nível dela em amostra própria e reavaliar o boosting numa janela nova", certa: true, retorno: "Isso: ordenação sem ganho, probabilidade do candidato fora de nível, janela já usada." },
              { certa: false, texto: "Trocar, porque a diferença de AUC é pequena", retorno: <>Diferença pequena não prova equivalência, e o ônus é de quem substitui; em janelas novas, a vantagem esperada ({num(jn.vantagem, 4)}) ainda é da logística.</> },
            ]} />
        ) : (
          <div className="q7-s36-trava">
            <p className="q7-k">Decisão bloqueada</p>
            <p className="q7-p">Consulte pelo menos três cartões de evidência: <b>{vistos.length} de 4</b>.</p>
            <ul className="q7-nota">{CARTOES.map((c) => <li key={c.k}>{vistos.includes(c.k) ? "■" : "□"} {c.t}</li>)}</ul>
          </div>
        )}
        <div className="q7-botoes"><Botao sec onClick={() => { setVistos([]); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

"use client";
import { useState } from "react";
import { Botao, escala, Grafico, Legenda, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PG, PGR, PL, RES, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, interceptoESlope } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";
import { aucsEmJanelasNovas, N_JANELAS, SEMENTE_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";

/**
 * 34 · c7p15 · Comparação justa. Logística e boosting medidos no treino, na validação e na janela fora do tempo, com
 * os resultados do gerador (RES; treino e validação só existem agregados, sem vetores por proposta, então sem
 * intervalo). Na janela, as métricas são recalculadas aqui a partir das PDs por proposta, com intervalo de DeLong. A
 * árvore do capítulo 5 não tem previsões salvas na janela e fica fora da tabela: limitação declarada, não omissão.
 * O quadro é um experimento: o aluno escolhe em que amostra cada modelo é medido e vê a diferença comparada mudar;
 * só a escolha da mesma amostra para os dois é marcada como comparação justa. Rodada 2: o boosting deixa o petróleo
 * (papel da probabilidade) e passa ao cinza de modelo, com o quadrado como símbolo; a leitura da janela traz a vantagem
 * esperada em janelas novas do slide 33 (vantagemEmJanelasNovas de janelas.ts). Rodada 3: a peça da janela ganha a
 * diferença pareada com o IC de DeLong (delong de metricas.ts, com a covariância entre os dois modelos); os ICs de cada
 * modelo ficam esmaecidos, porque compará-los superestima a incerteza da diferença. A leitura conta em quantas janelas
 * novas o boosting empata ou vence (aucsEmJanelasNovas). Rodada 4: o veredito tem níveis. Mesma amostra na janela fora
 * do tempo é justa (verde, ✓); no treino é viciada, porque o boosting aprendeu nela (vinho, ✕); na validação é otimista
 * para o escolhido, porque ela serviu para escolher o boosting (âmbar, !); amostras diferentes são injustas (vinho, ✕).
 * A ligação no gráfico segue a cor e o traço do nível. As janelas novas viram réplicas sintéticas da janela.
 */
type Onde = "treino" | "val" | "oot";
type Nivel = "justa" | "otimista" | "viciada" | "injusta";
const VEREDITO: Record<Nivel, { s: string; t: string; g: string; cor: string; traco?: string }> = {
  justa: { s: "✓", t: "Justa: mesmos casos, nenhuma escolha.", g: "mesma amostra, justa", cor: "#2E6B4F" },
  otimista: { s: "!", t: "Otimista: mesmos casos, usados para escolher o boosting.", g: "mesma amostra, otimista", cor: "#A85A0C", traco: "3 4" },
  viciada: { s: "✕", t: "Viciada: o boosting aprendeu nesses casos (sobreajuste).", g: "mesma amostra, viciada", cor: "#8C2332", traco: "8 5" },
  injusta: { s: "✕", t: "Injusta: amostras diferentes.", g: "amostras diferentes", cor: "#8C2332", traco: "8 5" },
};
const FUNDO: Record<Nivel, string> = { justa: "var(--q7-val-s)", otimista: "var(--q7-dec-s)", viciada: "var(--q7-def-s)", injusta: "var(--q7-def-s)" };
const Z = 1.959963984540054;
const DL = delong(Y, PL, PGR);
const ROT: Record<Onde, string> = { treino: "Treino", val: "Validação", oot: "Janela fora do tempo" };
const AGG: Record<Onde, { l: typeof RES.logit_oot; g: typeof RES.logit_oot; n: string }> = {
  treino: { l: RES.logit_treino, g: RES.gbm_treino, n: "2.103 propostas, safras 2022-01 a 2023-02" },
  val: { l: RES.logit_val, g: RES.gbm_val, n: "760 propostas, safras 2023-03 a 2023-07" },
  oot: { l: RES.logit_oot, g: RES.gbm_raw_oot, n: `${N} propostas, safras 2023-08 a 2023-12` },
};
const OOT = [
  { nome: "Logística", p: PL, ep: DL.ep1, auc: DL.auc1, r: RES.logit_oot },
  { nome: "Boosting sem recalibrar", p: PGR, ep: DL.ep2, auc: DL.auc2, r: RES.gbm_raw_oot },
  { nome: "Boosting com Platt", p: PG, ep: DL.ep2, auc: DL.auc2, r: RES.gbm_platt_oot },
].map((m) => ({ ...m, oe: calibracaoGlobal(Y, m.p).razaoOE!, slope: interceptoESlope(Y, m.p).slope }));

export function S34ComparacaoJusta({ pagina }: { pagina?: Pagina }) {
  const [ol, setOl] = useState<Onde>("oot");
  const [og, setOg] = useState<Onde>("oot");
  // réplicas sintéticas da janela: sorteio sob demanda, ao abrir o slide (nunca no carregamento do módulo)
  const [jn] = useState(() => { const v = vantagemEmJanelasNovas(), al = aucsEmJanelasNovas(PL), ag = aucsEmJanelasNovas(PGR); let boost = 0; for (let b = 0; b < al.length; b++) if (ag[b] >= al[b]) boost++; return { ...v, boost }; });
  const justa = ol === og, L = AGG[ol].l, G = AGG[og].g, dif = L.auc - G.auc;
  const nivel: Nivel = !justa ? "injusta" : ol === "oot" ? "justa" : ol === "val" ? "otimista" : "viciada", V = VEREDITO[nivel];
  const ops = (["treino", "val", "oot"] as Onde[]).map((o) => ({ v: o, r: o === "oot" ? "Janela" : ROT[o] }));
  return (
    <Quadro slug="c7p15" pagina={pagina} layout="gl"
      conclusao={!justa ? <>Comparação injusta: logística em {ROT[ol].toLowerCase()} ({num(L.auc, 4)}) contra boosting em {ROT[og].toLowerCase()} ({num(G.auc, 4)}). A diferença de <b>{num(dif, 4)}</b> mistura o modelo com a amostra; nos mesmos casos da janela, ela é {num(DL.dif, 4)}.</>
        : ol === "treino" ? <>No treino, o boosting parece muito melhor: AUC {num(G.auc, 4)} contra {num(L.auc, 4)}. É a amostra em que ele aprendeu; a distância mede sobreajuste, não qualidade.</>
        : ol === "val" ? <>Na validação, os dois quase empatam ({num(G.auc, 4)} contra {num(L.auc, 4)}), e foi nela que o boosting foi escolhido: <b>a medida é otimista para ele</b>. A taxa de default dessa amostra ({pct(L.obs, 1)}) é bem maior que a do treino: as safras mudaram.</>
          : <>Nos mesmos {N} casos, a logística ordena melhor: diferença de <b>{num(DL.dif, 4)}</b>, IC de DeLong [{num(DL.ic[0], 4)}; {num(DL.ic[1], 4)}]. Os intervalos de cada modelo se sobrepõem, e isso não é empate: os dois erram nos mesmos casos (correlação {num(DL.correlacao, 2)}). Nas réplicas sintéticas da janela ({N_JANELAS} sorteios do desfecho pela PD verdadeira, mesmos proponentes), a vantagem esperada é <b>{num(jn.vantagem, 4)}</b>; o boosting empata ou vence em {jn.boost}.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; IC de 95% de DeLong. Treino e validação: agregados do gerador, sem vetores por proposta. Réplicas: ${N_JANELAS} sorteios do desfecho pela PD verdadeira (semente ${SEMENTE_JANELAS}). Árvore do capítulo 5: sem previsões salvas na janela, fica fora.`}>
      <Painel titulo="AUC dos dois modelos em cada amostra">
        <Grafico rotulo={`${(["treino", "val", "oot"] as Onde[]).map((o) => `${ROT[o]}: logística ${num(AGG[o].l.auc, 4)}, boosting ${num(AGG[o].g.auc, 4)}`).join("; ")}. Comparados agora: logística em ${ROT[ol]}, boosting em ${ROT[og]}`} arCelular="4 / 3">
          {(d) => {
            const fs = d.fs, rotL = fs * 7.5, base = d.h * 0.66;
            const x = escala([0.6, 0.85], [rotL, d.w - fs * 1.2]); const linhas: Onde[] = ["treino", "val", "oot"]; const lh = (base - fs * 2.6) / 3;
            const cy = (o: Onde) => linhas.indexOf(o) * lh + lh / 2;
            // a diferença pareada da janela, numa régua própria embaixo: zero marcado, ponto e IC de DeLong
            const xd = escala([-0.04, 0.1], [rotL, d.w - fs * 1.2]), yd = d.h - fs * 2.9, janela = ol === "oot" && og === "oot";
            return (
              <g>
                {[0.6, 0.65, 0.7, 0.75, 0.8, 0.85].map((t) => <g key={t}><line className="q7-grade" x1={x(t)} x2={x(t)} y1={0} y2={base - fs * 2.6} /><text className="q7-tick" x={x(t)} y={base - fs * 2.6} dy="1.2em" textAnchor="middle">{num(t, 2)}</text></g>)}
                <text className="q7-eixo-t" x={(x(0.6) + x(0.85)) / 2} y={base - fs * 0.15} textAnchor="middle">AUC de cada modelo</text>
                {linhas.map((o) => { const y0 = cy(o); const la = AGG[o].l.auc, ga = AGG[o].g.auc; const usaL = o === ol, usaG = o === og; return (
                  <g key={o}>
                    <text className="q7-rot" x={0} y={y0} dy=".35em" style={{ fontWeight: usaL || usaG ? 700 : 400, opacity: usaL || usaG ? 1 : 0.5 }}>{ROT[o].replace("Janela fora do tempo", "Janela")}</text>
                    {o === "oot" && <><line x1={x(la - Z * DL.ep1)} x2={x(la + Z * DL.ep1)} y1={y0 - fs * 0.5} y2={y0 - fs * 0.5} stroke="#00205B" strokeWidth={2} opacity={usaL ? 0.35 : 0.15} /><line x1={x(ga - Z * DL.ep2)} x2={x(ga + Z * DL.ep2)} y1={y0 + fs * 0.5} y2={y0 + fs * 0.5} stroke="#5B6475" strokeWidth={2} opacity={usaG ? 0.35 : 0.15} /></>}
                    <circle cx={x(la)} cy={y0} r={fs * 0.5} fill="#00205B" stroke="#fff" strokeWidth={2} opacity={usaL ? 1 : 0.3} />
                    <rect x={x(ga) - fs * 0.45} y={y0 - fs * 0.45} width={fs * 0.9} height={fs * 0.9} fill="#5B6475" stroke="#fff" strokeWidth={2} opacity={usaG ? 1 : 0.3} />
                  </g>
                ); })}
                <line x1={x(L.auc)} y1={cy(ol)} x2={x(G.auc)} y2={cy(og)} stroke={V.cor} strokeWidth={3} strokeDasharray={V.traco} />
                <text className="q7-rot q7-rot--peq" x={Math.max(x(L.auc), x(G.auc)) > d.w * 0.6 ? Math.max(x(L.auc), x(G.auc)) : Math.min(x(L.auc), x(G.auc))} textAnchor={Math.max(x(L.auc), x(G.auc)) > d.w * 0.6 ? "end" : "start"} y={Math.min(cy(ol), cy(og)) - fs * 1.3} style={{ fill: V.cor, fontWeight: 700 }}>{V.s} {V.g}: diferença {num(Math.abs(dif), 3)}</text>
                <g opacity={janela ? 1 : 0.45}>
                  <line className="q7-eixo" x1={xd(-0.04)} x2={xd(0.1)} y1={yd + fs * 0.9} y2={yd + fs * 0.9} />
                  {[-0.04, 0, 0.04, 0.08].map((t) => <text key={t} className="q7-tick" x={xd(t)} y={yd + fs * 0.9} dy="1.15em" textAnchor="middle">{t > 0 ? "+" : ""}{num(t, 2)}</text>)}
                  <line x1={xd(0)} x2={xd(0)} y1={yd - fs * 1.1} y2={yd + fs * 0.9} stroke="#2A3342" strokeWidth={2} strokeDasharray="4 3" />
                  <text className="q7-rot--peq" x={0} y={yd - fs * 0.5} dy=".35em" style={{ fill: "#2A3342", fontWeight: 700 }}>Logística −</text>
                  <text className="q7-rot--peq" x={0} y={yd + fs * 0.6} dy=".35em" style={{ fill: "#2A3342", fontWeight: 700 }}>boosting</text>
                  <line x1={xd(DL.ic[0])} x2={xd(DL.ic[1])} y1={yd} y2={yd} stroke="#2E6B4F" strokeWidth={fs * 0.4} strokeLinecap="round" />
                  <circle cx={xd(DL.dif)} cy={yd} r={fs * 0.5} fill="#fff" stroke="#2E6B4F" strokeWidth={3} />
                  <text className="q7-rot q7-rot--peq" x={xd(DL.dif)} y={yd - fs * 1.35} textAnchor="middle" style={{ fill: "#2E6B4F", fontWeight: 700 }}>{num(DL.dif, 4)} na janela, IC de DeLong {num(DL.ic[0], 4)} a {num(DL.ic[1], 4)}</text>
                </g>
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "circ ink", r: "logística" }, { mk: "quad mudo", r: "boosting" }, { mk: "linha val", r: "IC 95% da diferença pareada; esmaecidos, os de cada modelo" }]} />
      </Painel>
      <Painel>
        <div className="q7-s34-sel"><span className="q7-k" aria-hidden="true">● Logística em</span><Seg rotulo="Logística medida em" opcoes={ops} valor={ol} onChange={setOl} /></div>
        <div className="q7-s34-sel"><span className="q7-k" aria-hidden="true">■ Boosting em</span><Seg rotulo="Boosting medido em" opcoes={ops} valor={og} onChange={setOg} /></div>
        <p className="q7-s34-v" data-justa={nivel === "justa" ? "1" : "0"} style={{ color: V.cor, borderLeftColor: V.cor, background: FUNDO[nivel] }}><span aria-hidden="true">{V.s} </span>{V.t}</p>
        {justa && ol === "oot" ? (
          <table className="q7-tab q7-tab--comp">
            <thead><tr><th className="q7-t-l">Na janela</th><th>Logística</th><th>Boosting</th><th>Com Platt</th></tr></thead>
            <tbody>
              <tr><th>AUC</th>{OOT.map((m) => <td key={m.nome}>{num(m.auc, 4)}</td>)}</tr>
              <tr><th>Brier</th>{OOT.map((m) => <td key={m.nome}>{num(m.r.brier, 5)}</td>)}</tr>
              <tr><th>Observado ÷ esperado</th>{OOT.map((m) => <td key={m.nome}>{num(m.oe, 3)}</td>)}</tr>
              <tr><th>Slope de calibração</th>{OOT.map((m) => <td key={m.nome}>{num(m.slope, 2)}</td>)}</tr>
            </tbody>
          </table>
        ) : (
          <table className="q7-tab q7-tab--comp">
            <thead><tr><th className="q7-t-l">Métrica</th><th>Logística ({ol === "oot" ? "janela" : ROT[ol].toLowerCase()})</th><th>Boosting ({og === "oot" ? "janela" : ROT[og].toLowerCase()})</th></tr></thead>
            <tbody>
              <tr><th>AUC</th><td>{num(L.auc, 4)}</td><td>{num(G.auc, 4)}</td></tr>
              <tr><th>KS</th><td>{num(L.ks, 4)}</td><td>{num(G.ks, 4)}</td></tr>
              <tr><th>Brier</th><td>{num(L.brier, 5)}</td><td>{num(G.brier, 5)}</td></tr>
              <tr><th>PD média</th><td>{pct(L.pd_media, 2)}</td><td>{pct(G.pd_media, 2)}</td></tr>
              <tr><th>Default observado</th><td>{pct(L.obs, 2)}</td><td>{pct(G.obs, 2)}</td></tr>
            </tbody>
          </table>
        )}
        <p className="q7-nota">{justa ? (ol === "oot" ? "Outra armadilha: " : `${AGG[ol].n}. Outra armadilha: `) : "Taxas observadas diferentes denunciam a troca de amostra. Outra armadilha: "}logística com recusados ({num(RES.logit_populacao_completa_oot.auc, 4)}) contra só aprovados ({num(RES.logit_oot.auc, 4)}) compara populações.</p>
        <div className="q7-botoes"><Botao onClick={() => { setOl("oot"); setOg("treino"); }}>Exemplo injusto</Botao><Botao sec onClick={() => { setOl("oot"); setOg("oot"); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

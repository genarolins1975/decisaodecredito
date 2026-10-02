"use client";
import { useState } from "react";
import { Botao, escala, Grafico, Legenda, LinkSlide, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PG, PGR, PL, RES, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, interceptoESlope } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";
import { vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";

/**
 * 34 · c7p15 · Comparação justa. Logística e boosting medidos no treino, na validação e na janela fora do tempo, com
 * os resultados do gerador (RES; treino e validação só existem agregados, sem vetores por proposta, então sem
 * intervalo). Na janela, as métricas são recalculadas aqui a partir das PDs por proposta, com intervalo de DeLong. A
 * árvore do capítulo 5 não tem previsões salvas na janela e fica fora da tabela: limitação declarada, não omissão.
 * O quadro é um experimento: o aluno escolhe em que amostra cada modelo é medido e vê a diferença comparada mudar;
 * só a escolha da mesma amostra para os dois é marcada como comparação justa. Rodada 2: o boosting deixa o petróleo
 * (papel da probabilidade) e passa ao cinza de modelo, com o quadrado como símbolo; a leitura da janela traz a vantagem
 * esperada em janelas novas do slide 33 (vantagemEmJanelasNovas de janelas.ts).
 */
type Onde = "treino" | "val" | "oot";
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
  const [jn] = useState(() => vantagemEmJanelasNovas());
  const justa = ol === og, L = AGG[ol].l, G = AGG[og].g, dif = L.auc - G.auc;
  const ops = (["treino", "val", "oot"] as Onde[]).map((o) => ({ v: o, r: o === "oot" ? "Janela" : ROT[o] }));
  return (
    <Quadro slug="c7p15" pagina={pagina} layout="gl"
      conclusao={!justa ? <>Comparação injusta: logística em {ROT[ol].toLowerCase()} ({num(L.auc, 4)}) contra boosting em {ROT[og].toLowerCase()} ({num(G.auc, 4)}). A diferença de <b>{num(dif, 4)}</b> mistura o modelo com a amostra; nos mesmos casos da janela, ela é {num(DL.dif, 4)}.</>
        : ol === "treino" ? <>No treino, o boosting parece muito melhor: AUC {num(G.auc, 4)} contra {num(L.auc, 4)}. É a amostra em que ele aprendeu; a distância mede sobreajuste, não qualidade.</>
        : ol === "val" ? <>Na validação, os dois quase empatam ({num(G.auc, 4)} contra {num(L.auc, 4)}) e o boosting foi escolhido. A taxa de default dessa amostra ({pct(L.obs, 1)}) é bem maior que a do treino: as safras mudaram.</>
          : <>Na janela, com os mesmos {N} casos e a mesma pergunta, a logística ordena melhor: diferença de <b>{num(DL.dif, 4)}</b>, IC 95% de DeLong [{num(DL.ic[0], 4)}; {num(DL.ic[1], 4)}], p = {num(DL.p, 3)}. Mas o <LinkSlide slug="c7p14">slide 33</LinkSlide> mostrou que, em janelas novas, a vantagem esperada é só <b>{num(jn.vantagem, 4)}</b>: a ordem entre os modelos muda de amostra para amostra.</>}
      fonte={`Treino e validação: resultados agregados do gerador do curso (semente 20260501), sem vetores por proposta. Janela: ${N} propostas, ${D} defaults, métricas recalculadas e conferidas com scikit-learn. IC da AUC de cada modelo: AUC ± 1,96 × erro padrão de DeLong. Árvore do capítulo 5: sem previsões salvas na janela, fica fora da comparação.`}>
      <Painel titulo="AUC dos dois modelos em cada amostra">
        <Grafico rotulo={`${(["treino", "val", "oot"] as Onde[]).map((o) => `${ROT[o]}: logística ${num(AGG[o].l.auc, 4)}, boosting ${num(AGG[o].g.auc, 4)}`).join("; ")}. Comparados agora: logística em ${ROT[ol]}, boosting em ${ROT[og]}`} arCelular="4 / 3">
          {(d) => {
            const x = escala([0.6, 0.85], [d.fs * 7.5, d.w - d.fs * 1.2]); const linhas: Onde[] = ["treino", "val", "oot"]; const lh = (d.h - d.fs * 3) / 3;
            const cy = (o: Onde) => linhas.indexOf(o) * lh + lh / 2;
            return (
              <g>
                {[0.6, 0.65, 0.7, 0.75, 0.8, 0.85].map((t) => <g key={t}><line className="q7-grade" x1={x(t)} x2={x(t)} y1={0} y2={d.h - d.fs * 2.6} /><text className="q7-tick" x={x(t)} y={d.h - d.fs * 2.6} dy="1.2em" textAnchor="middle">{num(t, 2)}</text></g>)}
                <text className="q7-eixo-t" x={(x(0.6) + x(0.85)) / 2} y={d.h - d.fs * 0.1} textAnchor="middle">AUC</text>
                {linhas.map((o) => { const y0 = cy(o); const la = AGG[o].l.auc, ga = AGG[o].g.auc; const usaL = o === ol, usaG = o === og; return (
                  <g key={o}>
                    <text className="q7-rot" x={0} y={y0} dy=".35em" style={{ fontWeight: usaL || usaG ? 700 : 400, opacity: usaL || usaG ? 1 : 0.5 }}>{ROT[o].replace("Janela fora do tempo", "Janela")}</text>
                    {o === "oot" && <><line x1={x(la - Z * DL.ep1)} x2={x(la + Z * DL.ep1)} y1={y0 - d.fs * 0.5} y2={y0 - d.fs * 0.5} stroke="#00205B" strokeWidth={2.5} opacity={usaL ? 1 : 0.3} /><line x1={x(ga - Z * DL.ep2)} x2={x(ga + Z * DL.ep2)} y1={y0 + d.fs * 0.5} y2={y0 + d.fs * 0.5} stroke="#5B6475" strokeWidth={2.5} opacity={usaG ? 1 : 0.3} /></>}
                    <circle cx={x(la)} cy={y0} r={d.fs * 0.5} fill="#00205B" stroke="#fff" strokeWidth={2} opacity={usaL ? 1 : 0.3} />
                    <rect x={x(ga) - d.fs * 0.45} y={y0 - d.fs * 0.45} width={d.fs * 0.9} height={d.fs * 0.9} fill="#5B6475" stroke="#fff" strokeWidth={2} opacity={usaG ? 1 : 0.3} />
                  </g>
                ); })}
                <line x1={x(L.auc)} y1={cy(ol)} x2={x(G.auc)} y2={cy(og)} stroke={justa ? "#2E6B4F" : "#8C2332"} strokeWidth={3} strokeDasharray={justa ? undefined : "8 5"} />
                <text className="q7-rot q7-rot--peq" x={Math.max(x(L.auc), x(G.auc)) > d.w * 0.6 ? Math.max(x(L.auc), x(G.auc)) : Math.min(x(L.auc), x(G.auc))} textAnchor={Math.max(x(L.auc), x(G.auc)) > d.w * 0.6 ? "end" : "start"} y={Math.min(cy(ol), cy(og)) - d.fs * 1.3} style={{ fill: justa ? "#2E6B4F" : "#8C2332", fontWeight: 700 }}>{justa ? "mesma amostra" : "amostras diferentes"}: diferença {num(Math.abs(dif), 3)}</text>
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "circ ink", r: "logística" }, { mk: "quad mudo", r: "boosting" }, { mk: "", r: "barras na janela: IC 95% de DeLong" }]} />
      </Painel>
      <Painel>
        <div className="q7-s34-sel"><span className="q7-k" aria-hidden="true">● Logística em</span><Seg rotulo="Logística medida em" opcoes={ops} valor={ol} onChange={setOl} /></div>
        <div className="q7-s34-sel"><span className="q7-k" aria-hidden="true">■ Boosting em</span><Seg rotulo="Boosting medido em" opcoes={ops} valor={og} onChange={setOg} /></div>
        <p className="q7-s34-v" data-justa={justa ? "1" : "0"}>{justa ? "Justa: mesmos casos, mesma pergunta." : "Injusta: amostras diferentes."}</p>
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

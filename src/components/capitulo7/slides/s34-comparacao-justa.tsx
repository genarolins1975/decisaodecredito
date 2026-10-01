"use client";
import { useState } from "react";
import { Botao, escala, Grafico, Legenda, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PG, PGR, PL, RES, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, interceptoESlope, precisaoMedia } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 34 · c7p15 · Comparação justa. Logística e boosting medidos no treino, na validação e na janela fora do tempo, com
 * os resultados do gerador (RES; treino e validação só existem agregados, sem vetores por proposta, então sem
 * intervalo). Na janela, as métricas são recalculadas aqui a partir das PDs por proposta, com intervalo de DeLong. A
 * árvore do capítulo 5 não tem previsões salvas na janela e fica fora da tabela: limitação declarada, não omissão.
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
].map((m) => ({ ...m, ap: precisaoMedia(Y, m.p)!, oe: calibracaoGlobal(Y, m.p).razaoOE!, slope: interceptoESlope(Y, m.p).slope }));

export function S34ComparacaoJusta({ pagina }: { pagina?: Pagina }) {
  const [onde, setOnde] = useState<Onde>("oot");
  const a = AGG[onde];
  return (
    <Quadro slug="c7p15" pagina={pagina} layout="gl"
      conclusao={onde === "treino" ? <>No treino, o boosting parece muito melhor: AUC {num(a.g.auc, 4)} contra {num(a.l.auc, 4)}. É a amostra em que ele aprendeu; a distância mede sobreajuste, não qualidade.</>
        : onde === "val" ? <>Na validação, os dois quase empatam ({num(a.g.auc, 4)} contra {num(a.l.auc, 4)}) e o boosting foi escolhido. A taxa de default dessa amostra ({pct(a.l.obs, 1)}) é bem maior que a do treino: as safras mudaram.</>
          : <>Na janela, com os mesmos {N} casos e a mesma pergunta, a logística ordena melhor: diferença de <b>{num(DL.dif, 4)}</b>, IC 95% de DeLong [{num(DL.ic[0], 4)}; {num(DL.ic[1], 4)}], p = {num(DL.p, 3)}. Também tem Brier e log loss menores. A ordem entre os modelos mudou de amostra para amostra.</>}
      fonte={`Treino e validação: resultados agregados do gerador do curso (semente 20260501), sem vetores por proposta. Janela: ${N} propostas, ${D} defaults, métricas recalculadas e conferidas com scikit-learn. IC da AUC de cada modelo: AUC ± 1,96 × erro padrão de DeLong. Árvore do capítulo 5: sem previsões salvas na janela, fica fora da comparação.`}>
      <Painel titulo="AUC dos dois modelos em cada amostra">
        <Grafico rotulo={(["treino", "val", "oot"] as Onde[]).map((o) => `${ROT[o]}: logística ${num(AGG[o].l.auc, 4)}, boosting ${num(AGG[o].g.auc, 4)}`).join("; ")} arCelular="4 / 3">
          {(d) => {
            const x = escala([0.6, 0.85], [d.fs * 7.5, d.w - d.fs * 1.2]); const linhas: Onde[] = ["treino", "val", "oot"]; const lh = (d.h - d.fs * 3) / 3;
            return (
              <g>
                {[0.6, 0.65, 0.7, 0.75, 0.8, 0.85].map((t) => <g key={t}><line className="q7-grade" x1={x(t)} x2={x(t)} y1={0} y2={d.h - d.fs * 2.6} /><text className="q7-tick" x={x(t)} y={d.h - d.fs * 2.6} dy="1.2em" textAnchor="middle">{num(t, 2)}</text></g>)}
                <text className="q7-eixo-t" x={(x(0.6) + x(0.85)) / 2} y={d.h - d.fs * 0.1} textAnchor="middle">AUC</text>
                {linhas.map((o, k) => { const cy = k * lh + lh / 2; const on = o === onde; const L = AGG[o].l.auc, G = AGG[o].g.auc; return (
                  <g key={o} style={{ opacity: on ? 1 : 0.45, cursor: "pointer" }} onClick={() => setOnde(o)}>
                    <text className="q7-rot" x={0} y={cy} dy=".35em" style={{ fontWeight: on ? 700 : 400 }}>{ROT[o].replace("Janela fora do tempo", "Janela OOT")}</text>
                    <line x1={x(Math.min(L, G))} x2={x(Math.max(L, G))} y1={cy} y2={cy} stroke="#C9CDD5" strokeWidth={d.fs * 0.3} />
                    {o === "oot" && <><line x1={x(L - Z * DL.ep1)} x2={x(L + Z * DL.ep1)} y1={cy - d.fs * 0.5} y2={cy - d.fs * 0.5} stroke="#00205B" strokeWidth={2.5} /><line x1={x(G - Z * DL.ep2)} x2={x(G + Z * DL.ep2)} y1={cy + d.fs * 0.5} y2={cy + d.fs * 0.5} stroke="#176C73" strokeWidth={2.5} /></>}
                    <circle cx={x(L)} cy={cy} r={d.fs * 0.5} fill="#00205B" stroke="#fff" strokeWidth={2} />
                    <rect x={x(G) - d.fs * 0.45} y={cy - d.fs * 0.45} width={d.fs * 0.9} height={d.fs * 0.9} fill="#176C73" stroke="#fff" strokeWidth={2} />
                    <text className="q7-rot q7-rot--peq" x={x(Math.min(L, G))} y={cy - d.fs * 1.5}>{G > L ? "boosting à frente" : "logística à frente"} por {num(Math.abs(G - L), 3)}</text>
                  </g>
                ); })}
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "circ ink", r: "logística" }, { mk: "quad prob", r: "boosting" }, { mk: "", r: "barras na janela: IC 95% de DeLong" }]} />
        <Seg rotulo="Amostra" opcoes={[{ v: "treino" as Onde, r: "Treino" }, { v: "val" as Onde, r: "Validação" }, { v: "oot" as Onde, r: "Janela OOT" }]} valor={onde} onChange={setOnde} cor />
      </Painel>
      <Painel>
        {onde === "oot" ? (
          <table className="q7-tab q7-tab--comp">
            <thead><tr><th className="q7-t-l">Na janela</th><th>Logística</th><th>Boosting</th><th>Com Platt</th></tr></thead>
            <tbody>
              <tr><th>AUC</th>{OOT.map((m) => <td key={m.nome}>{num(m.auc, 4)}</td>)}</tr>
              <tr><th>KS</th>{OOT.map((m) => <td key={m.nome}>{num(m.r.ks, 4)}</td>)}</tr>
              <tr><th>Precisão média</th>{OOT.map((m) => <td key={m.nome}>{num(m.ap, 4)}</td>)}</tr>
              <tr><th>Brier</th>{OOT.map((m) => <td key={m.nome}>{num(m.r.brier, 5)}</td>)}</tr>
              <tr><th>Log loss</th>{OOT.map((m) => <td key={m.nome}>{num(m.r.logloss, 4)}</td>)}</tr>
              <tr><th>PD média</th>{OOT.map((m) => <td key={m.nome}>{pct(m.r.pd_media, 2)}</td>)}</tr>
              <tr><th>Observado ÷ esperado</th>{OOT.map((m) => <td key={m.nome}>{num(m.oe, 3)}</td>)}</tr>
              <tr><th>Slope de calibração</th>{OOT.map((m) => <td key={m.nome}>{num(m.slope, 2)}</td>)}</tr>
            </tbody>
          </table>
        ) : (
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">{ROT[onde]}</th><th>Logística</th><th>Boosting</th></tr></thead>
            <tbody>
              <tr><th>AUC</th><td>{num(a.l.auc, 4)}</td><td>{num(a.g.auc, 4)}</td></tr>
              <tr><th>KS</th><td>{num(a.l.ks, 4)}</td><td>{num(a.g.ks, 4)}</td></tr>
              <tr><th>Brier</th><td>{num(a.l.brier, 5)}</td><td>{num(a.g.brier, 5)}</td></tr>
              <tr><th>Log loss</th><td>{num(a.l.logloss, 4)}</td><td>{num(a.g.logloss, 4)}</td></tr>
              <tr><th>PD média</th><td>{pct(a.l.pd_media, 2)}</td><td>{pct(a.g.pd_media, 2)}</td></tr>
              <tr><th>Observado</th><td colSpan={2}>{pct(a.l.obs, 2)}</td></tr>
            </tbody>
          </table>
        )}
        {onde !== "oot" && <p className="q7-nota">{a.n}.</p>}
        <p className="q7-k">Duas comparações injustas</p>
        <ul className="q7-nota q7-s34-inj">
          <li>Boosting no treino ({num(RES.gbm_treino.auc, 4)}) contra logística na janela: amostras diferentes.</li>
          <li>Janela com recusados ({num(RES.logit_populacao_completa_oot.auc, 4)}, default {pct(RES.prevalencia.populacao_oot, 1)}) contra só aprovados ({num(RES.logit_oot.auc, 4)}, {pct(RES.prevalencia.aprovados_oot, 1)}): populações diferentes.</li>
        </ul>
        {onde !== "oot" && <div className="q7-botoes"><Botao sec onClick={() => setOnde("oot")}>Restaurar</Botao></div>}
      </Painel>
    </Quadro>
  );
}

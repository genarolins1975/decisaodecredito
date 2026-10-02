"use client";
import { useState } from "react";
import { Botao, Eixos, escala, Expandir, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { D, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { N_JANELAS, SEMENTE_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";
import { aucPorPares, bootstrapPareado, delong, quantil, Z95 } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 33 · c7p14 · Bootstrap pareado da janela: cada réplica sorteia 737 propostas com reposição e calcula, nas mesmas
 * propostas, a AUC da logística e a do boosting sem recalibrar. Semente 20260501, 1.000 réplicas, intervalo percentil
 * (quantis 2,5% e 97,5%, tipo 7). O quadro abre com as 100 primeiras réplicas já sorteadas (a mesma sequência das
 * 1.000), para que o histograma prove o título sem clique. Depois, uma previsão antes de revelar as janelas novas de
 * janelas.ts (as mesmas dos slides 35 e 36): o bootstrap reamostra a janela que temos e herda a sorte dela.
 */
const SEMENTE = 20260501, REPLICAS = 1000, INICIAIS = 100;
const DL = delong(Y, PL, PGR);
const AUC1 = aucPorPares(Y, PL).auc!, AUC2 = aucPorPares(Y, PGR).auc!;
type Vista = "auc" | "dif";
const CERTA = 1;

function Histograma({ v, dom, passo, ic, ref0, d, real, xt, novas }: { v: number[]; dom: [number, number]; passo: number; xt: number[]; ic: [number, number] | null; ref0: boolean; d: { w: number; h: number; fs: number }; real: number; novas: number | null }) {
  const m = margens(d.fs, { l: 3, b: 2.9, t: 1.6, r: 1 });
  const nb = Math.round((dom[1] - dom[0]) / passo); const cont = new Array(nb).fill(0) as number[];
  for (const x of v) { const k = Math.floor((x - dom[0]) / passo); if (k >= 0 && k < nb) cont[k]++; }
  const passoY = Math.max(5, Math.ceil(Math.max(...cont) / 2 / 5) * 5); const ymax = passoY * 2.2;
  const x = escala(dom, [m.l, d.w - m.r]), y = escala([0, ymax], [d.h - m.b, m.t]);
  return (
    <g>
      <Eixos x={x} y={y} xt={xt} yt={[0, passoY, passoY * 2]} fx={(t) => num(t, 2)} fy={(t) => int(t)} xTit={ref0 ? "AUC logística − AUC boosting" : "AUC da logística"} yTit="Réplicas" />
      {ic && <rect x={x(ic[0])} y={m.t} width={x(ic[1]) - x(ic[0])} height={d.h - m.b - m.t} fill="#2E6B4F" fillOpacity={0.1} />}
      {ic && <text className="q7-rot--peq" x={x(ic[1]) + d.fs * 0.3} y={m.t + d.fs * 2} style={{ fill: "#2E6B4F", fontWeight: 700 }}>IC percentil 95%</text>}
      {cont.map((c, k) => c ? <rect key={k} x={x(dom[0] + k * passo) + 1} y={y(c)} width={Math.max(1, x(dom[0] + (k + 1) * passo) - x(dom[0] + k * passo) - 2)} height={y(0) - y(c)} fill="#3D5A8A" /> : null)}
      {ref0 && <><line x1={x(0)} x2={x(0)} y1={m.t} y2={y(0)} stroke="#5B6475" strokeWidth={2.5} /><text className="q7-rot q7-rot--peq" x={x(0) - d.fs * 0.4} y={m.t + d.fs * 0.6} textAnchor="end" style={{ fill: "#5B6475", fontWeight: 700 }}>diferença zero</text></>}
      <line x1={x(real)} x2={x(real)} y1={m.t - d.fs * 0.6} y2={y(0)} stroke="#00205B" strokeWidth={2.5} strokeDasharray="6 4" />
      <text className="q7-rot--peq" x={x(real)} y={m.t - d.fs * 0.8} textAnchor="middle" style={{ fill: "#00205B", fontWeight: 700 }}>na janela {num(real, 4)}</text>
      {novas !== null && <><line x1={x(novas)} x2={x(novas)} y1={m.t} y2={y(0)} stroke="#2E6B4F" strokeWidth={3} /><text className="q7-rot--peq" x={x(novas) + d.fs * 0.35} y={m.t + d.fs * 0.9} textAnchor="start" style={{ fill: "#2E6B4F", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em" }}>▲ janelas novas {num(novas, 4)}</text></>}
    </g>
  );
}

export function S33Bootstrap({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(INICIAIS);
  const [vista, setVista] = useState<Vista>("dif");
  const [prev, setPrev] = useState<number | null>(null);
  // 100 réplicas no início (barato); as 1.000 só quando o aluno pede. A sequência é a mesma: as 100 são o começo das 1.000.
  const [bs, setBs] = useState(() => bootstrapPareado(Y, PL, PGR, INICIAIS, SEMENTE));
  const [sint] = useState(() => vantagemEmJanelasNovas());
  const revelado = prev === CERTA;
  const ir = (alvo: number) => { const a = Math.min(REPLICAS, alvo); if (a > bs.dif.length) setBs(bootstrapPareado(Y, PL, PGR, REPLICAS, SEMENTE)); setK(a); };
  const v = (vista === "auc" ? bs.a1 : bs.dif).slice(0, k);
  const ord = v.slice().sort((a, b) => a - b);
  const ic: [number, number] | null = ord.length >= 40 ? [quantil(ord, 0.025), quantil(ord, 0.975)] : null;
  const abaixo0 = bs.dif.slice(0, k).filter((x) => x <= 0).length;
  const icDif = (() => { const o = bs.dif.slice(0, k).sort((a, b) => a - b); return [quantil(o, 0.025), quantil(o, 0.975)] as [number, number]; })();
  return (
    <Quadro slug="c7p14" pagina={pagina} layout="gl"
      conclusao={revelado ? <>A base sintética permite repetir a janela: em {N_JANELAS} janelas novas, a vantagem esperada da logística é <b>{num(sint.vantagem, 4)}</b>, não {num(sint.obs, 4)}, e só {sint.acima} repetem a observada. O bootstrap herda a sorte da janela: <b>p = {num(DL.p, 3)} nesta janela não prova que a logística seja melhor em outra.</b> O <LinkSlide slug="c7p15">slide 34</LinkSlide> põe os dois modelos nos mesmos casos, com este intervalo.</>
        : k < REPLICAS ? <>{int(k)} réplicas pareadas: a diferença entre os modelos vai de <b>{num(icDif[0], 4)} a {num(icDif[1], 4)}</b> (percentil 95%), em torno dos {num(AUC1 - AUC2, 4)} observados. Complete as {int(REPLICAS)} e responda à previsão.</>
          : <>Com {int(REPLICAS)} réplicas, a diferença fica entre <b>{num(icDif[0], 4)} e {num(icDif[1], 4)}</b>; {abaixo0} réplicas ficam em zero ou abaixo. DeLong dá [{num(DL.ic[0], 4)}; {num(DL.ic[1], 4)}], p = {num(DL.p, 3)}: nesta janela a vantagem existe, com margem estreita. Agora a previsão.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Bootstrap pareado por proposta, até ${int(REPLICAS)} réplicas, semente ${SEMENTE}; intervalo percentil. DeLong (1988) com a covariância entre os dois modelos. Janelas novas: ${N_JANELAS} sorteios do desfecho pela PD verdadeira para os mesmos proponentes (semente ${SEMENTE_JANELAS}), só possível em base sintética.`}>
      <Painel>
        <Seg rotulo="Distribuição" opcoes={[{ v: "dif" as Vista, r: "Diferença entre os modelos" }, { v: "auc" as Vista, r: "AUC da logística" }]} valor={vista} onChange={setVista} cor />
        <Grafico rotulo={`Histograma de ${k} réplicas bootstrap; intervalo percentil ${ic ? `${num(ic[0], 4)} a ${num(ic[1], 4)}` : "ainda indefinido"}${revelado && vista === "dif" ? `; vantagem média em janelas novas ${num(sint.vantagem, 4)}` : ""}`} arCelular="4 / 3">
          {(d) => vista === "dif" ? <Histograma v={v} dom={[-0.04, 0.1]} passo={0.004} ic={ic} ref0 d={d} real={AUC1 - AUC2} xt={[-0.04, -0.02, 0, 0.02, 0.04, 0.06, 0.08, 0.1]} novas={revelado ? sint.vantagem : null} /> : <Histograma v={v} dom={[0.62, 0.82]} passo={0.005} ic={ic} ref0={false} d={d} real={AUC1} xt={[0.62, 0.66, 0.7, 0.74, 0.78, 0.82]} novas={null} />}
        </Grafico>
        <div className="q7-botoes">
          <Botao onClick={() => ir(k + 1)} desab={k >= REPLICAS}>Sortear 1 réplica</Botao>
          <Botao onClick={() => ir(k + 100)} desab={k >= REPLICAS}>Mais 100</Botao>
          <Botao prim={k < REPLICAS} onClick={() => ir(REPLICAS)} desab={k >= REPLICAS}>Completar {int(REPLICAS)}</Botao>
          <Botao sec onClick={() => { setK(INICIAIS); setPrev(null); setVista("dif"); }}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="IC percentil 95%" valor={ic ? `${num(ic[0], 3)} a ${num(ic[1], 3)}` : "·"} detalhe={vista === "auc" ? `DeLong: ${num(AUC1 - Z95 * DL.ep1, 3)} a ${num(AUC1 + Z95 * DL.ep1, 3)}` : `DeLong: ${num(DL.ic[0], 3)} a ${num(DL.ic[1], 3)}`} tom="val" tam="mini" />
          <Kpi rotulo="Diferença ≤ 0" valor={pct(abaixo0 / k, 1)} detalhe={`${abaixo0} de ${int(k)} réplicas`} tam="mini" />
        </div>
        {revelado ? (
          <p className="q7-p q7-s33-sint">Em {N_JANELAS} janelas novas dos mesmos proponentes, a AUC média é {num(sint.l, 4)} na logística e {num(sint.g, 4)} no boosting: vantagem de <b>{num(sint.vantagem, 4)}</b>. Só {sint.acima} de {N_JANELAS} ficam com vantagem igual ou maior que a observada.</p>
        ) : (
          <Previsao pergunta="Em janelas novas dos mesmos proponentes (desfecho sorteado de novo), a vantagem média da logística fica perto de..." escolha={prev} onEscolha={setPrev} recolher
            opcoes={[
              { certa: false, texto: `A da janela, ${num(sint.obs, 3)}`, retorno: "Confunde a janela com a população: o bootstrap reamostra a janela que temos e herda a sorte dela; o histograma se centra no observado, não no esperado." },
              { texto: `Bem menos: perto de ${Math.round(sint.obs / sint.vantagem) === 4 ? "um quarto" : `1/${Math.round(sint.obs / sint.vantagem)}`} da observada`, certa: true, retorno: `Isso: ${num(sint.vantagem, 4)}.` },
              { certa: false, texto: "Zero: a diferença era só sorte", retorno: "O intervalo do bootstrap mal toca zero e a logística ordena melhor em média; a sorte exagerou a vantagem, não a criou." },
            ]} />
        )}
        <Expandir resumo="O que o intervalo supõe">
          <ul className="q7-nota">
            <li>Pareado: os dois modelos nas mesmas propostas; a correlação entre as AUCs é {num(DL.correlacao, 2)}, e comparar dois intervalos separados superestima a incerteza da diferença.</li>
            <li>Propostas independentes; safras e tempo não são reamostrados. Com {D} defaults, o percentil tem cobertura aproximada.</li>
            <li>Mede a variação de amostragem desta janela; não diz nada sobre deriva de população em safras futuras.</li>
          </ul>
        </Expandir>
      </Painel>
    </Quadro>
  );
}

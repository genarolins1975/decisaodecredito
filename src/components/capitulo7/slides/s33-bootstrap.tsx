"use client";
import { useState } from "react";
import { Botao, Eixos, escala, Expandir, Grafico, Kpi, Painel, Quadro, Seg, margens, type Pagina } from "../base";
import { D, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { N_JANELAS, SEMENTE_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";
import { aucPorPares, bootstrapPareado, delong, quantil } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 33 · c7p14 · Bootstrap pareado da janela: cada réplica sorteia 737 propostas com reposição e calcula, nas mesmas
 * propostas, a AUC da logística e a do boosting sem recalibrar. Semente 20260501, 1.000 réplicas, intervalo percentil
 * (quantis 2,5% e 97,5%, tipo 7). Conferido contra a referência em Python (mesmo gerador portado). O cálculo completo
 * só roda no primeiro clique, para não pesar no carregamento das outras páginas.
 */
const SEMENTE = 20260501, REPLICAS = 1000;
const DL = delong(Y, PL, PGR);
const AUC1 = aucPorPares(Y, PL).auc!, AUC2 = aucPorPares(Y, PGR).auc!;
type Vista = "auc" | "dif";
const SEM_NOVAS = SEMENTE_JANELAS, NOVAS = N_JANELAS;
const janelasNovas = vantagemEmJanelasNovas;

function Histograma({ v, dom, passo, ic, ref0, d, real, xt }: { v: number[]; dom: [number, number]; passo: number; xt: number[]; ic: [number, number] | null; ref0: boolean; d: { w: number; h: number; fs: number }; real: number }) {
  const m = margens(d.fs, { l: 3, b: 2.9, t: 1.6, r: 1 });
  const nb = Math.round((dom[1] - dom[0]) / passo); const cont = new Array(nb).fill(0) as number[];
  for (const x of v) { const k = Math.floor((x - dom[0]) / passo); if (k >= 0 && k < nb) cont[k]++; }
  const passoY = Math.max(10, Math.ceil(Math.max(...cont) / 2 / 10) * 10); const ymax = passoY * 2.2;
  const x = escala(dom, [m.l, d.w - m.r]), y = escala([0, ymax], [d.h - m.b, m.t]);
  return (
    <g>
      <Eixos x={x} y={y} xt={xt} yt={[0, passoY, passoY * 2]} fx={(t) => num(t, 2)} fy={(t) => int(t)} xTit={ref0 ? "AUC logística − AUC boosting" : "AUC da logística"} yTit="Réplicas" />
      {ic && <rect x={x(ic[0])} y={m.t} width={x(ic[1]) - x(ic[0])} height={d.h - m.b - m.t} fill="#176C73" fillOpacity={0.1} />}
      {cont.map((c, k) => c ? <rect key={k} x={x(dom[0] + k * passo) + 1} y={y(c)} width={Math.max(1, x(dom[0] + (k + 1) * passo) - x(dom[0] + k * passo) - 2)} height={y(0) - y(c)} fill="#3D5A8A" /> : null)}
      {ref0 && <><line x1={x(0)} x2={x(0)} y1={m.t} y2={y(0)} stroke="#8C2332" strokeWidth={2.5} /><text className="q7-rot q7-rot--peq" x={x(0) - d.fs * 0.4} y={m.t + d.fs * 0.6} textAnchor="end" style={{ fill: "#8C2332", fontWeight: 700 }}>diferença zero</text></>}
      <line x1={x(real)} x2={x(real)} y1={m.t - d.fs * 0.6} y2={y(0)} stroke="#B8640F" strokeWidth={2.5} strokeDasharray="6 4" />
      <text className="q7-corte-t" x={x(real)} y={m.t - d.fs * 0.8} textAnchor="middle">na janela {num(real, 4)}</text>
    </g>
  );
}

export function S33Bootstrap({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const [vista, setVista] = useState<Vista>("dif");
  const [sint, setSint] = useState<ReturnType<typeof janelasNovas> | null>(null);
  const [bs, setBs] = useState<ReturnType<typeof bootstrapPareado> | null>(null);
  const ir = (alvo: number) => { if (!bs) setBs(bootstrapPareado(Y, PL, PGR, REPLICAS, SEMENTE)); setK(Math.min(REPLICAS, alvo)); };
  const v = bs && k ? (vista === "auc" ? bs.a1 : bs.dif).slice(0, k) : [];
  const ord = v.slice().sort((a, b) => a - b);
  const ic: [number, number] | null = ord.length >= 40 ? [quantil(ord, 0.025), quantil(ord, 0.975)] : null;
  const abaixo0 = bs ? bs.dif.slice(0, k).filter((x) => x <= 0).length : 0;
  const icDif = bs && k >= 40 ? (() => { const o = bs.dif.slice(0, k).sort((a, b) => a - b); return [quantil(o, 0.025), quantil(o, 0.975)] as [number, number]; })() : null;
  return (
    <Quadro slug="c7p14" pagina={pagina} layout="gl"
      conclusao={sint ? <>A base sintética permite o que a real não permite: repetir a janela. A vantagem esperada da logística é <b>{num(sint.l - sint.g, 4)}</b>, não {num(AUC1 - AUC2, 4)}; a janela observada exagerou a diferença. Com {D} defaults, um p de {num(DL.p, 3)} não basta para trocar de modelo.</>
        : k === 0 ? <>Na janela, a logística tem AUC {num(AUC1, 4)} e o boosting {num(AUC2, 4)}: diferença de {num(AUC1 - AUC2, 4)}. Quanto disso é a amostra? Sorteie réplicas da janela.</>
        : k < REPLICAS ? <>{int(k)} réplicas: o histograma ainda se forma. Cada réplica tem as mesmas {N} propostas em número, sorteadas com reposição, e mede os dois modelos nas mesmas propostas.</>
          : <>Com {int(REPLICAS)} réplicas, a diferença fica entre <b>{num(icDif![0], 4)} e {num(icDif![1], 4)}</b> (percentil 95%); {abaixo0} réplicas ficam em zero ou abaixo. DeLong dá [{num(DL.ic[0], 4)}; {num(DL.ic[1], 4)}], p = {num(DL.p, 3)}. A vantagem existe nesta janela, mas a margem é estreita: o limite inferior quase toca zero.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Bootstrap pareado por proposta, ${int(REPLICAS)} réplicas, semente ${SEMENTE}; intervalo percentil. DeLong (1988) com a covariância entre os dois modelos. Janelas novas: ${NOVAS} sorteios do desfecho pela PD verdadeira (semente ${SEM_NOVAS}), só possível em base sintética.`}>
      <Painel>
        <Seg rotulo="Distribuição" opcoes={[{ v: "dif" as Vista, r: "Diferença entre os modelos" }, { v: "auc" as Vista, r: "AUC da logística" }]} valor={vista} onChange={setVista} cor />
        <Grafico rotulo={k ? `Histograma de ${k} réplicas bootstrap; intervalo percentil ${ic ? `${num(ic[0], 4)} a ${num(ic[1], 4)}` : "ainda indefinido"}` : "Histograma vazio: nenhuma réplica sorteada"} arCelular="4 / 3">
          {(d) => vista === "dif" ? <Histograma v={v} dom={[-0.04, 0.1]} passo={0.004} ic={ic} ref0 d={d} real={AUC1 - AUC2} xt={[-0.04, -0.02, 0, 0.02, 0.04, 0.06, 0.08, 0.1]} /> : <Histograma v={v} dom={[0.62, 0.82]} passo={0.005} ic={ic} ref0={false} d={d} real={AUC1} xt={[0.62, 0.66, 0.7, 0.74, 0.78, 0.82]} />}
        </Grafico>
        <div className="q7-botoes">
          <Botao prim={k === 0} onClick={() => ir(k + 1)} desab={k >= REPLICAS}>Sortear 1 réplica</Botao>
          <Botao onClick={() => ir(k + 100)} desab={k >= REPLICAS}>Mais 100</Botao>
          <Botao onClick={() => ir(REPLICAS)} desab={k >= REPLICAS}>Completar {int(REPLICAS)}</Botao>
          <Botao sec onClick={() => { setK(0); setSint(null); }}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Réplicas" valor={int(k)} detalhe={`semente ${SEMENTE}`} tam="mini" />
          <Kpi rotulo="Última réplica" valor={bs && k ? num(vista === "auc" ? bs.a1[k - 1] : bs.dif[k - 1], 4) : "·"} detalhe={vista === "auc" ? "AUC da logística" : "diferença"} tam="mini" />
          <Kpi rotulo="Intervalo percentil 95%" valor={ic ? `${num(ic[0], 4)} a ${num(ic[1], 4)}` : "·"} detalhe={ic ? (vista === "auc" ? `DeLong: ${num(AUC1 - 1.959964 * DL.ep1, 4)} a ${num(AUC1 + 1.959964 * DL.ep1, 4)}` : `DeLong: ${num(DL.ic[0], 4)} a ${num(DL.ic[1], 4)}`) : "precisa de 40 réplicas"} tom="prob" tam="mini" />
          <Kpi rotulo="Diferença ≤ 0" valor={k ? pct(abaixo0 / k, 1) : "·"} detalhe={k ? `${abaixo0} de ${int(k)} réplicas` : "das réplicas"} tom="def" tam="mini" />
        </div>
        {sint ? (
          <p className="q7-p q7-s33-sint">Em {NOVAS} janelas novas dos mesmos proponentes, com desfecho sorteado da PD verdadeira, a AUC média é {num(sint.l, 4)} na logística e {num(sint.g, 4)} no boosting: vantagem média de <b>{num(sint.l - sint.g, 4)}</b>. Só {sint.acima} de {NOVAS} ficam com vantagem igual ou maior que a observada. O bootstrap mede a incerteza da janela que temos; não corrige a sorte dela.</p>
        ) : (
          <p className="q7-nota">Pareado: os dois modelos são medidos nas mesmas propostas sorteadas. A correlação entre as duas AUCs é {num(DL.correlacao, 2)}; ignorá-la (comparar dois intervalos separados) superestima a incerteza da diferença.</p>
        )}
        {!sint && <div className="q7-botoes"><Botao onClick={() => setSint(janelasNovas())}>O que a base sintética mostra</Botao></div>}
        <Expandir resumo="O que o intervalo supõe">
          <ul className="q7-nota">
            <li>Propostas independentes entre si; safras e tempo não são reamostrados.</li>
            <li>Com {D} defaults, o percentil tem cobertura apenas aproximada; outra semente move a terceira casa.</li>
            <li>Mede a variação de amostragem desta janela; não diz nada sobre deriva de população em safras futuras.</li>
          </ul>
        </Expandir>
      </Painel>
    </Quadro>
  );
}

"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, Kpi, Legenda, Painel, Quadro, margens, type Pagina } from "../base";
import { D, META, N, PL, PT, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, logit, mulberry32, sigmoide } from "@/lib/capitulo7/metricas";
import { num } from "@/lib/capitulo7/formato";

/**
 * 35 · c7p17 · OOT congelado. Cada reabertura da janela testa mais um candidato (a logística com ruído N(0; 0,3²) no
 * log odds, semente 20261035, como um ajuste de variável ou de faixa) e fica com o de maior AUC na janela. A AUC que
 * cada candidato teria em janelas novas é a média em 100 janelas simuladas: os mesmos 737 proponentes com desfecho
 * sorteado de novo da PD verdadeira (semente 20261036). Só existe porque a base é sintética. Tudo é calculado sob
 * demanda e guardado em cache no módulo, na ordem fixa das sementes.
 */
const MAX = 20, SIGMA = 0.3, SEM_CAND = 20261035, SEM_NOVAS = 20261036, NOVAS = 100;
const cache: { cands: number[][]; oot: number[]; novas: number[]; janelas: number[][] | null; logNova: number | null } = { cands: [], oot: [], novas: [], janelas: null, logNova: null };
const AUC_LOG = aucPorPares(Y, PL).auc!;
function janelas() {
  if (!cache.janelas) { const r = mulberry32(SEM_NOVAS); cache.janelas = Array.from({ length: NOVAS }, () => PT.map((p) => (r() < p ? 1 : 0))); }
  return cache.janelas;
}
const mediaNovas = (p: readonly number[]) => janelas().reduce((s, y) => s + aucPorPares(y, p).auc!, 0) / NOVAS;
function garantir(k: number) {
  if (cache.logNova === null) cache.logNova = mediaNovas(PL);
  const r = mulberry32(SEM_CAND);
  const gauss = () => { const u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  for (let i = 0; i < k; i++) {
    const p = PL.map((q) => sigmoide(logit(q) + SIGMA * gauss()));
    if (i >= cache.cands.length) { cache.cands.push(p); cache.oot.push(aucPorPares(Y, p).auc!); cache.novas.push(mediaNovas(p)); }
  }
}
function trajetoria(k: number) {
  const out: { k: number; oot: number; nova: number; i: number }[] = []; let bi = -1;
  for (let i = 0; i < k; i++) { if (bi < 0 || cache.oot[i] > cache.oot[bi]) bi = i; out.push({ k: i + 1, oot: cache.oot[bi], nova: cache.novas[bi], i: bi }); }
  return out;
}
const CONGELA = [
  "Evento e horizonte: atraso de 90 dias ou mais em 12 meses",
  "População: propostas aprovadas, uma por cliente",
  "Variáveis, faixas e pesos de evidência",
  "Hiperparâmetros do boosting",
  "Calibrador e os seus parâmetros",
  "Corte e hipóteses econômicas",
  "Métricas e limites de aceite, por escrito",
];

export function S35OotCongelado({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const ir = (n: number) => { const alvo = Math.min(MAX, n); garantir(alvo); setK(alvo); };
  const tr = k ? trajetoria(k) : []; const u = tr[tr.length - 1];
  return (
    <Quadro slug="c7p17" pagina={pagina} layout="gl"
      conclusao={k === 0 ? <>Com tudo congelado, a janela é aberta uma vez: logística com AUC <b>{num(AUC_LOG, 4)}</b>. Agora imagine reabri-la para testar ajustes e ficar com o melhor.</>
        : <>Depois de {k} {k === 1 ? "reabertura" : "reaberturas"}, o escolhido marca <b>{num(u.oot, 4)}</b> na janela{u.oot > AUC_LOG ? ", acima da logística" : ""}; em janelas novas esperaria {num(u.nova, 4)}{u.nova < cache.logNova! ? <>, abaixo dos {num(cache.logNova!, 4)} da logística</> : null}. A janela já era favorável (a logística perde {num(AUC_LOG - cache.logNova!, 3)} de uma para outra); escolher olhando para ela soma otimismo: <b>o número dela deixou de ser prova</b>.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; base fechada em ${META.dataReferencia.split("-").reverse().join("/")}. Candidatos: logística com ruído normal de desvio ${num(SIGMA, 1)} no log odds (semente ${SEM_CAND}). Janelas novas: ${NOVAS} sorteios do desfecho a partir da PD verdadeira para os mesmos proponentes (semente ${SEM_NOVAS}); só possível em base sintética.`}>
      <Painel titulo="Reabrir a janela para escolher">
        <Grafico rotulo={k ? `Após ${k} aberturas: AUC na janela ${num(u.oot, 4)}, esperada em janelas novas ${num(u.nova, 4)}` : "Nenhuma reabertura ainda"} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.4, b: 2.9, t: 1.2, r: 1 });
            const x = escala([0, MAX], [m.l, d.w - m.r]), y = escala([0.62, 0.76], [d.h - m.b, m.t]);
            const deg = (key: "oot" | "nova") => caminho(tr.flatMap((p, i) => [{ x: x(i === 0 ? 0.5 : p.k - 0.5), y: y(p[key]) }, { x: x(p.k + 0.5 > MAX ? MAX : p.k + 0.5), y: y(p[key]) }]));
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 5, 10, 15, 20]} yt={[0.62, 0.66, 0.7, 0.74]} fx={(v) => String(v)} fy={(v) => num(v, 2)} xTit="Aberturas da janela" yTit="AUC" />
                <line x1={x(0)} x2={x(MAX)} y1={y(AUC_LOG)} y2={y(AUC_LOG)} stroke="#00205B" strokeWidth={1.5} strokeOpacity={0.6} />
                <text className="q7-rot q7-rot--peq" x={x(MAX)} y={y(AUC_LOG) - d.fs * 0.4} textAnchor="end">logística, na janela</text>
                {cache.logNova !== null && <><line x1={x(0)} x2={x(MAX)} y1={y(cache.logNova)} y2={y(cache.logNova)} stroke="#00205B" strokeWidth={1.5} strokeDasharray="6 5" strokeOpacity={0.6} /><text className="q7-rot q7-rot--peq" x={x(MAX)} y={y(cache.logNova) + d.fs * 1.1} textAnchor="end">logística, em janelas novas</text></>}
                {k > 0 && <path className="q7-linha q7-linha--prob" d={deg("oot")} />}
                {k > 0 && <path className="q7-linha q7-linha--dec" strokeDasharray="7 5" d={deg("nova")} />}
                {tr.map((p) => <circle key={p.k} cx={x(p.k)} cy={y(cache.oot[p.k - 1])} r={d.fs * 0.22} fill="#9AA1AD" />)}
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "linha prob", r: "escolhido, AUC na janela" }, { mk: "trac dec", r: "escolhido, AUC esperada em janelas novas" }, { mk: "", r: "pontos: cada candidato testado" }]} />
        <div className="q7-botoes">
          <Botao prim={k === 0} onClick={() => ir(k + 1)} desab={k >= MAX}>Reabrir e testar mais um</Botao>
          <Botao onClick={() => ir(k + 5)} desab={k >= MAX}>Mais 5</Botao>
          <Botao sec onClick={() => setK(0)}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <p className="q7-k">Congelado antes de abrir</p>
        <ul className="q7-s35-lista">{CONGELA.map((c) => <li key={c}><span aria-hidden="true">■</span>{c}</li>)}</ul>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Otimismo do escolhido" valor={k ? num(u.oot - u.nova, 4) : "·"} detalhe={k ? `após ${k} ${k === 1 ? "reabertura" : "reaberturas"}` : "reabra para ver"} tom="def" tam="mini" />
          <Kpi rotulo="Otimismo da logística" valor={cache.logNova !== null ? num(AUC_LOG - cache.logNova, 4) : "·"} detalhe="sem reabrir: sorte da janela" tam="mini" />
        </div>
      </Painel>
    </Quadro>
  );
}

"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, Kpi, Legenda, LinkSlide, Painel, Previsao, Quadro, margens, type Opcao, type Pagina } from "../base";
import { D, META, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, logit, mulberry32, sigmoide } from "@/lib/capitulo7/metricas";
import { aucEsperada, N_JANELAS, SEMENTE_JANELAS } from "@/lib/capitulo7/janelas";
import { num } from "@/lib/capitulo7/formato";

/**
 * 35 · c7p17 · OOT congelado. Cada reabertura da janela testa mais um candidato (a logística com ruído N(0; 0,3²) no
 * log odds, semente 20261035, como um ajuste de variável ou de faixa) e fica com o de maior AUC na janela. A AUC que
 * cada candidato teria em janelas novas vem de janelas.ts: os mesmos 300 sorteios do desfecho pela PD verdadeira dos
 * slides 33 e 36 (semente 20261033), só possíveis porque a base é sintética. O quadro abre com uma reabertura feita e a
 * linha da logística em janelas novas desenhada; as próximas só depois da previsão. Os 20 candidatos são calculados
 * uma vez, ao abrir o slide (não no carregamento do módulo), e a leitura só fala em otimismo somado quando a tela mostra.
 * Rodada 3: a AUC na janela do escolhido vai na cor de ordenação (o verde de validação fica só na esperada); as
 * escolhas congeladas viram uma linha; o KPI separa a parte do otimismo que vem da seleção da que é sorte da janela.
 */
const MAX = 20, SIGMA = 0.3, SEM_CAND = 20261035;
const AUC_LOG = aucPorPares(Y, PL).auc!;
type Trilha = { logNova: number; oot: number[]; novas: number[] };
function calcular(): Trilha {
  const r = mulberry32(SEM_CAND);
  const gauss = () => { const u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const oot: number[] = [], novas: number[] = [];
  for (let i = 0; i < MAX; i++) { const p = PL.map((q) => sigmoide(logit(q) + SIGMA * gauss())); oot.push(aucPorPares(Y, p).auc!); novas.push(aucEsperada(p)); }
  return { logNova: aucEsperada(PL), oot, novas };
}
function trajetoria(t: Trilha, k: number) {
  const out: { k: number; oot: number; nova: number; i: number }[] = []; let bi = -1;
  for (let i = 0; i < k; i++) { if (bi < 0 || t.oot[i] > t.oot[bi]) bi = i; out.push({ k: i + 1, oot: t.oot[bi], nova: t.novas[bi], i: bi }); }
  return out;
}
const CONGELA = ["Evento e horizonte", "População", "Variáveis e faixas", "Hiperparâmetros", "Calibrador", "Corte e hipóteses", "Limites de aceite"];

export function S35OotCongelado({ pagina }: { pagina?: Pagina }) {
  const [t] = useState(calcular);
  const [k, setK] = useState(1);
  const [prev, setPrev] = useState<number | null>(null);
  const tr = trajetoria(t, k); const u = tr[tr.length - 1]; const fim = trajetoria(t, MAX)[MAX - 1];
  const otimEsc = u.oot - u.nova, otimLog = AUC_LOG - t.logNova;
  // a alternativa certa sai do próprio cálculo das 20 reaberturas
  const acimaJ = fim.oot > AUC_LOG, acimaN = fim.nova > t.logNova;
  const opcoes: Opcao[] = [
    { texto: "Acima da logística na janela e em janelas novas", certa: acimaJ && acimaN, retorno: "Confunde o máximo de 20 medidas ruidosas com o melhor modelo: cada candidato é a logística com ruído, pior em média, e escolher pelo maior número da janela seleciona a sorte dela." },
    { texto: "Acima na janela, abaixo em janelas novas", certa: acimaJ && !acimaN, retorno: "Isso." },
    { texto: "Abaixo nas duas: ruído só piora", certa: !acimaJ && !acimaN, retorno: "Cada candidato é pior em média, mas o máximo de 20 sorteios sobe: na janela, o escolhido pode passar a logística sem ser melhor." },
  ];
  const certa = prev !== null && opcoes[prev].certa === true;
  const ir = (n: number) => setK(Math.min(MAX, n));
  return (
    <Quadro slug="c7p17" pagina={pagina} layout="gl"
      conclusao={k === 1 ? <>Com tudo congelado, a janela abre uma vez: logística com AUC <b>{num(AUC_LOG, 4)}</b>, contra {num(t.logNova, 4)} esperada em janelas novas (a janela já era favorável). Uma reabertura testou um ajuste: {num(u.oot, 4)} na janela. Antes de reabrir mais, a previsão.</>
        : <>Depois de {k} reaberturas, o escolhido marca <b>{num(u.oot, 4)}</b> na janela{u.oot > AUC_LOG ? ", acima da logística" : ""}; em janelas novas esperaria {num(u.nova, 4)}{u.nova < t.logNova ? <>, abaixo dos {num(t.logNova, 4)} dela</> : null}. {otimEsc > otimLog ? <>Escolher olhando para a janela somou otimismo ({num(otimEsc, 4)} contra {num(otimLog, 4)} da logística): <b>o número dela deixou de ser prova</b>. O <LinkSlide slug="c7p38">slide 36</LinkSlide> leva tudo ao comitê.</> : <>Até aqui, o otimismo do escolhido ({num(otimEsc, 4)}) não passa o da logística ({num(otimLog, 4)}).</>}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; base fechada em ${META.dataReferencia.split("-").reverse().join("/")}. Candidatos: logística com ruído normal de desvio ${num(SIGMA, 1)} no log odds (semente ${SEM_CAND}). Janelas novas: ${N_JANELAS} sorteios do desfecho pela PD verdadeira para os mesmos proponentes (semente ${SEMENTE_JANELAS}), as mesmas dos slides 33 e 36; só possível em base sintética.`}>
      <Painel titulo="Reabrir a janela para escolher">
        <Grafico rotulo={`Após ${k} aberturas: AUC na janela ${num(u.oot, 4)}, esperada em janelas novas ${num(u.nova, 4)}; logística ${num(AUC_LOG, 4)} na janela e ${num(t.logNova, 4)} em janelas novas`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.4, b: 2.9, t: 1.2, r: 1 });
            const x = escala([0, MAX], [m.l, d.w - m.r]), y = escala([0.64, 0.74], [d.h - m.b, m.t]);
            const deg = (key: "oot" | "nova") => caminho(tr.flatMap((p, i) => [{ x: x(i === 0 ? 0.5 : p.k - 0.5), y: y(p[key]) }, { x: x(p.k + 0.5 > MAX ? MAX : p.k + 0.5), y: y(p[key]) }]));
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 5, 10, 15, 20]} yt={[0.64, 0.66, 0.68, 0.7, 0.72, 0.74]} fx={(v) => String(v)} fy={(v) => num(v, 2)} xTit="Aberturas da janela" yTit="AUC" />
                <line x1={x(0)} x2={x(MAX)} y1={y(AUC_LOG)} y2={y(AUC_LOG)} stroke="#5B6475" strokeWidth={2} />
                <text className="q7-rot q7-rot--peq" x={x(0) + d.fs * 0.5} y={y(AUC_LOG) - d.fs * 0.4} style={{ fill: "#2A3342" }}>logística, na janela {num(AUC_LOG, 4)}</text>
                <line x1={x(0)} x2={x(MAX)} y1={y(t.logNova)} y2={y(t.logNova)} stroke="#5B6475" strokeWidth={2} strokeDasharray="6 5" />
                <text className="q7-rot q7-rot--peq" x={x(MAX)} y={y(t.logNova) - d.fs * 0.4} textAnchor="end" style={{ fill: "#2A3342" }}>logística, em janelas novas {num(t.logNova, 4)}</text>
                <path className="q7-linha q7-linha--ord" d={deg("oot")} />
                <path className="q7-linha q7-linha--val" strokeDasharray="7 5" d={deg("nova")} />
                {tr.map((p) => <circle key={p.k} cx={x(p.k)} cy={y(t.oot[p.k - 1])} r={d.fs * 0.22} fill="#9AA1AD" />)}
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "linha ord", r: "escolhido, AUC na janela" }, { mk: "trac val", r: "escolhido, esperada em janelas novas" }, { mk: "", r: "pontos: cada candidato" }]} />
        <div className="q7-botoes">
          <Botao prim={certa && k < MAX} onClick={() => ir(k + 1)} desab={!certa || k >= MAX}>Reabrir e testar mais um</Botao>
          <Botao onClick={() => ir(k + 5)} desab={!certa || k >= MAX}>Mais 5</Botao>
          <Botao sec onClick={() => { setK(1); setPrev(null); }}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        {certa ? (
          <>
            <p className="q7-retorno" data-tom="certa">Isso: o escolhido sobe na janela porque foi escolhido nela; em janelas novas, fica abaixo da logística. Reabra e confira.</p>
            <p className="q7-s35-cong"><b>Congelado antes de abrir:</b> {CONGELA.map((c) => c.toLowerCase()).join(", ").replace(/, ([^,]+)$/, " e $1")}.</p>
          </>
        ) : (
          <Previsao pergunta={`Depois de ${MAX} reaberturas, ficando sempre com o maior da janela, o escolhido estará, comparado com a logística...`} escolha={prev} onEscolha={setPrev} recolher opcoes={opcoes} />
        )}
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Otimismo do escolhido" valor={num(otimEsc, 4)} detalhe={`janela − janelas novas, ${k} ${k === 1 ? "reabertura" : "reaberturas"}; ${num(otimEsc - otimLog, 4)} além da sorte`} tam="mini" />
          <Kpi rotulo="Otimismo da logística" valor={num(otimLog, 4)} detalhe="sem reabrir: sorte da janela" tam="mini" />
        </div>
      </Painel>
    </Quadro>
  );
}

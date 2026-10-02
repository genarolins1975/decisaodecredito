"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, modelo, NV, XV, YV } from "@/lib/capitulo6/dados";
import { estagios, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { calibracaoGlobal, faixasQuantis, slopeComIntervalo, wilson, type Faixa } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 18 · c6p18 · Nível das PDs do boosting da carteira (CFG_CARTEIRA) na validação: PD média contra taxa observada
 * (com o intervalo de Wilson da taxa), curva de confiabilidade por quintis de PD (126 ou 127 propostas por faixa: com decis de 63, os intervalos ficam largos demais para ler a inclinação) com o intervalo de Wilson de cada faixa
 * e slope de calibração com IC de Wald (funções de src/lib/capitulo7/metricas.ts, conferidas com scikit-learn e
 * statsmodels). O modelo parado (mínimo da log loss de validação, o mesmo do slide 17) é o estado inicial; a previsão
 * pergunta o que acontece sem a parada, com todas as árvores; depois, o controle percorre o número de árvores e a curva
 * do modelo parado fica como referência (quadrados vazados). As frases sobre as faixas extremas e sobre o slope são
 * calculadas: o retorno só afirma a direção que os números mostram, e o slope só é chamado de desvio quando o IC exclui 1.
 * Ponte para o capítulo 7, que mede na janela e recalibra (Niculescu-Mizil e Caruana, 2005). A curva é desenhada aqui,
 * na largura do painel (os dois eixos em probabilidade, com a diagonal), para ser a peça principal do slide.
 */
function calcular() {
  const M = modelo(CFG_CARTEIRA);
  const EV = estagios(M, XV);
  const K_MAX = M.arvores.length;
  const LL_V = EV.map((F) => perdaLog(F, YV));
  const K_PARADA = LL_V.reduce((k, x, i) => (i >= 1 && x < LL_V[k] ? i : k), 1);
  const KS = [...new Set([1, 5, 10, K_PARADA, 30, 50, 100, 200, K_MAX])].sort((a, b) => a - b);
  const NF = 5;
  const DV = YV.reduce((s, v) => s + v, 0);
  const TAXA = wilson(DV, NV)!;
  const ESTADO = new Map(KS.map((k) => {
    const p = EV[k].map(sigmoide);
    const F = faixasQuantis(YV, p, NF);
    return [k, { F, g: calibracaoGlobal(YV, p), s: slopeComIntervalo(YV, p), dentro: F.filter((f) => f.compativel).length }];
  }));
  const E0 = ESTADO.get(K_PARADA)!, EM = ESTADO.get(K_MAX)!;
  const MAX = Math.ceil(Math.max(...[...ESTADO.values()].flatMap((e) => e.F.flatMap((f) => [f.pdMedia!, f.ic!.hi]))) * 20) / 20;
  const F1 = EM.F[0], FN = EM.F[NF - 1];
  const NMIN = Math.min(...E0.F.map((f) => f.n)), NMAX = Math.max(...E0.F.map((f) => f.n));
  const ESPALHA = F1.pdMedia! < F1.obs! && FN.pdMedia! > FN.obs! && EM.s.ic[1] < 1;
  const forma = (s: { slope: number; ic: [number, number] }) => s.ic[1] < 1 ? "PDs extremas demais" : s.ic[0] > 1 ? "PDs tímidas demais" : "a amostra não distingue o slope de 1";

  const OPS = [
    { texto: "Quase não muda: se a média bate, as faixas batem", certa: false, retorno: <>Confunde média com calibração: com {K_MAX} árvores, a PD média vai a {pct(EM.g.pdMedia!, 1)}, quase igual, mas o slope cai de {num(E0.s.slope, 2)} para {num(EM.s.slope, 2)}.</> },
    { texto: ESPALHA ? "Abre em leque: faixas baixas abaixo do observado, altas acima" : "A inclinação da curva muda", certa: true, retorno: <>Isso: na faixa 1, {pct(F1.pdMedia!, 1)} previstos contra {pct(F1.obs!, 1)} observados; na {NF}, {pct(FN.pdMedia!, 1)} contra {pct(FN.obs!, 1)}.</> },
    { texto: "Sobe inteira: mais árvores subestimam o risco", certa: false, retorno: <>Confunde dispersão com nível: a PD média quase não se move ({pct(E0.g.pdMedia!, 1)} para {pct(EM.g.pdMedia!, 1)}); o que muda é a inclinação.</> },
  ];
  return { M, EV, K_MAX, LL_V, K_PARADA, KS, NF, DV, TAXA, ESTADO, E0, EM, MAX, F1, FN, NMIN, NMAX, ESPALHA, forma, OPS };
}
let CACHE: ReturnType<typeof calcular> | null = null;
/** Cálculo preguiçoso: só o slide visitado paga o ajuste dos modelos (o registro importa todos os quadros). */
const dados = () => (CACHE ??= calcular());

/** Curva de confiabilidade larga: PD média prevista contra default observado por faixa, com o intervalo de Wilson. */
function Curva({ F, ref, max, k }: { F: Faixa[]; ref: Faixa[] | null; max: number; k: number }) {
  const ticks: number[] = []; for (let t = 0; t <= max + 1e-9; t += 0.05) ticks.push(Math.round(t * 100) / 100);
  const tab = <table><caption>Curva de confiabilidade com {k} árvores</caption><thead><tr><th>Faixa</th><th>n</th><th>Defaults</th><th>PD média</th><th>Observado</th><th>Intervalo de 95%</th></tr></thead>
    <tbody>{F.map((f) => <tr key={f.j}><td>{f.j}</td><td>{f.n}</td><td>{f.d}</td><td>{pct(f.pdMedia!, 1)}</td><td>{pct(f.obs!, 1)}</td><td>{pct(f.ic!.lo, 1)} a {pct(f.ic!.hi, 1)}</td></tr>)}</tbody></table>;
  return (
    <Grafico titulo="PD prevista contra default observado, por faixa de PD" sub={ref ? "● com as árvores escolhidas · □ cinza: parado na validação" : "● parado na validação · barra: IC de 95%"} rotulo={`Curva de confiabilidade do boosting com ${k} árvores na validação sorteada: ${F.map((f) => `faixa ${f.j}, ${pct(f.pdMedia!, 1)} previstos e ${pct(f.obs!, 1)} observados`).join("; ")}`} tabela={tab} arCelular="5 / 4">
      {(d) => {
        const m = margens(d.fs, { l: 3.4, r: 1.2, t: 1, b: 2.9 });
        const x = escala([0, max], [m.l, d.w - m.r]), y = escala([0, max], [d.h - m.b, m.t]); const r = d.fs * 0.45;
        return (
          <g>
            <Eixos x={x} y={y} xt={ticks} yt={ticks} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD média prevista na faixa" yTit="Default observado na faixa" />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(max)} y2={y(max)} />
            <text className="q7-rot--peq" x={x(max * 0.02)} y={y(max * 0.93)} style={{ fill: "#5B6475" }}>acima da diagonal: risco subestimado</text>
            <text className="q7-rot--peq" x={x(max * 0.98)} y={y(max * 0.04)} textAnchor="end" style={{ fill: "#5B6475" }}>abaixo: risco superestimado</text>
            {ref && <>
              <path d={caminho(ref.map((f) => ({ x: x(f.pdMedia!), y: y(f.obs!) })))} fill="none" stroke="#9AA1AD" strokeWidth={1.8} strokeDasharray="6 5" />
              {ref.map((f) => <rect key={f.j} x={x(f.pdMedia!) - d.fs * 0.3} y={y(f.obs!) - d.fs * 0.3} width={d.fs * 0.6} height={d.fs * 0.6} fill="#fff" stroke="#5B6475" strokeWidth={2} />)}
            </>}
            <path className="q7-linha q7-linha--prob q7-linha--fina" d={caminho(F.map((f) => ({ x: x(f.pdMedia!), y: y(f.obs!) })))} />
            {F.map((f) => <g key={f.j}>
              <line x1={x(f.pdMedia!)} x2={x(f.pdMedia!)} y1={y(Math.min(max, f.ic!.lo))} y2={y(Math.min(max, f.ic!.hi))} stroke="#176C73" strokeOpacity={0.5} strokeWidth={Math.max(3, d.fs * 0.16)} strokeLinecap="round" />
              <circle cx={x(f.pdMedia!)} cy={y(f.obs!)} r={r} fill="#176C73" stroke="#fff" strokeWidth={2} />
            </g>)}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S18Nivel({ pagina }: { pagina?: Pagina }) {
  const { K_MAX, K_PARADA, KS, NF, DV, TAXA, ESTADO, E0, MAX, NMIN, NMAX, forma, OPS } = dados();
  const [esc, setEsc] = useState<number | null>(null);
  const [ik, setIk] = useState(KS.indexOf(K_PARADA));
  const revelado = esc !== null && OPS[esc].certa === true;
  const k = revelado ? KS[ik] : K_PARADA;
  const e = ESTADO.get(k)!;
  const restaurar = () => { setEsc(null); setIk(KS.indexOf(K_PARADA)); };
  const escolher = (i: number | null) => { setEsc(i); if (i !== null && OPS[i].certa) setIk(KS.indexOf(K_MAX)); };
  const parado = k === K_PARADA;
  return (
    <Quadro slug="c6p18" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "A média das PDs bate com a taxa. E as faixas?"}
      sub={revelado ? undefined : <>Boosting parado em {K_PARADA} árvores, nas {int(NV)} propostas da validação sorteada.</>}
      conclusao={!revelado
        ? <>A PD média do modelo parado, <b>{pct(E0.g.pdMedia!, 1)}</b>, cabe no intervalo da taxa observada ({DV} de {int(NV)}). E com {K_MAX} árvores? Preveja ao lado.</>
        : parado
          ? <>Parado em {K_PARADA} árvores: PD média {pct(e.g.pdMedia!, 1)} contra {pct(TAXA.p, 1)}, PD no intervalo em {e.dentro} das {NF} faixas e slope <b>{num(e.s.slope, 2)}</b> (IC de {num(e.s.ic[0], 2)} a {num(e.s.ic[1], 2)}): {int(NV)} propostas não provam desvio, e não provar não é conferir. O <LinkSlide slug="c6p19">slide 19</LinkSlide> explica cada PD; o capítulo 7 mede na janela e recalibra.</>
          : <>Com {k} árvores, a PD média fica em {pct(e.g.pdMedia!, 1)} (observado {pct(TAXA.p, 1)}), e a faixa 1 recebe {pct(e.F[0].pdMedia!, 1)} contra {pct(e.F[0].obs!, 1)} observados: slope <b>{num(e.s.slope, 2)}</b> (IC de {num(e.s.ic[0], 2)} a {num(e.s.ic[1], 2)}), {forma(e.s)}. Média certa não é PD certa; o <LinkSlide slug="c6p19">slide 19</LinkSlide> explica cada PD, e o capítulo 7 recalibra.</>}
      fonte={`Validação sorteada: ${int(NV)} propostas, ${DV} defaults. ${NF === 5 ? "Cinco" : NF} faixas pela fila de PD (${NMIN} ou ${NMAX}); Wilson de 95%; slope com IC de Wald.`}>
      <Painel>
        <Curva F={e.F} ref={parado ? null : E0.F} max={MAX} k={k} />
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de revelar" pergunta={`Com todas as ${K_MAX} árvores, a PD média quase não muda. E a curva?`} opcoes={OPS} escolha={esc} onEscolha={escolher} recolher />
        {revelado && <div className="q6-s18-ctl">
          <Controle rotulo="Árvores do boosting" valor={ik} min={0} max={KS.length - 1} passo={1} onChange={setIk} mostrar={`${k}${parado ? " (parada)" : ""}`} />
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>}
        <div className="q6-s18-kpis">
          <Kpi tam="mini" tom="prob" rotulo="PD média" valor={pct(e.g.pdMedia!, 1)} detalhe={`taxa ${pct(TAXA.p, 1)} (${pct(TAXA.lo, 1)} a ${pct(TAXA.hi, 1)})`} />
          <Kpi tam="mini" tom="prob" rotulo="Faixas no intervalo" valor={`${e.dentro} de ${NF}`} detalhe="Wilson" />
          <Kpi tam="mini" tom="prob" rotulo="Slope" valor={num(e.s.slope, 2)} detalhe={`IC ${num(e.s.ic[0], 2)} a ${num(e.s.ic[1], 2)}`} />
        </div>
        {revelado && <p className="q7-nota">Slope abaixo de 1: PDs extremas demais; acima de 1, tímidas demais.</p>}
      </Painel>
    </Quadro>
  );
}

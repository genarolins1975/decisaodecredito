"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Kpi, LinkSlide, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Confiabilidade } from "@/components/capitulo7/graficos";
import { CFG_CARTEIRA, modelo, NV, XV, YV } from "@/lib/capitulo6/dados";
import { estagios, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { calibracaoGlobal, faixasQuantis, slopeComIntervalo, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 18 · c6p18 · Nível das PDs do boosting da carteira (CFG_CARTEIRA) na validação: PD média contra taxa observada
 * (com o intervalo de Wilson da taxa), curva de confiabilidade por quintis de PD (126 ou 127 propostas por faixa: com decis de 63, os intervalos ficam largos demais para ler a inclinação) com o intervalo de Wilson de cada faixa
 * e slope de calibração com IC de Wald (funções de src/lib/capitulo7/metricas.ts, conferidas com scikit-learn e
 * statsmodels). O modelo parado (mínimo da log loss de validação, o mesmo do slide 17) é o estado inicial; a previsão
 * pergunta o que acontece sem a parada, com todas as árvores; depois, o controle percorre o número de árvores e a curva
 * do modelo parado fica como referência (quadrados vazados). As frases sobre as faixas extremas e sobre o slope são
 * calculadas: o retorno só afirma a direção que os números mostram, e o slope só é chamado de desvio quando o IC exclui 1.
 * Ponte para o capítulo 7, que mede na janela e recalibra (Niculescu-Mizil e Caruana, 2005).
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
    <Quadro slug="c6p18" pagina={pagina} layout="um"
      titulo={revelado ? undefined : "A média das PDs bate com a taxa. E as faixas?"}
      sub={revelado ? undefined : <>Boosting parado em {K_PARADA} árvores, nas {int(NV)} propostas de validação.</>}
      conclusao={!revelado
        ? <>A PD média do modelo parado, <b>{pct(E0.g.pdMedia!, 1)}</b>, cabe no intervalo da taxa observada ({DV} de {int(NV)}). Com {K_MAX} árvores, o que acontece com a curva? Preveja ao lado.</>
        : parado
          ? <>Parado em {K_PARADA} árvores: PD média {pct(e.g.pdMedia!, 1)} contra {pct(TAXA.p, 1)}, PD no intervalo em {e.dentro} das {NF} faixas e slope <b>{num(e.s.slope, 2)}</b> (IC de {num(e.s.ic[0], 2)} a {num(e.s.ic[1], 2)}): {int(NV)} propostas não provam desvio, e não provar não é conferir. O <LinkSlide slug="c6p19">slide 19</LinkSlide> explica cada PD; o capítulo 7 mede na janela e recalibra.</>
          : <>Com {k} árvores, a PD média fica em {pct(e.g.pdMedia!, 1)} (observado {pct(TAXA.p, 1)}), e a faixa 1 recebe {pct(e.F[0].pdMedia!, 1)} contra {pct(e.F[0].obs!, 1)} observados: slope <b>{num(e.s.slope, 2)}</b> (IC de {num(e.s.ic[0], 2)} a {num(e.s.ic[1], 2)}), {forma(e.s)}. Média certa não é PD certa; o <LinkSlide slug="c6p19">slide 19</LinkSlide> explica cada PD, e o capítulo 7 recalibra.</>}
      fonte={`Validação: ${int(NV)} propostas, ${DV} defaults. ${NF === 5 ? "Cinco" : NF} faixas pela fila de PD (${NMIN} ou ${NMAX}); Wilson de 95%; slope com IC de Wald.`}>
      <div className="q6-s18">
        <Painel className="q6-s18-c">
          <Confiabilidade rotulo={`Curva de confiabilidade do boosting com ${k} árvores na validação; PD dentro do intervalo de 95% em ${e.dentro} das {NF} faixas`} max={MAX}
            series={[{ faixas: e.F, classe: "prob", linha: true, ic: true }]}
            extra={(x, y, d) => !parado ? <g>
              <path d={caminho(E0.F.map((f) => ({ x: x(f.pdMedia!), y: y(f.obs!) })))} fill="none" stroke="#5B6475" strokeWidth={1.8} strokeDasharray="6 5" />
              {E0.F.map((f) => <rect key={f.j} x={x(f.pdMedia!) - d.fs * 0.3} y={y(f.obs!) - d.fs * 0.3} width={d.fs * 0.6} height={d.fs * 0.6} fill="#fff" stroke="#5B6475" strokeWidth={2} />)}
              <text className="q7-rot--peq" x={x(E0.F[NF - 1].pdMedia!) + d.fs * 0.6} y={y(E0.F[NF - 1].obs!)} dy=".35em" style={{ fill: "#5B6475", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.35em", strokeLinejoin: "round" }}>parado em {K_PARADA}</text>
            </g> : null} />
        </Painel>
        <div className="q6-s18-dir">
          <Painel>
            <Previsao rotulo="Antes de revelar" pergunta={`Com todas as ${K_MAX} árvores, a PD média quase não muda. E a curva?`} opcoes={OPS} escolha={esc} onEscolha={escolher} recolher />
            {revelado && <div className="q6-s18-ctl">
              <Controle rotulo="Árvores do boosting" valor={ik} min={0} max={KS.length - 1} passo={1} onChange={setIk} mostrar={`${k}${parado ? " (parada)" : ""}`} />
              <Botao sec onClick={restaurar}>Restaurar</Botao>
            </div>}
          </Painel>
          <Painel titulo={`Validação, ${k} árvores`}>
            <div className="q6-s18-kpis">
              <Kpi tam="mini" tom="prob" rotulo="PD média" valor={pct(e.g.pdMedia!, 1)} detalhe={`taxa ${pct(TAXA.p, 1)} (${pct(TAXA.lo, 1)} a ${pct(TAXA.hi, 1)})`} />
              <Kpi tam="mini" tom="prob" rotulo="Faixas no intervalo" valor={`${e.dentro} de ${NF}`} detalhe="intervalo de Wilson" />
              <Kpi tam="mini" tom="prob" rotulo="Slope de calibração" valor={num(e.s.slope, 2)} detalhe={`IC ${num(e.s.ic[0], 2)} a ${num(e.s.ic[1], 2)}`} />
            </div>
                        {revelado && <p className="q7-nota">Slope abaixo de 1: PDs extremas demais; acima de 1, tímidas demais.</p>}
          </Painel>
        </div>
      </div>
    </Quadro>
  );
}

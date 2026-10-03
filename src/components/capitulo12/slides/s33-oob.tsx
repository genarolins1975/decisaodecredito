"use client";
import { useState } from "react";
import { Eixos, escala, Grafico, Kpi, Painel, Previsao, Quadro, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { Codigo } from "../pecas";
import { FONTE_LUAS, FORA_375, LUAS, N_TESTE_LUAS, N_TREINO_LUAS } from "@/lib/capitulo12/dados";
import { UM_ACERTO } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 33 · c12p33 · A validação out of bag antecipa o teste. Código da aula (BaggingClassifier com oob_score=True,
 * random_state=40); estimativa OOB 0,899 (337 de 375) e acurácia no teste 0,912 (114 de 125), de LUAS.oob (base.json; a
 * aula tinha 0,901 e 338 com outra versão do scikit-learn). Previsão antes de revelar o teste: o comentário do código, o
 * KPI e o ponto do teste na régua ficam ocultos até a tentativa. A régua mostra as duas acurácias com o intervalo de
 * Wilson de 95% (wilson, capítulo 7): a diferença, em pontos e em acertos de teste, cabe com folga no intervalo do teste
 * de 125. Estado inicial: previsão em aberto; "Tentar outra" volta a ele.
 */
const O = LUAS.oob;
const DIF = O.teste - O.oob;
const IC_OOB = wilson(O.oob_acertos, N_TREINO_LUAS)!, IC_TESTE = wilson(O.teste_acertos, N_TESTE_LUAS)!;
if (Math.abs(O.oob_acertos / N_TREINO_LUAS - O.oob) > 1e-4) throw new Error("s33: acertos OOB inconsistentes com a estimativa");
if (!(O.teste >= IC_OOB.lo && O.teste <= IC_OOB.hi && O.oob >= IC_TESTE.lo)) throw new Error("s33: a leitura diz que cada estimativa cabe no intervalo da outra");
const codigo = (rev: boolean) => [
  "bag_clf = BaggingClassifier(",
  "    DecisionTreeClassifier(random_state=42),",
  "    n_estimators=500, bootstrap=True,",
  "    n_jobs=-1, oob_score=True, random_state=40",
  ")",
  "bag_clf.fit(X_train, y_train)",
  `bag_clf.oob_score_  # ${O.oob}`,
  `accuracy_score(y_test, bag_clf.predict(X_test))  # ${rev ? O.teste : "?"}`,
];
const OPS: Opcao[] = [
  { texto: `Perto de ${pct(O.oob, 0)}: a OOB já é uma estimativa fora da amostra`, certa: true, retorno: <>Isso: {pct(O.teste, 1)} no teste ({int(O.teste_acertos)} de {int(N_TESTE_LUAS)}), {num(DIF * 100, 1)} ponto acima da OOB.</> },
  { texto: "Perto de 100%: a OOB é a acurácia no treino", certa: false, retorno: <>Confunde OOB com acurácia no treino. Cada instância é julgada só pelas árvores que não a sortearam, cerca de {pct(FORA_375, 0)} delas (slide {SLIDE.c12p32.n}).</> },
  { texto: "Bem abaixo, uns 80%: toda estimativa feita no treino é otimista", certa: false, retorno: <>A OOB não usa as árvores que viram a instância; por isso não tem o otimismo do treino. No teste: {pct(O.teste, 1)}.</> },
];

export function S33Oob({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const rev = esc !== null;
  const linhas = [
    { r: `Out of bag (${int(N_TREINO_LUAS)} de treino)`, v: O.oob, ic: IC_OOB, on: true },
    { r: `Teste (${int(N_TESTE_LUAS)})`, v: O.teste, ic: IC_TESTE, on: rev },
  ];
  return (
    <Quadro slug="c12p33" pagina={pagina} layout="gl"
      conclusao={rev
        ? <>OOB {num(O.oob, 3)} ({int(O.oob_acertos)} de {int(N_TREINO_LUAS)}) e teste <b>{num(O.teste, 3)}</b> ({int(O.teste_acertos)} de {int(N_TESTE_LUAS)}): {num(DIF * 100, 1)} ponto, menos de {int(Math.ceil(DIF / UM_ACERTO))} acertos de teste, dentro do intervalo de cada um. A floresta aleatória acrescenta um sorteio (slide {SLIDE.c12p34.n}).</>
        : <>A estimativa out of bag é {num(O.oob, 3)} ({int(O.oob_acertos)} de {int(N_TREINO_LUAS)}), sem tocar no teste. Antes de revelar: quanto o mesmo modelo acerta no teste?</>}
      fonte={`${FONTE_LUAS}. Bagging de 500 árvores sem limite de amostra (max_samples padrão), random_state=40. Intervalos de Wilson de 95%. A aula registrava 0,901 (338 de 375) com outra versão.`}>
      <div className="q12-col">
        <Codigo linhas={codigo(rev)} destaque={rev ? [6, 7] : [3, 6]} rotulo="Código do bagging com validação out of bag" compacto />
        <Painel className="q12-s33-g">
          <Grafico titulo="Duas estimativas da acurácia" sub="ponto e intervalo de 95%" arCelular="16 / 7"
            rotulo={`Acurácia out of bag ${pct(O.oob, 1)}, intervalo de ${pct(IC_OOB.lo, 1)} a ${pct(IC_OOB.hi, 1)}${rev ? `; no teste ${pct(O.teste, 1)}, intervalo de ${pct(IC_TESTE.lo, 1)} a ${pct(IC_TESTE.hi, 1)}` : "; teste oculto"}`}>
            {(d) => {
              const lw = d.fs * 10.5;
              const x = escala([0.8, 1], [lw, d.w - d.fs * 1]), y = escala([0, 2], [d.fs * 0.6, d.h - d.fs * 2.4]);
              return (
                <g>
                  <Eixos x={x} y={escala([0, 1], [d.h - d.fs * 2.4, d.fs * 0.2])} xt={[0.8, 0.85, 0.9, 0.95, 1]} yt={[]} fx={(v) => pct(v, 0)} fy={() => ""} grade={false} />
                  {linhas.map((l, i) => {
                    const cy = y(i + 0.5);
                    return (
                      <g key={i}>
                        <text className="q7-rot--peq" x={lw - d.fs * 0.6} y={cy} dy=".35em" textAnchor="end" style={{ fill: "#00205B", fontWeight: 600 }}>{l.r}</text>
                        {l.on ? <>
                          <line x1={x(l.ic.lo)} x2={x(l.ic.hi)} y1={cy} y2={cy} stroke="#176C73" strokeWidth={d.fs * 0.22} strokeLinecap="round" opacity={0.45} />
                          <circle cx={x(l.v)} cy={cy} r={d.fs * 0.42} fill="#176C73" stroke="#fff" strokeWidth={2} />
                          <text className="q7-rot" x={x(l.v)} y={cy} dy="-.9em" textAnchor="middle" style={{ fill: "#176C73" }}>{pct(l.v, 1)}</text>
                        </> : <text className="q7-rot--peq" x={x(0.9)} y={cy} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>? (faça a previsão)</text>}
                      </g>
                    );
                  })}
                </g>
              );
            }}
          </Grafico>
        </Painel>
      </div>
      <Painel className="q12-s33-dir">
        <Previsao pergunta={`A OOB estimou ${pct(O.oob, 1)}. No teste, o mesmo modelo acerta:`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-kpis">
          <Kpi tam="mini" rotulo="Out of bag" valor={num(O.oob, 3)} detalhe={`${int(O.oob_acertos)} de ${int(N_TREINO_LUAS)}`} tom="prob" />
          <Kpi tam="mini" rotulo="Teste" valor={rev ? num(O.teste, 3) : "?"} detalhe={rev ? `${int(O.teste_acertos)} de ${int(N_TESTE_LUAS)}` : "oculto"} tom={rev ? "prob" : undefined} />
        </div>
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li><b>oob_score=True</b>: cada instância é avaliada só pelas árvores que não a usaram no treino. A validação vem sem custo adicional.</li>
        </ul>
      </Painel>
    </Quadro>
  );
}

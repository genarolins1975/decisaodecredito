"use client";
import { useState } from "react";
import { Botao, LinkSlide, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { VERSOES } from "@/lib/capitulo12/dados";

/**
 * 52 · c12p52 · Apêndice de referências. Para cada método da aula, a fonte primária, o que ela resolve e o slide em que
 * o método aparece funcionando; no grupo "Além da aula", os métodos atuais que a aula não demonstra (importância por
 * permutação e SHAP, boosting por histograma, stacking e o benchmark de classificadores em crédito), com quando usar.
 * Material de consulta: o seletor filtra o grupo; Restaurar volta a "Métricas".
 */
type Ref = { quem: string; obra: string; resolve: string; slides: string[] };
const GRUPOS: { id: string; nome: string; refs: Ref[] }[] = [
  { id: "met", nome: "Métricas", refs: [
    { quem: "Géron (2022)", obra: "Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow, 3ª ed., O'Reilly, caps. 3 e 7", resolve: "Base dos exemplos da aula: MNIST, detector de 5, luas, ensembles.", slides: ["c12p4", "c12p23"] },
    { quem: "Saito e Rehmsmeier (2015)", obra: "PLoS ONE 10(3): e0118432", resolve: "Com classe rara, precisão e recall informam mais que a ROC.", slides: ["c12p10", "c12p18"] },
    { quem: "Fawcett (2006)", obra: "An introduction to ROC analysis, Pattern Recognition Letters 27(8)", resolve: "ROC, AUC como probabilidade de ordenar um par, curvas que se cruzam.", slides: ["c12p19", "c12p20", "c12p21"] },
    { quem: "Elkan (2001)", obra: "The foundations of cost-sensitive learning, IJCAI", resolve: "O limiar ótimo sai da razão entre os custos dos dois erros.", slides: ["c12p16"] },
  ] },
  { id: "ens", nome: "Ensembles", refs: [
    { quem: "Hansen e Salamon (1990)", obra: "Neural network ensembles, IEEE TPAMI 12(10)", resolve: "Voto por maioria de classificadores independentes e o limite da correlação.", slides: ["c12p24"] },
    { quem: "Breiman (1996)", obra: "Bagging predictors, Machine Learning 24(2)", resolve: "Bagging reduz a variância de modelos instáveis como a árvore.", slides: ["c12p29", "c12p31"] },
    { quem: "Breiman (2001)", obra: "Random forests, Machine Learning 45(1)", resolve: "Sorteio de características por divisão e estimativa out of bag.", slides: ["c12p33", "c12p34"] },
    { quem: "Friedman (2001)", obra: "Greedy function approximation: a gradient boosting machine, Annals of Statistics 29(5)", resolve: "Cada árvore ajusta o gradiente negativo da perda, com taxa de aprendizado.", slides: ["c12p37"] },
  ] },
  { id: "cre", nome: "Crédito", refs: [
    { quem: "BCBS (2005)", obra: "Studies on the Validation of Internal Rating Systems, Working Paper 14", resolve: "Validação fora do tempo e estabilidade da ordenação entre safras.", slides: ["c12p41", "c12p42"] },
    { quem: "Siddiqi (2017)", obra: "Intelligent Credit Scoring, 2ª ed., Wiley", resolve: "Peso de evidência e valor da informação, com a régua de força do IV.", slides: ["c12p50"] },
    { quem: "Lessmann et al. (2015)", obra: "Benchmarking state-of-the-art classification algorithms for credit scoring, EJOR 247(1)", resolve: "Em oito bases de crédito, ensembles heterogêneos superaram a logística, que segue o padrão da indústria.", slides: ["c12p38"] },
  ] },
  { id: "alem", nome: "Além da aula", refs: [
    { quem: "Strobl et al. (2007)", obra: "Bias in random forest variable importance measures, BMC Bioinformatics 8:25", resolve: "A importância por impureza favorece variáveis com muitos cortes; use a importância por permutação para conferir.", slides: [] },
    { quem: "Lundberg e Lee (2017)", obra: "A unified approach to interpreting model predictions, NeurIPS", resolve: "SHAP explica a previsão de cada contrato; exigência de explicação ao cliente e ao validador.", slides: [] },
    { quem: "Chen e Guestrin (2016); Ke et al. (2017)", obra: "XGBoost, KDD; LightGBM, NeurIPS", resolve: "Boosting com regularização e histogramas: o padrão atual em bases tabulares grandes.", slides: [] },
    { quem: "Wolpert (1992)", obra: "Stacked generalization, Neural Networks 5(2)", resolve: "Um segundo modelo aprende a combinar os votos, em vez de contá-los.", slides: [] },
  ] },
];

export function S52Referencias({ pagina }: { pagina?: Pagina }) {
  const [g, setG] = useState("met");
  const grupo = GRUPOS.find((x) => x.id === g)!;
  return (
    <Quadro slug="c12p52" pagina={pagina} layout="um" rotuloConclusao="Consulta"
      conclusao={<>Cada método da aula tem fonte primária e um slide em que aparece funcionando; o grupo <b>Além da aula</b> traz o que a prática atual acrescenta e quando usar.</>}
      fonte={`Referências conferidas em outubro de 2026. Cálculos da aula: ${VERSOES}.`}>
      <Painel className="q12-s52">
        <div className="q12-lin">
          <Seg rotulo="Grupo de referências" opcoes={GRUPOS.map((x) => ({ v: x.id, r: x.nome }))} valor={g} onChange={setG} />
          <Botao sec onClick={() => setG("met")} desab={g === "met"}>Restaurar</Botao>
        </div>
        <ul className="q12-s52-l">
          {grupo.refs.map((r) => (
            <li key={r.quem}>
              <p className="q12-s52-q"><b>{r.quem}</b> <span>{r.obra}</span></p>
              <p className="q12-s52-r">{r.resolve}</p>
              <p className="q12-s52-s">{r.slides.length ? <>Na aula: {r.slides.map((s, i) => <span key={s}>{i ? ", " : ""}<LinkSlide slug={s}>slide {SLIDE[s].n}</LinkSlide></span>)}</> : "Fora da aula: leitura recomendada."}</p>
            </li>
          ))}
        </ul>
      </Painel>
    </Quadro>
  );
}

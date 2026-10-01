"use client";
import { useState } from "react";
import { Formula, LinkSlide, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares } from "@/lib/capitulo7/metricas";
import { num } from "@/lib/capitulo7/formato";

/**
 * 38 · c7p19 · Apêndice de consulta: fórmulas do capítulo, métricas fora do protocolo (com o motivo), referências
 * primárias e documentação, versões e sementes para reproduzir. Fora do percurso da aula.
 */
type Aba = "formulas" | "fora" | "refs" | "repro";
const AUC = aucPorPares(Y, PL).auc!;
const FORMULAS: [string, string, string, [string, string][]?][] = [
  ["AUC por pares", String.raw`\mathrm{AUC}=\frac{C+\tfrac12 E}{n_1\,n_0}`, "c7p22"],
  ["KS", String.raw`\mathrm{KS}=\max_t\,\big|F_1(t)-F_0(t)\big|`, "c7p7"],
  ["Ganho e lift na fração examinada", String.raw`G(q)=\frac{D_q}{n_1},\qquad L(q)=\frac{G(q)}{q}`, "c7p8", [["D_q", "defaults entre os ⌊qn + ½⌋ piores da fila"]]],
  ["Intervalo de Wilson", String.raw`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`, "c7p31"],
  ["Brier e decomposição de Murphy", String.raw`\mathrm{BS}=\tfrac1n\sum(p_i-y_i)^2=\mathrm{REL}-\mathrm{RES}+\mathrm{UNC}`, "c7p11"],
  ["Log loss", String.raw`\mathrm{LL}=-\tfrac1n\sum\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]`, "c7p34"],
  ["Platt e ajuste de intercepto", String.raw`p'=\sigma\big(a+b\,\operatorname{logit}p\big),\quad b>0`, "c7p13", [["b=1", "só o intercepto (slide 28)"]]],
  ["Calibração: intercepto e slope", String.raw`\operatorname{logit}P(y=1)=\alpha+\beta\,\operatorname{logit}p,\quad \text{ideal } \alpha=0,\ \beta=1`, "c7p32"],
];
const FORA: [string, string][] = [
  ["Gini ou razão de acurácia (AR)", `Igual a 2 × AUC − 1 (${num(2 * AUC - 1, 4)} na janela). Não traz informação nova; aparece em relatórios e regulação, por isso convém saber converter.`],
  ["Acurácia", "Depende da prevalência e de um corte; com evento raro, aprovar todos acerta quase tudo (slide 3). Não mede ordenação nem probabilidade."],
  ["Teste de Hosmer e Lemeshow", "Muda com o número de faixas e rejeita quase tudo em amostras grandes; a curva de confiabilidade com intervalos diz mais."],
  ["Erro de calibração esperado (ECE)", "Média ponderada das distâncias por faixa: depende da escolha das faixas (slide 20) e não tem escala de referência."],
  ["Índice de estabilidade populacional (PSI)", "Mede mudança de distribuição entre amostras, não qualidade do modelo; é ferramenta de monitoramento."],
];
const REFS: string[] = [
  "Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review, 78(1).",
  "Cox, D. R. (1958). Two further applications of a model for binary regression. Biometrika, 45(3/4).",
  "DeLong, E. R.; DeLong, D. M.; Clarke-Pearson, D. L. (1988). Comparing the areas under two or more correlated receiver operating characteristic curves: a nonparametric approach. Biometrics, 44(3).",
  "Efron, B.; Tibshirani, R. J. (1993). An Introduction to the Bootstrap. Chapman & Hall.",
  "Fawcett, T. (2006). An introduction to ROC analysis. Pattern Recognition Letters, 27(8).",
  "Hanley, J. A.; McNeil, B. J. (1982). The meaning and use of the area under a receiver operating characteristic (ROC) curve. Radiology, 143(1).",
  "Murphy, A. H. (1973). A new vector partition of the probability score. Journal of Applied Meteorology, 12(4).",
  "Niculescu-Mizil, A.; Caruana, R. (2005). Predicting good probabilities with supervised learning. ICML.",
  "Platt, J. (1999). Probabilistic outputs for support vector machines and comparisons to regularized likelihood methods. Advances in Large Margin Classifiers, MIT Press.",
  "Stephenson, D. B.; Coelho, C. A. S.; Jolliffe, I. T. (2008). Two extra components in the Brier score decomposition. Weather and Forecasting, 23(4).",
  "Sun, X.; Xu, W. (2014). Fast implementation of DeLong's algorithm for comparing the areas under correlated receiver operating characteristic curves. IEEE Signal Processing Letters, 21(11).",
  "Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association, 22(158).",
  "Zadrozny, B.; Elkan, C. (2002). Transforming classifier scores into accurate multiclass probability estimates. KDD.",
  "Basel Committee on Banking Supervision (2005). Studies on the Validation of Internal Rating Systems. Working Paper 14.",
  "scikit-learn: Probability calibration (scikit-learn.org/stable/modules/calibration.html) e as funções roc_auc_score, average_precision_score, brier_score_loss, log_loss.",
];
const REPRO: [string, string][] = [
  ["Base do curso", "gerador sintético, semente 20260501; data de referência 31/01/2025"],
  ["Referência numérica", "Python 3.11, scikit-learn 1.9.1, SciPy 1.17.1, statsmodels 0.15.0, NumPy 2.4.6 (scripts/capitulo7/referencia.py)"],
  ["Conferência", "tests/capitulo7-metricas.test.ts compara cada função com a referência"],
  ["Sementes", "amostra de calibração 20261001; disputa 20261006; laboratório 20261015; PD coletiva 20261017 + k; bootstrap 20260501; janelas novas 20261033; reabertura 20261035 e 20261036; embaralhamento 7"],
  ["Convenções", "recusa quando PD ≥ corte; faixas e ganho com ⌊x + ½⌋; empate vale meio par; log natural com limite de 10⁻¹⁵"],
];

export function S38Apendice({ pagina }: { pagina?: Pagina }) {
  const [aba, setAba] = useState<Aba>("formulas");
  return (
    <Quadro slug="c7p19" pagina={pagina} layout="um"
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Material de consulta: o percurso da aula termina no slide 37.`}>
      <Painel>
        <Seg rotulo="Seção do apêndice" opcoes={[{ v: "formulas" as Aba, r: "Fórmulas" }, { v: "fora" as Aba, r: "Fora do protocolo" }, { v: "refs" as Aba, r: "Referências" }, { v: "repro" as Aba, r: "Reprodução" }]} valor={aba} onChange={setAba} cor />
        {aba === "formulas" && (
          <div className="q7-s38-f">{FORMULAS.map(([t, f, s, sb]) => <div key={t}><p className="q7-k"><LinkSlide slug={s} className="q7-s38-l">{t}</LinkSlide></p><Formula f={f} simbolos={sb} /></div>)}</div>
        )}
        {aba === "fora" && <dl className="q7-s38-d">{FORA.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}</dl>}
        {aba === "refs" && <ol className="q7-s38-r">{REFS.map((r) => <li key={r}>{r}</li>)}</ol>}
        {aba === "repro" && <dl className="q7-s38-d">{REPRO.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}</dl>}
      </Painel>
    </Quadro>
  );
}

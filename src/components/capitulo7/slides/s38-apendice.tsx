"use client";
import { useState } from "react";
import { Formula, LinkSlide, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares } from "@/lib/capitulo7/metricas";
import { SLIDE } from "@/lib/capitulo7/roteiro";
import { PARAMETROS } from "@/lib/visuais/economia";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 38 · c7p19 · Apêndice de consulta: fórmulas do capítulo, métricas fora do protocolo (com o motivo), fronteira do
 * tema e regulação (o que cada método resolve e quando usar), referências primárias e documentação, versões e
 * sementes para reproduzir. Fora do percurso da aula. Rodada 3: as fórmulas se dividem em duas abas, a de medir e a de
 * comparar e decidir (perda esperada pela PD verdadeira, que decide os slides 27 a 29; E(c) do motor; DeLong e
 * bootstrap pareado); as referências se agrupam por tema, cada uma com o que sustenta e o slide que a usa.
 */
type Aba = "formulas" | "comparar" | "fora" | "fronteira" | "refs" | "repro";
type Grupo = "ord" | "medir" | "calibrar" | "decval" | "reg";
const AUC = aucPorPares(Y, PL).auc!;
const FORMULAS: [string, string, string, [string, string][]?][] = [
  ["AUC por pares", String.raw`\mathrm{AUC}=\frac{C+\tfrac12 E}{n_1\,n_0}`, "c7p22"],
  ["KS", String.raw`\mathrm{KS}=\max_t\big[F_0(t)-F_1(t)\big]=\max_t\,(\mathrm{TPR}_t-\mathrm{FPR}_t)`, "c7p7", [["F_0,\\ F_1", "acumuladas da PD em adimplentes e em defaults, sem módulo"]]],
  ["Ganho e lift na fração examinada", String.raw`G(q)=\frac{D_q}{n_1},\qquad L(q)=\frac{G(q)}{q}`, "c7p8", [["D_q", "defaults entre os ⌊qn + ½⌋ piores da fila"]]],
  ["Intervalo de Wilson", String.raw`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`, "c7p31"],
  ["Brier e decomposição de Murphy", String.raw`\mathrm{BS}=\tfrac1n\sum(p_i-y_i)^2=\mathrm{REL}-\mathrm{RES}+\mathrm{UNC}+\text{resíduo}`, "c7p11", [["\\text{resíduo}", "zero só com PD constante por faixa (Stephenson e outros, 2008)"]]],
  ["Log loss", String.raw`\mathrm{LL}=-\tfrac1n\sum\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]`, "c7p34"],
  ["Platt e ajuste de intercepto", String.raw`p'=\sigma\big(a+b\,\operatorname{logit}p\big),\quad b>0`, "c7p13", [["b=1", "só o intercepto (slide 28)"]]],
  ["Calibração: intercepto e slope", String.raw`\operatorname{logit}P(y=1)=\alpha+\beta\,\operatorname{logit}p,\quad \text{ideal } \alpha=0,\ \beta=1`, "c7p32"],
];
const dec = (v: number) => num(v, 2).replace(",", "{,}");
const COMPARAR: [string, string, string, [string, string][]?][] = [
  ["Perda esperada pela PD verdadeira", String.raw`\begin{aligned}\mathbb{E}[\mathrm{LL}]&=-\tfrac1n\textstyle\sum\big[\pi_i\ln p_i+(1-\pi_i)\ln(1-p_i)\big]\\ \mathbb{E}[\mathrm{BS}]&=\tfrac1n\textstyle\sum\big[\pi_i(1-p_i)^2+(1-\pi_i)\,p_i^2\big]\end{aligned}`, "c7p16", [["\\pi_i", "PD verdadeira da proposta i, só em base sintética"], ["p_i=\\pi_i", "minimiza as duas: Brier e log loss são regras de pontuação próprias (Gneiting e Raftery, 2007)"]]],
  ["Resultado esperado no corte c", String.raw`\begin{aligned}E(c)=\!\!\sum_{\mathrm{PD}_i<c}\!\!\big[&${dec(PARAMETROS.receita)}X_i(1-\mathrm{PD}_i)-${dec(PARAMETROS.lgd)}X_i\mathrm{PD}_i\\ &-${dec(PARAMETROS.funding + PARAMETROS.capital)}X_i-${PARAMETROS.operacao}\big]\end{aligned}`, "c7p18", [["X_i", `exposição; receita ${pct(PARAMETROS.receita, 0)}, perda ${pct(PARAMETROS.lgd, 0)}, funding e capital ${pct(PARAMETROS.funding + PARAMETROS.capital, 0)}, custo de R$\u00a0${PARAMETROS.operacao}`], ["\\mathrm{PD}_i\\to\\pi_i", "o mesmo corte avaliado pela PD verdadeira, sem a sorte da janela"]]],
  ["DeLong: erro padrão da diferença de AUCs", String.raw`\begin{aligned}\widehat{\mathrm{Var}}(\hat A_1-\hat A_2)={}&\frac{S^{10}_{11}+S^{10}_{22}-2S^{10}_{12}}{n_1}\\&+\frac{S^{01}_{11}+S^{01}_{22}-2S^{01}_{12}}{n_0}\end{aligned}`, "c7p14", [["S^{10}_{jk}", "covariância, entre os defaults, da fração de adimplentes que cada um supera nos modelos j e k"], ["S^{01}_{jk}", "o mesmo entre os adimplentes; IC: diferença ± 1,96 × EP"]]],
  ["Bootstrap pareado, intervalo percentil", String.raw`\begin{aligned}\hat\Delta^{*b}&=\hat A_1(S^{*b})-\hat A_2(S^{*b})\\ \mathrm{IC}&=\big[q_{0{,}025}(\hat\Delta^{*}),\ q_{0{,}975}(\hat\Delta^{*})\big]\end{aligned}`, "c7p14", [["S^{*b}", "n propostas sorteadas com reposição, as mesmas para os dois modelos"]]],
];
const FORA: [string, string][] = [
  ["Gini ou razão de acurácia (AR)", `Igual a 2 × AUC − 1 (${num(2 * AUC - 1, 4)} na janela; Engelmann, Hayden e Tasche, 2003). Não traz informação nova; aparece em relatórios e regulação, por isso convém saber converter.`],
  ["Acurácia", `Depende da prevalência e de um corte; com evento raro, aprovar todos acerta ${pct(1 - D / N, 1)} da janela (slide 3). Não mede ordenação nem probabilidade.`],
  ["Teste de Hosmer e Lemeshow (1980)", "Muda com o número de faixas e rejeita quase tudo em amostras grandes; a curva de confiabilidade com intervalos diz mais."],
  ["Erro de calibração esperado (ECE; Naeini, Cooper e Hauskrecht, 2015)", "Média ponderada das distâncias por faixa: depende da escolha das faixas (slide 20) e não tem escala de referência."],
  ["Índice de estabilidade populacional (PSI)", "Mede mudança de distribuição entre amostras, não qualidade do modelo; é ferramenta de monitoramento."],
];
const FRONTEIRA: [string, string, string?][] = [
  ["Diagrama CORP e decomposição MCB, DSC, UNC", "A isotônica escolhe os blocos no lugar do analista e separa o Brier em erro de calibração, discriminação e incerteza. Use para diagnosticar; não é calibrador para outra amostra.", "c7p30"],
  ["Teste de Jeffreys por faixa", "O teste que o BCE pede no backtesting de PD: p = F_Beta(PD; d + ½, n − d + ½). Com muitas faixas, conte os p pequenos esperados ao acaso.", "c7p31"],
  ["Beta calibration e temperature scaling", "Beta calibration: σ(c + a ln p − b ln(1 − p)); com a = b, recai no Platt sobre o logit. Use quando a curva de confiabilidade distorce de modo diferente nas duas caudas. Temperature scaling é o Platt sem intercepto, padrão em redes neurais."],
  ["Venn-Abers e predição conformal", "Calibradores com garantia de validade em amostra finita, supondo observações trocáveis (por exemplo, independentes e de mesma distribuição); entregam um par de probabilidades cuja distância mostra a incerteza do próprio calibrador. Use com amostra de calibração pequena, quando importa a incerteza da PD de cada grau."],
  ["Benefício líquido e curva de decisão", "Mede o valor do modelo em cada limiar: acertos menos falsos positivos ponderados por pt ÷ (1 − pt), a razão implícita no limiar. Ponte entre calibração e decisão quando não há custos completos; o capítulo não a calcula: usa o resultado esperado em reais."],
  ["Calibração por segmento e multicalibração", "Calibrar na carteira não garante calibrar em cada segmento (produto, canal, região). Multicalibração exige calibração em todo subgrupo identificável; na prática, repita a curva por segmento relevante."],
  ["PD de longo prazo e ajuste ao ciclo", "Para capital regulatório (abordagem IRB), a PD por grau é calibrada à média de longo prazo das taxas de default, cobrindo um ciclo econômico; para provisão, a perda esperada usa informação corrente e prospectiva. No caso, a finalidade escolhe a amostra do nível: provisão, a safra maturada mais recente; capital, várias safras.", "c7p38"],
  ["Provisão por perda esperada no Brasil", "Desde 1/1/2025, a Resolução CMN 4.966/2021 (com a Resolução BCB 352/2023) baseia a provisão na perda esperada: PD mal calibrada vira provisão errada.", "c7p28"],
];
/** Referências por tema: o que cada uma sustenta no capítulo, o slide que a usa (ou a aba do apêndice) e a citação. */
const GRUPOS: { v: Grupo; r: string }[] = [{ v: "ord", r: "Ordenação" }, { v: "medir", r: "Medir a probabilidade" }, { v: "calibrar", r: "Calibrar" }, { v: "decval", r: "Decisão e validação" }, { v: "reg", r: "Regulação e software" }];
const REFS: { g: Grupo; quem: string; usa: string; onde: string; cit: string }[] = [
  { g: "ord", quem: "Hanley e McNeil (1982)", usa: "AUC como chance de o default receber a PD maior", onde: "c7p5", cit: "The meaning and use of the area under a receiver operating characteristic (ROC) curve. Radiology, 143(1)." },
  { g: "ord", quem: "Fawcett (2006)", usa: "curva ROC e o que ela percorre", onde: "c7p6", cit: "An introduction to ROC analysis. Pattern Recognition Letters, 27(8)." },
  { g: "ord", quem: "Engelmann, Hayden e Tasche (2003)", usa: "AR = 2 × AUC − 1 em rating de crédito", onde: "Fora do protocolo", cit: "Testing rating accuracy. Risk, 16(1), 82 a 86." },
  { g: "ord", quem: "Saito e Rehmsmeier (2015)", usa: "precisão e recall com evento raro", onde: "c7p26", cit: "The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. PLoS ONE, 10(3)." },
  { g: "medir", quem: "Brier (1950)", usa: "o escore de Brier", onde: "c7p33", cit: "Verification of forecasts expressed in terms of probability. Monthly Weather Review, 78(1), 1 a 3." },
  { g: "medir", quem: "Gneiting e Raftery (2007)", usa: "Brier e log loss como regras de pontuação próprias", onde: "c7p16", cit: "Strictly proper scoring rules, prediction, and estimation. JASA, 102(477)." },
  { g: "medir", quem: "Murphy (1973)", usa: "decomposição do Brier", onde: "c7p11", cit: "A new vector partition of the probability score. Journal of Applied Meteorology, 12(4), 595 a 600." },
  { g: "medir", quem: "Stephenson, Coelho e Jolliffe (2008)", usa: "o resíduo da decomposição com faixas", onde: "c7p11", cit: "Two extra components in the Brier score decomposition. Weather and Forecasting, 23(4)." },
  { g: "medir", quem: "Cox (1958)", usa: "intercepto e slope de calibração", onde: "c7p32", cit: "Two further applications of a model for binary regression. Biometrika, 45(3/4), 562 a 565." },
  { g: "medir", quem: "Wilson (1927)", usa: "intervalo da taxa observada", onde: "c7p31", cit: "Probable inference, the law of succession, and statistical inference. JASA, 22(158)." },
  { g: "medir", quem: "Van Calster e outros (2019)", usa: "a curva de confiabilidade como diagnóstico", onde: "c7p10", cit: "Calibration: the Achilles heel of predictive analytics. BMC Medicine, 17, 230." },
  { g: "medir", quem: "Dimitriadis, Gneiting e Jordan (2021)", usa: "diagrama CORP e decomposição MCB, DSC, UNC", onde: "c7p30", cit: "Stable reliability diagrams for probabilistic classifiers. PNAS, 118(8), e2016191118." },
  { g: "medir", quem: "Hosmer e Lemeshow (1980)", usa: "o teste deixado fora do protocolo", onde: "Fora do protocolo", cit: "Goodness of fit tests for the multiple logistic regression model. Communications in Statistics: Theory and Methods, 9(10)." },
  { g: "medir", quem: "Naeini, Cooper e Hauskrecht (2015)", usa: "o ECE, deixado fora do protocolo", onde: "Fora do protocolo", cit: "Obtaining well calibrated probabilities using Bayesian binning. AAAI." },
  { g: "calibrar", quem: "Platt (2000)", usa: "Platt e a suavização de alvos do scikit-learn", onde: "c7p13", cit: "Probabilistic outputs for support vector machines and comparisons to regularized likelihood methods. Em Smola, Bartlett, Schölkopf e Schuurmans (orgs.), Advances in Large Margin Classifiers, MIT Press, 61 a 74." },
  { g: "calibrar", quem: "Zadrozny e Elkan (2002)", usa: "regressão isotônica como calibrador", onde: "c7p36", cit: "Transforming classifier scores into accurate multiclass probability estimates. KDD." },
  { g: "calibrar", quem: "Niculescu-Mizil e Caruana (2005)", usa: "Platt contra isotônica por tamanho de amostra", onde: "c7p36", cit: "Predicting good probabilities with supervised learning. ICML." },
  { g: "calibrar", quem: "Kull, Silva Filho e Flach (2017)", usa: "beta calibration", onde: "Fronteira", cit: "Beta calibration: a well-founded and easily implemented improvement on logistic calibration for binary classifiers. AISTATS." },
  { g: "calibrar", quem: "Guo, Pleiss, Sun e Weinberger (2017)", usa: "temperature scaling", onde: "Fronteira", cit: "On calibration of modern neural networks. ICML." },
  { g: "calibrar", quem: "Vovk e Petej (2014)", usa: "Venn-Abers", onde: "Fronteira", cit: "Venn-Abers predictors. UAI." },
  { g: "calibrar", quem: "Hébert-Johnson, Kim, Reingold e Rothblum (2018)", usa: "multicalibração", onde: "Fronteira", cit: "Multicalibration: calibration for the (computationally-identifiable) masses. ICML." },
  { g: "decval", quem: "Elkan (2001)", usa: "corte pelo custo, não pela métrica", onde: "c7p18", cit: "The foundations of cost-sensitive learning. IJCAI, 973 a 978." },
  { g: "decval", quem: "Vickers e Elkin (2006)", usa: "benefício líquido e curva de decisão", onde: "Fronteira", cit: "Decision curve analysis: a novel method for evaluating prediction models. Medical Decision Making, 26(6)." },
  { g: "decval", quem: "DeLong, DeLong e Clarke-Pearson (1988)", usa: "diferença de AUCs na mesma amostra", onde: "c7p15", cit: "Comparing the areas under two or more correlated receiver operating characteristic curves: a nonparametric approach. Biometrics, 44(3)." },
  { g: "decval", quem: "Sun e Xu (2014)", usa: "implementação rápida equivalente de DeLong (o capítulo usa a direta, por pares)", onde: "c7p14", cit: "Fast implementation of DeLong's algorithm for comparing the areas under correlated receiver operating characteristic curves. IEEE Signal Processing Letters, 21(11)." },
  { g: "decval", quem: "Efron e Tibshirani (1993)", usa: "bootstrap e intervalo percentil", onde: "c7p14", cit: "An Introduction to the Bootstrap. Chapman & Hall." },
  { g: "reg", quem: "BCE (2019)", usa: "teste de Jeffreys no backtesting de PD", onde: "c7p31", cit: "Instructions for reporting the validation results of internal models: IRB Pillar I models for credit risk. ECB Banking Supervision, fevereiro de 2019." },
  { g: "reg", quem: "EBA (2017)", usa: "PD de longo prazo por grau", onde: "Fronteira", cit: "Guidelines on PD estimation, LGD estimation and the treatment of defaulted exposures. EBA/GL/2017/16." },
  { g: "reg", quem: "Comitê de Basileia (2005)", usa: "validação de sistemas de rating", onde: "c7p17", cit: "Studies on the Validation of Internal Rating Systems. Working Paper 14." },
  { g: "reg", quem: "CMN e BCB", usa: "provisão por perda esperada desde 1/1/2025", onde: "c7p28", cit: "Resolução CMN 4.966/2021; Resolução BCB 352/2023." },
  { g: "reg", quem: "scikit-learn", usa: "a referência numérica das métricas", onde: "Reprodução", cit: "Probability calibration (scikit-learn.org/stable/modules/calibration.html); roc_auc_score, average_precision_score, brier_score_loss, log_loss." },
];
const REPRO: [string, string][] = [
  ["Base do curso", "gerador sintético, semente 20260501; data de referência 31/01/2025"],
  ["Referência numérica", "Python 3.11, scikit-learn 1.9.1, SciPy 1.17.1, statsmodels 0.15.0, NumPy 2.4.6 (scripts/capitulo7/referencia.py)"],
  ["Conferência", "tests/capitulo7-metricas.test.ts compara cada função com a referência"],
  ["Sementes", "amostra de calibração 20261001; disputa 20261006; laboratório 20261015; PD coletiva 20261017 + k; bootstrap 20260501; réplicas sintéticas da janela 20261033 (slides 27, 33, 34, 35, 36 e 37); candidatos da reabertura 20261035; embaralhamento 7"],
  ["Convenções", "recusa quando PD ≥ corte; faixas e ganho com ⌊x + ½⌋; empate vale meio par; log natural com limite de 10⁻¹⁵"],
];

function Onde({ onde }: { onde: string }) {
  const sl = SLIDE[onde];
  return sl ? <LinkSlide slug={onde} className="q7-s38-l">slide&nbsp;{sl.n}</LinkSlide> : <span>aba {onde}</span>;
}

export function S38Apendice({ pagina }: { pagina?: Pagina }) {
  const [aba, setAba] = useState<Aba>("formulas");
  const [grupo, setGrupo] = useState<Grupo>("ord");
  const formulas = (lista: typeof COMPARAR) => <div className="q7-s38-f">{lista.map(([t, f, sl, sb]) => <div key={t}><p className="q7-k"><LinkSlide slug={sl} className="q7-s38-l">{t}</LinkSlide></p><Formula f={f} simbolos={sb} /></div>)}</div>;
  return (
    <Quadro slug="c7p19" pagina={pagina} layout="um"
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Material de consulta: o percurso da aula termina no slide 37.`}>
      <Painel>
        <Seg rotulo="Seção do apêndice" opcoes={[{ v: "formulas" as Aba, r: "Fórmulas para medir" }, { v: "comparar" as Aba, r: "Para comparar e decidir" }, { v: "fora" as Aba, r: "Fora do protocolo" }, { v: "fronteira" as Aba, r: "Fronteira e regulação" }, { v: "refs" as Aba, r: "Referências" }, { v: "repro" as Aba, r: "Reprodução" }]} valor={aba} onChange={setAba} cor />
        {aba === "formulas" && formulas(FORMULAS)}
        {aba === "comparar" && formulas(COMPARAR)}
        {aba === "fora" && <dl className="q7-s38-d">{FORA.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}</dl>}
        {aba === "fronteira" && <dl className="q7-s38-d q7-s38-d--2">{FRONTEIRA.map(([t, v, sl]) => <div key={t}><dt>{sl ? <LinkSlide slug={sl} className="q7-s38-l">{t}</LinkSlide> : t}</dt><dd>{v}</dd></div>)}</dl>}
        {aba === "refs" && (
          <>
            <Seg rotulo="Tema das referências" opcoes={GRUPOS} valor={grupo} onChange={setGrupo} />
            <ul className="q7-s38-rf">{REFS.filter((r) => r.g === grupo).map((r) => (
              <li key={r.quem}><p className="q7-s38-rf-u"><b>{r.quem}</b>: {r.usa} (<Onde onde={r.onde} />).</p><p className="q7-s38-rf-c">{r.cit}</p></li>
            ))}</ul>
          </>
        )}
        {aba === "repro" && <dl className="q7-s38-d">{REPRO.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}</dl>}
      </Painel>
    </Quadro>
  );
}

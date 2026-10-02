"use client";
import { useState } from "react";
import { Formula, LinkSlide, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV } from "@/lib/capitulo6/dados";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 22 · c6p22 · Apêndice de consulta, fora do percurso da aula: fórmulas do capítulo (cada uma com o slide em que
 * aparece), fronteira do tema (XGBoost, LightGBM, CatBoost, EBM e GA2M, árvores contra redes em dados tabulares,
 * explicações contrafactuais: o que cada um resolve e quando usar), referências primárias do checklist de estado da
 * arte (references/estado-da-arte.md, capítulo 6) e reprodução (sementes, versões, scripts e teste).
 */
type Aba = "formulas" | "fronteira" | "metodo" | "validacao" | "repro";
const FORMULAS: [string, string, string][] = [
  ["Palpite inicial", String.raw`F_0=\ln\frac{\bar p}{1-\bar p}`, "c6p3"],
  ["Pseudo-resíduo (log loss)", String.raw`r_{im}=y_i-\sigma\big(F_{m-1}(x_i)\big)`, "c6p4"],
  ["Valor da folha: passo de Newton", String.raw`\gamma_{jm}=\frac{\sum_{i\in R_{jm}} r_{im}}{\sum_{i\in R_{jm}} p_i(1-p_i)}`, "c6p6"],
  ["Atualização com a taxa de aprendizagem", String.raw`F_m(x)=F_{m-1}(x)+\eta\sum_j\gamma_{jm}\,\mathbf 1(x\in R_{jm})`, "c6p7"],
  ["Log loss", String.raw`L=-\tfrac1n\sum_i\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]`, "c6p15"],
  ["Contribuição de Shapley", String.raw`\phi_j=\sum_{S\subseteq N\setminus\{j\}}\tfrac{|S|!\,(n-|S|-1)!}{n!}\big[v(S\cup\{j\})-v(S)\big]`, "c6p19"],
  ["Dependência parcial", String.raw`\bar p_j(z)=\tfrac1n\sum_i\sigma\big(F(z,\,x_{i,-j})\big)`, "c6p20"],
  ["Monotonia (+1) num corte", String.raw`\gamma_{\text{esq}}\le\gamma_{\text{dir}},\ \text{com limites herdados pelos filhos}`, "c6p20"],
];
const FRONTEIRA: [string, string, string][] = [
  ["XGBoost", "Chen e Guestrin (2016)", "Penalidade L2 e custo por folha dentro do ganho: a folha vira Σg ÷ (Σh + λ). Use com ausentes e regularização explícita."],
  ["LightGBM", "Ke et al. (2017)", "Histogramas e sorteio por gradiente aceleram bases de milhões de linhas. Use em base grande; em base pequena, limite as folhas."],
  ["CatBoost", "Prokhorenkova et al. (2018)", "Codifica categóricas pela taxa de default em ordem, sem vazamento do alvo. Use com CEP, CNAE ou loja."],
  ["EBM e GA2M", "Lou et al. (2013); Nori et al. (2019)", "Uma curva por variável e poucos pares, ajustados por boosting: o modelo inteiro se lê. Use quando o validador audita a forma."],
  ["Árvores contra redes", "Grinsztajn et al. (2022)", "Em dados tabulares médios, boosting e florestas superam redes profundas; redes servem a texto, imagem e sequências."],
  ["Explicação contrafactual", "Wachter et al. (2018)", "A menor mudança que troca a decisão. Use em motivo de recusa; com monotonia (slide 20), ela não pede piorar o cliente."],
];
const REFS_METODO: string[] = [
  "Friedman (2001). Greedy function approximation: a gradient boosting machine. Annals of Statistics 29(5).",
  "Friedman, Hastie e Tibshirani (2000). Additive logistic regression. Annals of Statistics 28(2).",
  "Friedman (2002). Stochastic gradient boosting. Computational Statistics & Data Analysis 38(4).",
  "Hastie, Tibshirani e Friedman (2009). The Elements of Statistical Learning, 2ª ed., cap. 10.",
  "Chen e Guestrin (2016). XGBoost: a scalable tree boosting system. KDD.",
  "Ke et al. (2017). LightGBM. NeurIPS.",
  "Prokhorenkova et al. (2018). CatBoost: unbiased boosting with categorical features. NeurIPS.",
  "Lou, Caruana, Gehrke e Hooker (2013). Accurate intelligible models with pairwise interactions. KDD.",
  "Nori, Jenkins, Koch e Caruana (2019). InterpretML. arXiv:1909.09223.",
  "Grinsztajn, Oyallon e Varoquaux (2022). Why do tree-based models still outperform deep learning on tabular data? NeurIPS.",
];
const REFS_VALIDACAO: string[] = [
  "BCBS (2005). Studies on the Validation of Internal Rating Systems. Working Paper 14.",
  "Niculescu-Mizil e Caruana (2005). Predicting good probabilities with supervised learning. ICML.",
  "Lessmann, Baesens, Seow e Thomas (2015). Benchmarking state-of-the-art classification algorithms for credit scoring. EJOR 247(1).",
  "Lundberg et al. (2020). From local explanations to global understanding with explainable AI for trees. Nature Machine Intelligence 2(1).",
  "Shapley (1953). A value for n-person games. Contributions to the Theory of Games II.",
  "Wachter, Mittelstadt e Russell (2018). Counterfactual explanations without opening the black box. Harvard JOLT 31(2).",
  "Wilson (1927). Probable inference, the law of succession, and statistical inference. JASA 22(158).",
  "DeLong, DeLong e Clarke-Pearson (1988). Comparing the areas under two or more correlated ROC curves. Biometrics 44(3).",
  "CMN (2017). Resolução 4.557: gerenciamento de riscos e de capital.",
  "EBA (2023). Machine learning for IRB models: follow-up report.",
  "Monotonia: documentação do scikit-learn (monotonic_cst), do XGBoost e do LightGBM.",
];
const REPRO: [string, string][] = [
  ["Base do curso", "gerador sintético, semente 20260501; treino das safras 2022-01 a 2023-02"],
  ["Ajuste e validação", `${int(NA)} e ${int(NV)} propostas por sorteio (semente 20260601): validação aleatória, não temporal`],
  ["Boosting da carteira", `taxa ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo de ${CFG_CARTEIRA.minFolha} por folha, até ${CFG_CARTEIRA.arvores} árvores`],
  ["Referência externa", "scripts/capitulo6/referencia.py: scikit-learn 1.9.1, shap 0.51.0, statsmodels 0.15.0, NumPy 2.4.6"],
  ["Conferência", "tests/capitulo6-gbm.test.ts compara árvores, estágios, AUC, log loss e contribuições com a referência"],
  ["Convenções", "escore em log odds e PD = σ(escore); corte no ponto médio entre valores distintos; variáveis em precisão simples, como no scikit-learn"],
];

export function S22Apendice({ pagina }: { pagina?: Pagina }) {
  const [aba, setAba] = useState<Aba>("formulas");
  return (
    <Quadro slug="c6p22" pagina={pagina} layout="um" fonte="Material de consulta; a aula termina no slide 21.">
      <Painel>
        <Seg rotulo="Seção do apêndice" opcoes={[{ v: "formulas" as Aba, r: "Fórmulas" }, { v: "fronteira" as Aba, r: "Fronteira" }, { v: "metodo" as Aba, r: "Referências: método" }, { v: "validacao" as Aba, r: "Referências: validação" }, { v: "repro" as Aba, r: "Reprodução" }]} valor={aba} onChange={setAba} cor />
        {aba === "formulas" && <div className="q6-s22-f">{FORMULAS.map(([t, f, s]) => <div key={t}><p className="q7-k"><LinkSlide slug={s} className="q6-s22-l">{t}</LinkSlide></p><Formula f={f} compacta />{s === "c6p19" && <p className="q7-nota">Somadas, dão F(x) − E[F]: o escore menos o valor esperado.</p>}</div>)}</div>}
        {aba === "fronteira" && <dl className="q6-s22-d">{FRONTEIRA.map(([t, r, v]) => <div key={t}><dt>{t} <small>{r}</small></dt><dd>{v}</dd></div>)}</dl>}
        {aba === "metodo" && <ol className="q6-s22-r">{REFS_METODO.map((r) => <li key={r}>{r}</li>)}</ol>}
        {aba === "validacao" && <ol className="q6-s22-r">{REFS_VALIDACAO.map((r) => <li key={r}>{r}</li>)}</ol>}
        {aba === "repro" && <dl className="q6-s22-d q6-s22-d--1">{REPRO.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}</dl>}
      </Painel>
    </Quadro>
  );
}

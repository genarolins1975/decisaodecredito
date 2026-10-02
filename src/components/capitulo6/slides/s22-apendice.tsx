"use client";
import { useState } from "react";
import { Formula, LinkSlide, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV } from "@/lib/capitulo6/dados";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 22 · c6p22 · Apêndice de consulta, fora do percurso da aula: fórmulas do capítulo (cada uma com o slide em que
 * aparece), fronteira do tema (XGBoost, LightGBM, CatBoost, EBM e GA2M, árvores contra redes em dados tabulares,
 * explicações contrafactuais: o que cada um resolve, quando usar e o slide do curso em que o tema aparece), referências
 * primárias do checklist de estado da arte (references/estado-da-arte.md, capítulo 6), com DOI ou endereço, e reprodução
 * (sementes, versões, scripts e teste). Um símbolo por sentido: n propostas, K variáveis, p a PD.
 */
type Aba = "formulas" | "fronteira" | "metodo" | "validacao" | "repro";
const FORMULAS: [string, string, string][] = [
  ["Palpite inicial", String.raw`F_0=\ln\frac{\bar p}{1-\bar p}`, "c6p3"],
  ["Pseudo-resíduo (log loss)", String.raw`r_{im}=y_i-\sigma\big(F_{m-1}(x_i)\big)`, "c6p4"],
  ["Valor da folha: passo de Newton", String.raw`\gamma_{jm}=\frac{\sum_{i\in R_{jm}} r_{im}}{\sum_{i\in R_{jm}} p_i(1-p_i)}`, "c6p6"],
  ["Atualização com a taxa de aprendizagem", String.raw`F_m(x)=F_{m-1}(x)+\eta\sum_j\gamma_{jm}\,\mathbf 1(x\in R_{jm})`, "c6p7"],
  ["Log loss", String.raw`L=-\tfrac1n\sum_i\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]`, "c6p15"],
  ["Contribuição de Shapley", String.raw`\phi_j=\sum_{S\subseteq V\setminus\{j\}}\tfrac{|S|!\,(K-|S|-1)!}{K!}\big[v(S\cup\{j\})-v(S)\big]`, "c6p19"],
  ["Dependência parcial", String.raw`\bar p_j(z)=\tfrac1n\sum_i\sigma\big(F(z,\,x_{i,-j})\big)`, "c6p20"],
  ["Monotonia (+1) num corte", String.raw`\gamma_{\text{esq}}\le\gamma_{\text{dir}},\ \text{com limites herdados pelos filhos}`, "c6p20"],
];
const FRONTEIRA: { t: string; r: string; o: string; u: string; s?: string; f?: string }[] = [
  { t: "XGBoost", r: "Chen e Guestrin (2016)", s: "c6p6", o: "Penalidade L2 no ganho; com λ = 0, volta o passo de Newton.", f: String.raw`\begin{gathered}w^*=-\frac{G}{H+\lambda}\\ G=\textstyle\sum_i (p_i-y_i),\ H=\sum_i p_i(1-p_i)\end{gathered}`, u: "ausentes e regularização explícita" },
  { t: "LightGBM", r: "Ke et al. (2017)", s: "c6p16", o: "Histogramas e sorteio guiado pelo gradiente aceleram milhões de linhas.", u: "base grande; em base pequena, limite as folhas" },
  { t: "CatBoost", r: "Prokhorenkova et al. (2018)", o: "Codifica categóricas pela taxa de default em ordem, sem vazar o alvo.", u: "CEP, CNAE e loja" },
  { t: "EBM e GA2M", r: "Lou et al. (2013); Nori et al. (2019)", s: "c6p12", o: "Uma curva por variável e poucos pares: o modelo inteiro se lê.", u: "quando o validador audita a forma" },
  { t: "Árvores contra redes", r: "Grinsztajn et al. (2022)", s: "c6p17", o: "Em dados tabulares médios, boosting e florestas superam redes profundas.", u: "redes para texto, imagem e sequências" },
  { t: "Explicação contrafactual", r: "Wachter et al. (2018)", s: "c6p20", o: "A menor mudança que troca a decisão; com monotonia, não pede piorar o cliente.", u: "motivo de recusa" },
];
type Ref = [string, string];
const doi = (d: string) => `https://doi.org/${d}`;
const REFS_METODO: Ref[] = [
  ["Friedman (2001). Greedy function approximation: a gradient boosting machine. Annals of Statistics 29(5).", doi("10.1214/aos/1013203451")],
  ["Friedman, Hastie e Tibshirani (2000). Additive logistic regression. Annals of Statistics 28(2).", doi("10.1214/aos/1016218223")],
  ["Friedman (2002). Stochastic gradient boosting. Computational Statistics & Data Analysis 38(4).", doi("10.1016/S0167-9473(01)00065-2")],
  ["Hastie, Tibshirani e Friedman (2009). The Elements of Statistical Learning, 2ª ed., cap. 10.", doi("10.1007/978-0-387-84858-7")],
  ["Chen e Guestrin (2016). XGBoost: a scalable tree boosting system. KDD.", doi("10.1145/2939672.2939785")],
  ["Ke et al. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. NeurIPS 30.", "https://papers.nips.cc/paper/6907-lightgbm-a-highly-efficient-gradient-boosting-decision-tree"],
  ["Prokhorenkova et al. (2018). CatBoost: unbiased boosting with categorical features. NeurIPS.", "https://arxiv.org/abs/1706.09516"],
  ["Lou, Caruana, Gehrke e Hooker (2013). Accurate intelligible models with pairwise interactions. KDD.", doi("10.1145/2487575.2487579")],
  ["Nori, Jenkins, Koch e Caruana (2019). InterpretML. arXiv:1909.09223.", "https://arxiv.org/abs/1909.09223"],
  ["Grinsztajn, Oyallon e Varoquaux (2022). Why do tree-based models still outperform deep learning on tabular data? NeurIPS.", "https://arxiv.org/abs/2207.08815"],
  ["Potharst e Feelders (2002). Classification trees for problems with monotonicity constraints. SIGKDD Explorations 4(1).", doi("10.1145/568574.568577")],
];
const REFS_VALIDACAO: Ref[] = [
  ["BCBS (2005). Studies on the Validation of Internal Rating Systems. Working Paper 14.", "https://www.bis.org/publ/bcbs_wp14.htm"],
  ["Niculescu-Mizil e Caruana (2005). Predicting good probabilities with supervised learning. ICML.", doi("10.1145/1102351.1102430")],
  ["Lessmann, Baesens, Seow e Thomas (2015). Benchmarking state-of-the-art classification algorithms for credit scoring: An update of research. European Journal of Operational Research 247(1).", doi("10.1016/j.ejor.2015.05.030")],
  ["Lundberg et al. (2020). From local explanations to global understanding with explainable AI for trees. Nature Machine Intelligence 2(1).", doi("10.1038/s42256-019-0138-9")],
  ["Shapley (1953). A value for n-person games. Contributions to the Theory of Games II.", doi("10.1515/9781400881970-018")],
  ["Wachter, Mittelstadt e Russell (2018). Counterfactual explanations without opening the black box. Harvard JOLT 31(2).", doi("10.2139/ssrn.3063289")],
  ["Wilson (1927). Probable inference, the law of succession, and statistical inference. JASA 22(158).", doi("10.1080/01621459.1927.10502953")],
  ["Hanley e McNeil (1982). The meaning and use of the area under a ROC curve. Radiology 143(1).", doi("10.1148/radiology.143.1.7063747")],
  ["DeLong, DeLong e Clarke-Pearson (1988). Comparing the areas under two or more correlated ROC curves. Biometrics 44(3).", doi("10.2307/2531595")],
  ["CMN (2017). Resolução 4.557, de 23 de fevereiro de 2017: estrutura de gerenciamento de riscos e de capital.", "https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50344/Res_4557_v1_O.pdf"],
  ["EBA (2023). Follow-up report on machine learning for IRB models.", "https://www.eba.europa.eu/sites/default/files/document_library/Publications/Reports/2023/1061483/Follow-up%20report%20on%20machine%20learning%20for%20IRB%20models.pdf"],
];
const REPRO: [string, string][] = [
  ["Base do curso", "gerador sintético, semente 20260501; treino das safras 2022-01 a 2023-02"],
  ["Ajuste e validação", `${int(NA)} e ${int(NV)} propostas por sorteio (semente 20260601): validação aleatória, não temporal`],
  ["Boosting da carteira", `taxa ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo de ${CFG_CARTEIRA.minFolha} por folha, até ${CFG_CARTEIRA.arvores} árvores`],
  ["Referência externa", "scripts/capitulo6/referencia.py: scikit-learn 1.9.1, shap 0.51.0, statsmodels 0.15.0, NumPy 2.4.6"],
  ["Conferência", "tests/capitulo6-gbm.test.ts compara árvores, estágios, AUC, log loss e contribuições com a referência"],
  ["Convenções", "escore em log odds e PD = σ(escore); corte no ponto médio entre valores distintos; variáveis em precisão simples, como no scikit-learn"],
];

const RefLista = ({ refs }: { refs: Ref[] }) => (
  <ol className="q6-s22-r">{refs.map(([t, u]) => <li key={t}>{t} <a href={u} target="_blank" rel="noreferrer">{u.startsWith("https://doi.org/") ? `doi:${u.slice(16)}` : "acesso"}</a></li>)}</ol>
);

export function S22Apendice({ pagina }: { pagina?: Pagina }) {
  const [aba, setAba] = useState<Aba>("formulas");
  return (
    <Quadro slug="c6p22" pagina={pagina} layout="um" fonte="Material de consulta; a aula termina no slide 21.">
      <Painel>
        <Seg rotulo="Seção do apêndice" opcoes={[{ v: "formulas" as Aba, r: "Fórmulas" }, { v: "fronteira" as Aba, r: "Fronteira" }, { v: "metodo" as Aba, r: "Referências: método" }, { v: "validacao" as Aba, r: "Referências: validação" }, { v: "repro" as Aba, r: "Reprodução" }]} valor={aba} onChange={setAba} cor />
        {aba === "formulas" && <>
          <div className="q6-s22-f">{FORMULAS.map(([t, f, s]) => <div key={t}><p className="q7-k"><LinkSlide slug={s} className="q6-s22-l">{t}</LinkSlide></p><Formula f={f} compacta />{s === "c6p19" && <p className="q7-nota">Somadas, dão F(x) − E[F]: o escore menos o valor esperado.</p>}</div>)}</div>
          <p className="q7-nota">Símbolos: n propostas, i uma proposta, p a PD; K variáveis, V o conjunto delas, j uma variável; R a região de uma folha, m a árvore; σ a sigmoide; η a taxa.</p>
        </>}
        {aba === "fronteira" && <div className="q6-s22-c">{FRONTEIRA.map((c) => <section key={c.t}>
          <p className="q6-s22-ct">{c.t}{c.s && <LinkSlide slug={c.s} className="q6-s22-sl">slide {c.s.slice(3)}</LinkSlide>}<small>{c.r}</small></p>
          {c.f && <Formula f={c.f} compacta />}
          <p className="q6-s22-co">{c.o}</p>
          <p className="q6-s22-cu"><b>Quando usar:</b> {c.u}</p>
        </section>)}</div>}
        {aba === "metodo" && <RefLista refs={REFS_METODO} />}
        {aba === "validacao" && <RefLista refs={REFS_VALIDACAO} />}
        {aba === "repro" && <dl className="q6-s22-d q6-s22-d--1">{REPRO.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}</dl>}
      </Painel>
    </Quadro>
  );
}

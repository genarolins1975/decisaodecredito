/**
 * Slide 15 do capítulo 4 (c4p15): como a log loss orienta a estimação. Cada uma das 16 propostas didáticas recebe
 * uma PD do modelo; o desfecho observado e a PD determinam a perda individual, e a média dessas perdas é o objetivo
 * que a estimação busca reduzir. Perda calculada a partir do logit, na forma estável
 * ℓ = max(z, 0) − y z + log1p(exp(−|z|)), sem arredondar a PD antes. Regressão logística sem penalização e com
 * pesos iguais: numa média simples toda observação pesa o mesmo, ainda que contribua com perdas diferentes.
 *
 * O gráfico põe cada proposta sobre a curva do seu desfecho: −ln(PD) para quem teve default, −ln(1 − PD) para quem
 * não teve. As duas se cruzam em PD = 50%, na perda ln 2; acima dela, o modelo deu mais de 50% ao outro desfecho.
 * A simulação do intercepto desloca todos os escores pelo mesmo valor: como os coeficientes da aula minimizam a
 * média (gradiente nulo, até o arredondamento), qualquer deslocamento aumenta a média, ainda que reduza a perda de
 * algumas propostas.
 */
import base from "./did.json";
import { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, sigmoide } from "./logit-slides";

export { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, sigmoide };

export type Proposta = { id: number; util: number; atraso: number; y: number };
export const PROPOSTAS: Proposta[] = base.base;
export const SELECAO_INICIAL = 2;
export const ATALHOS = [2, 10, 15] as const;
export const LN2 = Math.LN2;
/** Deslocamento do intercepto na simulação do painel. */
export const DELTA_INTERCEPTO = 0.5;
/** Perda máxima desenhada: cabe a maior perda da amostra e a da simulação; as curvas saem pelo topo. */
export const EIXO_Y_MAX = 1.8;
export const TICKS_X = [0, 0.2, 0.4, 0.6, 0.8, 1] as const;
export const TICKS_Y = [0, 0.5, 1, 1.5] as const;

export const escore = (p: Proposta) => BETA0 + BETA1 * (p.util / 10) + BETA2 * (p.atraso / 10);

/** Perda individual a partir do logit: estável em z extremos e igual a −[y ln p + (1 − y) ln(1 − p)]. */
export const perdaDoLogit = (z: number, y: number) => Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z)));
/** A mesma perda escrita pela probabilidade; serve de conferência em valores moderados. */
export const perdaDaProbabilidade = (p: number, y: number) => -(y === 1 ? Math.log(p) : Math.log(1 - p));

export type Linha = Proposta & { z: number; pd: number; pObservado: number; perda: number };

const monta = (p: Proposta, z: number): Linha => { const pd = sigmoide(z); return { ...p, z, pd, pObservado: p.y === 1 ? pd : 1 - pd, perda: perdaDoLogit(z, p.y) }; };

/** As 16 linhas na ordem original, com PD, probabilidade do desfecho observado e perda. */
export function linhas(): Linha[] {
  return PROPOSTAS.map((p) => monta(p, escore(p)));
}

/** As mesmas 16 propostas com o intercepto deslocado: todo escore anda delta, PD e perda são recalculadas. */
export function comIntercepto(delta: number, ls: Linha[] = linhas()): Linha[] {
  return ls.map((l) => monta(l, l.z + delta));
}

export const media = (ls: Linha[] = linhas()) => ls.reduce((s, l) => s + l.perda, 0) / ls.length;
export const proposta = (id: number, ls: Linha[] = linhas()) => ls.find((l) => l.id === id) ?? ls[0];
/** Perda acima de ln 2: o modelo deu menos de 50% ao desfecho que ocorreu. */
export const naZona = (l: Linha) => l.pObservado < 0.5;

/** As três maiores perdas e a participação delas na perda total, para a leitura da base. */
export function maiores(n = 3, ls: Linha[] = linhas()) {
  const total = ls.reduce((s, l) => s + l.perda, 0);
  const top = [...ls].sort((a, b) => b.perda - a.perda).slice(0, n);
  return { ids: top.map((l) => l.id), participacao: (top.reduce((s, l) => s + l.perda, 0) / total) * 100, total };
}

/** Texto da fórmula aplicável ao desfecho da proposta. */
export function formula(l: Linha) {
  const t = (v: number) => fmt(v, 4).replace(",", "{,}");
  return l.y === 1
    ? { regra: "Perda = −ln(PD)", conta: `−ln(${fmt(l.pd, 4)}) ≈ ${fmt(l.perda, 4)}`, contaTex: String.raw`-\ln(${t(l.pd)}) \approx ${t(l.perda)}`, desfecho: "Default · y = 1", rotulo: "PD estimada" }
    : { regra: "Perda = −ln(1 − PD)", conta: `−ln(1 − ${fmt(l.pd, 4)}) ≈ ${fmt(l.perda, 4)}`, contaTex: String.raw`-\ln(1 - ${t(l.pd)}) \approx ${t(l.perda)}`, desfecho: "Sem default · y = 0", rotulo: "PD estimada" };
}

/** Frase curta de leitura da proposta selecionada. */
export function leitura(l: Linha) {
  // "mas" só quando o modelo deu menos da metade ao que ocorreu; a probabilidade do desfecho observado está logo acima no painel
  const liga = l.pObservado < 0.5 ? "mas" : "e";
  return l.y === 1
    ? `Houve default, ${liga} o modelo atribuiu ${fmtPct(l.pd)} a esse desfecho.`
    : `Não houve default, ${liga} o modelo atribuiu ${fmtPct(l.pd)} ao default.`;
}

/** Simulação do painel: a proposta escolhida e a média antes e depois de deslocar o intercepto. */
export function testeIntercepto(id: number, delta = DELTA_INTERCEPTO) {
  const ls = linhas(), nova = comIntercepto(delta, ls);
  const antes = proposta(id, ls), depois = proposta(id, nova);
  const mediaAntes = media(ls), mediaDepois = media(nova);
  return {
    antes, depois, mediaAntes, mediaDepois, linhas: nova,
    titulo: `Intercepto ${fmt(delta, 1, true)} (simulação)`,
    valores: `#${id}: ${fmt(antes.perda, 4)} → ${fmt(depois.perda, 4)} · média: ${fmt(mediaAntes, 5)} → ${fmt(mediaDepois, 5)}`,
    frase: mediaDepois <= mediaAntes ? "A média caiu: os coeficientes desta página não seriam os de menor perda."
      : depois.perda < antes.perda ? `A #${id} melhora, mas a média sobe: os coeficientes da aula já dão a menor.`
      : `A #${id} piora e a média sobe: os coeficientes da aula já dão a menor.`,
  };
}

/** Curva de perda de um desfecho em função da PD, amostrada até a perda máxima desenhada. */
export function curvaPerda(y: 0 | 1, n = 160): { pd: number; perda: number }[] {
  const corte = Math.exp(-EIXO_Y_MAX); // PD em que a curva atinge o topo do gráfico
  const [de, ate] = y === 1 ? [corte, 1] : [0, 1 - corte];
  return Array.from({ length: n + 1 }, (_, i) => { const pd = de + ((ate - de) * i) / n; return { pd, perda: perdaDaProbabilidade(pd, y) }; });
}

export const CASOS = [
  { k: "Se houve default · y = 1", f: "Perda = −ln(PD)", tex: String.raw`\text{perda} = -\ln(\mathrm{PD})`, y: 1 },
  { k: "Se não houve default · y = 0", f: "Perda = −ln(1 − PD)", tex: String.raw`\text{perda} = -\ln(1 - \mathrm{PD})`, y: 0 },
] as const;
export const TITULO = "Como a log loss orienta a estimação";
export const SUBTITULO = "Cada proposta gera uma perda; a estimação busca a menor média na amostra.";
export const TITULO_GRAF = "Quanto custa cada proposta?";
export const EIXO_X = "PD estimada pelo modelo (%)";
export const EIXO_Y = "Perda individual";
export const ZONA = ["Perda acima de ln 2 ≈ 0,69:", "o modelo deu mais de 50% ao outro desfecho"] as const;
export const CURVA_DEFAULT = "Com default · −ln(PD)";
export const CURVA_ADIMPLENTE = "Sem default · −ln(1 − PD)";
export const ROTULO_MEDIA = "Log loss média";
export const TITULO_CTL = "Escolha a proposta";
export const ROTULO_ATALHOS = "Ir para";
export const ROTULO_INTERCEPTO = `Subir o intercepto em ${fmt(DELTA_INTERCEPTO, 1)}`;
export const RODAPE = "A seguir: uma iteração do gradiente · ln é o logaritmo natural; a perda é estatística, não financeira";

/** Os três cartões da base; a participação das maiores perdas é derivada, não fixada. */
export function cartoes(ls: Linha[] = linhas()) {
  const topo = maiores(3, ls);
  return [
    { k: "Estimação", t: "Os coeficientes minimizam a log loss média das 16 propostas de treino." },
    { k: "Quem pesa", t: `Com pesos iguais, as três maiores perdas somam ${fmt(topo.participacao, 0)}% do total; reduzir uma pode aumentar outras.` },
    { k: "Cuidado", t: "Bom ajuste no treino não comprova desempenho fora da amostra." },
  ];
}

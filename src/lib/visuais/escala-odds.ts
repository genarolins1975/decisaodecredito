/**
 * Escala 2, odds (capítulo 4, c4p4): contas em funções puras, fonte única para números, gráfico e textos.
 * odds = p ÷ (1 − p) e p = odds ÷ (1 + odds), com precisão integral e arredondamento só na apresentação.
 * Odds é a razão entre o evento e o não evento na mesma operação; não é razão de odds entre grupos nem risco relativo.
 */
import { esperados } from "./escala-probabilidade";

export const PD_INICIAL = 0.2;
export const ATALHOS = [0.05, 0.2, 0.5, 0.8, 0.95] as const;
export const REFERENCIAS = [0.2, 0.5, 0.8, 0.95] as const;
export const Y_MAX_PADRAO = 20;
export const FAIXA_SLIDER: readonly [number, number] = [0.01, 0.99];

/** Odds de uma probabilidade: 0 em p = 0; sem valor finito em p = 1 (null). */
export const oddsDeP = (p: number): number | null => (p >= 1 ? null : p <= 0 ? 0 : p / (1 - p));
/** Probabilidade de odds finitas e não negativas. */
export const pDeOdds = (o: number) => o / (1 + o);
export { esperados };

const num = (v: number, casas: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas }).replace("-", "−");
/** Odds para exibição: 4 casas abaixo de 0,1, 2 casas até 10, até 2 casas acima (19, 99, 11,5). */
export const fmtOdds = (o: number | null) => (o === null ? "∞" : o < 0.1 ? num(o, 4) : num(o, 2));
export const fmtP = (p: number, casas = 0) => `${(p * 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas }).replace("-", "−")}%`;
export const fmtLn = (v: number) => (v === Infinity ? "+∞" : v === -Infinity ? "−∞" : `${v > 0 ? "+" : ""}${num(v, 3)}`);

const quaseInteiro = (k: number) => Math.abs(k - Math.round(k)) < 1e-9;

/** Leitura intuitiva da razão: 1 para cada k (p ≤ 50%) ou k para cada 1 (p > 50%); "aproximadamente" quando há arredondamento. */
export function leituraIntuitiva(p: number): { razao: string; frase: string } {
  if (p <= 0) return { razao: "0 : 1", frase: "Nenhum default esperado para cada adimplente esperado." };
  if (p >= 1) return { razao: "∞", frase: "Sem adimplentes esperados: a razão não tem valor finito." };
  if (Math.abs(p - 0.5) < 1e-12) return { razao: "1 : 1", frase: "1 default esperado para cada adimplente esperado." };
  if (p < 0.5) { const k = (1 - p) / p; const ap = !quaseInteiro(k); return { razao: `1 : ${num(k, ap ? 1 : 0)}`, frase: `1 default esperado para cada ${ap ? "aproximadamente " : ""}${num(k, ap ? 1 : 0)} adimplentes esperados.` }; }
  const k = p / (1 - p); const ap = !quaseInteiro(k); return { razao: `${num(k, ap ? 1 : 0)} : 1`, frase: `${ap ? "Aproximadamente " : ""}${num(k, ap ? 1 : 0)} defaults esperados para cada adimplente esperado.` };
}

/** Conta exibida: odds = p ÷ (1 − p) com os valores. */
export function contaOdds(p: number): string {
  const o = oddsDeP(p);
  if (o === null) return "odds → ∞ quando p → 1";
  return `odds = ${num(p, 4)} ÷ ${num(1 - p, 4)} = ${fmtOdds(o)}`;
}

/** Complementar: p e 1 − p têm odds recíprocas; o produto é 1 para 0 < p < 1. */
export function complementar(p: number) {
  const o = oddsDeP(p), oc = oddsDeP(1 - p);
  const produto = o !== null && oc !== null && o > 0 && oc > 0 ? o * oc : null;
  return { p, odds: o, pc: 1 - p, oddsC: oc, produto, coincidem: Math.abs(p - 0.5) < 1e-12 };
}

/** Log odds com os limites: ln(0) = −∞ e ln(∞) = +∞. */
export const logOdds = (o: number | null): number => (o === null ? Infinity : o <= 0 ? -Infinity : Math.log(o));

/** Ponte para log odds: ln das odds de p, de 50% e de 1 − p; simetria ln(odds(1 − p)) = −ln(odds(p)). */
export function ponteLog(p: number) {
  const c = complementar(p); const a = logOdds(c.odds), b = logOdds(c.oddsC);
  const simetrico = Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a + b) < 1e-9 : (a === -Infinity && b === Infinity) || (a === Infinity && b === -Infinity);
  return { lnP: a, lnMeio: 0, lnC: b, simetrico };
}

export type Validacao = { ok: true; valor: number; aviso?: string } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

/** PD digitada, em porcentagem, aceita decimais; fora de 1% a 99% vale, mas o controle deslizante não a alcança. */
export function validarPd(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite um número, por exemplo 12,5." };
  if (v < 0) return { ok: false, erro: "Uma probabilidade não pode ser negativa." };
  if (v > 100) return { ok: false, erro: "Uma probabilidade não pode passar de 100%." };
  const p = v / 100;
  if (p < FAIXA_SLIDER[0] || p > FAIXA_SLIDER[1]) return { ok: true, valor: p, aviso: "Fora de 1% a 99%: valor mantido." };
  return { ok: true, valor: p };
}

/** Odds digitadas: finitas e não negativas. */
export function validarOdds(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite odds finitas, por exemplo 0,25 ou 4." };
  if (v < 0) return { ok: false, erro: "Odds não podem ser negativas." };
  const p = pDeOdds(v);
  if (p < FAIXA_SLIDER[0] || p > FAIXA_SLIDER[1]) return { ok: true, valor: p, aviso: `PD de ${fmtP(p, 2)}, fora de 1% a 99%: valor mantido.` };
  return { ok: true, valor: p };
}

/** Escala vertical: fixa em 20 por padrão; ajustada cabe às odds selecionadas com folga. */
export function escalaVertical(odds: number | null, ajustar: boolean) {
  const fora = odds !== null && odds > Y_MAX_PADRAO;
  if (!ajustar || odds === null || !fora) return { yMax: Y_MAX_PADRAO, fora, ajustada: false };
  const bruto = odds * 1.15; const passo = 10 ** Math.floor(Math.log10(bruto)); const yMax = Math.ceil(bruto / passo) * passo;
  return { yMax, fora: false, ajustada: true };
}

/** Curva odds(p) amostrada até pMax, para desenhar dentro da janela. */
export function curvaOdds(yMax: number, n = 200): { p: number; o: number }[] {
  const pMax = yMax / (1 + yMax); const pts: { p: number; o: number }[] = [];
  for (let i = 0; i <= n; i++) { const p = (pMax * i) / n; pts.push({ p, o: p / (1 - p) }); }
  return pts;
}

export const NOTA_ODDS = "Odds = 0,25 não significa PD = 25%.";

export const TITULO = "Odds contam defaults por adimplente e não têm teto";
export const SUBTITULO = "A mesma PD, escrita como razão entre defaults e adimplentes esperados; a conversão volta sem perda.";
export const FORMULAS = [
  { k: "Da PD para as odds", tex: String.raw`\text{odds} = p \,/\, (1 - p)` },
  { k: "E de volta", tex: String.raw`p = \text{odds} \,/\, (1 + \text{odds})` },
] as const;
export const TITULO_GRAF = "As odds em função da PD";
export const TITULO_LEITURAS = "A mesma PD, três leituras";
export const TITULO_CTL = "Altere a PD";
export const ROTULO_ATALHOS = "Ir para";
export const ROTULO_COMPARAR = "Comparar p e 1 − p";
export const RODAPE = "A seguir: log odds, onde somar faz sentido";

/** Linhas da comparação entre p e 1 − p: odds recíprocas e, no logaritmo, simétricas. */
export function comparacao(p: number): string[] {
  const c = complementar(p), l = ponteLog(p);
  if (c.coincidem) return ["Em 50%, p e 1 − p coincidem: odds 1 dos dois lados.", "No logaritmo, ln(1) = 0: o centro da escala."];
  if (c.produto === null) return [`${fmtP(p, 2)} e ${fmtP(c.pc, 2)}: odds ${fmtOdds(c.odds)} e ${fmtOdds(c.oddsC)}.`, "Nos extremos, uma das odds não é finita e o produto não se define."];
  return [
    `${fmtP(p, 2)} e ${fmtP(c.pc, 2)}: odds ${fmtOdds(c.odds)} e ${fmtOdds(c.oddsC)}, recíprocas: o produto é 1.`,
    `No logaritmo, simétricas: ${fmtLn(l.lnP)} e ${fmtLn(l.lnC)}.`,
  ];
}

/** Os três cartões da base; os números vêm das contas, não do texto. */
export function cartoes() {
  const c = complementar(0.2), l = ponteLog(0.2), o = oddsDeP(0.2)!, k = leituraIntuitiva(0.2).razao.split(" : ")[1];
  return [
    { k: "Leitura", t: `Odds ${fmtOdds(o)} não é PD de ${fmtP(o)}: é 1 default para cada ${k} adimplentes.` },
    { k: "Sem teto", t: `Em 95%, odds ${fmtOdds(oddsDeP(0.95))}; em 99%, ${fmtOdds(oddsDeP(0.99))}. Perto de 100%, a razão cresce sem limite.` },
    { k: "Assimetria", t: `20% e 80% dão odds ${fmtOdds(c.odds)} e ${fmtOdds(c.oddsC)}; no logaritmo, ${fmtLn(l.lnP)} e ${fmtLn(l.lnC)}.` },
  ];
}

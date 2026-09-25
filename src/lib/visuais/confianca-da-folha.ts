/**
 * Quanto cada folha afirma (capítulo 5, c5p13). A PD da folha é uma estimativa, e o intervalo de Wilson a 95%
 * (capítulo 2, c2p16) diz quanto ela afirma. A política aprova a folha se a PD ficar abaixo de um limite: a folha só
 * decide quando o intervalo inteiro fica de um lado do limite (aprova se o limite superior fica abaixo dele, recusa se
 * o inferior fica acima); se o intervalo cruza o limite, a folha não decide. Multiplicar as propostas de cada folha,
 * mantendo a frequência, estreita o intervalo: com 10 vezes mais propostas, as quatro folhas decidem no limite de 20%.
 * Funções puras; arredondamento só na exibição.
 */
import did from "./did.json";
import { crescer, folhas, wilson } from "./arvore";
import type { Proposta } from "./logistica";
import { fmtNum, fmtPct } from "./metricas";

export { fmtNum, fmtPct };

const BASE = did.base as Proposta[];

export type FolhaIc = { i: number; nome: string; d: number; n: number };
/** As quatro folhas da árvore de dois cortes, na ordem da árvore (da menor para a maior utilização). */
export const FOLHAS4: FolhaIc[] = folhas(crescer(BASE, 2)).map((f, i) => ({ i, nome: `folha ${i + 1}`, d: f.d, n: f.n }));
export const MULTIPLOS = [1, 10, 100] as const;
export type Multiplo = (typeof MULTIPLOS)[number];
export const ROTULO_MULTIPLO: Record<Multiplo, string> = { 1: "como na árvore", 10: "10 vezes", 100: "100 vezes" };
export const LIMITE_INICIAL = 0.2, LIMITE_MIN = 0.05, LIMITE_MAX = 0.95, LIMITE_PASSO = 0.05;
export const FOCO_INICIAL = 1; // a folha 2, com 0 default em 6: a PD de 0% que não é risco zero

/** A folha com m vezes as propostas e a mesma frequência. */
export const escalada = (f: FolhaIc, m: Multiplo) => ({ d: f.d * m, n: f.n * m });
export const intervalo = (f: FolhaIc, m: Multiplo) => { const e = escalada(f, m); return wilson(e.d, e.n); };

export type Veredito = "aprova" | "recusa" | "nao-decide";
/** A folha decide quando o intervalo inteiro fica de um lado do limite. */
export function veredito(ic: { lo: number; hi: number }, limite: number): Veredito {
  if (ic.hi < limite) return "aprova";
  if (ic.lo > limite) return "recusa";
  return "nao-decide";
}
export const ROTULO_VEREDITO: Record<Veredito, string> = { aprova: "aprova", recusa: "recusa", "nao-decide": "não decide" };

export function situacao(limite: number, m: Multiplo) {
  return FOLHAS4.map((f) => { const ic = intervalo(f, m); return { ...f, ...escalada(f, m), ic, v: veredito(ic, limite) }; });
}

const lista = (nums: number[]) => (nums.length === 1 ? `a folha ${nums[0]}` : `as folhas ${nums.slice(0, -1).join(", ")} e ${nums[nums.length - 1]}`);
/** Frase do painel: quais folhas cruzam o limite e por isso não decidem. A contagem fica no quadro de resultados; com
 *  mais propostas, a frase lembra que a frequência é a mesma. */
export function leitura(limite: number, m: Multiplo): string {
  const s = situacao(limite, m), indecisas = s.filter((f) => f.v === "nao-decide").map((f) => f.i + 1);
  const L = fmtPct(limite), base = m === 1 ? "" : `Com ${m} vezes as propostas e a mesma frequência, `;
  const Base = (t: string) => (base ? base + t : t.charAt(0).toUpperCase() + t.slice(1));
  if (!indecisas.length) return Base(`cada intervalo fica inteiro de um lado do limite de ${L}: as quatro folhas decidem.`);
  if (indecisas.length === 4) return Base(`os quatro intervalos cruzam o limite de ${L}: nenhuma folha decide.`);
  const um = indecisas.length === 1;
  return Base(`${lista(indecisas)} ${um ? "cruza" : "cruzam"} o limite de ${L}: ${um ? "não decide" : "não decidem"}.`);
}

export const TITULO = "Quanto cada folha afirma";
export const SUBTITULO = "Com poucas propostas, o intervalo de 95% é largo demais para decidir.";
export const FORMULAS = [
  { k: "Estimativa da folha", tex: [String.raw`\hat{p} = d \div n`] },
  { k: "A folha decide quando", tex: [String.raw`\text{limite superior} < L \;\Rightarrow\; \text{aprova}`, String.raw`\text{limite inferior} > L \;\Rightarrow\; \text{recusa}`] },
] as const;
export const TITULO_GRAF = "PD e intervalo de Wilson a 95% contra o limite L";
export const TITULO_CTL = "A política e as folhas";
export const CARTOES = [
  { k: "0 de 6 não é risco zero", t: `O intervalo vai até ${fmtPct(intervalo(FOLHAS4[1], 1).hi, 1)}: compatível com risco alto.` },
  { k: "PD sempre com n", t: "Sem o número de propostas, a PD esconde quanto a folha afirma." },
  { k: "Um mínimo por folha", t: "Folha pequena não decide: a próxima página limita o tamanho da folha." },
] as const;
export const RODAPE = "Intervalos que se sobrepõem não provam folhas iguais: comparar folhas pede o teste do capítulo 7.";

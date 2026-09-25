/**
 * A PD da folha é a frequência da folha (capítulo 5, c5p12). Dentro da folha não há modelo: toda proposta que cai nela
 * recebe o mesmo valor v, e cada uma paga a log loss do seu desfecho, −ln(v) se deu default e −ln(1 − v) se pagou. A
 * perda média da folha é mínima em v = d ÷ n: subir v alivia quem deu default e pesa em quem pagou, e o equilíbrio
 * fica na frequência. É a conta da PD constante do capítulo 2 (c2p11), agora folha a folha. As folhas vêm das árvores
 * de um e de dois cortes sobre as 16 propostas. Funções puras; arredondamento só na exibição.
 */
import did from "./did.json";
import { crescer, folhas } from "./arvore";
import type { Proposta } from "./logistica";
import { fmtNum, fmtPct } from "./metricas";

export { fmtNum, fmtPct };

const BASE = did.base as Proposta[];

export type Folha = { k: string; d: number; n: number; arvore: 1 | 2; onde: string };
const faixa = (u0: number, u1: number) => (u0 <= 0 ? `até ${fmtNum(u1, 1)}%` : u1 >= 100 ? `acima de ${fmtNum(u0, 1)}%` : `de ${fmtNum(u0, 1)}% a ${fmtNum(u1, 1)}%`);
/**
 * Folhas das árvores de um e de dois cortes, sem repetir a contagem: na de dois cortes, a folha 4 tem a mesma contagem
 * da folha 1 (1 default em 2) e fica representada por ela. O `onde` não repete a árvore, que o painel mostra no rótulo
 * do grupo de botões.
 */
export const FOLHAS: Folha[] = (() => {
  const lista: (Folha & { nums: number[]; faixas: string[] })[] = [];
  for (const prof of [1, 2] as const) folhas(crescer(BASE, prof)).forEach((f, i) => {
    const igual = lista.find((o) => o.arvore === prof && o.d === f.d && o.n === f.n);
    if (igual) { igual.nums.push(i + 1); igual.faixas.push(faixa(f.caixa.u0, f.caixa.u1)); return; }
    lista.push({ k: `${prof}-${i}`, d: f.d, n: f.n, arvore: prof, onde: "", nums: [i + 1], faixas: [faixa(f.caixa.u0, f.caixa.u1)] });
  });
  return lista.map(({ nums, faixas, ...f }) => ({
    ...f,
    onde: `${nums.length > 1 ? `Folhas ${nums.join(" e ")}` : `Folha ${nums[0]}`}: utilização ${faixas.join(" e ")}.`,
  }));
})();
export const NOME_ARVORE = { 1: "Árvore de um corte", 2: "Árvore de dois cortes" } as const;
export const FOLHA_INICIAL = FOLHAS.find((f) => f.arvore === 1 && f.d === 1 && f.n === 8)!;
export const V_INICIAL = 0.5, V_MIN = 0.01, V_MAX = 0.99, V_PASSO = 0.005;

/** O que uma proposta paga com o valor v: −ln(v) se deu default, −ln(1 − v) se pagou. */
export const penalidade = (deuDefault: boolean, v: number) => (deuDefault ? -Math.log(v) : -Math.log(1 - v));
/** Perda média da folha com o valor v. Na folha pura, a parcela de peso zero fica de fora (0 × ∞ não entra na conta). */
export function perdaMedia(d: number, n: number, v: number) {
  const a = d ? d * penalidade(true, v) : 0, b = n - d ? (n - d) * penalidade(false, v) : 0;
  return (a + b) / n;
}
export const frequencia = (f: Pick<Folha, "d" | "n">) => f.d / f.n;
export const pura = (f: Pick<Folha, "d" | "n">) => f.d === 0 || f.d === f.n;
/** A menor perda da folha, na frequência; na folha pura ela cai até zero na ponta, fora do alcance do controle. */
export const perdaMinima = (f: Pick<Folha, "d" | "n">) => (pura(f) ? 0 : perdaMedia(f.d, f.n, frequencia(f)));
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
/** Quanto a perda com v passa do mínimo, pela diferença dos dois valores como aparecem na tela (quatro casas): a conta
 *  que o aluno refaz com os números do painel fecha. */
export const acimaDoMinimo = (f: Pick<Folha, "d" | "n">, v: number) => r4(perdaMedia(f.d, f.n, v)) - r4(perdaMinima(f));
/** Mesmo valor na tela: compara em meio ponto percentual, o passo do controle. */
export const noMinimo = (f: Pick<Folha, "d" | "n">, v: number) => !pura(f) && Math.abs(v - frequencia(f)) < V_PASSO / 2;

/** Frase do painel para a folha e o valor escolhidos, com o v entre cifrões para o ComTex. Os números ficam no quadro
 *  de resultados; a frase diz o que fazer com v e por quê. */
export function leitura(f: Pick<Folha, "d" | "n">, v: number): string {
  const p = frequencia(f), alvo = fmtPct(p, 1);
  if (pura(f)) return f.d === 0
    ? `Sem default, a perda cai à medida que $v$ desce e chega a zero em 0%: a folha afirma risco zero com ${f.n} propostas.`
    : `Só com defaults, a perda cai à medida que $v$ sobe e chega a zero em 100%: a folha afirma certeza com ${f.n} propostas.`;
  if (noMinimo(f, v)) return `Em ${alvo}, a frequência da folha, a perda é mínima: mover $v$ para qualquer lado a aumenta.`;
  return `${v < p ? "Suba" : "Desça"} $v$ até ${alvo}, a frequência da folha, e a perda cai.`;
}

export const TITULO = "A PD da folha é a frequência da folha";
export const SUBTITULO = "É o valor que dá a menor perda média às propostas da folha.";
export const FORMULAS = [
  { k: "PD da folha", tex: String.raw`\text{PD} = d \div n = \text{defaults} \div \text{propostas}` },
  { k: "Perda média com o valor v", tex: String.raw`\bar{\ell}(v) = -\big[\,d \ln v + (n - d) \ln(1 - v)\,\big] \div n` },
] as const;
export const TITULO_CURVA = "Perda média para cada valor v";
export const TITULO_CTL = "A folha e o valor v";
/** Cartões com o v e o d ÷ n entre cifrões para o ComTex. */
export const CARTOES = [
  { k: "O equilíbrio", t: String.raw`Subir $v$ alivia quem deu default e pesa em quem pagou; o mínimo fica em $d \div n$.` },
  { k: "Já vimos", t: "A conta da log loss do capítulo 2, agora folha a folha." },
  { k: "Folha pura", t: "Dá 0% ou 100%: certeza que ela não tem, tema da próxima página." },
] as const;
export const RODAPE = "Implementações reais aplicam um piso: com PD de 0%, um único default dá perda infinita.";

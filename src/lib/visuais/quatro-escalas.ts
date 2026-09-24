/**
 * Probabilidade, odds, log odds e escore (capítulo 4, c4p6): a mesma PD em quatro réguas e na tabela de tradução.
 * As quatro transformações são estritamente monótonas, então a ordem entre propostas é a mesma em todas; o escore
 * didático do curso, 600 − 90 × z, só desloca e inverte os log odds. Funções puras; arredondamento só na exibição.
 */
import { escoreDidatico, logit, odds } from "./logistica";

export const PD_INICIAL = 0.05;
export const ATALHOS = [0.01, 0.05, 0.1, 0.5, 0.9] as const;
/** As PDs da tabela: pares complementares (5% e 95%, 10% e 90%, 20% e 80%), o centro e o começo da escala, onde mora o crédito. */
export const TABELA_PDS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 0.8, 0.9, 0.95] as const;
/** Janelas das réguas: odds de 0,01 a 100 em escala logarítmica; log odds de −6 a +6, e o escore na mesma posição. */
export const JANELA_ODDS: readonly [number, number] = [0.01, 100];
export const JANELA_Z: readonly [number, number] = [-6, 6];

export type Escala = "p" | "odds" | "z" | "escore";
export type Traducao = { p: number; odds: number; z: number; escore: number };

export const traduzir = (p: number): Traducao => ({ p, odds: odds(p), z: logit(p), escore: escoreDidatico(p) });

const num = (v: number, casas: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).replace("-", "−");
/** PD da tabela e das réguas: uma casa abaixo de 10% (1,0%, 5,0%), inteira acima; odds e log odds com três casas. */
export const fmtPd = (p: number) => `${num(p * 100, p < 0.1 ? 1 : 0)}%`;
export const fmtPdCurta = (p: number) => `${(p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
export const fmtOdds = (o: number) => num(o, 3);
export const fmtZ = (z: number) => num(z, 3);
export const fmtEscore = (e: number) => String(e);

/** Posição de 0 a 1 em cada régua, com aviso quando o valor sai da janela desenhada. */
export function posicao(escala: Escala, t: Traducao): { t: number; fora: boolean } {
  const lim = (v: number) => ({ t: Math.min(1, Math.max(0, v)), fora: v < 0 || v > 1 });
  if (escala === "p") return lim(t.p);
  if (escala === "odds") return lim((Math.log10(t.odds) - Math.log10(JANELA_ODDS[0])) / (Math.log10(JANELA_ODDS[1]) - Math.log10(JANELA_ODDS[0])));
  return lim((t.z - JANELA_Z[0]) / (JANELA_Z[1] - JANELA_Z[0])); // o escore usa a posição dos log odds, com os rótulos invertidos
}

/** Marcas de cada régua, com a posição de 0 a 1 e o texto. */
export const TICKS: Record<Escala, { t: number; texto: string }[]> = {
  p: [0, 0.25, 0.5, 0.75, 1].map((v) => ({ t: v, texto: `${v * 100}%` })),
  odds: [0.01, 0.1, 1, 10, 100].map((v, i) => ({ t: i / 4, texto: v.toLocaleString("pt-BR") })),
  z: [-6, -3, 0, 3, 6].map((v, i) => ({ t: i / 4, texto: v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0" })),
  escore: [-6, -3, 0, 3, 6].map((v, i) => ({ t: i / 4, texto: String(600 - 90 * v) })),
};

/** O valor exibido em cada régua. */
export function valor(escala: Escala, t: Traducao) {
  return escala === "p" ? fmtPdCurta(t.p) : escala === "odds" ? fmtOdds(t.odds) : escala === "z" ? fmtZ(t.z) : fmtEscore(t.escore);
}

/** A linha da tabela mais próxima da PD escolhida, para destacar. */
export const linhaMaisProxima = (p: number) => TABELA_PDS.reduce((m, q) => (Math.abs(q - p) < Math.abs(m - p) - 1e-12 ? q : m), TABELA_PDS[0]);

/** O erro de comunicação da página: passos parecidos de escore valem passos muito diferentes de PD. */
export function cuidado() {
  const a = escoreDidatico(0.01) - escoreDidatico(0.02), b = escoreDidatico(0.05) - escoreDidatico(0.1);
  return `De 1% para 2%, o escore cai ${a} pontos; de 5% para 10%, ${b}: passos parecidos, PDs bem diferentes.`;
}

export const TITULO = "Quatro escalas, o mesmo risco, a mesma ordem";
export const SUBTITULO = "Cada escala resolve uma etapa; trocar de uma para outra não acrescenta informação.";
export const FORMULAS = [
  { k: "Da PD ao escore", tex: String.raw`\text{odds} = p/(1-p) \qquad z = \ln(\text{odds}) \qquad \text{escore} = 600 - 90\,z` },
  { k: "E de volta", tex: String.raw`p = 1/(1 + e^{-z})` },
] as const;
export const NOMES: Record<Escala, string> = { p: "Probabilidade", odds: "Odds", z: "Log odds", escore: "Escore" };
export const NOTAS: Record<Escala, (t: Traducao) => string> = {
  p: (t) => `cerca de ${Math.round(100 * t.p)} em 100`,
  odds: () => "escala logarítmica",
  z: () => "onde o modelo soma",
  escore: () => "600 − 90 × z: maior é melhor",
};
export const TITULO_REGUAS = "A mesma PD em quatro réguas";
export const TITULO_TABELA = "Tabela de tradução";
export const TITULO_CTL = "Escolha a PD";
export const ROTULO_ATALHOS = "Ir para";
export const RODAPE = "A seguir: o modelo, escrito em log odds";
/** Onde cada escala é usada: os quatro cartões da base. */
export const USOS: { k: string; t: string }[] = [
  { k: "Log odds", t: "Dentro do modelo, onde os efeitos somam." },
  { k: "Odds", t: "Para comunicar efeito: as chances se multiplicam." },
  { k: "Probabilidade", t: "Na calibração e na conta de perda esperada." },
  { k: "Escore", t: "Na operação e no negócio: maior é melhor." },
];

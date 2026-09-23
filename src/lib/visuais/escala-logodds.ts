/**
 * Escala 3, log odds (capítulo 4, c4p5). Dividir e multiplicar as odds por 2 desloca os log odds em ∓ln(2),
 * qualquer que seja a PD inicial; em PD os dois passos só têm o mesmo tamanho quando a partida é 50%.
 * Contas em funções puras, fonte única para números, réguas e textos: precisão integral, arredondamento só na
 * apresentação. As transformações partem sempre das odds iniciais, nunca de uma aplicação sucessiva de ×2.
 */

export const LN2 = Math.LN2;
export const PD_INICIAL = 0.33;
export const ATALHOS = [0.1, 0.33, 0.5, 0.8] as const;
export const FAIXA_SLIDER: readonly [number, number] = [0.01, 0.99];
/** Janela de leitura das réguas, não limite da escala: os log odds vão de menos a mais infinito. */
export const JANELA_Z: readonly [number, number] = [-6, 6];
export const TICKS_PD = [0, 0.25, 0.5, 0.75, 1] as const;
export const TICKS_Z = [-6, -4, -2, 0, 2, 4, 6] as const;

/** Arredondamento decimal meio para cima, imune ao ruído binário. */
export function arredondar(v: number, casas: number): number {
  const f = 10 ** casas; const bruto = Number((v * f).toFixed(3)); return Math.round(bruto) / f;
}
const num = (v: number, casas: number, sinal = false) => {
  const r = arredondar(v, casas);
  const s = Math.abs(r).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return `${r < 0 ? "−" : sinal && r > 0 ? "+" : ""}${s}`;
};
/** PD com 2 casas; odds e log odds com 3; deslocamento em log odds com 4. */
export const fmtPd = (p: number) => `${num(p * 100, 2)}%`;
export const fmtOdds = (o: number) => num(o, 3);
export const fmtZ = (z: number) => num(z, 3);
export const fmtDesloc = (v: number) => num(v, 4, true);
export const fmtPp = (pp: number) => `${num(pp, 2, true)} pp`;
/** Rótulo de atalho e de controle: PD inteira sem casas ("33%"), fracionária com as casas necessárias. */
export const fmtPdCurta = (p: number) => `${(p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

export const oddsDeP = (p: number) => p / (1 - p);
export const pDeOdds = (o: number) => o / (1 + o);
export const logOdds = (p: number) => Math.log(oddsDeP(p));

export type Cenario = { chave: "menor" | "partida" | "maior"; rotulo: string; p: number; odds: number; z: number; fator: number; deltaPd: number; deltaZ: number };

/** Os três cenários, todos derivados das odds de partida. */
export function cenarios(p: number): Cenario[] {
  const o = oddsDeP(p), z = Math.log(o);
  const monta = (chave: Cenario["chave"], rotulo: string, fator: number): Cenario => {
    const odds = o * fator, pf = pDeOdds(odds);
    return { chave, rotulo, p: pf, odds, z: z + Math.log(fator), fator, deltaPd: (pf - p) * 100, deltaZ: Math.log(fator) };
  };
  return [monta("menor", "Odds ÷ 2", 0.5), monta("partida", "Partida", 1), monta("maior", "Odds × 2", 2)];
}

export const passosIguaisEmPd = (p: number) => Math.abs(p - 0.5) < 1e-12;

/** Leitura do estado, sem texto estático sobre desigualdade: os deslocamentos são sempre os calculados. */
export function leitura(p: number) {
  const [menor, partida, maior] = cenarios(p);
  const iguais = passosIguaisEmPd(p);
  const frasePd = `Em PD: ${fmtPp(menor.deltaPd)} e ${fmtPp(maior.deltaPd)}, ${iguais ? "iguais só em 50%" : "passos desiguais"}.`;
  const fraseZ = `Em log odds: ${fmtDesloc(menor.deltaZ)} e ${fmtDesloc(maior.deltaZ)}, sempre ln(2).`;
  return { menor, partida, maior, iguais, frasePd, fraseZ };
}

/**
 * Comparação dos dois passos: o passo ÷ 2 espelhado para o lado do × 2. Em PD sobra ou falta a diferença entre os
 * tamanhos; em log odds os dois coincidem. A diferença é a dos valores exatos, arredondada só no texto.
 */
export function comparacaoPassos(p: number) {
  const { menor, maior, iguais } = leitura(p);
  const difPd = Math.abs(maior.deltaPd) - Math.abs(menor.deltaPd);
  const difZ = Math.abs(maior.deltaZ) - Math.abs(menor.deltaZ);
  const frase = iguais
    ? "Em 50%, os dois passos coincidem também em PD."
    : `Em PD, o passo × 2 fica ${num(Math.abs(difPd), 2)} pp ${difPd > 0 ? "maior" : "menor"}; em log odds, os dois coincidem.`;
  return { difPd, difZ, frase };
}

export const TITULO = "Nas odds, multiplicar; nos log odds, somar";
export const SUBTITULO = "Dividir as odds por 2 subtrai ln(2) dos log odds; multiplicar soma ln(2), em qualquer PD de partida.";
export const IDENTIDADE = "ln(2 × odds) = ln(odds) + ln(2)";
export const DEFINICAO = "log odds = ln(PD ÷ (1 − PD))";
export const TITULO_GRAF = "Os passos têm o mesmo tamanho?";
export const REGUA_PD = "Probabilidade de default";
export const NOTA_PD = "";
export const REGUA_Z = "Log odds";
export const NOTA_Z = "sem limites nas pontas";
export const NOTA_LEGENDA = "os dois movimentos partem das odds iniciais";
export const TITULO_CTL = "Altere a PD de partida";
export const ROTULO_ATALHOS = "Ir para";
export const ROTULO_COMPARAR = "Comparar os dois passos";
export const RODAPE = "A seguir: probabilidade, odds, log odds e escore";

/** Os três cartões da base; o do cuidado usa a partida escolhida. */
export function base(p: number) {
  const { partida, maior } = leitura(p);
  return [
    { k: "Passos", t: "Em log odds, os passos valem sempre ln(2); em PD, só empatam na partida de 50%." },
    { k: "Cuidado", t: `Dobrar as odds não dobra a PD: de ${fmtPd(partida.p)}, ela vai a ${fmtPd(maior.p)}.` },
    { k: "Próximo passo", t: "O modelo soma contribuições nesta escala; a curva logística devolve a PD." },
  ];
}

export type Validacao = { ok: true; valor: number; aviso?: string } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

/** PD digitada, em porcentagem: estritamente entre 0 e 100; fora de 1% a 99% vale, mas o controle deslizante não alcança. */
export function validarPd(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite um número, como 33 ou 12,5." };
  if (v <= 0) return { ok: false, erro: "Em PD = 0%, o logaritmo não é finito." };
  if (v >= 100) return { ok: false, erro: "Em PD = 100%, as odds não são finitas." };
  const p = v / 100;
  if (p < FAIXA_SLIDER[0] || p > FAIXA_SLIDER[1]) return { ok: true, valor: p, aviso: "Fora de 1% a 99%: valor mantido." };
  return { ok: true, valor: p };
}

/** Posição em régua, de 0 a 1, com aviso quando o valor sai da janela desenhada. */
export const posicaoPd = (p: number) => ({ t: Math.min(1, Math.max(0, p)), fora: p < 0 || p > 1 });
export function posicaoZ(z: number) {
  const [lo, hi] = JANELA_Z;
  return { t: Math.min(1, Math.max(0, (z - lo) / (hi - lo))), fora: z < lo || z > hi };
}

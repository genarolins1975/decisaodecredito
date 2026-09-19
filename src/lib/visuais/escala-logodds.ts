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

export const PERGUNTA = "Se a PD de partida for 50%, os passos em PD também serão iguais?";
export const REVELACAO = "Sim. De 50%, as PDs vão a 33,33% e 66,67%: ±16,67 pp. Nos log odds, os passos são ±ln(2) para qualquer PD inicial.";
export const IDENTIDADE = "ln(2 × odds) = ln(odds) + ln(2)";
export const NOTA_JANELA = "Janela de leitura de −6 a +6, suficiente para PD de 1% a 99%. A escala em si não tem limite.";
export const NOTA_CENTRO = "O centro da régua é zero, não o ponto de partida. Os dois passos são simétricos em torno da PD inicial; só quando ela é 50% essa simetria coincide com o zero.";
export const NOTA_MODELO = "Somar uma quantidade fixa em log odds é o que uma função linear sabe fazer: é por isso que o modelo logístico soma contribuições nesta escala. A soma descreve o efeito estimado, não estabelece causa.";

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
  return [monta("menor", "Odds ÷ 2", 0.5), monta("partida", "Ponto de partida", 1), monta("maior", "Odds × 2", 2)];
}

export const passosIguaisEmPd = (p: number) => Math.abs(p - 0.5) < 1e-12;

/** Leitura do estado, sem texto estático sobre desigualdade: os deslocamentos são sempre os calculados. */
export function leitura(p: number) {
  const [menor, partida, maior] = cenarios(p);
  const iguais = passosIguaisEmPd(p);
  const frasePd = iguais
    ? `Em PD = 50%, os passos também são iguais: ${fmtPp(menor.deltaPd)} e ${fmtPp(maior.deltaPd)}.`
    : `Em PD, os passos são ${fmtPp(menor.deltaPd)} e ${fmtPp(maior.deltaPd)}, de tamanhos diferentes.`;
  const fraseZ = `Em log odds, ${fmtDesloc(menor.deltaZ)} e ${fmtDesloc(maior.deltaZ)}: o mesmo ln(2) nos dois sentidos.`;
  return { menor, partida, maior, iguais, frasePd, fraseZ };
}

export type Validacao = { ok: true; valor: number; aviso?: string } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

/** PD digitada, em porcentagem: estritamente entre 0 e 100; fora de 1% a 99% vale, mas o controle deslizante não alcança. */
export function validarPd(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite um número, por exemplo 33 ou 12,5." };
  if (v <= 0) return { ok: false, erro: "Em PD = 0% as odds são zero e o logaritmo não é finito." };
  if (v >= 100) return { ok: false, erro: "Em PD = 100% as odds não têm valor finito, nem logaritmo." };
  const p = v / 100;
  if (p < FAIXA_SLIDER[0] || p > FAIXA_SLIDER[1]) return { ok: true, valor: p, aviso: `PD de ${fmtPd(p)}: fora da faixa do controle deslizante (1% a 99%); o valor digitado é mantido.` };
  return { ok: true, valor: p };
}

/** Posição em régua, de 0 a 1, com aviso quando o valor sai da janela desenhada. */
export const posicaoPd = (p: number) => ({ t: Math.min(1, Math.max(0, p)), fora: p < 0 || p > 1 });
export function posicaoZ(z: number) {
  const [lo, hi] = JANELA_Z;
  return { t: Math.min(1, Math.max(0, (z - lo) / (hi - lo))), fora: z < lo || z > hi };
}

/** Curva logit(p) da aba opcional, amostrada dentro da janela. */
export function curvaLogit(n = 240): { p: number; z: number }[] {
  const pts: { p: number; z: number }[] = [];
  const pMin = 1 / (1 + Math.exp(-JANELA_Z[0])), pMax = 1 / (1 + Math.exp(-JANELA_Z[1]));
  for (let i = 0; i <= n; i++) { const p = pMin + ((pMax - pMin) * i) / n; pts.push({ p, z: Math.log(p / (1 - p)) }); }
  return pts;
}

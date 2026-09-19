/**
 * Laboratório de regressão logística (capítulo 4, c4p2): todas as contas do laboratório em funções puras, sobre as
 * 16 propostas didáticas. Convenção de unidades: x é a utilização do limite em proporção (70% = 0,70). O eixo e os
 * controles mostram porcentagem; as contas usam proporção. Reta e logística são ajustadas de verdade sobre a base
 * (mínimos quadrados e máxima verossimilhança sem penalização, só com utilização); mover um coeficiente é exploração
 * de parâmetros, não novo ajuste.
 */
import { logisticaNewton, retaMinimosQuadrados, type Proposta } from "./logistica";

export type Modelo = { beta0: number; beta1: number };
export type Reta = { a: number; b: number };
export type Janela = { xMin: number; xMax: number };

/** Janela fixa do gráfico: utilização de 0% a 120%. Escalas fixas evitam falsas impressões de mudança. */
export const JANELA: Janela = { xMin: 0, xMax: 1.2 };
export const DELTA_X = 0.1;
export const LIMITES = { beta0: [-8, 8] as const, beta1: [-15, 15] as const, util: [0, 1.2] as const, a: [-1.5, 1.5] as const, b: [-3, 3] as const };

/** Logística numericamente estável: nunca calcula exp de um número grande positivo. */
export function sigmoideEstavel(z: number): number {
  if (z >= 0) { const e = Math.exp(-z); return 1 / (1 + e); }
  const e = Math.exp(z); return e / (1 + e);
}

export const escoreZ = (m: Modelo, x: number) => m.beta0 + m.beta1 * x;
export const pd = (m: Modelo, x: number) => sigmoideEstavel(escoreZ(m, x));
export const oddsDe = (z: number) => Math.exp(z);
export const retaEm = (r: Reta, x: number) => r.a + r.b * x;

/** Ponto do laboratório: escore, odds e PD na utilização x. */
export function ponto(m: Modelo, x: number) {
  const z = escoreZ(m, x); return { x, z, odds: oddsDe(z), p: sigmoideEstavel(z) };
}

/** Efeito de +10 pontos percentuais de utilização com os parâmetros fixos: diferença finita exata, multiplicador das odds e derivada local. */
export function efeitoDezPontos(m: Modelo, x: number, janela: Janela = JANELA) {
  const de = pd(m, x); const p1 = pd(m, x + DELTA_X);
  const disponivel = x + DELTA_X <= janela.xMax + 1e-9;
  const derivada = m.beta1 * de * (1 - de); // por unidade de x, isto é, por 100 pp de utilização
  return {
    disponivel, de, para: p1, deltaPp: (p1 - de) * 100, multOdds: Math.exp(DELTA_X * m.beta1),
    derivada, aproxPpPor1pp: derivada * 0.01 * 100, // variação local aproximada da PD, em pp, para 1 pp de utilização
  };
}

/** Utilização em que a curva cruza PD = 50%: x50 = −β0 ÷ β1 (nula quando β1 = 0). */
export const x50 = (m: Modelo): number | null => (m.beta1 === 0 ? null : -m.beta0 / m.beta1);

/** Ajuste da aula sobre a base: reta por mínimos quadrados e logística por máxima verossimilhança (Newton), x em proporção. */
export function ajusteDaAula(base: Proposta[]): { reta: Reta; logistica: Modelo } {
  const r = retaMinimosQuadrados(base); // inclinação por ponto percentual: converte para proporção
  const [beta0, beta1] = logisticaNewton(base.map((p) => p.util / 100), base.map((p) => p.y), 50);
  return { reta: { a: r.a, b: r.b * 100 }, logistica: { beta0, beta1 } };
}

const fp = (v: number, casas = 1) => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).replace("-", "−")}%`;
/** Variação em pontos percentuais com sinal tipográfico; o que arredonda para zero sai sem sinal. */
export const fmtPp = (v: number, casas = 1) => { const a = Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }); const zero = Number(a.replace(",", ".")) === 0; return `${zero ? "" : v > 0 ? "+" : "−"}${a} pp`; };
const fpp = fmtPp;
export const fmtSinal = (v: number, casas = 2) => `${v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}`;

/** Onde a curva cruza 50%, em texto, dentro ou fora da janela; para β1 = 0, a PD constante. */
export function fraseCruzamento(m: Modelo, janela: Janela = JANELA): string {
  const c = x50(m);
  if (c === null) {
    const p = sigmoideEstavel(m.beta0);
    return m.beta0 === 0 ? "Com β₁ = 0 e β₀ = 0, a PD é 50% em toda a curva: cruza 50% em todo ponto." : `Com β₁ = 0, a PD é constante em ${fp(p)} e nunca cruza 50%.`;
  }
  if (c < janela.xMin || c > janela.xMax) return `A curva cruza 50% em x₅₀ = −β₀ ÷ β₁ = ${fp(c)} de utilização, fora da janela de ${fp(janela.xMin, 0)} a ${fp(janela.xMax, 0)}.`;
  return `A curva cruza 50% em x₅₀ = −β₀ ÷ β₁ = ${fp(c)} de utilização.`;
}

/** Frase sobre o sinal do coeficiente. Associação neste modelo, nunca efeito causal. */
export function fraseSinal(m: Modelo): string {
  if (m.beta1 > 0) return "Maior utilização está associada a maior PD neste modelo.";
  if (m.beta1 < 0) return "Maior utilização está associada a menor PD neste modelo.";
  return "A utilização não altera a PD: a curva é horizontal.";
}

/** Frase sobre a diferença em relação ao ajuste da aula: nível (β₀) e inclinação (|β₁|), com o ponto de transição. */
export function fraseMudanca(m: Modelo, aula: Modelo): string[] {
  const out: string[] = [];
  const mesmoBeta1 = Math.abs(m.beta1 - aula.beta1) < 1e-9;
  if (mesmoBeta1 && m.beta0 > aula.beta0 + 1e-9) out.push("β₀ maior com β₁ igual: a PD aumenta para qualquer utilização fixa, e a curva inteira desliza para a esquerda.");
  if (mesmoBeta1 && m.beta0 < aula.beta0 - 1e-9) out.push("β₀ menor com β₁ igual: a PD diminui para qualquer utilização fixa, e a curva inteira desliza para a direita.");
  if (Math.abs(m.beta1) > Math.abs(aula.beta1) + 1e-9) {
    const incl = (Math.abs(m.beta1) / 4) * 100; const c = x50(m);
    out.push(`|β₁| maior: a inclinação máxima da curva, em PD = 50%, passa a ${incl.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} pp por 100 pp de utilização (β₁ ÷ 4)${c !== null ? `, e o ponto de transição também se moveu, para ${fp(c)}` : ""}.`);
  }
  if (Math.abs(m.beta1) < Math.abs(aula.beta1) - 1e-9 && m.beta1 !== 0) out.push(`|β₁| menor: a curva ficou mais suave; a inclinação máxima cai para ${((Math.abs(m.beta1) / 4) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} pp por 100 pp de utilização.`);
  return out;
}

/** Frase do efeito de +10 pp na utilização selecionada. */
export function fraseEfeito(m: Modelo, x: number, janela: Janela = JANELA): string {
  const e = efeitoDezPontos(m, x, janela);
  if (!e.disponivel) return `Com utilização em ${fp(x, 0)}, +10 pp sairia da janela de ${fp(janela.xMax, 0)}: o efeito não é mostrado para não extrapolar em silêncio.`;
  return `De ${fp(x, 0)} para ${fp(x + DELTA_X, 0)} de utilização: PD de ${fp(e.de)} para ${fp(e.para)}, ${fpp(e.deltaPp)}. As odds multiplicam por ${e.multOdds.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em qualquer ponto; a variação em pp depende de onde se parte.`;
}

/** Interpretação completa do cenário, em frases curtas. */
export function interpretar(m: Modelo, aula: Modelo, x: number, exploratorio: boolean, janela: Janela = JANELA): string[] {
  const frases = [fraseSinal(m), fraseCruzamento(m, janela), ...fraseMudanca(m, aula), fraseEfeito(m, x, janela)];
  if (!exploratorio) frases.push("Ajuste da aula: mínimos quadrados e máxima verossimilhança sobre as 16 propostas, só com utilização. Uma curva dentro de 0% e 100% não é, por isso, bem calibrada: calibração se mede fora da amostra, no capítulo 7.");
  else frases.push("Parâmetros exploratórios: os coeficientes foram movidos à mão, não reestimados. A base observada não mudou.");
  return frases;
}

/** A reta de comparação escapa do intervalo de probabilidades dentro da janela? Onde? */
export function retaForaDoIntervalo(r: Reta, janela: Janela = JANELA) {
  const y0 = retaEm(r, janela.xMin), y1 = retaEm(r, janela.xMax);
  const abaixo = Math.min(y0, y1) < 0, acima = Math.max(y0, y1) > 1;
  const foraDoGrafico = Math.min(y0, y1) < -0.25 || Math.max(y0, y1) > 1.25;
  const cruzaZero = r.b !== 0 ? -r.a / r.b : null, cruzaUm = r.b !== 0 ? (1 - r.a) / r.b : null;
  return { abaixo, acima, foraDoGrafico, cruzaZero, cruzaUm };
}

/** Curva amostrada na janela, para desenhar. */
export function amostrar(f: (x: number) => number, janela: Janela = JANELA, n = 121): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => { const x = janela.xMin + ((janela.xMax - janela.xMin) * i) / (n - 1); return { x, y: f(x) }; });
}

export type Experimento = { id: "nivel" | "sinal" | "zero" | "mesmo"; rotulo: string; pergunta: string; aplicar: (aula: Modelo, atual: Modelo) => { modelo: Modelo; x?: number; efeito?: boolean }; explicar: (aula: Modelo, m: Modelo) => string };

/** Quatro experimentos guiados: cada um muda os parâmetros e faz uma pergunta; a explicação só aparece quando o professor revela. */
export const EXPERIMENTOS: Experimento[] = [
  {
    id: "nivel", rotulo: "Mudar o nível", pergunta: "Somando 2 ao intercepto, a PD sobe pelo mesmo número de pontos percentuais em toda a curva?",
    aplicar: (aula) => ({ modelo: { beta0: aula.beta0 + 2, beta1: aula.beta1 } }),
    explicar: (aula, m) => { const a = (x: number) => (pd(m, x) - pd(aula, x)) * 100; return `Não. A PD sobe para qualquer utilização fixa, mas não pelo mesmo tanto: em 20% sobe ${fpp(a(0.2))}, em 60% sobe ${fpp(a(0.6))} e em 100% sobe ${fpp(a(1))}. Em log odds a mudança é a mesma, +2; em probabilidade ela depende de onde a curva está. O ponto de 50% deslizou de ${fp(x50(aula) ?? 0)} para ${fp(x50(m) ?? 0)}.`; },
  },
  {
    id: "sinal", rotulo: "Inverter a relação", pergunta: "Com β₁ negativo, o que a curva afirma sobre utilização e risco? Isso é compatível com a base observada?",
    aplicar: (aula) => ({ modelo: { beta0: aula.beta0, beta1: -aula.beta1 } }),
    explicar: (aula, m) => `A curva agora diz que mais utilização se associa a menos default, o contrário do que as 16 propostas mostram: os defaults se concentram nas utilizações altas. O sinal do coeficiente é a primeira leitura econômica de um modelo; um sinal contra a hipótese pede investigação antes de qualquer métrica. Com β₀ mantido, o ponto de 50% passou de ${fp(x50(aula) ?? 0)} para ${fp(x50(m) ?? 0)}, fora da janela.`,
  },
  {
    id: "zero", rotulo: "Eliminar o efeito", pergunta: "Com β₁ = 0, qual é a PD de cada proposta? O que a utilização passou a valer como informação?",
    aplicar: (aula) => ({ modelo: { beta0: aula.beta0, beta1: 0 } }),
    explicar: (_aula, m) => `A curva fica horizontal: toda proposta recebe a mesma PD, ${fp(sigmoideEstavel(m.beta0))}, qualquer que seja a utilização. A utilização deixou de carregar informação neste modelo. Se o intercepto fosse reestimado sem a variável, a PD constante seria a prevalência da base, 8 em 16, 50%; aqui β₀ foi mantido, por isso o nível não é 50%.`,
  },
  {
    id: "mesmo", rotulo: "Mesmo coeficiente, efeitos diferentes", pergunta: "Com o mesmo β₁, +10 pp de utilização sobem a PD pelo mesmo número de pontos percentuais partindo de 20% e partindo de 60%?",
    aplicar: (aula) => ({ modelo: { ...aula }, x: 0.2, efeito: true }),
    explicar: (_aula, m) => { const e1 = efeitoDezPontos(m, 0.2), e2 = efeitoDezPontos(m, 0.6); return `Não. Partindo de 20%: PD de ${fp(e1.de)} para ${fp(e1.para)}, ${fpp(e1.deltaPp)}. Partindo de 60%: de ${fp(e2.de)} para ${fp(e2.para)}, ${fpp(e2.deltaPp)}. O multiplicador das odds é o mesmo nos dois casos, ${e1.multOdds.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}: o efeito é constante em log odds e multiplicativo nas odds, mas em pontos percentuais depende do ponto de partida, maior perto de 50% e menor nas pontas.`; },
  },
];

/**
 * Escala 1, probabilidade (capítulo 4, c4p3): contas em funções puras, uma fonte única para números, grade, réguas
 * e textos. PD por operação em passos de 1 pp; cem operações idênticas; incremento didático somado diretamente à
 * PD, nunca limitado a 100%, para revelar a violação da escala; odds = p ÷ (1 − p) com os extremos tratados.
 */
export const N_OPERACOES = 100;
export const PD_INICIAL = 0.95;
export const INCREMENTO_INICIAL = 0.1;
export const PONTOS_FIXOS = [0.05, 0.5] as const;
export const EIXO_MAX = 1.2;
export type Etapa = "pd" | "limites" | "odds" | "tudo";
export const ETAPAS: { id: Etapa; rotulo: string }[] = [{ id: "pd", rotulo: "Interpretar a PD" }, { id: "limites", rotulo: "Testar +10 pp" }, { id: "odds", rotulo: "Revelar odds" }, { id: "tudo", rotulo: "Mostrar tudo" }];

const pct = (v: number, casas = 0) => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
export const fmtPctInt = pct;

/** PD em passos inteiros de 1 pp, entre 0 e 1. */
export const normalizarPd = (p: number) => Math.min(1, Math.max(0, Math.round(p * 100) / 100));

/** Número esperado de defaults e de adimplentes em 100 operações: soma das probabilidades, sem hipótese de independência. */
export function esperados(p: number, n = N_OPERACOES) {
  const defaults = Math.round(n * p); return { defaults, adimplentes: n - defaults, total: n };
}

/** Odds = p ÷ (1 − p), com os extremos: 0 em p = 0 e sem valor finito em p = 1. */
export function oddsDe(p: number): { valor: number | null; texto: string; leitura: string; conta: string } {
  if (p >= 1) return { valor: null, texto: "→ ∞", leitura: "Em p = 1 a razão não tem valor finito: não há adimplentes esperados para dividir.", conta: "odds → ∞ quando p → 1" };
  if (p <= 0) return { valor: 0, texto: "0", leitura: "Nenhum default esperado para cada adimplente esperado.", conta: "odds = 0,00 ÷ 1,00 = 0" };
  const o = p / (1 - p); const t = o.toLocaleString("pt-BR", { maximumFractionDigits: o >= 10 ? 1 : 2 });
  const leitura = o >= 1 ? `${t} defaults esperados para cada adimplente esperado.` : `1 default esperado para cada ${(1 / o).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} adimplentes esperados.`;
  return { valor: o, texto: t, leitura, conta: `odds = ${p.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ÷ ${(1 - p).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${t}` };
}

/** Incremento somado diretamente à PD, sem limitar a 100%: a violação é o ponto da atividade. */
export function incremento(p: number, dPp: number) {
  const para = p + dPp / 100; return { de: p, para, valido: para <= 1 + 1e-9, rotulo: `${pct(p)} → ${pct(para)}` };
}

/** As três réguas: dois pontos fixos e a PD selecionada, na mesma escala de 0% a 120%. */
export function reguas(pSel: number, dPp: number) {
  return [...PONTOS_FIXOS, pSel].map((p, i) => ({ ...incremento(p, dPp), selecionada: i === 2 }));
}

/** Mensagem do limite para a PD selecionada. */
export function mensagemLimite(p: number, dPp: number) {
  const r = incremento(p, dPp);
  return r.valido ? { invalida: false, texto: "Neste ponto, o resultado permanece entre 0% e 100%." } : { invalida: true, texto: `${pct(r.para)} não é uma probabilidade.` };
}

export const CONCLUSAO = "Um incremento positivo constante não pode ser aplicado a toda a escala de probabilidade sem eventualmente ultrapassar 100%.";
export const NOTA_GRADE = "A grade representa a expectativa, não um resultado garantido. Ela não identifica quais operações entrarão em default.";

/** O que cada etapa mostra. */
export const visivel = (etapa: Etapa) => ({ pd: true, limites: etapa === "limites" || etapa === "odds" || etapa === "tudo", odds: etapa === "odds" || etapa === "tudo" });

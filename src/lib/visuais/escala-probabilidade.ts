/**
 * Escala 1, probabilidade (capítulo 4, c4p3): contas em funções puras, uma fonte única para números, grade, réguas
 * e textos. PD por operação em passos de 1 pp; cem operações idênticas; incremento didático somado diretamente à
 * PD, nunca limitado a 100%, para revelar a violação da escala; odds = p ÷ (1 − p) com os extremos tratados.
 */
export const N_OPERACOES = 100;
export const PD_INICIAL = 0.95;
export const INCREMENTO_INICIAL = 0.1;
export const INCREMENTO_MAX = 20;
export const PONTOS_FIXOS = [0.05, 0.5] as const;
export const EIXO_MAX = 1.2;
export const ATALHOS = [0.05, 0.12, 0.5, 0.95] as const;

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

/** Leitura da grade para o painel: quantos, nunca quais. */
export function leitura(p: number) {
  const { defaults, total } = esperados(p);
  if (defaults === 0) return `Nenhum default esperado em ${total} operações com este perfil.`;
  if (defaults === total) return `Todas as ${total} operações terminam em default no horizonte.`;
  return `Cerca de ${defaults} em ${total} terminam em default; a PD não diz quais.`;
}

/** O resultado do incremento na PD escolhida, para o painel: o número e se ele ainda é probabilidade. */
export function resultado(p: number, dPp: number) {
  const r = incremento(p, dPp);
  return { para: pct(r.para), invalida: !r.valido, texto: r.valido ? "Entre 0% e 100%: ainda é probabilidade." : "Acima de 100%: não é probabilidade." };
}

export const TITULO = "A PD conta quantos, não quais, e não passa de 100%";
export const SUBTITULO = "Ela diz quantos defaults esperar num grupo; somar pontos a ela esbarra no limite da escala.";
export const FORMULAS = [
  { k: "Em cem operações", tex: String.raw`\text{defaults esperados} = 100 \times \mathrm{PD}` },
  { k: "Limites da escala", tex: String.raw`0\% \le \mathrm{PD} \le 100\%` },
] as const;
export const TITULO_GRADE = "Cem operações com a mesma PD";
export const NOTA_GRADE_CURTA = "A grade mostra quantos, não quais.";
export const tituloReguas = (dPp: number) => `Somar +${dPp} pp funciona em toda a escala?`;
export const TITULO_CTL = "Altere a PD";
export const ROTULO_ATALHOS = "Ir para";
export const RODAPE = "A seguir: odds, quantos defaults para cada adimplente · pp: pontos percentuais";

/** Os três cartões da base; os números vêm das contas, não do texto. */
export function cartoes() {
  const doze = esperados(0.12), lim = incremento(0.95, 10), e95 = esperados(0.95);
  return [
    { k: "O que ela afirma", t: `PD de ${pct(0.12)}: cerca de ${doze.defaults} em ${doze.total} operações terminam em default; não diz quais.` },
    { k: "Onde ela aperta", t: `${pct(lim.de)} + 10 pp = ${pct(lim.para)}: um efeito constante em pontos atravessa o limite.` },
    { k: "Próxima escala", t: `Odds comparam defaults com adimplentes: em ${pct(0.95)}, ${e95.defaults} para ${e95.adimplentes}, odds ${oddsDe(0.95).texto}.` },
  ];
}

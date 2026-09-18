/**
 * Regras temporais do capítulo 3 em funções puras: disponibilidade de um campo na data da decisão e maturação de safras.
 * Calendário simplificado sem ano bissexto (dia 0 = 1 de janeiro); meses de safra como índice ano × 12 + mês.
 */

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NOME_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Dia do ano (0 = 1 jan) a partir de dia e mês (1 a 12). */
export function dia(d: number, mes: number): number {
  let n = 0; for (let m = 0; m < mes - 1; m++) n += DIAS_MES[m]; return n + d - 1;
}
export function rotuloDia(n: number): string {
  let m = 0, r = n; while (r >= DIAS_MES[m]) { r -= DIAS_MES[m]; m++; } return `${r + 1} ${NOME_MES[m]}`;
}

export type EstadoCampo = "utilizavel" | "ocorreu_sem_saber" | "futuro";

/** O que autoriza um campo é a disponibilidade, não o evento: utilizável só quando disponível até a decisão. */
export function estadoDoCampo(evento: number, disponibilidade: number, decisao: number): EstadoCampo {
  if (disponibilidade <= decisao) return "utilizavel";
  if (evento <= decisao) return "ocorreu_sem_saber";
  return "futuro";
}

/** Regra ingênua, que só olha a data do evento: deixa entrar o que ocorreu antes da decisão, disponível ou não. */
export function entraPelaRegraIngenua(evento: number, decisao: number): boolean { return evento <= decisao; }

export const mesIdx = (ano: number, mes: number) => ano * 12 + (mes - 1);
export const rotuloMes = (idx: number) => `${NOME_MES[idx % 12]} ${Math.floor(idx / 12)}`;
export const rotuloMesCurto = (idx: number) => `${String(Math.floor(idx / 12)).slice(2)}${String((idx % 12) + 1).padStart(2, "0")}`;

/** Uma safra entra quando safra + horizonte + apuração <= data de referência (tudo em meses). */
export function safraMadura(safra: number, referencia: number, horizonte = 12, apuracao = 1): boolean {
  return safra + horizonte + apuracao <= referencia;
}
/** Meses de performance já observados de uma safra até a referência (0 a horizonte). */
export function mesesObservados(safra: number, referencia: number, horizonte = 12): number {
  return Math.max(0, Math.min(horizonte, referencia - safra));
}
/** Fração ilustrativa dos defaults de 12 meses já manifestados após m meses: 42% na metade da janela, como na página c3p12. */
export function fracaoManifestada(m: number, horizonte = 12): number {
  const meio = horizonte / 2;
  if (m <= 0) return 0; if (m >= horizonte) return 1;
  return m <= meio ? (m / meio) * 0.42 : 0.42 + ((m - meio) / meio) * 0.58;
}
/** Prevalência medida se safras imaturas entrarem com rótulo zero, contra a prevalência verdadeira p (todas as safras do mesmo tamanho). */
export function prevalenciaComImaturas(safras: number[], referencia: number, p: number, horizonte = 12, apuracao = 1): { comImaturas: number; soMaduras: number; imaturas: number } {
  const inc = safras.filter((s) => s <= referencia - 1); // já concedidas há pelo menos um mês
  let soma = 0, imaturas = 0;
  for (const s of inc) { if (safraMadura(s, referencia, horizonte, apuracao)) soma += p; else { imaturas++; soma += p * fracaoManifestada(mesesObservados(s, referencia, horizonte), horizonte); } }
  return { comImaturas: inc.length ? soma / inc.length : p, soMaduras: p, imaturas };
}

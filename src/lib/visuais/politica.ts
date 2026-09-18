/**
 * Avaliador de carteira com política em três zonas (capítulo 10): aprovação automática até o corte, fila de revisão
 * manual até o teto com capacidade limitada e recusa acima. O revisor observa um sinal ruidoso da PD verdadeira do
 * gerador (a qualidade do sinal é parâmetro do exercício). Porte do motor original da aula, conferido em
 * tests/visuais.test.ts (corte 12%, teto 30%, capacidade 80: 548 aprovados e R$ 607 mil).
 */
import { logit, sigmoide } from "./logistica";

export type Politica = { corte: number; teto: number; capacidade: number; qualidade: number; lgd: number; receita: number; funding: number; operacao: number; capital: number; custoRevisao: number };
export const POLITICA: Politica = { corte: 0.12, teto: 0.3, capacidade: 80, qualidade: 0.6, lgd: 0.65, receita: 0.28, funding: 0.12, operacao: 120, capital: 0.02, custoRevisao: 90 };
export const CHOQUE = { funding: 0.21, lgd: 0.8, deslocamento: 0.3 } as const;

/** ruído normal padrão determinístico por identificador, para a revisão manual ser reprodutível */
export function ruidoEstavel(id: number, semente = 7): number {
  let h = (Math.imul(id, 2654435761) + semente * 40503) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0; h ^= h >>> 16;
  const u1 = Math.max((h >>> 0) / 4294967296, 1e-9);
  const h2 = Math.imul(h ^ 0x9e3779b9, 2654435761) >>> 0; const u2 = (h2 >>> 0) / 4294967296;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export type Registro = { i: number; pd: number; pdUsada: number; ead: number; y: number; zona: "auto" | "revisao" | "recusa"; revisado: boolean; aprovado: boolean; esperado: number; realizado: number };
export type Avaliacao = { reg: Registro[]; aprovados: number; revisados: number; aprovadosNaRevisao: number; filaNaoAtendida: number; exposicao: number; receitaEsp: number; perda: number; funding: number; operacao: number; capital: number; revisoes: number; esperado: number; realizado: number; valorReal: number | null; defaultsAprovados: number };

export function avaliarCarteira(ops: { pd: number[]; ead: number[]; y: number[]; pt?: number[] }, par: Partial<Politica> = {}): Avaliacao {
  const P = { ...POLITICA, ...par }; const n = ops.pd.length;
  const reg: Registro[] = ops.pd.map((pd, i) => {
    const zona = pd <= P.corte ? "auto" : pd <= P.teto ? "revisao" : "recusa";
    return { i, pd, pdUsada: pd, ead: ops.ead[i], y: ops.y[i], zona, revisado: false, aprovado: zona === "auto", esperado: 0, realizado: 0 };
  });
  const fila = reg.filter((r) => r.zona === "revisao").sort((a, b) => a.pd - b.pd).slice(0, Math.max(0, Math.min(P.capacidade, n)));
  const w = Math.min(Math.max(P.qualidade, 0), 1);
  for (const r of fila) {
    const alvo = ops.pt ? ops.pt[r.i] : r.pd;
    const z = (1 - w) * logit(r.pd) + w * logit(alvo) + ruidoEstavel(r.i) * 0.6 * (1 - w);
    r.revisado = true; r.pdUsada = sigmoide(z); r.aprovado = r.pdUsada <= P.corte;
  }
  let receitaEsp = 0, perda = 0, funding = 0, operacao = 0, capital = 0, exposicao = 0, realizado = 0, defaultsAprovados = 0, valorReal = 0;
  for (const r of reg) {
    if (!r.aprovado) continue;
    const R = r.ead * P.receita, F = r.ead * P.funding, O = P.operacao, K = r.ead * P.capital, EL = r.pdUsada * P.lgd * r.ead;
    r.esperado = (1 - r.pdUsada) * R - EL - F - O - K;
    r.realizado = r.y ? -P.lgd * r.ead - F - O - K : R - F - O - K;
    // valor da decisão sob a PD verdadeira do gerador: só existe porque a base é sintética
    if (ops.pt) { const t = ops.pt[r.i]; valorReal += (1 - t) * R - t * P.lgd * r.ead - F - O - K; }
    receitaEsp += (1 - r.pdUsada) * R; perda += EL; funding += F; operacao += O; capital += K; exposicao += r.ead; realizado += r.realizado; defaultsAprovados += r.y;
  }
  const revisoes = fila.length * P.custoRevisao;
  return { reg, aprovados: reg.filter((r) => r.aprovado).length, revisados: fila.length, aprovadosNaRevisao: fila.filter((r) => r.aprovado).length, filaNaoAtendida: reg.filter((r) => r.zona === "revisao").length - fila.length, exposicao, receitaEsp, perda, funding, operacao, capital, revisoes, esperado: receitaEsp - perda - funding - operacao - capital - revisoes, realizado: realizado - revisoes, valorReal: ops.pt ? valorReal - revisoes : null, defaultsAprovados };
}

/** aplica o choque: PD deslocada em log odds, funding e perda dado o default maiores */
export function sobChoque(pd: number[], delta = CHOQUE.deslocamento): number[] { return pd.map((p) => sigmoide(logit(Math.min(1 - 1e-9, Math.max(1e-9, p))) + delta)); }

/**
 * Perda logarítmica de uma PD constante e descida de gradiente em um parâmetro (capítulo 2). O grupo didático tem
 * 8 propostas com 1 default: o mínimo da perda fica na frequência observada, 12,5%. Funções puras, com testes.
 */
import { sigmoide } from "./logistica";

/** perda média de uma PD constante p num grupo com k defaults em n propostas */
export function perdaConstante(p: number, k: number, n: number): number {
  const q = Math.min(1 - 1e-12, Math.max(1e-12, p));
  return -(k * Math.log(q) + (n - k) * Math.log(1 - q)) / n;
}
export type Iteracao = { t: number; b: number; p: number; g: number; perda: number };
/** descida sobre o log odds b: p = σ(b), gradiente g = p − k/n, b ← b − passo × g */
export function descidaConstante(k: number, n: number, passo: number, iteracoes: number, b0 = 0): Iteracao[] {
  const alvo = k / n; let b = b0; const out: Iteracao[] = [];
  for (let t = 0; t <= iteracoes; t++) {
    const p = sigmoide(b); const g = p - alvo;
    out.push({ t, b, p, g, perda: perdaConstante(p, k, n) });
    b = b - passo * g;
  }
  return out;
}
/** curva da perda para o gráfico: PD de 0,5% a 90% (acima disso a perda dispara e sai da escala) */
export function curvaPerda(k: number, n: number, pontos = 199): { p: number; perda: number }[] {
  return Array.from({ length: pontos }, (_, i) => { const p = 0.005 + (i / (pontos - 1)) * 0.895; return { p, perda: perdaConstante(p, k, n) }; });
}

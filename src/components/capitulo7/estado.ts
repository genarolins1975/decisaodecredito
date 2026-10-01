"use client";
import { useSyncExternalStore } from "react";

/**
 * Estado compartilhado entre slides vizinhos do capítulo 7. A regra geral é que cada slide reabre no estado inicial;
 * a única exceção é a fração da carteira examinada, que os slides 12 (ganho) e 13 (lift) leem do mesmo lugar para
 * que a turma compare os dois números no mesmo ponto. Vive na memória da aba e some ao recarregar.
 */
type Chave = "fracaoExaminada";
const valores: Record<Chave, number> = { fracaoExaminada: 0.1 };
const ouvintes = new Set<() => void>();
export function usarCompartilhado(k: Chave): [number, (v: number) => void] {
  const v = useSyncExternalStore((cb) => { ouvintes.add(cb); return () => ouvintes.delete(cb); }, () => valores[k], () => 0.1);
  return [v, (x: number) => { valores[k] = x; ouvintes.forEach((f) => f()); }];
}

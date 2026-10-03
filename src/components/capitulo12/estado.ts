"use client";
import { useSyncExternalStore } from "react";

/**
 * Estado compartilhado do capítulo 12: só a resposta da turma à pergunta de abertura (slide 1), que o slide 49 retoma.
 * Vive na memória da aba e some ao recarregar; os demais slides reabrem no estado inicial.
 */
let resposta: number | null = null;
const ouvintes = new Set<() => void>();
export function useRespostaAbertura(): [number | null, (v: number | null) => void] {
  const v = useSyncExternalStore((cb) => { ouvintes.add(cb); return () => ouvintes.delete(cb); }, () => resposta, () => null);
  return [v, (x) => { resposta = x; ouvintes.forEach((f) => f()); }];
}

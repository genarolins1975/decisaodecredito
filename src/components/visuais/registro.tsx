"use client";
import type { ComponentType } from "react";
import { CemVidas } from "./cem-vidas";
import { FilaDeRisco } from "./fila-de-risco";

/**
 * Visuais nativos por página. Quando uma página tem um visual aqui, ele substitui o visual herdado (iframe) no lugar
 * do bloco "legacy" correspondente, em aula, apresentação e aula ao vivo. Fonte dos números: src/lib/visuais.
 */
const REGISTRO: Record<string, ComponentType> = {
  c1p5: CemVidas,
  c7p6: FilaDeRisco,
};

export function visualNativo(slug: string): ComponentType | null {
  return REGISTRO[slug] ?? null;
}

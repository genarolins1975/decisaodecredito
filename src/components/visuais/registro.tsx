"use client";
import type { ComponentType } from "react";
import { CemVidas } from "./cem-vidas";
import { CurvaDeLucro } from "./curva-de-lucro";
import { FilaDeRisco } from "./fila-de-risco";
import { LinhaDoTempo } from "./linha-do-tempo";
import { Safras } from "./safras";

/**
 * Visuais nativos por página. "legacy": substitui o visual herdado (iframe) da página. "figura": entra no lugar da
 * figura estática (o bloco svgfit do primeiro bloco HTML), mantendo o texto ao redor. Vale em aula, apresentação e
 * aula ao vivo, sem alterar o banco. Fonte dos números: src/lib/visuais.
 */
export type VisualNativo = { Componente: ComponentType; substitui: "legacy" | "figura" };
const REGISTRO: Record<string, VisualNativo> = {
  c1p5: { Componente: CemVidas, substitui: "legacy" },
  c3p7: { Componente: LinhaDoTempo, substitui: "figura" },
  c3p11: { Componente: Safras, substitui: "figura" },
  c7p6: { Componente: FilaDeRisco, substitui: "legacy" },
  c8p8: { Componente: CurvaDeLucro, substitui: "legacy" },
};

export function visualNativo(slug: string): VisualNativo | null {
  return REGISTRO[slug] ?? null;
}

/** Remove o primeiro bloco <div class="svgfit">…</div> (a figura estática), contando os divs aninhados. */
export function removerFiguraEstatica(html: string): string {
  const ini = html.indexOf('<div class="svgfit"');
  if (ini < 0) return html;
  let prof = 0, i = ini;
  const re = /<div\b|<\/div>/g; re.lastIndex = ini;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    prof += m[0] === "</div>" ? -1 : 1;
    if (prof === 0) { i = m.index + m[0].length; break; }
  }
  return prof === 0 ? html.slice(0, ini) + html.slice(i) : html;
}

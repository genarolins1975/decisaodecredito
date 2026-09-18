"use client";
import type { ComponentType } from "react";
import { ResiduosQueEncolhem } from "./residuos-que-encolhem";
import { PerdaQueCai } from "./perda-que-cai";
import { DistanciaQueSeAbre } from "./distancia-que-se-abre";
import { IndiceQueSoma } from "./indice-que-soma";
import { Equidade } from "./equidade";
import { BolinhaNaPerda } from "./bolinha-na-perda";
import { ArvoreQueDecora } from "./arvore-que-decora";
import { IntervaloQueEncolhe } from "./intervalo-que-encolhe";
import { TresZonas } from "./tres-zonas";
import { QuadroDoComite } from "./quadro-do-comite";
import { MesaSobChoque } from "./mesa-sob-choque";
import { ArvoreQueCresce } from "./arvore-que-cresce";
import { CemVidas } from "./cem-vidas";
import { CurvaDeLucro } from "./curva-de-lucro";
import { FilaDeRisco } from "./fila-de-risco";
import { Fronteira } from "./fronteira";
import { RetaQueQuebra } from "./reta-que-quebra";
import { TresEscalas } from "./tres-escalas";
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
  c2p11: { Componente: () => <BolinhaNaPerda modo="perda" />, substitui: "legacy" },
  c2p12: { Componente: () => <BolinhaNaPerda modo="descida" />, substitui: "legacy" },
  c2p14: { Componente: ArvoreQueDecora, substitui: "legacy" },
  c2p16: { Componente: IntervaloQueEncolhe, substitui: "legacy" },
  c3p7: { Componente: LinhaDoTempo, substitui: "figura" },
  c3p11: { Componente: Safras, substitui: "figura" },
  c4p2: { Componente: RetaQueQuebra, substitui: "figura" },
  c4p9: { Componente: TresEscalas, substitui: "legacy" },
  c4p19: { Componente: Fronteira, substitui: "legacy" },
  c5p7: { Componente: () => <ArvoreQueCresce modo="raiz" />, substitui: "legacy" },
  c5p14: { Componente: () => <ArvoreQueCresce modo="freios" />, substitui: "legacy" },
  c5p16: { Componente: () => <ArvoreQueCresce modo="instabilidade" />, substitui: "legacy" },
  c6p7: { Componente: () => <ResiduosQueEncolhem modo="taxa" />, substitui: "legacy" },
  c6p8: { Componente: () => <ResiduosQueEncolhem modo="arvores" />, substitui: "legacy" },
  c6p9: { Componente: () => <ResiduosQueEncolhem modo="soma" />, substitui: "legacy" },
  c6p12: { Componente: () => <PerdaQueCai modo="alvo" />, substitui: "legacy" },
  c6p13: { Componente: () => <PerdaQueCai modo="iteracoes" />, substitui: "legacy" },
  c6p14: { Componente: () => <PerdaQueCai modo="rastro" />, substitui: "legacy" },
  c6p17: { Componente: DistanciaQueSeAbre, substitui: "figura" },
  c7p6: { Componente: FilaDeRisco, substitui: "legacy" },
  c10p2: { Componente: TresZonas, substitui: "legacy" },
  c10p3: { Componente: QuadroDoComite, substitui: "legacy" },
  c10p11: { Componente: () => <MesaSobChoque modo="rodada1" />, substitui: "legacy" },
  c10p12: { Componente: () => <MesaSobChoque modo="choque" />, substitui: "legacy" },
  c10p13: { Componente: () => <MesaSobChoque modo="rodada2" />, substitui: "legacy" },
  c9p3: { Componente: () => <IndiceQueSoma modo="faixas" />, substitui: "legacy" },
  c9p4: { Componente: () => <IndiceQueSoma modo="variaveis" />, substitui: "legacy" },
  c9p5: { Componente: () => <IndiceQueSoma modo="leituras" />, substitui: "legacy" },
  c9p6: { Componente: Equidade, substitui: "legacy" },
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

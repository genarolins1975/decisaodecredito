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
import { ModeloPerfeito } from "./modelo-perfeito";
import { QuatroPerguntas } from "./quatro-perguntas";
import { AcertoQueEngana } from "./acerto-que-engana";
import { Pares } from "./pares";
import { KsEDecis } from "./ks-e-decis";
import { CalibracaoPorFaixa } from "./calibracao-por-faixa";
import { BrierELogLoss } from "./brier-e-logloss";
import { TresAmostras, DecisaoEvidencia } from "./evidencias";
import { ResultadoPorProposta } from "./resultado-por-proposta";
import { TrocaDoCorte } from "./troca-do-corte";
import { RevisaoManual } from "./revisao-manual";
import { Ponte } from "./ponte";
import { PoliticaQueFecha } from "./politica-que-fecha";
import { ArvoreQueCresce } from "./arvore-que-cresce";
import { CemVidas } from "./cem-vidas";
import { CurvaDeLucro } from "./curva-de-lucro";
import { FilaDeRisco } from "./fila-de-risco";
import { Fronteira } from "./fronteira";
import { LabLogistica } from "./lab-logistica";
import { EscalaProbabilidade } from "./escala-probabilidade";
import { EscalaOdds } from "./escala-odds";
import { EscalaLogOdds } from "./escala-logodds";
import { EscoreSoma } from "./escore-soma";
import { CoeficientePd } from "./coeficiente-pd";
import { LogitSlides } from "./logit-slides";
import { TresEscalas } from "./tres-escalas";
import { Escalas } from "./escalas";
import { CurvaLogistica } from "./curva-logistica";
import { Intercepto } from "./intercepto";
import { DescidaCompleta } from "./descida-completa";
import { Faixas } from "./faixas";
import { Anatomia } from "./anatomia";
import { Impureza } from "./impureza";
import { CorteCandidato } from "./corte-candidato";
import { Recursao } from "./recursao";
import { Caminho } from "./caminho";
import { Poda } from "./poda";
import { DuasFamilias } from "./duas-familias";
import { Memorando } from "./memorando";
import { TresFenomenos } from "./tres-fenomenos";
import { Gatilhos } from "./gatilhos";
import { Painel } from "./painel";
import { TresEstrategias } from "./tres-estrategias";
import { Hiperparametros } from "./hiperparametros";
import { TresLimites } from "./tres-limites";
import { Recorte } from "./recorte";
import { Variaveis } from "./variaveis";
import { MesmasCaracteristicas } from "./mesmas-caracteristicas";
import { Condicional } from "./condicional";
import { MesmaPd } from "./mesma-pd";
import { Balancear } from "./balancear";
import { Woe } from "./woe";
import { ValorDaInformacao } from "./valor-da-informacao";
import { LinhaDoTempo } from "./linha-do-tempo";
import { Safras } from "./safras";

/**
 * Visuais nativos por página. "legacy": substitui o visual herdado (iframe) da página. "figura": entra no lugar da
 * figura estática (o bloco svgfit do primeiro bloco HTML), mantendo o texto ao redor. Vale em aula, apresentação e
 * aula ao vivo, sem alterar o banco. Fonte dos números: src/lib/visuais.
 */
/** substitui: "legacy" troca o bloco herdado; "figura" troca a figura estática do primeiro bloco HTML; "abertura" entra antes de todos os blocos; "pagina" ocupa o lugar de todo o conteúdo, preservando as questões. */
export type VisualNativo = { Componente: ComponentType<{ palco?: boolean; pagina?: { index: number; total: number } }>; substitui: "legacy" | "figura" | "abertura" | "pagina" };
const REGISTRO: Record<string, VisualNativo> = {
  c1p5: { Componente: CemVidas, substitui: "legacy" },
  c1p7: { Componente: MesmaPd, substitui: "legacy" },
  c2p2: { Componente: Recorte, substitui: "legacy" },
  c2p5: { Componente: Variaveis, substitui: "legacy" },
  c2p6: { Componente: MesmasCaracteristicas, substitui: "legacy" },
  c2p7: { Componente: Condicional, substitui: "legacy" },
  c2p11: { Componente: () => <BolinhaNaPerda modo="perda" />, substitui: "legacy" },
  c2p12: { Componente: () => <BolinhaNaPerda modo="descida" />, substitui: "legacy" },
  c2p14: { Componente: ArvoreQueDecora, substitui: "legacy" },
  c2p16: { Componente: IntervaloQueEncolhe, substitui: "legacy" },
  c3p7: { Componente: LinhaDoTempo, substitui: "figura" },
  c3p11: { Componente: Safras, substitui: "figura" },
  c3p15: { Componente: Balancear, substitui: "legacy" },
  c3p16: { Componente: Woe, substitui: "legacy" },
  c3p17: { Componente: ValorDaInformacao, substitui: "legacy" },
  c4p1: { Componente: LogitSlides, substitui: "abertura" },
  c4p2: { Componente: LabLogistica, substitui: "figura" },
  c4p3: { Componente: EscalaProbabilidade, substitui: "legacy" },
  c4p4: { Componente: EscalaOdds, substitui: "legacy" },
  c4p5: { Componente: EscalaLogOdds, substitui: "legacy" },
  c4p6: { Componente: () => <Escalas modo="regua" />, substitui: "legacy" },
  c4p8: { Componente: EscoreSoma, substitui: "pagina" },
  c4p7: { Componente: CurvaLogistica, substitui: "legacy" },
  c4p9: { Componente: TresEscalas, substitui: "legacy" },
  c4p10: { Componente: CoeficientePd, substitui: "pagina" },
  c4p13: { Componente: Intercepto, substitui: "legacy" },
  c4p15: { Componente: () => <DescidaCompleta modo="perda" />, substitui: "legacy" },
  c4p16: { Componente: () => <DescidaCompleta modo="gradiente" />, substitui: "legacy" },
  c4p17: { Componente: () => <DescidaCompleta modo="descida" />, substitui: "legacy" },
  c4p19: { Componente: Fronteira, substitui: "legacy" },
  c4p21: { Componente: Faixas, substitui: "legacy" },
  c5p3: { Componente: Anatomia, substitui: "legacy" },
  c5p4: { Componente: () => <Impureza modo="curva" />, substitui: "legacy" },
  c5p5: { Componente: () => <Impureza modo="raiz" />, substitui: "legacy" },
  c5p6: { Componente: CorteCandidato, substitui: "legacy" },
  c5p7: { Componente: () => <ArvoreQueCresce modo="raiz" />, substitui: "legacy" },
  c5p9: { Componente: Recursao, substitui: "legacy" },
  c5p11: { Componente: Caminho, substitui: "legacy" },
  c5p14: { Componente: () => <ArvoreQueCresce modo="freios" />, substitui: "legacy" },
  c5p15: { Componente: Poda, substitui: "legacy" },
  c5p16: { Componente: () => <ArvoreQueCresce modo="instabilidade" />, substitui: "legacy" },
  c5p18: { Componente: DuasFamilias, substitui: "legacy" },
  c6p2: { Componente: TresEstrategias, substitui: "legacy" },
  c6p7: { Componente: () => <ResiduosQueEncolhem modo="taxa" />, substitui: "legacy" },
  c6p8: { Componente: () => <ResiduosQueEncolhem modo="arvores" />, substitui: "legacy" },
  c6p9: { Componente: () => <ResiduosQueEncolhem modo="soma" />, substitui: "legacy" },
  c6p12: { Componente: () => <PerdaQueCai modo="alvo" />, substitui: "legacy" },
  c6p13: { Componente: () => <PerdaQueCai modo="iteracoes" />, substitui: "legacy" },
  c6p14: { Componente: () => <PerdaQueCai modo="rastro" />, substitui: "legacy" },
  c6p15: { Componente: Hiperparametros, substitui: "legacy" },
  c6p17: { Componente: DistanciaQueSeAbre, substitui: "figura" },
  c6p18: { Componente: TresLimites, substitui: "legacy" },
  c7p2: { Componente: AcertoQueEngana, substitui: "legacy" },
  c7p5: { Componente: Pares, substitui: "legacy" },
  c7p6: { Componente: FilaDeRisco, substitui: "legacy" },
  c7p7: { Componente: () => <KsEDecis modo="ks" />, substitui: "legacy" },
  c7p8: { Componente: () => <KsEDecis modo="ganho" />, substitui: "legacy" },
  c7p9: { Componente: () => <CalibracaoPorFaixa modo="grupos" />, substitui: "legacy" },
  c7p10: { Componente: () => <CalibracaoPorFaixa modo="faixas" />, substitui: "legacy" },
  c7p11: { Componente: () => <BrierELogLoss modo="deslocamento" />, substitui: "legacy" },
  c7p12: { Componente: () => <BrierELogLoss modo="recalibrar" />, substitui: "legacy" },
  c7p16: { Componente: TresAmostras, substitui: "legacy" },
  c7p18: { Componente: DecisaoEvidencia, substitui: "legacy" },
  c10p2: { Componente: TresZonas, substitui: "legacy" },
  c10p3: { Componente: QuadroDoComite, substitui: "legacy" },
  c10p5: { Componente: () => <Memorando campo={1} />, substitui: "legacy" },
  c10p6: { Componente: () => <Memorando campo={2} />, substitui: "legacy" },
  c10p7: { Componente: () => <Memorando campo={3} />, substitui: "legacy" },
  c10p8: { Componente: () => <Memorando campo={4} />, substitui: "legacy" },
  c10p9: { Componente: () => <Memorando campo={5} />, substitui: "legacy" },
  c10p11: { Componente: () => <MesaSobChoque modo="rodada1" />, substitui: "legacy" },
  c10p12: { Componente: () => <MesaSobChoque modo="choque" />, substitui: "legacy" },
  c10p13: { Componente: () => <MesaSobChoque modo="rodada2" />, substitui: "legacy" },
  c11p6: { Componente: ModeloPerfeito, substitui: "legacy" },
  c11p18: { Componente: QuatroPerguntas, substitui: "legacy" },
  c9p2: { Componente: TresFenomenos, substitui: "legacy" },
  c9p3: { Componente: () => <IndiceQueSoma modo="faixas" />, substitui: "legacy" },
  c9p4: { Componente: () => <IndiceQueSoma modo="variaveis" />, substitui: "legacy" },
  c9p5: { Componente: () => <IndiceQueSoma modo="leituras" />, substitui: "legacy" },
  c9p6: { Componente: Equidade, substitui: "legacy" },
  c9p7: { Componente: Gatilhos, substitui: "legacy" },
  c9p8: { Componente: Painel, substitui: "legacy" },
  c8p3: { Componente: () => <ResultadoPorProposta modo="fracao" />, substitui: "legacy" },
  c8p5: { Componente: () => <ResultadoPorProposta modo="parcelas" />, substitui: "legacy" },
  c8p6: { Componente: () => <ResultadoPorProposta modo="equilibrio" />, substitui: "legacy" },
  c8p7: { Componente: TrocaDoCorte, substitui: "legacy" },
  c8p8: { Componente: CurvaDeLucro, substitui: "legacy" },
  c8p9: { Componente: RevisaoManual, substitui: "legacy" },
  c8p10: { Componente: Ponte, substitui: "legacy" },
  c8p11: { Componente: CurvaDeLucro, substitui: "legacy" },
  c8p12: { Componente: PoliticaQueFecha, substitui: "legacy" },
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

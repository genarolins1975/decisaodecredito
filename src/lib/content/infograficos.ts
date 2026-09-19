/**
 * Infográficos de abertura dos capítulos. Fonte única: content/infograficos/cNN.json, também usada pela capa
 * da apostila (scripts/apostila/infograficos.py) e pelos slides FGV (scripts/apostila/slides). Sem gabaritos nem notas privadas.
 */
import c01 from "../../../content/infograficos/c01.json";
import c02 from "../../../content/infograficos/c02.json";
import c03 from "../../../content/infograficos/c03.json";
import c04 from "../../../content/infograficos/c04.json";
import c05 from "../../../content/infograficos/c05.json";
import c06 from "../../../content/infograficos/c06.json";
import c07 from "../../../content/infograficos/c07.json";
import c08 from "../../../content/infograficos/c08.json";
import c09 from "../../../content/infograficos/c09.json";
import c10 from "../../../content/infograficos/c10.json";
import c11 from "../../../content/infograficos/c11.json";

export type Cor = "steel" | "orange" | "navy" | "green" | "red" | "mute";
export type Painel =
  | { tipo: "pontos"; titulo: string; n: number; cols: number; defaults: number[]; legenda: string }
  | { tipo: "tempo"; titulo: string; meses: number[]; marcaMes: number; marcaTexto: string; janelas: { ate: number; cor: Cor; texto: string }[]; legenda: string }
  | { tipo: "barras"; titulo: string; texto?: string; itens: { rot: string; v: number; cor: Cor; texto: string }[]; nota?: string }
  | { tipo: "kv"; titulo: string; texto?: string; linhas: [string, string][]; nota?: string }
  | { tipo: "lista"; titulo: string; itens: string[] };
/** Gramática original: quatro cartões, três números com fórmula, três painéis de evidência e a faixa de três ideias. */
export type InfograficoBlocos = {
  numero: string; titulo: string; pergunta: string; variante?: undefined;
  kicker1: string; cartoes: { tit: string; cor: Cor; corpo: string }[];
  kicker2: string; tiles: { sigla: string; nome: string; desc: string; cor: Cor }[]; formula: string; formulaNota?: string;
  kicker3: string; paineis: Painel[];
  faixa: { kicker: string; itens: { k: string; v: string }[] };
};
/** Gramática de fluxo: três etapas encadeadas por setas, dois painéis (escalas com a curva logística e o que um coeficiente significa) e a faixa de limite. */
export type Formula = { tex: string; txt: string };
export type Etapa = {
  rot: string; tit?: string; entradas?: { k: string; v: string; x: string }[]; tex?: string; txt?: string;
  parcelas?: { v: string; rot: string; cor: Cor }[]; total?: string; destaque?: string; texto?: string; nota?: string; notaForte?: boolean;
};
export type InfograficoFluxo = {
  numero: string; titulo: string; pergunta: string; variante: "fluxo"; eyebrow?: string;
  etapas: Etapa[];
  escalas: { titulo: string; formulas: Formula[]; exemploTit: string; exemplo: string; exemploLinhas: string[]; curvaTit: string; eixoX: string };
  coeficiente: { titulo: string; headline: string; texto: string; casos: { de: string; para: string; delta: string }[]; nota: string };
  faixa: { kicker: string; texto: string };
  rodape: string[];
};
export type Infografico = InfograficoBlocos | InfograficoFluxo;
export const ehFluxo = (d: Infografico): d is InfograficoFluxo => d.variante === "fluxo";

const TODOS = [c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11] as unknown as Infografico[];

/** Infográfico do capítulo (1 a 11), ou null quando não existe. */
export function infograficoDoCapitulo(numero: number): Infografico | null {
  return TODOS[numero - 1] ?? null;
}

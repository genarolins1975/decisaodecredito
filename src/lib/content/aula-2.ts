/**
 * A Aula 2 na plataforma: os 50 slides do baralho (`/slides/aula-2`) apresentados com a mesma
 * moldura das outras aulas, em `/aulas/aula-2` (abertura, no padrão da abertura de capítulo) e em
 * `/aulas/aula-2/slide/NN` (um slide por endereço, com barra lateral, cabeçalho e Anterior/Próxima).
 *
 * A fonte dos títulos, blocos e notas é `content/slides/aula-2-notas.json`, gravado por
 * `aula_credito_html/build.mjs` a cada compilação do baralho. As notas nunca chegam ao aluno: só
 * `publicos()` sai para a tela dele; o roteiro fica em componentes renderizados para professor e monitor.
 * Os textos de abertura abaixo são editoriais e não trazem número que não venha do baralho.
 */
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ROTEIRO_AULA_2, type NotaSlideAula2 } from "./roteiro-aula-2";

export const AULA_2 = {
  href: "/aulas/aula-2",
  slidesHref: "/slides/aula-2",
  total: 50,
  pergunta: "Como a mesma ficha de cliente vira probabilidade em três técnicas, e como escolher entre elas para decidir?",
  aprende: "O mecanismo de cada técnica com os mesmos quatro clientes: regressão logística (escore e curva logística), árvore de decisão (perguntas sucessivas e frequência da folha) e gradient boosting (correções somadas no escore); depois, como comparar as três com justiça e ligar a probabilidade à política de crédito.",
  porQueImporta: "Logit, árvore e boosting sustentam a maior parte dos modelos de PD em uso. Ver o mecanismo de cada um sobre os mesmos dados é o que permite ler coeficientes, folhas e contribuições sem confundir escalas, e comparar os três sem comparar condições diferentes.",
  atividade: "Sete exercícios ao longo dos slides, corrigidos na própria tela: decidir sobre quatro clientes, classificar informações pela data de disponibilidade, recalcular a PD de Bruno, percorrer a árvore com Carla, reconstruir a previsão do boosting, defender uma recomendação para o comitê e responder às perguntas de recuperação.",
  antes: "Aula 1: o alvo com evento, horizonte e população, a informação disponível na decisão e a divisão temporal da base (capítulos 1 a 3). Os slides 03 a 05 retomam esses três pontos antes das técnicas.",
  depois: "O apêndice (capítulos 4, 5 e 6) aprofunda página a página o que os slides mostram; as Aulas 3 e 4 retomam avaliação, calibração, política e monitoramento, que os slides 43 a 50 antecipam.",
  aoVivo: "Na aula ao vivo o professor conduz os slides e a sua tela acompanha; fora dela, navegue no seu ritmo. O que você mexe nos slides fica só no seu navegador.",
} as const;

/** Blocos do baralho na ordem da aula: a chave é a de `def.bloco` em cada slide. Cores dos capítulos 4, 5 e 6 e da identidade. */
export const BLOCOS_AULA_2 = [
  { chave: "problema", cor: "#00205B", suave: "#EFF3FA", pergunta: "O que exatamente queremos prever, com que informação e para decidir o quê?", aprende: "Formular o alvo, separar o que existia na decisão do que só aparece depois e dividir a base por calendário." },
  { chave: "logit", cor: "#9A4E36", suave: "#FAF0EC", pergunta: "Como uma soma de efeitos vira uma probabilidade entre 0% e 100%, e como se lê cada coeficiente?", aprende: "Escore, curva logística, odds e razão de chances, o que o ajuste minimiza, categorias, não linearidades e regularização." },
  { chave: "arvore", cor: "#28725B", suave: "#EDF7F3", pergunta: "Como perguntas sucessivas separam grupos de risco, e o que sustenta a taxa de cada folha?", aprende: "Raiz, nós e folhas, ganho de Gini, incerteza da folha, controles de complexidade e estabilidade entre amostras." },
  { chave: "boosting", cor: "#7B3E73", suave: "#F8EFF6", pergunta: "Como correções sucessivas, somadas no escore, constroem uma previsão melhor que a de uma árvore só?", aprende: "Resíduos, o ciclo em quatro passos, a miniatura de dez registros, taxa de aprendizagem, profundidade e parada." },
  { chave: "decisao", cor: "#9A5209", suave: "#FBF1E3", pergunta: "Como comparar os três modelos com justiça e transformar probabilidades em política de crédito?", aprende: "Protocolo, discriminação e calibração, corte de aprovação, economia da operação, monitoramento e recomendação." },
] as const;

/** Slides com exercício: a captura no guia do aluno fica no estado inicial e o cartão recebe a marca. */
export const EXERCICIOS_AULA_2 = ["01", "04", "20", "30", "42", "49", "50"] as const;

export type SlidePublico = {
  n: string; bloco: string; blocoNome: string; titulo: string; subtitulo: string | null; conclusao: string | null;
  fonte: string | null; resumo: string | null; exercicio: boolean; paginas: string[];
};
export type BlocoAula2 = { chave: string; nome: string; cor: string; suave: string; pergunta: string; aprende: string; de: string; ate: string; slides: SlidePublico[] };
export type RoteiroSlideAula2 = Pick<NotaSlideAula2, "notas" | "proximo" | "conclusao">;

export const hrefSlide = (n: string) => `/aulas/aula-2/slide/${n}`;

/** "1", "01" ou "50" viram "01".."50"; qualquer outra coisa é nulo. */
export function normalizarSlide(n: string | undefined): string | null {
  const m = /^(\d{1,2})$/.exec(n ?? "");
  if (!m) return null;
  const k = Number(m[1]);
  if (k < 1 || k > AULA_2.total) return null;
  return String(k).padStart(2, "0");
}

const ARQUIVO = path.join(process.cwd(), "content", "slides", "aula-2-notas.json");

/** Notas completas dos 50 slides (uso no servidor; para o aluno passar por `publicos`). */
export async function notasAula2(): Promise<{ versao: string; slides: NotaSlideAula2[] }> {
  try {
    const j = JSON.parse(await readFile(ARQUIVO, "utf8")) as { versao?: string; slides?: NotaSlideAula2[] };
    return { versao: j.versao ?? "", slides: j.slides ?? [] };
  } catch {
    return { versao: "", slides: [] };
  }
}

/** O que o aluno pode ver de cada slide: nada de `notas`. As páginas do apêndice vêm do roteiro. */
export function publicos(slides: NotaSlideAula2[]): SlidePublico[] {
  const paginas = new Map(ROTEIRO_AULA_2.map((s) => [s.n, s.paginas]));
  return slides.map((s) => ({
    n: s.n, bloco: s.bloco, blocoNome: s.blocoNome, titulo: s.titulo, subtitulo: s.subtitulo ?? null, conclusao: s.conclusao ?? null,
    fonte: s.fonte ?? null, resumo: s.resumo ?? null, exercicio: (EXERCICIOS_AULA_2 as readonly string[]).includes(s.n), paginas: paginas.get(s.n) ?? [],
  }));
}

/** Roteiro por slide para professor e monitor: as notas, a transição e o próximo. */
export function roteiros(slides: NotaSlideAula2[]): Record<string, RoteiroSlideAula2> {
  return Object.fromEntries(slides.map((s) => [s.n, { notas: s.notas, proximo: s.proximo, conclusao: s.conclusao }]));
}

/** Os slides agrupados nos cinco blocos, na ordem da aula, com o nome que o baralho usa. */
export function blocosDe(slides: SlidePublico[]): BlocoAula2[] {
  return BLOCOS_AULA_2.map((b) => {
    const meus = slides.filter((s) => s.bloco === b.chave);
    return { ...b, nome: meus[0]?.blocoNome ?? b.chave, de: meus[0]?.n ?? "", ate: meus[meus.length - 1]?.n ?? "", slides: meus };
  }).filter((b) => b.slides.length > 0);
}

export function vizinhosDoSlide(slides: SlidePublico[], n: string) {
  const i = slides.findIndex((s) => s.n === n);
  return { anterior: i > 0 ? slides[i - 1] : null, proximo: i >= 0 && i < slides.length - 1 ? slides[i + 1] : null, indice: i };
}

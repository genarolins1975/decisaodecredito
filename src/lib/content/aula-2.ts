import "server-only";
/**
 * As notas de condução da Aula 2, lidas do baralho compilado.
 *
 * O conteúdo da aula são os capítulos 4, 5 e 6, como o das outras aulas; o baralho de
 * `/slides/aula-2` é como ela é apresentada. Estas notas nunca vão ao aluno: elas alimentam o
 * bloco "Roteiro do slide no ar" no painel do professor, em `/professor/aovivo/<sessão>`.
 *
 * A fonte é `content/slides/aula-2-notas.json`, gravado por `aula_credito_html/build.mjs`. Ler do
 * disco, e não de uma cópia em código, evita que o painel e o baralho discordem depois de um build.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NotaSlideAula2 } from "./roteiro-aula-2";

export type SlideCompilado = {
  n: string; bloco: string; blocoNome: string; titulo: string; subtitulo?: string | null;
  conclusao?: string | null; fonte?: string | null; resumo?: string | null;
  notas?: NotaSlideAula2["notas"]; proximo?: NotaSlideAula2["proximo"];
};

const ARQUIVO = path.join(process.cwd(), "content", "slides", "aula-2-notas.json");

/** Notas por slide. Sem o arquivo (baralho não compilado), devolve vazio em vez de derrubar a página. */
export async function notasAula2(): Promise<{ versao: string; slides: SlideCompilado[] }> {
  try {
    const bruto = JSON.parse(await readFile(ARQUIVO, "utf8")) as { versao?: string; slides?: SlideCompilado[] };
    return { versao: bruto.versao ?? "", slides: Array.isArray(bruto.slides) ? bruto.slides : [] };
  } catch {
    return { versao: "", slides: [] };
  }
}

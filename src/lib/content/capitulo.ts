/**
 * Página de abertura do capítulo: contagens, minutos, roteiro e materiais do capítulo. Funções puras, sem banco,
 * compartilhadas pela página /aulas/capitulo/[n] e pelos testes.
 */
export type PaginaDoMapa = { slug: string; title: string; level: string; minutes: number; level120?: string | null };
export type TempoPagina = { exp?: number; ex?: number; prat?: number; disc?: number } | null | undefined;

/** Rótulo da versão de 120 minutos de cada página. */
export const NIVEL120: Record<string, string> = { essencial: "entra na versão de 120 min", assincrono: "estudo assíncrono na versão de 120 min" };

export function resumoCapitulo(pages: PaginaDoMapa[]) {
  const ess = pages.filter((p) => p.level === "essencial");
  const comp = pages.filter((p) => p.level !== "essencial");
  const soma = (v: PaginaDoMapa[]) => v.reduce((s, p) => s + (p.minutes || 0), 0);
  return { total: pages.length, essenciais: ess.length, complementares: comp.length, minEssenciais: soma(ess), minComplementares: soma(comp), min120: soma(pages.filter((p) => p.level120 === "essencial")) };
}

/** Soma do orçamento de tempo do guia docente (exposição, exemplo, prática e discussão), em minutos. */
export function somaTempos(tempos: TempoPagina[]) {
  const t = { exp: 0, ex: 0, prat: 0, disc: 0 };
  for (const x of tempos) if (x) { t.exp += x.exp ?? 0; t.ex += x.ex ?? 0; t.prat += x.prat ?? 0; t.disc += x.disc ?? 0; }
  return { ...t, total: t.exp + t.ex + t.prat + t.disc };
}

/** Materiais cujo título cita o capítulo ("Capítulo 4", "capítulo 04", "Cap. 4"), sem confundir 1 com 10 ou 11. */
export function materiaisDoCapitulo<T extends { title: string }>(materials: T[], numero: number): T[] {
  const re = new RegExp(`\\bcap(?:[ií]tulo|\\.)\\s*0?${numero}(?![\\d])`, "i");
  return materials.filter((m) => re.test(m.title));
}

export function rotuloUnidade(u: { kind: string; number: number }) {
  if (u.kind === "trabalho") return "Trabalho final";
  if (u.kind === "apendice") return "Apêndice";
  return `Aula ${u.number}`;
}

/** Número do capítulo com dois dígitos para o cabeçalho. */
export const numeroCapitulo = (n: number) => String(n).padStart(2, "0");

/** Item da sequência de leitura do curso: um capítulo, na ordem em que a unidade dele aparece. */
export type ItemSequencia = { href: string; rotulo: string; titulo: string };
type UnidadeDaSequencia = { kind: string; number: number; title: string; chapters: { number: number; title: string }[] };

/** Ordem de leitura: os capítulos, na ordem das unidades. Toda aula tem capítulo, inclusive a Aula 2,
    que é apresentada pelos 50 slides mas tem como conteúdo os capítulos 4, 5 e 6. */
export function sequenciaDoCurso(outline: UnidadeDaSequencia[]): ItemSequencia[] {
  const seq: ItemSequencia[] = [];
  for (const u of outline) {
    for (const c of u.chapters) seq.push({ href: `/aulas/capitulo/${c.number}`, rotulo: `Capítulo ${c.number} · ${rotuloUnidade(u)}`, titulo: c.title });
  }
  return seq;
}

export function vizinhosNaSequencia(seq: ItemSequencia[], href: string): { prev: ItemSequencia | null; next: ItemSequencia | null } {
  const i = seq.findIndex((x) => x.href === href);
  return { prev: i > 0 ? seq[i - 1] : null, next: i >= 0 && i < seq.length - 1 ? seq[i + 1] : null };
}

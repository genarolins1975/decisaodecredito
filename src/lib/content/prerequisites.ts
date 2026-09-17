/**
 * Prerrequisitos visíveis ao aluno, derivados do campo "Pré-requisito" do guia docente.
 * O texto do guia é escrito em linguagem natural ("Gradiente da logística, capítulo 4 página 16.").
 * Este módulo, puro e sem acesso a banco, transforma as referências a capítulos e páginas em links
 * para as páginas do curso, sem alterar o texto. Referências a arquivos (capítulo 11) ficam como texto.
 */

export type PrereqSegment = { text: string; slug?: string };

export type PrereqContext = {
  chapter: number;            // capítulo da página atual
  pageNumber: number;         // número da página dentro do capítulo (1 = primeira)
  slugs: ReadonlySet<string>; // slugs existentes na edição (c{cap}p{n}); só eles viram link
};

const NONE = /^\s*nenhum\b/i;
const WORD_NUM: Record<string, number> = { uma: 1, duas: 2, "três": 3, tres: 3, quatro: 4 };

/** Sequências como "4", "4 e 5", "7, 11, 12 e 14", "1 a 3" → lista de inteiros. */
function numbers(list: string): number[] {
  const range = list.match(/^\s*(\d+)\s+a\s+(\d+)\s*$/);
  if (range) { const a = Number(range[1]), b = Number(range[2]); return b >= a && b - a < 20 ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a, b]; }
  return list.split(/\s*(?:,|\be\b)\s*/).map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
}

const TOKEN = new RegExp([
  String.raw`cap[íi]tulos?\s+(\d+(?:\s*(?:,|\be\b|\ba\b)\s*\d+)*)`,                                   // 1: capítulo(s) N[, M e K | a K]
  String.raw`p[áa]ginas?\s+(\d+(?:\s*(?:,|\be\b)\s*\d+)*)(?:\s+d[oe]\s+cap[íi]tulo\s+(\d+))?`,          // 2: página(s) N[, M e K] [do capítulo C], 3: C
  String.raw`(?:(uma|duas|tr[êe]s|quatro)\s+)?p[áa]ginas?\s+anterior(?:es)?`,                              // 4: [n] página(s) anterior(es)
].join("|"), "gi");

/** Divide o texto em segmentos, ligando capítulos e páginas às páginas existentes. */
export function resolvePrerequisite(text: string | null | undefined, ctx: PrereqContext): PrereqSegment[] | null {
  if (!text || !text.trim() || NONE.test(text)) return null;
  const out: PrereqSegment[] = [];
  let last = 0;
  let sentenceChapter: number | null = null; // último capítulo citado na mesma frase, para "página N" sem capítulo
  let sentenceStart = 0;
  const push = (t: string, slug?: string) => { if (t) out.push(slug && ctx.slugs.has(slug) ? { text: t, slug } : { text: t }); };

  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    // nova frase reinicia o contexto de capítulo
    const between = text.slice(sentenceStart, idx);
    const lastPeriod = between.lastIndexOf(". ");
    if (lastPeriod >= 0) { sentenceChapter = null; sentenceStart = sentenceStart + lastPeriod + 2; }
    push(text.slice(last, idx));
    const whole = m[0];
    if (m[1] !== undefined) {
      // capítulo(s): cada número vira link para a primeira página do capítulo
      const nums = numbers(m[1]);
      sentenceChapter = nums[nums.length - 1] ?? null;
      const head = whole.match(/^cap[íi]tulos?\s+/i)![0];
      push(head);
      let rest = whole.slice(head.length);
      for (const n of nums) {
        const pos = rest.search(new RegExp(`\\b${n}\\b`));
        if (pos < 0) { if (ctx.slugs.has(`c${n}p1`)) out.push({ text: "", slug: `c${n}p1` }); continue; } // intermediário de "1 a 3"
        push(rest.slice(0, pos)); push(String(n), `c${n}p1`); rest = rest.slice(pos + String(n).length);
      }
      push(rest);
    } else if (m[2] !== undefined) {
      // página(s): capítulo explícito ("do capítulo 8"), senão o citado na frase, senão o atual
      const chapter = m[3] ? Number(m[3]) : (sentenceChapter ?? ctx.chapter);
      const nums = numbers(m[2]);
      const head = whole.match(/^p[áa]ginas?\s+/i)![0];
      push(head);
      let rest = whole.slice(head.length);
      for (const n of nums) {
        const pos = rest.search(new RegExp(`\\b${n}\\b`));
        if (pos < 0) continue;
        push(rest.slice(0, pos)); push(String(n), `c${chapter}p${n}`); rest = rest.slice(pos + String(n).length);
      }
      // "do capítulo C" também vira link para o capítulo
      const capMatch = rest.match(/(cap[íi]tulo\s+)(\d+)/i);
      if (capMatch && capMatch.index !== undefined) { push(rest.slice(0, capMatch.index) + capMatch[1]); push(capMatch[2], `c${capMatch[2]}p1`); rest = rest.slice(capMatch.index + capMatch[0].length); }
      push(rest);
    } else {
      // página(s) anterior(es): as N páginas imediatamente antes desta, no mesmo capítulo
      const n = m[4] ? (WORD_NUM[m[4].toLowerCase()] ?? 1) : (/anteriores/i.test(whole) ? 2 : 1);
      const first = Math.max(1, ctx.pageNumber - n);
      if (ctx.pageNumber > 1) push(whole, `c${ctx.chapter}p${first}`); else push(whole);
    }
    last = idx + whole.length;
  }
  push(text.slice(last));
  // funde segmentos de texto vizinhos
  return out.reduce<PrereqSegment[]>((acc, s) => { const p = acc[acc.length - 1]; if (p && !p.slug && !s.slug) p.text += s.text; else acc.push({ ...s }); return acc; }, []);
}

/** Referências de um capítulo a páginas de outros capítulos, agregadas de todos os seus prerrequisitos. */
export function chapterAssumptions(pages: { pageNumber: number; pre: string | null }[], ctx: Omit<PrereqContext, "pageNumber">): { chapter: number; slugs: string[] }[] {
  const byChapter = new Map<number, Set<string>>();
  for (const p of pages) {
    const segs = resolvePrerequisite(p.pre, { ...ctx, pageNumber: p.pageNumber }) ?? [];
    for (const s of segs) {
      if (!s.slug) continue;
      const cap = Number(s.slug.match(/^c(\d+)p/)?.[1]);
      if (!cap || cap === ctx.chapter) continue;
      if (!byChapter.has(cap)) byChapter.set(cap, new Set());
      byChapter.get(cap)!.add(s.slug);
    }
  }
  return [...byChapter.entries()].sort((a, b) => a[0] - b[0]).map(([chapter, set]) => ({ chapter, slugs: [...set].sort((a, b) => Number(a.split("p")[1]) - Number(b.split("p")[1])) }));
}

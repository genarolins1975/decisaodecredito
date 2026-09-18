/**
 * Lado DOM do compositor: descobre as unidades dentro do palco, mede, e mostra só as da tela atual.
 * Trabalha diretamente no DOM (inclusive dentro de HTML injetado), marcando elementos com data-oculto.
 */
import { paginar, type Grupo, type Unidade } from "./compositor";

export type UnidadeDom = { els: HTMLElement[]; grupo?: number; coluna?: 0 | 1 };
export type GrupoDom = { el: HTMLElement; persistente?: { coluna: 0 | 1; els: HTMLElement[] } };
export type Composicao = { unidades: UnidadeDom[]; grupos: GrupoDom[]; telas: number[][]; medidas: Unidade[]; altura: number };

const CABECA = "H1, H2, H3, H4, H5, H6";
const visivel = (el: Element) => { const cs = getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden"; };
const ehCabeca = (el: HTMLElement) => el.matches(CABECA) || el.classList.contains("rot") || el.classList.contains("info-kicker") || el.classList.contains("eyebrow") || (el.tagName === "P" && /:\s*$/.test(el.textContent || "") && (el.textContent || "").split(/\s+/).length <= 14);
const ehFigura = (el: HTMLElement) => el.classList.contains("svgfit") || el.tagName === "FIGURE" || el.tagName === "SVG";
const ehLegenda = (el: HTMLElement) => el.tagName === "FIGCAPTION" || el.classList.contains("fig-caption") || (el.tagName === "P" && el.classList.contains("nota"));
const palavras = (els: HTMLElement[]) => els.reduce((s, e) => s + ((e.innerText || e.textContent || "").trim().match(/\S+/g)?.length ?? 0), 0);
const altura = (els: HTMLElement[]) => els.reduce((s, e) => { const cs = getComputedStyle(e); return s + e.getBoundingClientRect().height + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0); }, 0);

/** junta cabeças à unidade seguinte e legendas à figura anterior */
function fundir(lista: UnidadeDom[]): UnidadeDom[] {
  const out: (UnidadeDom & { fundida?: boolean })[] = [];
  for (const u of lista) {
    const ant = out[out.length - 1];
    if (ant && ant.els.length === 1 && ehCabeca(ant.els[0]) && !ant.fundida) { ant.els.push(...u.els); ant.fundida = true; continue; }
    if (ant && u.els.length === 1 && ehLegenda(u.els[0]) && ant.els.some(ehFigura)) { ant.els.push(...u.els); continue; }
    out.push({ ...u });
  }
  return out.map(({ fundida: _f, ...u }) => u);
}

function expandir(cont: HTMLElement, alturaPalco: number, grupos: GrupoDom[], grupo?: number, coluna?: 0 | 1): UnidadeDom[] {
  const lista: UnidadeDom[] = [];
  for (const el of Array.from(cont.children) as HTMLElement[]) {
    if (!visivel(el) || el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
    if (el.classList.contains("palcoflex") && grupo === undefined) {
      const esq = el.querySelector<HTMLElement>(":scope > .esq"), dir = el.querySelector<HTMLElement>(":scope > .dir");
      if (esq || dir) {
        const g: GrupoDom = { el }; grupos.push(g); const id = grupos.length - 1;
        const colunas: [HTMLElement | null, 0 | 1][] = [[esq, 0], [dir, 1]];
        // coluna persistente: começa por figura, cabe folgada e a outra coluna existe
        const persiste = colunas.find(([c, k]) => c && c.firstElementChild && ehFigura(c.firstElementChild as HTMLElement) && c.getBoundingClientRect().height <= alturaPalco * 0.92 && colunas[1 - k][0]);
        if (persiste?.[0]) g.persistente = { coluna: persiste[1], els: Array.from(persiste[0].children) as HTMLElement[] };
        for (const [c, k] of colunas) { if (!c || persiste?.[1] === k) continue; lista.push(...expandir(c, alturaPalco, grupos, id, k)); }
        continue;
      }
    }
    if (el.hasAttribute("data-unidades") || (el.classList.contains("painel") && el.children.length >= 3)) { lista.push(...expandir(el, alturaPalco, grupos, grupo, coluna)); continue; }
    lista.push({ els: [el], grupo, coluna });
  }
  return fundir(lista);
}

/** descobre as unidades do palco (todas visíveis, zoom 1) */
export function coletar(raiz: HTMLElement, alturaPalco: number): { unidades: UnidadeDom[]; grupos: GrupoDom[] } {
  const grupos: GrupoDom[] = []; const unidades: UnidadeDom[] = [];
  for (const bloco of Array.from(raiz.querySelectorAll<HTMLElement>("[data-bloco]"))) {
    if (!visivel(bloco)) continue;
    const html = bloco.querySelector<HTMLElement>(":scope > .conteudo");
    const ud = bloco.querySelector<HTMLElement>(":scope > [data-unidades], :scope > * > [data-unidades]");
    if (html) unidades.push(...expandir(html, alturaPalco, grupos));
    else if (ud) unidades.push(...expandir(ud, alturaPalco, grupos));
    else unidades.push({ els: [bloco] });
  }
  return { unidades: unidades.filter((u) => u.els.some((e) => e.getBoundingClientRect().height > 0)), grupos };
}

export function compor(raiz: HTMLElement, alturaPalco: number, tetoPalavras = 150): Composicao {
  mostrarTudo(raiz);
  const { unidades, grupos } = coletar(raiz, alturaPalco);
  const us: Unidade[] = unidades.map((u) => ({ h: altura(u.els), w: palavras(u.els), grupo: u.grupo, coluna: u.coluna }));
  const gs: Record<number, Grupo> = {};
  grupos.forEach((g, i) => { gs[i] = g.persistente ? { persistente: { coluna: g.persistente.coluna, h: altura(g.persistente.els), w: palavras(g.persistente.els) } } : {}; });
  const telas = paginar(us, gs, { altura: alturaPalco, palavras: tetoPalavras, gap: alturaPalco * 0.015 });
  return { unidades, grupos, telas, medidas: us, altura: alturaPalco };
}

export function mostrarTudo(raiz: HTMLElement) {
  for (const el of Array.from(raiz.querySelectorAll<HTMLElement>("[data-oculto]"))) delete el.dataset.oculto;
}

/** mostra só a tela k: oculta as outras unidades e os contêineres que ficaram vazios */
export function aplicarTela(raiz: HTMLElement, c: Composicao, k: number) {
  const tela = new Set(c.telas[k] ?? []);
  const visiveis = new Set<HTMLElement>(); const gruposNaTela = new Set<number>();
  c.unidades.forEach((u, i) => { if (tela.has(i)) { u.els.forEach((e) => visiveis.add(e)); if (u.grupo !== undefined) gruposNaTela.add(u.grupo); } });
  c.grupos.forEach((g, i) => { if (gruposNaTela.has(i)) g.persistente?.els.forEach((e) => visiveis.add(e)); });
  // ancestrais das unidades visíveis permanecem; tudo o mais que é unidade, ou ancestral só de unidades ocultas, some
  const manter = new Set<HTMLElement>();
  for (const e of visiveis) { let p: HTMLElement | null = e; while (p && p !== raiz) { manter.add(p); p = p.parentElement; } }
  const todos = new Set<HTMLElement>();
  for (const u of c.unidades) for (const e of u.els) { let p: HTMLElement | null = e; while (p && p !== raiz) { todos.add(p); p = p.parentElement; } }
  for (const g of c.grupos) g.persistente?.els.forEach((e) => todos.add(e));
  for (const e of todos) { if (manter.has(e)) delete e.dataset.oculto; else e.dataset.oculto = "1"; }
  // coluna sozinha na tela (a outra ficou toda oculta): ganha a largura toda e, com duas ou mais unidades, flui em duas colunas
  c.grupos.forEach((g, i) => {
    const cols = [g.el.querySelector<HTMLElement>(":scope > .esq"), g.el.querySelector<HTMLElement>(":scope > .dir")];
    cols.forEach((col) => { if (col) delete col.dataset.so; });
    if (!gruposNaTela.has(i) || g.persistente) return;
    const vis = cols.map((col) => col && !col.dataset.oculto ? c.unidades.filter((u, k) => tela.has(k) && u.grupo === i && u.els[0] && col.contains(u.els[0])).length : 0);
    const so = vis[0] && !vis[1] ? 0 : vis[1] && !vis[0] ? 1 : -1;
    if (so >= 0 && cols[so]) cols[so]!.dataset.so = vis[so] >= 2 ? "colunas" : "toda";
  });
}

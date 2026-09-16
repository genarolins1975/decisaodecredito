import katex from "katex";

/** Renderiza \( \) e \[ \] com KaTeX (HTML + MathML). Trechos já renderizados não são tocados. */
export function renderTex(html: string) {
  if (!/\\\(|\\\[/.test(html)) return html;
  const tex = (l: string, d: boolean) => { try { return katex.renderToString(l, { displayMode: d, throwOnError: false, output: "htmlAndMathml", strict: "ignore" }); } catch { return `<code>${l}</code>`; } };
  return html.replace(/\\\[([\s\S]+?)\\\]/g, (_m, l) => tex(l, true)).replace(/\\\(([\s\S]+?)\\\)/g, (_m, l) => tex(l, false));
}

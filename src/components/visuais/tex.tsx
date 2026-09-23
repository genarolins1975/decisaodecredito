import katex from "katex";

/**
 * Fórmula em KaTeX para os quadros nativos. A renderização é determinística, então o HTML do servidor e o do cliente
 * coincidem; a saída inclui MathML para leitores de tela. O CSS do KaTeX é global (src/app/layout.tsx).
 */
export function Tex({ f, className, bloco = false }: { f: string; className?: string; bloco?: boolean }) {
  const html = katex.renderToString(f, { throwOnError: false, output: "htmlAndMathml", strict: "ignore", displayMode: bloco });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

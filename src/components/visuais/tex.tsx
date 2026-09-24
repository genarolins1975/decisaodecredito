import katex from "katex";

/**
 * Fórmula em KaTeX para os quadros nativos. A renderização é determinística, então o HTML do servidor e o do cliente
 * coincidem; a saída inclui MathML para leitores de tela. O CSS do KaTeX é global (src/app/layout.tsx).
 */
export function Tex({ f, className, bloco = false }: { f: string; className?: string; bloco?: boolean }) {
  const html = katex.renderToString(f, { throwOnError: false, output: "htmlAndMathml", strict: "ignore", displayMode: bloco });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Fórmula em caixa, no lugar da antiga `.vz-formula` monoespaçada; a classe fica para as regras de palco continuarem valendo. */
export function Formula({ f, rotulo }: { f: string; rotulo?: string }) {
  return <div className="vz-formula vz-formula--tex" role={rotulo ? "img" : undefined} aria-label={rotulo}><Tex f={f} /></div>;
}

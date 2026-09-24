import { Fragment } from "react";
import katex from "katex";

/**
 * Fórmula em KaTeX para os quadros nativos. A renderização é determinística, então o HTML do servidor e o do cliente
 * coincidem; a saída inclui MathML para leitores de tela. O CSS do KaTeX é global (src/app/layout.tsx).
 */
export function Tex({ f, className, bloco = false }: { f: string; className?: string; bloco?: boolean }) {
  const html = katex.renderToString(f, { throwOnError: false, output: "htmlAndMathml", strict: "ignore", displayMode: bloco });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Frase com trechos de fórmula entre cifrões ("Coeficiente fixo: $\beta = 0{,}7453$ por 10 pp."): o texto corre normal e
 * cada trecho vira KaTeX em linha, um pouco menor que o padrão do KaTeX para acompanhar a letra da frase (`.tx-linha`).
 * O MathML de cada trecho dá a leitura por leitor de tela.
 */
export function ComTex({ t }: { t: string }) {
  return <>{t.split("$").map((p, i) => (i % 2 ? <Tex key={i} f={p} className={curto(p) ? "tx-linha tx-curta" : "tx-linha"} /> : <Fragment key={i}>{p}</Fragment>))}</>;
}

/**
 * Trecho curto (até 32 caracteres visíveis, sem os comandos do TeX): "\eta = 0{,}5", "x = 8", o vetor β. Nos visuais de
 * texto corrido ele não quebra entre o sinal e o valor (`.tx-curta` em globals.css); a fórmula longa continua podendo
 * quebrar, para caber no celular.
 */
export const curto = (tex: string) => tex.replace(/\\[a-zA-Z]+/g, "x").replace(/\\[,;! ]|[{}^_]/g, "").length <= 32;

/** Fórmula em caixa, no lugar da antiga `.vz-formula` monoespaçada; a classe fica para as regras de palco continuarem valendo. */
export function Formula({ f, rotulo }: { f: string; rotulo?: string }) {
  return <div className="vz-formula vz-formula--tex" role={rotulo ? "img" : undefined} aria-label={rotulo}><Tex f={f} /></div>;
}

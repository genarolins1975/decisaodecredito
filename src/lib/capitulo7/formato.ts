/** Formatação do capítulo 7: pt-BR, sinal de menos tipográfico (U+2212) e casas decimais só quando ensinam algo. */
const nf = (casas: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
const menos = (s: string) => s.replace("-", "−");
export const num = (v: number, casas = 2) => menos(nf(casas).format(v));
export const pct = (v: number, casas = 1) => `${menos(nf(casas).format(v * 100))}%`;
export const pp = (v: number, casas = 1) => `${v > 0 ? "+" : ""}${menos(nf(casas).format(v * 100))} pp`;
export const int = (v: number) => menos(nf(0).format(v));
export const vezes = (v: number, casas = 2) => `${nf(casas).format(v)}×`;
export const sinal = (v: number, casas = 2) => `${v > 0 ? "+" : ""}${num(v, casas)}`;
export const reais = (v: number) => {
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 1e6) return `${s}R$ ${nf(2).format(a / 1e6)} mi`;
  if (a >= 1e3) return `${s}R$ ${nf(0).format(a / 1e3)} mil`;
  return `${s}R$ ${nf(0).format(a)}`;
};

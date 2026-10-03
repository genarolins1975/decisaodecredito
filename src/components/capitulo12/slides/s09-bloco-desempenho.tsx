"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 09 · c12p9 · quadro provisório (a construir). */
export function S09BlocoDesempenho({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p9" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

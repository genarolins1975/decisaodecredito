"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 05 · c12p5 · quadro provisório (a construir). */
export function S05BaseCodigo({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p5" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

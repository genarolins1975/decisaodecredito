"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 21 · c12p21 · quadro provisório (a construir). */
export function S21AucGini({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p21" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 30 · c12p30 · quadro provisório (a construir). */
export function S30Bagging500({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p30" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

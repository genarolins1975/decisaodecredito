"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 33 · c12p33 · quadro provisório (a construir). */
export function S33Oob({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p33" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

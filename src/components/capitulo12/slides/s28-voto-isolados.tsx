"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 28 · c12p28 · quadro provisório (a construir). */
export function S28VotoIsolados({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p28" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

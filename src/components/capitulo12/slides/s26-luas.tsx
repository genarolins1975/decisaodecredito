"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 26 · c12p26 · quadro provisório (a construir). */
export function S26Luas({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p26" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

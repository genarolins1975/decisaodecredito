"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 23 · c12p23 · quadro provisório (a construir). */
export function S23Votacao({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p23" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 34 · c12p34 · quadro provisório (a construir). */
export function S34Floresta({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p34" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

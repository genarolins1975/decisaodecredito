"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 14 · c12p14 · quadro provisório (a construir). */
export function S14F1({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p14" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

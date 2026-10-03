"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 49 · c12p49 · quadro provisório (a construir). */
export function S49Volta({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p49" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 37 · c12p37 · quadro provisório (a construir). */
export function S37Residuo({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p37" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

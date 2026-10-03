"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 45 · c12p45 · quadro provisório (a construir). */
export function S45Regras({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p45" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

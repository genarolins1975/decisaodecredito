"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 25 · c12p25 · quadro provisório (a construir). */
export function S25QuatroFormas({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p25" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

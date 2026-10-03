"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 38 · c12p38 · quadro provisório (a construir). */
export function S38SinteseEnsembles({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p38" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

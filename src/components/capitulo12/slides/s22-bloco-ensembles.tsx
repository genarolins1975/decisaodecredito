"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 22 · c12p22 · quadro provisório (a construir). */
export function S22BlocoEnsembles({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p22" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

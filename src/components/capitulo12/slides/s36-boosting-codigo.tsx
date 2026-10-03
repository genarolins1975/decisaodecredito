"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 36 · c12p36 · quadro provisório (a construir). */
export function S36BoostingCodigo({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p36" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

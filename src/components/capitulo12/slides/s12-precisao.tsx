"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 12 · c12p12 · quadro provisório (a construir). */
export function S12Precisao({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p12" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

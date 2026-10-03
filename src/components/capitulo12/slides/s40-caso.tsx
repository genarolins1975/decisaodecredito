"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 40 · c12p40 · quadro provisório (a construir). */
export function S40Caso({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p40" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 43 · c12p43 · quadro provisório (a construir). */
export function S43Sobreajuste({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p43" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

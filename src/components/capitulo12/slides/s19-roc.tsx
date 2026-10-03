"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 19 · c12p19 · quadro provisório (a construir). */
export function S19Roc({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p19" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

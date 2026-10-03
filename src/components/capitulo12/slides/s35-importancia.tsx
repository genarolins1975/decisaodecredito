"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 35 · c12p35 · quadro provisório (a construir). */
export function S35Importancia({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p35" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

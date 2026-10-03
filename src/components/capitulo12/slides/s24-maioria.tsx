"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 24 · c12p24 · quadro provisório (a construir). */
export function S24Maioria({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p24" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

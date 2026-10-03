"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 41 · c12p41 · quadro provisório (a construir). */
export function S41ForaDoTempo({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p41" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}

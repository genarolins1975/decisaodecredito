"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";
import { crescer } from "@/lib/visuais/arvore";
import type { Block } from "@/lib/services/content";
import { ArvoreDiagrama, caminhoNaArvore, type Anatomia } from "./arvore-diagrama";

/**
 * Abertura do capítulo 5 (c5p1). Substitui o bloco do desafio: o texto do desafio e as três etapas vêm do conteúdo, e
 * a árvore de profundidade 2 das 16 propostas é o visual. Cada etapa acende a parte da árvore de que fala: a regra da
 * raiz (corte), o caminho da #15 (caminho) e os níveis (freio). No palco, dispensa o infográfico de abertura.
 */
const BASE = did.base as Proposta[];
type Episodio = Extract<Block, { type: "episode" }>;
const LEGENDA = [
  "A raiz pergunta: utilização até 57,5%? É o corte que mais separa quem pagou de quem deu default.",
  "A #15 (90% de utilização, sem atraso) responde não e não, e cai numa folha de 2 propostas: PD 50%.",
  "Duas perguntas, quatro folhas. Cada nível a mais faz folhas menores e menos confiáveis.",
];
const DESTAQUE: Anatomia[] = ["regra", null, "profundidade"];

export function AberturaArvores({ episodio }: { palco?: boolean; episodio?: Episodio }) {
  const [etapa, setEtapa] = useState(0);
  const arvore = useMemo(() => crescer(BASE, 2), []);
  const caminho = useMemo(() => caminhoNaArvore(arvore, 90, 0), [arvore]);
  const etapas = episodio?.steps ?? [];
  return (
    <figure className="vz" data-vz="abertura-arvores">
      <div className="vz-ab-grade">
        <div className="vz-ab-texto">
          <p className="vz-ab-num" aria-hidden="true">{String(episodio?.number ?? 5).padStart(2, "0")}</p>
          <p className="eyebrow">O desafio deste capítulo</p>
          {episodio && <h3 className="vz-ab-desafio">{episodio.challenge}</h3>}
          {episodio && <p className="vz-ab-lead">{episodio.text}</p>}
          <div className="vz-ab-etapas" role="group" aria-label="Etapas do capítulo">
            {etapas.map((s, k) => (
              <button key={s.title} type="button" className="vz-ab-etapa" aria-pressed={k === etapa} onClick={() => setEtapa(k)}>
                <span className="vz-ab-n" aria-hidden="true">{k + 1}</span><b>{s.title}</b><span className="vz-ab-det">{s.detail}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="vz-ab-visual">
          <ArvoreDiagrama no={arvore} caminho={etapa === 1 ? caminho : undefined} anatomia={DESTAQUE[etapa]} W={560} />
          <p className="vz-ab-legenda" aria-live="polite">{LEGENDA[etapa]}</p>
        </div>
      </div>
    </figure>
  );
}

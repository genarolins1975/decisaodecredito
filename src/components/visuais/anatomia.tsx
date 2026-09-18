"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";
import { crescer, folhas } from "@/lib/visuais/arvore";
import { ArvoreDiagrama, type Anatomia as Elemento } from "./arvore-diagrama";

/**
 * Anatomia: nó, regra, ramo, folha, profundidade (capítulo 5, c5p3). A árvore de duas divisões das 16 propostas com
 * cada elemento aceso ao toque, e a conta de quantas folhas uma profundidade permite.
 */
const BASE = did.base as Proposta[];
const PALAVRAS: { k: Elemento; nome: string; texto: string }[] = [
  { k: "no", nome: "Nó", texto: "um grupo de propostas. A raiz é o nó que contém todas as 16." },
  { k: "regra", nome: "Regra", texto: "a pergunta que divide o nó. Sempre da forma variável menor ou igual a valor." },
  { k: "ramo", nome: "Ramo", texto: "cada uma das duas saídas da regra. Sempre duas, nesta construção." },
  { k: "folha", nome: "Folha", texto: "nó que não é mais dividido. É onde a previsão é produzida." },
  { k: "profundidade", nome: "Profundidade", texto: "número de regras entre a raiz e a folha. Esta árvore tem profundidade 2." },
];

export function Anatomia() {
  const [el, setEl] = useState<Elemento>("no");
  const [d, setD] = useState(3);
  const arvore = useMemo(() => crescer(BASE, 2), []);
  const fs = folhas(arvore);
  const palavra = PALAVRAS.find((p) => p.k === el)!;
  return (
    <figure className="vz" data-vz="anatomia">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Anatomia da árvore · 16 propostas · duas divisões · o diagrama usado em todo o capítulo</p>
          <p className="vz-tit">Cinco palavras, e cada uma tem lugar no desenho. A profundidade conta divisões, não nós.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Elemento da árvore">
          {PALAVRAS.map((p) => <button key={p.k} type="button" className={`btn btn-sm ${el === p.k ? "" : "btn-secondary"}`} onClick={() => setEl(p.k)}>{p.nome}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>{palavra.nome}:</b> {palavra.texto} Esta árvore tem 7 nós, 3 regras, 6 ramos, {fs.length} folhas e profundidade 2; as folhas somam {fs.reduce((s, f) => s + f.n, 0)} propostas e {fs.reduce((s, f) => s + f.d, 0)} defaults, sem sobreposição e sem buraco.</div>
      <div className="vz-ana-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">A árvore de profundidade 2 <span className="hint">cada caixa traz quantas propostas chegaram ali, quantas deram default e a taxa</span></p>
          <ArvoreDiagrama no={arvore} anatomia={el} />
        </div>
        <div className="vz-ana-lado">
          <div className="vz-tile"><p className="eyebrow">As cinco palavras</p>
            <table className="table text-[.85em] vz-esc-usos"><tbody>{PALAVRAS.map((p) => <tr key={p.k} className={p.k === el ? "vz-t-on" : ""} onClick={() => setEl(p.k)} style={{ cursor: "pointer" }}><th scope="row">{p.nome}</th><td>{p.texto}</td></tr>)}</tbody></table></div>
          <div className="vz-tile"><p className="eyebrow">Quantas folhas uma profundidade permite</p>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>profundidade máxima d</span><span className="vz-slider-valor">{d} → até {(2 ** d).toLocaleString("pt-BR")} folhas</span></span><input type="range" min={1} max={10} step={1} value={d} onChange={(e) => setD(Number(e.target.value))} aria-valuetext={`${d}`} /></label>
            <div className="vz-ana-potencias" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => i + 1).map((k) => <span key={k} className={`vz-ana-pot ${k === d ? "vz-ana-pot--on" : ""} ${k <= d ? "vz-ana-pot--ate" : ""}`} style={{ height: `${8 + 80 * (Math.log2(2 ** k) / 10)}%` }} title={`${k}: ${2 ** k}`}><b>{k}</b></span>)}</div>
            <p className="hint">Uma árvore com profundidade máxima d tem no máximo 2 elevado a d folhas. Profundidade 3 chega a 8, profundidade 10 chega a 1.024. O número cresce rápido e é por isso que a profundidade é o principal freio.</p></div>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">Duas propriedades que decorrem da forma</p><p className="vz-num vz-num--texto">Toda proposta cai em exatamente uma folha, então as folhas particionam a população sem sobreposição e sem buraco. E o caminho até a folha é a explicação completa da previsão daquela proposta, o que torna a árvore auditável linha a linha.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Árvore crescida aqui sobre as 16 propostas didáticas com profundidade máxima 2: raiz em utilização ≤ 57,5% (ganho 0,281), depois utilização ≤ 27,5% à esquerda e ≤ 87,5% à direita (ganho 0,094 em cada lado). Folhas: 1 de 2, 0 de 6, 6 de 6 e 1 de 2. Falta o critério que escolhe a regra de cada nó.</p>
    </figure>
  );
}

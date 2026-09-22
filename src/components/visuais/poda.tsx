"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { crescer, folhas, gini } from "@/lib/visuais/arvore";
import { SemCaixaAlta } from "./sem-caixa-alta";

/**
 * Poda por custo de complexidade (capítulo 5, c5p15). Quatro árvores da mesma base, com a impureza ponderada
 * recalculada aqui, avaliadas por custo = impureza + α × folhas. O preço da folha na mão; a árvore de quatro folhas
 * nunca vence.
 */
const BASE = did.base as Proposta[];
const W = 640, H = 320, ML = 50, MR = 14, MT = 24, MB = 40, A_MAX = 0.35, C_MAX = 2.2;
const sx = (a: number) => ML + (a / A_MAX) * (W - ML - MR), sy = (c: number) => MT + (1 - c / C_MAX) * (H - MT - MB);
const CORES = ["vz-poda-c--0", "vz-poda-c--1", "vz-poda-c--2", "vz-poda-c--3"];

/** Afasta rótulos verticais que ficariam a menos de 13 px um do outro, preservando a ordem. */
function rotulosSemColisao(ys: number[], min = 13): number[] {
  const ordem = ys.map((y, i) => i).sort((a, b) => ys[a] - ys[b]); const out = [...ys];
  for (let k = 1; k < ordem.length; k++) { const a = ordem[k - 1], b = ordem[k]; if (out[b] - out[a] < min) out[b] = out[a] + min; }
  return out;
}

export function Poda() {
  const [alfa, setAlfa] = useState(0.03);
  const arvores = useMemo(() => [0, 1, 2, 3].map((prof) => { const t = crescer(BASE, prof); const fs = folhas(t); return { rot: ["só a raiz", "profundidade 1", "profundidade 2", "profundidade 3, folhas de 1"][prof], folhas: fs.length, R: fs.reduce((s, f) => s + (f.n / BASE.length) * gini(f.d, f.n), 0) }; }), []);
  const custos = arvores.map((t) => ({ ...t, c: t.R + alfa * t.folhas }));
  const min = Math.min(...custos.map((t) => t.c)); const venc = custos.find((t) => Math.abs(t.c - min) < 1e-12)!;
  const troca62 = (arvores[1].R - arvores[3].R) / (arvores[3].folhas - arvores[1].folhas), troca21 = (arvores[0].R - arvores[1].R) / (arvores[1].folhas - arvores[0].folhas);
  const quatroVence = Array.from({ length: 351 }, (_, i) => i / 1000).some((a) => { const cs = arvores.map((t) => t.R + a * t.folhas); return cs[2] < Math.min(cs[0], cs[1], cs[3]) - 1e-12; });
  return (
    <figure className="vz" data-vz="poda">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Poda · crescer primeiro, cortar depois · um preço por folha · quatro árvores da mesma base</p>
          <p className="vz-tit">Mova o preço da folha e veja qual árvore vence. A de quatro folhas nunca vence, para nenhum α.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Valores de α">
          {[0, 0.03, 0.1, 0.3].map((a) => <button key={a} type="button" className={`btn btn-sm ${Math.abs(alfa - a) < 1e-9 ? "" : "btn-secondary"}`} onClick={() => setAlfa(a)}>α = {fmtNum(a, 2)}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>α = {fmtNum(alfa, 3)}:</b> vence {venc.rot}, com custo {fmtNum(venc.c, 5)}. Pontos de troca: α = {fmtNum(troca62, 4)} entre seis e duas folhas, e α = {fmtNum(troca21, 4)} entre duas folhas e a raiz. {quatroVence ? "" : "A árvore de quatro folhas não vence em nenhum ponto."}</div>
      <div className="vz-poda-grade">
        <div className="vz-poda-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Preço de cada folha, α</b> <span className="vz-slider-valor">{fmtNum(alfa, 3)}</span></span>
            <input type="range" min={0} max={350} step={5} value={Math.round(alfa * 1000)} onChange={(e) => setAlfa(Number(e.target.value) / 1000)} aria-valuetext={fmtNum(alfa, 3)} /></label>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Árvore</th><th>Folhas</th><th>Impureza</th><th><SemCaixaAlta>α × folhas</SemCaixaAlta></th><th>Custo</th></tr></thead><tbody>
            {custos.map((t, i) => <tr key={t.rot} className={t === venc ? "vz-t-on" : ""}><th scope="row"><span className={`vz-sw ${CORES[i]}`} />{t.rot}</th><td>{t.folhas}</td><td>{fmtNum(t.R, 5)}</td><td>{fmtNum(alfa * t.folhas, 5)}</td><td className={t === venc ? "vz-t-forte" : ""}>{fmtNum(t.c, 5)}</td></tr>)}
          </tbody></table></div>
          <div className="vz-formula">custo(T) = impureza ponderada de T + α × número de folhas de T</div>
          <p className="hint">Com α igual a zero, a árvore mais complexa sempre vence. Com α muito alto, a raiz sozinha vence. Entre os dois extremos existe uma sequência de árvores, e a poda percorre essa sequência.</p>
        </div>
        <div className="vz-poda-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Custo de cada árvore em função de α <span className="hint">a vencedora é a linha mais baixa em cada ponto</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Custo das quatro árvores; em α ${fmtNum(alfa, 3)} vence ${venc.rot}`}>
              {[0, 0.55, 1.1, 1.65, 2.2].map((v) => <g key={v}><line x1={sx(0)} x2={sx(A_MAX)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
              {[0, 0.1, 0.2, 0.3].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtNum(v, 2)}</text>)}
              <text x={sx(A_MAX / 2)} y={H - 6} textAnchor="middle" className="vz-rotulo">α, preço de cada folha</text>
              <text x={ML + 4} y={MT - 9} className="vz-rotulo">custo total</text>
              {[troca62, troca21].map((a) => <line key={a} x1={sx(a)} x2={sx(a)} y1={sy(0)} y2={sy(C_MAX)} className="vz-corte-linha" />)}
              <text x={sx(troca62) + 4} y={sy(0) - 6} className="vz-tick">troca em {fmtNum(troca62, 4)}</text>
              <text x={sx(troca21) + 4} y={sy(0) - 6} className="vz-tick">troca em {fmtNum(troca21, 4)}</text>
              {arvores.map((t, i) => <line key={t.rot} x1={sx(0)} y1={sy(t.R)} x2={sx(A_MAX)} y2={sy(Math.min(C_MAX, t.R + A_MAX * t.folhas))} className={`vz-poda-linha ${CORES[i]} ${custos[i] === venc ? "vz-poda-linha--venc" : ""}`} />)}
              {rotulosSemColisao(arvores.map((t) => sy(Math.min(C_MAX, t.R + A_MAX * t.folhas)) - 5)).map((y, i) => <text key={arvores[i].rot} x={sx(A_MAX) - 4} y={y} textAnchor="end" className={`vz-tick vz-tick--forte vz-poda-t--${i}`}>{arvores[i].folhas} folha{arvores[i].folhas > 1 ? "s" : ""}</text>)}
              <line x1={sx(alfa)} x2={sx(alfa)} y1={sy(0)} y2={sy(min)} className="vz-arv-cand" />
              <g className="vz-regua-ponto vz-lo-ponto--dobro" style={{ transform: `translate(${sx(alfa)}px, ${sy(min)}px)` }}><circle r={7} /><text x={alfa > 0.25 ? -12 : 12} y={-10} textAnchor={alfa > 0.25 ? "end" : "start"} className="vz-ponto-t">α atual · {venc.rot}</text></g>
            </svg>
          </div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Um resultado que surpreende</p><p className="vz-num vz-num--texto">Nesta base, a árvore de quatro folhas nunca vence, para nenhum valor de α. A sequência de podas salta de seis folhas direto para duas. Isso acontece porque a redução de impureza do último nível é desproporcional à do penúltimo, e é a razão pela qual a poda é feita por elo mais fraco e não testando profundidades.</p></div>
          <p className="hint">Em prática, α é escolhido por validação cruzada, como qualquer hiperparâmetro. Escolhê-lo pelo desempenho na amostra de treino reproduz o problema do capítulo 2.</p>
        </div>
      </div>
      <p className="vz-fonte">Impureza ponderada recalculada aqui: raiz 0,50000 (1 folha), profundidade 1 0,21875 (2), profundidade 2 0,12500 (4), profundidade 3 com folhas de um 0,00000 (6). Com α = 0,030 vence a árvore de seis folhas com custo 0,18000; trocas em α = 0,0547 e 0,2813.</p>
    </figure>
  );
}

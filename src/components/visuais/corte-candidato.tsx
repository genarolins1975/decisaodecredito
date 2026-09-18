"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { NOME_VAR, VARIAVEIS, avaliarCorte, cortesCandidatos, type Variavel } from "@/lib/visuais/arvore";

/**
 * Avaliar um corte candidato (capítulo 5, c5p6). A variável e o ponto de corte na mão: os dois lados com suas
 * propostas, o Gini de cada um, a média ponderada e o ganho, sobre a régua da variável escolhida.
 */
const BASE = did.base as Proposta[];
const W = 640, ML = 40, MR = 20;

export function CorteCandidato() {
  const [v, setV] = useState<Variavel>("util");
  const [idx, setIdx] = useState(8); // utilização 62,5%, o exemplo da página
  const cortes = useMemo(() => cortesCandidatos(BASE, v), [v]);
  const i = Math.min(idx, cortes.length - 1); const corte = cortes[i];
  const a = useMemo(() => avaliarCorte(BASE, v, corte), [v, corte]);
  const max = v === "util" ? 100 : 40; const un = v === "util" ? "%" : " d";
  const sx = (x: number) => ML + (x / max) * (W - ML - MR);
  const pE = a.esq.filter((p) => p.y).length / a.esq.length, pD = a.dir.filter((p) => p.y).length / a.dir.length;
  return (
    <figure className="vz" data-vz="corte-candidato">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Avaliar um corte candidato · 16 propostas · Gini antes 0,50000</p>
          <p className="vz-tit">Um corte vale pela redução da impureza que produz, ponderada pelo tamanho dos dois grupos.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Variável">
          {VARIAVEIS.map((k) => <button key={k} type="button" className={`btn btn-sm ${v === k ? "" : "btn-secondary"}`} onClick={() => { setV(k); setIdx(k === "util" ? 8 : 3); }}>{NOME_VAR[k]}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>{NOME_VAR[v]} ≤ {fmtNum(corte, 1)}{un}:</b> esquerda com {a.esq.length} propostas e {a.esq.filter((p) => p.y).length} defaults (Gini {fmtNum(a.giniEsq, 5)}), direita com {a.dir.length} e {a.dir.filter((p) => p.y).length} (Gini {fmtNum(a.giniDir, 5)}); média ponderada {fmtNum(a.depois, 5)} e ganho {fmtNum(a.ganho, 5)}.</div>
      <div className="vz-cc-grade">
        <div className="vz-cc-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Ponto de corte</b> <span className="vz-slider-valor">{fmtNum(corte, 1)}{un} · candidato {i + 1} de {cortes.length}</span></span>
            <input type="range" min={0} max={cortes.length - 1} step={1} value={i} onChange={(e) => setIdx(Number(e.target.value))} aria-valuetext={`${fmtNum(corte, 1)}${un}`} /></label>
          <div className="vz-grafico">
            <p className="vz-grafico-t">As 16 propostas sobre a régua de {NOME_VAR[v].toLowerCase()} <span className="hint">o corte é o ponto médio entre dois valores vizinhos</span></p>
            <svg viewBox={`0 0 ${W} 150`} role="img" aria-label={`Corte em ${fmtNum(corte, 1)}: ${a.esq.length} à esquerda e ${a.dir.length} à direita`}>
              <rect x={ML} y={20} width={sx(corte) - ML} height={90} className="vz-cc-lado vz-cc-lado--esq" />
              <rect x={sx(corte)} y={20} width={W - MR - sx(corte)} height={90} className="vz-cc-lado vz-cc-lado--dir" />
              <line x1={ML} x2={W - MR} y1={80} y2={80} className="vz-regua" />
              {(v === "util" ? [0, 25, 50, 75, 100] : [0, 10, 20, 30, 40]).map((t) => <g key={t}><line x1={sx(t)} x2={sx(t)} y1={76} y2={84} className="vz-regua" /><text x={sx(t)} y={100} textAnchor="middle" className="vz-tick">{t}{un}</text></g>)}
              {BASE.map((p) => { const mesmos = BASE.filter((q) => q[v] === p[v]); const k = mesmos.indexOf(p); return <g key={p.id} className="vz-int-ponto" style={{ transform: `translate(${sx(p[v])}px, ${80 - 18 * k}px)` }}><circle r={7} className={p.y ? "vz-int-c--default" : "vz-int-c--pagou"} /><text y={3.5} textAnchor="middle" className="vz-cc-id">{p.id}</text></g>; })}
              <line x1={sx(corte)} x2={sx(corte)} y1={14} y2={116} className="vz-arv-cand" />
              <text x={sx(corte)} y={132} textAnchor="middle" className="vz-ks-t">≤ {fmtNum(corte, 1)}{un} à esquerda · maior à direita</text>
              <text x={ML + 4} y={34} className="vz-tick vz-tick--forte">esquerda: {a.esq.length}</text>
              <text x={W - MR - 4} y={34} textAnchor="end" className="vz-tick vz-tick--forte">direita: {a.dir.length}</text>
            </svg>
          </div>
          <div className="vz-cc-lados">
            <div className="vz-tile vz-cc-tile--esq"><p className="eyebrow">Lado esquerdo: {NOME_VAR[v]} ≤ {fmtNum(corte, 1)}{un}</p>
              <p className="vz-num vz-num--texto"><b>{a.esq.length}</b> propostas · <b>{a.esq.filter((p) => p.y).length}</b> defaults · proporção {fmtPct(pE, 1)} · Gini <b>{fmtNum(a.giniEsq, 5)}</b></p>
              <p className="hint">{a.esq.map((p) => `#${p.id}`).join(", ")}</p></div>
            <div className="vz-tile vz-cc-tile--dir"><p className="eyebrow">Lado direito: {NOME_VAR[v]} &gt; {fmtNum(corte, 1)}{un}</p>
              <p className="vz-num vz-num--texto"><b>{a.dir.length}</b> propostas · <b>{a.dir.filter((p) => p.y).length}</b> defaults · proporção {fmtPct(pD, 1)} · Gini <b>{fmtNum(a.giniDir, 5)}</b></p>
              <p className="hint">{a.dir.map((p) => `#${p.id}`).join(", ")}</p></div>
          </div>
        </div>
        <div className="vz-cc-lado">
          <div className="vz-tile"><p className="eyebrow">A conta do ganho</p>
            <table className="table text-[.85em]"><tbody>
              <tr><th scope="row">Gini antes</th><td>{fmtNum(a.giniAntes, 5)}</td></tr>
              <tr><th scope="row">Média ponderada depois</th><td>{a.esq.length} ÷ 16 × {fmtNum(a.giniEsq, 4)} + {a.dir.length} ÷ 16 × {fmtNum(a.giniDir, 4)} = {fmtNum(a.depois, 5)}</td></tr>
              <tr className="vz-t-on"><th scope="row">Ganho</th><td className="vz-t-forte">{fmtNum(a.ganho, 5)}</td></tr>
            </tbody></table>
            <p className="hint">{a.ganho > 0.28 ? "É o maior ganho possível na raiz: este é o corte que a árvore escolhe." : a.ganho > 0 ? "Ganho positivo, mas existe corte melhor. A próxima página varre todos." : "Ganho zero: os dois lados ficam tão misturados quanto a raiz."}</p></div>
          <div className="vz-formula">ganho = Gini(antes) − [ n_esq ÷ n × Gini(esq) + n_dir ÷ n × Gini(dir) ]</div>
          <div className="vz-cc-barras" role="img" aria-label="Antes e depois">
            {[{ n: "antes", v: a.giniAntes, c: "vz-tdc-fill--erro" }, { n: "esquerda", v: a.giniEsq, c: "vz-cc-fill--esq" }, { n: "direita", v: a.giniDir, c: "vz-cc-fill--dir" }, { n: "depois, ponderada", v: a.depois, c: "vz-tdc-fill--ouro" }].map((b) => <div key={b.n} className="vz-tdc-linha"><span className="vz-tdc-rot">{b.n}</span><span className="vz-tdc-trilho"><span className={`vz-tdc-fill ${b.c}`} style={{ width: `${b.v * 200}%` }} /></span><b>{fmtNum(b.v, 4)}</b></div>)}
          </div>
          <p className="hint">Os cortes candidatos são os pontos médios entre valores consecutivos observados. Qualquer valor entre dois vizinhos produz a mesma divisão, então só o ponto médio é testado.</p>
        </div>
      </div>
      <p className="vz-fonte">Utilização ≤ 62,5%: 9 propostas com 2 defaults (Gini 0,34568) e 7 com 6 (Gini 0,24490); média ponderada 0,30159 e ganho 0,19841. O melhor corte da raiz é utilização ≤ 57,5%, com ganho 0,28125.</p>
    </figure>
  );
}

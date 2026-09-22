"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { boostingClassificacao, folhasReg } from "@/lib/visuais/boosting";

/**
 * Os quatro hiperparâmetros (capítulo 6, c6p15). Taxa de aprendizagem, número de árvores, profundidade e mínimo por
 * folha na base didática: perda de treino, folhas somadas, menor folha e a faixa de PD, com a logística do capítulo
 * 4 como referência. Os quatro controlam a complexidade por caminhos diferentes.
 */
const BASE = did.base as Proposta[];
const PERDA_LOGISTICA = 0.43282;
const W = 640, H = 300, ML = 50, MR = 14, MT = 20, MB = 38;
const CONTROLA = [
  ["η", "quanto de cada correção é aceito. Menor significa avanço mais lento e menos dependência de cada árvore"],
  ["M", "quantas correções. É o freio contra o sobreajuste, e o único que precisa ser escolhido observando amostra fora do treino"],
  ["Profundidade", "quantas variáveis podem interagir dentro de uma árvore. Profundidade 1 não permite interação alguma; profundidade 2 permite pares"],
  ["Mínimo por folha", "quão específica pode ser uma correção. É a mesma função do capítulo 5, e o mesmo argumento de incerteza da folha"],
];

export function Hiperparametros() {
  const [eta, setEta] = useState(0.4);
  const [M, setM] = useState(4);
  const [prof, setProf] = useState(2);
  const [mf, setMf] = useState(2);
  const r = useMemo(() => {
    const ps = boostingClassificacao(BASE, eta, M, prof, mf);
    const folhas = ps.slice(1).reduce((s, p) => s + folhasReg(p.arvore!).length, 0);
    const menor = Math.min(...ps.slice(1).flatMap((p) => folhasReg(p.arvore!).map((l) => l.n)));
    const fim = ps[ps.length - 1];
    return { ps, folhas, menor, perda: fim.perda, pMin: Math.min(...fim.p), pMax: Math.max(...fim.p) };
  }, [eta, M, prof, mf]);
  const nota = r.perda < 0.05 ? "Perda quase nula em dezesseis observações. O modelo decorou a amostra, exatamente como a árvore de profundidade 3 do capítulo 5." : r.menor < 2 ? "Existem folhas com uma única proposta. Cada correção passa a atender um caso isolado." : M < 3 ? "Poucas correções. O modelo ainda está perto do palpite inicial." : "Configuração razoável para esta base. Em base real, a escolha se faz por validação e não por inspeção.";
  const sx = (m: number) => ML + (m / Math.max(M, 1)) * (W - ML - MR), sy = (v: number) => MT + (1 - v / 0.72) * (H - MT - MB);
  const caminho = r.ps.map((p, i) => `${i ? "L" : "M"}${sx(p.m).toFixed(1)} ${sy(Math.min(0.72, p.perda)).toFixed(1)}`).join("");
  const ticksX = [0, Math.round(M / 4), Math.round(M / 2), Math.round((3 * M) / 4), M].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <figure className="vz" data-vz="hiperparametros">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Os quatro hiperparâmetros · base didática de 16 propostas · logística do capítulo 4 como referência</p>
          <p className="vz-tit">Quatro controles, quatro caminhos para a complexidade. Eles se escolhem em conjunto, e M se escolhe fora do treino.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Configurações de exemplo">
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEta(0.4); setM(4); setProf(2); setMf(2); }}>a da aula</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEta(0.05); setM(40); setProf(1); setMf(4); }}>lenta e rasa</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEta(1); setM(40); setProf(3); setMf(1); }}>decorar</button>
        </div>
      </header>
      <div className={`vz-estado ${r.perda < 0.05 || r.menor < 2 ? "vz-estado--alterado" : ""}`}><b>η {fmtNum(eta, 2)}, M {M}, profundidade {prof}, mínimo {mf}:</b> log loss de treino {fmtNum(r.perda, 5)} contra {fmtNum(PERDA_LOGISTICA, 5)} da logística, {r.folhas} folhas somadas, menor folha com {r.menor}, PD de {fmtPct(r.pMin)} a {fmtPct(r.pMax)}. {nota}</div>
      <div className="vz-hp-grade">
        <div className="vz-hp-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Taxa de aprendizagem η</b> <span className="vz-slider-valor">{fmtNum(eta, 2)}</span></span><input type="range" min={5} max={100} step={5} value={Math.round(eta * 100)} onChange={(e) => setEta(Number(e.target.value) / 100)} aria-valuetext={fmtNum(eta, 2)} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Número de árvores M</b> <span className="vz-slider-valor">{M}</span></span><input type="range" min={1} max={40} step={1} value={M} onChange={(e) => setM(Number(e.target.value))} aria-valuetext={String(M)} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Profundidade de cada árvore</b> <span className="vz-slider-valor">{prof}</span></span><input type="range" min={1} max={3} step={1} value={prof} onChange={(e) => setProf(Number(e.target.value))} aria-valuetext={String(prof)} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Mínimo de propostas por folha</b> <span className="vz-slider-valor">{mf}</span></span><input type="range" min={1} max={4} step={1} value={mf} onChange={(e) => setMf(Number(e.target.value))} aria-valuetext={String(mf)} /></label>
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">Log loss de treino</p><p className={`vz-num ${r.perda < PERDA_LOGISTICA ? "vz-num--ok" : ""}`}>{fmtNum(r.perda, 5)}</p><p className="hint">logística: {fmtNum(PERDA_LOGISTICA, 5)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Folhas somadas</p><p className="vz-num">{r.folhas}</p><p className="hint">parâmetros estimados no total</p></div>
            <div className="vz-tile"><p className="eyebrow">Menor folha</p><p className={`vz-num ${r.menor < 3 ? "vz-num--default" : "vz-num--ok"}`}>{r.menor}</p><p className="hint">propostas na folha mais específica</p></div>
            <div className="vz-tile"><p className="eyebrow">PD mínima e máxima</p><p className="vz-num vz-num--mono">{fmtPct(r.pMin)} a {fmtPct(r.pMax)}</p><p className="hint">o quanto o modelo ousa</p></div>
          </div>
        </div>
        <div className="vz-hp-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Log loss de treino a cada árvore <span className="hint">tracejada: a logística do capítulo 4</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Log loss de treino cai de 0,6931 a ${fmtNum(r.perda, 4)} em ${M} árvores`}>
              {[0, 0.18, 0.36, 0.54, 0.72].map((v) => <g key={v}><line x1={sx(0)} x2={sx(M)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
              {ticksX.map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{v}</text>)}
              <text x={sx(M / 2)} y={H - 6} textAnchor="middle" className="vz-rotulo">árvores acrescentadas</text>
              <text x={ML + 4} y={MT - 7} className="vz-rotulo">log loss de treino</text>
              <line x1={sx(0)} x2={sx(M)} y1={sy(PERDA_LOGISTICA)} y2={sy(PERDA_LOGISTICA)} className="vz-curva vz-curva--odds vz-int-tracejada" />
              <text x={sx(0) + 6} y={sy(PERDA_LOGISTICA) + 15} className="vz-tick vz-tick--forte">logística {fmtNum(PERDA_LOGISTICA, 5)}</text>
              <path d={caminho} className="vz-curva" />
              {r.ps.length <= 41 && r.ps.map((p) => <circle key={p.m} cx={sx(p.m)} cy={sy(Math.min(0.72, p.perda))} r={M > 20 ? 2.5 : 4} className="vz-ponto" />)}
              <g className="vz-regua-ponto" style={{ transform: `translate(${sx(M)}px, ${sy(Math.min(0.72, r.perda))}px)` }}><circle r={7} /><text x={-8} y={-22} textAnchor="end" className="vz-ponto-t">{fmtNum(r.perda, 4)} com {M} árvore{M > 1 ? "s" : ""}</text></g>
            </svg>
          </div>
          <div className="vz-tile"><p className="eyebrow">O que cada um controla</p>
            <table className="table text-[.85em] vz-esc-usos vz-hp-controla"><tbody>{CONTROLA.map((c) => <tr key={c[0]}><th scope="row">{c[0]}</th><td>{c[1]}</td></tr>)}</tbody></table></div>
        </div>
      </div>
      <p className="vz-fonte">Boosting de classificação na escala de log odds, árvores de regressão sobre y − p, utilização e atraso como variáveis. Com η 0,40, M 4, profundidade 2 e mínimo 2: log loss 0,47481, 16 folhas somadas, menor folha com 2, PD de 33% a 67%. Dois desses quatro não podem ser escolhidos separadamente: η e M são acoplados, a próxima página.</p>
    </figure>
  );
}

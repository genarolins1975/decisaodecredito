"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtPct } from "@/lib/visuais/metricas";
import { logisticaSoUtil, retaMinimosQuadrados, sigmoide, type Proposta } from "@/lib/visuais/logistica";

/**
 * A reta que quebra (capítulo 4). Mínimos quadrados de y sobre a utilização nas 16 propostas: a reta sai de 0 a 1 e
 * afirma efeito constante em pontos percentuais. Trocar de família faz a reta virar a curva logística, na frente da turma.
 */
const BASE = did.base as Proposta[];
const W = 640, H = 300, ML = 56, MR = 16, MT = 14, MB = 40;
const sx = (u: number) => ML + (u / 115) * (W - ML - MR); const sy = (v: number) => MT + (1 - (v + 0.25) / 1.5) * (H - MT - MB);

export function RetaQueQuebra() {
  const reta = useMemo(() => retaMinimosQuadrados(BASE), []);
  const curva = useMemo(() => logisticaSoUtil(BASE, 20000), []);
  const [t, setT] = useState(0);
  const anim = useRef(0);
  const tRef = useRef(0);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  /** Anima a mistura até o alvo (ou salta, quando o leitor prefere menos movimento). */
  const animarPara = (alvo: number) => {
    cancelAnimationFrame(anim.current);
    const reduz = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) { tRef.current = alvo; setT(alvo); return; }
    const de = tRef.current; const t0 = performance.now(); const dur = 1200;
    const passo = (now: number) => { const f = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - f, 3); tRef.current = de + (alvo - de) * e; setT(tRef.current); if (f < 1) anim.current = requestAnimationFrame(passo); };
    anim.current = requestAnimationFrame(passo);
  };
  const linha = (u: number) => reta.a + reta.b * u;
  const logis = (u: number) => sigmoide(curva[0] + curva[1] * (u / 10));
  const f = (u: number) => (1 - t) * linha(u) + t * logis(u);
  const d = Array.from({ length: 116 }, (_, u) => `${u ? "L" : "M"}${sx(u).toFixed(1)} ${sy(f(u)).toFixed(1)}`).join("");
  const familia = t < 0.5 ? "reta" : "curva";
  return (
    <figure className="vz" data-vz="reta-que-quebra">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A reta que quebra · mínimos quadrados sobre 16 propostas, só com utilização</p>
          <p className="vz-tit">A conta está certa. A família é que não serve. Troque de família e veja a reta virar curva.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => animarPara(t < 0.5 ? 1 : 0)}>{t < 0.5 ? "Trocar de família: virar curva logística" : "Voltar à reta"}</button>
        </div>
      </header>
      <div className="vz-reta-grade">
        <div className="vz-grafico">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`PD estimada por utilização: ${familia === "reta" ? "reta de mínimos quadrados" : "curva logística"}`}>
            <rect x={sx(0)} y={sy(1.25)} width={sx(115) - sx(0)} height={sy(1) - sy(1.25)} className="vz-fora" />
            <rect x={sx(0)} y={sy(0)} width={sx(115) - sx(0)} height={sy(-0.25) - sy(0)} className="vz-fora" />
            {[-0.25, 0, 0.25, 0.5, 0.75, 1, 1.25].map((v) => <g key={v}><line x1={sx(0)} x2={sx(115)} y1={sy(v)} y2={sy(v)} className={v === 0 || v === 1 ? "vz-zero" : "vz-grade"} /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
            {[0, 20, 40, 60, 80, 100].map((u) => <text key={u} x={sx(u)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{u}%</text>)}
            <text x={sx(57)} y={H - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            <text x={sx(2)} y={sy(1.25) + 12} className="vz-tick vz-tick--default">impossível: acima de 100%</text>
            <text x={sx(2)} y={sy(-0.25) - 4} className="vz-tick vz-tick--default">impossível: abaixo de 0%</text>
            <path d={d} className={`vz-curva ${familia === "reta" ? "vz-curva--reta" : ""}`} />
            {BASE.map((b) => <circle key={b.id} cx={sx(b.util)} cy={sy(b.y)} r={6} className={`vz-dot-plano ${b.y ? "vz-dot-plano--default" : "vz-dot-plano--pagou"}`} />)}
            <text x={sx(5) + 8} y={sy(f(5)) + 14} className="vz-ponto-t">{fmtPct(f(5), 1)} em 5%</text>
            <text x={sx(110) - 8} y={sy(f(110)) - 8} textAnchor="end" className="vz-ponto-t">{fmtPct(f(110), 1)} em 110%</text>
          </svg>
          <div className="vz-legenda"><span><i className="vz-sw vz-sw--default" /> deu default (y = 1)</span><span><i className="vz-sw vz-sw--pagou" /> pagou (y = 0)</span><span><i className="vz-sw vz-sw--futuro" /> valores que nenhuma probabilidade pode assumir</span></div>
        </div>
        <div className="vz-reta-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>De reta a curva</b> <span className="vz-slider-valor">{t < 0.02 ? "reta na probabilidade" : t > 0.98 ? "curva logística" : "no meio do caminho"}</span></span>
            <input type="range" min={0} max={1} step={0.01} value={t} onChange={(ev) => { cancelAnimationFrame(anim.current); tRef.current = Number(ev.target.value); setT(tRef.current); }} aria-valuetext={t < 0.5 ? "reta" : "curva"} /></label>
          <div className="vz-tiles vz-tiles--coluna" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Defeito 1 · domínio</p><p className={`vz-num ${familia === "reta" ? "vz-num--default" : ""}`}>{familia === "reta" ? `${fmtPct(linha(5), 1)} e ${fmtPct(linha(110), 1)}` : "sempre entre 0 e 1"}</p><p className="hint">{familia === "reta" ? `abaixo de ${fmtPct(-reta.a / reta.b / 100, 1)} de utilização a PD estimada é negativa; não é erro numérico, é a forma da função` : "por construção, para qualquer utilização"}</p></div>
            <div className="vz-tile"><p className="eyebrow">Defeito 2 · efeito de mais 10 pontos</p><p className={`vz-num ${familia === "reta" ? "vz-num--default" : ""}`}>{familia === "reta" ? `${(reta.b * 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} pp sempre` : `${((logis(30) - logis(20)) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} pp em 20%, ${((logis(90) - logis(80)) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} pp em 80%`}</p><p className="hint">{familia === "reta" ? "a reta afirma o mesmo ganho para quem estava em 3% e para quem estava em 92%; esse defeito sobrevive a qualquer truncamento" : "constante em log odds, variável em pontos percentuais: o efeito é maior onde a PD está perto de 50%"}</p></div>
          </div>
        </div>
      </div>
      <figcaption className="vz-fonte">Reta de mínimos quadrados de y sobre a utilização: PD = {fmtPct(reta.a, 1)} + {(reta.b * 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} pontos por 10 pontos de utilização, negativa abaixo de {fmtPct(-reta.a / reta.b / 100, 1)}. A curva logística só com utilização foi ajustada aqui por descida de gradiente sobre as mesmas 16 propostas (intercepto {curva[0].toLocaleString("pt-BR", { maximumFractionDigits: 3 })}, {curva[1].toLocaleString("pt-BR", { maximumFractionDigits: 3 })} por dezena de pontos); o modelo completo da aula, com atraso, entra nas páginas seguintes. Recalculado aqui.</figcaption>
    </figure>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { curvaPerda, descidaConstante, perdaConstante } from "@/lib/visuais/perda";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * A bolinha na perda (capítulo 2). Oito propostas, um default, uma PD constante: a perda é uma curva com um único
 * fundo, na frequência observada. Modos: perda (c2p11, a turma move a PD e vê a perda subir) e descida (c2p12,
 * a bolinha desce um passo por vez, com o passo na mão da turma; passo grande demais passa do fundo e volta).
 */
export type ModoBolinha = "perda" | "descida";
const K = 1, N = 8, ALVO = K / N;
const W = 600, H = 320, ML = 52, MR = 16, MT = 16, MB = 44;
const LMAX = 2.2;
const sx = (p: number) => ML + p * (W - ML - MR);
const sy = (l: number) => MT + (1 - Math.min(l, LMAX) / LMAX) * (H - MT - MB);

export function BolinhaNaPerda({ modo = "perda" }: { modo?: ModoBolinha }) {
  const [pd, setPd] = useState(0.02);
  const [passo, setPasso] = useState(2);
  const [t, setT] = useState(0);
  const [tocando, setTocando] = useState(false);
  const curva = useMemo(() => curvaPerda(K, N), []);
  const it = useMemo(() => descidaConstante(K, N, passo, 30), [passo]);
  const d = curva.map((c, i) => `${i ? "L" : "M"}${sx(c.p).toFixed(1)} ${sy(c.perda).toFixed(1)}`).join("");
  useEffect(() => {
    if (!tocando) return;
    const id = setTimeout(() => { if (t >= 12) setTocando(false); else setT(t + 1); }, 700);
    return () => clearTimeout(id);
  }, [tocando, t]);
  const atual = modo === "perda" ? { p: pd, perda: perdaConstante(pd, K, N) } : { p: it[t].p, perda: it[t].perda };
  const minimo = perdaConstante(ALVO, K, N);
  const trilha = modo === "descida" ? it.slice(0, t + 1) : [];

  return (
    <figure className="vz" data-vz={`bolinha-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A bolinha na perda · 8 propostas, 1 default · PD constante para todas</p>
          <p className="vz-tit">{modo === "perda" ? "A perda tem um único fundo, e ele fica exatamente na frequência observada: 12,5%." : "Descer a perda um passo por vez: a direção vem do gradiente, o tamanho do passo é escolha do modelador."}</p>
        </div>
        {modo === "descida" && <div className="vz-acoes"><button type="button" className="btn btn-sm" onClick={() => { setT(0); setTocando(true); }} disabled={tocando}>{tocando ? "Descendo…" : "Descer do início"}</button></div>}
      </header>
      <div className="vz-estado">{modo === "perda"
        ? <><b>PD constante {fmtPct(pd, 1)}:</b> perda média {fmtNum(atual.perda, 4)}, {fmtNum(atual.perda - minimo, 4)} acima do mínimo. {Math.abs(pd - ALVO) < 0.004 ? "Este é o fundo: a frequência observada, 1 em 8." : pd < ALVO ? "A PD está abaixo da frequência: o default observado fica caro demais." : "A PD está acima da frequência: os sete pagadores ficam caros demais."}</>
        : <><b>Iteração {t}:</b> b = {fmtNum(it[t].b, 4)}, PD = σ(b) = {fmtPct(it[t].p, 2)}, gradiente g = p − 0,125 = {fmtNum(it[t].g, 4)}, perda {fmtNum(it[t].perda, 4)}. {t < 30 && <>Próximo passo: b ← {fmtNum(it[t].b, 4)} − {passo.toLocaleString("pt-BR")} × {fmtNum(it[t].g, 4)} = {fmtNum(it[t + 1].b, 4)}.</>}</>}</div>
      <div className="vz-bol-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Perda média por PD constante <span className="hint">L(p) = −[ln p + 7 ln(1 − p)] ÷ 8 · linha dourada: frequência observada</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva da perda logarítmica por PD constante">
            {[0, 0.5, 1, 1.5, 2].map((l) => <g key={l}><line x1={sx(0)} x2={sx(1)} y1={sy(l)} y2={sy(l)} className="vz-grade" /><text x={ML - 6} y={sy(l) + 4} textAnchor="end" className="vz-tick">{fmtNum(l, 1)}</text></g>)}
            {[0, 0.25, 0.5, 0.75, 1].map((p) => <text key={p} x={sx(p)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(p)}</text>)}
            <text x={sx(0.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">PD constante</text>
            <text x={12} y={MT + 10} className="vz-rotulo">perda</text>
            <line x1={sx(ALVO)} x2={sx(ALVO)} y1={sy(LMAX)} y2={sy(0)} className="vz-corte" /><text x={sx(ALVO) + 5} y={sy(LMAX) + 12} className="vz-tick vz-tick--ouro">frequência 12,5% · mínimo {fmtNum(minimo, 4)}</text>
            <path d={d} className="vz-curva" />
            {trilha.length > 1 && <path d={trilha.map((q, i) => `${i ? "L" : "M"}${sx(q.p).toFixed(1)} ${sy(q.perda).toFixed(1)}`).join("")} className="vz-bol-trilha" />}
            {trilha.slice(0, -1).map((q) => <circle key={q.t} cx={sx(q.p)} cy={sy(q.perda)} r={4} className="vz-bol-passo" />)}
            <circle cx={sx(atual.p)} cy={sy(atual.perda)} r={9} className="vz-bol-bola" />
            <text x={sx(atual.p) + (atual.p > 0.7 ? -14 : 14)} y={sy(atual.perda) - 12} textAnchor={atual.p > 0.7 ? "end" : "start"} className="vz-ponto-t">{fmtPct(atual.p, 1)} · {fmtNum(atual.perda, 4)}</text>
          </svg>
          {modo === "perda"
            ? <label className="vz-slider"><span className="vz-slider-rotulo"><span>PD constante</span><span className="vz-slider-valor">{fmtPct(pd, 1)}</span></span><input type="range" min={0.5} max={99.5} step={0.5} value={pd * 100} onChange={(e) => setPd(Number(e.target.value) / 100)} /></label>
            : <div className="vz-res-controles">
              <div className="vz-bol-botoes"><button type="button" className="btn btn-sm btn-secondary" onClick={() => { setTocando(false); setT(0); }}>Recomeçar em b = 0</button><button type="button" className="btn btn-sm" onClick={() => { setTocando(false); setT(Math.min(30, t + 1)); }} disabled={t >= 30}>Próxima iteração</button></div>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Passo (hiperparâmetro)</span><span className="vz-slider-valor">{passo.toLocaleString("pt-BR")}</span></span><input type="range" min={0.5} max={40} step={0.5} value={passo} onChange={(e) => { setPasso(Number(e.target.value)); setT(0); }} /></label>
            </div>}
        </div>
        <div className="vz-bol-painel">
          {modo === "perda" ? (
            <div className="vz-tiles vz-tiles--coluna">
              {[0.02, 0.125, 0.3, 0.7].map((p) => <button key={p} type="button" className={`vz-tile vz-tile--btn ${Math.abs(pd - p) < 0.004 ? "vz-tile--on" : ""}`} onClick={() => setPd(p)}><p className="eyebrow">PD {fmtPct(p, 1)}</p><p className="vz-num">{fmtNum(perdaConstante(p, K, N), 4)}</p><p className="hint">{p === ALVO ? "o fundo: frequência observada" : `${fmtNum(perdaConstante(p, K, N) - minimo, 4)} acima do mínimo`}</p></button>)}
            </div>
          ) : (
            <div className="vz-res-tabela">
              <p className="vz-grafico-t">As três coisas na mesma tela</p>
              <div className="vz-tiles vz-tiles--coluna">
                <div className="vz-tile"><p className="eyebrow">Parâmetro · b</p><p className="vz-num">{fmtNum(it[t].b, 4)}</p><p className="hint">estimado pelos dados, um passo por vez</p></div>
                <div className="vz-tile"><p className="eyebrow">Estatística · perda</p><p className="vz-num">{fmtNum(it[t].perda, 4)}</p><p className="hint">calculada na amostra; mínimo {fmtNum(minimo, 4)}</p></div>
                <div className="vz-tile"><p className="eyebrow">Hiperparâmetro · passo</p><p className="vz-num">{passo.toLocaleString("pt-BR")}</p><p className="hint">{passo >= 20 ? "grande demais: a bolinha passa do fundo e volta" : passo <= 1 ? "pequeno: chega, mas devagar" : "escolhido pelo modelador; não é estimado"}</p></div>
              </div>
              <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>t</th><th>b</th><th>PD</th><th>g</th><th>perda</th></tr></thead><tbody>{it.slice(Math.max(0, t - 4), t + 1).map((q) => <tr key={q.t} className={q.t === t ? "vz-t-on" : undefined}><td>{q.t}</td><td>{fmtNum(q.b, 4)}</td><td>{fmtPct(q.p, 2)}</td><td>{fmtNum(q.g, 4)}</td><td>{fmtNum(q.perda, 4)}</td></tr>)}</tbody></table></div>
            </div>
          )}
        </div>
      </div>
      <p className="vz-fonte">Grupo didático do capítulo 2: 8 propostas, 1 default. p = 1 ÷ (1 + e^(−b)), g = p − 0,125, b(t+1) = b(t) − passo × g. Com passo 2 a partir de b = 0, a PD chega a 12,5% em cerca de 20 iterações; a perda mínima é 0,3768.</p>
    </figure>
  );
}

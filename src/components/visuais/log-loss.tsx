"use client";
import { useState } from "react";
import { ATALHOS, CASOS, EIXO_Y, fmt, fmtPct, formula, FRASE_PERDA, leitura, linhas, maiores, media, NOTA_ESTIMACAO, NOTA_FORA, NOTA_LN, proposta, RODAPE, ROTULO_MEDIA, SELECAO_INICIAL, SINTESE, SINTESE_2, TITULO_GRAF, TITULO_PAINEL } from "@/lib/visuais/log-loss";

/**
 * Slide 15 do capítulo 4 (c4p15): a log loss proposta a proposta. Quadro 16:9 no sistema .rl. As 16 barras são a
 * perda individual calculada pelo modelo; a seleção só muda o que o painel direito inspeciona, nunca as barras,
 * a média ou os coeficientes. Contas em src/lib/visuais/log-loss.ts.
 */
const W = 1120, H = 430, ML = 78, MR = 20, MT = 34, MB = 60;
const LS = linhas();
const M = media(LS);
const TOPO = maiores();
const Y_MAX = Math.ceil(Math.max(...LS.map((l) => l.perda)) * 10) / 10 + 0.1;
const bw = (W - ML - MR) / LS.length;
const bx = (i: number) => ML + i * bw + bw * 0.16;
const bwid = bw * 0.68;
const by = (v: number) => MT + (1 - v / Y_MAX) * (H - MT - MB);
const TICKS = [0, 0.4, 0.8, 1.2].filter((v) => v <= Y_MAX);

export function LogLoss({ pagina }: { pagina?: { index: number; total: number } }) {
  const [sel, setSel] = useState(SELECAO_INICIAL);
  const [hover, setHover] = useState<number | null>(null);
  const l = proposta(sel, LS);
  const f = formula(l);
  const h = hover !== null ? proposta(hover, LS) : null;
  return (
    <figure className="vz rl ll" data-vz="log-loss">
      <section className="rl-slide" data-tela="15">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Log loss"}</span></p>
          <h3 className="rl-tit">Como a log loss orienta a estimação</h3>
          <p className="rl-sub">O modelo calcula uma perda por proposta e busca reduzir a média na amostra.</p>
        </header>

        <div className="ll-formula">
          {CASOS.map((c) => <div key={c.k} className="ll-caso"><p className="ll-caso-k">{c.k}</p><p className="ll-caso-f">{c.f}</p></div>)}
          <p className="ll-frase">{FRASE_PERDA} <span className="ll-ln nota">{NOTA_LN}</span></p>
        </div>

        <div className="rl-corpo ll-corpo">
          <div className="ll-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="ll-svg-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="ll-svg" role="group" aria-label={`Perda individual das 16 propostas; média ${fmt(M, 5)}`}>
                {TICKS.map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={by(v)} y2={by(v)} className={v === 0 ? "ll-zero" : "ll-grade"} /><text x={ML - 12} y={by(v) + 7} textAnchor="end" className="ll-tick">{fmt(v, 1)}</text></g>)}
                <text x={6} y={MT - 12} textAnchor="start" className="ll-eixo">{EIXO_Y}</text>
                {LS.map((q, i) => {
                  const alto = TOPO.ids.includes(q.id), on = q.id === sel;
                  return (
                    <g key={q.id} className={`ll-barra ${on ? "ll-barra--on" : ""}`}>
                      <rect x={bx(i)} y={by(q.perda)} width={bwid} height={Math.max(1, by(0) - by(q.perda))} rx={3} />
                      <text x={bx(i) + bwid / 2} y={H - MB + 26} textAnchor="middle" className="ll-tick">#{q.id}</text>
                      {(on || alto) && <text x={bx(i) + bwid / 2} y={by(q.perda) - 10} textAnchor="middle" className="ll-valor">{fmt(q.perda, 2)}</text>}
                      <rect x={ML + i * bw} y={MT} width={bw} height={H - MT - MB} className="ll-alvo" tabIndex={0} role="button"
                        aria-label={`Proposta ${q.id}, ${q.y === 1 ? "com default" : "sem default"}, PD ${fmtPct(q.pd)}, log loss ${fmt(q.perda, 4)}`}
                        aria-pressed={on} onClick={() => setSel(q.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(q.id); } }}
                        onPointerEnter={() => setHover(q.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(q.id)} onBlur={() => setHover(null)} />
                    </g>
                  );
                })}
                <line x1={ML} x2={W - MR} y1={by(M)} y2={by(M)} className="ll-media" />
                <text x={W - MR} y={MT - 12} textAnchor="end" className="ll-media-t">{ROTULO_MEDIA}: {fmt(M, 5)}</text>
                {h && (() => { const i = LS.findIndex((q) => q.id === h.id); const dir = bx(i) > W * 0.6; const x = dir ? bx(i) - 12 : bx(i) + bwid + 12; return (
                  <g className="ll-tip" transform={`translate(${x}, ${MT + 8})`} aria-hidden="true">
                    <text textAnchor={dir ? "end" : "start"} className="ll-tip-k">Proposta #{h.id}</text>
                    <text y={26} textAnchor={dir ? "end" : "start"} className="ll-tip-t">{h.y === 1 ? "Default · y = 1" : "Sem default · y = 0"}</text>
                    <text y={50} textAnchor={dir ? "end" : "start"} className="ll-tip-t">PD estimada {fmtPct(h.pd)}</text>
                    <text y={74} textAnchor={dir ? "end" : "start"} className="ll-tip-t">Log loss {fmt(h.perda, 4)}</text>
                  </g>); })()}
              </svg>
            </div>
          </div>

          <aside className="ll-painel" aria-live="polite">
            <div className="ll-painel-cab">
              <p className="rl-k">{TITULO_PAINEL}</p>
              <div className="rl-atalhos" role="group" aria-label="Propostas em destaque">
                {ATALHOS.map((a) => <button key={a} type="button" className={`rl-btn rl-btn--mini ${a === sel ? "rl-btn--on" : ""}`} aria-pressed={a === sel} onClick={() => setSel(a)}>#{a}</button>)}
                <button type="button" className="rl-btn rl-btn--mini" onClick={() => setSel(SELECAO_INICIAL)}>Restaurar seleção</button>
              </div>
            </div>
            <p className="ll-prop">Proposta #{l.id}<span className="ll-carac">Utilização {l.util}% · Atraso {l.atraso} dias</span></p>
            <div className="ll-duo">
              <div><p className="ll-k">Desfecho observado</p><p className={`ll-v ${l.y === 1 ? "ll-v--default" : "ll-v--adimplente"}`}>{f.desfecho}</p></div>
              <div><p className="ll-k">{f.rotulo}</p><p className="ll-v">{fmtPct(l.pd)}</p></div>
            </div>
            <div className="ll-conta">
              <p className="ll-k">Probabilidade do desfecho observado</p>
              <p className="ll-pobs">{fmtPct(l.pObservado)}</p>
              <p className="ll-k">Perda individual</p>
              <p className="ll-perda">{f.conta}</p>
            </div>
            <p className="ll-leitura">{leitura(l)}</p>
          </aside>
        </div>

        <div className="ll-sintese">
          <div>
            <p className="ll-sin-t">{SINTESE}</p>
            <p className="ll-sin-s">{NOTA_ESTIMACAO}</p>
            <p className="ll-sin-s">{SINTESE_2} As três maiores perdas representam {fmt(TOPO.participacao, 0)}% da perda total.</p>
          </div>
          <p className="ll-sin-n">{NOTA_FORA}</p>
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

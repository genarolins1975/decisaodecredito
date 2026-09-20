"use client";
import { useState } from "react";
import { aplicar, BETA_ZERO, DESTAQUE_GRAF, estado, ETA, ETAPAS, EXPLICACAO, fmt, fmt5, fmtAtualizacao, fmtPct, FORMULAS, LEGENDA_GRAF, mediaContrib, NOTA_TABELA, NOTA_UNIDADES, passo, PROPOSTAS, REGRA, RODAPE, TITULO_GRAF } from "@/lib/visuais/gradiente-passo";

/**
 * Slide 16 do capítulo 4 (c4p16): uma iteração, do gradiente aos novos coeficientes. Quadro 16:9 no sistema .rl.
 * Três etapas numeradas: o estado atual, o gradiente (com as 16 contribuições que produzem g₁) e a atualização
 * −ηg aplicada aos três parâmetros juntos. Contas em src/lib/visuais/gradiente-passo.ts.
 */
const W = 760, H = 300, ML = 54, MR = 18, MT = 22, MB = 46;
const bw = (W - ML - MR) / PROPOSTAS.length;

export function GradientePasso({ pagina }: { pagina?: { index: number; total: number } }) {
  const [beta, setBeta] = useState<readonly [number, number, number]>(BETA_ZERO);
  const [iteracao, setIteracao] = useState(0);
  const [perdaAnterior, setPerdaAnterior] = useState<number | null>(null);
  const e = estado(beta);
  const ls = passo(e);
  const media = mediaContrib(e);
  const escala = Math.max(1, Math.ceil(Math.max(...e.contribG1.map((v) => Math.abs(v)), Math.abs(media)) * 1.05));
  const cy = (v: number) => MT + (1 - (v + escala) / (2 * escala)) * (H - MT - MB);
  const reiniciar = () => { setBeta(BETA_ZERO); setIteracao(0); setPerdaAnterior(null); };
  const avancar = () => { setPerdaAnterior(e.perda); setBeta(aplicar(e)); setIteracao((i) => i + 1); };
  return (
    <figure className="vz rl gp" data-vz="gradiente-passo">
      <section className="rl-slide" data-tela="16">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Gradiente"}</span></p>
          <h3 className="rl-tit">Uma iteração: do gradiente aos novos coeficientes</h3>
          <p className="rl-sub">O gradiente indica a direção de aumento da perda. Atualizamos os coeficientes no sentido oposto.</p>
        </header>

        <div className="gp-estado" aria-live="polite">
          <p className="gp-etapa"><span className="gp-n">1</span>{iteracao === 0 ? ETAPAS[0] : `Estado atual, depois de ${iteracao} ${iteracao === 1 ? "iteração" : "iterações"}`}</p>
          <div className="gp-estado-itens">
            <div><p className="gp-v">{e.beta.every((v) => v === 0) ? "β₀ = β₁ = β₂ = 0" : `β₀ ${fmt5(e.beta[0])} · β₁ ${fmt5(e.beta[1])} · β₂ ${fmt5(e.beta[2])}`}</p><p className="gp-k">coeficientes atuais</p></div>
            <div><p className="gp-v">{e.mesmaPd !== null ? fmtPct(e.mesmaPd) : `${fmtPct(Math.min(...e.pd))} a ${fmtPct(Math.max(...e.pd))}`}</p><p className="gp-k">{e.mesmaPd !== null ? "PD de cada proposta" : "faixa das PDs estimadas"}</p></div>
            <div><p className="gp-v">{fmt5(e.perda)}</p><p className="gp-k">log loss média{perdaAnterior !== null && <span className="gp-antes"> · antes {fmt5(perdaAnterior)}</span>}</p></div>
          </div>
        </div>

        <div className="rl-corpo gp-corpo">
          <div className="gp-grad">
            <p className="gp-etapa"><span className="gp-n">2</span>{ETAPAS[1]}</p>
            <p className="gp-sub">Cada componente é uma média sobre as 16 propostas.</p>
            <div className="gp-formulas">
              {FORMULAS.map((f, i) => <p key={f.id} className="gp-f">{f.t} <b>= {fmt5(e.g[i])}</b></p>)}
            </div>
            <p className="gp-unid nota">{NOTA_UNIDADES}</p>
          </div>

          <div className="gp-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="gp-svg-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="gp-svg" role="img" aria-label={`Contribuições das 16 propostas para g₁; a média é ${fmt5(media)}`}>
                {[-escala, -escala / 2, 0, escala / 2, escala].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={cy(v)} y2={cy(v)} className={v === 0 ? "gp-zero" : "gp-grade"} /><text x={ML - 8} y={cy(v) + 5} textAnchor="end" className="gp-tick">{fmt(v, 1)}</text></g>)}
                {e.contribG1.map((v, i) => {
                  const x = ML + i * bw + bw * 0.18, wid = bw * 0.64;
                  const y = v >= 0 ? cy(v) : cy(0), alt = Math.max(1, Math.abs(cy(v) - cy(0)));
                  return <g key={PROPOSTAS[i].id}><rect x={x} y={y} width={wid} height={alt} rx={2} className={`gp-barra ${v >= 0 ? "gp-barra--pos" : "gp-barra--neg"}`} /><text x={x + wid / 2} y={H - MB + 20} textAnchor="middle" className="gp-tick">{PROPOSTAS[i].id}</text></g>;
                })}
                <line x1={ML} x2={W - MR} y1={cy(media)} y2={cy(media)} className="gp-media" />
                <text x={W - MR} y={MT - 6} textAnchor="end" className="gp-media-t">Média das contribuições: {fmt5(media)}</text>
                <text x={ML} y={H - 8} className="gp-eixo">proposta</text>
              </svg>
            </div>
            <p className="gp-destaque">{DESTAQUE_GRAF} <span className="gp-leg nota">{LEGENDA_GRAF}</span></p>
          </div>
        </div>

        <div className="gp-passo">
          <div className="gp-passo-cab">
            <p className="gp-etapa"><span className="gp-n">3</span>{ETAPAS[2]}</p>
            <p className="gp-regra">{REGRA} <span className="gp-eta">η = {fmt(ETA, 2)}</span></p>
          </div>
          <table className="gp-tab">
            <colgroup><col className="gp-c1" /><col /><col /><col /><col /></colgroup>
            <thead><tr><th scope="col">Parâmetro</th><th scope="col">Valor atual</th><th scope="col">Gradiente g</th><th scope="col">Atualização −ηg</th><th scope="col">Valor seguinte</th></tr></thead>
            <tbody>
              {ls.map((l) => (
                <tr key={l.id}>
                  <th scope="row">{l.rotulo}</th>
                  <td>{fmt5(l.atual)}</td>
                  <td className="gp-g">{fmt5(l.g)}</td>
                  <td className="gp-upd">{fmtAtualizacao(l.atualizacao)}</td>
                  <td className="gp-next">{fmt5(l.seguinte)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="gp-rodape-passo">
            <p className="gp-expl">{EXPLICACAO} <span className="gp-nota nota">{NOTA_TABELA}</span></p>
            <div className="gp-acoes">
              <button type="button" className="rl-btn rl-btn--on" onClick={avancar}>Aplicar esta atualização</button>
              <button type="button" className="rl-btn" onClick={reiniciar} disabled={iteracao === 0}>Reiniciar</button>
            </div>
          </div>
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

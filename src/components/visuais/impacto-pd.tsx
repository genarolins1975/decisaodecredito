"use client";
import { useState } from "react";
import { ATALHOS, aumentoPp, cenarios, CONCLUSAO, CONTA, CONTA_L, CONTA_TEX, curva, EXPERIMENTO, FAIXA_PD, fmt, fmtPct, fmtPd1, fmtPp, fraseMaximo, maximo, NOTA_CENARIOS, NOTA_EXPERIMENTO, NOTA_SENSIBILIDADE, PD_INICIAL, pdFinal, PERGUNTA_MAX, RODAPE, TICKS_X, TICKS_Y, validarPd, Y_MAX_PP } from "@/lib/visuais/impacto-pd";
import { ComTex, Tex } from "./tex";

/**
 * Slide 12 do capítulo 4 (c4p12): a curva do aumento da PD em função da PD inicial. Quadro 16:9 no sistema .rl.
 * O experimento é fixo e só a PD de partida muda; controle, gráfico, tabela e resultados saem do mesmo estado.
 * Contas em src/lib/visuais/impacto-pd.ts. Substitui o conteúdo herdado da página. O Δz do experimento, a conta da PD
 * final e a fórmula do rodapé em KaTeX desde 24/09/2026, com o texto como rótulo acessível.
 */
const W = 1180, H = 470, ML = 74, MR = 28, MT = 26, MB = 58;
const sx = (p: number) => ML + p * (W - ML - MR);
const sy = (pp: number) => MT + (1 - pp / Y_MAX_PP) * (H - MT - MB);
const limitar = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function Campo({ mostrado, onValor }: { mostrado: string; onValor: (v: number) => void }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [erro, setErro] = useState<string | null>(null);
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); }
  return (
    <div className="ip-campo">
      <label htmlFor="ip-pd">PD inicial, campo em %</label>
      <span className="ip-campo-in">
        <input id="ip-pd" type="text" inputMode="decimal" value={texto} aria-invalid={Boolean(erro)} aria-describedby="ip-pd-msg"
          onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); setErro(null); }}
          onChange={(e) => { setTexto(e.target.value); const r = validarPd(e.target.value); if (r.ok) { onValor(r.valor); setErro(null); } else setErro(r.erro); }} />
        <span>%</span>
      </span>
      <p id="ip-pd-msg" className="ip-msg" aria-live="polite">{erro ?? ""}</p>
    </div>
  );
}

export function ImpactoPd({ pagina }: { pagina?: { index: number; total: number } }) {
  const [p, setP] = useState(PD_INICIAL);
  const [conta, setConta] = useState(false);
  const [revelado, setRevelado] = useState(false);
  const [tabela, setTabela] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const pFinal = pdFinal(p), pp = aumentoPp(p);
  const max = maximo();
  const linha = curva(320).map((q, i) => `${i ? "L" : "M"}${sx(q.p).toFixed(1)} ${sy(q.pp).toFixed(1)}`).join("");
  const ls = cenarios();
  const restaurar = () => { setP(PD_INICIAL); setConta(false); setRevelado(false); setTabela(false); };
  const pq = hover ?? p, ppq = aumentoPp(pq);
  const aoMover = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = ((e.clientX - r.left) / r.width) * (W - ML - MR) + ML;
    setHover(limitar((t - ML) / (W - ML - MR), 0, 1));
  };
  const dirEsq = sx(pq) > W * 0.62;
  return (
    <figure className="vz rl ip" data-vz="impacto-pd">
      <section className="rl-slide" data-tela="12">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Impacto na PD"}</span></p>
          <h3 className="rl-tit">O mesmo multiplicador, diferentes mudanças na PD</h3>
          <p className="rl-sub">Altere a PD inicial e observe o efeito de +10 pp de utilização.</p>
        </header>

        <div className="ip-exp">
          {EXPERIMENTO.map((e) => (
            <div key={e.k} className="ip-exp-item"><p className="ip-exp-k">{e.k}</p>{e.tex ? <p className={`ip-exp-v ip-exp-v--tex ip-exp-v--${e.cor}`} role="img" aria-label={e.v}><Tex f={e.tex} /></p> : <p className={`ip-exp-v ip-exp-v--${e.cor}`}>{e.v}</p>}</div>
          ))}
          <p className="ip-exp-n nota">{NOTA_EXPERIMENTO}</p>
        </div>

        <div className="rl-corpo ip-corpo">
          <div className="ip-painel">
            <p className="rl-k">Escolha o ponto de partida</p>
            <div className="ip-ctl">
              <label htmlFor="ip-range"><b>PD inicial:</b> {fmtPd1(p)}</label>
              <input id="ip-range" type="range" min={FAIXA_PD[0] * 1000} max={FAIXA_PD[1] * 1000} step={1} value={Math.round(p * 1000)}
                onChange={(e) => setP(Number(e.target.value) / 1000)}
                aria-valuetext={`PD inicial ${fmtPd1(p)}, PD final ${fmtPct(pFinal)}, variação ${fmtPp(pp)}`} />
            </div>
            <Campo mostrado={fmt(p * 100, 1)} onValor={setP} />
            <div className="rl-atalhos" role="group" aria-label="Atalhos de PD inicial">
              {ATALHOS.map((a) => <button key={a} type="button" className={`rl-btn rl-btn--mini ${Math.abs(a - p) < 1e-9 ? "rl-btn--on" : ""}`} aria-pressed={Math.abs(a - p) < 1e-9} onClick={() => setP(a)}>{fmt(a * 100, 0)}%</button>)}
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar</button>
            </div>
            <div className="ip-res" aria-live="polite">
              <p className="ip-res-k">PD após a mudança</p>
              <p className="ip-res-v ip-res-v--verde">{fmtPct(pFinal)}</p>
              <p className="ip-res-k">Variação</p>
              <p className="ip-res-v ip-res-v--vinho">{fmtPp(pp)}</p>
            </div>
            <div className="ip-conta-area">
              <button type="button" className="rl-btn rl-btn--mini" aria-expanded={conta} onClick={() => setConta((v) => !v)}>{conta ? "Ocultar a conta" : "Ver a conta"}</button>
              {conta && <div className="ip-conta">
                <p className="ip-conta-f" role="img" aria-label={CONTA}><Tex f={CONTA_TEX} /></p>
                <p className="ip-conta-l"><ComTex t={CONTA_L} /></p>
              </div>}
            </div>
          </div>

          <div className="ip-graf">
            <div className="ip-graf-cab">
              <p className="rl-k">{tabela ? "Sete cenários didáticos" : "Quanto a PD aumenta em cada ponto de partida?"}</p>
              <button type="button" className="rl-btn rl-btn--mini" onClick={() => setTabela((v) => !v)}>{tabela ? "Voltar ao gráfico" : "Comparar sete cenários"}</button>
            </div>

            <div className="ip-svg-wrap">
            {!tabela && (
              <svg viewBox={`0 0 ${W} ${H}`} className="ip-svg" role="img" aria-label={`Aumento da PD em função da PD inicial; em ${fmtPd1(p)} o aumento é ${fmtPp(pp)}`}>
                {TICKS_Y.map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className={v === 0 ? "ip-zero" : "ip-grade"} /><text x={ML - 12} y={sy(v) + 6} textAnchor="end" className="ip-tick">{v}</text></g>)}
                {TICKS_X.map((v) => <text key={v} x={sx(v)} y={H - MB + 26} textAnchor="middle" className="ip-tick">{fmt(v * 100, 0)}%</text>)}
                <text x={sx(0.5)} y={H - 8} textAnchor="middle" className="ip-eixo">PD inicial</text>
                <text x={sx(0)} y={MT - 8} className="ip-eixo">Aumento da PD (pontos percentuais)</text>
                <path d={linha} className="ip-curva" />
                {revelado && <>
                  <line x1={sx(0.5)} x2={sx(0.5)} y1={sy(0)} y2={sy(aumentoPp(0.5))} className="ip-ref" />
                  <circle cx={sx(0.5)} cy={sy(aumentoPp(0.5))} r={6} className="ip-ref-ponto" />
                  <text x={sx(0.5) + 18} y={sy(aumentoPp(0.5)) + 38} textAnchor="start" className="ip-ref-t">50%: {fmtPp(aumentoPp(0.5))}</text>
                  <line x1={sx(max.p)} x2={sx(max.p)} y1={sy(0)} y2={sy(max.pp)} className="ip-max-l" />
                  <circle cx={sx(max.p)} cy={sy(max.pp)} r={9} className="ip-max-ponto" />
                  <text x={sx(max.p) - 16} y={sy(max.pp) - 16} textAnchor="end" className="ip-max-t">Máximo {fmt(max.p * 100, 1)}% · {fmtPp(max.pp)}</text>
                </>}
                <line x1={sx(pq)} x2={sx(pq)} y1={sy(ppq)} y2={sy(0)} className="ip-proj" />
                <line x1={sx(0)} x2={sx(pq)} y1={sy(ppq)} y2={sy(ppq)} className="ip-proj" />
                <circle cx={sx(pq)} cy={sy(ppq)} r={10} className="ip-ponto" />
                <g transform={`translate(${limitar(sx(pq) + (dirEsq ? -18 : 18), ML + 4, W - MR - 4)}, ${limitar(sy(ppq) + 34, MT + 40, H - MB - 8)})`}>
                  <text textAnchor={dirEsq ? "end" : "start"} className="ip-ponto-t">{fmtPd1(pq)} → {fmtPp(ppq)}</text>
                  <text y={22} textAnchor={dirEsq ? "end" : "start"} className="ip-ponto-s">PD final {fmtPct(pdFinal(pq))}</text>
                </g>
                <rect x={sx(0)} y={MT} width={sx(1) - sx(0)} height={H - MT - MB} fill="transparent" onPointerMove={aoMover} onPointerLeave={() => setHover(null)} />
              </svg>
            )}

            {tabela && (
              <div className="ip-tab-area">
                <table className="ip-tab">
                  <thead><tr><th scope="col">PD inicial</th><th scope="col">PD final</th><th scope="col">Variação em pp</th></tr></thead>
                  <tbody>
                    {ls.map((l) => (
                      <tr key={l.p} className={l.maiorDaLista ? "ip-tab-topo" : ""}>
                        <th scope="row">{fmt(l.p * 100, 0)}%</th><td>{fmtPct(l.pFinal)}</td><td>{fmtPp(l.pp)}{l.maiorDaLista && <span className="ip-tab-nota"> maior aumento entre os cenários listados</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="ip-tab-n nota">{NOTA_CENARIOS}</p>
              </div>
            )}
            </div>

            <div className="ip-revela">
              <button type="button" className={`rl-btn rl-btn--mini ${revelado ? "rl-btn--on" : ""}`} aria-expanded={revelado} onClick={() => setRevelado((v) => !v)}>{PERGUNTA_MAX}</button>
              {revelado && <div className="ip-revela-t">
                <p className="ip-revela-1">{fraseMaximo()}</p>
                <p className="ip-revela-2">{NOTA_SENSIBILIDADE}</p>
              </div>}
            </div>
          </div>
        </div>

        <p className="ip-conclusao">{CONCLUSAO}</p>
        <p className="rl-rod nota"><ComTex t={RODAPE} /></p>
      </section>
    </figure>
  );
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { fmtPct } from "@/lib/visuais/metricas";
import { GRADE_CORTES, PARAMETROS, chocar, curva, fmtReais, otimo, parcelas, realizado, type Parcelas } from "@/lib/visuais/economia";

/**
 * A curva de lucro (capítulo 8). Cada ponto é uma avaliação completa das 737 propostas fora do tempo pelo motor
 * econômico da aula, com o corte daquele ponto. O corte intuitivo raramente cai no máximo; a fração perdida e um
 * choque de PD movem o máximo; e o estado do cenário fica sempre na mesma tela que o número.
 */
const Y = oot.y as number[]; const PD = oot.pd as number[]; const EAD = (oot as { ead: number[] }).ead; const N = PD.length;
const CHOQUES = [{ v: 0, nome: "Sem choque" }, { v: 0.3, nome: "Choque leve" }, { v: 0.5, nome: "Choque moderado" }, { v: 0.8, nome: "Choque severo" }];
const CORTE_DECLARADO = 0.14;
const CHAVES = ["receita", "perda", "funding", "operacao", "capital"] as const;

export function CurvaDeLucro() {
  const [corte, setCorte] = useState(0.10);
  const [lgd, setLgd] = useState(PARAMETROS.lgd);
  const [choque, setChoque] = useState(0);
  const [varrendo, setVarrendo] = useState(false);
  const [palpitesTxt, setPalpitesTxt] = useState("");
  const params = useMemo(() => ({ ...PARAMETROS, lgd }), [lgd]);
  const pdCen = useMemo(() => PD.map((v) => chocar(v, choque)), [choque]);
  const pts = useMemo(() => curva(pdCen, EAD, GRADE_CORTES, params), [pdCen, params]);
  const flat = useMemo(() => pts.map((q) => [q.parcelas.total, ...CHAVES.map((k) => q.parcelas[k])]), [pts]);
  const view = useTweenMatriz(flat);
  const best = useMemo(() => otimo(pts), [pts]);
  const mine = useMemo(() => parcelas(pdCen, EAD, corte, params), [pdCen, corte, params]);
  const declarado = useMemo(() => parcelas(pdCen, EAD, CORTE_DECLARADO, params), [pdCen, params]);
  const pdMedia = pdCen.reduce((a, b) => a + b, 0) / N; const pdMediaBase = PD.reduce((a, b) => a + b, 0) / N;
  const realizadoMeu = choque ? null : PD.reduce((s, v, i) => s + (v < corte ? realizado(Y[i], EAD[i], params) : 0), 0);
  const palpites = useMemo(() => palpitesTxt.split(/[,;\s]+/).map((t) => Number(t.replace("%", "").replace(",", "."))).filter((v) => Number.isFinite(v) && v > 0 && v <= 60).slice(0, 12).map((v) => ({ v: v / 100, r: parcelas(pdCen, EAD, v / 100, params) })), [palpitesTxt, pdCen, params]);
  const cenarioBase = lgd === PARAMETROS.lgd && choque === 0;

  useEffect(() => {
    if (!varrendo) return;
    let raf = 0; const t0 = performance.now(); const dur = 6000; const c0 = corte >= 0.6 ? 0.005 : corte;
    const passo = (t: number) => { const f = Math.min(1, (t - t0) / dur); setCorte(Math.round((c0 + (0.6 - c0) * f) / 0.005) * 0.005); if (f < 1) raf = requestAnimationFrame(passo); else setVarrendo(false); };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varrendo]);

  const naMesa = best.parcelas.total - mine.total;
  return (
    <figure className="vz" data-vz="curva-de-lucro">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A curva de lucro · {N} propostas fora do tempo · motor econômico da aula</p>
          <p className="vz-tit">Escolha o corte pela intuição. Depois veja onde está o máximo.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => setVarrendo((v) => !v)} aria-pressed={varrendo}>{varrendo ? "Parar" : "Varrer todos os cortes"}</button>
          {!cenarioBase && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setLgd(PARAMETROS.lgd); setChoque(0); }}>Voltar ao cenário declarado</button>}
        </div>
      </header>
      <p className={`vz-estado ${cenarioBase ? "" : "vz-estado--alterado"}`} role="status">
        <b>Estado do cenário:</b> fração perdida {fmtPct(lgd)} · {choque ? `${CHOQUES.find((c) => c.v === choque)!.nome.toLowerCase()} de PD (+${choque.toLocaleString("pt-BR")} em log odds)` : "sem choque de PD"} · PD média da carteira {fmtPct(pdMedia, 2)}{choque ? ` contra ${fmtPct(pdMediaBase, 2)} no cenário declarado` : ""}
      </p>

      <div className="vz-lucro-grade">
        <div className="vz-graficos">
          <GraficoResultado view={view} corte={corte} best={best.corte} palpites={palpites} varrendo={varrendo} />
          <GraficoAnatomia view={view} corte={corte} />
        </div>
        <div className="vz-lucro-painel">
          <label className="vz-slider">
            <span className="vz-slider-rotulo"><b>Seu corte de aprovação</b> <span className="vz-slider-valor">PD abaixo de {fmtPct(corte, 1)}</span></span>
            <input type="range" min={0.005} max={0.6} step={0.005} value={corte} onChange={(e) => { setVarrendo(false); setCorte(Number(e.target.value)); }} aria-valuetext={`corte em ${fmtPct(corte, 1)}`} />
          </label>
          <div className="vz-tiles vz-tiles--coluna" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Sua escolha · corte {fmtPct(corte, 1)}</p><p className="vz-num">{fmtReais(mine.total)}</p><p className="hint">{mine.aprovados} aprovados de {N}{realizadoMeu != null ? ` · realizado na janela ${fmtReais(realizadoMeu)}` : " · sob choque só existe o esperado"}</p></div>
            <div className="vz-tile"><p className="eyebrow">Máximo da curva · corte {fmtPct(best.corte, 1)}</p><p className="vz-num">{fmtReais(best.parcelas.total)}</p><p className="hint">{best.parcelas.aprovados} aprovados · 120 avaliações independentes da mesma carteira</p></div>
            <div className="vz-tile"><p className="eyebrow">Na mesa</p><p className={`vz-num ${naMesa > 500 ? "vz-num--default" : ""}`}>{naMesa > 500 ? fmtReais(naMesa) : "R$ 0"}</p><p className="hint">{naMesa > 500 ? `${fmtReais(naMesa / Math.max(1, mine.aprovados))} por operação aprovada` : "seu corte está no máximo, ou colado nele"}</p></div>
            {!cenarioBase && <div className="vz-tile"><p className="eyebrow">Custo de não reagir</p><p className={`vz-num ${best.parcelas.total - declarado.total > 500 ? "vz-num--default" : ""}`}>{fmtReais(Math.max(0, best.parcelas.total - declarado.total))}</p><p className="hint">manter o corte de {fmtPct(CORTE_DECLARADO, 1)}, calibrado no cenário declarado, entrega {fmtReais(declarado.total)} contra {fmtReais(best.parcelas.total)} do corte reotimizado</p></div>}
          </div>
          <div className="vz-cenario">
            <label className="vz-slider">
              <span className="vz-slider-rotulo"><b>Fração perdida no default</b> <span className="vz-slider-valor">{fmtPct(lgd)}</span></span>
              <input type="range" min={0.4} max={0.9} step={0.05} value={lgd} onChange={(e) => setLgd(Number(e.target.value))} aria-valuetext={fmtPct(lgd)} />
            </label>
            <div className="vz-seg" role="group" aria-label="Choque de PD em log odds">
              {CHOQUES.map((c) => <button key={c.v} type="button" className={`vz-seg-b ${c.v === choque ? "vz-seg-b--on" : ""}`} aria-pressed={c.v === choque} onClick={() => setChoque(c.v)}>{c.nome.replace("Choque ", "")}</button>)}
            </div>
          </div>
          <div className="vz-palpites">
            <label className="text-[13px]"><b>Palpites da turma</b> <span className="hint">cortes em %, separados por vírgula</span>
              <input className="input mt-1" value={palpitesTxt} onChange={(e) => setPalpitesTxt(e.target.value)} placeholder="8, 10, 12, 20" inputMode="decimal" aria-label="Palpites da turma, cortes em porcentagem" />
            </label>
            {palpites.length > 0 && (
              <table className="table text-[12.5px] mt-2"><thead><tr><th>Palpite</th><th>Resultado</th><th>Na mesa</th></tr></thead>
                <tbody>{palpites.map((p, i) => <tr key={i}><td>{fmtPct(p.v, 1)}</td><td>{fmtReais(p.r.total)}</td><td className={best.parcelas.total - p.r.total > 500 ? "text-alert font-semibold" : ""}>{fmtReais(Math.max(0, best.parcelas.total - p.r.total))}</td></tr>)}
                  <tr><th scope="row">média da turma</th><td colSpan={2}>{(() => { const m = palpites.reduce((s, p) => s + p.v, 0) / palpites.length; const r = parcelas(pdCen, EAD, m, params); return `corte ${fmtPct(m, 1)} · ${fmtReais(r.total)} · na mesa ${fmtReais(Math.max(0, best.parcelas.total - r.total))}`; })()}</td></tr>
                </tbody></table>
            )}
          </div>
        </div>
      </div>
      <figcaption className="vz-fonte">Parâmetros declarados na aula: receita de 28% da exposição se pagar, funding de 12%, custo operacional de R$ 120 por operação e custo de capital de 2%; fração perdida de 65% no cenário declarado. Aprovada é a proposta com PD estimada abaixo do corte. Recalculado aqui sobre as {N} propostas fora do tempo; no cenário declarado, o corte de 10% dá 469 aprovados e R$ 585 mil, e o máximo é R$ 608 mil em 14,0%, como no gerador. O choque desloca a PD estimada em log odds e o desfecho observado não é deslocado, por isso sob choque só existe resultado esperado.</figcaption>
    </figure>
  );
}

/** Interpola a matriz de valores (uma linha por corte) quando o cenário muda. */
function useTweenMatriz(alvo: number[][]): number[][] {
  const [view, setView] = useState(alvo);
  const de = useRef(alvo);
  useEffect(() => {
    const reduz = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const origem = de.current;
    if (reduz || origem.length !== alvo.length) { de.current = alvo; setView(alvo); return; }
    let raf = 0; const t0 = performance.now(); const dur = 800;
    const passo = (t: number) => {
      const f = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - f, 3);
      const cur = alvo.map((linha, i) => linha.map((v, j) => origem[i][j] + (v - origem[i][j]) * e));
      setView(cur); de.current = cur;
      if (f < 1) raf = requestAnimationFrame(passo); else de.current = alvo;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return view;
}

const W = 640, ML = 70, MR = 16;
/** Marcas de eixo arredondadas (passo 1, 2 ou 5 × potência de dez), sempre incluindo o zero. */
function ticksRedondos(min: number, max: number): number[] {
  const bruto = (max - min) / 4; const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
  const passo = [1, 2, 5, 10].map((m) => m * pot).find((v) => v >= bruto) ?? pot * 10;
  const out: number[] = []; for (let v = Math.ceil(min / passo) * passo; v <= max + 1e-9; v += passo) out.push(Math.round(v));
  return out;
}
const sx = (c: number) => ML + (c / 0.6) * (W - ML - MR);
const idxDe = (c: number) => Math.max(0, Math.min(GRADE_CORTES.length - 1, Math.round(c / 0.005) - 1));

function GraficoResultado({ view, corte, best, palpites, varrendo }: { view: number[][]; corte: number; best: number; palpites: { v: number; r: Parcelas }[]; varrendo: boolean }) {
  const H = 300, MT = 24, MB = 40;
  const ys = view.map((l) => l[0]); const yMin = Math.min(0, ...ys) * 1.1, yMax = Math.max(...ys) * 1.12;
  const sy = (v: number) => MT + (1 - (v - yMin) / (yMax - yMin)) * (H - MT - MB);
  const d = (ate: number) => GRADE_CORTES.slice(0, ate + 1).map((c, i) => `${i ? "L" : "M"}${sx(c).toFixed(1)} ${sy(view[i][0]).toFixed(1)}`).join("");
  const k = idxDe(corte); const kb = idxDe(best);
  const ticks = ticksRedondos(yMin, yMax);
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">Resultado esperado da carteira por corte de PD <span className="hint">{varrendo ? "varrendo os cortes…" : "cada ponto é uma avaliação completa da carteira"}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Resultado esperado por corte; máximo em ${fmtPct(best, 1)}`}>
        {ticks.map((v) => <g key={v}><line x1={sx(0)} x2={sx(0.6)} y1={sy(v)} y2={sy(v)} className={v === 0 ? "vz-zero" : "vz-grade"} /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtReais(v)}</text></g>)}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((c) => <text key={c} x={sx(c)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(c)}</text>)}
        <text x={sx(0.3)} y={H - 6} textAnchor="middle" className="vz-rotulo">corte de PD: aprovada se a PD estimada estiver abaixo</text>
        <path d={d(GRADE_CORTES.length - 1)} className="vz-curva vz-curva--fraca" />
        <path d={d(k)} className="vz-curva" />
        <line x1={sx(best)} x2={sx(best)} y1={sy(view[kb][0])} y2={sy(yMin)} className="vz-otimo-linha" />
        <circle cx={sx(best)} cy={sy(view[kb][0])} r={5} className="vz-otimo" />
        <text x={sx(best) + 8} y={sy(view[kb][0]) - 10} className="vz-ks-t">máximo em {fmtPct(best, 1)}</text>
        {palpites.map((p, i) => { const j = idxDe(p.v); return <g key={i}><circle cx={sx(p.v)} cy={sy(view[j][0])} r={4} className="vz-palpite" /><text x={sx(p.v)} y={sy(view[j][0]) + 16} textAnchor="middle" className="vz-tick vz-tick--palpite">{fmtPct(p.v, 1)}</text></g>; })}
        <circle cx={sx(corte)} cy={sy(view[k][0])} r={6} className="vz-ponto" />
        <text x={sx(corte) + (corte > 0.45 ? -10 : 10)} y={sy(view[k][0]) + (sy(view[k][0]) > H - MB - 24 ? -12 : 20)} textAnchor={corte > 0.45 ? "end" : "start"} className="vz-ponto-t">sua escolha · {fmtReais(view[k][0])}</text>
      </svg>
    </div>
  );
}

function GraficoAnatomia({ view, corte }: { view: number[][]; corte: number }) {
  const H = 200, MT = 14, MB = 30;
  const maxPos = Math.max(...view.map((l) => l[1])); const minNeg = Math.min(...view.map((l) => l[2] + l[3] + l[4] + l[5]));
  const sy = (v: number) => MT + (1 - (v - minNeg) / (maxPos - minNeg)) * (H - MT - MB);
  const area = (base: (l: number[]) => number, topo: (l: number[]) => number) => {
    const up = GRADE_CORTES.map((c, i) => `${sx(c).toFixed(1)} ${sy(topo(view[i])).toFixed(1)}`);
    const down = GRADE_CORTES.map((c, i) => `${sx(c).toFixed(1)} ${sy(base(view[i])).toFixed(1)}`).reverse();
    return `M${up.join("L")}L${down.join("L")}Z`;
  };
  const camadas = [
    { nome: "receita esperada", cls: "vz-area--receita", base: () => 0, topo: (l: number[]) => l[1] },
    { nome: "perda esperada", cls: "vz-area--perda", base: () => 0, topo: (l: number[]) => l[2] },
    { nome: "funding", cls: "vz-area--funding", base: (l: number[]) => l[2], topo: (l: number[]) => l[2] + l[3] },
    { nome: "operação", cls: "vz-area--operacao", base: (l: number[]) => l[2] + l[3], topo: (l: number[]) => l[2] + l[3] + l[4] },
    { nome: "capital", cls: "vz-area--capital", base: (l: number[]) => l[2] + l[3] + l[4], topo: (l: number[]) => l[2] + l[3] + l[4] + l[5] },
  ];
  const k = idxDe(corte);
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">Anatomia do resultado <span className="hint">o lucro é a diferença fina entre fluxos grandes</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Receita esperada acima de zero e perda, funding, operação e capital abaixo, por corte">
        {camadas.map((c) => <path key={c.nome} d={area(c.base, c.topo)} className={`vz-area ${c.cls}`} />)}
        <line x1={sx(0)} x2={sx(0.6)} y1={sy(0)} y2={sy(0)} className="vz-zero" />
        <path d={GRADE_CORTES.map((c, i) => `${i ? "L" : "M"}${sx(c).toFixed(1)} ${sy(view[i][0]).toFixed(1)}`).join("")} className="vz-curva" />
        <line x1={sx(corte)} x2={sx(corte)} y1={sy(maxPos)} y2={sy(minNeg)} className="vz-corte-linha" />
        {[0, 0.2, 0.4, 0.6].map((c) => <text key={c} x={sx(c)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(c)}</text>)}
        <text x={ML - 6} y={sy(maxPos) + 4} textAnchor="end" className="vz-tick">{fmtReais(maxPos)}</text>
        <text x={ML - 6} y={sy(minNeg) + 4} textAnchor="end" className="vz-tick">{fmtReais(minNeg)}</text>
        <text x={ML - 6} y={sy(0) + 4} textAnchor="end" className="vz-tick">R$ 0</text>
        {camadas.map((c, i) => <g key={c.nome} transform={`translate(${ML + 8 + i * 118} ${H - 8})`}><rect width={10} height={10} rx={2} className={`vz-area ${c.cls}`} /><text x={14} y={9} className="vz-tick">{c.nome}</text></g>)}
        <text x={sx(corte) + 6} y={MT + 10} className="vz-tick">no seu corte: {fmtReais(view[k][0])}</text>
      </svg>
    </div>
  );
}

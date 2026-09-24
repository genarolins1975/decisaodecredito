"use client";
import { useState } from "react";
import { ATALHOS, CASOS, cartoes, CURVA_ADIMPLENTE, CURVA_DEFAULT, curvaPerda, EIXO_X, EIXO_Y, EIXO_Y_MAX, fmt, fmtPct, formula, leitura, linhas, LN2, maiores, media, naZona, proposta, RODAPE, ROTULO_ATALHOS, ROTULO_INTERCEPTO, ROTULO_MEDIA, SELECAO_INICIAL, SUBTITULO, testeIntercepto, TICKS_X, TICKS_Y, TITULO, TITULO_CTL, TITULO_GRAF, ZONA, type Linha } from "@/lib/visuais/log-loss";
import { Tex } from "./tex";

/**
 * Slide 15 do capítulo 4 (c4p15): a log loss proposta a proposta, na gramática do c4p2. Quadro 16:9 no sistema .rl:
 * as duas fórmulas na faixa, as duas curvas de perda à esquerda, com as 16 propostas sobre a curva do seu desfecho, e
 * o painel de escolha à direita. A faixa acima de ln 2 é onde o modelo deu mais de 50% ao outro desfecho. A escolha
 * da proposta muda só o que o painel inspeciona; a simulação do intercepto desloca todas as PDs e mostra a média
 * subir. Contas em src/lib/visuais/log-loss.ts; aqui só geometria, rótulos e estado.
 */
const W = 1180, H = 560, ML = 96, MR = 34, MT = 64, MB = 84;
const X0 = ML, X1 = W - MR, Y0 = H - MB;
const sx = (pd: number) => X0 + pd * (X1 - X0);
const sy = (v: number) => MT + (1 - Math.min(v, EIXO_Y_MAX) / EIXO_Y_MAX) * (Y0 - MT);
const LS = linhas();
const M = media(LS);
const TOPO = maiores(3, LS);
const CARTOES = cartoes(LS);
const CURVAS = { 1: curvaPerda(1), 0: curvaPerda(0) } as const;
const caminho = (pts: { pd: number; perda: number }[]) => pts.map((q, i) => `${i ? "L" : "M"}${sx(q.pd).toFixed(1)} ${sy(q.perda).toFixed(1)}`).join("");
const TRACO = { 1: caminho(CURVAS[1]), 0: caminho(CURVAS[0]) } as const;
const Y_LN2 = sy(LN2), Y_MEDIA = sy(M);

type Caixa = { x0: number; x1: number; y0: number; y1: number };
const FONTE = 22;
const larguraTexto = (t: string, f = FONTE) => t.length * f * 0.55 + 6;
const caixa = (x: number, y: number, ancora: "start" | "end" | "middle", t: string, f = FONTE): Caixa => {
  const w = larguraTexto(t, f);
  const x0 = ancora === "start" ? x : ancora === "end" ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - f, y1: y + 5 };
};
const cruza = (a: Caixa, b: Caixa) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const PONTOS_CURVAS = [...CURVAS[1], ...CURVAS[0]].map((q) => ({ x: sx(q.pd), y: sy(q.perda) }));
const PONTOS = LS.map((l) => ({ id: l.id, x: sx(l.pd), y: sy(l.perda) }));
/** Textos fixos do desenho: a faixa, as curvas e a média; os rótulos dos pontos desviam deles. */
const Y_ZONA = [MT + 32, MT + 58];
const X_CURVA_1 = sx(Math.exp(-EIXO_Y_MAX)) + 8, X_CURVA_0 = sx(1 - Math.exp(-EIXO_Y_MAX)) - 8, Y_CURVAS = MT - 12;
const FIXAS: Caixa[] = [
  caixa(sx(0.5), Y_ZONA[0], "middle", ZONA[0], 21), caixa(sx(0.5), Y_ZONA[1], "middle", ZONA[1], 21),
  caixa(X_CURVA_1, Y_CURVAS, "start", CURVA_DEFAULT, 21), caixa(X_CURVA_0, Y_CURVAS, "end", CURVA_ADIMPLENTE, 21),
  caixa(X0 + 14, Y_MEDIA - 10, "start", `${ROTULO_MEDIA}: 0,00000 → 0,00000`, 21),
];
const rotuloDe = (l: Linha) => `#${l.id} · ${fmt(l.perda, l.perda < 0.1 ? 3 : 2)}`;

/**
 * Entre posições ao redor do ponto, a mais próxima que não cruza curvas, outros pontos, textos já postos nem a borda.
 * Em cada altura, primeiro o lado em que a curva não passa: a de default desce para a direita, a outra sobe. Rótulo
 * afastado do ponto ganha uma linha-guia.
 */
function posicionar(l: Linha, ocupadas: Caixa[]) {
  const px = sx(l.pd), py = sy(l.perda), t = rotuloDe(l);
  const cands: { x: number; y: number; a: "start" | "end"; custo: number }[] = [];
  for (const dy of [-14, 8, 30, -40, 56, -66, -92, -118, -144]) for (const dx of [14, 74, 134, 194]) {
    const prefereDireita = l.y === 1 ? dy < 0 : dy >= 0;
    cands.push({ x: px + dx, y: py + dy, a: "start", custo: dx + Math.abs(dy) + (prefereDireita ? 0 : 6) });
    cands.push({ x: px - dx, y: py + dy, a: "end", custo: dx + Math.abs(dy) + (prefereDireita ? 6 : 0) });
  }
  cands.sort((a, b) => a.custo - b.custo);
  const dentro = (c: Caixa) => c.x0 >= X0 + 4 && c.x1 <= X1 - 4 && c.y0 >= MT + 2 && c.y1 <= Y0 - 2;
  const livre = (c: Caixa) => {
    const f = { x0: c.x0 - 4, x1: c.x1 + 4, y0: c.y0 - 3, y1: c.y1 + 3 };
    return !PONTOS_CURVAS.some((q) => q.x > f.x0 && q.x < f.x1 && q.y > f.y0 && q.y < f.y1)
      && !PONTOS.some((q) => q.id !== l.id && q.x + 11 > f.x0 && q.x - 11 < f.x1 && q.y + 11 > f.y0 && q.y - 11 < f.y1)
      && !ocupadas.some((o) => cruza(o, f));
  };
  const ok = cands.find((c) => { const k = caixa(c.x, c.y, c.a, t); return dentro(k) && livre(k); }) ?? cands.find((c) => dentro(caixa(c.x, c.y, c.a, t))) ?? cands[0];
  return { x: ok.x, y: ok.y, ancora: ok.a, caixa: caixa(ok.x, ok.y, ok.a, t), texto: t, guia: Math.hypot(ok.x - px, ok.y - 7 - py) > 36, px, py };
}
/** As três maiores perdas ficam sempre rotuladas, na mesma posição, qualquer que seja a escolha. */
const ROT_TOPO = (() => {
  const ocupadas = [...FIXAS];
  return TOPO.ids.map((id) => { const r = posicionar(proposta(id, LS), ocupadas); ocupadas.push(r.caixa); return { id, ...r }; });
})();

/** Rótulos do desenho para uma escolha: as três maiores perdas e, fora delas, a proposta escolhida. Exportado para os testes. */
export function rotulosDoGrafico(sel: number) {
  const rotSel = TOPO.ids.includes(sel) ? [] : [{ id: sel, ...posicionar(proposta(sel, LS), [...FIXAS, ...ROT_TOPO.map((r) => r.caixa)]) }];
  return [...ROT_TOPO, ...rotSel];
}
/** Limites da área de desenho e caixas dos textos fixos, para os testes de colisão. */
export const AREA = { x0: X0, x1: X1, y0: MT, y1: Y0, fixas: FIXAS, pontos: PONTOS };

export function LogLoss({ pagina }: { pagina?: { index: number; total: number } }) {
  const [sel, setSel] = useState<number>(SELECAO_INICIAL);
  const [simular, setSimular] = useState(false);
  const l = proposta(sel, LS);
  const f = formula(l);
  const zona = naZona(l);
  const teste = testeIntercepto(sel);
  const rotulos = rotulosDoGrafico(sel);
  const restaurar = () => { setSel(SELECAO_INICIAL); setSimular(false); };
  const px = sx(l.pd), py = sy(l.perda);
  return (
    <figure className="vz rl ll" data-vz="log-loss">
      <section className="rl-slide" data-tela="15">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Log loss"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="ll-eq">
          {CASOS.map((c) => <div key={c.k}><p className="ll-eq-k">{c.k}</p><span className={`ll-eq-f ll-eq-f--${c.y === 1 ? "default" : "adimplente"}`} role="img" aria-label={c.f}><Tex f={c.tex} /></span></div>)}
        </div>

        <div className="rl-corpo ll-corpo">
          <div className="ll-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="ll-svg-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="ll-svg" role="group" aria-label={`Perda individual das 16 propostas em função da PD estimada; média ${fmt(M, 5)}. ${ZONA.join(" ")}`}>
                <rect x={X0} y={MT} width={X1 - X0} height={Y_LN2 - MT} className="ll-zona" />
                <rect x={X0} y={Y_LN2} width={X1 - X0} height={Y0 - Y_LN2} className="ll-valido" />
                {TICKS_Y.map((v) => <g key={v}><line x1={X0} x2={X1} y1={sy(v)} y2={sy(v)} className={v === 0 ? "ll-zero" : "ll-grade"} /><text x={ML - 14} y={sy(v) + 7} textAnchor="end" className="ll-tick">{fmt(v, 1)}</text></g>)}
                <line x1={X0} x2={X1} y1={Y_LN2} y2={Y_LN2} className="ll-limite" />
                <text x={ML - 14} y={Y_LN2 + 7} textAnchor="end" className="ll-tick ll-tick--ln2">0,69</text>
                {TICKS_X.map((v) => <text key={v} x={sx(v)} y={Y0 + 30} textAnchor="middle" className="ll-tick">{fmt(v * 100, 0)}%</text>)}
                <text x={(X0 + X1) / 2} y={H - 14} textAnchor="middle" className="ll-eixo">{EIXO_X}</text>
                <text x={12} y={MT - 14} className="ll-eixo">{EIXO_Y}</text>
                <path d={TRACO[1]} className="ll-curva ll-curva--default" />
                <path d={TRACO[0]} className="ll-curva ll-curva--adimplente" />
                <text x={X_CURVA_1} y={Y_CURVAS} className="ll-curva-t ll-curva-t--default">{CURVA_DEFAULT}</text>
                <text x={X_CURVA_0} y={Y_CURVAS} textAnchor="end" className="ll-curva-t ll-curva-t--adimplente">{CURVA_ADIMPLENTE}</text>
                <line x1={X0} x2={X1} y1={Y_MEDIA} y2={Y_MEDIA} className="ll-media" />
                {simular && <line x1={X0} x2={X1} y1={sy(teste.mediaDepois)} y2={sy(teste.mediaDepois)} className="ll-media ll-media--nova" />}
                <text x={X0 + 14} y={Y_MEDIA - 10} className="ll-media-t">{ROTULO_MEDIA}: {fmt(M, 5)}{simular && <tspan className="ll-media-t--nova"> → {fmt(teste.mediaDepois, 5)}</tspan>}</text>
                <line x1={px} x2={px} y1={py} y2={Y0} className="ll-proj" />
                <line x1={X0} x2={px} y1={py} y2={py} className="ll-proj" />
                <text x={sx(0.5)} y={Y_ZONA[0]} textAnchor="middle" className="ll-zona-t">{ZONA[0]}</text>
                <text x={sx(0.5)} y={Y_ZONA[1]} textAnchor="middle" className="ll-zona-t">{ZONA[1]}</text>
                {simular && teste.linhas.map((n) => { const a = proposta(n.id, LS); return (
                  <g key={n.id} className={`ll-sim ll-sim--${n.y === 1 ? "default" : "adimplente"}`} aria-hidden="true">
                    <line x1={sx(a.pd)} y1={sy(a.perda)} x2={sx(n.pd)} y2={sy(n.perda)} />
                    <circle cx={sx(n.pd)} cy={sy(n.perda)} r={8} />
                  </g>); })}
                {LS.map((q) => <circle key={q.id} cx={sx(q.pd)} cy={sy(q.perda)} r={q.id === sel ? 14 : 10} className={`ll-ponto ll-ponto--${q.y === 1 ? "default" : "adimplente"} ${q.id === sel ? "ll-ponto--on" : ""}`} />)}
                {rotulos.map((r) => (
                  <g key={r.id} className={`ll-rot-g ${r.id === sel ? "ll-rot-g--on" : ""}`}>
                    {r.guia && <line x1={r.px} y1={r.py} x2={r.x + (r.ancora === "start" ? -4 : 4)} y2={r.y - 7} className="ll-guia" />}
                    <text x={r.x} y={r.y} textAnchor={r.ancora} className="ll-rot">{r.texto}</text>
                  </g>
                ))}
                {LS.map((q) => (
                  <circle key={q.id} cx={sx(q.pd)} cy={sy(q.perda)} r={18} className="ll-alvo" tabIndex={0} role="button"
                    aria-label={`Proposta ${q.id}, ${q.y === 1 ? "com default" : "sem default"}, PD ${fmtPct(q.pd)}, log loss ${fmt(q.perda, 4)}`}
                    aria-pressed={q.id === sel} onClick={() => setSel(q.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(q.id); } }} />
                ))}
              </svg>
            </div>
          </div>

          <aside className="ll-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="ll-ctl">
              <div className="ll-ctl-topo">
                <label htmlFor="ll-range"><b>Proposta #{l.id}</b></label>
                <div className="ll-atalhos" role="group" aria-label="As três maiores perdas">
                  <span>{ROTULO_ATALHOS}</span>
                  {ATALHOS.map((a) => <button key={a} type="button" className={`rl-btn rl-btn--mini ${a === sel ? "rl-btn--on" : ""}`} aria-pressed={a === sel} onClick={() => setSel(a)}>#{a}</button>)}
                </div>
              </div>
              <input id="ll-range" type="range" min={1} max={16} step={1} value={sel} onChange={(e) => setSel(Number(e.target.value))}
                aria-valuetext={`Proposta ${l.id}, ${l.y === 1 ? "com default" : "sem default"}, PD ${fmtPct(l.pd)}, log loss ${fmt(l.perda, 4)}`} />
              <p className="ll-carac">Utilização {l.util}% · Atraso {l.atraso} dias</p>
            </div>
            <dl className="ll-dados">
              <div><dt>Desfecho observado</dt><dd className={l.y === 1 ? "ll-v--default" : "ll-v--adimplente"}>{f.desfecho}</dd></div>
              <div><dt>{f.rotulo}</dt><dd>{fmtPct(l.pd)}</dd></div>
              <div><dt>Probabilidade do que ocorreu</dt><dd>{fmtPct(l.pObservado)}</dd></div>
            </dl>
            <div className="ll-res" aria-live="polite">
              <p className="ll-k">Perda individual</p>
              <p className={`ll-perda ${zona ? "ll-perda--zona" : ""}`} role="img" aria-label={f.conta}><Tex f={f.contaTex} /></p>
              {!simular && <p className={`ll-leitura ${zona ? "ll-leitura--zona" : ""}`}>{leitura(l)}</p>}
            </div>
            <div className="ll-acoes">
              <button type="button" className={`rl-btn rl-btn--mini ${simular ? "rl-btn--on" : ""}`} aria-pressed={simular} onClick={() => setSimular((v) => !v)}>{ROTULO_INTERCEPTO}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            {simular && (
              <div className="ll-comp-box" aria-live="polite">
                <p className="ll-k">{teste.titulo}</p>
                <p className="ll-comp-v">{teste.valores}</p>
                <p className="ll-comp-f">{teste.frase}</p>
              </div>
            )}
          </aside>
        </div>

        <div className="ll-base">
          {CARTOES.map((k) => <div key={k.k}><p className="ll-base-k">{k.k}</p><p className="ll-base-t">{k.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

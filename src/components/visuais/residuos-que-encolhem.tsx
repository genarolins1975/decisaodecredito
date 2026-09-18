"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { boostingRegressao, PONTOS, type PassoReg } from "@/lib/visuais/boosting";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * Resíduos que encolhem (capítulo 6). Oito pontos, um palpite constante e quatro tocos ajustados ao resíduo: a turma
 * vê a previsão em degraus se aproximar dos pontos e os resíduos encolherem, passo a passo, com a taxa de
 * aprendizagem na mão. Modos: taxa (c6p7, η e o erro por etapa), arvores (c6p8, a tabela de cada árvore) e
 * soma (c6p9, a previsão de um ponto como soma de parcelas). Os números batem com o gerador em η = 0,5.
 */
export type ModoResiduos = "taxa" | "arvores" | "soma";
const W = 560, H = 320, ML = 44, MR = 14, MT = 12, MB = 36;
const sx = (x: number) => ML + ((x - 0.5) / 8) * (W - ML - MR);
const sy = (v: number) => MT + (1 - v / 14) * (H - MT - MB);
const X = PONTOS.x, Y = PONTOS.y;
const REF = { eta: 0.5, mse: [10.1875, 3.98828, 2.22001, 0.92914, 0.44851] };

export function ResiduosQueEncolhem({ modo = "taxa" }: { modo?: ModoResiduos }) {
  const [eta, setEta] = useState(0.5);
  const [m, setM] = useState(modo === "soma" ? 4 : 1); // etapa exibida: 0 = só F₀
  const [ponto, setPonto] = useState(7); // índice do ponto em foco (x = 8)
  const [tocando, setTocando] = useState(false);
  const passos = useMemo(() => boostingRegressao(X, Y, eta, 4), [eta]);
  // mistura animada entre a etapa anterior e a atual
  const [t, setT] = useState(1); const tRef = useRef(1); const anim = useRef(0);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  const irPara = (alvo: number) => {
    setM(alvo); cancelAnimationFrame(anim.current);
    const reduz = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) { tRef.current = 1; setT(1); return; }
    tRef.current = 0; setT(0); const t0 = performance.now();
    const passo = (now: number) => { const f = Math.min(1, (now - t0) / 900); const e = 1 - Math.pow(1 - f, 3); tRef.current = e; setT(e); if (f < 1) anim.current = requestAnimationFrame(passo); };
    anim.current = requestAnimationFrame(passo);
  };
  useEffect(() => {
    if (!tocando) return;
    const id = setTimeout(() => { if (m >= 4) setTocando(false); else irPara(m + 1); }, 1400);
    return () => clearTimeout(id);
  }, [tocando, m]);
  const reproduzir = () => { irPara(0); setTocando(true); };

  const atual = passos[m], anterior = passos[Math.max(0, m - 1)];
  const Fv = atual.F.map((f, i) => anterior.F[i] + (f - anterior.F[i]) * t); // previsão exibida
  const degraus = caminhoEmDegraus(Fv);
  const arvore = atual.arvore; const corte = arvore?.corte?.valor;
  const reducao = 1 - atual.mse / passos[0].mse;
  const bateGerador = Math.abs(eta - REF.eta) < 1e-9;
  const p = ponto;

  return (
    <figure className="vz" data-vz={`residuos-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Resíduos que encolhem · 8 pontos, um palpite constante e 4 tocos · o gerador da aula</p>
          <p className="vz-tit">{modo === "taxa" ? "Cada árvore aprende o erro que sobrou. A taxa de aprendizagem decide quanto desse aprendizado entra." : modo === "arvores" ? "Cada árvore é uma regra sobre os resíduos: um corte, duas correções médias, e o erro recalculado." : "A previsão final de um ponto é uma soma visível: o palpite inicial mais quatro parcelas."}</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={reproduzir} disabled={tocando}>{tocando ? "Somando árvores…" : "Reproduzir do início"}</button>
        </div>
      </header>
      <div className="vz-estado"><b>Etapa {m === 0 ? "0: só o palpite F₀" : `${m}: ${m} ${m === 1 ? "árvore somada" : "árvores somadas"}`}.</b> Erro quadrático médio {fmtNum(atual.mse, 4)}{m > 0 && <>, {fmtPct(reducao, 1)} abaixo do palpite inicial</>}. {corte !== undefined && m > 0 && <>Corte da árvore {m} em x = {corte.toLocaleString("pt-BR")}: {fmtNum(arvore!.esq!.valor, 3)} à esquerda, +{fmtNum(arvore!.dir!.valor, 3)} à direita, cada um vezes η = {eta.toLocaleString("pt-BR")}.</>}</div>
      <div className="vz-res-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Observado, previsão em degraus e resíduos <span className="hint">segmento vermelho: palpite baixo, precisa subir · azul: palpite alto</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Oito pontos e a previsão do boosting após ${m} árvores`}>
            {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => <g key={v}><line x1={sx(0.5)} x2={sx(8.5)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{v}</text></g>)}
            {X.map((x) => <text key={x} x={sx(x)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{x}</text>)}
            <text x={sx(4.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">x</text>
            <text x={12} y={MT + 10} className="vz-rotulo">y</text>
            {corte !== undefined && m > 0 && <g><line x1={sx(corte)} x2={sx(corte)} y1={sy(14)} y2={sy(0)} className="vz-corte" style={{ opacity: t }} /><text x={sx(corte) + 4} y={sy(13.4)} className="vz-tick vz-tick--ouro" style={{ opacity: t }}>árvore {m}: x ≤ {corte.toLocaleString("pt-BR")}?</text></g>}
            {X.map((x, i) => { const r = Y[i] - Fv[i]; return <line key={x} x1={sx(x)} x2={sx(x)} y1={sy(Fv[i])} y2={sy(Y[i])} className={`vz-res-seg ${r > 0 ? "vz-res-seg--baixo" : "vz-res-seg--alto"} ${i === p && modo === "soma" ? "vz-res-seg--foco" : ""}`} />; })}
            <path d={degraus} className="vz-curva vz-curva--degrau" />
            {X.map((x, i) => <g key={x} className={modo === "soma" ? "vz-res-clic" : undefined} onClick={modo === "soma" ? () => setPonto(i) : undefined}>
              <circle cx={sx(x)} cy={sy(Y[i])} r={i === p && modo === "soma" ? 8 : 6} className={`vz-res-dot ${i === p && modo === "soma" ? "vz-res-dot--foco" : ""}`} />
              <circle cx={sx(x)} cy={sy(Fv[i])} r={3.5} className="vz-res-prev" />
            </g>)}
            {modo === "soma" && <text x={sx(X[p]) + (X[p] > 6 ? -10 : 10)} y={sy(Y[p]) - 12} textAnchor={X[p] > 6 ? "end" : "start"} className="vz-ponto-t">y = {fmtNum(Y[p], 2)} · previsão {fmtNum(Fv[p], 2)} · resíduo {fmtNum(Y[p] - Fv[p], 2)}</text>}
          </svg>
          <div className="vz-res-controles">
            <div className="vz-seg" role="group" aria-label="Etapa">
              {[0, 1, 2, 3, 4].map((k) => <button key={k} type="button" className={`vz-seg-b ${m === k ? "vz-seg-b--on" : ""}`} onClick={() => { setTocando(false); irPara(k); }}>{k === 0 ? "F₀" : `árvore ${k}`}</button>)}
            </div>
            {modo !== "arvores" && <label className="vz-slider"><span className="vz-slider-rotulo"><span>Taxa de aprendizagem η</span><span className="vz-slider-valor">{eta.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span></span>
              <input type="range" min={0.1} max={1} step={0.1} value={eta} onChange={(e) => setEta(Number(e.target.value))} /></label>}
          </div>
        </div>
        <div className="vz-res-painel">
          {modo === "taxa" && <PainelTaxa passos={passos} m={m} eta={eta} bateGerador={bateGerador} />}
          {modo === "arvores" && <PainelArvore passos={passos} m={m} eta={eta} />}
          {modo === "soma" && <PainelSoma passos={passos} m={m} eta={eta} p={p} />}
        </div>
      </div>
      <p className="vz-fonte">Pontos e conta do capítulo 6 (F₀ = média, tocos por soma de quadrados, F = F + η h). Com η = 0,5 os cortes são 4,5 · 7,5 · 2,5 · 5,5 e o erro cai de 10,1875 para 0,4485, os mesmos números do gerador em Python.</p>
    </figure>
  );
}

function caminhoEmDegraus(F: number[]): string {
  return F.map((f, i) => `${i ? "L" : "M"}${sx(X[i] - 0.5).toFixed(1)} ${sy(f).toFixed(1)} L${sx(X[i] + 0.5).toFixed(1)} ${sy(f).toFixed(1)}`).join("");
}

function PainelTaxa({ passos, m, eta, bateGerador }: { passos: PassoReg[]; m: number; eta: number; bateGerador: boolean }) {
  const max = passos[0].mse;
  return (
    <div className="vz-res-tabela">
      <p className="vz-grafico-t">Erro por etapa com η = {eta.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</p>
      <div className="vz-res-barras" role="img" aria-label="Erro quadrático médio por número de árvores">
        {passos.map((ps) => <div key={ps.m} className={`vz-res-barra ${ps.m === m ? "vz-res-barra--on" : ""} ${ps.m > m ? "vz-res-barra--futuro" : ""}`}>
          <span className="vz-res-barra-rot">{ps.m === 0 ? "F₀" : `${ps.m} árv.`}</span>
          <span className="vz-res-barra-trilho"><span className="vz-res-barra-fill" style={{ width: `${(ps.mse / max) * 100}%` }} /></span>
          <span className="vz-res-barra-val">{fmtNum(ps.mse, 4)}</span>
        </div>)}
      </div>
      <div className="vz-tiles vz-tiles--coluna">
        <div className="vz-tile"><p className="eyebrow">Redução acumulada após {m} {m === 1 ? "árvore" : "árvores"}</p><p className="vz-num">{fmtPct(1 - passos[m].mse / max, 1)}</p><p className="hint">{bateGerador ? "η = 0,5 é o valor do capítulo; confere com o gerador" : `com η = 0,5 seria ${fmtPct(1 - REF.mse[m] / REF.mse[0], 1)}`}</p></div>
        <div className="vz-tile"><p className="eyebrow">Por que não somar tudo</p><p className="vz-num vz-num--texto">{eta >= 0.95 ? "Com η = 1 a primeira árvore define quase todo o modelo." : eta <= 0.25 ? "Com η pequeno, cada árvore entra devagar: 4 árvores não bastam, mas nenhuma domina." : "Com η intermediário, nenhuma árvore isolada manda, e as seguintes ainda têm resíduo para trabalhar."}</p></div>
      </div>
    </div>
  );
}

function PainelArvore({ passos, m, eta }: { passos: PassoReg[]; m: number; eta: number }) {
  const ps = passos[m]; const ant = passos[Math.max(0, m - 1)];
  return (
    <div className="vz-res-tabela">
      <p className="vz-grafico-t">{m === 0 ? "Antes de qualquer árvore: só o palpite" : `O que a árvore ${m} propôs, já multiplicado por η = ${eta.toLocaleString("pt-BR")}`}</p>
      <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>x</th><th>y</th><th>antes</th><th>resíduo</th><th>η × árvore</th><th>depois</th></tr></thead>
        <tbody>{X.map((x, i) => <tr key={x}><td>{x}</td><td>{fmtNum(Y[i], 1)}</td><td>{fmtNum(m ? ant.F[i] : ps.F[i], 2)}</td><td className={ps.res[i] > 0 ? "vz-t-baixo" : "vz-t-alto"}>{fmtNum(m ? ps.res[i] : Y[i] - ps.F[i], 2)}</td><td>{m ? fmtNum(eta * ps.h[i], 2) : "—"}</td><td><b>{fmtNum(ps.F[i], 2)}</b></td></tr>)}</tbody></table></div>
      <div className="vz-tiles vz-tiles--coluna">
        <div className="vz-tile"><p className="eyebrow">Erro {m ? `antes → depois da árvore ${m}` : "com o palpite"}</p><p className="vz-num">{m ? <>{fmtNum(ant.mse, 4)} → {fmtNum(ps.mse, 4)}</> : fmtNum(ps.mse, 4)}</p><p className="hint">{m === 1 ? "A primeira árvore separa os quatro primeiros dos quatro últimos: a correção mais grosseira e a que mais reduz o erro." : m ? "As seguintes trabalham sobre um resíduo já menor: cada árvore corrige uma região." : "F₀ é a média de y: o melhor constante em erro quadrático."}</p></div>
      </div>
    </div>
  );
}

function PainelSoma({ passos, m, eta, p }: { passos: PassoReg[]; m: number; eta: number; p: number }) {
  const parcelas = passos.map((ps) => ({ m: ps.m, valor: ps.m ? eta * ps.h[p] : ps.F[p], acumulado: ps.F[p] }));
  const alvo = Y[p]; const escala = 14;
  return (
    <div className="vz-res-tabela">
      <p className="vz-grafico-t">Previsão para x = {X[p]} como soma de parcelas <span className="hint">clique em outro ponto no gráfico</span></p>
      <div className="vz-res-soma" role="img" aria-label={`Parcelas da previsão para x = ${X[p]}`}>
        {parcelas.slice(0, m + 1).map((q) => <div key={q.m} className="vz-res-soma-linha">
          <span className="vz-res-soma-rot">{q.m === 0 ? "palpite F₀" : `árvore ${q.m}`}</span>
          <span className="vz-res-soma-trilho">
            {q.m === 0 ? <span className="vz-res-soma-base" style={{ width: `${(q.valor / escala) * 100}%` }} /> : <span className={`vz-res-soma-parcela ${q.valor >= 0 ? "vz-res-soma-parcela--mais" : "vz-res-soma-parcela--menos"}`} style={{ left: `${(Math.min(q.acumulado, q.acumulado - q.valor) / escala) * 100}%`, width: `${(Math.abs(q.valor) / escala) * 100}%` }} />}
            <span className="vz-res-soma-alvo" style={{ left: `${(alvo / escala) * 100}%` }} />
          </span>
          <span className="vz-res-soma-val">{q.m === 0 ? fmtNum(q.valor, 2) : `${q.valor >= 0 ? "+" : ""}${fmtNum(q.valor, 2)}`}</span>
          <span className="vz-res-soma-acum">= {fmtNum(q.acumulado, 2)}</span>
        </div>)}
      </div>
      <div className="vz-tiles">
        <div className="vz-tile"><p className="eyebrow">Observado</p><p className="vz-num">{fmtNum(alvo, 2)}</p></div>
        <div className="vz-tile"><p className="eyebrow">Previsão após {m} {m === 1 ? "árvore" : "árvores"}</p><p className="vz-num">{fmtNum(passos[m].F[p], 2)}</p><p className="hint">erro de {fmtNum(alvo - passos[0].F[p], 2)} para {fmtNum(alvo - passos[m].F[p], 2)}</p></div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { boostingClassificacao, folhasReg, rastro, rotuloCorteReg, type NoReg, type PassoClf } from "@/lib/visuais/boosting";
import { BETA_AULA, escore, sigmoide, type Proposta } from "@/lib/visuais/logistica";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { crescer, folhas as folhasClf } from "@/lib/visuais/arvore";

/**
 * A perda que cai (capítulo 6). Boosting de classificação nas 16 propostas didáticas, na escala de log odds: a cada
 * árvore o plano utilização × atraso ganha as regiões de correção, a PD de cada proposta se move e a perda cai.
 * Modos: alvo (c6p12, o resíduo y − p como alvo), iteracoes (c6p13, árvore por árvore) e rastro (c6p14, a PD de uma
 * proposta como soma das parcelas). Os números batem com o gerador em η = 0,4, profundidade 2 e folha mínima 2.
 */
export type ModoPerda = "alvo" | "iteracoes" | "rastro";
const BASE = did.base as Proposta[];
const PW = 420, PH = 340, PML = 46, PMR = 12, PMT = 12, PMB = 40;
const px = (u: number) => PML + (u / 100) * (PW - PML - PMR);
const py = (a: number) => PMT + (1 - a / 60) * (PH - PMT - PMB);
const REF = [0.6931, 0.6219, 0.563, 0.515, 0.4748]; const LOGISTICA = 0.43282;

export function PerdaQueCai({ modo = "iteracoes" }: { modo?: ModoPerda }) {
  const [eta, setEta] = useState(0.4);
  const [m, setM] = useState(modo === "rastro" ? 4 : 1);
  const [foco, setFoco] = useState(11); // proposta #12
  const [tocando, setTocando] = useState(false);
  const passos = useMemo(() => boostingClassificacao(BASE, eta, 4), [eta]);
  useEffect(() => {
    if (!tocando) return;
    const id = setTimeout(() => { if (m >= 4) setTocando(false); else setM(m + 1); }, 1400);
    return () => clearTimeout(id);
  }, [tocando, m]);
  const ps = passos[m]; const ant = passos[Math.max(0, m - 1)];
  const folhas = ps.arvore ? folhasReg(ps.arvore) : [];
  const caixas = ps.arvore ? caixasDaArvore(ps.arvore) : [];
  const bate = Math.abs(eta - 0.4) < 1e-9;
  const y = BASE.map((b) => b.y);

  return (
    <figure className="vz" data-vz={`perda-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A perda que cai · 16 propostas, log odds, árvores de profundidade 2 · o gerador da aula</p>
          <p className="vz-tit">{modo === "alvo" ? "O alvo da próxima árvore é y − p: quem já está bem previsto quase não pesa na correção." : modo === "iteracoes" ? "O mesmo procedimento de cinco linhas, agora em classificação: a perda cai a cada árvore somada." : "A PD final de uma proposta é rastreável: F₀ mais quatro parcelas em log odds, e a logística no fim."}</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => { setM(0); setTocando(true); }} disabled={tocando}>{tocando ? "Somando árvores…" : "Reproduzir do início"}</button>
        </div>
      </header>
      <div className="vz-estado"><b>{m === 0 ? "Só F₀ = log odds da prevalência (50%, logo zero): toda PD em 50%." : `Árvore ${m} de 4.`}</b> Perda {m ? <>{fmtNum(ant.perda, 4)} → {fmtNum(ps.perda, 4)}, queda de {fmtNum(ant.perda - ps.perda, 4)}</> : fmtNum(ps.perda, 4)}. η = {eta.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}. {m > 0 && ps.arvore?.corte && <>Raiz em {rotuloCorteReg(ps.arvore.corte.v, ps.arvore.corte.valor)}; {folhas.length} folhas, cada uma com a correção média do grupo.</>}</div>
      <div className="vz-perda-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Plano das variáveis <span className="hint">cor do ponto: desfecho · número: PD atual · regiões: correção da árvore {m || ""}</span></p>
          <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Dezesseis propostas e as regiões de correção da árvore ${m}`}>
            {caixas.map((c, i) => <rect key={i} x={px(c.u0)} y={py(c.a1)} width={px(c.u1) - px(c.u0)} height={py(c.a0) - py(c.a1)} className={`vz-perda-caixa ${c.valor > 1e-9 ? "vz-perda-caixa--sobe" : c.valor < -1e-9 ? "vz-perda-caixa--desce" : ""}`} style={{ opacity: Math.min(1, 0.15 + Math.abs(c.valor) * 1.4) }} />)}
            {[0, 20, 40, 60, 80, 100].map((u) => <g key={u}><line x1={px(u)} x2={px(u)} y1={py(0)} y2={py(60)} className="vz-grade" /><text x={px(u)} y={PH - PMB + 16} textAnchor="middle" className="vz-tick">{u}%</text></g>)}
            {[0, 15, 30, 45, 60].map((a) => <g key={a}><line x1={px(0)} x2={px(100)} y1={py(a)} y2={py(a)} className="vz-grade" /><text x={PML - 6} y={py(a) + 4} textAnchor="end" className="vz-tick">{a} d</text></g>)}
            <text x={px(50)} y={PH - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            {caixas.map((c, i) => <text key={`t${i}`} x={px((c.u0 + c.u1) / 2)} y={py(c.a1) + 14} textAnchor="middle" className="vz-perda-caixa-t">{c.valor >= 0 ? "+" : ""}{fmtNum(eta * c.valor, 2)}</text>)}
            {BASE.map((b, i) => { const abaixo = BASE.some((o, j) => j < i && Math.abs(px(o.util) - px(b.util)) < 30 && Math.abs(py(o.atraso) - py(b.atraso)) < 26); return <g key={b.id} className={modo === "rastro" ? "vz-res-clic" : undefined} onClick={modo === "rastro" ? () => setFoco(i) : undefined}>
              <circle cx={px(b.util)} cy={py(b.atraso)} r={modo === "rastro" && i === foco ? 11 : 9} className={`vz-dot-plano ${b.y ? "vz-dot-plano--default" : "vz-dot-plano--pagou"} ${modo === "rastro" && i === foco ? "vz-perda-dot--foco" : ""}`} />
              <text x={px(b.util) + (abaixo && b.atraso <= 5 ? 13 : 0)} y={py(b.atraso) + (abaixo ? (b.atraso <= 5 ? 4 : 22) : -12)} textAnchor={abaixo && b.atraso <= 5 ? "start" : "middle"} className="vz-perda-pd">{Math.round(ps.p[i] * 100)}%</text>
            </g>; })}
          </svg>
          <div className="vz-res-controles">
            <div className="vz-seg" role="group" aria-label="Etapa">
              {[0, 1, 2, 3, 4].map((k) => <button key={k} type="button" className={`vz-seg-b ${m === k ? "vz-seg-b--on" : ""}`} onClick={() => { setTocando(false); setM(k); }}>{k === 0 ? "F₀" : `árvore ${k}`}</button>)}
            </div>
            {modo === "iteracoes" && <label className="vz-slider"><span className="vz-slider-rotulo"><span>Taxa de aprendizagem η</span><span className="vz-slider-valor">{eta.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span></span>
              <input type="range" min={0.1} max={1} step={0.1} value={eta} onChange={(e) => setEta(Number(e.target.value))} /></label>}
          </div>
        </div>
        <div className="vz-perda-painel">
          {modo === "alvo" && <PainelAlvo ps={ps} y={y} />}
          {modo === "iteracoes" && <PainelIteracoes passos={passos} m={m} bate={bate} />}
          {modo === "rastro" && <PainelRastro passos={passos} m={m} eta={eta} i={foco} />}
        </div>
      </div>
      <p className="vz-fonte">Base didática de 16 propostas do capítulo 4. F₀ = ln(π ÷ (1 − π)); alvo y − p; árvore de regressão sobre o alvo com profundidade 2 e folha mínima 2; F = F + η h; PD = σ(F). Com η = 0,4 a perda é 0,6931 · 0,6219 · 0,5630 · 0,5150 · 0,4748, os números do gerador em Python; a logística do capítulo 4 chega a 0,4328 nesta base.</p>
    </figure>
  );
}

type Caixa = { u0: number; u1: number; a0: number; a1: number; valor: number };
function caixasDaArvore(no: NoReg, c = { u0: 0, u1: 100, a0: 0, a1: 60 }): Caixa[] {
  if (!no.corte || !no.esq || !no.dir) return [{ ...c, valor: no.valor }];
  const { v, valor } = no.corte;
  return v === 0
    ? [...caixasDaArvore(no.esq, { ...c, u1: valor }), ...caixasDaArvore(no.dir, { ...c, u0: valor })]
    : [...caixasDaArvore(no.esq, { ...c, a1: valor }), ...caixasDaArvore(no.dir, { ...c, a0: valor })];
}

function PainelAlvo({ ps, y }: { ps: PassoClf; y: number[] }) {
  const grad = y.map((v, i) => v - ps.p[i]);
  const ordem = grad.map((g, i) => i).sort((a, b) => Math.abs(grad[b]) - Math.abs(grad[a]));
  return (
    <div className="vz-res-tabela">
      <p className="vz-grafico-t">Alvo da próxima árvore, y − p, proposta por proposta <span className="hint">ordenado do maior ao menor</span></p>
      <div className="vz-res-barras vz-perda-alvos" role="img" aria-label="Resíduo y menos p por proposta">
        {ordem.map((i) => <div key={i} className="vz-res-barra">
          <span className="vz-res-barra-rot">#{BASE[i].id} · {y[i] ? "default" : "pagou"}</span>
          <span className="vz-res-barra-trilho vz-perda-trilho"><span className={`vz-perda-fill ${grad[i] >= 0 ? "vz-perda-fill--mais" : "vz-perda-fill--menos"}`} style={{ left: grad[i] >= 0 ? "50%" : `${50 - Math.abs(grad[i]) * 50}%`, width: `${Math.abs(grad[i]) * 50}%` }} /></span>
          <span className="vz-res-barra-val">{grad[i] >= 0 ? "+" : ""}{fmtNum(grad[i], 2)}</span>
        </div>)}
      </div>
      <div className="vz-tiles vz-tiles--coluna">
        <div className="vz-tile"><p className="eyebrow">Leitura</p><p className="vz-num vz-num--texto">{ps.m === 0 ? "Com toda PD em 50%, todo resíduo vale ±0,5: a primeira árvore trata todos por igual." : "Caso já bem previsto tem resíduo pequeno e pesa pouco na correção seguinte. Quem continua mal previsto puxa a árvore."}</p></div>
      </div>
    </div>
  );
}

function PainelIteracoes({ passos, m, bate }: { passos: PassoClf[]; m: number; bate: boolean }) {
  const W2 = 320, H2 = 170, ml = 44, mr = 10, mt = 12, mb = 28;
  const sx = (k: number) => ml + (k / 4) * (W2 - ml - mr); const sy = (v: number) => mt + (1 - (v - 0.4) / 0.32) * (H2 - mt - mb);
  const d = passos.map((p, k) => `${k ? "L" : "M"}${sx(k).toFixed(1)} ${sy(p.perda).toFixed(1)}`).join("");
  return (
    <div className="vz-res-tabela">
      <p className="vz-grafico-t">Perda logarítmica por árvore <span className="hint">linha tracejada: logística do capítulo 4</span></p>
      <svg viewBox={`0 0 ${W2} ${H2}`} role="img" aria-label="Perda por número de árvores" className="vz-perda-curva">
        {[0.4, 0.5, 0.6, 0.7].map((v) => <g key={v}><line x1={sx(0)} x2={sx(4)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ml - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
        {[0, 1, 2, 3, 4].map((k) => <text key={k} x={sx(k)} y={H2 - mb + 16} textAnchor="middle" className="vz-tick">{k === 0 ? "F₀" : k}</text>)}
        <line x1={sx(0)} x2={sx(4)} y1={sy(LOGISTICA)} y2={sy(LOGISTICA)} className="vz-corte" />
        <text x={sx(4)} y={sy(LOGISTICA) - 5} textAnchor="end" className="vz-tick vz-tick--ouro">logística 0,4328</text>
        <path d={d} className="vz-curva" />
        {passos.map((p, k) => <circle key={k} cx={sx(k)} cy={sy(p.perda)} r={k === m ? 6 : 4} className={k <= m ? "vz-perda-pt" : "vz-perda-pt vz-perda-pt--futuro"} />)}
      </svg>
      <div className="vz-tiles">
        <div className="vz-tile"><p className="eyebrow">Perda após {m} {m === 1 ? "árvore" : "árvores"}</p><p className="vz-num">{fmtNum(passos[m].perda, 4)}</p><p className="hint">{bate ? `gerador: ${fmtNum(REF[m], 4)}` : `com η = 0,4 seria ${fmtNum(REF[m], 4)}`}</p></div>
        <div className="vz-tile"><p className="eyebrow">Distância até a logística</p><p className="vz-num">{fmtNum(passos[m].perda - LOGISTICA, 4)}</p><p className="hint">quatro árvores ainda não chegam lá; mais árvores chegam, a página 16 mostra quantas</p></div>
      </div>
    </div>
  );
}

function PainelRastro({ passos, m, eta, i }: { passos: PassoClf[]; m: number; eta: number; i: number }) {
  const b = BASE[i]; const r = rastro(passos, i, eta).slice(0, m + 1);
  const pLog = sigmoide(escore(BETA_AULA, b.util, b.atraso).z);
  // árvore do capítulo 5 com os freios da aula (profundidade 2, folha mínima 2): frequência da folha da proposta
  const folhaArv = folhasClf(crescer(BASE, 2, 2)).find((f) => f.grupo.some((g) => g.id === b.id));
  const pArv = folhaArv ? folhaArv.d / folhaArv.n : 0.5;
  const escala = Math.max(0.8, ...r.map((q) => Math.abs(q.F))) * 1.15;
  return (
    <div className="vz-res-tabela">
      <p className="vz-grafico-t">Proposta #{b.id}: utilização {b.util}%, atraso {b.atraso} d, desfecho {b.y ? "default" : "pagou"} <span className="hint">clique em outra proposta no plano</span></p>
      <div className="vz-res-soma" role="img" aria-label={`Parcelas em log odds da proposta ${b.id}`}>
        {r.map((q) => <div key={q.m} className="vz-res-soma-linha">
          <span className="vz-res-soma-rot">{q.m === 0 ? "F₀" : `árvore ${q.m}`}</span>
          <span className="vz-res-soma-trilho vz-perda-trilho">
            <span className="vz-res-soma-alvo" style={{ left: "50%" }} />
            {q.m > 0 && <span className={`vz-res-soma-parcela ${q.parcela >= 0 ? "vz-res-soma-parcela--mais" : "vz-res-soma-parcela--menos"}`} style={{ left: `${50 + (Math.min(q.F, q.F - q.parcela) / escala) * 50}%`, width: `${(Math.abs(q.parcela) / escala) * 50}%` }} />}
          </span>
          <span className="vz-res-soma-val">{q.m === 0 ? fmtNum(q.parcela, 3) : `${q.parcela >= 0 ? "+" : ""}${fmtNum(q.parcela, 3)}`}</span>
          <span className="vz-res-soma-acum">{fmtNum(q.F, 3)} → PD {fmtPct(q.p, 1)}</span>
        </div>)}
      </div>
      <div className="vz-tiles">
        <div className="vz-tile"><p className="eyebrow">Boosting, {m} {m === 1 ? "árvore" : "árvores"}</p><p className="vz-num">{fmtPct(passos[m].p[i], 1)}</p></div>
        <div className="vz-tile"><p className="eyebrow">Logística do capítulo 4</p><p className="vz-num">{fmtPct(pLog, 1)}</p></div>
        <div className="vz-tile"><p className="eyebrow">Árvore do capítulo 5</p><p className="vz-num">{fmtPct(pArv, 1)}</p><p className="hint">{folhaArv ? `folha com ${folhaArv.d} de ${folhaArv.n}` : ""}</p></div>
      </div>
    </div>
  );
}

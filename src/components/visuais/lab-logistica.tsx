"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { ajusteDaAula, amostrar, DELTA_X, efeitoDezPontos, EXPERIMENTOS, fmtPp, fmtSinal, interpretar, JANELA, LIMITES, pd, ponto, retaEm, retaForaDoIntervalo, x50, type Modelo, type Reta } from "@/lib/visuais/lab-logistica";

/**
 * Laboratório de regressão logística (capítulo 4, c4p2): mova β₀, β₁ e a utilização e veja a curva, o ponto, z, odds,
 * PD, o efeito de +10 pp e a interpretação mudarem juntos. Modo "Comparar com a reta" sobrepõe a reta de mínimos
 * quadrados, com parâmetros próprios, sem passar pela logística. Ajuste da aula: as 16 propostas didáticas.
 * Todos os números vêm de src/lib/visuais/lab-logistica.ts; mover um coeficiente é exploração, não novo ajuste.
 */
const BASE = did.base as Proposta[];
const AULA = ajusteDaAula(BASE);
const W = 760, H = 420, ML = 64, MR = 22, MT = 20, MB = 54;
const sx = (x: number) => ML + ((x - JANELA.xMin) / (JANELA.xMax - JANELA.xMin)) * (W - ML - MR);
const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));
const igual = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const arred = (v: number, casas: number) => Math.round(v * 10 ** casas) / 10 ** casas;

/** Campo numérico em formato brasileiro (vírgula), sincronizado com o controle deslizante; aceita ponto ou vírgula ao digitar. */
function NumeroInput({ id, valor, onChange, min, max, step, casas }: { id: string; valor: number; onChange: (v: number) => void; min: number; max: number; step: number; casas: number }) {
  const mostrado = arred(valor, casas).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).replace("-", "−");
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado);
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); } // sincroniza com o controle deslizante sem efeito
  const aplicar = (t: string) => { const v = Number(t.replace(/\s|%/g, "").replace("−", "-").replace(",", ".")); if (t.trim() !== "" && Number.isFinite(v)) onChange(clamp(v, [min, max])); };
  return <input id={id} type="text" inputMode="decimal" value={texto} aria-valuemin={min} aria-valuemax={max} data-step={step} onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); }} onChange={(e) => { setTexto(e.target.value); aplicar(e.target.value); }} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); onChange(clamp(valor + step, [min, max])); } if (e.key === "ArrowDown") { e.preventDefault(); onChange(clamp(valor - step, [min, max])); } }} />;
}

function Controle({ rotulo, valor, onChange, min, max, step, unidade = "", casas = 2, id }: { rotulo: ReactNode; valor: number; onChange: (v: number) => void; min: number; max: number; step: number; unidade?: string; casas?: number; id: string }) {
  return (
    <div className="vz-lab-ctl">
      <label htmlFor={`${id}-n`} className="vz-lab-ctl-rot">{rotulo}</label>
      <input id={`${id}-r`} type="range" min={min} max={max} step={step} value={valor} onChange={(e) => onChange(Number(e.target.value))} aria-label={typeof rotulo === "string" ? rotulo : undefined} aria-valuetext={`${fmtNum(valor, casas)}${unidade}`} />
      <span className="vz-lab-ctl-num"><NumeroInput id={`${id}-n`} valor={valor} onChange={onChange} min={min} max={max} step={step} casas={casas} />{unidade && <span>{unidade}</span>}</span>
    </div>
  );
}

export function LabLogistica() {
  const [modelo, setModelo] = useState<Modelo>(AULA.logistica);
  const [reta, setReta] = useState<Reta>(AULA.reta);
  const [xSel, setXSel] = useState(0.6);
  const [modo, setModo] = useState<"logistica" | "reta">("logistica");
  const [mostrarEfeito, setMostrarEfeito] = useState(false);
  const [experimento, setExperimento] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [cheia, setCheia] = useState(false);
  const figRef = useRef<HTMLElement>(null); const svgRef = useRef<SVGSVGElement>(null);
  const arrastando = useRef(false);

  const exploratorio = !igual(modelo.beta0, AULA.logistica.beta0) || !igual(modelo.beta1, AULA.logistica.beta1) || !igual(reta.a, AULA.reta.a) || !igual(reta.b, AULA.reta.b);
  const yMin = modo === "reta" ? -0.25 : 0, yMax = modo === "reta" ? 1.25 : 1;
  const sy = useCallback((y: number) => MT + (1 - (y - yMin) / (yMax - yMin)) * (H - MT - MB), [yMin, yMax]);
  const caminho = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)} ${sy(Math.min(yMax + 0.5, Math.max(yMin - 0.5, p.y))).toFixed(1)}`).join("");
  const curva = useMemo(() => amostrar((x) => pd(modelo, x)), [modelo]);
  const linha = useMemo(() => amostrar((x) => retaEm(reta, x), JANELA, 2), [reta]);
  const pt = ponto(modelo, xSel); const efeito = efeitoDezPontos(modelo, xSel); const cruz = x50(modelo); const fora = retaForaDoIntervalo(reta);
  const frases = interpretar(modelo, AULA.logistica, xSel, exploratorio);
  const exp = EXPERIMENTOS.find((e) => e.id === experimento) ?? null;

  const definirX = (x: number) => setXSel(clamp(arred(x, 2), LIMITES.util));
  const xDoEvento = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current; if (!svg) return null; const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W; return JANELA.xMin + ((vx - ML) / (W - ML - MR)) * (JANELA.xMax - JANELA.xMin);
  };
  const aoApertar = (e: PointerEvent<SVGSVGElement>) => { const x = xDoEvento(e); if (x === null) return; arrastando.current = true; svgRef.current?.setPointerCapture(e.pointerId); definirX(x); };
  const aoMover = (e: PointerEvent<SVGSVGElement>) => { if (!arrastando.current) return; const x = xDoEvento(e); if (x !== null) definirX(x); };
  const aoSoltar = (e: PointerEvent<SVGSVGElement>) => { arrastando.current = false; svgRef.current?.releasePointerCapture(e.pointerId); };
  const teclado = (e: KeyboardEvent<SVGGElement>) => {
    const passo = e.shiftKey ? 0.1 : 0.01;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); definirX(xSel + passo); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); definirX(xSel - passo); }
    if (e.key === "Home") { e.preventDefault(); definirX(LIMITES.util[0]); } if (e.key === "End") { e.preventDefault(); definirX(LIMITES.util[1]); }
  };
  const restaurar = () => { setModelo(AULA.logistica); setReta(AULA.reta); setExperimento(null); setRevelado(false); };
  const rodar = (id: string) => {
    const ex = EXPERIMENTOS.find((e) => e.id === id)!; const r = ex.aplicar(AULA.logistica, modelo);
    setModelo(r.modelo); if (r.x !== undefined) setXSel(r.x); if (r.efeito) setMostrarEfeito(true); setExperimento(id); setRevelado(false);
  };
  useEffect(() => { const f = () => setCheia(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);
  const telaCheia = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void figRef.current?.requestFullscreen?.(); };

  const tipX = sx(pt.x) > W * 0.62 ? sx(pt.x) - 232 : sx(pt.x) + 14; const tipY = Math.max(MT + 4, Math.min(sy(pt.p) - 62, H - MB - 60));
  const tip = `Utilização ${fmtPct(pt.x, 0)} · z ${fmtNum(pt.z, 2)} · odds ${fmtNum(pt.odds, 2)} · PD ${fmtPct(pt.p, 1)}`;
  const x2 = xSel + DELTA_X;
  return (
    <figure className={`vz vz-lab ${cheia ? "vz-lab--cheia" : ""}`} data-vz="lab-logistica" ref={figRef}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Laboratório · regressão logística · x = utilização em proporção (70% = 0,70) · 16 propostas didáticas</p>
          <p className="vz-tit">Como os parâmetros mudam a probabilidade de default?</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Modo">
          <button type="button" className={`btn btn-sm ${modo === "logistica" ? "" : "btn-secondary"}`} onClick={() => setModo("logistica")} aria-pressed={modo === "logistica"}>Explorar a logística</button>
          <button type="button" className={`btn btn-sm ${modo === "reta" ? "" : "btn-secondary"}`} onClick={() => setModo("reta")} aria-pressed={modo === "reta"}>Comparar com a reta</button>
          <button type="button" className="btn btn-sm btn-ghost vz-lab-cheia" onClick={telaCheia}>{cheia ? "Sair da tela cheia" : "Tela cheia"}</button>
        </div>
      </header>
      <div className={`vz-estado ${exploratorio ? "vz-estado--alterado" : "vz-estado--ok"}`} aria-live="polite">
        <b>Utilização {fmtPct(pt.x, 0)}: z = {fmtNum(pt.z, 3)}, odds {fmtNum(pt.odds, 2)}, PD {fmtPct(pt.p, 1)}.</b> {efeito.disponivel ? `Mais 10 pp: PD de ${fmtPct(efeito.de, 1)} para ${fmtPct(efeito.para, 1)}, ${fmtPp(efeito.deltaPp)}.` : "Mais 10 pp sairia da janela de 120%: efeito não mostrado."} <span className="vz-lab-badge">{exploratorio ? "Parâmetros exploratórios" : "Ajuste da aula"}</span>
      </div>
      <div className="vz-lab-grade">
        <div className="vz-grafico vz-lab-graf">
          <p className="vz-grafico-t">Probabilidade de default por utilização do limite <span className="hint">{modo === "reta" ? "logística contínua em verde, reta tracejada em vermelho; faixas fora de 0% a 100% sombreadas" : "escalas fixas: 0% a 120% de utilização, 0% a 100% de PD"}</span></p>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva logística com β₀ ${fmtNum(modelo.beta0, 2)} e β₁ ${fmtNum(modelo.beta1, 2)}; ${tip}`} onPointerDown={aoApertar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar} style={{ touchAction: "none", cursor: "ew-resize" }}>
            {modo === "reta" && <><rect x={sx(0)} y={sy(1.25)} width={sx(1.2) - sx(0)} height={sy(1) - sy(1.25)} className="vz-fora" /><rect x={sx(0)} y={sy(0)} width={sx(1.2) - sx(0)} height={sy(-0.25) - sy(0)} className="vz-fora" /></>}
            {(modo === "reta" ? [-0.25, 0, 0.25, 0.5, 0.75, 1, 1.25] : [0, 0.25, 0.5, 0.75, 1]).map((v) => <g key={v}><line x1={sx(0)} x2={sx(1.2)} y1={sy(v)} y2={sy(v)} className={v === 0 || v === 1 ? "vz-zero" : "vz-grade"} /><text x={ML - 8} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v, 0)}</text></g>)}
            {[0, 0.2, 0.4, 0.6, 0.8, 1, 1.2].map((u) => <g key={u}><line x1={sx(u)} x2={sx(u)} y1={sy(yMax)} y2={sy(yMin)} className="vz-grade" /><text x={sx(u)} y={H - MB + 18} textAnchor="middle" className="vz-tick">{fmtPct(u, 0)}</text></g>)}
            <text x={sx(1.2)} y={H - 8} textAnchor="end" className="vz-rotulo">utilização do limite</text>
            {modo === "reta" && <text x={sx(0.01)} y={sy(1.25) + 13} className="vz-tick vz-tick--default">acima de 100%: nenhuma probabilidade chega aqui</text>}
            {modo === "reta" && <text x={sx(0.01)} y={sy(-0.25) - 5} className="vz-tick vz-tick--default">abaixo de 0%: nenhuma probabilidade chega aqui</text>}
            {BASE.map((b) => <circle key={b.id} cx={sx(b.util / 100)} cy={sy(b.y)} r={5.5} className={`vz-dot-plano ${b.y ? "vz-dot-plano--default" : "vz-dot-plano--pagou"}`}><title>{`Proposta ${b.id}: utilização ${b.util}%, ${b.y ? "deu default (y = 1)" : "pagou (y = 0)"}`}</title></circle>)}
            {modo === "reta" && <path d={caminho(linha)} className="vz-lab-reta" />}
            {modo === "reta" && fora.foraDoGrafico && <text x={sx(1.19)} y={retaEm(reta, 1.2) > 1.25 ? sy(1.25) + 26 : sy(-0.25) - 18} textAnchor="end" className="vz-tick vz-tick--default">a reta continua fora do gráfico</text>}
            <path d={caminho(curva)} className="vz-lab-log" />
            {cruz !== null && cruz >= JANELA.xMin && cruz <= JANELA.xMax && <g><line x1={sx(cruz)} x2={sx(cruz)} y1={sy(0.5)} y2={sy(yMin)} className="vz-lab-guia" /><polygon points={`${sx(cruz)},${sy(yMin) + 2} ${sx(cruz) - 6},${sy(yMin) + 11} ${sx(cruz) + 6},${sy(yMin) + 11}`} className="vz-lab-x50" /><text x={sx(cruz) < W * 0.75 ? sx(cruz) + 10 : sx(cruz) - 10} y={H - 8} textAnchor={sx(cruz) < W * 0.75 ? "start" : "end"} className="vz-tick vz-tick--forte">x₅₀ = {fmtPct(cruz, 1)}: a curva cruza 50%</text></g>}
            <line x1={sx(pt.x)} x2={sx(pt.x)} y1={sy(pt.p)} y2={sy(yMin)} className="vz-lab-guia" /><line x1={sx(0)} x2={sx(pt.x)} y1={sy(pt.p)} y2={sy(pt.p)} className="vz-lab-guia" />
            {mostrarEfeito && efeito.disponivel && <g className="vz-lab-efeito-g">
              <line x1={sx(x2)} x2={sx(x2)} y1={sy(efeito.para)} y2={sy(yMin)} className="vz-lab-guia" /><line x1={sx(x2)} x2={sx(x2) + 30} y1={sy(efeito.para)} y2={sy(efeito.para)} className="vz-lab-guia" /><line x1={sx(x2)} x2={sx(x2) + 30} y1={sy(efeito.de)} y2={sy(efeito.de)} className="vz-lab-guia" />
              <line x1={sx(x2) + 24} x2={sx(x2) + 24} y1={sy(efeito.de)} y2={sy(efeito.para)} className="vz-lab-delta" />
              <text x={sx(x2) + 30} y={Math.abs(sy(efeito.de) - sy(efeito.para)) < 18 ? Math.min(sy(efeito.de), sy(efeito.para)) - 10 : sy((efeito.de + efeito.para) / 2) + 4} className="vz-tick vz-tick--forte vz-lab-delta-t">{fmtPp(efeito.deltaPp)}</text>
              <circle cx={sx(x2)} cy={sy(efeito.para)} r={7} className="vz-lab-ponto2" />
            </g>}
            <g role="slider" tabIndex={0} aria-label="Utilização selecionada" aria-valuemin={0} aria-valuemax={120} aria-valuenow={Math.round(xSel * 100)} aria-valuetext={tip} onKeyDown={teclado} className="vz-lab-ponto-g"><circle cx={sx(pt.x)} cy={sy(pt.p)} r={13} className="vz-lab-alvo" /><circle cx={sx(pt.x)} cy={sy(pt.p)} r={8} className="vz-lab-ponto" /></g>
            <g className="vz-lab-tip" transform={`translate(${tipX}, ${tipY})`}><rect width={218} height={44} rx={6} /><text x={10} y={18}>Utilização {fmtPct(pt.x, 0)} · PD {fmtPct(pt.p, 1)}</text><text x={10} y={36}>z {fmtNum(pt.z, 2)} · odds {fmtNum(pt.odds, 2)}</text></g>
          </svg>
          <div className="vz-legenda vz-lab-legenda">
            <span><i className="vz-sw vz-sw--ok" /> regressão logística</span>{modo === "reta" && <span><i className="vz-sw vz-sw--reta" /> reta de mínimos quadrados</span>}
            <span><i className="vz-sw vz-sw--default" /> deu default (y = 1)</span><span><i className="vz-sw vz-sw--pagou" /> pagou (y = 0)</span>
            <label className="vz-lab-check"><input type="checkbox" checked={mostrarEfeito} onChange={(e) => setMostrarEfeito(e.target.checked)} /> Mostrar efeito de +10 pp</label>
          </div>
          <p className="vz-lab-eq" aria-label="Equação com os coeficientes atuais">z = {fmtSinal(modelo.beta0)} {modelo.beta1 < 0 ? "−" : "+"} {fmtNum(Math.abs(modelo.beta1), 2)} · x <span className="vz-lab-eq-sep">e</span> PD = 1 ÷ (1 + e<sup>−z</sup>){modo === "reta" && <> <span className="vz-lab-eq-sep">reta:</span> <span className="vz-lab-eq-reta">p̂ = {fmtSinal(reta.a, 3)} {reta.b < 0 ? "−" : "+"} {fmtNum(Math.abs(reta.b), 3)} · x</span></>}</p>
          <p className="hint vz-lab-eq-hint">Os pontos em y = 0 e y = 1 são desfechos observados, rótulos das 16 propostas; não são probabilidades individuais.</p>
        </div>
        <div className="vz-lab-painel">
          <p className="vz-lab-painel-t">Explore os parâmetros</p>
          <Controle id="b0" rotulo={<>Intercepto β<sub>0</sub></>} valor={modelo.beta0} onChange={(v) => { setModelo((m) => ({ ...m, beta0: clamp(v, LIMITES.beta0) })); setExperimento(null); }} min={LIMITES.beta0[0]} max={LIMITES.beta0[1]} step={0.01} />
          <Controle id="b1" rotulo={<>Coeficiente β<sub>1</sub></>} valor={modelo.beta1} onChange={(v) => { setModelo((m) => ({ ...m, beta1: clamp(v, LIMITES.beta1) })); setExperimento(null); }} min={LIMITES.beta1[0]} max={LIMITES.beta1[1]} step={0.01} />
          <Controle id="util" rotulo="Utilização selecionada" valor={xSel * 100} onChange={(v) => definirX(v / 100)} min={0} max={120} step={1} unidade="%" casas={0} />
          <div className="vz-lab-res">
            <p className="eyebrow">PD estimada</p>
            <p className="vz-num vz-lab-pd">{fmtPct(pt.p, 1)}</p>
            <dl className="vz-lab-kv"><div><dt>Escore z</dt><dd>{fmtNum(pt.z, 3)}</dd></div><div><dt>Odds</dt><dd>{fmtNum(pt.odds, 2)}</dd></div></dl>
          </div>
          <div className={`vz-tile ${efeito.disponivel ? "vz-tile--ok" : "vz-tile--alerta"} vz-lab-efeito`}>
            <p className="eyebrow">Mais 10 pp de utilização, parâmetros fixos</p>
            {efeito.disponivel ? <>
              <p className="vz-num vz-lab-efeito-n">{fmtPct(efeito.de, 1)} → {fmtPct(efeito.para, 1)}</p>
              <p className="vz-lab-efeito-d">{fmtPp(efeito.deltaPp)} na PD · odds × {fmtNum(efeito.multOdds, 2)}</p>
              <p className="hint">Diferença finita exata p(x + 0,10) − p(x). Derivada local β₁·p(1 − p) = {fmtNum(Math.abs(efeito.derivada) < 0.005 ? 0 : efeito.derivada, 2)} por unidade de x (100 pp): cerca de {fmtPp(efeito.aproxPpPor1pp, 2)} por 1 pp, só perto deste ponto.</p>
            </> : <p className="hint">Com utilização em {fmtPct(xSel, 0)}, x + 0,10 ultrapassa a janela de 120%. O efeito não é mostrado para não extrapolar em silêncio.</p>}
          </div>
          <button type="button" className="btn btn-sm btn-secondary" onClick={restaurar}>Restaurar ajuste da aula</button>
          {modo === "reta" && (
            <details className="vz-lab-reta-ctl">
              <summary>Reta de comparação: a e b</summary>
              <p className="hint">Parâmetros próprios, independentes de β₀ e β₁. A previsão da reta não passa pela função logística e não é truncada: p̂ = a + b·x.</p>
              <Controle id="ra" rotulo="Intercepto a" valor={reta.a} onChange={(v) => setReta((r) => ({ ...r, a: clamp(v, LIMITES.a) }))} min={LIMITES.a[0]} max={LIMITES.a[1]} step={0.001} casas={3} />
              <Controle id="rb" rotulo="Inclinação b" valor={reta.b} onChange={(v) => setReta((r) => ({ ...r, b: clamp(v, LIMITES.b) }))} min={LIMITES.b[0]} max={LIMITES.b[1]} step={0.001} casas={3} />
              <p className="hint">{fora.cruzaZero !== null && fora.cruzaZero >= 0 && fora.cruzaZero <= 1.2 ? `Negativa ${reta.b > 0 ? "abaixo" : "acima"} de ${fmtPct(fora.cruzaZero, 1)} de utilização. ` : ""}{fora.cruzaUm !== null && fora.cruzaUm >= 0 && fora.cruzaUm <= 1.2 ? `Acima de 100% a partir de ${fmtPct(fora.cruzaUm, 1)}. ` : ""}{!fora.abaixo && !fora.acima ? "Dentro de 0% a 100% nesta janela, o que não a torna uma probabilidade: fora da janela ela continua reta." : ""}</p>
            </details>
          )}
        </div>
      </div>
      <div className="vz-lab-faixa" aria-live="polite">
        <p className="eyebrow">Interpretação do cenário</p>
        <ul className="vz-lab-frases">{frases.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </div>
      <div className="vz-lab-exp">
        <p className="eyebrow">Experimentos guiados</p>
        <div className="vz-lab-exp-botoes">{EXPERIMENTOS.map((e) => <button key={e.id} type="button" className={`btn btn-sm ${experimento === e.id ? "" : "btn-secondary"}`} onClick={() => rodar(e.id)} aria-pressed={experimento === e.id}>{e.rotulo}</button>)}</div>
      </div>
      {exp && (
        <div className="vz-lab-perg">
          <div><p className="vz-lab-perg-k">Pergunta para a turma</p><p className="vz-lab-perg-t">{exp.pergunta}</p>{revelado && <p className="vz-lab-perg-r">{exp.explicar(AULA.logistica, modelo)}</p>}</div>
          <button type="button" className="btn btn-sm btn-secondary vz-lab-revelar" onClick={() => setRevelado((v) => !v)}>{revelado ? "Ocultar explicação" : "Revelar explicação"}</button>
        </div>
      )}
      <p className="vz-fonte">Ajuste da aula sobre as 16 propostas didáticas, só com utilização e x em proporção: reta de mínimos quadrados a = {fmtSinal(AULA.reta.a, 6)} e b = {fmtSinal(AULA.reta.b, 6)}; logística por máxima verossimilhança, sem penalização, β₀ = {fmtSinal(AULA.logistica.beta0, 6)} e β₁ = {fmtSinal(AULA.logistica.beta1, 6)}. Mover um controle explora parâmetros e não reestima nada; a base observada não muda. Arraste o ponto no gráfico, use as setas do teclado ou o controle de utilização.</p>
    </figure>
  );
}

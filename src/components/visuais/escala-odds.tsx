"use client";
import { useEffect, useRef, useState } from "react";
import { ATALHOS, complementar, contaOdds, curvaOdds, escalaVertical, esperados, fmtLn, fmtOdds, fmtP, FAIXA_SLIDER, leituraIntuitiva, NOTA_ODDS, oddsDeP, PD_INICIAL, ponteLog, REFERENCIAS, validarOdds, validarPd, type Validacao } from "@/lib/visuais/escala-odds";

/**
 * Escala 2, odds (capítulo 4, c4p4). A mesma PD lida como razão entre defaults e adimplentes esperados: três resultados
 * conectados, a função odds(p) = p ÷ (1 − p) desenhada de verdade, a conversão nos dois sentidos, a comparação entre p e
 * 1 − p e a ponte para log odds, revelada pelo professor no palco. Contas em src/lib/visuais/escala-odds.ts.
 */
const W = 720, H = 400, ML = 56, MR = 24, MT = 26, MB = 50;
const sx = (p: number) => ML + p * (W - ML - MR);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pl = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Campo de texto validado, sincronizado com o estado sem ciclos: enquanto se edita, o texto é do usuário. */
function Campo({ id, rotulo, mostrado, validar, onValor, sufixo }: { id: string; rotulo: string; mostrado: string; validar: (t: string) => Validacao; onValor: (v: number) => void; sufixo?: string }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [msg, setMsg] = useState<{ tipo: "erro" | "aviso"; texto: string } | null>(null);
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); }
  const aplicar = (t: string) => { const r = validar(t); if (r.ok) { onValor(r.valor); setMsg(r.aviso ? { tipo: "aviso", texto: r.aviso } : null); } else setMsg({ tipo: "erro", texto: r.erro }); };
  return (
    <div className="vz-eo-campo">
      <label htmlFor={id}>{rotulo}</label>
      <span className="vz-eo-campo-in"><input id={id} type="text" inputMode="decimal" value={texto} aria-invalid={msg?.tipo === "erro"} aria-describedby={`${id}-msg`} onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); if (msg?.tipo === "erro") setMsg(null); }} onChange={(e) => { setTexto(e.target.value); aplicar(e.target.value); }} />{sufixo && <span>{sufixo}</span>}</span>
      <p id={`${id}-msg`} className={`vz-eo-msg ${msg ? `vz-eo-msg--${msg.tipo}` : ""}`} aria-live="polite">{msg?.texto ?? ""}</p>
    </div>
  );
}

export function EscalaOdds({ palco = false }: { palco?: boolean }) {
  const [p, setP] = useState(PD_INICIAL);
  const [comparar, setComparar] = useState(!palco);
  const [log, setLog] = useState(!palco);
  const [ajustar, setAjustar] = useState(false);
  const [cheia, setCheia] = useState(false);
  const figRef = useRef<HTMLElement>(null);
  const o = oddsDeP(p); const e = esperados(p); const lei = leituraIntuitiva(p); const comp = complementar(p); const lg = ponteLog(p);
  const esc = escalaVertical(o, ajustar); const yMax = esc.yMax;
  const sy = (v: number) => MT + (1 - clamp(v, 0, yMax) / yMax) * (H - MT - MB);
  const curva = curvaOdds(yMax).map((q, i) => `${i ? "L" : "M"}${sx(q.p).toFixed(1)} ${sy(q.o).toFixed(1)}`).join("");
  const foraDaFaixa = p < FAIXA_SLIDER[0] || p > FAIXA_SLIDER[1];
  const restaurar = () => { setP(PD_INICIAL); setComparar(!palco); setLog(!palco); setAjustar(false); };
  useEffect(() => { const f = () => setCheia(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);
  const telaCheia = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void figRef.current?.requestFullscreen?.(); };
  const pontoVisivel = o !== null && o <= yMax; const oddsTxt = fmtOdds(o);
  const tipX = sx(p) > W * 0.6 ? sx(p) - 214 : sx(p) + 14; const tipY = pontoVisivel ? clamp(sy(o!) - (o! < yMax * 0.3 ? 100 : 58), MT + 2, H - MB - 46) : MT + 2;
  const refsVisiveis = REFERENCIAS.filter((r) => Math.abs(r - p) > (pontoVisivel ? 0.005 : 0.08) && r / (1 - r) <= yMax); // fora da janela, a marcação do ponto ocupa o alto: some a referência vizinha
  const ticks = [0, 1, ...Array.from({ length: 4 }, (_, i) => (yMax / 4) * (i + 1))].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <figure className="vz vz-eo" data-vz="escala-odds" ref={figRef}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Regressão logística / Escala 2: odds · contagens esperadas no mesmo horizonte</p>
          <p className="vz-tit">Odds: o mesmo risco, expresso como uma razão.</p>
          <p className="vz-eo-sub">A PD compara defaults com o total. As odds comparam defaults com adimplentes.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className={`btn btn-sm ${comparar ? "" : "btn-secondary"}`} aria-pressed={comparar} onClick={() => setComparar((v) => !v)}>Comparar p e 1 − p</button>
          <button type="button" className={`btn btn-sm ${log ? "" : "btn-secondary"}`} aria-pressed={log} onClick={() => setLog((v) => !v)}>Por que usar o logaritmo?</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={restaurar}>Restaurar</button>
          <button type="button" className="btn btn-sm btn-ghost vz-eo-cheia" onClick={telaCheia}>{cheia ? "Sair da tela cheia" : "Tela cheia"}</button>
        </div>
      </header>
      <div className={`vz-estado ${o === null || foraDaFaixa ? "vz-estado--alterado" : "vz-estado--ok"}`} aria-live="polite">
        <b>PD {fmtP(p, 2)}: {contaOdds(p)}.</b> {lei.frase} {pl(e.defaults, "default", "defaults")} e {pl(e.adimplentes, "adimplente esperado", "adimplentes esperados")} em 100 operações.{foraDaFaixa && " Valor fora da faixa do controle deslizante, mantido como digitado."}
      </div>
      <div className="vz-eo-topo" role="list" aria-label="Três resultados conectados">
        <div className="vz-eo-res" role="listitem"><p className="vz-eo-res-k">Probabilidade</p><p className="vz-eo-res-v vz-eo-res-v--p">{fmtP(p, 2)}</p><p className="vz-eo-res-l">{pl(e.defaults, "default esperado", "defaults esperados")} em 100 operações</p></div>
        <span className="vz-eo-seta" aria-hidden="true">→</span>
        <div className="vz-eo-res" role="listitem"><p className="vz-eo-res-k vz-eo-res-k--odds">Odds</p><p className="vz-eo-res-v vz-eo-res-v--odds">{oddsTxt}</p><p className="vz-eo-res-l">{o === null ? "sem adimplentes esperados para dividir" : `${pl(e.defaults, "default", "defaults")} para ${pl(e.adimplentes, "adimplente", "adimplentes")}`}</p></div>
        <span className="vz-eo-seta" aria-hidden="true">→</span>
        <div className="vz-eo-res" role="listitem"><p className="vz-eo-res-k vz-eo-res-k--leitura">Leitura intuitiva</p><p className="vz-eo-res-v vz-eo-res-v--leitura">{lei.razao}</p><p className="vz-eo-res-l">{lei.frase}</p></div>
      </div>
      <div className="vz-eo-controles">
        <label className="vz-slider vz-eo-slider"><span className="vz-slider-rotulo"><b>Probabilidade de default</b> <span className="vz-slider-valor">{fmtP(p, 2)}</span></span>
          <input type="range" min={1} max={99} step={1} value={clamp(Math.round(p * 100), 1, 99)} onChange={(ev) => setP(Number(ev.target.value) / 100)} aria-label="Probabilidade de default" aria-valuetext={fmtP(p, 2)} /></label>
        <Campo id="eo-pd" rotulo="PD, em %" mostrado={(p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} validar={validarPd} onValor={setP} sufixo="%" />
        <Campo id="eo-odds" rotulo="Odds" mostrado={o === null ? "∞" : o.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} validar={validarOdds} onValor={setP} />
        <div className="vz-eo-atalhos" role="group" aria-label="Atalhos de PD">{ATALHOS.map((a) => <button key={a} type="button" className={`btn btn-sm ${Math.abs(a - p) < 1e-9 ? "" : "btn-secondary"}`} aria-pressed={Math.abs(a - p) < 1e-9} onClick={() => setP(a)}>{fmtP(a)}</button>)}</div>
      </div>
      <div className="vz-eo-grade">
        <div className="vz-grafico vz-eo-graf">
          <p className="vz-grafico-t">Odds não têm teto em 1 <span className="hint">odds(p) = p ÷ (1 − p), eixo vertical {esc.ajustada ? `ajustado a ${fmtOdds(yMax)}` : "fixo de 0 a 20"}</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Odds em função da PD; em ${fmtP(p, 2)} as odds são ${oddsTxt}`}>
            {ticks.map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className={v === 0 ? "vz-zero" : "vz-grade"} /><text x={ML - 8} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtOdds(v)}</text></g>)}
            {[0, 0.2, 0.5, 0.8, 1].map((v) => <text key={v} x={sx(v)} y={H - MB + 18} textAnchor="middle" className="vz-tick">{fmtP(v)}</text>)}
            <text x={sx(0.5)} y={H - 8} textAnchor="middle" className="vz-rotulo">probabilidade de default</text>
            <line x1={sx(1)} x2={sx(1)} y1={MT} y2={H - MB} className="vz-eo-assintota" />
            <text x={sx(1) - 8} y={sy(0) - 8} textAnchor="end" className="vz-tick vz-eo-roxo">p → 1: odds → ∞</text>
            <path d={curva} className="vz-eo-curva" />
            {refsVisiveis.map((r) => { const ro = r / (1 - r); const esq = r >= 0.8; const lx = esq ? sx(r) - 14 : sx(r) + 14; const ly = esq ? sy(ro) + 4 : sy(ro) - 16; return <g key={r}>{!esq && <line x1={sx(r)} y1={sy(ro) - 4} x2={lx - 2} y2={ly + 2} className="vz-eo-guia" />}<circle cx={sx(r)} cy={sy(ro)} r={4.5} className="vz-eo-ref" /><text x={lx} y={ly} textAnchor={esq ? "end" : "start"} className="vz-tick vz-tick--forte">{fmtP(r)} → {fmtOdds(ro)}</text></g>; })}
            {pontoVisivel && <>
              <line x1={sx(p)} x2={sx(p)} y1={sy(o!)} y2={sy(0)} className="vz-eo-guia" /><line x1={sx(0)} x2={sx(p)} y1={sy(o!)} y2={sy(o!)} className="vz-eo-guia" />
              <circle cx={sx(p)} cy={sy(o!)} r={8} className="vz-eo-ponto" />
              <g className="vz-eo-tip" transform={`translate(${tipX}, ${tipY})`}><rect width={200} height={44} rx={6} /><text x={10} y={18}>PD {fmtP(p, 2)} → odds {oddsTxt}</text><text x={10} y={36}>{lei.razao}</text></g>
            </>}
            {!pontoVisivel && o !== null && <g><line x1={sx(p)} x2={sx(p)} y1={sy(0)} y2={MT + 18} className="vz-eo-guia" /><polygon points={`${sx(p)},${MT + 4} ${sx(p) - 7},${MT + 18} ${sx(p) + 7},${MT + 18}`} className="vz-eo-ponto" /><text x={sx(p) - 12} y={MT + 16} textAnchor="end" className="vz-tick vz-tick--forte vz-eo-roxo">fora da janela: odds {oddsTxt}</text></g>}
            {o === null && <text x={sx(1) - 6} y={MT + 30} textAnchor="end" className="vz-tick vz-tick--default">p = 100%: nenhum ponto finito</text>}
          </svg>
          <div className="vz-eo-graf-rod">
            <p className="hint">Quando p se aproxima de 1, as odds crescem sem limite. A curva é a função verdadeira, sem aproximação visual.</p>
            {(esc.fora || esc.ajustada) && <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAjustar((v) => !v)}>{esc.ajustada ? "Voltar à escala fixa de 0 a 20" : `Ajustar escala para ver odds ${oddsTxt}`}</button>}
          </div>
        </div>
        <div className="vz-eo-lado">
          <p className="vz-eo-k">A conversão é reversível</p>
          <div className="vz-eo-formulas">
            <p className="vz-eo-f"><span className="vz-eo-roxo">odds</span> = <span className="vz-eo-frac"><span>p</span><span>1 − p</span></span></p>
            <p className="vz-eo-f">p = <span className="vz-eo-frac"><span>odds</span><span>1 + odds</span></span></p>
          </div>
          <p className="hint">Trocar de escala preserva a informação: {fmtP(p, 2)} e odds {oddsTxt} dizem a mesma coisa.</p>
          <div className={`vz-eo-comp ${comparar ? "" : "vz-eo-oculto"}`} aria-hidden={!comparar} data-testid="comparacao">
            <p className="vz-eo-k">Probabilidades complementares, odds recíprocas</p>
            <div className="vz-eo-comp-grade">
              <div><p className="vz-eo-comp-p">{fmtP(p, 2)}</p><p className="vz-eo-comp-o">odds {fmtOdds(comp.odds)}</p></div>
              <div><p className="vz-eo-comp-p">50%</p><p className="vz-eo-comp-o">odds 1</p></div>
              <div><p className="vz-eo-comp-p">{fmtP(comp.pc, 2)}</p><p className="vz-eo-comp-o">odds {fmtOdds(comp.oddsC)}</p></div>
            </div>
            <p className="vz-eo-comp-rel">{comp.coincidem ? "Em 50% os dois valores coincidem: odds = 1." : comp.produto !== null ? `${fmtOdds(comp.odds)} × ${fmtOdds(comp.oddsC)} = ${comp.produto.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}` : "Nos extremos uma das odds não tem valor finito; o produto não se define."} <b>Probabilidades complementares produzem odds recíprocas.</b></p>
            <p className="hint">A escala comprime 0% a 50% em odds de 0 a 1 e expande 50% a 100% em odds de 1 a infinito. A comparação é entre o evento e o seu complemento na mesma operação, não entre dois grupos observados de clientes.</p>
          </div>
        </div>
      </div>
      <div className={`vz-eo-faixa ${log ? "" : "vz-eo-oculto"}`} aria-hidden={!log} data-testid="faixa-log">
        <div>
          <p className="vz-eo-faixa-k">Próxima escala: log odds</p>
          <p className="vz-eo-faixa-t">O logaritmo transforma razões recíprocas em valores simétricos em torno de zero.</p>
          <p className="vz-eo-faixa-l">{lg.simetrico ? `ln(odds(1 − p)) = −ln(odds(p)) para ${fmtP(p, 2)}. ` : ""}Só a ponte: o capítulo continua na página seguinte.</p>
        </div>
        <div className="vz-eo-ln">
          <p>ln({fmtOdds(comp.odds)}) {Number.isFinite(lg.lnP) ? "≈" : "→"} {fmtLn(lg.lnP)}</p>
          <p>ln(1) = 0</p>
          <p>ln({fmtOdds(comp.oddsC)}) {Number.isFinite(lg.lnC) ? "≈" : "→"} {fmtLn(lg.lnC)}</p>
        </div>
      </div>
      <div className="vz-eo-rodape"><span className="hint">Exemplo ilustrativo; contagens esperadas no mesmo horizonte, não resultados garantidos. Odds é p ÷ (1 − p); razão de odds compara duas odds; risco relativo compara duas probabilidades. A transformação para odds, sozinha, não especifica um modelo.</span><b className="vz-eo-nota">{NOTA_ODDS}</b></div>
    </figure>
  );
}

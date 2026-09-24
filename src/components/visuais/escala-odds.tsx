"use client";
import { useState } from "react";
import { ATALHOS, cartoes, comparacao, curvaOdds, esperados, fmtOdds, fmtP, FORMULAS, leituraIntuitiva, oddsDeP, PD_INICIAL, REFERENCIAS, RODAPE, ROTULO_ATALHOS, ROTULO_COMPARAR, SUBTITULO, TITULO, TITULO_CTL, TITULO_GRAF, TITULO_LEITURAS, validarOdds, validarPd, Y_MAX_PADRAO, type Validacao } from "@/lib/visuais/escala-odds";
import { Tex } from "./tex";

/**
 * Slide 4 do capítulo 4 (c4p4): a escala de odds, na gramática do c4p2. Quadro 16:9 no sistema .rl: as duas conversões
 * em KaTeX na faixa; à esquerda, a função odds(p) desenhada de verdade, sem teto perto de 100%; ao centro, a mesma PD em
 * três leituras ligadas (probabilidade, odds e a razão por extenso); à direita, o painel com a conversão nos dois
 * sentidos. "Comparar p e 1 − p" põe o complemento no gráfico e mostra as odds recíprocas e, no logaritmo, simétricas.
 * Contas em src/lib/visuais/escala-odds.ts.
 */
const CARTOES = cartoes();
const pl = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/**
 * Campo de texto validado, sincronizado com o estado sem ciclos: enquanto se edita, o texto é do usuário. A mensagem de
 * erro fica até o valor mudar: se sumisse no blur, deslocaria o painel embaixo do clique que tirou o foco do campo.
 */
function Campo({ id, rotulo, mostrado, validar, onValor, sufixo }: { id: string; rotulo: string; mostrado: string; validar: (t: string) => Validacao; onValor: (v: number) => void; sufixo?: string }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [msg, setMsg] = useState<{ tipo: "erro" | "aviso"; texto: string } | null>(null);
  // valor mudado de fora (atalho, controle deslizante, restaurar): o campo acompanha e o aviso antigo sai
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); setMsg(null); }
  const aplicar = (t: string) => { const r = validar(t); if (r.ok) { onValor(r.valor); setMsg(r.aviso ? { tipo: "aviso", texto: r.aviso } : null); } else setMsg({ tipo: "erro", texto: r.erro }); };
  return (
    <div className="eo-campo">
      <label htmlFor={id}>{rotulo}</label>
      <span className="eo-campo-in"><input id={id} type="text" inputMode="decimal" value={texto} aria-invalid={msg?.tipo === "erro"} aria-describedby={`${id}-msg`}
        onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); setUltimo(mostrado); }}
        onChange={(e) => { setTexto(e.target.value); aplicar(e.target.value); }} />{sufixo && <span>{sufixo}</span>}</span>
      <p id={`${id}-msg`} className={`eo-msg ${msg ? `eo-msg--${msg.tipo}` : ""}`} aria-live="polite">{msg?.texto ?? ""}</p>
    </div>
  );
}

/** A função odds(p) numa janela fixa de 0 a 20: a curva, as referências, o ponto escolhido e, sob demanda, o complemento. */
const W = 640, H = 430, ML = 62, MR = 26, MT = 26, MB = 58, YM = Y_MAX_PADRAO;
const sx = (p: number) => ML + p * (W - ML - MR);
const sy = (o: number) => MT + (1 - Math.min(Math.max(o, 0), YM) / YM) * (H - MT - MB);
const CURVA = curvaOdds(YM).map((q, i) => `${i ? "L" : "M"}${sx(q.p).toFixed(1)} ${sy(q.o).toFixed(1)}`).join("");

function Rotulo({ p, o, cls }: { p: number; o: number; cls: string }) {
  const esq = p >= 0.6, x = sx(p), y = sy(o);
  const ty = o < 3 ? y - 22 : y + 7;
  return <text x={esq ? x - 16 : x + (o < 3 ? 0 : 16)} y={ty} textAnchor={esq ? "end" : o < 3 ? "middle" : "start"} className={cls}>{fmtP(p, 2)} → {fmtOdds(o)}</text>;
}

function Grafico({ p, comparar }: { p: number; comparar: boolean }) {
  const o = oddsDeP(p), pc = 1 - p, oc = oddsDeP(pc);
  const dentro = o !== null && o <= YM, compDentro = comparar && oc !== null && oc <= YM && Math.abs(pc - p) > 1e-9;
  // fora da janela, a marcação do ponto ocupa o alto do gráfico: saem as referências de lá
  const refs = REFERENCIAS.filter((r) => Math.abs(r - p) > 0.02 && !(comparar && Math.abs(r - pc) < 0.02) && !(o !== null && !dentro && r >= 0.9));
  const aria = o === null ? `Em PD ${fmtP(p, 2)} as odds não têm valor finito.` : `Em PD ${fmtP(p, 2)} as odds são ${fmtOdds(o)}.`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="eo-svg" role="img" aria-label={`Odds em função da PD, de 0% a 100%, com a janela vertical de 0 a ${YM}. ${aria}`}>
      {[0, 5, 10, 15, 20].map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className={v === 0 ? "eo-zero" : "eo-grade"} /><text x={ML - 10} y={sy(v) + 6} textAnchor="end" className="eo-tick">{v}</text></g>)}
      <line x1={sx(0)} x2={sx(1)} y1={sy(1)} y2={sy(1)} className="eo-um" /><text x={ML - 10} y={sy(1) - 4} textAnchor="end" className="eo-tick eo-tick--um">1</text>
      {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={sx(v)} y={H - MB + 26} textAnchor="middle" className={`eo-tick ${v === 0 ? "eo-tick--ini" : v === 1 ? "eo-tick--fim" : ""}`}>{fmtP(v)}</text>)}
      <text x={sx(0.5)} y={H - 6} textAnchor="middle" className="eo-eixo-t">probabilidade de default</text>
      <line x1={sx(1)} x2={sx(1)} y1={MT} y2={sy(0)} className="eo-assintota" />
      <text x={sx(1) - 4} y={MT - 8} textAnchor="end" className="eo-assintota-t">odds → ∞</text>
      <path d={CURVA} className="eo-curva" />
      {refs.map((r) => { const ro = r / (1 - r); return <g key={r}><circle cx={sx(r)} cy={sy(ro)} r={6} className="eo-ref" /><Rotulo p={r} o={ro} cls="eo-ref-t" /></g>; })}
      {compDentro && <g className="eo-comp-p"><circle cx={sx(pc)} cy={sy(oc!)} r={9} /><Rotulo p={pc} o={oc!} cls="eo-comp-t" /></g>}
      {dentro && <g className="eo-sel">
        <line x1={sx(p)} x2={sx(p)} y1={sy(o!)} y2={sy(0)} className="eo-guia" /><line x1={sx(0)} x2={sx(p)} y1={sy(o!)} y2={sy(o!)} className="eo-guia" />
        <circle cx={sx(p)} cy={sy(o!)} r={10} className="eo-ponto" /><Rotulo p={p} o={o!} cls="eo-ponto-t" />
      </g>}
      {o !== null && !dentro && <g className="eo-sel">
        <line x1={sx(p)} x2={sx(p)} y1={sy(0)} y2={MT + 18} className="eo-guia" /><path d={`M${sx(p)} ${MT + 2} l-9 16 h18 z`} className="eo-ponto" />
        <text x={sx(p) - 16} y={MT + 20} textAnchor="end" className="eo-ponto-t">acima da janela: odds {fmtOdds(o)}</text>
      </g>}
      {o === null && <text x={sx(1) - 12} y={MT + 26} textAnchor="end" className="eo-ponto-t">PD 100%: sem odds finitas</text>}
    </svg>
  );
}

export function EscalaOdds({ pagina }: { pagina?: { index: number; total: number } }) {
  const [p, setP] = useState(PD_INICIAL);
  const [comparar, setComparar] = useState(false);
  const o = oddsDeP(p), e = esperados(p), lei = leituraIntuitiva(p);
  const restaurar = () => { setP(PD_INICIAL); setComparar(false); };
  return (
    <figure className="vz rl eo" data-vz="escala-odds">
      <section className="rl-slide" data-tela="4">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Odds"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="eo-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="eo-eq-k">{f.k}</p><Tex f={f.tex} className="eo-eq-f" /></div>)}
        </div>

        <div className="rl-corpo eo-corpo">
          <div className="eo-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="eo-svg-wrap"><Grafico p={p} comparar={comparar} /></div>
          </div>

          <div className="eo-leituras">
            <p className="rl-k">{TITULO_LEITURAS}</p>
            <ol className="eo-cadeia" aria-live="polite">
              <li className="eo-elo eo-elo--p"><p className="eo-elo-k">Probabilidade</p><p className="eo-elo-v">{fmtP(p, 2)}</p><p className="eo-elo-l">{pl(e.defaults, "default", "defaults")} em 100 operações</p></li>
              <li className="eo-elo eo-elo--o"><p className="eo-elo-k">Odds</p><p className="eo-elo-v">{fmtOdds(o)}</p><p className="eo-elo-l">{o === null ? "sem adimplentes para dividir" : `${pl(e.defaults, "default", "defaults")} para ${pl(e.adimplentes, "adimplente", "adimplentes")}`}</p></li>
              <li className="eo-elo eo-elo--l"><p className="eo-elo-k">Por extenso</p><p className="eo-elo-v">{lei.razao}</p><p className="eo-elo-l">{lei.frase}</p></li>
            </ol>
          </div>

          <aside className="eo-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="eo-ctl-topo">
              <label htmlFor="eo-range"><b>PD:</b> {fmtP(p, 2)}</label>
              <div className="eo-atalhos" role="group" aria-label="Atalhos de PD">
                <span>{ROTULO_ATALHOS}</span>
                {ATALHOS.map((a) => { const on = Math.abs(a - p) < 1e-9; return <button key={a} type="button" className={`rl-btn rl-btn--mini ${on ? "rl-btn--on" : ""}`} aria-pressed={on} onClick={() => setP(a)}>{fmtP(a)}</button>; })}
              </div>
            </div>
            <input id="eo-range" type="range" min={1} max={99} step={1} value={Math.min(99, Math.max(1, Math.round(p * 100)))} onChange={(ev) => setP(Number(ev.target.value) / 100)} aria-valuetext={`${fmtP(p, 2)}: odds ${fmtOdds(o)}`} />
            <div className="eo-campos">
              <Campo id="eo-pd" rotulo="PD, em %" mostrado={(p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} validar={validarPd} onValor={setP} sufixo="%" />
              <Campo id="eo-odds" rotulo="Odds" mostrado={o === null ? "∞" : o.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} validar={validarOdds} onValor={setP} />
            </div>
            <div className="eo-acoes">
              <button type="button" className={`rl-btn rl-btn--mini ${comparar ? "rl-btn--on" : ""}`} aria-pressed={comparar} onClick={() => setComparar((v) => !v)}>{ROTULO_COMPARAR}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            {comparar && <div className="eo-comp" aria-live="polite">{comparacao(p).map((t) => <p key={t}>{t}</p>)}</div>}
          </aside>
        </div>

        <div className="eo-cartoes">
          {CARTOES.map((c) => <div key={c.k}><p className="eo-cartao-k">{c.k}</p><p className="eo-cartao-t">{c.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}


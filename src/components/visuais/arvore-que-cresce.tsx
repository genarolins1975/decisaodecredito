"use client";
import { useEffect, useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { NOME_VAR, VARIAVEIS, avaliarCorte, comparaNo, cortesCandidatos, crescer, errosNaAmostra, folhas, rotuloCorte, todosOsCandidatos, wilson, type Mudanca, type No, type Variavel } from "@/lib/visuais/arvore";

/**
 * A árvore que cresce (capítulo 5). As 16 propostas no plano; a árvore nasce corte a corte e cada corte desenha uma
 * partição. Um corte candidato pode ser avaliado com toda a conta na tela; os dois freios (profundidade e mínimo por
 * folha) e a retirada de uma proposta mostram a instabilidade da estrutura. Três páginas usam a mesma peça.
 */
const BASE = did.base as Proposta[];
export type ModoArvore = "raiz" | "freios" | "instabilidade";
const PW = 420, PH = 360, PML = 50, PMR = 14, PMT = 14, PMB = 42;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR); const sa = (a: number) => PMT + (1 - a / 40) * (PH - PMT - PMB);

export function ArvoreQueCresce({ modo = "raiz" }: { modo?: ModoArvore }) {
  const [profMax, setProfMax] = useState(modo === "raiz" ? 1 : 2);
  const [minFolha, setMinFolha] = useState(modo === "freios" ? 2 : 1);
  const [removida, setRemovida] = useState<number | null>(null);
  const [crescendo, setCrescendo] = useState(false);
  const [varCand, setVarCand] = useState<Variavel>("util");
  const [idxCand, setIdxCand] = useState(8); // 62,5% de utilização, o exemplo da página c5p6
  const base = useMemo(() => BASE.filter((p) => p.id !== removida), [removida]);
  const arvore = useMemo(() => crescer(base, profMax, minFolha), [base, profMax, minFolha]);
  const referencia = useMemo(() => crescer(BASE, 2, 1), []);
  const fs = folhas(arvore); const erros = errosNaAmostra(arvore); const menor = Math.min(...fs.map((f) => f.n));
  const piorIntervalo = Math.max(...fs.map((f) => { const w = wilson(f.d, f.n); return w.hi - w.lo; }));
  const candidatos = useMemo(() => todosOsCandidatos(base), [base]);
  const cortesVar = useMemo(() => cortesCandidatos(base, varCand), [base, varCand]);
  const idx = Math.min(idxCand, cortesVar.length - 1);
  const cand = useMemo(() => avaliarCorte(base, varCand, cortesVar[idx]), [base, varCand, cortesVar, idx]);
  const melhor = candidatos.reduce((m, a) => (a.ganho > m.ganho + 1e-12 ? a : m), candidatos[0]);
  const segundo = candidatos.filter((a) => a !== melhor).reduce((m, a) => (a.ganho > m.ganho ? a : m), candidatos.find((a) => a !== melhor)!);

  useEffect(() => {
    if (!crescendo) return;
    const alvo = modo === "raiz" ? 3 : 4;
    if (profMax >= alvo) { const t = setTimeout(() => setCrescendo(false), 0); return () => clearTimeout(t); }
    const t = setTimeout(() => setProfMax((v) => v + 1), 950);
    return () => clearTimeout(t);
  }, [crescendo, profMax, modo]);

  const LEITURA: Record<Mudanca, string> = { igual: "igual à base completa", "mesma divisão": "mesma divisão da base completa", "mudou o corte": "mudou o corte", "trocou de variável": "trocou de variável", "ficou sem corte": "a base completa corta aqui", "ganhou corte": "a base completa não corta aqui" };
  const mudanca = (no?: No, ref?: No) => (modo === "instabilidade" && no ? ` · ${LEITURA[comparaNo(no, ref)]}` : "");
  const titulo = modo === "freios" ? "Ajuste os dois freios e veja a árvore obedecer." : modo === "instabilidade" ? "Retire uma proposta. A raiz resiste; o nó direito, não." : "Deixe a árvore crescer. Cada corte é o vencedor de uma disputa.";

  return (
    <figure className="vz" data-vz={`arvore-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A árvore que cresce · Gini · 16 propostas didáticas{removida ? ` · sem a #${removida}` : ""}</p>
          <p className="vz-tit">{titulo}</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => { if (profMax >= (modo === "raiz" ? 3 : 4)) setProfMax(0); setCrescendo((v) => !v); }} aria-pressed={crescendo}>{crescendo ? "Pausar" : "Deixar a árvore crescer"}</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setCrescendo(false); setProfMax(modo === "raiz" ? 1 : 2); setMinFolha(modo === "freios" ? 2 : 1); setRemovida(null); }}>Árvore de referência</button>
        </div>
      </header>

      <div className="vz-arv-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Plano das variáveis <span className="hint">{profMax === 0 ? "raiz sem corte: 16 propostas, Gini 0,5000" : `${fs.length} folhas · clique numa proposta para retirá-la`}</span></p>
          <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Dezesseis propostas no plano utilização por atraso, partição em ${fs.length} folhas`}>
            {fs.map((f, i) => { const x = su(f.caixa.u0), y = sa(f.caixa.a1), w = su(f.caixa.u1) - x, h = sa(f.caixa.a0) - y; const pd = f.n ? f.d / f.n : 0; return (
              <g key={`${f.caixa.u0}-${f.caixa.u1}-${f.caixa.a0}-${f.caixa.a1}`} className="vz-arv-folha" style={{ animationDelay: `${i * 60}ms` }}>
                <rect x={x} y={y} width={w} height={h} className="vz-arv-rect" style={{ fill: pd >= 0.5 ? "var(--color-alert)" : "#9db6de", fillOpacity: 0.12 + Math.abs(pd - 0.5) * 0.5 }} />
                {w > 96 && h > 30 ? <text x={x + 6} y={y + 14} className="vz-arv-rot">{f.n} · {f.d} def · PD {fmtPct(pd)}</text> : w > 34 && h > 30 ? <text x={x + 4} y={y + 14} className="vz-arv-rot">{fmtPct(pd)}</text> : null}
              </g>
            ); })}
            <Cortes no={arvore} />
            {[0, 20, 40, 60, 80, 100].map((u) => <text key={u} x={su(u)} y={PH - PMB + 16} textAnchor="middle" className="vz-tick">{u}%</text>)}
            {[0, 10, 20, 30, 40].map((a) => <text key={a} x={PML - 6} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a}</text>)}
            <text x={su(50)} y={PH - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            <text transform={`translate(12 ${sa(20)}) rotate(-90)`} textAnchor="middle" className="vz-rotulo">maior atraso em 6 meses, dias</text>
            {modo === "raiz" && (varCand === "util" ? <line x1={su(cand.corte)} x2={su(cand.corte)} y1={sa(0)} y2={sa(40)} className="vz-arv-cand" /> : <line x1={su(0)} x2={su(100)} y1={sa(cand.corte)} y2={sa(cand.corte)} className="vz-arv-cand" />)}
            {BASE.map((b) => <g key={b.id} className={`vz-front-ponto ${b.y ? "vz-front-ponto--default" : "vz-front-ponto--pagou"} ${b.id === removida ? "vz-front-ponto--fora" : ""}`} style={{ transform: `translate(${su(b.util)}px, ${sa(b.atraso)}px)`, cursor: "pointer" }} onClick={() => { setCrescendo(false); setRemovida(removida === b.id ? null : b.id); }} role="button" tabIndex={0} aria-label={`${b.id === removida ? "Devolver" : "Retirar"} a proposta ${b.id}`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRemovida(removida === b.id ? null : b.id); } }}><circle r={9} /><text y={4} textAnchor="middle" className="vz-front-id">{b.id}</text></g>)}
          </svg>
          <div className="vz-legenda"><span><i className="vz-sw vz-sw--default" /> deu default</span><span><i className="vz-sw vz-sw--pagou" /> pagou</span><span><i className="vz-sw vz-sw--fora" /> retirada da base</span>{modo === "raiz" && <span><i className="vz-sw vz-sw--cand" /> corte candidato em avaliação</span>}</div>
        </div>

        <div className="vz-arv-painel">
          <Diagrama no={arvore} />
          <div className="vz-arv-controles">
            <label className="vz-slider"><span className="vz-slider-rotulo"><b>Profundidade máxima</b> <span className="vz-slider-valor">{profMax}</span></span>
              <input type="range" min={0} max={4} step={1} value={profMax} onChange={(e) => { setCrescendo(false); setProfMax(Number(e.target.value)); }} aria-valuetext={`${profMax}`} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><b>Mínimo de propostas por folha</b> <span className="vz-slider-valor">{minFolha}</span></span>
              <input type="range" min={1} max={4} step={1} value={minFolha} onChange={(e) => setMinFolha(Number(e.target.value))} aria-valuetext={`${minFolha}`} /></label>
            <label className="text-[.95em]"><b>Proposta retirada da base</b>
              <select className="select mt-1" value={removida ?? ""} onChange={(e) => { setCrescendo(false); setRemovida(e.target.value ? Number(e.target.value) : null); }}>
                <option value="">nenhuma, base completa</option>{BASE.map((b) => <option key={b.id} value={b.id}>#{b.id} · utilização {b.util}% · atraso {b.atraso} d · {b.y ? "default" : "pagou"}</option>)}
              </select></label>
          </div>
          <div className="vz-tiles" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Raiz escolhida</p><p className="vz-num vz-num--texto">{arvore.corte ? rotuloCorte(arvore.corte.v, arvore.corte.valor) : "sem corte"}</p><p className="hint">{arvore.corte ? `ganho ${fmtNum(arvore.corte.ganho, 5)}` : "profundidade zero"}{arvore.corte ? mudanca(arvore, referencia) : ""}</p></div>
            <div className="vz-tile"><p className="eyebrow">Divisão do nó direito</p><p className="vz-num vz-num--texto">{arvore.dir?.corte ? rotuloCorte(arvore.dir.corte.v, arvore.dir.corte.valor) : "folha"}</p><p className="hint">{arvore.dir?.corte ? `ganho ${fmtNum(arvore.dir.corte.ganho, 5)}` : "sem corte neste nível"}{mudanca(arvore.dir, referencia.dir)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Folhas · erros nas {base.length}</p><p className="vz-num">{fs.length} <span className="hint">·</span> {erros}</p><p className="hint">menor folha com {menor} proposta{menor > 1 ? "s" : ""}</p></div>
            <div className="vz-tile"><p className="eyebrow">Pior intervalo de folha</p><p className={`vz-num ${piorIntervalo > 0.6 ? "vz-num--default" : ""}`}>{fmtPct(piorIntervalo)}</p><p className="hint">largura do intervalo de Wilson a 95% na folha menos confiável</p></div>
          </div>
        </div>
      </div>

      <div className="vz-arv-cand-bloco">
        <div className="vz-arv-cand-cab">
          <p className="vz-grafico-t">Avaliar um corte candidato <span className="hint">os candidatos são os pontos médios entre valores consecutivos</span></p>
          <div className="vz-seg" role="group" aria-label="Variável do corte candidato">
            {VARIAVEIS.map((v) => <button key={v} type="button" className={`vz-seg-b ${v === varCand ? "vz-seg-b--on" : ""}`} aria-pressed={v === varCand} onClick={() => { setVarCand(v); setIdxCand(0); }}>{NOME_VAR[v]}</button>)}
          </div>
        </div>
        <div className="vz-arv-cand-grade">
          <div>
            <label className="vz-slider"><span className="vz-slider-rotulo"><b>Ponto de corte</b> <span className="vz-slider-valor">{rotuloCorte(varCand, cand.corte)}</span></span>
              <input type="range" min={0} max={Math.max(0, cortesVar.length - 1)} step={1} value={idx} onChange={(e) => setIdxCand(Number(e.target.value))} aria-valuetext={rotuloCorte(varCand, cand.corte)} /></label>
            <div className="table-wrap"><table className="table text-[.85em] mt-2"><thead><tr><th>Lado</th><th>Propostas</th><th>Defaults</th><th>Proporção</th><th>Gini</th></tr></thead>
              <tbody>
                <tr><th scope="row">≤ corte</th><td>{cand.esq.length}</td><td>{cand.esq.reduce((s, p) => s + p.y, 0)}</td><td>{fmtPct(cand.esq.length ? cand.esq.reduce((s, p) => s + p.y, 0) / cand.esq.length : 0, 1)}</td><td>{fmtNum(cand.giniEsq, 5)}</td></tr>
                <tr><th scope="row">&gt; corte</th><td>{cand.dir.length}</td><td>{cand.dir.reduce((s, p) => s + p.y, 0)}</td><td>{fmtPct(cand.dir.length ? cand.dir.reduce((s, p) => s + p.y, 0) / cand.dir.length : 0, 1)}</td><td>{fmtNum(cand.giniDir, 5)}</td></tr>
                <tr><th scope="row">ganho</th><td colSpan={4}>{fmtNum(cand.giniAntes, 5)} − ({cand.esq.length} ÷ {base.length} × {fmtNum(cand.giniEsq, 4)} + {cand.dir.length} ÷ {base.length} × {fmtNum(cand.giniDir, 4)}) = <b>{fmtNum(cand.ganho, 5)}</b>{cand.v === melhor.v && cand.corte === melhor.corte ? " · é o melhor corte da raiz" : ` · o melhor é ${rotuloCorte(melhor.v, melhor.corte)} com ${fmtNum(melhor.ganho, 5)}`}</td></tr>
              </tbody></table></div>
          </div>
          <Ganhos candidatos={candidatos} atual={cand} melhor={melhor} segundo={segundo} />
        </div>
      </div>
      <figcaption className="vz-fonte">Ganho = Gini antes − média ponderada do Gini dos dois lados. Na base completa a raiz é utilização ≤ 57,5% com ganho 0,28125; o corte vizinho, utilização ≤ 52,5%, fica em 0,19841 e o melhor corte de atraso, em 0,07143; no nó direito, utilização ≤ 87,5% e atraso ≤ 2,5 dias empatam em 0,09375 e a ordem de avaliação decide, por isso retirar a proposta #10 troca a variável. Empates são decididos avaliando utilização antes de atraso. Erros na amostra contam a folha prevendo o desfecho majoritário. Recalculado aqui.</figcaption>
    </figure>
  );
}

function Cortes({ no }: { no: No }) {
  if (!no.corte || !no.esq || !no.dir) return null;
  const c = no.caixa; const v = no.corte;
  return (
    <>
      {v.v === "util" ? <line x1={su(v.valor)} x2={su(v.valor)} y1={sa(c.a1)} y2={sa(c.a0)} className="vz-arv-corte" style={{ strokeWidth: 3 - no.prof * 0.6 }} /> : <line x1={su(c.u0)} x2={su(c.u1)} y1={sa(v.valor)} y2={sa(v.valor)} className="vz-arv-corte" style={{ strokeWidth: 3 - no.prof * 0.6 }} />}
      <Cortes no={no.esq} /><Cortes no={no.dir} />
    </>
  );
}

/** Diagrama da árvore: largura por folha, um nível por profundidade. */
function Diagrama({ no }: { no: No }) {
  const fs = folhas(no); const prof = Math.max(...fs.map((f) => f.prof)); const W = Math.max(440, fs.length * 108), LH = 74, H = (prof + 1) * LH + 10;
  let cursor = 0;
  type Pos = { x: number; y: number; n: No; filhos: Pos[] };
  const pos = (n: No): Pos => {
    if (!n.corte || !n.esq || !n.dir) { const x = (cursor + 0.5) * (W / fs.length); cursor++; return { x, y: n.prof * LH + 10, n, filhos: [] }; }
    const e = pos(n.esq), d = pos(n.dir); return { x: (e.x + d.x) / 2, y: n.prof * LH + 10, n, filhos: [e, d] };
  };
  const raiz = pos(no);
  const todos: Pos[] = []; const junta = (p: Pos) => { todos.push(p); p.filhos.forEach(junta); }; junta(raiz);
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">A árvore <span className="hint">{fs.length === 1 ? "só a raiz" : `${fs.length} folhas · profundidade ${prof}`}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Árvore com ${fs.length} folhas`}>
        {todos.map((p) => p.filhos.map((f, k) => <g key={`${p.x}-${k}`}><line x1={p.x} y1={p.y + 44} x2={f.x} y2={f.y} className="vz-arv-ramo" /><text x={p.x + (f.x - p.x) * 0.55 + (k ? 5 : -5)} y={p.y + 44 + (f.y - p.y - 44) * 0.55} textAnchor={k ? "start" : "end"} className="vz-tick">{k ? "não" : "sim"}</text></g>))}
        {todos.map((p) => { const n = p.n; const pd = n.n ? n.d / n.n : 0; const folha = !n.corte; const w = folha ? Math.min(104, W / fs.length - 6) : 150; return (
          <g key={`${p.x}-${p.y}`} className="vz-arv-no" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            <rect x={-w / 2} y={0} width={w} height={folha ? 40 : 44} rx={5} className={folha ? (pd >= 0.5 ? "vz-arv-caixa vz-arv-caixa--default" : "vz-arv-caixa vz-arv-caixa--pagou") : "vz-arv-caixa vz-arv-caixa--no"} />
            {folha ? <><text y={16} textAnchor="middle" className="vz-arv-t">{n.n} prop. · {n.d} def.</text><text y={32} textAnchor="middle" className="vz-arv-t vz-arv-t--pd">PD {fmtPct(pd)}</text></>
              : <><text y={17} textAnchor="middle" className="vz-arv-t vz-arv-t--var">{NOME_VAR[n.corte!.v]}</text><text y={34} textAnchor="middle" className="vz-arv-t">{n.corte!.v === "util" ? `≤ ${n.corte!.valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% ?` : `≤ ${n.corte!.valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dias ?`} · ganho {fmtNum(n.corte!.ganho, 3)}</text></>}
          </g>
        ); })}
      </svg>
    </div>
  );
}

function Ganhos({ candidatos, atual, melhor, segundo }: { candidatos: ReturnType<typeof todosOsCandidatos>; atual: ReturnType<typeof avaliarCorte>; melhor: ReturnType<typeof avaliarCorte>; segundo: ReturnType<typeof avaliarCorte> }) {
  const W = 560, H = 190, ML = 40, MR = 8, MT = 18, MB = 40; const max = Math.max(0.3, ...candidatos.map((c) => c.ganho));
  const bw = (W - ML - MR) / candidatos.length;
  const sy = (v: number) => MT + (1 - v / max) * (H - MT - MB);
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">A disputa: ganho de cada candidato <span className="hint">vencedor {rotuloCorte(melhor.v, melhor.corte)} com {fmtNum(melhor.ganho, 3)} · segundo {rotuloCorte(segundo.v, segundo.corte)} com {fmtNum(segundo.ganho, 3)}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Ganho de ${candidatos.length} cortes candidatos`}>
        {[0, 0.1, 0.2, 0.3].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 4} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
        {candidatos.map((c, i) => { const x = ML + i * bw; const ehAtual = c.v === atual.v && c.corte === atual.corte; const ehMelhor = c === melhor; return (
          <g key={`${c.v}-${c.corte}`}>
            <rect x={x + 1.5} y={sy(c.ganho)} width={bw - 3} height={sy(0) - sy(c.ganho)} rx={2} className={`vz-arv-barra ${c.v === "util" ? "vz-arv-barra--util" : "vz-arv-barra--atraso"} ${ehMelhor ? "vz-arv-barra--melhor" : ""} ${ehAtual ? "vz-arv-barra--atual" : ""}`} />
            {(ehAtual || ehMelhor) && <text x={x + bw / 2} y={sy(c.ganho) - 4} textAnchor="middle" className={ehMelhor ? "vz-ks-t" : "vz-ponto-t"}>{fmtNum(c.ganho, 3)}</text>}
            <text x={x + bw / 2} y={H - MB + 12} textAnchor="middle" className="vz-tick" style={{ fontSize: 8.5 }}>{c.corte.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</text>
          </g>
        ); })}
        <text x={ML + (candidatos.filter((c) => c.v === "util").length * bw) / 2} y={H - 8} textAnchor="middle" className="vz-rotulo">utilização, em %</text>
        <text x={ML + candidatos.filter((c) => c.v === "util").length * bw + (candidatos.filter((c) => c.v === "atraso").length * bw) / 2} y={H - 8} textAnchor="middle" className="vz-rotulo">atraso, em dias</text>
      </svg>
    </div>
  );
}

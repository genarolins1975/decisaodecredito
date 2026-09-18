"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { crescer, errosNaAmostra, folhas, rotuloCorte, wilson, type No } from "@/lib/visuais/arvore";
import type { Proposta } from "@/lib/visuais/logistica";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * A árvore que decora (capítulo 2, c2p14). Nas 16 propostas, aumentar a profundidade sempre reduz o erro na amostra,
 * e a partir de certo ponto a redução vem de folhas com uma única proposta. A turma sobe a profundidade e vê a
 * regra que veio de um caso só, com o intervalo de Wilson que a folha carrega.
 */
const BASE = did.base as Proposta[];
const PW = 420, PH = 320, PML = 46, PMR = 12, PMT = 12, PMB = 40;
const px = (u: number) => PML + (u / 100) * (PW - PML - PMR);
const py = (a: number) => PMT + (1 - a / 40) * (PH - PMT - PMB);

export function ArvoreQueDecora() {
  const [prof, setProf] = useState(1);
  const [minFolha, setMinFolha] = useState(1);
  const no = useMemo(() => crescer(BASE, prof, minFolha), [prof, minFolha]);
  const fs = folhas(no); const erros = errosNaAmostra(no); const umas = fs.filter((f) => f.n === 1);
  const serie = useMemo(() => [1, 2, 3, 4].map((p) => { const a = crescer(BASE, p, minFolha); return { p, erros: errosNaAmostra(a), folhas: folhas(a).length, umas: folhas(a).filter((f) => f.n === 1).length }; }), [minFolha]);
  const foco = umas.find((f) => f.grupo[0].id === 15) ?? umas[0]; // a #15 é a proposta que a página comenta
  return (
    <figure className="vz" data-vz="arvore-que-decora">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A árvore que decora · 16 propostas didáticas · profundidade na mão da turma</p>
          <p className="vz-tit">Mais profundidade sempre erra menos na amostra. A partir de certo ponto, a redução vem de decorar uma proposta.</p>
        </div>
      </header>
      <div className="vz-estado"><b>Profundidade {prof}, mínimo por folha {minFolha}:</b> {erros} {erros === 1 ? "erro" : "erros"} nas 16, {fs.length} folhas, {umas.length} {umas.length === 1 ? "folha" : "folhas"} com uma única proposta. {umas.length ? `A regra ${foco ? `"${descreverFolha(foco)}"` : ""} vem de um caso só: nenhuma proposta futura deveria receber PD ${foco && foco.d === 0 ? "zero" : "de 100%"} por causa dela.` : erros ? "Nenhuma folha depende de um caso isolado: a regra é grosseira e generalizável." : "Zero erro na amostra sem folha de um caso: verifique se as folhas ainda têm propostas suficientes."}</div>
      <div className="vz-dec-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Plano das variáveis <span className="hint">regiões: folhas · vermelho: maioria default · azul: maioria pagou · contorno dourado: folha de uma proposta</span></p>
          <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Partições da árvore de profundidade ${prof}`}>
            {fs.map((f, i) => <rect key={i} x={px(f.caixa.u0)} y={py(f.caixa.a1)} width={px(f.caixa.u1) - px(f.caixa.u0)} height={py(f.caixa.a0) - py(f.caixa.a1)} className={`vz-dec-folha ${f.d * 2 >= f.n ? "vz-dec-folha--default" : "vz-dec-folha--pagou"} ${f.n === 1 ? "vz-dec-folha--uma" : ""}`} style={{ opacity: 0.12 + 0.5 * Math.abs(f.d / f.n - 0.5) }} />)}
            {[0, 20, 40, 60, 80, 100].map((u) => <g key={u}><line x1={px(u)} x2={px(u)} y1={py(0)} y2={py(40)} className="vz-grade" /><text x={px(u)} y={PH - PMB + 16} textAnchor="middle" className="vz-tick">{u}%</text></g>)}
            {[0, 10, 20, 30, 40].map((a) => <g key={a}><line x1={px(0)} x2={px(100)} y1={py(a)} y2={py(a)} className="vz-grade" /><text x={PML - 6} y={py(a) + 4} textAnchor="end" className="vz-tick">{a} d</text></g>)}
            <text x={px(50)} y={PH - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            {BASE.map((b) => <g key={b.id}><circle cx={px(b.util)} cy={py(b.atraso)} r={9} className={`vz-dot-plano ${b.y ? "vz-dot-plano--default" : "vz-dot-plano--pagou"} ${foco && foco.grupo[0].id === b.id ? "vz-perda-dot--foco" : ""}`} /><text x={px(b.util)} y={py(b.atraso) + 4} textAnchor="middle" className="vz-dec-id">{b.id}</text></g>)}
          </svg>
          <div className="vz-res-controles">
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Profundidade máxima</span><span className="vz-slider-valor">{prof}</span></span><input type="range" min={1} max={4} step={1} value={prof} onChange={(e) => setProf(Number(e.target.value))} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Mínimo de propostas por folha (o freio do capítulo 5)</span><span className="vz-slider-valor">{minFolha}</span></span><input type="range" min={1} max={4} step={1} value={minFolha} onChange={(e) => setMinFolha(Number(e.target.value))} /></label>
          </div>
        </div>
        <div className="vz-dec-painel">
          <div className="vz-tiles">
            <div className="vz-tile"><p className="eyebrow">Erros nas 16</p><p className="vz-num">{erros}</p></div>
            <div className="vz-tile"><p className="eyebrow">Folhas</p><p className="vz-num">{fs.length}</p></div>
            <div className="vz-tile"><p className="eyebrow">Folhas de 1 proposta</p><p className={`vz-num ${umas.length ? "vz-num--default" : ""}`}>{umas.length}</p></div>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Profundidade</th><th>Erros</th><th>Folhas</th><th>Folhas de 1</th></tr></thead><tbody>{serie.map((s) => <tr key={s.p} className={s.p === prof ? "vz-t-on" : undefined}><td>{s.p}</td><td>{s.erros}</td><td>{s.folhas}</td><td>{s.umas}</td></tr>)}</tbody></table></div>
          {foco && <div className="vz-tile"><p className="eyebrow">A folha de uma proposta, com intervalo</p><p className="vz-num vz-num--texto">{descreverFolha(foco)}: {foco.d} default em {foco.n}. PD estimada {fmtPct(foco.d / foco.n)}, intervalo de Wilson a 95% de {fmtPct(wilson(foco.d, foco.n).lo, 1)} a {fmtPct(wilson(foco.d, foco.n).hi, 1)}.</p><p className="hint">a folha não afirma nada; a página 16 mostra por quê</p></div>}
          <p className="hint">Dezesseis observações não permitem estimar desempenho fora da amostra: esta tela demonstra o mecanismo. A evidência com 5.000 propostas está na grade do capítulo 6, página 17.</p>
        </div>
      </div>
      <p className="vz-fonte">Árvore do capítulo 5 (Gini, cortes nos pontos médios) sobre a base didática de 16 propostas. Profundidade 1: 2 erros, 2 folhas, nenhuma de um caso. Profundidade 3 sem freio: zero erro e folhas de uma única proposta, entre elas a #15, com utilização entre 87,5% e 92,5%.</p>
    </figure>
  );
}

function descreverFolha(f: No): string {
  const c = f.caixa; const partes: string[] = [];
  if (c.u0 > 0 && c.u1 < 100) partes.push(`utilização entre ${c.u0.toLocaleString("pt-BR")}% e ${c.u1.toLocaleString("pt-BR")}%`);
  else if (c.u0 > 0) partes.push(`utilização acima de ${c.u0.toLocaleString("pt-BR")}%`);
  else if (c.u1 < 100) partes.push(rotuloCorte("util", c.u1));
  if (c.a0 > 0 && c.a1 < 40) partes.push(`atraso entre ${c.a0.toLocaleString("pt-BR")} e ${c.a1.toLocaleString("pt-BR")} d`);
  else if (c.a0 > 0) partes.push(`atraso acima de ${c.a0.toLocaleString("pt-BR")} d`);
  else if (c.a1 < 40) partes.push(rotuloCorte("atraso", c.a1));
  return partes.join(" e ") || "toda a base";
}

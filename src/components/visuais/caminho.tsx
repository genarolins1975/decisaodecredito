"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { BETA_AULA, escore, sigmoide, type Proposta } from "@/lib/visuais/logistica";
import { NOME_VAR, crescer, folhas } from "@/lib/visuais/arvore";
import { ArvoreDiagrama, caminhoNaArvore } from "./arvore-diagrama";

/**
 * Percorrer a árvore (capítulo 5, c5p11). Uma proposta atravessa a árvore de profundidade 2: o caminho aceso,
 * regra por regra, a PD da folha e a base que a sustenta, ao lado da estimativa da logística do capítulo 4.
 */
const BASE = did.base as Proposta[];
const PRESETS: { nome: string; util: number; atraso: number }[] = [{ nome: "#3", util: 30, atraso: 5 }, { nome: "#8", util: 55, atraso: 5 }, { nome: "proposta nova", util: 72, atraso: 8 }, { nome: "#16", util: 95, atraso: 20 }];
const PW = 300, PH = 240, PML = 40, PMR = 10, PMT = 12, PMB = 34;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR), sa = (a: number) => PMT + (1 - (a + 4) / 48) * (PH - PMT - PMB);
/** folga de 4 dias acima e abaixo: nenhum ponto encosta na borda do plano; bordas de região em 0 e 40 dias vão até a folga */
const ea = (a: number) => (a <= 0 ? -4 : a >= 40 ? 44 : a);

export function Caminho() {
  const [util, setUtil] = useState(72);
  const [atraso, setAtraso] = useState(8);
  const arvore = useMemo(() => crescer(BASE, 2), []);
  const fs = folhas(arvore);
  const cam = caminhoNaArvore(arvore, util, atraso); const folha = cam[cam.length - 1]; const pd = folha.d / folha.n;
  const pl = sigmoide(escore(BETA_AULA, util, atraso).z);
  const passos = cam.slice(0, -1).map((n, i) => { const valor = n.corte!.v === "util" ? util : atraso; const sim = valor <= n.corte!.valor; return { i: i + 1, pergunta: `${NOME_VAR[n.corte!.v]} ≤ ${fmtNum(n.corte!.valor, 1)}${n.corte!.v === "util" ? "%" : " d"}?`, valor: `${fmtNum(valor, 1)}${n.corte!.v === "util" ? "%" : " d"}`, sim, destino: cam[i + 1] }; });
  return (
    <figure className="vz" data-vz="caminho">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Percorrer a árvore · a explicação completa de uma decisão · regra por regra</p>
          <p className="vz-tit">O caminho da raiz até a folha é a justificativa integral da previsão, e qualquer pessoa consegue ler.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Propostas de exemplo">
          {PRESETS.map((p) => <button key={p.nome} type="button" className={`btn btn-sm ${util === p.util && atraso === p.atraso ? "" : "btn-secondary"}`} onClick={() => { setUtil(p.util); setAtraso(p.atraso); }}>{p.nome}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>Utilização {util}% e atraso {atraso} dias:</b> {passos.map((p) => `${p.pergunta} ${p.sim ? "sim" : "não"}`).join("; ")}. Folha com {folha.d} de {folha.n}: PD {fmtPct(pd, 1)}. A logística do capítulo 4 estima {fmtPct(pl, 1)} para a mesma proposta.</div>
      <div className="vz-cam-grade">
        <div className="vz-cam-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Utilização do limite</b> <span className="vz-slider-valor">{util}%</span></span><input type="range" min={10} max={100} step={1} value={util} onChange={(e) => setUtil(Number(e.target.value))} aria-valuetext={`${util}%`} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Maior atraso em 6 meses</b> <span className="vz-slider-valor">{atraso} dias</span></span><input type="range" min={0} max={45} step={1} value={atraso} onChange={(e) => setAtraso(Number(e.target.value))} aria-valuetext={`${atraso} dias`} /></label>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Passo</th><th>Pergunta</th><th>Valor</th><th>Resposta</th><th>Vai para</th></tr></thead><tbody>
            {passos.map((p) => <tr key={p.i}><th scope="row">{p.i}</th><td>{p.pergunta}</td><td>{p.valor}</td><td className={p.sim ? "vz-t-ok" : "vz-t-default"}>{p.sim ? "sim" : "não"}</td><td>nó com {p.destino.n} propostas</td></tr>)}
          </tbody></table></div>
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">PD da folha</p><p className={`vz-num ${pd > 0.5 ? "vz-num--default" : ""}`}>{fmtPct(pd, 1)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Base da folha</p><p className="vz-num">{folha.d} / {folha.n}</p><p className="hint">defaults observados sobre propostas</p></div>
          </div>
          <div className="vz-grafico vz-cam-plano">
            <p className="vz-grafico-t">Onde a proposta cai <span className="hint">as quatro regiões da árvore e o ponto</span></p>
            <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Proposta com utilização ${util}% e atraso ${atraso} dias na região da folha`}>
              {fs.map((f) => { const on = f === folha; const p = f.d / f.n; return <rect key={`${f.caixa.u0}-${f.caixa.a0}`} x={su(f.caixa.u0)} y={sa(ea(f.caixa.a1))} width={su(f.caixa.u1) - su(f.caixa.u0)} height={sa(ea(f.caixa.a0)) - sa(ea(f.caixa.a1))} className={`vz-cam-regiao ${on ? "vz-cam-regiao--on" : ""}`} style={{ fill: p >= 0.5 ? "var(--color-alert)" : "#9db6de", fillOpacity: on ? 0.45 : 0.14 }} />; })}
              {fs.map((f) => <text key={`t${f.caixa.u0}-${f.caixa.a0}`} x={(su(f.caixa.u0) + su(f.caixa.u1)) / 2} y={(sa(f.caixa.a0) + sa(f.caixa.a1)) / 2 + 4} textAnchor="middle" className="vz-tick vz-tick--forte">{fmtPct(f.d / f.n)}</text>)}
              {[0, 50, 100].map((u) => <text key={u} x={su(u)} y={PH - PMB + 14} textAnchor="middle" className="vz-tick">{u}%</text>)}
              {[0, 20, 40].map((a) => <text key={a} x={PML - 4} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a} d</text>)}
              <text x={su(50)} y={PH - 4} textAnchor="middle" className="vz-rotulo">utilização</text>
              {BASE.map((p) => <circle key={p.id} cx={su(p.util)} cy={sa(p.atraso)} r={3.5} className={p.y ? "vz-int-c--default" : "vz-int-c--pagou"} opacity={0.6} />)}
              <g className="vz-int-ponto" style={{ transform: `translate(${su(util)}px, ${sa(Math.min(40, atraso))}px)` }}><circle r={8} className="vz-cam-ponto" /></g>
            </svg>
          </div>
        </div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">O caminho aceso <span className="hint">as caixas atravessadas ficam em destaque</span></p>
          <ArvoreDiagrama no={arvore} caminho={cam} />
          <p className="hint">Compare com a logística do capítulo 4, que para a mesma proposta estima <b>{fmtPct(pl, 1)}</b>. As duas famílias discordam, e o capítulo 7 define com qual critério se decide entre elas.</p>
        </div>
      </div>
      <p className="vz-fonte">Utilização 72% e atraso 8 dias: utilização ≤ 57,5%? não, nó com 8 propostas; utilização ≤ 87,5%? sim, folha com 6 de 6, PD 100,0%. A logística dá 69,3% para a mesma proposta. A folha devolve uma taxa, e de onde vem essa taxa é a próxima página.</p>
    </figure>
  );
}

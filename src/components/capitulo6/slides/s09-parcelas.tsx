"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { sigmoide, valorArvore, type No, type Vetor } from "@/lib/capitulo6/gbm";
import { num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 09 · c6p9 · A PD de uma das 16 propostas decomposta: F₀ mais η vezes a folha de cada uma das quatro árvores, tudo em
 * log odds, e a sigmoide só no fim. Cascata horizontal em log odds em cima; embaixo, a sigmoide no mesmo eixo de log
 * odds, onde a soma vira PD. Modelo CFG_DIDATICA (η = 0,4, 4 árvores de profundidade 2, mínimo 2 por folha) ajustado
 * pela biblioteca do capítulo (gbm.ts, conferida contra o scikit-learn) nas 16 propostas sintéticas dos capítulos 4 e 5.
 * A previsão compara duas propostas que caem na mesma folha da última árvore: a mesma parcela em log odds vale pontos de
 * PD diferentes, conforme o ponto da curva. As PDs ficam ocultas até a resposta certa.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const MOD = modelo(CFG_DIDATICA, XD, YD);
const ETA = MOD.eta, M = MOD.arvores.length;
const NOMES = ["util.", "atraso"];
const NDEF = YD.reduce((s, v) => s + v, 0);
const sinal = (v: number, c = 2) => `${v >= 0 ? "+" : "−"}${num(Math.abs(v), c)}`;

/** Regra da folha em que a proposta cai: os cortes do caminho, juntados por variável. */
function regra(no: No, x: Vetor): string {
  const lo = NOMES.map(() => -Infinity), hi = NOMES.map(() => Infinity);
  let a = no;
  while (!a.folha) { if (Math.fround(x[a.variavel]) <= a.corte) { hi[a.variavel] = Math.min(hi[a.variavel], a.corte); a = a.esq; } else { lo[a.variavel] = Math.max(lo[a.variavel], a.corte); a = a.dir; } }
  return NOMES.map((n, v) => (lo[v] > -Infinity && hi[v] < Infinity ? `${num(lo[v], 1)} < ${n} ≤ ${num(hi[v], 1)}` : hi[v] < Infinity ? `${n} ≤ ${num(hi[v], 1)}` : lo[v] > -Infinity ? `${n} > ${num(lo[v], 1)}` : "")).filter(Boolean).join(" · ");
}
type Decomp = { folhas: number[]; parcelas: number[]; acum: number[]; regras: string[] };
const DEC: Decomp[] = XD.map((x) => {
  const folhas = MOD.arvores.map((a) => valorArvore(a, x)); const parcelas = folhas.map((f) => ETA * f);
  const acum = [MOD.f0]; parcelas.forEach((p) => acum.push(acum[acum.length - 1] + p));
  return { folhas, parcelas, acum, regras: MOD.arvores.map((a) => regra(a, x)) };
});
const LIM = Math.ceil(Math.max(...DEC.flatMap((d) => d.acum.map(Math.abs))) + 0.2);
const idx = (id: number) => DIDATICA.findIndex((p) => p.id === id);
const INI = idx(10), COMP = idx(9);
/** As duas propostas da previsão caem na mesma folha da última árvore (conferido aqui, não suposto). */
const MESMA = Math.abs(DEC[INI].parcelas[M - 1] - DEC[COMP].parcelas[M - 1]) < 1e-12;
const ganhoPD = (i: number) => sigmoide(DEC[i].acum[M]) - sigmoide(DEC[i].acum[M - 1]);
const G10 = ganhoPD(INI), G9 = ganhoPD(COMP), P4 = DEC[INI].parcelas[M - 1];
const id10 = DIDATICA[INI].id, id9 = DIDATICA[COMP].id;
const PD3 = (i: number) => pct(sigmoide(DEC[i].acum[M - 1]), 0);
const OPS = [
  { texto: `As duas ganham ${int100(P4)} pontos de PD`, certa: false, retorno: <>Confunde as escalas: {sinal(P4)} é log odds, não PD. Em PD, a {id10} ganha {sinal(G10 * 100, 1)} pp e a {id9}, {sinal(G9 * 100, 1)} pp.</> },
  { texto: "As duas ganham os mesmos pontos de PD", certa: false, retorno: <>Seria assim se a PD fosse a soma das parcelas. A sigmoide entorta a soma: {sinal(G10 * 100, 1)} pp na {id10} e {sinal(G9 * 100, 1)} pp na {id9}.</> },
  { texto: `A ${id10} (em ${PD3(INI)}) ganha mais que a ${id9} (em ${PD3(COMP)})`, certa: true, retorno: <>Isso: {sinal(G10 * 100, 1)} pp contra {sinal(G9 * 100, 1)} pp. Perto de 50% a curva é íngreme; perto de 100%, achatada.</> },
  { texto: `A ${id9} (em ${PD3(COMP)}) ganha mais que a ${id10} (em ${PD3(INI)})`, certa: false, retorno: <>É o contrário: perto de 100% a sigmoide achata, e a mesma parcela rende menos. A {id9} ganha {sinal(G9 * 100, 1)} pp; a {id10}, {sinal(G10 * 100, 1)} pp.</> },
];
function int100(v: number) { return num(v * 100, 0); }

function Cascata({ i, revelado }: { i: number; revelado: boolean }) {
  const dc = DEC[i]; const pdF = sigmoide(dc.acum[M]);
  const rotulos = ["Palpite F₀", ...dc.parcelas.map((_, k) => `Árvore ${k + 1}`), `Soma F${sub(M)}`];
  const curtos = ["F₀", ...dc.parcelas.map((_, k) => `Árv. ${k + 1}`), `F${sub(M)}`];
  const tab = (
    <table><caption>Parcelas da proposta {DIDATICA[i].id} em log odds</caption><thead><tr><th>Etapa</th><th>Folha</th><th>Parcela η × folha</th><th>Acumulado</th>{revelado && <th>PD</th>}</tr></thead>
      <tbody>{dc.acum.map((a, k) => <tr key={k}><td>{k === 0 ? "Palpite" : `Árvore ${k}`}</td><td>{k ? num(dc.folhas[k - 1], 3) : ""}</td><td>{k ? sinal(dc.parcelas[k - 1], 3) : num(a, 3)}</td><td>{num(a, 3)}</td>{revelado && <td>{pct(sigmoide(a), 1)}</td>}</tr>)}</tbody></table>
  );
  return (
    <Grafico rotulo={`Cascata das parcelas da proposta ${DIDATICA[i].id} em log odds, de ${num(dc.acum[0], 2)} a ${num(dc.acum[M], 2)}${revelado ? `, e a sigmoide que leva a soma a PD ${pct(pdF, 1)}` : ""}`} tabela={tab} arCelular="4 / 5">
      {(d) => {
        const fs = d.fs; const estreito = d.w < fs * 34; const m = margens(fs, { l: estreito ? 5.6 : 11.2, r: 1.2, t: 0.4, b: 2.7 });
        const x = escala([-LIM, LIM], [m.l, d.w - m.r]);
        const altoC = (d.h - m.t - m.b) * 0.6; const rh = altoC / rotulos.length; const bh = Math.min(rh * 0.58, fs * 1.25);
        const yc = (k: number) => m.t + rh * (k + 0.5);
        const topoS = m.t + altoC + fs * 1.6; const y = escala([0, 1], [d.h - m.b, topoS]);
        const ticks = Array.from({ length: 2 * LIM + 1 }, (_, k) => k - LIM);
        const curva = Array.from({ length: 121 }, (_, k) => -LIM + (2 * LIM * k) / 120).map((f) => ({ x: x(f), y: y(sigmoide(f)) }));
        const larg = (s: string) => s.length * fs * 0.5;
        return (
          <g>
            {/* referência: log odds 0 = PD 50% */}
            <line x1={x(0)} x2={x(0)} y1={m.t} y2={d.h - m.b} stroke="#C9CDD5" strokeWidth={1.5} strokeDasharray="4 5" />
            {rotulos.map((r, k) => (
              <g key={k}>
                <text className="q7-rot" x={m.l - fs * 0.6} y={yc(k) + (estreito || k > M ? fs * 0.34 : -fs * 0.2)} textAnchor="end" style={{ fill: "#00205B", fontWeight: 700 }}>{estreito ? curtos[k] : r}</text>
                {!estreito && k > 0 && k <= M && <text className="q7-rot--peq" x={m.l - fs * 0.6} y={yc(k) + fs * 0.72} textAnchor="end" style={{ fill: "#5B6475", fontSize: "0.74em" }}>{dc.regras[k - 1]}</text>}
                {!estreito && k === 0 && <text className="q7-rot--peq" x={m.l - fs * 0.6} y={yc(k) + fs * 0.72} textAnchor="end" style={{ fill: "#5B6475", fontSize: "0.74em" }}>{`ln(${NDEF} ÷ ${YD.length - NDEF})`}</text>}
              </g>
            ))}
            {/* palpite */}
            <path d={`M${x(dc.acum[0])} ${yc(0) - bh * 0.62}l${bh * 0.62} ${bh * 0.62}l${-bh * 0.62} ${bh * 0.62}l${-bh * 0.62} ${-bh * 0.62}Z`} fill="#00205B" />
            <text className="q7-rot" x={x(dc.acum[0]) + bh} y={yc(0) + fs * 0.34} style={{ fill: "#00205B" }}>{num(dc.acum[0], 2)}</text>
            {dc.parcelas.map((p, k) => {
              const a = dc.acum[k], b = dc.acum[k + 1]; const x0 = x(Math.min(a, b)), x1 = x(Math.max(a, b)); const cy = yc(k + 1);
              const txt = estreito ? sinal(p) : `${sinal(p)}  (${num(ETA, 1)} × ${num(dc.folhas[k], 2)})`;
              const direita = x1 + fs * 0.4 + larg(txt) < d.w - m.r * 0.2; // à direita da barra, longe da linha do zero; à esquerda só se não couber
              return (
                <g key={k}>
                  <line x1={x(a)} x2={x(a)} y1={yc(k) + bh / 2} y2={cy - bh / 2} stroke="#9AA1AD" strokeWidth={1.4} strokeDasharray="2 3" />
                  <rect x={x0} y={cy - bh / 2} width={Math.max(2, x1 - x0)} height={bh} rx={3} fill={p >= 0 ? "#176C73" : "#fff"} stroke="#176C73" strokeWidth={2.2} />
                  <text className="q7-rot" x={direita ? x1 + fs * 0.4 : x0 - fs * 0.4} y={cy + fs * 0.34} textAnchor={direita ? "start" : "end"} style={{ fill: "#176C73" }}>{sinal(p)}{!estreito && <tspan style={{ fill: "#5B6475", fontWeight: 500, fontSize: "0.8em" }}>{`  ${num(ETA, 1)} × ${num(dc.folhas[k], 2)}`}</tspan>}</text>
                </g>
              );
            })}
            {/* soma */}
            {(() => {
              const cy = yc(M + 1), a = Math.min(0, dc.acum[M]), b = Math.max(0, dc.acum[M]);
              return <g>
                <line x1={x(dc.acum[M])} x2={x(dc.acum[M])} y1={yc(M) + bh / 2} y2={cy - bh / 2} stroke="#9AA1AD" strokeWidth={1.4} strokeDasharray="2 3" />
                <rect x={x(a)} y={cy - bh / 2} width={Math.max(2, x(b) - x(a))} height={bh} rx={3} fill="#00205B" />
                <text className="q7-rot" x={dc.acum[M] >= 0 ? x(b) + fs * 0.4 : x(a) - fs * 0.4} y={cy + fs * 0.34} textAnchor={dc.acum[M] >= 0 ? "start" : "end"} style={{ fill: "#00205B", fontWeight: 700 }}>{num(dc.acum[M], 2)}</text>
              </g>;
            })()}
            {/* sigmoide no mesmo eixo de log odds */}
            <Eixos x={x} y={y} xt={ticks} yt={[0, 0.5, 1]} fx={(v) => num(v, 0)} fy={(v) => pct(v, 0)} xTit={estreito ? "log odds F" : "log odds F (o mesmo eixo da cascata)"} />
            <text className="q7-eixo-t" x={m.l - fs * 0.6} y={topoS + fs * 1.4} textAnchor="end">PD = σ(F)</text>
            <path className="q7-linha q7-linha--prob q7-linha--fina" d={caminho(curva)} />
            {revelado ? (
              <g>
                <line x1={x(dc.acum[M])} x2={x(dc.acum[M])} y1={yc(M + 1) + bh / 2} y2={y(pdF)} stroke="#00205B" strokeWidth={2} strokeDasharray="6 4" />
                <line x1={m.l} x2={x(dc.acum[M])} y1={y(pdF)} y2={y(pdF)} stroke="#00205B" strokeWidth={2} strokeDasharray="6 4" />
                {dc.acum.slice(0, M).map((a, k) => <circle key={k} cx={x(a)} cy={y(sigmoide(a))} r={fs * 0.24} fill="#fff" stroke="#176C73" strokeWidth={2} />)}
                <circle cx={x(dc.acum[M])} cy={y(pdF)} r={fs * 0.36} fill="#176C73" stroke="#fff" strokeWidth={2} />
                {(() => { const y0 = pdF > 0.7 ? y(pdF) + fs * 1.15 : y(0.93) + fs * 0.4; const x0 = dc.acum[M] < 0 ? Math.max(m.l + fs * 1.2, x(dc.acum[M]) + fs * 0.8) : m.l + fs * 1.2; return (
                  <text x={x0} y={y0} style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em" }}>
                    <tspan className="q7-rot" style={{ fill: "#176C73", fontWeight: 700 }}>{`PD = σ(${num(dc.acum[M], 2)}) = ${pct(pdF, 1)}`}</tspan>
                    <tspan className="q7-rot--peq" x={x0} dy="1.25em" style={{ fill: "#176C73", fontWeight: 600 }}>{`na árvore ${M}: ${sinal((pdF - sigmoide(dc.acum[M - 1])) * 100, 1)} pp`}</tspan>
                  </text>
                ); })()}
              </g>
            ) : (
              <text className="q7-rot--peq" x={estreito ? x(LIM * 0.95) : x(LIM * 0.45)} y={y(0.22)} textAnchor={estreito ? "end" : "middle"} style={{ fill: "#5B6475" }}>{estreito ? "PD: depois da previsão" : "a PD aparece depois da previsão"}</text>
            )}
          </g>
        );
      }}
    </Grafico>
  );
}
function sub(n: number) { return String(n).split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[+c]).join(""); }

export function S09Parcelas({ pagina }: { pagina?: Pagina }) {
  const [sel, setSel] = useState(INI);
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc !== null && OPS[esc].certa;
  const dc = DEC[sel], p = DIDATICA[sel];
  const soma = <>{num(dc.acum[0], 2)} {dc.parcelas.map((v, k) => <span key={k}>{v >= 0 ? "+" : "−"} {num(Math.abs(v), 2)} </span>)}= <b>{num(dc.acum[M], 2)}</b></>;
  return (
    <Quadro slug="c6p9" pagina={pagina} layout="gl"
      sub={revelado ? undefined : "Quatro árvores, quatro parcelas em log odds: quanto cada uma vale em PD?"}
      conclusao={revelado
        ? <>Proposta {p.id}: {soma} em log odds, e PD = σ({num(dc.acum[M], 2)}) = <b>{pct(sigmoide(dc.acum[M]), 1)}</b>. {MESMA ? <>A mesma folha de {sinal(P4)} vale {sinal(G10 * 100, 1)} pp na {id10} e {sinal(G9 * 100, 1)} pp na {id9}: só as log odds somam.</> : null} O <LinkSlide slug="c6p10">slide 10</LinkSlide> escreve esta soma como a fórmula de Friedman.</>
        : <>Proposta {p.id}: {soma} em log odds. Cada parcela é η = {num(ETA, 1)} vezes a folha em que a proposta cai, as quatro árvores do <LinkSlide slug="c6p8">slide 8</LinkSlide>. Responda à previsão para ver a PD.</>}
      fonte={`${YD.length} propostas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}; ${NDEF} defaults). η = ${num(ETA, 1)}; ${M} árvores, profundidade ${CFG_DIDATICA.profundidade}, mínimo ${CFG_DIDATICA.minFolha} por folha; folha por Newton; gbm.ts, conferida contra o scikit-learn.`}>
      <Painel>
        <Cascata i={sel} revelado={revelado} />
      </Painel>
      <Painel>
        <p className="q7-k">Escolha a proposta</p>
        <div className="q6-s09-props" role="group" aria-label="Propostas">
          {DIDATICA.map((q, i) => (
            <button key={q.id} type="button" className="q6-s09-prop" data-y={q.y} aria-pressed={i === sel} aria-label={`Proposta ${q.id}: utilização ${q.util}%, atraso ${q.atraso} dias, ${q.y ? "default" : "adimplente"}`} onClick={() => setSel(i)}>
              <i aria-hidden="true" />{q.id}
            </button>
          ))}
        </div>
        <p className="q6-s09-ficha"><b>Proposta {p.id}</b> · utilização {p.util}% · atraso {p.atraso} dias · <span data-y={p.y}>{p.y ? "● default" : "○ adimplente"}</span></p>
        <Previsao pergunta={`As propostas ${id10} e ${id9} caem na mesma folha da árvore ${M}: as duas ganham ${sinal(P4)} em log odds. E em PD?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setSel(INI); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

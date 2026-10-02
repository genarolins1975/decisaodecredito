"use client";
import { useState } from "react";
import { Botao, Controle, Grafico, LinkSlide, Marca, Painel, Previsao, Quadro, Seg, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { sigmoide, type No } from "@/lib/capitulo6/gbm";
import { num } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 05 · c6p5 · A primeira árvore, ajustada nos resíduos do palpite (y − p com p = 50%: ±0,5). Os cortes candidatos são os
 * pontos médios entre valores distintos de cada variável, com ao menos 2 propostas de cada lado (o mínimo por folha de
 * CFG_DIDATICA); para cada um, o erro quadrático dos resíduos em torno da média de cada lado. A turma prevê o primeiro
 * corte antes de ver os números; as alternativas erradas são o melhor corte de atraso (a intuição de crédito) e o
 * corte que isola #1 e #2, que têm erros opostos e não reduzem nada. Depois, o controle percorre os cortes de cada
 * variável e o botão cresce o segundo nível: a árvore de profundidade 2 da biblioteca (modelo(CFG_DIDATICA), árvore 1),
 * com as quatro regiões, quem cai em cada folha e a média do erro de cada uma. O melhor corte calculado aqui é conferido
 * contra a raiz da biblioteca.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const VAR = ["Utilização", "Atraso"] as const;
type V = 0 | 1;
const MOD = modelo(CFG_DIDATICA, XD, YD);
const P0 = sigmoide(MOD.f0);
const R = YD.map((y) => y - P0);
const ids = DIDATICA.map((_, i) => i);
const media = (s: number[]) => s.reduce((a, i) => a + R[i], 0) / s.length;
const sse = (s: number[]) => { const mm = media(s); return s.reduce((a, i) => a + (R[i] - mm) ** 2, 0); };
const SSE0 = sse(ids);
type Corte = { v: V; c: number; e: number[]; d: number[]; sse: number };
const CORTES: Record<V, Corte[]> = { 0: [], 1: [] };
for (const v of [0, 1] as V[]) {
  const vals = [...new Set(XD.map((x) => x[v]))].sort((a, b) => a - b);
  for (let k = 0; k < vals.length - 1; k++) {
    const c = (vals[k] + vals[k + 1]) / 2, e = ids.filter((i) => XD[i][v] <= c), d = ids.filter((i) => XD[i][v] > c);
    if (e.length >= CFG_DIDATICA.minFolha && d.length >= CFG_DIDATICA.minFolha) CORTES[v].push({ v, c, e, d, sse: sse(e) + sse(d) });
  }
}
const melhor = (v: V) => CORTES[v].reduce((a, b) => (b.sse < a.sse - 1e-12 ? b : a));
const MELHOR = { 0: melhor(0), 1: melhor(1) };
const RAIZ = MOD.arvores[0] as Extract<No, { folha: false }>;
if (RAIZ.folha || RAIZ.variavel !== 0 || Math.abs(RAIZ.corte - MELHOR[0].c) > 1e-6) throw new Error("o melhor corte diverge da raiz da biblioteca");
const iniU = CORTES[0].findIndex((c) => c.c === MELHOR[0].c);
const ISOLA = CORTES[0][0]; // o primeiro corte de utilização: isola as duas propostas mais à esquerda

/** As folhas da primeira árvore como retângulos no plano, com quem cai em cada uma e a média do erro. */
type Folha = { nome: string; u: [number, number]; a: [number, number]; membros: number[] };
function folhasDe(no: No, u: [number, number], a: [number, number], membros: number[], out: Folha[]) {
  if (no.folha) { out.push({ nome: String.fromCharCode(65 + out.length), u, a, membros }); return out; }
  const e = membros.filter((i) => XD[i][no.variavel] <= no.corte), d = membros.filter((i) => XD[i][no.variavel] > no.corte);
  if (no.variavel === 0) { folhasDe(no.esq, [u[0], no.corte], a, e, out); folhasDe(no.dir, [no.corte, u[1]], a, d, out); }
  else { folhasDe(no.esq, u, [a[0], no.corte], e, out); folhasDe(no.dir, u, [no.corte, a[1]], d, out); }
  return out;
}
const U: [number, number] = [10, 100], A: [number, number] = [-4, 50];
/** Melhor corte de cada variável dentro de um nó (mesmo critério: menor erro quadrático, mínimo por folha). */
function melhorNo(membros: number[], v: V) {
  const vals = [...new Set(membros.map((i) => XD[i][v]))].sort((a, b) => a - b); let best: { c: number; sse: number } | null = null;
  for (let k = 0; k < vals.length - 1; k++) {
    const c = (vals[k] + vals[k + 1]) / 2, e = membros.filter((i) => XD[i][v] <= c), d = membros.filter((i) => XD[i][v] > c);
    if (e.length >= CFG_DIDATICA.minFolha && d.length >= CFG_DIDATICA.minFolha && (!best || sse(e) + sse(d) < best.sse - 1e-12)) best = { c, sse: sse(e) + sse(d) };
  }
  return best;
}
/** O nó do segundo nível em que as duas variáveis empatam: a biblioteca (e o scikit-learn, random_state 0) fica com a primeira na ordem. */
const EMPATE = ([RAIZ.esq, RAIZ.dir] as No[]).map((no, lado) => {
  const membros = ids.filter((i) => (lado === 0 ? XD[i][0] <= RAIZ.corte : XD[i][0] > RAIZ.corte));
  const [bu, ba] = [melhorNo(membros, 0), melhorNo(membros, 1)];
  return bu && ba && Math.abs(bu.sse - ba.sse) < 1e-12 && !no.folha ? { lado, u: bu, a: ba, venceu: no.variavel } : null;
}).find(Boolean);
if (EMPATE && EMPATE.venceu !== 0) throw new Error("o desempate do segundo nível não é a primeira variável");
const FOLHAS = folhasDe(RAIZ, U, A, ids, []);
const SSE2 = FOLHAS.reduce((s, f) => s + sse(f.membros), 0);
const sinal = (v: number) => `${v > 1e-12 ? "+" : ""}${num(Math.abs(v) < 1e-12 ? 0 : v, 2)}`;
const rotC = (c: Corte) => (c.v === 0 ? `utilização ≤ ${num(c.c, 1)}%` : `atraso ≤ ${num(c.c, 1)} dias`);
const lista = (m: number[]) => m.map((i) => `#${DIDATICA[i].id}`).join(", ");

const OPCOES: Opcao[] = [
  { texto: `Utilização ≤ ${num(MELHOR[0].c, 1)}%`, certa: true, retorno: <>Isso: o erro quadrático cai de {num(SSE0, 2)} para <b>{num(MELHOR[0].sse, 2)}</b>, o maior ganho entre os {CORTES[0].length + CORTES[1].length} cortes possíveis.</> },
  { texto: `Atraso ≤ ${num(MELHOR[1].c, 0)} dias: atraso é o sinal clássico`, retorno: <>A árvore não segue a intuição de crédito: escolhe o corte que mais reduz o erro dos resíduos. O melhor de atraso deixa {num(MELHOR[1].sse, 2)} de {num(SSE0, 2)}; há um corte melhor.</> },
  { texto: `Utilização ≤ ${num(ISOLA.c, 1)}%, isolando #${DIDATICA[ISOLA.e[0]].id} e #${DIDATICA[ISOLA.e[1]].id}`, retorno: <>Os dois têm erros opostos ({sinal(R[ISOLA.e[0]])} e {sinal(R[ISOLA.e[1]])}): a média de cada lado continua 0 e o erro quadrático não cai ({num(ISOLA.sse, 2)}). A árvore junta erros <b>parecidos</b>.</> },
];

export function S05PrimeiraArvore({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [v, setV] = useState<V>(0);
  const [k, setK] = useState(iniU);
  const [cresceu, setCresceu] = useState(false);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const corte = CORTES[v][Math.min(k, CORTES[v].length - 1)];
  const restaurar = () => { setEsc(null); setV(0); setK(iniU); setCresceu(false); };
  return (
    <Quadro slug="c6p5" pagina={pagina} layout="gl"
      conclusao={!rev ? <>No palpite, cada default erra +0,50 e cada adimplente −0,50 (<LinkSlide slug="c6p4">slide 4</LinkSlide>). Erro quadrático total: {num(SSE0, 2)}. Onde a árvore corta primeiro?</>
        : cresceu ? <>Quatro folhas, erro quadrático <b>{num(SSE2, 2)}</b>.{EMPATE ? <> À direita, {rotC({ v: 0, c: EMPATE.u.c } as Corte)} empata com {rotC({ v: 1, c: EMPATE.a.c } as Corte)} ({num(EMPATE.u.sse, 2)} cada): vence a primeira variável na ordem, como no scikit-learn com semente 0.</> : null} O valor que a folha soma às log odds: <LinkSlide slug="c6p6">slide 6</LinkSlide>.</>
        : <>Com {rotC(corte)}: médias {sinal(media(corte.e))} e {sinal(media(corte.d))}; o erro quadrático cai de {num(SSE0, 2)} para <b>{num(corte.sse, 2)}</b>.{corte === MELHOR[0] ? null : <> O melhor: {rotC(MELHOR[0])}.</>} Como y{"\u00a0−\u00a0"}p̄ é o default menos {num(P0, 2)}, os cortes são os de uma árvore no default; a diferença vem da segunda árvore (<LinkSlide slug="c6p8">slide 8</LinkSlide>).</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}). Árvore de regressão nos resíduos do palpite F₀ = ${num(MOD.f0, 2)}: profundidade ${CFG_DIDATICA.profundidade}, mínimo de ${CFG_DIDATICA.minFolha} por folha, cortes nos pontos médios entre valores distintos; erro quadrático em torno da média de cada lado; em empate, a primeira variável na ordem (utilização). Árvore 1 do boosting da biblioteca.`}>
      <Painel>
        <Grafico titulo="Os erros no plano das 16 propostas" sub={cresceu ? "as quatro folhas da primeira árvore" : `erro no palpite: ● default ${sinal(R[YD.indexOf(1)])} · ○ adimplente ${sinal(R[YD.indexOf(0)])}`} rotulo={cresceu ? `Quatro folhas: ${FOLHAS.map((f) => `${f.nome}, ${lista(f.membros)}, média ${sinal(media(f.membros))}`).join("; ")}` : rev ? `Corte ${rotC(corte)}: erro quadrático de ${num(SSE0, 2)} para ${num(corte.sse, 2)}` : "As 16 propostas no plano utilização por atraso, com o erro de cada uma"} arCelular="1 / 1">
          {(d) => {
            const m = margens(d.fs, { l: 3, r: 1, t: cresceu ? 2.6 : 1.2, b: 2.9 });
            const x = escala(U, [m.l, d.w - m.r]), y = escala(A, [d.h - m.b, m.t]);
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const tons = ["#EFF3FA", "#F7F5EF", "#EFF3FA", "#F7F5EF"];
            return (
              <g>
                {cresceu ? FOLHAS.map((f, i) => (
                  <g key={f.nome}>
                    <rect x={x(f.u[0])} y={y(f.a[1])} width={x(f.u[1]) - x(f.u[0])} height={y(f.a[0]) - y(f.a[1])} fill={tons[i]} />
                    <text className="q7-rot" x={(x(f.u[0]) + x(f.u[1])) / 2} y={y(f.a[1])} dy="-1.35em" textAnchor="middle" style={{ fill: "#00205B" }}>{f.nome} · {f.membros.length}</text>
                    <text className="q7-rot--peq" x={(x(f.u[0]) + x(f.u[1])) / 2} y={y(f.a[1])} dy="-.3em" textAnchor="middle" style={{ fill: "#3D5A8A", fontWeight: 700 }}>média {sinal(media(f.membros))}</text>
                  </g>
                )) : rev && <>
                  {corte.v === 0 ? <><rect x={x(U[0])} y={y(A[1])} width={x(corte.c) - x(U[0])} height={y(A[0]) - y(A[1])} fill="#EFF3FA" /><rect x={x(corte.c)} y={y(A[1])} width={x(U[1]) - x(corte.c)} height={y(A[0]) - y(A[1])} fill="#F7F5EF" /></>
                    : <><rect x={x(U[0])} y={y(corte.c)} width={x(U[1]) - x(U[0])} height={y(A[0]) - y(corte.c)} fill="#EFF3FA" /><rect x={x(U[0])} y={y(A[1])} width={x(U[1]) - x(U[0])} height={y(corte.c) - y(A[1])} fill="#F7F5EF" /></>}
                </>}
                {[0, 10, 20, 30, 40].map((a) => <g key={a}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(a)} y2={y(a)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(a)} dy=".34em" textAnchor="end">{a}</text></g>)}
                {[20, 40, 60, 80, 100].map((u) => <text key={u} className="q7-tick" x={x(u)} y={d.h - m.b} dy="1.25em" textAnchor="middle">{u}%</text>)}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={d.h - m.b} y2={d.h - m.b} />
                <text className="q7-eixo-t" x={(m.l + d.w - m.r) / 2} y={d.h - m.b} dy="2.6em" textAnchor="middle">Utilização do limite</text>
                <text className="q7-eixo-t" x={m.l} y={y(A[1])} dx=".4em" dy="1.2em" style={halo}>Atraso, dias</text>
                {cresceu ? FOLHAS.slice(1).map((f, i) => (f.u[0] > U[0] ? <line key={i} x1={x(f.u[0])} x2={x(f.u[0])} y1={y(A[0])} y2={y(A[1])} stroke="#3D5A8A" strokeWidth={i === 1 ? 4 : 2.5} strokeDasharray={i === 1 ? undefined : "8 5"} /> : null))
                  : rev && (corte.v === 0 ? <line x1={x(corte.c)} x2={x(corte.c)} y1={y(A[0])} y2={y(A[1])} stroke="#3D5A8A" strokeWidth={4} /> : <line x1={x(U[0])} x2={x(U[1])} y1={y(corte.c)} y2={y(corte.c)} stroke="#3D5A8A" strokeWidth={4} />)}
                {DIDATICA.map((p) => (
                  <g key={p.id}>
                    <Marca x={x(p.util)} y={y(p.atraso)} r={d.fs * 0.68} def={p.y === 1} />
                    <text className="q7-rot--peq" x={x(p.util)} y={y(p.atraso)} dy=".35em" textAnchor="middle" style={{ fill: p.y ? "#fff" : "#2A3342", fontSize: ".74em", fontWeight: 700 }}>{p.id}</text>
                  </g>
                ))}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao pergunta="Qual corte a árvore faz primeiro, o que mais reduz o erro quadrático dos resíduos?" opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setV(0); setK(iniU); setCresceu(false); }} recolher />
        {rev && !cresceu && <>
          <Seg rotulo="Variável do corte" opcoes={VAR.map((r, i) => ({ v: i as V, r }))} valor={v} onChange={(nv) => { setV(nv); setK(CORTES[nv].findIndex((c) => c.c === MELHOR[nv].c)); }} />
          <Controle rotulo="Corte" valor={Math.min(k, CORTES[v].length - 1)} min={0} max={CORTES[v].length - 1} passo={1} onChange={setK} mostrar={rotC(corte)} />
          <dl className="q7-lista">
            <div><dt>Erro quadrático restante</dt><dd>{num(corte.sse, 2)} de {num(SSE0, 2)}</dd></div>
          </dl>
        </>}
        {rev && cresceu && <dl className="q7-lista">
          {FOLHAS.map((f) => <div key={f.nome}><dt>{f.nome}: {lista(f.membros)}</dt><dd>{sinal(media(f.membros))}</dd></div>)}
        </dl>}
        <div className="q7-botoes">
          {rev && !cresceu && <Botao prim onClick={() => setCresceu(true)}>Crescer o segundo nível</Botao>}
          {rev && cresceu && <Botao onClick={() => setCresceu(false)}>Voltar ao primeiro corte</Botao>}
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
      </Painel>
    </Quadro>
  );
}

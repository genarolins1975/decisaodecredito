"use client";
import { useState } from "react";
import { Botao, Controle, Formula, Grafico, LinkSlide, Marca, Painel, Previsao, Quadro, Seg, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { DIDATICA, NA, XD, YA, YD, CFG_DIDATICA, modelo } from "@/lib/capitulo6/dados";
import { logit, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 03 · c6p3 · O palpite inicial. Uma PD única q para todas as propostas; a log loss média é mínima quando q é a taxa de
 * default da carteira, e o palpite em log odds é F₀ = ln(p̄ ÷ (1 − p̄)). Nas 16 propostas didáticas, 8 defaults: F₀ = 0
 * (PD de 50%) e perda de partida ln 2. Depois da previsão (que pede F₀ em log odds, com as confusões de escala: taxa no
 * lugar de log odds, chance no lugar de log odds), a curva da perda e o controle de q aparecem, e a chave leva ao ajuste
 * de 1.472 propostas do slide 11 (139 defaults, F₀ = −2,26). F₀ e a perda de partida conferidos com modelo() da
 * biblioteca: o f0 do boosting e a log loss do estágio zero.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
type Base = "did" | "aj";
const somaY = (y: readonly number[]) => y.reduce((s, v) => s + v, 0);
const BASES: Record<Base, { n: number; d: number; y: readonly number[]; nome: string }> = {
  did: { n: YD.length, d: somaY(YD), y: YD, nome: `${DIDATICA.length} propostas` },
  aj: { n: NA, d: somaY(YA), y: YA, nome: `${int(NA)} do ajuste` },
};
const F0 = Object.fromEntries((Object.keys(BASES) as Base[]).map((b) => [b, logit(BASES[b].d / BASES[b].n)])) as Record<Base, number>;
/** Log loss média de uma PD única q: a mesma função da biblioteca, com F = logit(q) para todas. */
const perdaQ = (b: Base, q: number) => perdaLog(BASES[b].y.map(() => logit(q)), BASES[b].y);
const PARTIDA = { did: perdaQ("did", BASES.did.d / BASES.did.n), aj: perdaQ("aj", BASES.aj.d / BASES.aj.n) };
// conferência: o palpite do boosting da biblioteca é este F₀
if (Math.abs(modelo(CFG_DIDATICA, XD, YD).f0 - F0.did) > 1e-12) throw new Error("F₀ diverge da biblioteca");
const Q0 = 0.3;

const OPCOES: Opcao[] = [
  { texto: `${num(BASES.did.d / BASES.did.n, 1)}: a taxa de default`, retorno: <>Confunde <b>probabilidade com log odds</b>. Somado como log odds, {num(BASES.did.d / BASES.did.n, 1)} daria PD de {pct(sigmoide(BASES.did.d / BASES.did.n), 1)} a todas, acima dos {pct(BASES.did.d / BASES.did.n, 0)} observados.</> },
  { texto: `0: as log odds de ${BASES.did.d} em ${BASES.did.n}`, certa: true, retorno: <>Isso: ln({BASES.did.d} ÷ {BASES.did.n - BASES.did.d}) = 0, PD de {pct(sigmoide(F0.did), 0)} para todas. A perda de partida é <b>{num(PARTIDA.did, 3)}</b>, o ln 2.</> },
  { texto: `1: as chances são de ${BASES.did.d} para ${BASES.did.n - BASES.did.d}`, retorno: <>Confunde <b>chance com log odds</b>. A chance {BASES.did.d} ÷ {BASES.did.n - BASES.did.d} vale 1; a log odds é o logaritmo dela, ln 1 = 0.</> },
];

export function S03Palpite({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [b, setB] = useState<Base>("did");
  const [q, setQ] = useState(Q0);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const B = BASES[b], taxa = B.d / B.n;
  const L = perdaQ(b, q);
  return (
    <Quadro slug="c6p3" pagina={pagina} layout="gl"
      titulo={rev ? undefined : "Qual número único dar a todas as propostas?"}
      sub={rev ? undefined : "Dezesseis propostas, as mesmas dos capítulos 4 e 5, e um palpite antes de qualquer árvore."}
      conclusao={!rev ? <>{BASES.did.d} das {BASES.did.n} propostas deram default. Antes de ver a perda, escolha ao lado o palpite F₀, em log odds, que a minimiza.</>
        : <>Com {B.nome}, a log loss da PD única é mínima na taxa, <b>{pct(taxa, b === "did" ? 0 : 2)}</b>: F₀ = ln({int(B.d)} ÷ {int(B.n - B.d)}) = <b>{num(F0[b], 2)}</b>, perda de partida {num(PARTIDA[b], 3)}. Em PD {pct(q, 0)}, a perda é {num(L, 3)}. Cada proposta erra de um jeito: <LinkSlide slug="c6p4">slide 4</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}; ${BASES.did.d} defaults). Ajuste: ${int(NA)} propostas sorteadas (semente ${base.meta.sementeDivisao}) do treino da mesma base, ${base.meta.treino}, ${int(BASES.aj.d)} defaults. Log loss média, log natural; F₀ é o palpite do boosting da biblioteca.`}>
      <Painel>
        <Grafico titulo={rev ? `Log loss de uma PD única: ${B.nome}` : "Uma PD única para as 16 propostas"} sub={rev ? "o mínimo cai na taxa" : "a perda abre depois da previsão"} rotulo={rev ? `Log loss em função da PD única; mínimo em ${pct(taxa, 2)}, F₀ ${num(F0[b], 2)}; na PD ${pct(q, 0)}, perda ${num(L, 3)}` : "As 16 propostas, 8 defaults, todas com a mesma PD; a curva da perda está oculta até a previsão"} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.6, r: 1.4, t: 1, b: 2.9 });
            const topo = d.fs * 5.6; // faixa das 16 propostas
            const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([0, 2], [d.h - m.b, topo + d.fs * 2.4]);
            const pts = Array.from({ length: 197 }, (_, i) => 0.01 + i * 0.005).filter((v) => perdaQ(b, v) <= 2).map((v) => ({ x: x(v), y: y(perdaQ(b, v)) }));
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const passo = (d.w - m.l - m.r) / BASES.did.n, alt = topo - d.fs * 2.2;
            return (
              <g>
                {/* faixa: as 16 propostas, cada uma com a mesma barra de PD */}
                {b === "did" ? DIDATICA.map((p, i) => {
                  const cx = m.l + passo * (i + 0.5);
                  return (
                    <g key={p.id}>
                      <rect x={cx - passo * 0.3} y={d.fs * 0.4} width={passo * 0.6} height={alt} fill="#F4F6F9" />
                      {rev ? <rect x={cx - passo * 0.3} y={d.fs * 0.4 + alt * (1 - q)} width={passo * 0.6} height={alt * q} fill="#176C73" className="q7-anim-d" />
                        : <text className="q7-rot--peq" x={cx} y={d.fs * 0.4 + alt / 2} dy=".35em" textAnchor="middle" style={{ fill: "#9AA1AD" }}>?</text>}
                      <Marca x={cx} y={topo - d.fs * 0.9} r={d.fs * 0.42} def={p.y === 1} />
                      <text className="q7-tick" x={cx} y={topo - d.fs * 0.9} dy="1.75em" textAnchor="middle">{p.id}</text>
                    </g>
                  );
                }) : <text className="q7-rot" x={(m.l + d.w - m.r) / 2} y={topo / 2} textAnchor="middle" style={{ fill: "#176C73" }}>{int(B.n)} propostas, {int(B.d)} defaults: a mesma PD de {pct(q, 0)} para todas</text>}
                {b === "did" && rev && <text className="q7-rot--peq" x={d.w - m.r} y={d.fs * 0.4} dy="-.3em" textAnchor="end" style={{ fill: "#176C73", ...halo }}>PD {pct(q, 0)} para todas</text>}
                {/* curva da perda */}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                <line className="q7-eixo" x1={m.l} x2={m.l} y1={y(0)} y2={y(2)} />
                {[0, 0.5, 1, 1.5, 2].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{num(v, 1)}</text></g>)}
                {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} className="q7-tick" x={x(v)} y={y(0)} dy="1.25em" textAnchor="middle">{pct(v, 0)}</text>)}
                <text className="q7-eixo-t" x={(m.l + d.w - m.r) / 2} y={y(0)} dy="2.6em" textAnchor="middle">PD única dada a todas</text>
                <text className="q7-eixo-t" x={m.l} y={y(2)} dy="-.5em">Log loss média</text>
                {rev ? <>
                  <path className="q7-linha q7-linha--ink" d={caminho(pts)} />
                  <line x1={x(taxa)} x2={x(taxa)} y1={y(0)} y2={y(PARTIDA[b])} stroke="#176C73" strokeWidth={2} strokeDasharray="6 5" />
                  <text className="q7-rot--peq" x={x(taxa)} y={y(0)} dy="-.5em" dx={taxa < 0.2 ? ".5em" : "-.5em"} textAnchor={taxa < 0.2 ? "start" : "end"} style={{ fill: "#176C73", fontWeight: 700, ...halo }}>taxa {pct(taxa, b === "did" ? 0 : 2)} · F₀ = {num(F0[b], 2)}</text>
                  <circle cx={x(q)} cy={y(Math.min(2, L))} r={d.fs * 0.42} fill="#176C73" stroke="#fff" strokeWidth={2.5} />
                  <text className="q7-rot" x={x(q)} y={y(Math.min(2, L))} dy="-1.1em" textAnchor="middle" style={{ fill: "#00205B", ...halo }}>{num(L, 3)}</text>
                </> : <text className="q7-rot" x={(m.l + d.w - m.r) / 2} y={y(1)} textAnchor="middle" style={{ fill: "#5B6475" }}>? a curva abre depois da previsão</text>}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao pergunta={`${BASES.did.d} das ${BASES.did.n} deram default. Que palpite F₀, em log odds, dá a menor log loss?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setB("did"); setQ(Q0); }} recolher />
        {rev && <>
          <Seg rotulo="Carteira" opcoes={[{ v: "did" as Base, r: BASES.did.nome }, { v: "aj" as Base, r: BASES.aj.nome }]} valor={b} onChange={setB} />
          <Controle rotulo="PD única" valor={q} min={0.01} max={0.99} passo={0.01} onChange={setQ} mostrar={`${pct(q, 0)} · F = ${num(logit(q), 2)}`} />
          <Formula compacta f={String.raw`F_0=\ln\frac{\bar p}{1-\bar p}=\ln\frac{${int(B.d).replace(".", "{.}")}}{${int(B.n - B.d).replace(".", "{.}")}}=${num(F0[b], 2).replace("−", "-").replace(",", "{,}")}`} />
        </>}
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setB("did"); setQ(Q0); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

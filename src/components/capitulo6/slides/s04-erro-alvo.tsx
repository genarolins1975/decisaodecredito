"use client";
import { useState } from "react";
import { Botao, Controle, Expandir, Formula, Grafico, LinkSlide, Marca, Painel, Previsao, Quadro, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, NA, XD, YA, YD, modelo } from "@/lib/capitulo6/dados";
import { logit, sigmoide } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 04 · c6p4 · O pseudo-resíduo. Em cima, a perda de uma proposta em função das log odds F: ℓ = ln(1 + e^−F) para um
 * default e ln(1 + e^F) para um adimplente, com a tangente no palpite atual; a inclinação é p − y, e menos ela, y − p, é
 * o erro que a próxima árvore ajusta. Embaixo, o resíduo de cada uma das 16 propostas didáticas nesse palpite. A turma
 * prevê o resíduo no palpite do slide 3 (F₀ = 0) antes de ver as barras; as alternativas erradas trocam o resíduo pelo
 * próprio y (o votar do slide 2) ou pela perda de cada proposta. Depois, o controle move o palpite comum; o atalho leva
 * ao F₀ do ajuste do slide 3 (−2,26). A derivação fica na expansão. A inclinação numérica (diferença central da perda)
 * confere a fórmula na tela.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const F_DID = modelo(CFG_DIDATICA, XD, YD).f0;
const F_AJ = logit(YA.reduce((s, v) => s + v, 0) / NA);
const perda1 = (y: number, F: number) => (y === 1 ? Math.log1p(Math.exp(-F)) : Math.log1p(Math.exp(F)));
// a inclinação da perda, por diferença central, confere p − y (a derivação da expansão)
const incl = (y: number, F: number) => (perda1(y, F + 1e-5) - perda1(y, F - 1e-5)) / 2e-5;
if (Math.abs(incl(1, 0.3) - (sigmoide(0.3) - 1)) > 1e-6 || Math.abs(incl(0, -1.1) - sigmoide(-1.1)) > 1e-6) throw new Error("inclinação diverge de p − y");
const sinal = (v: number) => `${v > 0 ? "+" : ""}${num(v, 2)}`;

const OPCOES: Opcao[] = [
  { texto: "+0,5 num default e −0,5 num adimplente", certa: true, retorno: <>Isso: com p = {pct(sigmoide(F_DID), 0)}, y − p vale ±0,5. É menos a inclinação da perda em F: <b>o quanto e para onde</b> cada proposta quer que F se mova.</> },
  { texto: "1 num default e 0 num adimplente: o próprio y", retorno: <>Confunde o alvo com o <b>default</b>. Árvores no y são o votar do slide 2; o boosting ajusta o que o palpite <b>errou</b>.</> },
  { texto: `${num(Math.log(2), 3)} nas 16: a perda de cada uma`, retorno: <>Confunde a perda com a <b>inclinação</b> dela. ln 2 é quanto cada proposta custa, igual para todas; não diz para que lado F deve ir.</> },
];

export function S04ErroAlvo({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [F, setF] = useState(F_DID);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const p = sigmoide(F);
  const R = YD.map((y) => y - p);
  return (
    <Quadro slug="c6p4" pagina={pagina} layout="gl"
      sub={rev ? undefined : "Em log loss, quanto vale o erro de cada proposta no palpite F₀ = 0?"}
      conclusao={!rev ? <>Palpite do slide 3: F₀ = {num(F_DID, 2)}, PD de {pct(p, 0)} para as 16. Que número cada proposta passa à próxima árvore? Responda ao lado.</>
        : <>No palpite F = {num(F, 2)} (PD {pct(p, 1)}), cada default tem erro y − p = <b>{sinal(1 - p)}</b> e cada adimplente <b>{sinal(-p)}</b>: a inclinação da perda com sinal trocado. {Math.abs(F - F_AJ) < 1e-9 ? <> No F₀ do ajuste, o default pesa {num((1 - p) / p, 1)} vezes o adimplente: a próxima árvore vai atrás dos defaults.</> : null} A próxima árvore ajusta esses 16 números: <LinkSlide slug="c6p5">slide 5</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}; y = 1 para default). Perda de uma proposta: log loss, log natural, com p = σ(F). F₀ do ajuste: ${int(NA)} propostas sorteadas (semente ${base.meta.sementeDivisao}) do treino da mesma base, ${base.meta.treino} (slide 3).`}>
      <Painel>
        <Grafico titulo="A perda de uma proposta e o erro de cada uma" sub={`no palpite F = ${num(F, 2)}`} rotulo={rev ? `No palpite ${num(F, 2)}, PD ${pct(p, 1)}: inclinação da perda ${num(p - 1, 2)} num default e ${num(p, 2)} num adimplente; resíduos ${sinal(1 - p)} e ${sinal(-p)}` : "Perda de um default e de um adimplente em função das log odds; os resíduos estão ocultos até a previsão"}
          tabela={rev ? <table><thead><tr><th>Proposta</th><th>y</th><th>y − p</th></tr></thead><tbody>{DIDATICA.map((q, i) => <tr key={q.id}><td>{q.id}</td><td>{q.y}</td><td>{num(R[i], 3)}</td></tr>)}</tbody></table> : undefined} arCelular="3 / 4">
          {(d) => {
            const m = margens(d.fs, { l: 3.2, r: 1, t: 1.4, b: 0 });
            const hSup = (d.h - m.t) * 0.5; // metade de cima: perda; de baixo: resíduos
            const x = escala([-4, 4], [m.l, d.w - m.r]), y = escala([0, 4.2], [m.t + hSup - d.fs * 2.4, m.t]);
            const fs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const tang = (yy: number) => { const s = p - yy, l0 = perda1(yy, F), w = 0.9; return `M${x(F - w)} ${y(l0 - s * w)}L${x(F + w)} ${y(l0 + s * w)}`; };
            const base = m.t + hSup + d.fs * 2.1, r0 = d.h - d.fs * 2.6, mid = (base + r0) / 2, ry = escala([-1, 1], [r0, base]);
            const passo = (d.w - m.l - m.r) / DIDATICA.length;
            return (
              <g>
                {/* perda de uma proposta em função de F */}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                {[0, 1, 2, 3, 4].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{v}</text></g>)}
                {[-4, -2, 0, 2, 4].map((v) => <text key={v} className="q7-tick" x={x(v)} y={y(0)} dy="1.25em" textAnchor="middle">{num(v, 0)}</text>)}
                <text className="q7-eixo-t" x={d.w - m.r} y={y(0)} dy="2.35em" textAnchor="end">log odds F</text>
                <text className="q7-eixo-t" x={m.l} y={m.t} dy="-.45em">perda ℓ</text>
                <path className="q7-linha q7-linha--fina" stroke="#5B6475" d={caminho(fs.map((v) => ({ x: x(v), y: y(perda1(1, v)) })))} />
                <path className="q7-linha q7-linha--fina q7-linha--mudo" strokeDasharray="10 6" d={caminho(fs.map((v) => ({ x: x(v), y: y(perda1(0, v)) })))} />
                <text className="q7-rot--peq" x={x(-0.35)} y={y(4.05)} textAnchor="end" style={{ fill: "#5B6475", ...halo }}>● default: ln(1 + e<tspan dy="-.45em" fontSize=".75em">−F</tspan><tspan dy=".45em">)</tspan></text>
                <text className="q7-rot--peq" x={x(0.35)} y={y(4.05)} textAnchor="start" style={{ fill: "#5B6475", ...halo }}>○ adimplente: ln(1 + e<tspan dy="-.45em" fontSize=".75em">F</tspan><tspan dy=".45em">)</tspan></text>
                <line x1={x(F)} x2={x(F)} y1={y(0)} y2={y(4.2)} stroke="#176C73" strokeWidth={2} strokeDasharray="5 5" />
                {rev && <>
                  <path d={tang(1)} stroke="#3D5A8A" strokeWidth={5} strokeLinecap="round" />
                  <path d={tang(0)} stroke="#3D5A8A" strokeWidth={5} strokeLinecap="round" />
                  {/* rótulo de cada inclinação na ponta alta da sua tangente */}
                  <text className="q7-rot--peq" x={Math.max(x(-4), x(F - 0.95))} y={y(perda1(1, F) + (1 - p) * 0.9)} dx={perda1(1, F) + (1 - p) * 0.9 > 3.3 ? "1.2em" : 0} dy={perda1(1, F) + (1 - p) * 0.9 > 3.3 ? "1.4em" : "-.5em"} textAnchor={F - 0.95 < -2.6 ? "start" : "middle"} style={{ fill: "#3D5A8A", fontWeight: 700, ...halo }}>● inclinação {num(p - 1, 2)}</text>
                  <text className="q7-rot--peq" x={Math.min(x(4), x(F + 0.95))} y={y(perda1(0, F) + p * 0.9)} dx={perda1(0, F) + p * 0.9 > 3.3 ? "-1.2em" : 0} dy={perda1(0, F) + p * 0.9 > 3.3 ? "1.4em" : "-.5em"} textAnchor={F + 0.95 > 2.6 ? "end" : "middle"} style={{ fill: "#3D5A8A", fontWeight: 700, ...halo }}>○ inclinação {num(p, 2)}</text>
                </>}
                {/* resíduos das 16 */}
                <text className="q7-eixo-t" x={m.l} y={base} dy="-.95em">erro de cada proposta, y − p</text>
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={mid} y2={mid} />
                {[-1, 0, 1].map((v) => <text key={v} className="q7-tick" x={m.l} dx="-.45em" y={ry(v)} dy=".34em" textAnchor="end">{sinal(v).replace(",00", "")}</text>)}
                {DIDATICA.map((q, i) => {
                  const cx = m.l + passo * (i + 0.5), r = R[i];
                  return (
                    <g key={q.id}>
                      {rev ? <>
                        <rect className="q7-anim-d" x={cx - passo * 0.3} y={Math.min(ry(r), mid)} width={passo * 0.6} height={Math.abs(ry(r) - mid)} fill={q.y ? "#00205B" : "#9AA1AD"} />
                        <text className="q7-rot--peq" x={cx} y={r > 0 ? ry(r) : mid} dy="-.35em" textAnchor="middle" style={{ fontSize: ".78em" }}>{sinal(r)}</text>
                      </> : <text className="q7-rot--peq" x={cx} y={mid} dy="-.6em" textAnchor="middle" style={{ fill: "#9AA1AD" }}>?</text>}
                      <Marca x={cx} y={r0 + d.fs * 0.9} r={d.fs * 0.36} def={q.y === 1} />
                      <text className="q7-tick" x={cx} y={r0 + d.fs * 0.9} dy="1.6em" textAnchor="middle" style={{ fontSize: ".78em" }}>{q.id}</text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao pergunta={`No palpite F₀ = 0 (PD de ${pct(sigmoide(F_DID), 0)}), quanto vale o erro de cada proposta?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setF(F_DID); }} recolher />
        {rev && <>
          <Controle rotulo="Palpite comum F" valor={F} min={-3} max={3} passo={0.01} onChange={setF} mostrar={`${num(F, 2)} · PD ${pct(p, 1)}`} />
          <div className="q7-botoes"><Botao onClick={() => setF(F_AJ)}>F₀ do ajuste ({num(F_AJ, 2)})</Botao><Botao onClick={() => setF(F_DID)}>F₀ das 16 (0)</Botao></div>
        </>}
        {rev && (
          <Expandir resumo="A derivação: de −∂ℓ/∂F a y − p">
            <Formula compacta f={String.raw`\begin{aligned}\ell&=-\big[y\ln p+(1-y)\ln(1-p)\big]\\ p&=\sigma(F),\quad \tfrac{dp}{dF}=p(1-p)\\ \tfrac{\partial \ell}{\partial F}&=-\big[y(1-p)-(1-y)\,p\big]=p-y\\ -\tfrac{\partial \ell}{\partial F}&=y-p\end{aligned}`} />
            <p className="q7-nota">Friedman (2001): pseudo-resíduo, o gradiente negativo da perda em cada proposta.</p>
          </Expandir>
        )}
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setF(F_DID); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

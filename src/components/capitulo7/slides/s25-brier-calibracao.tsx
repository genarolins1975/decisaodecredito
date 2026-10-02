"use client";
import { useMemo, useState } from "react";
import { Botao, Controle, escala, Expandir, Formula, Grafico, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, calibracaoGlobal, corp, faixasQuantis, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 25 · c7p11 · Menor Brier não prova melhor calibração. Modelo A: a logística com o nível deslocado em +a log odds
 * (boa fila; com a = 0 é a própria logística). Modelo B: PD constante igual à taxa da própria janela (nível certo no
 * agregado por construção, nenhuma separação; usa uma informação que só existe depois e serve apenas para isolar a
 * propriedade). Abre em a = 0: A já tem Brier menor e erro de calibração maior que B. A previsão pergunta a partir de
 * que deslocamento B passa a ter o Brier menor; o ponto de virada sai por bisseção sobre o Brier da biblioteca, e o
 * controle só abre com a resposta certa. A decomposição CORP (Dimitriadis, Gneiting e Jordan, 2021) separa o Brier
 * sem faixas: BS = MCB − DSC + UNC, com a curva crescente mais próxima dos dados (isotônica, slide 30) como
 * referência; as barras mostram MCB e DSC de A, de B e do boosting sem recalibrar ("cru").
 */
const TAXA = D / N;
const PB = PL.map(() => TAXA);
const FB = faixasQuantis(Y, PB, 1);
const CB = corp(Y, PB), CL = corp(Y, PL), CG = corp(Y, PGR);
/** Deslocamento a partir do qual o Brier de A passa o de B (o Brier de A cresce com a acima do ótimo). */
const VIRADA = (() => { let lo = 0, hi = 3; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (brier(Y, transformar(PL, m, 1)) < CB.bs) lo = m; else hi = m; } return (lo + hi) / 2; })();
const A_MEIO = 0.4, A_ALTO = 1.4;
const C_MEIO = corp(Y, transformar(PL, A_MEIO, 1)), C_ALTO = corp(Y, transformar(PL, A_ALTO, 1));
/** zero exibido sem sinal: a decomposição de B dá zero por construção, e o arredondamento não pode virar "−0". */
const n5 = (v: number) => num(Math.abs(v) < 5e-6 ? 0 : v, 5);
const OPS = [
  { texto: "Logo acima de 0", certa: false, retorno: <>Com a = {num(A_MEIO, 1)}, A ainda tem Brier {num(C_MEIO.bs, 5)} contra {num(CB.bs, 5)} de B, com erro de calibração (MCB) de {num(C_MEIO.mcb, 5)} contra zero. A separação paga o erro de nível. Confunde Brier com calibração.</> },
  { texto: `Perto de +${num(VIRADA, 1)}`, certa: true, retorno: <>Isso: só a partir de a = {num(VIRADA, 2)}. Até lá, A vence no Brier estando pior calibrado.</> },
  { texto: "Nunca, porque A ordena bem", certa: false, retorno: <>Com a = {num(A_ALTO, 1)}, A tem Brier {num(C_ALTO.bs, 5)} contra {num(CB.bs, 5)} de B: o erro de calibração cresce com o deslocamento e passa a separação. Confunde Brier com discriminação.</> },
];

export function S25BrierCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(0);
  const [esc, setEsc] = useState<number | null>(null);
  const PA = useMemo(() => transformar(PL, a, 1), [a]); const FA = useMemo(() => faixasQuantis(Y, PA, 10), [PA]);
  const CA = useMemo(() => corp(Y, PA), [PA]); const gA = calibracaoGlobal(Y, PA);
  const vence = CA.bs < CB.bs;
  const revelado = esc !== null && OPS[esc].certa;
  const barras = [{ r: a === 0 ? "A (logística)" : `A, a = +${num(a, 1)}`, c: CA }, { r: "B (constante)", c: CB }, ...(revelado ? [{ r: "Boosting cru", c: CG }] : [])];
  const mx = Math.max(...barras.flatMap((b) => [b.c.mcb, b.c.dsc])) * 1.05;
  return (
    <Quadro slug="c7p11" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Menor Brier prova melhor calibração?"}
      sub={revelado ? undefined : "A ordena bem; B dá a todos a mesma PD, a taxa da janela."}
      conclusao={!revelado ? <>Com a = {num(a, 1)}: Brier de A = {num(CA.bs, 5)}; de B = {num(CB.bs, 5)}. Subindo o nível de A, quando B passa a ter o Brier menor? Responda antes de mover o controle.</>
        : vence ? <>Com a = {num(a, 1)}: <b>A tem o Brier menor e está pior calibrado</b> (MCB {num(CA.mcb, 5)} contra {n5(CB.mcb)} de B), compensado pela separação (DSC {num(CA.dsc, 5)}); B só vence a partir de a = {num(VIRADA, 2)}. O Brier do slide 23 soma as duas coisas; o laboratório do slide 26 deixa mexer no nível e na inclinação.</>
        : <>Com a = {num(a, 1)}, B passa a ter o Brier menor: o erro de calibração de A (MCB {num(CA.mcb, 5)}) superou a vantagem de separação (DSC {num(CA.dsc, 5)}). A fila de A não mudou; a PD média foi a {pct(gA.pdMedia!, 1)} contra {pct(TAXA, 1)} observados.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. A: σ(logit p + a) sobre a logística. B: PD constante de ${pct(TAXA, 2)}, a taxa da própria janela (informação posterior, só para isolar a propriedade). Faixas: decis de A. Boosting cru: sem recalibrar. CORP: Dimitriadis, Gneiting e Jordan (2021), PNAS 118(8).`}>
      <Painel>
        <div className="q7-g2-s25">
          <Confiabilidade titulo={a === 0 ? "A: a logística" : "A: boa fila, nível deslocado"} sub={`AUC ${num(aucPorPares(Y, PA).auc!, 3)} · ■: B`} rotulo={`Curva de confiabilidade do modelo A por decil; o modelo B é um único ponto em ${pct(TAXA, 1)}`} max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: FA, classe: "prob", linha: true, ic: true }]} anotar={false}
            extra={(x, y, d) => <g><rect x={x(FB[0].pdMedia!) - d.fs * 0.42} y={y(FB[0].obs!) - d.fs * 0.42} width={d.fs * 0.84} height={d.fs * 0.84} fill="#fff" stroke="#00205B" strokeWidth={2.5} /><text className="q7-rot--peq" x={x(FB[0].pdMedia!) + d.fs * 0.8} y={y(FB[0].obs!) + d.fs * 1.1} style={{ fill: "#00205B", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>B</text></g>} />
          <Grafico titulo="Brier e partes" sub={revelado ? "BS = MCB − DSC + UNC" : "partes depois da previsão"} rotulo={barras.map((b) => revelado ? `${b.r}: Brier ${n5(b.c.bs)}, MCB ${n5(b.c.mcb)}, DSC ${n5(b.c.dsc)}` : `${b.r}: Brier ${n5(b.c.bs)}`).join("; ")} arCelular="4 / 3"
            tabela={<table><caption>Decomposição CORP do Brier</caption><thead><tr><th>Modelo</th><th>BS</th><th>MCB</th><th>DSC</th></tr></thead><tbody>{barras.map((b) => <tr key={b.r}><td>{b.r}</td><td>{n5(b.c.bs)}</td><td>{revelado ? n5(b.c.mcb) : "oculto"}</td><td>{revelado ? n5(b.c.dsc) : "oculto"}</td></tr>)}</tbody></table>}>
            {(d) => {
              const x0 = d.fs * 0.2, x = escala([0, mx], [x0, d.w - d.fs * 5.6]); const lh = Math.min(d.fs * 4.6, d.h / barras.length); const bh = d.fs * 0.7;
              return <g>{barras.map((b, i) => { const y0 = lh * i + d.fs * 1.1; return <g key={b.r}>
                <text className="q7-rot" x={x0} y={y0}>{b.r}<tspan dx="10" style={{ fill: "#5B6475", fontWeight: 400 }}>Brier {n5(b.c.bs)}</tspan></text>
                {revelado ? <>
                  <rect x={x0} y={y0 + d.fs * 0.5} width={Math.max(1.5, x(b.c.mcb) - x0)} height={bh} fill="#176C73" />
                  <text className="q7-rot--peq" x={Math.max(x0 + 1.5, x(b.c.mcb)) + d.fs * 0.35} y={y0 + d.fs * 0.5 + bh / 2} dy=".35em" style={{ fill: "#176C73", fontWeight: 700 }}>MCB {n5(b.c.mcb)}</text>
                  <rect x={x0} y={y0 + d.fs * 0.7 + bh} width={Math.max(1.5, x(b.c.dsc) - x0)} height={bh} fill="#DCE3EF" stroke="#3D5A8A" strokeWidth={1.5} />
                  <text className="q7-rot--peq" x={Math.max(x0 + 1.5, x(b.c.dsc)) + d.fs * 0.35} y={y0 + d.fs * 0.7 + bh * 1.5} dy=".35em" style={{ fill: "#3D5A8A", fontWeight: 700 }}>DSC {n5(b.c.dsc)}</text>
                </> : <text className="q7-rot--peq" x={x0} y={y0 + d.fs * 1.4} style={{ fill: "#5B6475" }}>calibração (MCB) e discriminação (DSC): ?</text>}
              </g>; })}
              {revelado && <text className="q7-rot--peq" x={x0} y={lh * barras.length + d.fs * 0.6} style={{ fill: "#5B6475" }}>cheia: calibração (MCB) · contorno: discriminação (DSC)</text>}</g>;
            }}
          </Grafico>
        </div>
        <div className="q7-g2-linha">
          {revelado ? <Controle rotulo="Nível de A: a, em log odds" valor={a} min={0} max={1.4} passo={0.1} onChange={setA} mostrar={`+${num(a, 1)}`} escala={["0: a logística", "+1,4"]} /> : <p className="q7-nota">O controle do nível de A abre depois da previsão.</p>}
          <div className="q7-botoes"><Botao sec onClick={() => { setA(0); setEsc(null); }}>Restaurar</Botao></div>
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de mover o nível" pergunta="Subindo o nível de A, a partir de que deslocamento a o Brier de B fica menor?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {revelado && <>
          <Expandir resumo="Como se calcula">
            <Formula compacta f={String.raw`\mathrm{MCB}=\mathrm{BS}-\mathrm{BS}_{\mathrm{iso}},\quad \mathrm{DSC}=\mathrm{UNC}-\mathrm{BS}_{\mathrm{iso}},\quad \mathrm{UNC}=\bar o(1-\bar o)`} />
            <p className="q7-nota">MCB: erro de calibração; DSC: discriminação; UNC = {num(CL.unc, 5)}, igual para todos. BS<sub>iso</sub> é o Brier da curva crescente mais próxima dos dados (isotônica, slide 30), ajustada na própria amostra: diagnóstico, não calibrador. Entre a logística e o boosting sem recalibrar, o Brier difere {num(CG.bs - CL.bs, 5)}; a discriminação explica {num(CL.dsc - CG.dsc, 5)} disso e a calibração, {num(CG.mcb - CL.mcb, 5)}. Por faixas (Murphy, 1973) a soma não fecha: sobra um resíduo.</p>
          </Expandir>
        </>}
      </Painel>
    </Quadro>
  );
}

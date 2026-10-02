"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, LinkSlide, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, EAD, N, PG, PGR, PLATT, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, ks, media } from "@/lib/capitulo7/metricas";
import { fmtReais, PARAMETROS, parcelas, realizado } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 31 · c7p37 · O que muda depois de recalibrar. Boosting sem recalibrar contra o mesmo boosting com o Platt do curso
 * (parâmetros estimados antes da janela). Com corte fixo de PD, decisões mudam sem que a fila mude; com a mesma
 * fração recusada (o corte transportado pela própria transformação), as decisões são idênticas. O resultado esperado
 * vem do motor econômico (src/lib/visuais/economia) com a PD de cada versão; o realizado usa o desfecho da janela e
 * só existe depois dela. Rodada 2: os rótulos dos cortes ficam fora do feixe, a leitura conclui o erro da promessa de
 * cada versão (esperado menos realizado) e aponta o slide 32; a fonte lista as cinco hipóteses do motor.
 */
type Modo = "fixo" | "fracao";
const sig = (z: number) => 1 / (1 + Math.exp(-z));
const transporta = (c: number) => sig(PLATT.a + PLATT.b * Math.log(c / (1 - c)));
const AUC = aucPorPares(Y, PGR).auc!, KS = ks(Y, PGR).ks;
const PM = media(PG)!, OBS = D / N;
const P = PARAMETROS;
/** erro da promessa: esperado pela PD menos realizado na janela, em palavras */
const erro = (e: number, r: number) => `${fmtReais(Math.abs(e - r))} ${e > r ? "acima" : "abaixo"}`;
function lado(p: readonly number[], c: number) {
  const pc = parcelas(p as number[], EAD as number[], c); let real = 0, def = 0;
  for (let i = 0; i < N; i++) if (p[i] < c) { real += realizado(Y[i], EAD[i]); def += Y[i]; }
  return { aprovados: pc.aprovados, esperado: pc.total, realizado: real, defaults: def };
}

export function S31DepoisDeRecalibrar({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("fixo");
  const [c, setC] = useState(0.14);
  const c2 = modo === "fixo" ? c : transporta(c);
  const antes = lado(PGR, c), depois = lado(PG, c2);
  let mudam = 0; for (let i = 0; i < N; i++) if ((PGR[i] < c) !== (PG[i] < c2)) mudam++;
  const lin = [
    { r: "Aprovados", a: int(antes.aprovados), d: int(depois.aprovados) },
    { r: "Defaults aprovados", a: `${antes.defaults} (${pct(antes.defaults / Math.max(1, antes.aprovados), 1)})`, d: `${depois.defaults} (${pct(depois.defaults / Math.max(1, depois.aprovados), 1)})` },
    { r: "Esperado pela PD", a: fmtReais(antes.esperado), d: fmtReais(depois.esperado) },
    { r: "Realizado na janela", a: fmtReais(antes.realizado), d: fmtReais(depois.realizado) },
  ];
  return (
    <Quadro slug="c7p37" pagina={pagina} layout="gl"
      conclusao={modo === "fixo"
        ? <>Mesmo corte de {pct(c, 1)} nas duas escalas: <b>{mudam} decisões mudam</b> sem que a fila mude. A PD entra no resultado esperado: sem calibrar, a promessa fica {erro(antes.esperado, antes.realizado)} do que a janela entrega; com o Platt do curso, cuja PD média é {pct(PM, 1)} contra {pct(OBS, 1)} observados, <b>{erro(depois.esperado, depois.realizado)}</b>. Qual corte, então? <LinkSlide slug="c7p18">Slide 32</LinkSlide>.</>
        : <>Recusando a mesma fração, o corte de {pct(c, 1)} vira <b>{pct(c2, 2)}</b> na escala do Platt e {mudam === 0 ? "nenhuma decisão muda" : `${mudam} decisões mudam`}: só trocou a régua. Muda a promessa à diretoria: {fmtReais(antes.esperado)} contra {fmtReais(depois.esperado)}, para os mesmos {int(antes.aprovados)} aprovados. O <LinkSlide slug="c7p18">slide 32</LinkSlide> escolhe o corte pela conta.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Platt do curso (a = ${num(PLATT.a, 4)}, b = ${num(PLATT.b, 4)}), estimado antes da janela. Motor: receita ${pct(P.receita, 0)}, perda ${pct(P.lgd, 0)}, funding ${pct(P.funding, 0)} e capital ${pct(P.capital, 0)} da exposição; custo R$ ${P.operacao}. Realizado com ${D} defaults: ruidoso.`}>
      <Painel titulo="Cada proposta, antes e depois do Platt">
        <Grafico rotulo={`${N} propostas ligadas da PD sem calibrar à PD com Platt; ${mudam} mudam de decisão no corte`} arCelular="4 / 3">
          {(d) => {
            const x = escala([0, 0.4], [d.fs * 1.2, d.w - d.fs * 1.2]); const yA = d.fs * 3.2, yB = d.h - d.fs * 3.2; const cl = (v: number) => Math.min(0.4, v);
            return (
              <g>
                <text className="q7-eixo-t" x={x(0.4)} y={yA - d.fs * 1.75} textAnchor="end">PD sem calibrar</text>
                <text className="q7-eixo-t" x={x(0.4)} y={yB + d.fs * 2.7} textAnchor="end">PD com Platt</text>
                {[yA, yB].map((yy, k) => <g key={k}><line className="q7-eixo" x1={x(0)} x2={x(0.4)} y1={yy} y2={yy} />{[0, 0.1, 0.2, 0.3, 0.4].map((t) => <text key={t} className="q7-tick" x={x(t)} y={yy} dy={k ? "1.2em" : "-.5em"} textAnchor="middle">{pct(t, 0)}</text>)}</g>)}
                {PGR.map((p, i) => (PGR[i] < c) === (PG[i] < c2) ? <line key={i} x1={x(cl(p))} y1={yA} x2={x(cl(PG[i]))} y2={yB} stroke="#9AA1AD" strokeOpacity={0.18} /> : null)}
                {PGR.map((p, i) => (PGR[i] < c) !== (PG[i] < c2) ? <line key={`m${i}`} x1={x(cl(p))} y1={yA} x2={x(cl(PG[i]))} y2={yB} stroke="#A85A0C" strokeWidth={2} strokeOpacity={0.85} /> : null)}
                <line className="q7-corte" x1={x(c)} x2={x(c)} y1={yA - d.fs * 2.4} y2={yA + d.fs * 1.2} />
                <line className="q7-corte" x1={x(cl(c2))} x2={x(cl(c2))} y1={yB - d.fs * 1.2} y2={yB + d.fs * 2.9} />
                <text className="q7-corte-t q7-s31-lbl" x={x(c) + d.fs * 0.4} y={yA - d.fs * 1.75}>corte {pct(c, 1)}</text>
                <text className="q7-corte-t q7-s31-lbl" x={x(cl(c2)) + d.fs * 0.4} y={yB + d.fs * 2.7}>corte {pct(c2, modo === "fixo" ? 1 : 2)}</text>
              </g>
            );
          }}
        </Grafico>
        <div className="q7-s31-ctl">
          <Seg rotulo="Regra de corte" opcoes={[{ v: "fixo" as Modo, r: "Mesmo corte de PD" }, { v: "fracao" as Modo, r: "Mesma fração recusada" }]} valor={modo} onChange={setModo} cor />
          <Controle rotulo="Corte de PD sem calibrar" valor={c} min={0.06} max={0.25} passo={0.005} onChange={setC} mostrar={pct(c, 1)} />
        </div>
      </Painel>
      <Painel>
        <p className="q7-k">Âmbar: {mudam} propostas que mudam de decisão</p>
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Na janela</th><th>Sem calibrar</th><th>Com Platt</th></tr></thead>
          <tbody>{lin.map((l) => <tr key={l.r}><th>{l.r}</th><td>{l.a}</td><td>{l.d}</td></tr>)}</tbody>
        </table>
        <div className="q7-s31-dois">
          <div><p className="q7-k">Não muda</p><p className="q7-p">AUC {num(AUC, 4)}, KS {num(KS, 4)}, ganho e lift.</p></div>
          <div><p className="q7-k">Muda</p><p className="q7-p">PD média ({pct(media(PGR)!, 1)} para {pct(PM, 1)}), Brier, log loss e decisões.</p></div>
        </div>
        <div className="q7-botoes"><Botao onClick={() => setModo(modo === "fixo" ? "fracao" : "fixo")}>{modo === "fixo" ? "Ver com a mesma fração" : "Ver com o mesmo corte"}</Botao><Botao sec onClick={() => { setModo("fixo"); setC(0.14); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

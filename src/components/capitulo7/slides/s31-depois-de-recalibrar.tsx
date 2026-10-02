"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Opcao, type Pagina } from "../base";
import { D, EAD, N, PG, PGR, PLATT, PT, RES, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, ks, media } from "@/lib/capitulo7/metricas";
import { esperado, fmtReais, PARAMETROS, parcelas, realizado } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 31 · c7p37 · O que muda depois de recalibrar. Boosting sem recalibrar contra o mesmo boosting com o Platt do curso
 * (parâmetros estimados antes da janela). Com corte fixo de PD, decisões mudam sem que a fila mude; com a mesma
 * fração recusada (o corte transportado pela própria transformação), as decisões são idênticas. O resultado esperado
 * vem do motor econômico (src/lib/visuais/economia) com a PD de cada versão; o realizado usa o desfecho da janela e
 * só existe depois dela. Rodada 2: os rótulos dos cortes ficam fora do feixe, a leitura conclui o erro da promessa de
 * cada versão (esperado menos realizado) e aponta o slide 32; a fonte lista as cinco hipóteses do motor. Rodada 3: o
 * quadro "Muda" acompanha a regra (com a mesma fração, as decisões não mudam) e a tabela traz o resultado dos
 * aprovados pela PD verdadeira, o que cada versão entrega em média, sem a sorte dos 81 defaults da janela. Rodada 4:
 * o quadro abre com uma previsão (quantas decisões mudam com o mesmo corte de 14%); antes dela, as linhas que mudam não
 * se destacam, a tabela e os controles ficam fechados e o subtítulo pergunta em vez de afirmar. A alternativa certa sai
 * da contagem. A leitura fecha com o veredito: no mesmo corte, quanto o Platt vale pela PD verdadeira e quanto erra a
 * promessa; com a mesma fração, a decisão não muda e só a promessa muda.
 */
type Modo = "fixo" | "fracao";
const sig = (z: number) => 1 / (1 + Math.exp(-z));
const transporta = (c: number) => sig(PLATT.a + PLATT.b * Math.log(c / (1 - c)));
const AUC = aucPorPares(Y, PGR).auc!, KS = ks(Y, PGR).ks;
const PM = media(PG)!;
const P = PARAMETROS;
/** erro da promessa: esperado pela PD menos realizado na janela, em palavras */
const erro = (e: number, r: number) => `${fmtReais(Math.abs(e - r))} ${e > r ? "acima" : "abaixo"}`;
const C0 = 0.14;
/** decisões que mudam com o mesmo corte de PD: de aprovada para recusada e o contrário */
function mudancas(c: number, c2: number) {
  let recusa = 0, aprova = 0;
  for (let i = 0; i < N; i++) { const a0 = PGR[i] < c, a1 = PG[i] < c2; if (a0 && !a1) recusa++; if (!a0 && a1) aprova++; }
  return { recusa, aprova, total: recusa + aprova };
}
const M0 = mudancas(C0, C0).total;
const PREV: Opcao[] = [
  { texto: "Nenhuma: o Platt não muda a fila", certa: M0 === 0, retorno: `Confunde fila com corte. A ordem fica, mas o corte é um número de PD: o Platt leva a PD média de ${pct(media(PGR)!, 1)} para ${pct(PM, 1)}, e quem cruza ${pct(C0, 0)} muda de decisão.` },
  { texto: "Umas dez, só as vizinhas do corte", certa: M0 > 0 && M0 <= 30, retorno: `Subestima o deslocamento: o Platt sobe a PD de quase toda a carteira (média de ${pct(media(PGR)!, 1)} para ${pct(PM, 1)}), e uma faixa larga de propostas atravessa o corte, não só as vizinhas.` },
  { texto: "Mais de cem", certa: M0 > 100, retorno: `Isso: ${M0} propostas atravessam o corte de ${pct(C0, 0)} sem que a fila mude.` },
];
const CERTA = PREV.findIndex((o) => o.certa);
function lado(p: readonly number[], c: number) {
  const pc = parcelas(p as number[], EAD as number[], c); let real = 0, def = 0;
  for (let i = 0; i < N; i++) if (p[i] < c) { real += realizado(Y[i], EAD[i]); def += Y[i]; }
  let verdadeiro = 0; for (let i = 0; i < N; i++) if (p[i] < c) verdadeiro += esperado(PT[i], EAD[i]);
  return { aprovados: pc.aprovados, esperado: pc.total, realizado: real, verdadeiro, defaults: def };
}

export function S31DepoisDeRecalibrar({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("fixo");
  const [c, setC] = useState(C0);
  const [prev, setPrev] = useState<number | null>(null);
  const revelado = prev === CERTA;
  const c2 = modo === "fixo" ? c : transporta(c);
  const antes = lado(PGR, c), depois = lado(PG, c2);
  const mu = mudancas(c, c2), mudam = mu.total;
  const restaurar = () => { setModo("fixo"); setC(C0); setPrev(null); };
  const lin = [
    { r: "Aprovados", a: int(antes.aprovados), d: int(depois.aprovados) },
    { r: "Defaults aprovados", a: `${antes.defaults} (${pct(antes.defaults / Math.max(1, antes.aprovados), 1)})`, d: `${depois.defaults} (${pct(depois.defaults / Math.max(1, depois.aprovados), 1)})` },
    { r: "Esperado pela PD", a: fmtReais(antes.esperado), d: fmtReais(depois.esperado) },
    { r: "Realizado na janela", a: fmtReais(antes.realizado), d: fmtReais(depois.realizado) },
    { r: "Pela PD verdadeira", a: fmtReais(antes.verdadeiro), d: fmtReais(depois.verdadeiro), on: true },
  ];
  const direcao = mu.aprova === 0 ? <>o Platt recusa {mu.recusa} a mais ({int(antes.aprovados)} aprovados viram {int(depois.aprovados)})</> : mu.recusa === 0 ? <>o Platt aprova {mu.aprova} a mais</> : <>{mu.recusa} viram recusa e {mu.aprova} viram aprovação</>;
  const vale = depois.verdadeiro - antes.verdadeiro;
  return (
    <Quadro slug="c7p37" pagina={pagina} layout="gl"
      sub={revelado ? undefined : <>A fila fica e o nível muda. E a decisão, com o mesmo corte de PD?</>}
      conclusao={!revelado ? <>O Platt do curso muda o nível do boosting sem mexer na fila (AUC {num(AUC, 4)}). Antes de contar as decisões, a previsão.</>
        : modo === "fixo"
        ? <>Mesmo corte de {pct(c, 1)}: <b>{mudam} decisões mudam</b> sem que a fila mude; {direcao}. Pela PD verdadeira, os aprovados valem {fmtReais(depois.verdadeiro)} com Platt e {fmtReais(antes.verdadeiro)} sem ({vale >= 0 ? "+" : "−"}{fmtReais(Math.abs(vale))}), mas o Platt promete {fmtReais(depois.esperado)}, {erro(depois.esperado, depois.verdadeiro)} do que entrega. <b>Veredito: com corte fixo, recalibrar muda a política; o nível estimado na validação ({pct(RES.gbm_val.obs, 1)} de default) erra a promessa.</b> Qual corte? <LinkSlide slug="c7p18">Slide 32</LinkSlide>.</>
        : <>Recusando a mesma fração, o corte de {pct(c, 1)} vira <b>{pct(c2, 2)}</b> na escala do Platt e {mudam === 0 ? "nenhuma decisão muda" : `${mudam} decisões mudam`}: só trocou a régua. Muda a promessa: {fmtReais(antes.esperado)} contra {fmtReais(depois.esperado)}, para os mesmos {int(antes.aprovados)} aprovados que, pela PD verdadeira, valem {fmtReais(depois.verdadeiro)}. <b>Veredito: recalibrar muda decisões só com corte fixo de PD; a promessa muda sempre.</b> <LinkSlide slug="c7p18">Slide 32</LinkSlide>.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Platt do curso: a = ${num(PLATT.a, 4)}, b = ${num(PLATT.b, 4)}, estimado na validação. Motor: receita ${pct(P.receita, 0)}, perda ${pct(P.lgd, 0)}, funding ${pct(P.funding, 0)} e capital ${pct(P.capital, 0)} da exposição; custo R$ ${P.operacao}. Realizado com ${D} defaults: ruidoso; PD verdadeira só em base sintética.`}>
      <Painel titulo="Cada proposta, antes e depois do Platt">
        <Grafico rotulo={`${N} propostas ligadas da PD sem calibrar à PD com Platt${revelado ? `; ${mudam} mudam de decisão no corte` : ""}`} arCelular="4 / 3">
          {(d) => {
            const x = escala([0, 0.4], [d.fs * 1.2, d.w - d.fs * 1.2]); const yA = d.fs * 3.2, yB = d.h - d.fs * 3.2; const cl = (v: number) => Math.min(0.4, v);
            const muda = (i: number) => revelado && (PGR[i] < c) !== (PG[i] < c2);
            return (
              <g>
                <text className="q7-eixo-t" x={x(0.4)} y={yA - d.fs * 1.75} textAnchor="end">PD sem calibrar</text>
                <text className="q7-eixo-t" x={x(0.4)} y={yB + d.fs * 2.7} textAnchor="end">PD com Platt</text>
                {[yA, yB].map((yy, k) => <g key={k}><line className="q7-eixo" x1={x(0)} x2={x(0.4)} y1={yy} y2={yy} />{[0, 0.1, 0.2, 0.3, 0.4].map((t) => <text key={t} className="q7-tick" x={x(t)} y={yy} dy={k ? "1.2em" : "-.5em"} textAnchor="middle">{pct(t, 0)}</text>)}</g>)}
                {PGR.map((p, i) => !muda(i) ? <line key={i} x1={x(cl(p))} y1={yA} x2={x(cl(PG[i]))} y2={yB} stroke="#9AA1AD" strokeOpacity={0.18} /> : null)}
                {PGR.map((p, i) => muda(i) ? <line key={`m${i}`} x1={x(cl(p))} y1={yA} x2={x(cl(PG[i]))} y2={yB} stroke="#A85A0C" strokeWidth={2} strokeOpacity={0.85} /> : null)}
                <line className="q7-corte" x1={x(c)} x2={x(c)} y1={yA - d.fs * 2.4} y2={yA + d.fs * 1.2} />
                <line className="q7-corte" x1={x(cl(c2))} x2={x(cl(c2))} y1={yB - d.fs * 1.2} y2={yB + d.fs * 2.9} />
                <text className="q7-corte-t q7-s31-lbl" x={x(c) + d.fs * 0.4} y={yA - d.fs * 1.75}>corte {pct(c, 1)}</text>
                <text className="q7-corte-t q7-s31-lbl" x={x(cl(c2)) + d.fs * 0.4} y={yB + d.fs * 2.7}>corte {pct(c2, modo === "fixo" ? 1 : 2)}</text>
              </g>
            );
          }}
        </Grafico>
        <div className="q7-s31-ctl" inert={!revelado} style={revelado ? undefined : { visibility: "hidden" }}>
          <Seg rotulo="Regra de corte" opcoes={[{ v: "fixo" as Modo, r: "Mesmo corte de PD" }, { v: "fracao" as Modo, r: "Mesma fração recusada" }]} valor={modo} onChange={setModo} cor />
          <Controle rotulo="Corte de PD sem calibrar" valor={c} min={0.06} max={0.25} passo={0.005} onChange={setC} mostrar={pct(c, 1)} />
        </div>
      </Painel>
      <Painel>
        {!revelado ? (
          <Previsao pergunta={<>Mesmo corte de {pct(C0, 0)} antes e depois do Platt do curso. Quantas das {N} decisões mudam?</>} opcoes={PREV} escolha={prev} onEscolha={setPrev} recolher />
        ) : (
          <>
            <p className="q7-k">Âmbar: {mudam} propostas que mudam de decisão</p>
            <table className="q7-tab">
              <thead><tr><th className="q7-t-l">Na janela</th><th>Sem calibrar</th><th>Com Platt</th></tr></thead>
              <tbody>{lin.map((l) => <tr key={l.r} data-on={"on" in l ? "1" : undefined}><th>{l.r}</th><td>{l.a}</td><td>{l.d}</td></tr>)}</tbody>
            </table>
            <div className="q7-s31-dois">
              <div><p className="q7-k">Não muda</p><p className="q7-p">AUC {num(AUC, 4)}, KS {num(KS, 4)}, ganho e lift.</p></div>
              <div><p className="q7-k">Muda</p><p className="q7-p">{modo === "fixo" ? <>PD média ({pct(media(PGR)!, 1)} para {pct(PM, 1)}), Brier, log loss e {mudam} decisões.</> : <>PD média, Brier, log loss e a promessa; decisões, só com corte fixo de PD.</>}</p></div>
            </div>
          </>
        )}
        <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

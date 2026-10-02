"use client";
import { useState } from "react";
import { Botao, Controle, Expandir, Formula, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, calibracaoGlobal, corp, faixasQuantis, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 25 · c7p11 · Menor Brier não prova melhor calibração. Modelo A: a logística com o nível deslocado em +a log odds
 * (boa fila, nível errado). Modelo B: PD constante igual à taxa da própria janela (nível certo no agregado por
 * construção, nenhuma separação; usa uma informação que só existe depois e serve apenas para isolar a propriedade).
 * Com a = 0,8, A tem Brier menor e está pior calibrado. Depois da previsão, a decomposição CORP (Dimitriadis, Gneiting e
 * Jordan, 2021) separa o Brier sem faixas: BS = MCB − DSC + UNC, com a curva crescente mais próxima dos dados (isotônica,
 * slide 30) como referência; ao lado, os dois modelos reais da janela, a logística e o boosting sem recalibrar.
 */
const TAXA = D / N;
const A0 = 0.8;
const PB = PL.map(() => TAXA);
const FB = faixasQuantis(Y, PB, 1);
const CB = corp(Y, PB), CL = corp(Y, PL), CG = corp(Y, PGR);
const EXCESSO = calibracaoGlobal(Y, transformar(PL, A0, 1)).esperados / D - 1;
/** zero exibido sem sinal: a decomposição de B dá zero por construção, e o arredondamento não pode virar "−0". */
const n5 = (v: number) => num(Math.abs(v) < 5e-6 ? 0 : v, 5);
const OPS = [
  { texto: "A está mais bem calibrado, porque tem Brier menor", certa: false, retorno: <>Não: os pontos de A ficam abaixo da diagonal em todas as faixas. O Brier menor vem da <b>separação</b>, não do nível.</> },
  { texto: "B tem o nível certo e não separa ninguém; A separa e erra o nível", certa: true, retorno: <>Isso. O Brier soma as duas coisas num número; a decomposição abaixo as separa.</> },
  { texto: "Brier menor é sempre o melhor modelo para provisão", certa: false, retorno: <>Não: provisão pede o nível certo por faixa. Com a = {num(A0, 1)}, A espera {pct(EXCESSO, 0)} mais defaults que os {D} observados.</> },
];

export function S25BrierCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(A0);
  const [esc, setEsc] = useState<number | null>(null);
  const PA = transformar(PL, a, 1); const FA = faixasQuantis(Y, PA, 10);
  const CA = corp(Y, PA), gA = calibracaoGlobal(Y, PA);
  const vence = CA.bs < CB.bs;
  const revelado = esc !== null;
  const cols = [{ r: "A", c: CA }, { r: "B", c: CB }, { r: "Logística", c: CL }, { r: "Boosting sem recalibrar", c: CG }];
  return (
    <Quadro slug="c7p11" pagina={pagina} layout="gl"
      conclusao={!revelado ? <>Com a = {num(a, 1)}: Brier de A = {num(CA.bs, 5)}; de B = {num(CB.bs, 5)}. Qual dos dois está mais bem calibrado? Responda antes de ver a decomposição.</>
        : vence ? <>Com a = {num(a, 1)}: <b>A tem o Brier menor e está pior calibrado</b>: MCB {num(CA.mcb, 5)} contra {n5(CB.mcb)} de B, compensado pela separação (DSC {num(CA.dsc, 5)}). PD média de A {pct(gA.pdMedia!, 1)} contra {pct(TAXA, 1)} observados.</>
        : <>Com a = {num(a, 1)}, B passa a ter o Brier menor: o erro de calibração de A (MCB {num(CA.mcb, 5)}) superou a vantagem de separação (DSC {num(CA.dsc, 5)}). A fila de A não mudou.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. A: σ(logit p + a) sobre a logística. B: PD constante de ${pct(TAXA, 2)}, a taxa da própria janela (informação posterior, só para isolar a propriedade). Faixas: decis de A. CORP: Dimitriadis, Gneiting e Jordan (2021), PNAS 118(8).`}>
      <Painel>
        <div className="q7-g2-s25">
          <Confiabilidade titulo="A: boa fila, nível errado" sub={`Brier ${num(CA.bs, 5)} · AUC ${num(aucPorPares(Y, PA).auc!, 3)}`} rotulo="Curva de confiabilidade do modelo A" max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: FA, classe: "prob", linha: true, ic: true }]} anotar={false} />
          <Confiabilidade titulo="B: PD constante" sub={`Brier ${num(CB.bs, 5)}`} rotulo="Curva de confiabilidade do modelo B, um único ponto" max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: FB, classe: "prob", ic: true }]} anotar={false} />
        </div>
        <div className="q7-g2-linha">
          {revelado ? <Controle rotulo="Deslocamento do nível de A (a, em log odds)" valor={a} min={0} max={1.4} passo={0.1} onChange={setA} mostrar={`+${num(a, 1)}`} escala={["0: a logística", "+1,4"]} /> : <p className="q7-nota">O controle do nível de A abre depois da previsão.</p>}
          <div className="q7-botoes"><Botao sec onClick={() => { setA(A0); setEsc(null); }}>Restaurar</Botao></div>
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Qual conclusão os dados sustentam?" pergunta={`Com a = ${num(A0, 1)}, A tem Brier menor que B. O que se pode concluir sobre calibração?`} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null) setA(A0); }} recolher />
        {revelado && <>
          <p className="q7-k">Sem faixas: BS = MCB − DSC + UNC</p>
          <table className="q7-tab q7-g2-s25-tab">
            <thead><tr><th className="q7-t-l">UNC = {num(CL.unc, 5)} em todos</th>{cols.map((k) => <th key={k.r}>{k.r}</th>)}</tr></thead>
            <tbody>
              <tr><th>BS (Brier)</th>{cols.map((k) => <td key={k.r}>{n5(k.c.bs)}</td>)}</tr>
              <tr><th>MCB: erro de calibração</th>{cols.map((k) => <td key={k.r}>{n5(k.c.mcb)}</td>)}</tr>
              <tr><th>DSC: discriminação</th>{cols.map((k) => <td key={k.r}>{n5(k.c.dsc)}</td>)}</tr>
            </tbody>
          </table>
          <Expandir resumo="Como se calcula; modelos reais">
            <Formula compacta f={String.raw`\mathrm{MCB}=\mathrm{BS}-\mathrm{BS}_{\mathrm{iso}},\quad \mathrm{DSC}=\mathrm{UNC}-\mathrm{BS}_{\mathrm{iso}},\quad \mathrm{UNC}=\bar o(1-\bar o)`} />
            <p className="q7-nota">BS<sub>iso</sub> é o Brier da curva crescente mais próxima dos dados (isotônica, slide 30), ajustada na própria amostra: diagnóstico, não calibrador. Entre a logística e o boosting sem recalibrar, o Brier difere {num(CG.bs - CL.bs, 5)}; a discriminação explica {num(CL.dsc - CG.dsc, 5)} disso e a calibração, {num(CG.mcb - CL.mcb, 5)}. Por faixas (Murphy, 1973) a soma não fecha: sobra um resíduo.</p>
          </Expandir>
        </>}
      </Painel>
    </Quadro>
  );
}

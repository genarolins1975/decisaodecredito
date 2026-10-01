"use client";
import { useState } from "react";
import { Botao, Controle, Expandir, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, calibracaoGlobal, decomposicaoBrier, faixasQuantis, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 25 · c7p11 · Menor Brier não prova melhor calibração. Modelo A: a logística com o nível deslocado em +a log odds
 * (boa fila, nível errado). Modelo B: PD constante igual à taxa da própria janela (nível certo no agregado por
 * construção, nenhuma separação; usa uma informação que só existe depois e serve apenas para isolar a propriedade).
 * Com a = 0,8, A tem Brier menor e está pior calibrado. A decomposição de Murphy fica na expansão, com o resíduo das
 * faixas declarado.
 */
const TAXA = D / N;
const PB = PL.map(() => TAXA);
const FB = faixasQuantis(Y, PB, 1);
const BB = brier(Y, PB);
const EXCESSO = calibracaoGlobal(Y, transformar(PL, 0.8, 1)).esperados / D - 1;
const OPS = [
  { texto: "A está mais bem calibrado, porque tem Brier menor", certa: false, retorno: <>Não: os pontos de A ficam longe e abaixo da diagonal (superestima em todas as faixas). O Brier menor vem da <b>separação</b>, não do nível.</> },
  { texto: "B tem o nível certo, mas não separa ninguém; A separa e erra o nível", certa: true, retorno: <>Isso. O Brier soma as duas coisas num número só. Para provisionar, olhe a curva por faixa; para ordenar, a AUC. Combine os diagnósticos.</> },
  { texto: "Brier menor é sempre o melhor modelo para provisão", certa: false, retorno: <>Não: provisão pede o nível certo em cada faixa. Com a = 0,8, A esperaria {pct(EXCESSO, 0)} mais defaults do que os {D} observados.</> },
];

export function S25BrierCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(0.8);
  const [esc, setEsc] = useState<number | null>(null);
  const PA = transformar(PL, a, 1); const FA = faixasQuantis(Y, PA, 10);
  const BA = brier(Y, PA), gA = calibracaoGlobal(Y, PA);
  const dA = decomposicaoBrier(Y, PA, FA), dB = decomposicaoBrier(Y, PB, FB);
  const vence = BA < BB;
  return (
    <Quadro slug="c7p11" pagina={pagina} layout="gl"
      conclusao={<>Com a = {num(a, 1)}: Brier de A = {num(BA, 5)}, de B = {num(BB, 5)}. {vence ? <><b>A tem o Brier menor e está pior calibrado</b> (PD média {pct(gA.pdMedia!, 1)} contra {pct(TAXA, 1)} observados).</> : <>Agora B tem o Brier menor: o erro de nível de A ficou grande demais.</>} Brier e log loss avaliam previsões probabilísticas inteiras, não só a calibração.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. A: σ(logit p + a) sobre a logística. B: PD constante de ${pct(TAXA, 2)}, a taxa observada na própria janela (informação posterior, usada só para isolar a propriedade). Faixas: decis de PD prevista de A.`}>
      <Painel>
        <div className="q7-s25-g">
          <Confiabilidade titulo={`A: boa fila, nível deslocado · Brier ${num(BA, 5)}`} sub={`AUC ${num(aucPorPares(Y, PA).auc!, 4)}`} rotulo="Curva de confiabilidade do modelo A" max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: FA, classe: "dec", linha: true, ic: true }]} anotar={false} />
          <Confiabilidade titulo={`B: PD constante · Brier ${num(BB, 5)}`} sub="AUC 0,5" rotulo="Curva de confiabilidade do modelo B, um único ponto" max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: FB, classe: "ink", ic: true }]} anotar={false} />
        </div>
        <Controle rotulo="Deslocamento do nível de A (a, em log odds)" valor={a} min={0} max={1.4} passo={0.1} onChange={setA} mostrar={`+${num(a, 1)}`} escala={["0: a logística", "+1,4"]} />
      </Painel>
      <Painel>
        <Previsao rotulo="Qual conclusão os dados sustentam?" pergunta="A tem Brier menor que B. O que se pode concluir sobre calibração?" opcoes={OPS} escolha={esc} onEscolha={setEsc} />
        <Expandir resumo="Decomposição de Murphy (por faixas)">
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Parcela</th><th>A</th><th>B</th></tr></thead>
            <tbody>
              <tr><th>Confiabilidade (erro de nível)</th><td>{num(dA.confiabilidade, 5)}</td><td>{num(dB.confiabilidade, 5)}</td></tr>
              <tr><th>Resolução (separação)</th><td>{num(dA.resolucao, 5)}</td><td>{num(dB.resolucao, 5)}</td></tr>
              <tr><th>Incerteza (da carteira)</th><td>{num(dA.incerteza, 5)}</td><td>{num(dB.incerteza, 5)}</td></tr>
              <tr><th>Resíduo das faixas</th><td>{num(dA.residuo, 5)}</td><td>{num(dB.residuo, 5)}</td></tr>
            </tbody>
          </table>
          <p className="q7-nota">Brier = confiabilidade − resolução + incerteza + resíduo. O resíduo só zera quando a PD é constante dentro de cada faixa; com faixas arbitrárias a igualdade de Murphy (1973) não é exata.</p>
        </Expandir>
        <div className="q7-botoes"><Botao sec onClick={() => { setA(0.8); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

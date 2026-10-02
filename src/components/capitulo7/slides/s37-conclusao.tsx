"use client";
import { useState } from "react";
import { Botao, LinkSlide, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, EAD, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, ganho, interceptoESlope, jeffreys, ks } from "@/lib/capitulo7/metricas";
import { CURTO } from "@/lib/capitulo7/roteiro";
import { curva, GRADE_CORTES, otimo } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 37 · c7p20 · Conclusão: as quatro respostas para a logística da janela, cada uma com a evidência e o que ainda falta,
 * e um fluxo de diagnóstico: escolhido o sintoma, o quadro diz o que ele indica e para quais slides voltar. Números
 * calculados aqui com as mesmas funções dos slides anteriores.
 */
type Sint = "auc" | "cal" | "dec" | "oot";
const DL = delong(Y, PL, PGR), KS_ = ks(Y, PL), G10 = ganho(Y, PL, 0.1), G = calibracaoGlobal(Y, PL), SL = interceptoESlope(Y, PL).slope;
const JC = jeffreys(D, N, G.pdMedia!);
const ECON = otimo(curva(PL as number[], EAD as number[], GRADE_CORTES)).corte;
const RESPOSTAS = [
  { p: "ordenacao", s: "●", t: "Ordena?", r: "Sim, de forma moderada.", ev: `AUC ${num(DL.auc1, 4)}; os 10% piores têm ${pct(G10.ganho!, 0)} dos defaults.`, falta: "Estabilidade da ordem por segmento e no tempo." },
  { p: "probabilidade", s: "▲", t: "Prevê bem a probabilidade?", r: "Nível baixo, ainda sem prova.", ev: `PD média ${pct(G.pdMedia!, 1)} contra ${pct(D / N, 1)}; Jeffreys p = ${num(JC, 2)}; slope ${num(SL, 2)}.`, falta: "Correção de nível em amostra própria, avaliada em outra." },
  { p: "decisao", s: "◆", t: "Sustenta a decisão?", r: "Com hipóteses explícitas.", ev: `Corte econômico de ${pct(ECON, 1)}; o KS (${pct(KS_.limiar, 1)}) não é política.`, falta: "Sensibilidade a perda, receita e capacidade." },
  { p: "validacao", s: "■", t: "Prova fora da amostra?", r: "Uma vez, com margem estreita.", ev: `${D} defaults; vantagem de ${num(DL.dif, 4)} sobre o boosting, IC de ${num(DL.ic[0], 4)} a ${num(DL.ic[1], 4)}.`, falta: "Nova janela para qualquer escolha feita depois desta." },
];
const SINTOMAS: Record<Sint, { r: string; diag: string; voltar: string[] }> = {
  auc: { r: "AUC baixa", diag: "Problema de ordenação: as variáveis ou a forma do modelo não separam. Recalibrar não resolve; volte à modelagem.", voltar: ["c7p5", "c7p6", "c7p27"] },
  cal: { r: "AUC boa, curva fora da diagonal", diag: "Problema de probabilidade: nível ou inclinação. Corrija com intercepto ou Platt, em amostra própria, e confira a curva em outra.", voltar: ["c7p10", "c7p32", "c7p16", "c7p13"] },
  dec: { r: "PD boa, resultado ruim", diag: "Problema de decisão: corte, perda ou receita mal especificados. A PD não escolhe a política sozinha.", voltar: ["c7p37", "c7p18"] },
  oot: { r: "Bom na validação, ruim na janela", diag: "Problema de validação: sobreajuste, seleção feita olhando a janela ou mudança de população. Congele e use uma janela nova.", voltar: ["c7p15", "c7p17", "c7p14"] },
};

export function S37Conclusao({ pagina }: { pagina?: Pagina }) {
  const [s, setS] = useState<Sint | null>(null);
  const x = s ? SINTOMAS[s] : null;
  return (
    <Quadro slug="c7p20" pagina={pagina} layout="gl" rotuloConclusao="Síntese"
      conclusao={<>Uma métrica responde a uma pergunta só: <b>confiar exige as quatro respostas, cada uma com a sua evidência.</b></>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults; logística do capítulo 4. IC da AUC por DeLong. Corte econômico com o motor do capítulo 8.`}>
      <Painel titulo="As quatro respostas, para a logística da janela">
        <div className="q7-s37-r">
          {RESPOSTAS.map((r) => (
            <section key={r.p} className="q7-s37-c" data-p={r.p}>
              <h3><span aria-hidden="true">{r.s}</span>{r.t}</h3>
              <p className="q7-s37-a">{r.r}</p>
              <p className="q7-s37-e">{r.ev}</p>
              <p className="q7-s37-f"><b>Falta:</b> {r.falta}</p>
            </section>
          ))}
        </div>
      </Painel>
      <Painel titulo="Diagnóstico: qual é o sintoma?">
        <div className="q7-s37-seg"><Seg rotulo="Sintoma" opcoes={(Object.keys(SINTOMAS) as Sint[]).map((k) => ({ v: k, r: SINTOMAS[k].r }))} valor={s ?? ("" as Sint)} onChange={setS} cor /></div>
        {x ? (
          <div className="q7-s37-d" aria-live="polite">
            <p className="q7-p">{x.diag}</p>
            <p className="q7-k">Volte a</p>
            <ul className="q7-s01-l">{x.voltar.map((v) => <li key={v}><LinkSlide slug={v} className="q7-s01-k">{CURTO[v]}</LinkSlide></li>)}</ul>
          </div>
        ) : <p className="q7-nota">Escolha um sintoma para ver o que ele indica e para onde voltar.</p>}
        <div className="q7-botoes">
          <LinkSlide slug="c7p1" className="q7-s01-ir">Mapa: slide 1</LinkSlide>
          <LinkSlide slug="c7p38" className="q7-s01-ir">Caso integrador</LinkSlide>
          <Botao sec onClick={() => setS(null)}>Restaurar</Botao>
        </div>
      </Painel>
    </Quadro>
  );
}

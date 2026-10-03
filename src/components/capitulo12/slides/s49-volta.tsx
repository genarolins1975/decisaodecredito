"use client";
import { useState, type ReactNode } from "react";
import { Botao, Kpi, LinkSlide, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { FONTE_MNIST, M_SGD, M_TRIVIAL, TESTE } from "@/lib/capitulo12/dados";
import { BVS } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { useRespostaAbertura } from "../estado";
import { OPCOES_ABERTURA } from "./s01-abertura";
import { int, num, pct, pp } from "@/lib/capitulo7/formato";

/**
 * 49 · c12p49 · De volta à pergunta de abertura. A frase da aula está no subtítulo; os três critérios viram cartões,
 * cada um com o número que o provou e o slide (M_SGD e M_TRIVIAL da validação cruzada no MNIST; BVS de b4.ts). A
 * resposta da turma no slide 1 vem de estado.ts (memória da aba); sem resposta, o quadro funciona igual. O teste
 * guardado desde o slide 7 (TESTE: o detector ajustado no treino inteiro, medido nas 10.000 imagens de teste) abre
 * com um botão, com o que ele diz e o que não diz. Estado inicial: primeiro critério em foco, teste fechado;
 * "Restaurar" volta a ele (a resposta do slide 1 não é apagada).
 */
const TRIVIAL_TESTE = 1 - TESTE.prevalencia;
if (!(TESTE.acuracia > TRIVIAL_TESTE)) throw new Error("s49: o detector não supera o trivial no teste");
const CRIT: { nome: string; num: string; det: ReactNode; slides: string[] }[] = [
  { nome: "Superar o modelo trivial", num: `${pct(M_SGD.acuracia, 1)} contra ${pct(M_TRIVIAL.acuracia, 1)}`, det: <>O detector ganha {pp(M_SGD.acuracia - M_TRIVIAL.acuracia, 1)} sobre o modelo que nunca diz 5: a acurácia só tem sentido contra essa referência.</>, slides: ["c12p10"] },
  { nome: "Limiar que reflita o custo de cada erro", num: `precisão ${pct(M_SGD.precisao!, 1)}, recall ${pct(M_SGD.recall!, 1)}`, det: <>No limiar zero. Subir o limiar troca recall por precisão; no crédito, um mau aprovado e um bom recusado custam diferente.</>, slides: ["c12p16", "c12p18"] },
  { nome: "Ordenação que sobreviva ao tempo", num: `AUC ${num(BVS.treino, 3)} → ${num(BVS.validacao, 3)}`, det: <>No exemplo de sobreajuste, a AUC cai {pct(-BVS.variacao, 1)} fora do tempo: o desempenho medido no treino não garante o das safras seguintes.</>, slides: ["c12p42", "c12p43"] },
];
const VEREDITO = [
  <>A acurácia sozinha não sustenta o sim: o modelo trivial erra só {pct(1 - M_TRIVIAL.acuracia, 1)} das imagens.</>,
  <>É o primeiro critério, e ele passa. Faltam o limiar e o tempo.</>,
  <>É o segundo critério. O terceiro, o tempo, só apareceu no bloco 4.</>,
];

export function S49Volta({ pagina }: { pagina?: Pagina }) {
  const [resp] = useRespostaAbertura();
  const [sel, setSel] = useState(0);
  const [teste, setTeste] = useState(false);
  const c = CRIT[sel];
  return (
    <Quadro slug="c12p49" pagina={pagina} layout="gl"
      conclusao={teste ? <>No teste, <b>{pct(TESTE.acuracia, 1)}</b> contra {pct(TRIVIAL_TESTE, 1)} do trivial: o primeiro critério se confirma em imagens novas. O limiar e o tempo dependem da decisão que o modelo apoia; o apêndice segue no slide {SLIDE.c12p50.n}.</>
        : <>Três critérios, três números: o trivial ({pct(M_TRIVIAL.acuracia, 1)}), a troca entre precisão e recall e a queda fora do tempo ({pct(BVS.variacao, 1)}). Falta abrir o teste.</>}
      fonte={`${FONTE_MNIST}. Teste: o mesmo detector ajustado nas ${int(M_SGD.n)} imagens de treino e medido nas ${int(TESTE.n)} de teste, guardadas desde o slide ${SLIDE.c12p7.n}. Exemplo BVS: caso de crédito do material da aula.`}>
      <Painel className="q12-s49-esq">
        <p className="q7-k">Os três critérios: clique em cada um</p>
        <ol className="q12-s49-crit">
          {CRIT.map((k, i) => (
            <li key={k.nome}>
              <button type="button" className="q12-s49-c" aria-pressed={i === sel} onClick={() => setSel(i)}>
                <span className="q12-s49-i">{i + 1}</span>
                <span className="q12-s49-t"><b>{k.nome}</b><span>{k.num}</span></span>
              </button>
            </li>
          ))}
        </ol>
        <div className="q12-s49-det" aria-live="polite">
          <p className="q7-p">{c.det}</p>
          <p className="q7-nota">Provado no{c.slides.length > 1 ? "s" : ""} slide{c.slides.length > 1 ? "s" : ""} {c.slides.map((s, i) => <span key={s}>{i > 0 ? " e " : ""}<LinkSlide slug={s}>{SLIDE[s].n}</LinkSlide></span>)}.</p>
        </div>
      </Painel>
      <Painel>
        <div className="q12-s49-resp">
          <p className="q7-k">Sua resposta no slide {SLIDE.c12p1.n}</p>
          {resp === null ? <p className="q7-nota">Nenhuma resposta registrada nesta aba. A pergunta continua valendo: qual critério você teria esquecido?</p>
            : <><p className="q12-s49-dita">“{OPCOES_ABERTURA[resp].texto}”</p><p className="q7-nota">{VEREDITO[resp]}</p></>}
        </div>
        <div className="q12-s49-teste">
          <p className="q7-k">O teste guardado desde o slide {SLIDE.c12p7.n}</p>
          {!teste ? <Botao prim onClick={() => setTeste(true)}>Abrir as {int(TESTE.n)} imagens de teste</Botao> : (
            <>
              <div className="q7-kpis">
                <Kpi tam="mini" rotulo="Acurácia" valor={pct(TESTE.acuracia, 1)} detalhe={`trivial: ${pct(TRIVIAL_TESTE, 1)}`} tom="prob" />
                <Kpi tam="mini" rotulo="Precisão" valor={pct(TESTE.precisao!, 1)} detalhe={`${int(TESTE.vp)} de ${int(TESTE.previstosPositivos)}`} />
                <Kpi tam="mini" rotulo="Recall" valor={pct(TESTE.recall!, 1)} detalhe={`${int(TESTE.vp)} de ${int(TESTE.positivos)}`} />
              </div>
              <p className="q7-nota"><b>Diz:</b> supera o trivial em imagens que nunca viu. <b>Não diz:</b> a troca entre erros mudou (na validação cruzada, {pct(M_SGD.precisao!, 1)} e {pct(M_SGD.recall!, 1)}), e o MNIST não tem safras.</p>
            </>
          )}
        </div>
        <div className="q7-botoes q12-s49-bot"><Botao sec onClick={() => { setSel(0); setTeste(false); }} desab={sel === 0 && !teste}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

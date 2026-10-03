"use client";
import { useState } from "react";
import { Botao, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Digito } from "../pecas";
import { EXEMPLOS, FONTE_MNIST, MN } from "@/lib/capitulo12/dados";
import { pixels } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 03 · c12p3 · Quatro termos (instância, característica, rótulo, classe positiva) lidos lado a lado no MNIST e no
 * crédito. Prova que "positivo" é a classe que se quer detectar, não a desejável: a célula da classe positiva no
 * crédito fica "?" até a turma acertar a previsão (o retorno das erradas nomeia a confusão sem dar a resposta).
 * Cada linha da tabela é um botão: o painel embaixo ilustra o termo na primeira imagem do treino (EXEMPLOS[0], um 5),
 * com o pixel mais intenso realçado para "característica". Números: MN (70.000 imagens, 784 pixels, lado 28) e o
 * pixel lido de EXEMPLOS[0].px. Estado inicial: linha "Instância" ativa, previsão em aberto; Restaurar volta a ele.
 */
type Termo = "inst" | "car" | "rot" | "pos";
const E0 = EXEMPLOS[0];
const NAO5 = EXEMPLOS.find((e) => e.tipo === "amostra" && e.rotulo !== 5)!;
if (E0.rotulo !== 5) throw new Error("s03: EXEMPLOS[0] deveria ser um 5");
if (MN.lado * MN.lado !== MN.pixels) throw new Error("s03: 28 × 28 deveria ser 784");
const PX = pixels(E0.px);
const P_MAX = PX.indexOf(Math.max(...PX));

const LINHAS: { id: Termo; termo: string; mnist: string; credito: string }[] = [
  { id: "inst", termo: "Instância", mnist: "uma imagem de algarismo", credito: "uma proposta ou um contrato" },
  { id: "car", termo: "Característica", mnist: `a intensidade de um pixel, ${int(MN.pixels)} por imagem`, credito: "renda, prazo, histórico de crédito" },
  { id: "rot", termo: "Rótulo", mnist: "o algarismo, de 0 a 9", credito: "bom ou mau pagador no horizonte definido" },
  { id: "pos", termo: "Classe positiva", mnist: "o dígito 5", credito: "o mau pagador" },
];

const OPCOES = [
  { texto: "O bom pagador", certa: false, retorno: <>Confunde <b>positivo</b> com <b>bom</b>. Positivo é a classe que o modelo procura; no MNIST ele procura o 5, não “os outros”. Qual evento o crédito quer encontrar?</> },
  { texto: "O mau pagador", certa: true, retorno: <>Isso: é o evento que o modelo quer <b>detectar</b>, como o 5 no MNIST. Precisão e recall do caso de crédito serão lidos com o mau como positivo.</> },
  { texto: "Tanto faz: é só uma convenção", certa: false, retorno: <>Não é simétrico: trocar a classe positiva muda o <b>sentido</b> da precisão e do recall. O recall dos maus não é o recall dos bons. Qual dos dois o credor quer encontrar?</> },
];

function Ilustracao({ t }: { t: Termo }) {
  const lin = Math.floor(P_MAX / MN.lado), col = P_MAX % MN.lado;
  if (t === "pos") {
    return (
      <div className="q12-s03-il">
        <div className="q12-s03-par">
          <figure><Digito px={E0.px} rotulo="Um 5: classe positiva" /><figcaption><b>5 → positivo</b> (True)</figcaption></figure>
          <figure><Digito px={NAO5.px} rotulo={`Um ${NAO5.rotulo}: classe negativa`} /><figcaption>{NAO5.rotulo} → negativo (False)</figcaption></figure>
        </div>
        <p className="q7-p">A classe positiva é a que o modelo procura. No MNIST, procuramos o <b>5</b>; os outros nove algarismos formam a classe negativa.</p>
      </div>
    );
  }
  return (
    <div className="q12-s03-il">
      <div className="q12-s03-um" data-t={t}>
        <Digito px={E0.px} grade={t === "car"} marca={t === "car" ? P_MAX : null} rotulo={t === "car" ? `Primeira imagem do treino, com o pixel da linha ${lin}, coluna ${col} realçado` : "Primeira imagem do treino: um 5 escrito à mão"} />
        {t === "rot" && <span className="q12-s03-y" aria-hidden="true">y = {E0.rotulo}</span>}
      </div>
      {t === "inst" && <p className="q7-p">Uma <b>instância</b> é um exemplo inteiro: esta imagem é uma das <b>{int(MN.n)}</b> da base. No crédito, cada proposta é uma instância.</p>}
      {t === "car" && <p className="q7-p">Uma <b>característica</b> é uma medida da instância: o pixel realçado (linha {lin}, coluna {col}) vale <b>{int(PX[P_MAX])}</b> numa escala de 0 a 255. São {int(MN.pixels)} por imagem.</p>}
      {t === "rot" && <p className="q7-p">O <b>rótulo</b> é a resposta certa, anotada por uma pessoa: esta imagem é um <b>{E0.rotulo}</b>. No crédito, o rótulo só existe depois do horizonte de observação.</p>}
    </div>
  );
}

export function S03Termos({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState<Termo>("inst");
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc !== null && OPCOES[esc].certa;
  const inicial = t === "inst" && esc === null;
  return (
    <Quadro slug="c12p3" pagina={pagina} layout="gl"
      conclusao={revelado
        ? <>Classe positiva é a que queremos <b>detectar</b>, e não a classe boa: o 5 no MNIST, o <b>mau pagador</b> no crédito. O slide {SLIDE.c12p4.n} abre as {int(MN.n)} instâncias do MNIST.</>
        : esc === null ? "Clique numa linha para ver o termo numa imagem real; depois responda: no crédito, qual é a classe positiva?" : "Tente outra alternativa: a célula do crédito abre no acerto."}
      fonte={`${FONTE_MNIST}. Imagem: a primeira do treino (índice 0), rótulo ${E0.rotulo}; pixel realçado: o de maior intensidade.`}>
      <Painel className="q12-s03-esq">
        <table className="q7-tab q12-s03-tab">
          <caption className="q7-sr">Os quatro termos no MNIST e no crédito; clique numa linha para ilustrá-la</caption>
          <thead><tr><th className="q7-t-l" scope="col">Termo</th><th className="q7-t-l" scope="col">No MNIST</th><th className="q7-t-l" scope="col">No crédito</th></tr></thead>
          <tbody>
            {LINHAS.map((l) => (
              <tr key={l.id} data-on={t === l.id ? "1" : "0"} onClick={() => setT(l.id)}>
                <th scope="row"><button type="button" className="q12-s03-bt" aria-pressed={t === l.id} onClick={() => setT(l.id)}>{l.termo}</button></th>
                <td className="q7-t-l">{l.mnist}</td>
                <td className="q7-t-l">{l.id === "pos" && !revelado ? <span className="q12-s03-oculto" aria-label="Oculto até a previsão">?</span> : <span data-def={l.id === "pos" ? "1" : undefined}>{l.credito}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Ilustracao t={t} />
      </Painel>
      <Painel>
        <Previsao pergunta="No crédito, qual é a classe positiva?" opcoes={OPCOES} escolha={esc} onEscolha={setEsc} />
        <div className="q7-botoes q12-s03-rest"><Botao sec onClick={() => { setT("inst"); setEsc(null); }} desab={inicial}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

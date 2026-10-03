"use client";
import { Kpi, LinkSlide, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { BLOCOS, PERGUNTAS, SLIDE } from "@/lib/capitulo12/roteiro";
import { EXEMPLOS, FONTE_MNIST, M_SGD } from "@/lib/capitulo12/dados";
import { Digito } from "../pecas";
import { useRespostaAbertura } from "../estado";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 01 · c12p1 · Pergunta de abertura e percurso. O gancho é o número do detector de 5, com doze imagens da base (seis de 5) e o rótulo verdadeiro de cada uma, (acurácia da validação cruzada
 * em três partes no treino do MNIST, M_SGD em dados.ts). A turma registra a resposta sem gabarito: as três opções são
 * posições defensáveis e o retorno de cada uma diz em que slide ela será posta à prova; a resposta volta no slide 49.
 * À direita, as quatro perguntas encadeadas da aula, cada uma ligada ao slide em que o bloco abre. A escolha fica na memória da
 * aba (estado.ts) para o slide 49 retomá-la; "Tentar outra" limpa.
 */
const FILA = EXEMPLOS.filter((e) => e.tipo === "amostra");
const SIMB: Record<string, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
export const OPCOES_ABERTURA = [
  { texto: "Sim: errar menos de 5 em cada 100 é um bom resultado", retorno: <>Resposta guardada. O slide {SLIDE.c12p10.n} mostra quanto acerta um modelo que <b>nunca</b> diz 5; compare com este número.</> },
  { texto: "Depende de quanto acertaria um modelo sem nenhuma informação", retorno: <>Resposta guardada. É o primeiro teste: o slide {SLIDE.c12p10.n} faz essa conta.</> },
  { texto: "Depende de quais erros ele comete e de quanto cada um custa", retorno: <>Resposta guardada. A matriz de confusão (slide {SLIDE.c12p11.n}) e o custo dos erros (slide {SLIDE.c12p16.n}) põem essa resposta à prova.</> },
];

export function S01Abertura({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useRespostaAbertura();
  return (
    <Quadro slug="c12p1" pagina={pagina} layout="gl" rotuloConclusao="Percurso"
      conclusao={esc === null ? "Responda antes de começar: a resposta volta no último slide da aula, com três critérios." : <>Quatro perguntas encadeadas levam da imagem ao corte de crédito; a sua resposta volta no slide {SLIDE.c12p49.n}.</>}
      fonte={`${FONTE_MNIST}. Acurácia = acertos ÷ imagens.`}>
      <Painel className="q12-s01-esq">
        <div className="q12-s01-gancho">
          <Kpi rotulo="Detector de 5 no MNIST" valor={pct(M_SGD.acuracia, 1)} detalhe={`${int(M_SGD.vp + M_SGD.vn)} acertos em ${int(M_SGD.n)} imagens`} tam="grande" />
          <p className="q7-p">Um classificador linear olha cada imagem de algarismo escrito à mão e diz se ela é um <b>5</b>. Ele acerta quase todas.</p>
        </div>
        <ul className="q12-s01-fila" aria-label="Doze imagens da base: seis de 5 e seis de outros algarismos">
          {FILA.map((e) => <li key={e.i}><Digito px={e.px} rotulo={`Algarismo ${e.rotulo}`} /><span>{e.rotulo === 5 ? "5" : "não 5"}</span></li>)}
        </ul>
        <Previsao rotulo="Sua resposta" pergunta="Esse modelo é bom?" opcoes={OPCOES_ABERTURA} escolha={esc} onEscolha={setEsc} />
      </Painel>
      <Painel titulo="Percurso: quatro perguntas encadeadas" tom="suave">
        <ol className="q12-s01-perc">
          {PERGUNTAS.map((p, i) => (
            <li key={p.id} data-p={p.id}>
              <LinkSlide slug={BLOCOS[i].abre} className="q12-s01-item" rotulo={`Bloco ${i + 1}, ${p.nome}: ${p.frase} Começa no slide ${SLIDE[BLOCOS[i].abre].n}`}>
                <span className="q12-s01-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="q12-s01-t"><b><i aria-hidden="true">{SIMB[p.id]}</i> {p.nome}</b><span>{p.frase}</span></span>
                <small>slide {SLIDE[BLOCOS[i].abre].n}</small>
              </LinkSlide>
            </li>
          ))}
        </ol>
      </Painel>
    </Quadro>
  );
}

"use client";
import { useState } from "react";
import { Botao, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { SLIDE } from "@/lib/capitulo12/roteiro";

/**
 * 23 · c12p53 · A sabedoria das multidões: o vídeo do material original (The Wisdom of the Crowd, 4 min 48 s), que abre o
 * bloco de ensembles. O vídeo não toca sozinho (preload="none", sem autoplay): o professor decide quando. Ao lado, a
 * pergunta para assistir, em forma de previsão: a turma registra uma condição antes do vídeo e, ao fim, confronta com o
 * que o vídeo mostra; o retorno de cada opção liga ao slide da Lei dos Grandes Números aplicada aos votos, onde as duas
 * condições (muitos palpites e erros independentes) viram conta. Estado inicial: vídeo parado, previsão em aberto;
 * "Restaurar" limpa a escolha.
 */
const OPCOES = [
  { texto: "Quando o grupo tem especialistas", certa: false, retorno: <>Não é o que sustenta o efeito: no vídeo, quem acerta é o <b>agregado</b> de pessoas comuns. Um especialista sozinho ainda erra; o grupo erra menos porque os erros individuais se compensam.</> },
  { texto: "Quando há muitos palpites, independentes entre si", certa: true, retorno: <>Isso: muitos palpites e erros que não andam juntos. As duas condições viram conta no slide {SLIDE.c12p24.n}, com classificadores de 51% no lugar de pessoas.</> },
  { texto: "Quando todos discutem antes e chegam a um consenso", certa: false, retorno: <>Discutir antes faz os palpites se copiarem: os erros passam a andar juntos e a vantagem do grupo some. É a hipótese de independência que o slide {SLIDE.c12p24.n} põe à prova.</> },
];

export function S53Multidoes({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  return (
    <Quadro slug="c12p53" pagina={pagina} layout="glx" rotuloConclusao="Para assistir"
      conclusao={esc === null ? "Registre a sua condição antes do vídeo; ao fim, confronte com o que ele mostra." : <>Combinar previsões reduz o erro quando há <b>muitos palpites</b> e <b>erros diferentes entre si</b>: é a ideia que a votação, o bagging, as florestas e o boosting exploram a seguir.</>}
      fonte="The Wisdom of the Crowd, vídeo do material original da aula (4 min 48 s); reprodução em sala, sem cálculo da plataforma.">
      <Painel className="q12-s53-v">
        <video className="q12-s53-video" controls preload="none" poster="/capitulo12/sabedoria-das-multidoes.webp" aria-label="Vídeo The Wisdom of the Crowd, 4 minutos e 48 segundos">
          <source src="/capitulo12/sabedoria-das-multidoes.mp4" type="video/mp4" />
          Seu navegador não reproduz o vídeo; abra <a href="/capitulo12/sabedoria-das-multidoes.mp4">o arquivo</a>.
        </video>
      </Painel>
      <Painel className="q12-s53-dir">
        <Previsao rotulo="Antes do vídeo" pergunta="Em que condições a resposta do grupo erra menos do que a dos indivíduos?" opcoes={OPCOES} escolha={esc} onEscolha={setEsc} />
        <p className="q7-nota">Ao final, colete as condições levantadas pela turma: elas antecipam o slide {SLIDE.c12p24.n}, sobre quantidade e diversidade.</p>
        <div className="q7-botoes"><Botao sec onClick={() => setEsc(null)} desab={esc === null}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

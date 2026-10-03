"use client";
import { useState } from "react";
import { Botao, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Codigo } from "../pecas";
import { ACERTOS_LUAS, FONTE_LUAS, LUAS, MN, N_TESTE_LUAS, N_TREINO_LUAS } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 07 · c12p7 · Treino com as 60.000 primeiras imagens, teste com as 10.000 restantes, guardado até o fim. Prova, com
 * dado, por que o teste não se mede no treino: a turma prevê quanto uma árvore de decisão sem limite de profundidade
 * acerta no próprio treino e no teste das duas luas (o problema do slide 26), e só no acerto o quadro mostra 100,0%
 * (375 de 375) contra 85,6% (107 de 125). A acurácia do MNIST no teste não aparece: fica para o slide 49. Números:
 * MN (n, nTreino, nTeste), LUAS.modelos.arvore (accTreino, acc) e ACERTOS_LUAS em dados.ts. A barra de treino e teste
 * é um seletor que acende no código as linhas de cada parte. Estado inicial: parte "treino" acesa, previsão em
 * aberto; Restaurar volta a ele.
 */
type Parte = "treino" | "teste";
const NT = MN.nTreino, NE = MN.nTeste;
if (NT + NE !== MN.n) throw new Error("s07: treino e teste deveriam somar a base");
const ARV = LUAS.modelos.arvore;
const AC_TREINO = Math.round(ARV.accTreino * N_TREINO_LUAS), AC_TESTE = ACERTOS_LUAS.arvore;
if (Math.abs(AC_TREINO / N_TREINO_LUAS - ARV.accTreino) > 1e-3) throw new Error("s07: acertos de treino da árvore não batem com accTreino");
if (AC_TESTE !== ARV.acertos || Math.abs(AC_TESTE / N_TESTE_LUAS - ARV.acc) > 1e-3) throw new Error("s07: acertos de teste da árvore não batem");
if (!(ARV.accTreino - ARV.acc > 0.1)) throw new Error("s07: a leitura supõe uma queda grande do treino para o teste");
const COD = [
  `X_train_digits = X_digits[:${NT}]`,
  `X_test_digits = X_digits[${NT}:]`,
  `y_train_digits = y_digits[:${NT}]`,
  `y_test_digits = y_digits[${NT}:]`,
  "y_train_5 = (y_train_digits == 5)",
  "y_test_5 = (y_test_digits == 5)",
];
const LINHAS: Record<Parte, number[]> = { treino: [0, 2, 4], teste: [1, 3, 5] };

const OPCOES = [
  { texto: "O mesmo nos dois conjuntos", certa: false, retorno: <>Supõe que o treino mede o que o teste mede. Sem limite de profundidade, a árvore pode abrir uma folha para cada ponto que viu. O que isso faz no treino?</> },
  { texto: "Tudo ou quase tudo no treino, e bem menos no teste", certa: true, retorno: <>Isso: a árvore <b>decorou</b> o treino. O número de treino diz quanto ela lembra, não quanto ela acerta em pontos novos.</> },
  { texto: "Mais no teste, que tem menos pontos", certa: false, retorno: <>Confunde tamanho com dificuldade: menos pontos não tornam o teste mais fácil. São pontos que a árvore <b>nunca viu</b>. Onde ela deve errar mais?</> },
];

export function S07TreinoTeste({ pagina }: { pagina?: Pagina }) {
  const [parte, setParte] = useState<Parte>("treino");
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc !== null && OPCOES[esc].certa;
  const inicial = parte === "treino" && esc === null;
  return (
    <Quadro slug="c12p7" pagina={pagina} layout="gl"
      conclusao={revelado
        ? <>A árvore acerta <b>{pct(ARV.accTreino, 1)}</b> no treino e <b>{pct(ARV.acc, 1)}</b> no teste: medir no treino superestima o desempenho em {num((ARV.accTreino - ARV.acc) * 100, 1)} pontos percentuais. Por isso o teste do MNIST fica guardado; o slide {SLIDE.c12p8.n} treina o primeiro classificador nas {int(NT)} imagens.</>
        : esc === null ? "Antes de seguir: quanto uma árvore sem limite acerta no próprio treino e no teste?" : "Tente outra alternativa: os números abrem no acerto."}
      fonte={`MNIST (OpenML mnist_784, versão 1): ${int(NT)} primeiras imagens para treino, ${int(NE)} últimas para teste, a divisão da própria base. Árvore: DecisionTreeClassifier(random_state=42) sem limite de profundidade; ${FONTE_LUAS}.`}>
      <Painel className="q12-s07-esq">
        <p className="q7-k">As {int(MN.n)} imagens, na ordem da base: clique numa parte</p>
        <div className="q12-s07-barra" role="group" aria-label="Partes da base">
          <button type="button" data-p="treino" aria-pressed={parte === "treino"} onClick={() => setParte("treino")} style={{ flexGrow: NT }}>
            <b>Treino</b><span>{int(NT)} imagens · {pct(NT / MN.n, 0)}</span>
          </button>
          <button type="button" data-p="teste" aria-pressed={parte === "teste"} onClick={() => setParte("teste")} style={{ flexGrow: NE }}>
            <b>Teste</b><span>{int(NE)}</span>
          </button>
        </div>
        <Codigo linhas={COD} destaque={LINHAS[parte]} rotulo={`Código: separar treino e teste; linhas da parte ${parte} realçadas`} />
        <div className="q12-s07-msg" aria-live="polite">
          {parte === "treino"
            ? <p className="q7-p"><b>Treino:</b> o modelo aprende aqui, e é aqui que as métricas do bloco 2 são medidas, por validação cruzada (slide {SLIDE.c12p11.n}).</p>
            : <p className="q7-p"><b>Teste:</b> fica guardado até o fim. É usado uma vez, no slide {SLIDE.c12p49.n}: medir a qualidade nos dados de treino superestima o desempenho.</p>}
        </div>
      </Painel>
      <Painel className="q12-s07-dir">
        <Previsao pergunta={<>Uma árvore de decisão sem limite de profundidade, treinada nas duas luas (o problema do slide {SLIDE.c12p26.n}), acerta quanto no próprio treino e quanto no teste?</>} opcoes={OPCOES} escolha={esc} onEscolha={setEsc} recolher />
        {revelado && (
          <div className="q12-s07-res" aria-label="Acurácia da árvore no treino e no teste">
            {[{ r: "Treino", v: ARV.accTreino, a: AC_TREINO, n: N_TREINO_LUAS }, { r: "Teste", v: ARV.acc, a: AC_TESTE, n: N_TESTE_LUAS }].map((x) => (
              <div key={x.r} className="q12-s07-b">
                <span className="q12-s07-br">{x.r}</span>
                <span className="q12-s07-bt"><i style={{ width: `${x.v * 100}%` }} /></span>
                <span className="q12-s07-bv"><b>{pct(x.v, 1)}</b> {int(x.a)} de {int(x.n)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="q7-nota q12-s07-nota">A acurácia do detector de 5 no teste do MNIST continua guardada: aparece só no slide {SLIDE.c12p49.n}.</p>
        <div className="q7-botoes"><Botao sec onClick={() => { setParte("treino"); setEsc(null); }} desab={inicial}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

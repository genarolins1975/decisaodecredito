"use client";
import { useState, type ReactNode } from "react";
import { Botao, LinkSlide, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { AUC_SGD, FONTE_CASO, M_SGD, META_VOLUME } from "@/lib/capitulo12/dados";
import { AUC_TEMPO, BVS, QUEDAS_SIMPLES } from "@/lib/capitulo12/b4";
import { gini } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 46 · c12p46 · Cada métrica da aula responde a uma pergunta do comitê (a tabela da aula, com o mau como classe
 * positiva). Clicar numa linha mostra a conta em crédito, o valor da mesma métrica no detector de 5 (M_SGD, AUC_SGD:
 * a mesma conta do bloco 2, com outra classe positiva), o que o caso já mostrou (CASO.auc via b4.ts) e o slide em
 * que a métrica nasceu. Os valores de precisão, recall e volume das regras ficam para o slide 47 (são a pergunta do
 * exercício). Estado inicial: precisão em foco; "Restaurar" volta a ele.
 */
type Id = "prec" | "rec" | "auc" | "oot" | "vol";
const [qMin] = [Math.min(...QUEDAS_SIMPLES.map((q) => -q.variacao))];
const [aMin, aMax] = [Math.min(...AUC_TEMPO.map((a) => a.treino)), Math.max(...AUC_TEMPO.map((a) => a.treino))];
const LINHAS: { id: Id; nome: string; leitura: string; pergunta: string; conta: string; nasce: string; detector: ReactNode; caso: ReactNode }[] = [
  { id: "prec", nome: "Precisão", leitura: "Taxa de maus no grupo sinalizado", pergunta: "O corte acerta quem recusa?", conta: "maus recusados ÷ recusados", nasce: "c12p12",
    detector: <>{pct(M_SGD.precisao!, 1)} dos “é 5” estavam certos</>, caso: <>no slide {SLIDE.c12p47.n}, por regra</> },
  { id: "rec", nome: "Recall", leitura: "Parcela dos maus capturada pelo corte", pergunta: "Quantos maus o corte evita?", conta: "maus recusados ÷ todos os maus", nasce: "c12p13",
    detector: <>{pct(M_SGD.recall!, 1)} dos 5 foram encontrados</>, caso: <>no slide {SLIDE.c12p47.n}, por regra</> },
  { id: "auc", nome: "AUC e Gini", leitura: "Capacidade de ordenar o risco", pergunta: "O score separa bons e maus?", conta: "chance de um mau sorteado ter risco maior que um bom sorteado", nasce: "c12p21",
    detector: <>AUC {num(AUC_SGD, 3)}, Gini {num(gini(AUC_SGD), 3)}</>, caso: <>AUC de treino de {num(aMin, 3)} a {num(aMax, 3)}</> },
  { id: "oot", nome: "Validação OOT", leitura: "Estabilidade nas safras posteriores", pergunta: "A ordenação sobrevive ao tempo?", conta: "AUC fora do tempo ÷ AUC de treino − 1", nasce: "c12p41",
    detector: <>o MNIST não tem safras: só o caso responde</>, caso: <>a AUC cai de {pct(qMin, 1)} a {pct(-BVS.variacao, 1)}</> },
  { id: "vol", nome: "Volume do corte", leitura: "Parcela da população recusada", pergunta: "Quanto negócio deixamos de fazer?", conta: "recusados ÷ contratos", nasce: "c12p40",
    detector: <>{pct(M_SGD.previstosPositivos / M_SGD.n, 1)} das imagens sinalizadas ({int(M_SGD.previstosPositivos)} de {int(M_SGD.n)})</>, caso: <>meta: menos de {pct(META_VOLUME, 0)}</> },
];

export function S46MetricasComite({ pagina }: { pagina?: Pagina }) {
  const [sel, setSel] = useState<Id>("prec");
  const l = LINHAS.find((x) => x.id === sel)!;
  return (
    <Quadro slug="c12p46" pagina={pagina} layout="glx"
      conclusao={<>Precisão, recall e volume medem <b>o mesmo grupo recusado</b>; AUC e validação fora do tempo julgam o score antes do corte. O slide {SLIDE.c12p47.n} usa as três primeiras.</>}
      fonte={`${FONTE_CASO}. Detector de 5: validação cruzada em três partes no treino do MNIST (${int(M_SGD.n)} imagens).`}>
      <Painel className="q12-s46-esq">
        <table className="q7-tab q12-s46-tab">
          <thead><tr><th className="q7-t-l">Métrica</th><th className="q7-t-l">Leitura em crédito (mau = classe positiva)</th><th className="q7-t-l">Pergunta do comitê</th></tr></thead>
          <tbody>{LINHAS.map((x) => (
            <tr key={x.id} data-on={x.id === sel ? "1" : undefined} data-id={x.id}>
              <th className="q7-t-l"><button type="button" className="q12-s46-met" aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>{x.nome}</button></th>
              <td className="q7-t-l">{x.leitura}</td>
              <td className="q7-t-l q12-s46-perg">{x.pergunta}</td>
            </tr>
          ))}</tbody>
        </table>
        <p className="q7-nota">Clique numa métrica para ver a conta e onde ela já apareceu.</p>
      </Painel>
      <Painel tom="suave" className="q12-s46-dir">
        <p className="q7-k">{l.nome}</p>
        <p className="q12-s46-perg2">{l.pergunta}</p>
        <p className="q7-k">Conta em crédito</p>
        <p className="q12-s46-conta">{l.conta}</p>
        <dl className="q7-lista q12-s46-lista">
          <div><dt>Detector de 5</dt><dd>{l.detector}</dd></div>
          <div><dt>No caso</dt><dd>{l.caso}</dd></div>
        </dl>
        <p className="q7-p">Nasceu no <LinkSlide slug={l.nasce} rotulo={`Ir ao slide ${SLIDE[l.nasce].n}`}>slide {SLIDE[l.nasce].n}</LinkSlide>.</p>
        <div className="q7-botoes q12-s46-bot"><Botao sec onClick={() => setSel("prec")} desab={sel === "prec"}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

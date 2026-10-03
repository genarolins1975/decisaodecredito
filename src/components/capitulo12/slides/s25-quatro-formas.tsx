"use client";
import { useState, type ReactNode } from "react";
import { LinkSlide, Previsao, Quadro, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { SLIDE } from "@/lib/capitulo12/roteiro";

/**
 * 25 · c12p25 · Quatro formas de aproximar a independência dos erros: votação, bagging, floresta aleatória e boosting,
 * cada uma num cartão ligado ao slide em que começa (LinkSlide). Previsão: qual das quatro não pode treinar os modelos
 * em paralelo? A resposta (boosting, cada modelo depende dos erros do anterior) revela o rótulo de treino de cada
 * cartão, paralelo ou sequencial. Sem números de dados. Estado inicial: previsão em aberto e rótulos de treino ocultos;
 * "Tentar outra" volta a ele.
 */
const FORMAS = [
  { id: "votacao", nome: "Votação", fonte: "Algoritmos diferentes, que erram de formas diferentes", slide: "c12p23", seq: false },
  { id: "bagging", nome: "Bagging", fonte: "O mesmo algoritmo, treinado em amostras diferentes", slide: "c12p29", seq: false },
  { id: "floresta", nome: "Florestas aleatórias", fonte: "Amostras diferentes e características sorteadas a cada divisão", slide: "c12p34", seq: false },
  { id: "boosting", nome: "Boosting", fonte: "Cada modelo se concentra nos erros dos anteriores", slide: "c12p36", seq: true },
];
const OPS: Opcao[] = [
  { texto: "Votação", certa: false, retorno: <>Os três algoritmos treinam cada um por si, nos mesmos dados; só a contagem dos votos vem depois.</> },
  { texto: "Bagging", certa: false, retorno: <>As amostras são sorteadas antes e cada árvore treina sozinha: n_jobs=-1 distribui as árvores por todos os núcleos do processador (slide {SLIDE.c12p30.n}).</> },
  { texto: "Florestas aleatórias", certa: false, retorno: <>A floresta é bagging com sorteio de características: as árvores também treinam em paralelo.</> },
  { texto: "Boosting", certa: true, retorno: <>Isso: cada modelo ajusta o que o anterior errou, e só pode começar quando ele termina (slide {SLIDE.c12p36.n}).</> },
];

/** Ícone de cada técnica (decorativo, aria-hidden): o que muda entre os modelos do conjunto. */
const AZ = "#3D5A8A", VD = "#2E6B4F", CI = "#9AA1AD";
function Icone({ id }: { id: string }) {
  const caixa = (x: number, y: number, k: string, el: ReactNode) => <g key={k} transform={`translate(${x} ${y})`}><rect x={-16} y={-16} width={32} height={32} rx={6} fill="#fff" stroke={CI} strokeWidth={2} />{el}</g>;
  const pontos = (sem: number) => [0, 1, 2, 3, 4].map((j) => { const a = ((sem * 37 + j * 53) % 100) / 100, b = ((sem * 61 + j * 29) % 100) / 100; return <circle key={j} cx={-10 + a * 20} cy={-10 + b * 20} r={2.6} fill={j % 2 ? VD : AZ} />; });
  return (
    <svg className="q12-s25-ic" viewBox="0 0 160 64" aria-hidden="true">
      {id === "votacao" && <>
        {caixa(30, 22, "a", <circle r={8} fill={AZ} />)}{caixa(80, 22, "b", <path d="M0 -9L9 7H-9Z" fill={VD} />)}{caixa(130, 22, "c", <rect x={-8} y={-8} width={16} height={16} fill="#A85A0C" />)}
        <path d="M30 40V50H130V40M80 40V58" fill="none" stroke={CI} strokeWidth={2} />
      </>}
      {id === "bagging" && [30, 80, 130].map((x, i) => caixa(x, 30, String(i), pontos(i + 1)))}
      {id === "floresta" && [30, 80, 130].map((x, i) => (
        <g key={i} transform={`translate(${x} 10)`}>
          <path d="M0 0V14M0 14L-14 30M0 14L14 30M-14 30L-20 44M-14 30L-8 44M14 30L8 44M14 30L20 44" fill="none" stroke={CI} strokeWidth={2} />
          <path d={i === 0 ? "M0 0V14L-14 30" : i === 1 ? "M0 0V14L14 30L20 44" : "M0 14L-14 30L-8 44"} fill="none" stroke="#A85A0C" strokeWidth={3} />
        </g>
      ))}
      {id === "boosting" && [30, 80, 130].map((x, i) => caixa(x, 30, String(i), <path d={`M-12 ${6 - i * 2}H${-4 + i * 2}V${-4 + i * 3}H12`} fill="none" stroke="#00205B" strokeWidth={2.4} />))}
    </svg>
  );
}

export function S25QuatroFormas({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc !== null && OPS[esc].certa;
  return (
    <Quadro slug="c12p25" pagina={pagina} layout="um"
      conclusao={<>{revelado ? "Votação, bagging e floresta treinam em paralelo; o boosting, em sequência." : "Cada técnica produz diversidade de um jeito."} Testamos as quatro no mesmo problema, a seguir: <LinkSlide slug="c12p26" className="q12-b3-link">duas luas entrelaçadas (slide {SLIDE.c12p26.n})</LinkSlide>.</>}
      fonte="Classificação das técnicas como no material da aula e em Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7.">
      <div className="q12-s25">
        <ol className="q12-s25-cartoes" aria-label="Quatro formas de produzir diversidade">
          {FORMAS.map((f, i) => (
            <li key={f.id} data-seq={revelado ? (f.seq ? "1" : "0") : undefined}>
              <LinkSlide slug={f.slide} className="q12-s25-c" rotulo={`${f.nome}: ${f.fonte}. Começa no slide ${SLIDE[f.slide].n}`}>
                <span className="q12-s25-n">{String(i + 1).padStart(2, "0")}</span>
                <b>{f.nome}</b>
                <Icone id={f.id} />
                <span className="q12-s25-f">{f.fonte}</span>
                <span className="q12-s25-rod">
                  <span className="q12-s25-t" data-on={revelado ? "1" : undefined}>{revelado ? (f.seq ? "treino em sequência" : "treino em paralelo") : "treino: ?"}</span>
                  <small>slide {SLIDE[f.slide].n} →</small>
                </span>
              </LinkSlide>
            </li>
          ))}
        </ol>
        <div className="q12-s25-prev">
          <Previsao pergunta="Três delas podem treinar os modelos ao mesmo tempo. Qual precisa treinar em sequência?" opcoes={OPS} escolha={esc} onEscolha={setEsc} />
        </div>
      </div>
    </Quadro>
  );
}

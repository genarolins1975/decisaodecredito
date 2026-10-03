"use client";
import { useState, type ReactNode } from "react";
import { Botao, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { MatrizReal } from "../pecas";
import { FONTE_MNIST, M_SGD, M_TRIVIAL } from "@/lib/capitulo12/dados";
import { metricas, type Metricas } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 15 · c12p15 · Só a acurácia faz o modelo trivial parecer razoável. Tabela das quatro métricas (acurácia, precisão,
 * recall, F1), cada uma com a pergunta que responde, para o detector SGD e um modelo de comparação, tudo por metricas()
 * de metricas.ts sobre a matriz da validação cruzada. O seletor troca o modelo de comparação: "nunca diz 5"
 * (M_TRIVIAL: precisão indefinida, 0/0) e "sempre diz 5" (VP = 5.421, FP = 54.579). A linha que engana em cada um
 * fica marcada, e a matriz dele aparece ao lado. Estado inicial: "nunca diz 5". "Restaurar" volta a ele.
 */
const SEMPRE = metricas({ vp: M_SGD.positivos, fp: M_SGD.negativos, fn: 0, vn: 0 });
const MODELOS: Record<"nunca" | "sempre", { nome: string; m: Metricas; engana: Chave; texto: ReactNode }> = {
  nunca: { nome: "Nunca diz 5", m: M_TRIVIAL, engana: "acuracia", texto: <>A acurácia de <b>{pct(M_TRIVIAL.acuracia, 1)}</b> parece razoável; recall e F1 zero mostram que ele não encontra nenhum 5, e a precisão nem existe.</> },
  sempre: { nome: "Sempre diz 5", m: SEMPRE, engana: "recall", texto: <>O recall de <b>{pct(SEMPRE.recall!, 0)}</b> parece perfeito; a precisão de {pct(SEMPRE.precisao!, 1)} mostra que {pct(1 - SEMPRE.precisao!, 1)} das previsões de 5 são alarmes falsos.</> },
};
type Chave = "acuracia" | "precisao" | "recall" | "f1";
const LINHAS: { k: Chave; nome: string; perg: string }[] = [
  { k: "acuracia", nome: "Acurácia", perg: "Que fração das imagens ele acerta?" },
  { k: "precisao", nome: "Precisão", perg: "Quando diz 5, quanto acerta?" },
  { k: "recall", nome: "Recall", perg: "Dos 5 que existem, quantos encontra?" },
  { k: "f1", nome: "F1", perg: "Precisão e recall juntos, com peso igual?" },
];
if (M_TRIVIAL.precisao !== null || M_TRIVIAL.recall !== 0 || M_TRIVIAL.f1 !== 0) throw new Error("s15: o modelo que nunca diz 5 deveria ter precisão indefinida, recall e F1 zero");
if (SEMPRE.recall !== 1 || Math.abs(SEMPRE.precisao! - M_SGD.prevalencia) > 1e-12) throw new Error("s15: o modelo que sempre diz 5 deveria ter recall 100% e precisão igual à prevalência");

function Celula({ v, tom }: { v: number | null; tom: "sgd" | "cmp" }) {
  if (v === null) return <td className="q12-s15-v"><span className="q12-s15-ind">indefinida (0/0)</span></td>;
  return <td className="q12-s15-v" data-tom={tom}><span className="q12-s15-bar" aria-hidden="true"><i style={{ width: `${v * 100}%` }} /></span><b>{pct(v, 1)}</b></td>;
}

export function S15QuatroMetricas({ pagina }: { pagina?: Pagina }) {
  const [mod, setMod] = useState<"nunca" | "sempre">("nunca");
  const c = MODELOS[mod];
  return (
    <Quadro slug="c12p15" pagina={pagina} layout="gl"
      conclusao={<>Cada métrica trivial engana de um jeito: “{c.nome.toLowerCase()}” tem {LINHAS.find((l) => l.k === c.engana)!.nome.toLowerCase()} de <b>{pct(c.m[c.engana]!, 1)}</b>. A métrica certa depende de qual erro custa mais na decisão (slide {SLIDE.c12p16.n}).</>}
      fonte={`${FONTE_MNIST}. Métricas de metricas() sobre a matriz da validação cruzada; os modelos de comparação usam os mesmos ${int(M_SGD.positivos)} cincos e ${int(M_SGD.negativos)} não 5.`}>
      <Painel className="q12-s15-tab">
        <div className="q12-s15-rola">
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Métrica</th><th className="q7-t-l">Pergunta que responde</th><th>Detector SGD</th><th>{c.nome}</th></tr></thead>
          <tbody>
            {LINHAS.map((l) => (
              <tr key={l.k} data-on={l.k === c.engana ? "1" : undefined}>
                <th scope="row">{l.nome}{l.k === c.engana && <span className="q12-s15-eng">engana</span>}</th>
                <td className="q7-t-l q12-s15-perg">{l.perg}</td>
                <Celula v={M_SGD[l.k]} tom="sgd" />
                <Celula v={c.m[l.k]} tom="cmp" />
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Painel>
      <Painel titulo="Modelo de comparação">
        <Seg rotulo="Modelo de comparação" opcoes={[{ v: "nunca", r: "Nunca diz 5" }, { v: "sempre", r: "Sempre diz 5" }]} valor={mod} onChange={setMod} cor />
        <MatrizReal vn={c.m.vn} fp={c.m.fp} fn={c.m.fn} vp={c.m.vp} compacta />
        <p className="q7-p q12-s15-txt">{c.texto}</p>
        <div className="q7-botoes"><Botao sec onClick={() => setMod("nunca")} desab={mod === "nunca"}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

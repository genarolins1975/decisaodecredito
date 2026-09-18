"use client";
import { useState } from "react";

/**
 * Três fenômenos distintos (capítulo 9, c9p2). Deslocamento de entrada, mudança de nível e mudança de relação têm
 * assinaturas diferentes nas três leituras (distribuição de entrada, previsto contra observado, ordenação por
 * faixa) e ações incompatíveis. As curvas são esquemáticas: mostram a forma da assinatura, não uma carteira.
 */
type Fen = "entrada" | "nivel" | "relacao";
const FEN: { k: Fen; n: number; nome: string; curto: string; texto: string; causa: string; rotulo: string; acao: string; leituras: [string, string, string] }[] = [
  { k: "entrada", n: 1, nome: "Deslocamento da distribuição de entrada", curto: "Entrada mudou", texto: "Quem chega mudou. A distribuição das características observadas se deslocou em relação à população de treino. A relação entre característica e default pode continuar exatamente a mesma.", causa: "Campanha comercial, novo canal, mudança de política de originação, corte de sistema ou erro de integração de um campo.", rotulo: "Observável sem rótulo maduro. É o único dos três que se mede hoje, sem esperar o horizonte de doze meses se completar.", acao: "investigar mix, canal e integração do dado antes de mexer no modelo", leituras: ["se move", "pode continuar coerente", "preservada"] },
  { k: "nivel", n: 2, nome: "Mudança de nível do alvo", curto: "Nível mudou", texto: "A frequência de default mudou para todo mundo, aproximadamente na mesma proporção. A ordenação entre propostas continua válida: o pior grupo continua sendo o pior. O que ficou errado é o nível, não a ordem.", causa: "Ambiente econômico, mudança de produto, mudança na definição operacional de default.", rotulo: "Exige rótulo maduro. Só se mede em safra que completou o horizonte inteiro.", acao: "avaliar recalibração de nível, com o diagnóstico anexado", leituras: ["não se move", "previsto sistematicamente abaixo ou acima do observado", "preservada"] },
  { k: "relacao", n: 3, nome: "Mudança da relação", curto: "Relação mudou", texto: "A ligação entre característica e default mudou. Uma variável que separava bem deixou de separar, ou passou a separar ao contrário em parte da faixa. A ordenação se degrada, e não uniformemente.", causa: "Mudança de significado do dado, novo comportamento do cliente, produto aplicado a público para o qual nunca foi estimado.", rotulo: "Exige rótulo maduro e leitura por faixa. É o mais lento de detectar e o mais caro de ignorar.", acao: "revisão completa, reestimação e possivelmente novo conjunto de variáveis", leituras: ["pode não se mover", "erra em faixas específicas, com sinais opostos", "cai"] },
];
const DECIS = Array.from({ length: 10 }, (_, i) => i);
const REF = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
const PREV = [0.02, 0.03, 0.04, 0.05, 0.065, 0.08, 0.1, 0.13, 0.17, 0.25];
/** Assinatura esquemática de cada fenômeno nas três leituras. */
function assinatura(k: Fen): { entrada: number[]; observado: number[] } {
  if (k === "entrada") return { entrada: [0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.12, 0.13, 0.14, 0.16], observado: PREV.map((p) => p * 1.02) };
  if (k === "nivel") return { entrada: REF, observado: PREV.map((p) => p * 1.4) };
  return { entrada: REF, observado: [0.06, 0.05, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12] };
}
const W = 220, H = 120, ML = 8, MB = 18, MT = 10;

export function TresFenomenos() {
  const [k, setK] = useState<Fen>("entrada");
  const f = FEN.find((x) => x.k === k)!; const a = assinatura(k);
  return (
    <figure className="vz" data-vz="tres-fenomenos">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Três fenômenos distintos · a mesma queixa, a inadimplência subiu, admite três causas</p>
          <p className="vz-tit">Confundi-los é o erro central da prática. Escolher a ação antes do diagnóstico é o erro que custa mais caro.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Fenômeno">
          {FEN.map((x) => <button key={x.k} type="button" className={`btn btn-sm ${k === x.k ? "" : "btn-secondary"}`} onClick={() => setK(x.k)}>{x.n}. {x.curto}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>{f.n}. {f.nome}:</b> {f.texto} Ação correta: {f.acao}.</div>
      <div className="vz-tf-grade">
        <div className="vz-tf-leituras">
          <p className="vz-grafico-t">A assinatura nas três leituras <span className="hint">esquemático: a forma, não uma carteira</span></p>
          <div className="vz-tf-tres">
            <Leitura titulo="Distribuição de entrada" nota={f.leituras[0]} tipo="entrada" base={REF} cur={a.entrada} />
            <Leitura titulo="Previsto contra observado" nota={f.leituras[1]} tipo="nivel" base={PREV} cur={a.observado} />
            <Leitura titulo="Ordenação por faixa" nota={f.leituras[2]} tipo="relacao" base={PREV} cur={a.observado} />
          </div>
          <div className="table-wrap"><table className="table text-[.85em] vz-tf-tabela"><thead><tr><th>Fenômeno</th><th>Distribuição de entrada</th><th>Previsto contra observado</th><th>Ordenação por faixa</th><th>Ação correta</th></tr></thead><tbody>
            {FEN.map((x) => <tr key={x.k} className={x.k === k ? "vz-t-on" : ""} onClick={() => setK(x.k)} style={{ cursor: "pointer" }}><th scope="row">{x.curto}</th><td>{x.leituras[0]}</td><td>{x.leituras[1]}</td><td className={x.leituras[2] === "cai" ? "vz-t-default" : ""}>{x.leituras[2]}</td><td>{x.acao}</td></tr>)}
          </tbody></table></div>
          <p className="hint">Nenhuma coluna sozinha decide. O diagnóstico é a combinação das três, e é por isso que um painel com um indicador só não governa nada.</p>
        </div>
        <div className="vz-tf-lado">
          <div className={`vz-tile vz-tf-cartao vz-tf-cartao--${k}`}><p className="eyebrow">{f.n}. {f.nome}</p><p className="vz-num vz-num--texto">{f.texto}</p><p className="hint"><b>Causa típica.</b> {f.causa}</p><p className="hint"><b>{k === "entrada" ? "Sem esperar rótulo." : "Espera maturação."}</b> {f.rotulo}</p></div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Por que a confusão custa caro</p><p className="vz-num vz-num--texto">Recalibrar o nível quando o que mudou foi a entrada esconde um erro de integração dentro do intercepto: o número passa a fechar e o defeito continua lá. Reestimar o modelo inteiro quando o que mudou foi só o nível joga fora uma estrutura que estava funcionando e introduz variância nova. Investigar mix quando o que mudou foi a relação gasta semanas e não encontra nada.</p></div>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">A ordem que funciona</p><p className="vz-num vz-num--texto">Primeiro medir a entrada, que é rápida e não espera rótulo. Depois, na safra madura, comparar previsto com observado no agregado e por faixa. Só então propor ação. Inverter essa ordem produz a ação certa para o problema errado com frequência desconfortável.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Deslocamento de entrada: a distribuição por decil de escore se move, o previsto continua coerente com o observado e a ordenação se preserva. Mudança de nível: a distribuição não se move e o observado fica sistematicamente acima ou abaixo do previsto em todas as faixas. Mudança de relação: o erro troca de sinal entre faixas e a curva de default por decil achata. A primeira das três leituras tem um índice consagrado, e ele se constrói faixa a faixa.</p>
    </figure>
  );
}

function Leitura({ titulo, nota, tipo, base, cur }: { titulo: string; nota: string; tipo: Fen; base: number[]; cur: number[] }) {
  const max = Math.max(...base, ...cur) * 1.15; const bw = (W - ML * 2) / 10;
  const sy = (v: number) => MT + (1 - v / max) * (H - MT - MB);
  return (
    <div className="vz-tf-leitura">
      <p className="vz-tf-leitura-t">{titulo} <span className={`vz-tf-nota ${nota === "cai" || nota.startsWith("previsto") || nota.startsWith("erra") || nota === "se move" ? "vz-tf-nota--muda" : ""}`}>{nota}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${titulo}: ${nota}`}>
        {tipo === "relacao" ? <>
          <polyline points={DECIS.map((i) => `${ML + (i + 0.5) * bw},${sy(base[i])}`).join(" ")} className="vz-tf-linha vz-tf-linha--ref" />
          <polyline points={DECIS.map((i) => `${ML + (i + 0.5) * bw},${sy(cur[i])}`).join(" ")} className="vz-tf-linha vz-tf-linha--cur" />
        </> : DECIS.map((i) => <g key={i}>
          <rect x={ML + i * bw + 1} y={sy(base[i])} width={bw / 2 - 1.5} height={sy(0) - sy(base[i])} className="vz-tf-barra vz-tf-barra--ref" />
          <rect x={ML + i * bw + bw / 2} y={sy(cur[i])} width={bw / 2 - 1.5} height={sy(0) - sy(cur[i])} className="vz-tf-barra vz-tf-barra--cur" />
        </g>)}
        <line x1={ML} x2={W - ML} y1={sy(0)} y2={sy(0)} className="vz-regua" />
        <text x={ML} y={H - 4} className="vz-tick">decil 1</text><text x={W - ML} y={H - 4} textAnchor="end" className="vz-tick">decil 10</text>
      </svg>
      <p className="vz-tf-legenda"><span className="vz-sw vz-sw--ref" /> {tipo === "entrada" ? "treino" : "previsto"} <span className="vz-sw vz-sw--cur" /> {tipo === "entrada" ? "janela" : "observado"}</p>
    </div>
  );
}

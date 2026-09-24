"use client";
import { useMemo, useState } from "react";
import { fmtNum } from "@/lib/visuais/metricas";
import { PONTOS, boostingRegressao } from "@/lib/visuais/boosting";
import { ComTex, Formula, Tex } from "./tex";

/**
 * A ideia do boosting (capítulo 6, c6p2). Três estratégias para combinar modelos, e a terceira em ação sobre os
 * oito pontos: o palpite inicial, quatro correções e o erro que sobra para o caso x = 8, passo a passo.
 */
const ETA = 0.5, M = 4, ALVO = 7; // x = 8
const ESTRATEGIAS = [
  { k: "selecionar", nome: "Selecionar um", modelos: ["M1", "M2", "M3"], ativo: 1, texto: "Treinar candidatos e ficar com o vencedor. É o que o capítulo 5 fez ao escolher entre profundidades.", nota: "Simples e auditável. Descarta toda a informação dos modelos perdedores." },
  { k: "paralelo", nome: "Combinar em paralelo", modelos: ["M1", "M2", "M3", "média"], ativo: -1, texto: "Modelos independentes, treinados em amostras diferentes, votam ou têm suas previsões médias. Reduz a instabilidade da página 16 do capítulo 5.", nota: "Cada modelo tenta resolver o problema inteiro, sozinho. Não há divisão de trabalho." },
  { k: "sequencia", nome: "Corrigir em sequência", modelos: ["F₀", "+h₁", "+h₂", "F"], ativo: 0, texto: "Começar com um palpite simples, medir o que sobrou e treinar o modelo seguinte apenas sobre o que sobrou. Repetir.", nota: "Cada modelo é deliberadamente fraco e resolve uma fatia pequena. É o boosting." },
];
const PASSOS = [
  { rot: "Palpite", titulo: "Começamos simples", txt: "Para o caso $x = 8$, o modelo inicial prevê a média, 6,50; o observado é 12,00." },
  { rot: "Árvore 1", titulo: "Corrigir o maior padrão", txt: "A primeira árvore encontra um grupo subestimado. Com taxa de aprendizagem 0,5, o caso recebe +1,44." },
  { rot: "Árvore 2", titulo: "Recalcular antes de continuar", txt: "A segunda árvore não corrige o erro original; ela aprende o erro que sobrou após a etapa 1." },
  { rot: "Árvore 3", titulo: "Ajustes ficam mais específicos", txt: "O caso recebe uma correção menor. Outros casos podem receber correção negativa." },
  { rot: "Árvore 4", titulo: "A soma se aproxima", txt: "Quatro aprendizes fracos produzem uma previsão mais útil quando suas contribuições são acumuladas." },
];
const W = 640, H = 300, ML = 44, MR = 16, MT = 16, MB = 36;
const sx = (x: number) => ML + ((x - 0.5) / 8) * (W - ML - MR), sy = (y: number) => MT + (1 - y / 14) * (H - MT - MB);

export function TresEstrategias() {
  const [passo, setPasso] = useState(0);
  const passos = useMemo(() => boostingRegressao(PONTOS.x, PONTOS.y, ETA, M, 1), []);
  const p = passos[passo]; const prev = p.F[ALVO]; const erro = PONTOS.y[ALVO] - prev; const erro0 = PONTOS.y[ALVO] - passos[0].F[ALVO];
  const degrau = (F: number[]) => PONTOS.x.map((x, i) => `${i ? "L" : "M"}${sx(x - 0.5).toFixed(1)} ${sy(F[i]).toFixed(1)} L${sx(x + 0.5).toFixed(1)} ${sy(F[i]).toFixed(1)}`).join("");
  return (
    <figure className="vz" data-vz="tres-estrategias">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A ideia · três estratégias para combinar modelos · a terceira é o boosting</p>
          <p className="vz-tit">Em vez de procurar um modelo que acerte tudo, somar modelos fracos, cada um treinado no erro do conjunto anterior.</p>
        </div>
      </header>
      <div className="vz-te-estrategias">
        {ESTRATEGIAS.map((e) => <div key={e.k} className={`vz-tile vz-te-card ${e.k === "sequencia" ? "vz-te-card--boost" : ""}`}>
          <div className="vz-te-modelos" aria-hidden="true">{e.modelos.map((m, i) => <span key={m} className={`vz-te-modelo ${i === e.ativo ? "vz-te-modelo--ativo" : ""} ${m === "média" || m === "F" ? "vz-te-modelo--soma" : ""}`}>{m}</span>)}</div>
          <p className="eyebrow">{e.nome}</p><p className="vz-num vz-num--texto">{e.texto}</p><p className="hint">{e.nota}</p>
        </div>)}
      </div>
      <div className="vz-estado"><b>{passo}. {PASSOS[passo].rot}: previsão para <Tex f={String.raw`\boldsymbol{x = 8}`} className="tx-linha" /> de {fmtNum(prev, 2)}, erro restante {fmtNum(erro, 2)} até o observado 12,00.</b> <ComTex t={PASSOS[passo].txt} /></div>
      <div className="vz-te-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">A terceira estratégia em ação, sobre os oito pontos <span className="hint">o degrau é a previsão acumulada; o traço vertical é o que sobrou para x = 8</span></p>
          <div className="vz-acoes vz-te-passos" role="group" aria-label="Passo">{PASSOS.map((q, i) => <button key={q.rot} type="button" className={`btn btn-sm ${i === passo ? "" : "btn-secondary"}`} onClick={() => setPasso(i)}>{i}. {q.rot}</button>)}</div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Passo ${passo}: previsão ${fmtNum(prev, 2)} para x = 8`}>
            {[0, 3.5, 7, 10.5, 14].map((v) => <g key={v}><line x1={sx(0.5)} x2={sx(8.5)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 1)}</text></g>)}
            {PONTOS.x.map((x) => <text key={x} x={sx(x)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{x}</text>)}
            <text x={sx(4.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">variável x</text>
            {passo > 0 && <path d={degrau(passos[passo - 1].F)} className="vz-curva vz-curva--fraca" />}
            <path d={degrau(p.F)} className="vz-curva vz-curva--ouro" />
            {PONTOS.x.map((x, i) => <line key={x} x1={sx(x)} x2={sx(x)} y1={sy(p.F[i])} y2={sy(PONTOS.y[i])} className={`vz-res-seg ${PONTOS.y[i] > p.F[i] ? "vz-res-seg--baixo" : "vz-res-seg--alto"} ${i === ALVO ? "vz-res-seg--foco" : ""}`} />)}
            {PONTOS.x.map((x, i) => <circle key={x} cx={sx(x)} cy={sy(PONTOS.y[i])} r={i === ALVO ? 8 : 5.5} className={`vz-res-dot ${i === ALVO ? "vz-res-dot--foco" : ""}`} />)}
            <text x={sx(8) - 12} y={sy(PONTOS.y[ALVO]) - 12} textAnchor="end" className="vz-ponto-t">x = 8: observado 12,00 · previsão {fmtNum(prev, 2)}</text>
          </svg>
        </div>
        <div className="vz-te-lado">
          <div className="vz-tile"><p className="eyebrow">Erro absoluto restante para x = 8</p><p className="vz-num">{fmtNum(erro, 2)}</p>
            <div className="vz-tdc-trilho"><span className={`vz-tdc-fill ${erro < 2 ? "vz-tdc-fill--ok" : "vz-tdc-fill--erro"}`} style={{ width: `${(erro / erro0) * 100}%` }} /></div>
            <table className="table text-[.85em] vz-te-tabela"><thead><tr><th>Passo</th><th>Previsão</th><th>Erro</th></tr></thead><tbody>{passos.map((q, i) => <tr key={q.m} className={i === passo ? "vz-t-on" : ""} onClick={() => setPasso(i)} style={{ cursor: "pointer" }}><th scope="row">{i}. {PASSOS[i].rot}</th><td>{fmtNum(q.F[ALVO], 2)}</td><td>{fmtNum(PONTOS.y[ALVO] - q.F[ALVO], 2)}</td></tr>)}</tbody></table></div>
          <Formula f={String.raw`\text{previsão final} = \text{palpite inicial} + \text{correção}_1 + \text{correção}_2 + \cdots + \text{correção}_M`} />
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">Por que fraco de propósito</p><p className="vz-num vz-num--texto">Se o primeiro modelo fosse forte, sobraria pouco para os seguintes e o conjunto seria essencialmente ele. A força do método vem de muitas correções pequenas, cada uma difícil de superajustar sozinha.</p></div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">O risco que isso cria</p><p className="vz-num vz-num--texto">Correções sucessivas no mesmo conjunto de dados acabam acompanhando o ruído daquele conjunto. O boosting não superajusta em uma iteração: ele superajusta na milésima. O controle é o número de iterações, e ele precisa ser escolhido fora da amostra de treino.</p></div>
        </div>
      </div>
      <p className="vz-fonte"><ComTex t="Oito pontos do gerador, tocos de profundidade 1 e taxa de aprendizagem 0,5. Para $x = 8$ a previsão vai de 6,50 a 7,94, 9,97, 10,35 e 10,86, e o erro cai de 5,50 a 1,14. Vamos ver isso acontecer ponto a ponto nas próximas páginas." /></p>
    </figure>
  );
}

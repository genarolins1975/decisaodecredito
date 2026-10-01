"use client";
import { useState } from "react";
import { Botao, Painel, Previsao, Quadro, type Pagina } from "../base";
import { D, EAD, N, PG, PL, RES, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, interceptoESlope, logLoss } from "@/lib/capitulo7/metricas";
import { curva, fmtReais, GRADE_CORTES, otimo, realizado } from "@/lib/visuais/economia";
import { num, pct } from "@/lib/capitulo7/formato";
import { N_JANELAS, vantagemEmJanelasNovas } from "@/lib/capitulo7/janelas";

/**
 * 36 · c7p38 · Caso integrador. O comitê recebe o boosting com Platt como candidato a substituir a logística. Quatro
 * cartões de evidência, um por pergunta do capítulo, com números calculados aqui; a decisão só abre depois de três
 * cartões consultados. Cada alternativa errada devolve a confusão que ela revela. A vantagem esperada em janelas
 * novas vem do slide 33 (300 sorteios, semente 20261033) e é citada, não recalculada, para não pesar no carregamento.
 */
type P = "ord" | "prob" | "dec" | "val";
const DL = delong(Y, PL, PG);
const CAL_L = calibracaoGlobal(Y, PL), CAL_G = calibracaoGlobal(Y, PG);
const SL_L = interceptoESlope(Y, PL).slope, SL_G = interceptoESlope(Y, PG).slope;
const LL_L = logLoss(Y, PL).valor, LL_G = logLoss(Y, PG).valor;
const real = (p: readonly number[], c: number) => { let s = 0; for (let i = 0; i < N; i++) if (p[i] < c) s += realizado(Y[i], EAD[i]); return s; };
const OT_L = otimo(curva(PL as number[], EAD as number[], GRADE_CORTES)), OT_G = otimo(curva(PG as number[], EAD as number[], GRADE_CORTES));
type Cartao = { k: P; t: string; cor: string; s: string; linhas: [string, string, string][]; leitura: string };
const CARTOES: Cartao[] = [
  { k: "ord", t: "Ordenação", cor: "#3D5A8A", s: "●", linhas: [["AUC na janela", num(DL.auc2, 4), num(DL.auc1, 4)], ["KS", num(RES.gbm_platt_oot.ks, 4), num(RES.logit_oot.ks, 4)], ["Diferença (DeLong)", `${num(-DL.dif, 4)}`, `p = ${num(DL.p, 3)}`]],
    leitura: "Candidato ordena pior nesta janela; a margem é estreita." },
  { k: "prob", t: "Probabilidade", cor: "#176C73", s: "▲", linhas: [["PD média (obs. " + pct(D / N, 1) + ")", pct(CAL_G.pdMedia!, 1), pct(CAL_L.pdMedia!, 1)], ["Observado ÷ esperado", num(CAL_G.razaoOE!, 3), num(CAL_L.razaoOE!, 3)], ["Slope; log loss", `${num(SL_G, 2)}; ${num(LL_G, 4)}`, `${num(SL_L, 2)}; ${num(LL_L, 4)}`]],
    leitura: "Candidato superestima o risco e comprime demais; a logística subestima o nível, mas a forma está mais perto." },
  { k: "dec", t: "Decisão", cor: "#B8640F", s: "◆", linhas: [["Corte econômico", pct(OT_G.corte, 1), pct(OT_L.corte, 1)], ["Resultado prometido", fmtReais(OT_G.parcelas.total), fmtReais(OT_L.parcelas.total)], ["Realizado na janela", fmtReais(real(PG, OT_G.corte)), fmtReais(real(PL, OT_L.corte))]],
    leitura: "Os dois erram a promessa, em sentidos opostos: erro de nível vira erro de orçamento." },
  { k: "val", t: "Validação", cor: "#2E6B4F", s: "■", linhas: [["AUC no treino", num(RES.gbm_treino.auc, 4), num(RES.logit_treino.auc, 4)], ["Calibrador ajustado em", "validação", "não há"], ["Defaults na janela", String(D), String(D)]],
    leitura: "Sobreajuste forte no treino; a validação serviu para hiperparâmetros e para o Platt; só aprovados." },
];

export function S36CasoIntegrador({ pagina }: { pagina?: Pagina }) {
  const [vistos, setVistos] = useState<P[]>([]);
  const [aberto, setAberto] = useState<P | null>(null);
  const [esc, setEsc] = useState<number | null>(null);
  const liberado = vistos.length >= 3;
  const abrir = (k: P) => { setAberto(aberto === k ? null : k); if (!vistos.includes(k)) setVistos([...vistos, k]); };
  return (
    <Quadro slug="c7p38" pagina={pagina} layout="gl"
      conclusao={esc === null ? <>O comitê recebe o boosting com Platt para substituir a logística. Consulte pelo menos três cartões, um por pergunta, antes de decidir. {vistos.length ? `Consultados: ${vistos.length} de 4.` : ""}</>
        : esc === 2 ? <>Decisão sustentada por três tipos de evidência: a ordenação não melhora, a probabilidade do candidato está fora de nível e forma, e a janela já foi usada. O caminho é corrigir o nível da logística em amostra própria e reavaliar o candidato numa janela nova.</>
          : <>Revise a evidência: a decisão escolhida ignora pelo menos uma das quatro perguntas. Tente outra.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Candidato: boosting com Platt (parâmetros do capítulo 6). Incumbente: logística (capítulo 4). Motor econômico do capítulo 8. Vantagem em janelas novas: slide 33, só possível em base sintética.`}>
      <Painel titulo="Dossiê: candidato contra incumbente">
        <div className="q7-s36-g">
          {CARTOES.map((c) => (
            <div key={c.k} className="q7-s36-c" data-on={aberto === c.k ? "1" : "0"} style={{ borderLeftColor: c.cor, borderTopColor: "var(--q7-borda)" }}>
              <button type="button" className="q7-s36-b" aria-expanded={aberto === c.k} onClick={() => abrir(c.k)}>
                <span style={{ color: c.cor }} aria-hidden="true">{c.s}</span>{c.t}{vistos.includes(c.k) ? <em> consultado</em> : null}
              </button>
              {aberto === c.k ? (
                <>
                  <table className="q7-tab"><thead><tr><th className="q7-t-l"></th><th>Candidato</th><th>Logística</th></tr></thead>
                    <tbody>{c.linhas.map((l) => <tr key={l[0]}><th>{l[0]}</th><td>{l[1]}</td><td>{l[2]}</td></tr>)}</tbody></table>
                  <p className="q7-nota">{c.leitura}{c.k === "ord" ? ` Em ${N_JANELAS} janelas novas simuladas, a vantagem esperada da logística é ${num(vantagemEmJanelasNovas().l - vantagemEmJanelasNovas().g, 4)}.` : ""}</p>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </Painel>
      <Painel>
        {liberado ? (
          <Previsao rotulo="Sua decisão" pergunta="O que o comitê deve fazer?" escolha={esc} onEscolha={setEsc}
            opcoes={[
              { texto: "Aprovar o boosting com Platt", retorno: "Confunde ter um modelo novo com ter um modelo melhor. Ele ordena pior nesta janela e a PD dele não está calibrada (observado ÷ esperado abaixo de 1)." },
              { texto: "Recalibrar o boosting na janela e aprovar", retorno: "Usa a prova para ajustar: depois disso a janela não mede mais nada (slide 27). E recalibrar não melhora a ordenação." },
              { texto: "Manter a logística, corrigir o nível dela em amostra própria e reavaliar o boosting numa janela nova", certa: true, retorno: "Isso. Ordenação sem ganho, probabilidade do candidato fora de nível e de forma, janela já usada: três evidências apontam para o mesmo lado." },
              { texto: "Trocar, porque a diferença de AUC é pequena", retorno: "Ausência de diferença grande não prova equivalência, e o ônus da prova é de quem substitui. Além disso, a probabilidade do candidato é pior." },
            ]} />
        ) : (
          <div className="q7-s36-trava">
            <p className="q7-k">Decisão bloqueada</p>
            <p className="q7-p">Abra pelo menos três cartões de evidência. Consultados: <b>{vistos.length} de 4</b>.</p>
            <ul className="q7-nota">{CARTOES.map((c) => <li key={c.k}>{vistos.includes(c.k) ? "■" : "□"} {c.t}</li>)}</ul>
          </div>
        )}
        <div className="q7-botoes"><Botao sec onClick={() => { setVistos([]); setAberto(null); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

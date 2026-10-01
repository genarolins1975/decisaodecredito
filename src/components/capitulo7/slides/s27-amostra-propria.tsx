"use client";
import { useState } from "react";
import { Botao, Expandir, Kpi, Painel, Quadro, Seg, type Pagina } from "../base";
import { CAL, CAL_PL, META, PL, Y } from "@/lib/capitulo7/dados";
import { ajustarPlatt, logLoss, transformar } from "@/lib/capitulo7/metricas";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 27 · c7p16 · Recalibrar exige uma amostra própria. A linha do tempo da base do curso, com o lugar de cada ajuste. O
 * atalho (ajustar o calibrador na janela final e medir nela mesma) é comparado com o protocolo (ajustar na amostra de
 * calibração e medir na janela): Platt sobre a logística, log loss na janela. O atalho parece melhor por construção.
 */
type Modo = "certo" | "atalho";
const PLATT_CAL = ajustarPlatt(CAL.y, CAL_PL);
const PLATT_OOT = ajustarPlatt(Y, PL);
const LL_CERTO = logLoss(Y, transformar(PL, PLATT_CAL.a, PLATT_CAL.b)).valor;
const LL_ATALHO = logLoss(Y, transformar(PL, PLATT_OOT.a, PLATT_OOT.b)).valor;
const LL_SEM = logLoss(Y, PL).valor;
const ETAPAS = [
  { k: "treino", nome: "Treino", per: "2022-01 a 2023-02", n: META.nTreino, faz: "estima o modelo", cor: "#3D5A8A" },
  { k: "val", nome: "Validação", per: "2023-03 a 2023-07", n: META.nVal, faz: "escolhe hiperparâmetros", cor: "#5B6475" },
  { k: "cal", nome: "Calibração", per: "amostra própria", n: CAL.n, faz: "ajusta o calibrador", cor: "#176C73" },
  { k: "oot", nome: "Teste final (OOT)", per: "2023-08 a 2023-12", n: META.nOot, faz: "mede uma vez, no fim", cor: "#2E6B4F" },
];

export function S27AmostraPropria({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("certo");
  const certo = modo === "certo";
  return (
    <Quadro slug="c7p16" pagina={pagina} layout="gl"
      conclusao={certo ? <>Calibrador ajustado na amostra de calibração e medido na janela que ele nunca viu: log loss <b>{num(LL_CERTO, 4)}</b>. Esse é o número que vale como evidência{LL_CERTO > LL_SEM ? <>, e ele mostra que aqui o calibrador <b>piora</b> a logística ({num(LL_SEM, 4)} sem calibrar): recalibrar não é melhora garantida</> : null}.</>
        : <>Ajustado e medido na mesma janela: log loss <b>{num(LL_ATALHO, 4)}</b>, menor que o honesto ({num(LL_CERTO, 4)}). Não é melhora: é o ajuste lendo as respostas da prova. <b>Nunca reporte a qualidade de um calibrador na amostra em que ele foi ajustado.</b></>}
      fonte={`Base do curso: ${int(META.nTreino)} propostas de treino, ${int(META.nVal)} de validação e ${int(META.nOot)} fora do tempo, desfecho em 12 meses, data de referência ${META.dataReferencia.split("-").reverse().join("/")}. Amostra de calibração simulada: ${int(CAL.n)} propostas sorteadas da janela com desfecho novo tirado da PD verdadeira (semente ${CAL.semente}); existe só porque a base é sintética.`}>
      <Painel titulo="A linha do tempo da base e o lugar de cada ajuste">
        <div className="q7-s27-tl" role="list">
          {ETAPAS.map((e) => {
            const errado = !certo && (e.k === "cal" || e.k === "oot");
            return (
              <div key={e.k} role="listitem" className="q7-s27-e" data-k={e.k} data-errado={errado ? "1" : "0"} style={{ borderTopColor: e.cor }}>
                <p className="q7-s27-n">{e.nome}</p>
                <p className="q7-s27-p">{e.per}</p>
                <p className="q7-s27-c">{int(e.n)} propostas</p>
                <p className="q7-s27-f">{!certo && e.k === "cal" ? "não usada" : !certo && e.k === "oot" ? "ajusta o calibrador e mede nele" : e.faz}</p>
              </div>
            );
          })}
        </div>
        <div className="q7-s27-mat">
          <span>Maturação: cada safra precisa de 12 meses completos de observação.</span>
          <span>Última safra do teste: dezembro de 2023, observada até dezembro de 2024; base fechada em {META.dataReferencia.split("-").reverse().join("/")}.</span>
        </div>
        <Expandir resumo="E sem amostra própria? Validação cruzada">
          <p className="q7-nota">Com poucos dados, o calibrador pode ser ajustado por validação cruzada: o modelo é treinado em k − 1 partes e prevê a parte de fora; o calibrador aprende só dessas previsões fora da amostra. O teste final continua fechado. Na base do curso, a validação serviu para escolher hiperparâmetros e, pela documentação, também para o Platt do boosting: reutilizar a mesma amostra para as duas escolhas é um atalho que deve ser declarado.</p>
        </Expandir>
      </Painel>
      <Painel>
        <Seg rotulo="Procedimento" opcoes={[{ v: "certo" as Modo, r: "Protocolo" }, { v: "atalho" as Modo, r: "Atalho" }]} valor={modo} onChange={setModo} cor />
        <p className="q7-p">{certo ? "Platt sobre a logística, ajustado na amostra de calibração, medido no teste." : "Platt sobre a logística, ajustado no teste e medido no próprio teste."}</p>
        <div className="q7-kpis q7-kpis--col">
          <Kpi rotulo="Log loss no teste (honesto)" valor={num(LL_CERTO, 4)} detalhe={`a = ${num(PLATT_CAL.a, 3)}, b = ${num(PLATT_CAL.b, 3)}`} tom="val" />
          <Kpi rotulo="Log loss do atalho" valor={certo ? "?" : num(LL_ATALHO, 4)} detalhe={certo ? "escolha Atalho para ver" : `a = ${num(PLATT_OOT.a, 3)}, b = ${num(PLATT_OOT.b, 3)}`} tom="def" />
          <Kpi rotulo="Sem calibrador" valor={num(LL_SEM, 4)} detalhe="a logística como estimada" />
        </div>
        <div className="q7-botoes"><Botao sec onClick={() => setModo("certo")}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

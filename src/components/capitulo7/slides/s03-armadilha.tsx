"use client";
import { useState } from "react";
import { Botao, Controle, Kpi, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Matriz, Pessoas } from "../pecas";
import { confusao } from "@/lib/capitulo7/metricas";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 03 · c7p2 · A armadilha da acurácia. A carteira tem o tamanho da janela (737 propostas); a turma prevê a acurácia
 * da regra "aprovar todas" na prevalência real (81 defaults) e só então o quadro revela a matriz e libera o controle
 * de prevalência. O total fica fixo; muda quantos deram default. A comparação com a logística no corte de 12% só existe
 * na prevalência real, porque usa os desfechos observados da janela.
 */
const REAL = D; // 81
const LOGIT12 = confusao(Y, PL, 0.12);
const OPCOES = [
  { texto: "Perto de 11%", certa: false, retorno: <>11% é a <b>prevalência</b>. A regra aprova todos e acerta os outros: 656 de 737.</> },
  { texto: "Perto de 50%", certa: false, retorno: <>50% seria um <b>sorteio</b>. A regra aprova todos e acerta todos os 656 adimplentes.</> },
  { texto: "Perto de 89%", certa: true, retorno: <>Isso: <b>656 de 737</b> pagaram, e a regra acerta exatamente esses.</> },
  { texto: "Não dá para saber sem um modelo", certa: false, retorno: <>Dá: a regra não olha o cliente, então a acurácia depende só de <b>quantos pagaram</b>.</> },
];

export function S03Armadilha({ pagina }: { pagina?: Pagina }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const [d, setD] = useState(REAL);
  const revelado = escolha !== null;
  const a = N - d, acc = a / N, real = d === REAL;
  const prev = d / N;
  return (
    <Quadro slug="c7p2" pagina={pagina} layout="gl"
      conclusao={revelado ? <>Aprovar todos acerta <b>{pct(acc, 1)}</b> sem recusar nenhum default. A acurácia não é inútil, mas com evento raro é insuficiente: precisa de referência e não mede a ordem entre clientes.</> : "Escolha uma alternativa à direita antes de ver a matriz."}
      fonte={<>Janela fora do tempo do curso: {int(N)} propostas aprovadas, safras de 2023-08 a 2023-12, {int(REAL)} defaults em 12 meses. Com o controle, o total fica em {int(N)} e muda só o número de defaults (cenário ilustrativo). Recusa quando PD ≥ corte.</>}>
      <Painel titulo={revelado ? `Regra trivial: aprovar todas as ${int(N)} propostas` : "Cada marca é 1% da carteira"} className="q7-s03-esq">
        <div className="q7-s03-vis">
          <div className="q7-s03-pes">
            <Pessoas n={100} d={Math.round(prev * 100)} rotulo={`${Math.round(prev * 100)} de cada 100 propostas deram default`} />
            <ul className="q7-leg"><li><span className="q7-mk q7-mk--def" />deu default: {pct(prev, 1)}</li><li><span className="q7-mk q7-mk--adi" />pagou: {pct(1 - prev, 1)}</li></ul>
          </div>
          <Matriz vp={0} fp={0} fn={d} vn={a} destaque={revelado ? "vn" : null} oculta={!revelado} />
        </div>
        {revelado && (
          <div className="q7-s03-ctl">
            <Controle rotulo="Defaults na carteira de 737" valor={d} min={7} max={369} passo={1} onChange={setD} mostrar={`${int(d)} (${pct(prev, 1)})`} escala={["1%", "50%"]} />
            <div className="q7-botoes"><Botao sec onClick={() => setD(REAL)} desab={real}>Voltar à janela real: 81</Botao><Botao sec onClick={() => setD(Math.round(N * 0.02))}>Carteira com 2%</Botao></div>
          </div>
        )}
      </Painel>
      <Painel>
        <Previsao pergunta={<>Na janela, {int(REAL)} das {int(N)} propostas deram default. Qual é a acurácia da regra que aprova todas?</>} opcoes={OPCOES} escolha={escolha} onEscolha={(i) => { setEscolha(i); setD(REAL); }} recolher />
        {revelado && (
          <>
            <div className="q7-kpis">
              <Kpi rotulo="Acurácia de aprovar todas" valor={pct(acc, 1)} detalhe={`${int(a)} acertos de ${int(N)}`} tam="grande" />
              <Kpi rotulo="Defaults recusados" valor={`0 de ${int(d)}`} detalhe="nenhum risco evitado" tom="def" />
            </div>
            {real ? (
              <p className="q7-p">Um modelo que separa risco pode ter acurácia <b>menor</b>: a logística, recusando PD ≥ 12%, acerta {pct(LOGIT12.acuracia!, 1)} e recusa <b>{LOGIT12.vp} dos {REAL}</b> defaults.</p>
            ) : (
              <p className="q7-p">Com {pct(prev, 1)} de defaults, a regra trivial acerta {pct(acc, 1)}: quanto mais raro o evento, maior a acurácia de não fazer nada.</p>
            )}
          </>
        )}
      </Painel>
    </Quadro>
  );
}

"use client";
import { useState } from "react";
import { Botao, Controle, Kpi, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Pessoas } from "../pecas";
import { confusao } from "@/lib/capitulo7/metricas";
import { A, D, N, PL, Y } from "@/lib/capitulo7/dados";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 03 · c7p2 · A armadilha da acurácia. A carteira tem o tamanho da janela (737 propostas); a turma prevê a acurácia
 * da regra "aprovar todas" na prevalência real (81 defaults) e só então o quadro revela a matriz e libera o controle
 * de prevalência. O total fica fixo; muda quantos deram default. A comparação com a logística no corte de 12% só existe
 * na prevalência real, porque usa os desfechos observados da janela.
 */
const REAL = D;

/**
 * Matriz da regra "aprovar todas", com o mesmo desenho da matriz do kit (pecas.tsx). Antes da previsão só o total de
 * defaults fica à vista: o total de quem pagou e os totais por decisão dariam a resposta antes da tentativa.
 */
function MatrizArm({ d, a, revelado }: { d: number; a: number; revelado: boolean }) {
  const q = (v: number) => (revelado ? int(v) : "?");
  const cel = (v: number, nome: string, cons: string, tom: "ok" | "erro", on: boolean) => (
    <div className={`q7-mx-c q7-mx-c--${tom}`} data-on={on ? "1" : "0"}><span className="q7-mx-v">{q(v)}</span><span className="q7-mx-n">{nome}</span><span className="q7-mx-x">{cons}</span></div>
  );
  return (
    <div className="q7-mx" role="table" aria-label={revelado ? `Matriz de confusão de aprovar todas: 0 defaults recusados, 0 adimplentes recusados, ${d} defaults aprovados, ${a} adimplentes aprovados, total ${d + a}` : `Matriz de confusão com os valores ocultos até a previsão; ${d} defaults em ${d + a} propostas`}>
      <div className="q7-mx-h" role="row"><span role="columnheader"><span className="q7-sr">Decisão</span></span><span role="columnheader">Deu default <small>{int(d)}</small></span><span role="columnheader">Pagou <small>{q(a)}</small></span></div>
      <div className="q7-mx-r" role="row"><span className="q7-mx-l" role="rowheader">Recusa <small>prevê default{revelado && <span className="q7-s03-nw"> · 0</span>}</small></span>{cel(0, "VP", "default evitado", "ok", false)}{cel(0, "FP", "bom cliente recusado", "erro", false)}</div>
      <div className="q7-mx-r" role="row"><span className="q7-mx-l" role="rowheader">Aprova <small>prevê pagamento{revelado && <span className="q7-s03-nw"> · {int(d + a)}</span>}</small></span>{cel(d, "FN", "default aprovado", "erro", false)}{cel(a, "VN", "bom cliente aprovado", "ok", revelado)}</div>
    </div>
  );
}
const CORTE = 0.12;
const LOGIT12 = confusao(Y, PL, CORTE);
const DMIN = Math.round(N * 0.01), DMAX = Math.round(N * 0.5), D2 = Math.round(N * 0.02);
const PA = `${int(A)} de ${int(N)}`;
const OPCOES = [
  { texto: `Perto de ${pct(D / N, 0)}`, certa: false, retorno: <>{pct(D / N, 0)} é a <b>prevalência</b>, a fração que a regra erra. Ela aprova todos e acerta os outros: {PA}.</> },
  { texto: "Perto de 50%", certa: false, retorno: <>50% seria um <b>sorteio</b>. A regra aprova todos e acerta todos os {int(A)} adimplentes.</> },
  { texto: `Perto de ${pct(A / N, 0)}`, certa: true, retorno: <>Isso: <b>{PA}</b> pagaram, e a regra acerta exatamente esses.</> },
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
      conclusao={revelado ? <>Aprovar todos acerta <b>{pct(acc, 1)}</b> sem recusar nenhum default. A acurácia não é inútil, mas com evento raro é insuficiente: precisa de referência e não mede a ordem entre clientes.</> : "Escolha uma alternativa antes de ver a matriz."}
      fonte={<>Janela fora do tempo do curso: {int(N)} propostas aprovadas, safras de 2023-08 a 2023-12, {int(REAL)} defaults em 12 meses. Com o controle, o total fica em {int(N)} e muda só o número de defaults (cenário ilustrativo). Recusa quando PD ≥ corte.</>}>
      <Painel titulo={revelado ? `Regra trivial: aprovar todas as ${int(N)} propostas` : `${int(REAL)} defaults em ${int(N)} propostas; cada marca é 1% da carteira`} className="q7-s03-esq">
        <div className="q7-s03-vis">
          <div className="q7-s03-pes">
            <Pessoas n={100} d={Math.round(prev * 100)} rotulo={`${Math.round(prev * 100)} de cada 100 propostas deram default`} />
            <ul className="q7-leg"><li><span className="q7-mk q7-mk--def" aria-hidden="true" />deu default{revelado ? `: ${pct(prev, 1)}` : ""}</li><li><span className="q7-mk q7-mk--adi" aria-hidden="true" />pagou{revelado ? `: ${pct(1 - prev, 1)}` : ""}</li></ul>
          </div>
          <MatrizArm d={d} a={a} revelado={revelado} />
        </div>
        {revelado && (
          <div className="q7-s03-ctl">
            <Controle rotulo={`Defaults na carteira de ${int(N)}`} valor={d} min={DMIN} max={DMAX} passo={1} onChange={setD} mostrar={`${int(d)} (${pct(prev, 1)})`} escala={[pct(DMIN / N, 0), pct(DMAX / N, 0)]} />
            <div className="q7-botoes"><Botao sec onClick={() => setD(REAL)} desab={real}>Voltar à janela real: {int(REAL)}</Botao><Botao sec onClick={() => setD(D2)}>Carteira com {pct(D2 / N, 0)}</Botao></div>
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
              <p className="q7-p">Um modelo que separa risco pode ter acurácia <b>menor</b>: a logística, recusando PD ≥ {pct(CORTE, 0)}, acerta {pct(LOGIT12.acuracia!, 1)} e recusa <b>{LOGIT12.vp} dos {REAL}</b> defaults.</p>
            ) : (
              <p className="q7-p">Com {pct(prev, 1)} de defaults, a regra trivial acerta {pct(acc, 1)}: quanto mais raro o evento, maior a acurácia de não fazer nada.</p>
            )}
          </>
        )}
      </Painel>
    </Quadro>
  );
}

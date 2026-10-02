"use client";
import { useState, type ReactNode } from "react";
import { Botao, escala, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { D, META, N, PREVALENCIA, RES } from "@/lib/capitulo7/dados";
import { int, num, pct } from "@/lib/capitulo7/formato";
import { SLIDE } from "@/lib/capitulo7/roteiro";

/**
 * 02 · c7p21 · O contrato da pergunta: evento, população, horizonte, unidade e janela. A linha do tempo mostra as
 * safras de cada partição e os 12 meses de observação que cada uma precisa para ter desfecho. A comparação de
 * populações usa os resultados do gerador (aprovados contra população inteira da janela, que só existe porque a base é
 * sintética): a mesma logística muda de AUC e de taxa de default quando a pergunta muda. O seletor só abre depois da
 * previsão, e até lá o subtítulo é pergunta; o contrato acompanha a população escolhida. Rodada 7: o contrato declara
 * também a finalidade da PD (provisão de estágio 1 e corte, nível corrente) e a regra do nível, antes da prova.
 */
type Pop = "aprovados" | "todos";
const mes = (a: number, m: number) => a * 12 + (m - 1);
const INI = mes(2022, 1), FIM = mes(2025, 3);
const PARTES = [
  { nome: "Treino", de: mes(2022, 1), ate: mes(2023, 2), n: META.nTreino, cor: "#8A93A3" },
  { nome: "Validação", de: mes(2023, 3), ate: mes(2023, 7), n: META.nVal, cor: "#5B6475" },
  { nome: "Janela fora do tempo", de: mes(2023, 8), ate: mes(2023, 12), n: META.nOot, cor: "#2E6B4F" },
];
const REF = mes(2025, 1) + 30 / 31;
/**
 * O gerador publica só as taxas de default da população inteira e das recusadas, não a contagem de recusadas. A
 * contagem sai das taxas: (D + t_r · R) ÷ (N + R) = t_p, logo R = (t_p · N − D) ÷ (t_r − t_p). É aproximação, porque
 * as taxas vêm arredondadas; na tela aparece como "cerca de".
 */
const REC = Math.round((PREVALENCIA.populacao * N - D) / (PREVALENCIA.rejeitados - PREVALENCIA.populacao));
const REC_D = Math.round(PREVALENCIA.rejeitados * REC);
/** O contrato acompanha o seletor: com os recusados, muda a população e o que se sabe deles. */
const contrato = (pop: Pop): [string, string][] => [
  ["Evento", "atraso de 90 dias ou mais"],
  ["Horizonte", "12 meses, um único período"],
  ["População", pop === "aprovados" ? "só propostas aprovadas" : "aprovadas e recusadas"],
  ["Unidade", "uma proposta por cliente"],
  ["Janela fora do tempo", pop === "aprovados" ? `${int(N)} propostas, ${D} defaults` : `${int(N)} aprovadas + cerca de ${int(REC)} recusadas ≈ ${int(N + REC)}`],
  ["Recusadas", pop === "aprovados" ? "sem desfecho observado" : "desfecho só no gerador"],
];
/**
 * Finalidade e regra do nível, declaradas no contrato, antes da prova (rodada 7): os slides 27 e 36 remetem a elas em
 * vez de escolher a âncora pela tabela de conferência. "Todas as safras maturadas fora do treino" fixa a amostra sem
 * olhar o resultado: na data da base, validação e janela (ANCORA.recentes de dados.ts).
 */
const FINALIDADE: [string, ReactNode][] = [
  ["Finalidade", <>provisão de estágio 1 (Res. CMN 4.966/2021) e corte (<LinkSlide slug="c7p18">slide {SLIDE.c7p18.n}</LinkSlide>): nível corrente</>],
  ["Regra do nível", "após a prova, intercepto em todas as safras maturadas fora do treino"],
];

export function S02Contrato({ pagina }: { pagina?: Pagina }) {
  const [pop, setPop] = useState<Pop>("aprovados");
  const [prev, setPrev] = useState<number | null>(null);
  const r = pop === "aprovados" ? RES.logit_oot : RES.logit_populacao_completa_oot;
  return (
    <Quadro slug="c7p21" pagina={pagina} layout="gl" sub={prev === null ? "Um número de outro banco serve de régua para o nosso?" : undefined}
      conclusao={pop === "aprovados" ? <>Entre propostas <b>aprovadas</b>, quem atrasa 90 dias ou mais em 12 meses? Na janela, {pct(D / N, 1)}, AUC {num(r.auc, 4)}. Finalidade e regra do nível decidem o slide {SLIDE.c7p38.n}. Próximo: a armadilha da acurácia.</>
        : <>Mesma logística, outra pergunta: com os recusados (desfecho que só existe na base sintética), a taxa de default vai a {pct(r.obs, 1)} e a AUC a <b>{num(r.auc, 4)}</b>. Números de perguntas diferentes não se comparam.</>}
      fonte={`Base sintética, semente ${META.seed}; referência ${META.dataReferencia.split("-").reverse().join("/")}. O gerador publica só as taxas (${pct(PREVALENCIA.populacao, 1)} no total, ${pct(PREVALENCIA.rejeitados, 1)} nas recusadas); cerca de ${int(REC)} recusadas e aprovação perto de ${pct(N / (N + REC), 0)} são aproximação.`}>
      <Painel titulo="Cada safra precisa de 12 meses para ter desfecho">
        <Grafico rotulo="Linha do tempo: safras de treino, validação e janela fora do tempo, cada uma seguida de 12 meses de observação; data de referência em 31 de janeiro de 2025" arCelular="16 / 9">
          {(d) => {
            const g = d.fs * 11.5; const x = escala([INI, FIM], [g, d.w - d.fs * 0.5]); const lh = (d.h - d.fs * 2.6) / PARTES.length;
            return (
              <g>
                {[2022, 2023, 2024, 2025].map((a) => <g key={a}><line className="q7-grade" x1={x(mes(a, 1))} x2={x(mes(a, 1))} y1={0} y2={d.h - d.fs * 2.4} /><text className="q7-tick" x={x(mes(a, 1)) + (a === 2025 ? -d.fs * 0.3 : d.fs * 0.3)} y={d.h - d.fs * 1.3} textAnchor={a === 2025 ? "end" : "start"}>{a}</text></g>)}
                {PARTES.map((p, k) => { const cy = k * lh + lh / 2, h = Math.min(lh * 0.55, d.fs * 2.2); const ate = p.ate + 12; return (
                  <g key={p.nome}>
                    <text className="q7-rot" x={0} y={cy - d.fs * 0.15} style={{ fontWeight: 700 }}>{p.nome}</text>
                    <text className="q7-rot q7-rot--peq" x={0} y={cy + d.fs * 1.05} style={{ fill: "#5B6475" }}>{int(p.n)} propostas</text>
                    <rect x={x(p.de)} y={cy - h / 2} width={x(p.ate + 1) - x(p.de)} height={h} fill={p.cor} rx={3} />
                    <rect x={x(p.ate + 1)} y={cy - h / 2} width={x(p.ate + 13) - x(p.ate + 1)} height={h} fill={p.cor} fillOpacity={0.14} stroke={p.cor} strokeDasharray="5 4" rx={3} />
                    <text className="q7-rot q7-rot--peq" x={(x(p.ate + 1) + x(p.ate + 13)) / 2} y={cy} dy=".35em" textAnchor="middle">até {String(ate % 12 + 1).padStart(2, "0")}/{Math.floor(ate / 12)}</text>
                  </g>
                ); })}
                <line x1={x(REF)} x2={x(REF)} y1={0} y2={d.h - d.fs * 2.4} stroke="#A85A0C" strokeWidth={2.5} />
                <text className="q7-corte-t" x={x(REF) - d.fs * 0.4} y={d.h - d.fs * 0.3} textAnchor="end">base fechada em 31/01/2025</text>
                {/* legenda dentro da figura, na coluna dos rótulos */}
                <text className="q7-rot q7-rot--peq" x={0} y={d.h - d.fs * 1.3} style={{ fill: "#5B6475" }}>barra cheia: safras</text>
                <text className="q7-rot q7-rot--peq" x={0} y={d.h - d.fs * 0.3} style={{ fill: "#5B6475" }}>tracejada: 12 meses</text>
              </g>
            );
          }}
        </Grafico>
        <dl className="q7-s02-ct">{contrato(pop).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}{FINALIDADE.map(([k, v]) => <div key={k} className="q7-s02-fin"><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </Painel>
      <Painel>
        <Seg rotulo="População avaliada" opcoes={[{ v: "aprovados" as Pop, r: "Só aprovados" }, { v: "todos" as Pop, r: "Aprovados e recusados" }]} valor={pop} onChange={setPop} cor desab={prev === null} />
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Taxa de default" valor={pct(r.obs, 1)} detalhe={pop === "aprovados" ? `${D} de ${int(N)}` : `recusados: cerca de ${int(REC_D)} de ${int(REC)} (${pct(PREVALENCIA.rejeitados, 1)})`} tom="def" tam="mini" />
          <Kpi rotulo="AUC da logística" valor={num(r.auc, 4)} detalhe={pop === "aprovados" ? "esta pergunta" : "outra pergunta"} tam="mini" />
        </div>
        <Previsao rotulo="Antes de seguir" pergunta="Outro banco reporta AUC de 0,80 para o seu modelo de cartão. O nosso, com 0,73, é pior?" escolha={prev} onEscolha={setPrev} recolher
          opcoes={[
            { texto: "Sim, 0,80 é maior que 0,73", retorno: "Compara números de perguntas diferentes. Evento, horizonte, população e janela podem ser outros; a AUC só se compara na mesma amostra e com o mesmo desfecho." },
            { texto: "Não dá para dizer sem saber evento, horizonte, população e janela", certa: true, retorno: "Isso. Antes de comparar uma métrica, confira o contrato da pergunta. Aqui mesmo, só incluir os recusados muda a AUC da mesma logística." },
            { texto: "Não, porque AUC de cartão é sempre maior", retorno: "Não há regra assim. O valor depende da carteira, do evento e de quem entra na amostra." },
          ]} />
        <div className="q7-botoes"><Botao sec onClick={() => { setPop("aprovados"); setPrev(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

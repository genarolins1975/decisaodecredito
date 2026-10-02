"use client";
import { useState } from "react";
import { Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, escala, type Pagina } from "../base";
import { SLIDE } from "@/lib/capitulo7/roteiro";
import { Roc } from "../graficos";
import { CENARIOS, MINI, N, PL, PT, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaRoc, transformar } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";
import { aucEsperada, aucsEmJanelasNovas, N_JANELAS, SEMENTE_JANELAS } from "@/lib/capitulo7/janelas";

/**
 * 10 · c7p24 · O que a AUC responde e o que deixa em aberto. A ponte liga a PD original de cada proposta da mini-base
 * à PD do cenário: numa transformação estritamente crescente nenhuma linha se cruza e a ROC da janela é a mesma; na
 * fila embaralhada as linhas se cruzam e a AUC cai para perto de 0,5; na orientação invertida tudo se cruza e a AUC
 * vira 1 − AUC. Até a turma escolher a frase certa, o subtítulo é pergunta e a leitura só dá a instrução (uma errada recebe o
 * retorno e pede Tentar outra, sem entregar a resposta); o que a AUC não informa aparece depois do acerto. Na ponte, cada linha vai da posição exata no eixo de cima à posição exata no de
 * baixo, então duas linhas só se cruzam quando o par troca de ordem (conferido por script: zero cruzamentos desenhados
 * na transformação crescente); marcas que se sobrepõem se empilham para fora da faixa entre os eixos, presas ao eixo por
 * uma haste.
 * Na ROC, a logística fica em cinza largo por baixo e o cenário vem em azul de ordenação tracejado por cima; na
 * transformação crescente o cinza aparecendo entre os traços mostra que as duas curvas coincidem.
 */
/** Empilha marcas próximas no mesmo eixo: cada ponto vai ao primeiro nível livre (0, 1, 2...) sem encostar em outro. */
function niveis(xs: number[], dist: number) {
  const ordem = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
  const nivel = new Array<number>(xs.length).fill(0); const ocupados: number[][] = [];
  for (const i of ordem) {
    let k = 0; while ((ocupados[k] ?? []).some((x) => Math.abs(x - xs[i]) < dist)) k++;
    (ocupados[k] ??= []).push(xs[i]); nivel[i] = k;
  }
  return nivel;
}
const LIMITES: [string, string, string][] = [["o nível da PD", "c7p10", "confiabilidade"], ["o corte e a perda", "c7p18", "política e custos"]];
type Cen = "crescente" | "embaralhada" | "invertida" | "verdadeira";
const TRANSF = (p: readonly number[]) => transformar(p, 1, 0.5);
const CEN: Record<Cen, { nome: string; mini: (p: number[]) => number[]; janela: readonly number[]; texto: string }> = {
  crescente: { nome: "Transformação crescente", mini: (p) => TRANSF(p), janela: TRANSF(PL), texto: "σ(1 + 0,5 · logit p): muda o nível, preserva a ordem" },
  embaralhada: { nome: "Fila embaralhada", mini: (p) => { const e = CENARIOS.filaFracaMediaCerta; return MINI.map((m) => e[m.id]); }, janela: CENARIOS.filaFracaMediaCerta, texto: "as mesmas PDs, distribuídas ao acaso (semente 7)" },
  invertida: { nome: "Orientação invertida", mini: (p) => p.map((x) => 1 - x), janela: PL.map((x) => 1 - x), texto: "1 − p: o escore passou a crescer com a segurança" },
  verdadeira: { nome: "PD verdadeira", mini: () => MINI.map((m) => PT[m.id]), janela: PT, texto: "a PD do gerador, que só existe porque a base é sintética" },
};
const AUC0 = aucPorPares(Y, PL).auc!;
const P0 = pct(AUC0, 0), PARES = (MINI.length * (MINI.length - 1)) / 2;
const OPS = [
  { texto: `${P0} dos clientes são classificados corretamente`, certa: false, retorno: <>Não. A AUC não fala de acertos por cliente: ela compara <b>pares</b> (um default, um adimplente). Acurácia depende de um corte, que a AUC não tem.</> },
  { texto: `Num par sorteado, o default recebe PD maior em cerca de ${P0} das vezes`, certa: true, retorno: <>Isso. É a leitura correta e a única que se diz sem ressalva: uma probabilidade sobre pares, que não depende do nível nem do corte.</> },
  { texto: "As PDs do modelo estão no nível certo", certa: false, retorno: <>Não. Veja a transformação crescente: as PDs mudam de nível e a AUC não se move. Nível se verifica na curva de confiabilidade.</> },
  { texto: `O melhor corte para recusar é PD de ${P0}`, certa: false, retorno: <>Não. A AUC é uma área, não um ponto da régua de PD. O corte depende de perda, receita e custo (slide {SLIDE.c7p18.n}).</> },
];

/**
 * Cenário PD verdadeira: a AUC de uma janela é uma realização ruidosa. A AUC média nas réplicas sintéticas da janela
 * (os mesmos proponentes, desfecho sorteado de novo pela PD verdadeira) separa o teto em média da sorte desta janela.
 */
function VerdadeiraLeitura({ auc, cruz }: { auc: number; cruz: number }) {
  const eT = aucEsperada(PT), eL = aucEsperada(PL);
  const aT = aucsEmJanelasNovas(PT), aL = aucsEmJanelasNovas(PL);
  const passa = aT.reduce((k, v, i) => k + (aL[i] > v ? 1 : 0), 0);
  return <>A verdadeira troca <b>{cruz} dos {PARES} pares</b> da logística e {eT > eL ? "ainda ordena melhor" : "ordena pior"}: em {N_JANELAS} réplicas sintéticas da janela (os mesmos {int(N)} proponentes, desfecho sorteado de novo pela PD verdadeira), <b>AUC média {num(eT, 4)}</b> contra {num(eL, 4)}; nesta janela, {num(auc, 4)} contra {num(AUC0, 4)}. Numa réplica isolada a logística pode passar ({passa} de {N_JANELAS}); nenhuma chega a 1.</>;
}

export function S10LimitesAuc({ pagina }: { pagina?: Pagina }) {
  const [cen, setCen] = useState<Cen>("crescente");
  const [esc, setEsc] = useState<number | null>(null);
  // subtítulo, leitura e o que a AUC não diz só aparecem com a frase certa; uma errada não entrega a resposta
  const acertou = esc !== null && !!OPS[esc].certa;
  const c = CEN[cen]; const orig = MINI.map((m) => m.pdPlena); const novo = c.mini(orig);
  const auc = aucPorPares(Y, c.janela).auc!;
  const cruz = (() => { let k = 0; for (let i = 0; i < orig.length; i++) for (let j = i + 1; j < orig.length; j++) if ((orig[i] - orig[j]) * (novo[i] - novo[j]) < 0) k++; return k; })();
  return (
    <Quadro slug="c7p24" pagina={pagina} layout="glx" sub={!acertou ? `Um número como ${num(AUC0, 4)} mede exatamente o quê? Escolha uma frase e teste nos cenários.` : undefined}
      conclusao={esc === null ? "Escolha uma frase ao lado e depois teste nos quatro cenários."
        : !acertou ? <>Essa frase não vale. Troque o cenário, veja o que acontece com a AUC e use Tentar outra.</>
        : cen === "crescente" ? <>A PD mudou de nível e <b>{cruz === 0 ? "nenhuma linha se cruzou" : `${cruz} pares se cruzaram`}</b>: a AUC continua {num(auc, 4)}. A AUC só lê a ordem.</>
        : cen === "invertida" ? <>Tudo se cruza ({cruz} de {PARES} pares): a AUC vira 1 − {num(AUC0, 4)} = {num(auc, 4)}. Aqui é sentido trocado do escore, não um modelo &ldquo;pior que o acaso&rdquo;: 1 − AUC devolve {num(1 - auc, 4)}.</>
        : cen === "embaralhada" ? <>{cruz} cruzamentos entre {PARES} pares de propostas: a AUC cai para {num(auc, 4)}, perto do sorteio, com a mesma média de PD.</>
        : <VerdadeiraLeitura auc={auc} cruz={cruz} />}
      fonte={`Ponte: as 20 propostas da mini-base com a PD da logística em precisão plena. ROC e AUC: janela fora do tempo, 737 propostas e 81 defaults. Transformação estritamente crescente: σ(1 + 0,5 · logit p). Réplicas sintéticas da janela: os mesmos ${int(N)} proponentes com o desfecho sorteado de novo pela PD verdadeira; ${N_JANELAS} sorteios, semente ${SEMENTE_JANELAS}, só possível em base sintética.`}>
      <Painel>
        <Seg rotulo="Cenário" opcoes={(Object.keys(CEN) as Cen[]).map((k) => ({ v: k, r: CEN[k].nome }))} valor={cen} onChange={setCen} />
        <div className="q7-s10-g">
          <Grafico titulo="A mesma proposta, duas PDs" sub={c.texto} rotulo={`Ponte entre a PD original e a do cenário para 20 propostas; ${cruz} cruzamentos`} arCelular="4 / 3">
            {(d) => {
              const dom = Math.ceil(Math.max(0.2, ...novo, ...orig) * 5) / 5; const tk = Array.from({ length: Math.round(dom / 0.2) + 1 }, (_, i) => i * 0.2);
              const x = escala([0, dom], [d.fs * 1.4, d.w - d.fs * 1.2]);
              const r = d.fs * 0.3, passo = r * 2.15;
              const nA = niveis(orig.map((v) => x(v)), r * 2.1), nB = niveis(novo.map((v) => x(v)), r * 2.1);
              // cada linha nasce e morre na posição exata do eixo; as marcas próximas se empilham para fora da faixa entre
              // os eixos (acima do eixo de cima, abaixo do de baixo), e os rótulos dos eixos ficam além das pilhas
              const yA = d.fs * 2.95 + r + Math.max(0, ...nA) * passo, yB = d.h - d.fs * 2.8 - r - Math.max(0, ...nB) * passo;
              const ya = (i: number) => yA - nA[i] * passo, yb = (i: number) => yB + nB[i] * passo;
              const cor = (def: number) => ({ stroke: def ? "#8C2332" : "#9AA1AD", strokeWidth: def ? 2.6 : 1.6, strokeOpacity: def ? 0.95 : 0.7 });
              return (
                <g>
                  <text className="q7-eixo-t" x={x(0)} y={d.fs * 1.05}>PD original (logística)</text>
                  <text className="q7-eixo-t" x={x(0)} y={d.h - d.fs * 0.35}>PD no cenário</text>
                  {tk.map((t) => <g key={t}><text className="q7-tick" x={x(t)} y={d.fs * 2.4} textAnchor="middle">{pct(t, 0)}</text><text className="q7-tick" x={x(t)} y={d.h - d.fs * 1.75} textAnchor="middle">{pct(t, 0)}</text></g>)}
                  {[yA, yB].map((yy, k) => <line key={k} className="q7-eixo" x1={x(0)} x2={x(dom)} y1={yy} y2={yy} />)}
                  <g className="q7-s10-ponte">{MINI.map((m, i) => <line key={m.id} x1={x(orig[i])} y1={yA} x2={x(novo[i])} y2={yB} {...cor(m.y)} />)}</g>
                  {MINI.map((m, i) => <g key={`h${m.id}`}>{nA[i] > 0 && <line x1={x(orig[i])} x2={x(orig[i])} y1={ya(i)} y2={yA} {...cor(m.y)} />}{nB[i] > 0 && <line x1={x(novo[i])} x2={x(novo[i])} y1={yB} y2={yb(i)} {...cor(m.y)} />}</g>)}
                  {MINI.map((m, i) => <g key={`p${m.id}`}><circle cx={x(orig[i])} cy={ya(i)} r={r} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /><circle cx={x(novo[i])} cy={yb(i)} r={r} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /></g>)}
                </g>
              );
            }}
          </Grafico>
          <Roc titulo="ROC na janela" sub={`cenário: AUC ${num(auc, 4)} · cinza: logística`} rotulo={`ROC da logística e do cenário ${c.nome}`} series={[{ pts: curvaRoc(Y, PL), classe: "mudo q7-s10-ref" }, { pts: curvaRoc(Y, c.janela), classe: "ord q7-s10-trac" }]} xTit="Falso positivo" yTit="Verdadeiro positivo" />
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Escolha e justifique" pergunta={<>A logística tem AUC {num(AUC0, 4)} na janela. Qual frase é correta?</>} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {acertou && (
          <div className="q7-s10-nao">
            <p className="q7-k">O que a AUC não diz</p>
            <ul>{LIMITES.map(([o, slug, onde]) => <li key={o}><b>{o}</b>: <LinkSlide slug={slug} className="q7-s10-lk">{onde}, slide {SLIDE[slug].n}</LinkSlide></li>)}</ul>
          </div>
        )}
      </Painel>
    </Quadro>
  );
}

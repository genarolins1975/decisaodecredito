"use client";
import { useState } from "react";
import { Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, escala, type Pagina } from "../base";
import { SLIDE } from "@/lib/capitulo7/roteiro";
import { Roc } from "../graficos";
import { CENARIOS, MINI, PL, PT, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaRoc, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 10 · c7p24 · O que a AUC responde e o que deixa em aberto. A ponte liga a PD original de cada proposta da mini-base
 * à PD do cenário: numa transformação estritamente crescente nenhuma linha se cruza e a ROC da janela é a mesma; na
 * fila embaralhada as linhas se cruzam e a AUC cai para perto de 0,5; na orientação invertida tudo se cruza e a AUC
 * vira 1 − AUC. Até a turma escolher a frase, o subtítulo é pergunta e a leitura só dá a instrução; o que a AUC não
 * informa aparece depois da escolha. Pontos que se sobrepõem na ponte ganham um deslocamento vertical determinístico.
 * Na ROC, a logística fica em cinza largo por baixo; na transformação crescente o cenário vem tracejado por cima, e o
 * cinza aparecendo entre os traços mostra que as duas curvas coincidem.
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

export function S10LimitesAuc({ pagina }: { pagina?: Pagina }) {
  const [cen, setCen] = useState<Cen>("crescente");
  const [esc, setEsc] = useState<number | null>(null);
  const c = CEN[cen]; const orig = MINI.map((m) => m.pdPlena); const novo = c.mini(orig);
  const auc = aucPorPares(Y, c.janela).auc!;
  const cruz = (() => { let k = 0; for (let i = 0; i < orig.length; i++) for (let j = i + 1; j < orig.length; j++) if ((orig[i] - orig[j]) * (novo[i] - novo[j]) < 0) k++; return k; })();
  return (
    <Quadro slug="c7p24" pagina={pagina} layout="glx" sub={esc === null ? `Um número como ${num(AUC0, 4)} mede exatamente o quê? Escolha uma frase e teste nos cenários.` : undefined}
      conclusao={esc === null ? "Escolha uma frase ao lado e depois teste nos quatro cenários." : cen === "crescente" ? <>A PD mudou de nível e <b>nenhuma linha se cruzou</b>: a AUC continua {num(auc, 4)}. A AUC só lê a ordem; e não existe um valor universal de &ldquo;bom modelo&rdquo;.</>
        : cen === "invertida" ? <>Tudo se cruza: a AUC vira 1 − {num(AUC0, 4)} = {num(auc, 4)}. Abaixo de 0,5 quase sempre é sentido trocado do escore, não um modelo &ldquo;pior que o acaso&rdquo;.</>
        : cen === "embaralhada" ? <>{cruz} cruzamentos entre {PARES} pares de propostas: a AUC cai para {num(auc, 4)}, perto do sorteio, com a mesma média de PD.</>
        : <>Até a PD verdadeira do gerador tem AUC {num(auc, 4)}, só {num(auc - AUC0, 3)} acima da logística: propostas com as mesmas características podem terminar diferente. Nesta janela, esse é o teto prático; nenhum modelo chega a 1.</>}
      fonte="Ponte: as 20 propostas da mini-base com a PD da logística em precisão plena. ROC e AUC: janela fora do tempo, 737 propostas e 81 defaults. Transformação estritamente crescente: σ(1 + 0,5 · logit p).">
      <Painel>
        <Seg rotulo="Cenário" opcoes={(Object.keys(CEN) as Cen[]).map((k) => ({ v: k, r: CEN[k].nome }))} valor={cen} onChange={setCen} />
        <div className="q7-s10-g">
          <Grafico titulo="A mesma proposta, duas PDs" sub={c.texto} rotulo={`Ponte entre a PD original e a do cenário para 20 propostas; ${cruz} cruzamentos`} arCelular="4 / 3">
            {(d) => {
              const dom = Math.ceil(Math.max(0.2, ...novo, ...orig) * 5) / 5; const tk = Array.from({ length: Math.round(dom / 0.2) + 1 }, (_, i) => i * 0.2);
              const x = escala([0, dom], [d.fs * 1.4, d.w - d.fs * 1.2]); const yA = d.fs * 3.3, yB = d.h - d.fs * 3.6;
              const r = d.fs * 0.3, passo = r * 1.9;
              const nA = niveis(orig.map((v) => x(v)), r * 2.1), nB = niveis(novo.map((v) => x(v)), r * 2.1);
              const ya = (i: number) => yA + nA[i] * passo, yb = (i: number) => yB - nB[i] * passo; // empilha para dentro, longe dos rótulos
              return (
                <g>
                  <text className="q7-eixo-t" x={x(0)} y={yA - d.fs * 1.75}>PD original (logística)</text>
                  <text className="q7-eixo-t" x={x(0)} y={yB + d.fs * 2.9}>PD no cenário</text>
                  {[yA, yB].map((yy, k) => <g key={k}><line className="q7-eixo" x1={x(0)} x2={x(dom)} y1={yy} y2={yy} />{tk.map((t) => <text key={t} className="q7-tick" x={x(t)} y={yy} dy={k ? "1.45em" : "-.55em"} textAnchor="middle">{pct(t, 0)}</text>)}</g>)}
                  {MINI.map((m, i) => <line key={m.id} x1={x(orig[i])} y1={ya(i)} x2={x(novo[i])} y2={yb(i)} stroke={m.y ? "#8C2332" : "#9AA1AD"} strokeWidth={m.y ? 2.6 : 1.6} strokeOpacity={m.y ? 0.95 : 0.7} />)}
                  {MINI.map((m, i) => <g key={`p${m.id}`}><circle cx={x(orig[i])} cy={ya(i)} r={r} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /><circle cx={x(novo[i])} cy={yb(i)} r={r} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /></g>)}
                </g>
              );
            }}
          </Grafico>
          <Roc titulo="ROC na janela" sub={`cenário: AUC ${num(auc, 4)} · cinza: logística`} rotulo={`ROC da logística e do cenário ${c.nome}`} series={[{ pts: curvaRoc(Y, PL), classe: "mudo q7-s10-ref" }, { pts: curvaRoc(Y, c.janela), classe: cen === "crescente" ? "prob q7-s10-trac" : "ord" }]} xTit="Falso positivo" yTit="Verdadeiro positivo" />
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Escolha e justifique" pergunta={<>A logística tem AUC {num(AUC0, 4)} na janela. Qual frase é correta?</>} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {esc !== null && (
          <div className="q7-s10-nao">
            <p className="q7-k">O que a AUC não diz</p>
            <ul>{LIMITES.map(([o, slug, onde]) => <li key={o}><b>{o}</b>: <LinkSlide slug={slug} className="q7-s10-lk">{onde}, slide {SLIDE[slug].n}</LinkSlide></li>)}</ul>
          </div>
        )}
      </Painel>
    </Quadro>
  );
}

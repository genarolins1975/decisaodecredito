"use client";
import { useState } from "react";
import { Grafico, Painel, Previsao, Quadro, Seg, escala, type Pagina } from "../base";
import { Roc } from "../graficos";
import { CENARIOS, MINI, PL, PT, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaRoc, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 10 · c7p24 · O que a AUC responde e o que deixa em aberto. A ponte liga a PD original de cada proposta da mini-base
 * à PD do cenário: numa transformação estritamente crescente nenhuma linha se cruza e a ROC da janela é a mesma; na
 * fila embaralhada as linhas se cruzam e a AUC cai para perto de 0,5; na orientação invertida tudo se cruza e a AUC
 * vira 1 − AUC. A pergunta fecha com o que a AUC não informa.
 */
type Cen = "crescente" | "embaralhada" | "invertida" | "verdadeira";
const TRANSF = (p: readonly number[]) => transformar(p, 1, 0.5);
const CEN: Record<Cen, { nome: string; mini: (p: number[]) => number[]; janela: readonly number[]; texto: string }> = {
  crescente: { nome: "Transformação crescente", mini: (p) => TRANSF(p), janela: TRANSF(PL), texto: "σ(1 + 0,5 · logit p): muda o nível, preserva a ordem" },
  embaralhada: { nome: "Fila embaralhada", mini: (p) => { const e = CENARIOS.filaFracaMediaCerta; return MINI.map((m) => e[m.id]); }, janela: CENARIOS.filaFracaMediaCerta, texto: "as mesmas PDs, distribuídas ao acaso (semente 7)" },
  invertida: { nome: "Orientação invertida", mini: (p) => p.map((x) => 1 - x), janela: PL.map((x) => 1 - x), texto: "1 − p: o escore passou a crescer com a segurança" },
  verdadeira: { nome: "PD verdadeira", mini: () => MINI.map((m) => PT[m.id]), janela: PT, texto: "a PD do gerador, que só existe porque a base é sintética" },
};
const AUC0 = aucPorPares(Y, PL).auc!;
const OPS = [
  { texto: "73% dos clientes são classificados corretamente", certa: false, retorno: <>Não. A AUC não fala de acertos por cliente: ela compara <b>pares</b> (um default, um adimplente). Acurácia depende de um corte, que a AUC não tem.</> },
  { texto: "Num par sorteado, o default recebe PD maior em cerca de 73% das vezes", certa: true, retorno: <>Isso. É a leitura correta e a única que se diz sem ressalva: uma probabilidade sobre pares, que não depende do nível nem do corte.</> },
  { texto: "As PDs do modelo estão no nível certo", certa: false, retorno: <>Não. Veja a transformação crescente: as PDs mudam de nível e a AUC não se move. Nível se verifica na curva de confiabilidade.</> },
  { texto: "O melhor corte para recusar é PD de 73%", certa: false, retorno: <>Não. A AUC é uma área, não um ponto da régua de PD. O corte depende de perda, receita e custo (slide 32).</> },
];

export function S10LimitesAuc({ pagina }: { pagina?: Pagina }) {
  const [cen, setCen] = useState<Cen>("crescente");
  const [esc, setEsc] = useState<number | null>(null);
  const c = CEN[cen]; const orig = MINI.map((m) => m.pdPlena); const novo = c.mini(orig);
  const auc = aucPorPares(Y, c.janela).auc!;
  const cruz = (() => { let k = 0; for (let i = 0; i < orig.length; i++) for (let j = i + 1; j < orig.length; j++) if ((orig[i] - orig[j]) * (novo[i] - novo[j]) < 0) k++; return k; })();
  return (
    <Quadro slug="c7p24" pagina={pagina} layout="gl"
      conclusao={cen === "crescente" ? <>A PD mudou de nível e <b>nenhuma linha se cruzou</b>: a AUC continua {num(auc, 4)}. A AUC não determina corte, perda nem adequação da probabilidade; e não existe um valor universal de &ldquo;bom modelo&rdquo;.</>
        : cen === "invertida" ? <>Tudo se cruza: a AUC vira 1 − {num(AUC0, 4)} = {num(auc, 4)}. Abaixo de 0,5 quase sempre é sentido trocado do escore, não um modelo &ldquo;pior que o acaso&rdquo;.</>
        : cen === "embaralhada" ? <>{cruz} cruzamentos entre 190 pares de propostas: a AUC cai para {num(auc, 4)}, perto do sorteio, com a mesma média de PD.</>
        : <>Até a PD verdadeira do gerador tem AUC {num(auc, 4)}: propostas com as mesmas características podem terminar diferente. Nenhum modelo chega a 1.</>}
      fonte="Ponte: as 20 propostas da mini-base com a PD da logística em precisão plena. ROC e AUC: janela fora do tempo, 737 propostas e 81 defaults. Transformação estritamente crescente: σ(1 + 0,5 · logit p).">
      <Painel>
        <Seg rotulo="Cenário" opcoes={(Object.keys(CEN) as Cen[]).map((k) => ({ v: k, r: CEN[k].nome }))} valor={cen} onChange={setCen} />
        <div className="q7-s10-g">
          <Grafico titulo="A mesma proposta, duas PDs" sub={c.texto} rotulo={`Ponte entre a PD original e a do cenário para 20 propostas; ${cruz} cruzamentos`} arCelular="4 / 3">
            {(d) => {
              const dom = Math.ceil(Math.max(0.2, ...novo, ...orig) * 5) / 5; const tk = Array.from({ length: Math.round(dom / 0.2) + 1 }, (_, i) => i * 0.2);
              const x = escala([0, dom], [d.fs * 1.4, d.w - d.fs * 1.2]); const yA = d.fs * 3.3, yB = d.h - d.fs * 3.2;
              return (
                <g>
                  <text className="q7-eixo-t" x={x(0)} y={yA - d.fs * 1.75}>PD original (logística)</text>
                  <text className="q7-eixo-t" x={x(0)} y={yB + d.fs * 2.55}>PD no cenário</text>
                  {[yA, yB].map((yy, k) => <g key={k}><line className="q7-eixo" x1={x(0)} x2={x(dom)} y1={yy} y2={yy} />{tk.map((t) => <text key={t} className="q7-tick" x={x(t)} y={yy} dy={k ? "1.1em" : "-.45em"} textAnchor="middle">{pct(t, 0)}</text>)}</g>)}
                  {MINI.map((m, i) => <line key={m.id} x1={x(orig[i])} y1={yA} x2={x(novo[i])} y2={yB} stroke={m.y ? "#8C2332" : "#9AA1AD"} strokeWidth={m.y ? 2.6 : 1.6} strokeOpacity={m.y ? 0.95 : 0.7} />)}
                  {MINI.map((m, i) => <g key={`p${m.id}`}><circle cx={x(orig[i])} cy={yA} r={d.fs * 0.3} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /><circle cx={x(novo[i])} cy={yB} r={d.fs * 0.3} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /></g>)}
                </g>
              );
            }}
          </Grafico>
          <Roc titulo="ROC na janela" sub={`AUC ${num(auc, 4)}`} rotulo={`ROC da logística e do cenário ${c.nome}`} series={[{ pts: curvaRoc(Y, PL), classe: "mudo" }, { pts: curvaRoc(Y, c.janela), classe: cen === "crescente" ? "prob" : "ord" }]} xTit="Falso positivo" yTit="Verdadeiro positivo" />
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Escolha e justifique" pergunta={<>A logística tem AUC {num(AUC0, 4)} na janela. Qual frase é correta?</>} opcoes={OPS} escolha={esc} onEscolha={setEsc} />
      </Painel>
    </Quadro>
  );
}

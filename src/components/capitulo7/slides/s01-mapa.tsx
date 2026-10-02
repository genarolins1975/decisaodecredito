"use client";
import { LinkSlide, Quadro, type Pagina } from "../base";
import { D, EAD, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, ks } from "@/lib/capitulo7/metricas";
import { CURTO, PERGUNTAS, ROTEIRO, minutos, type Pergunta } from "@/lib/capitulo7/roteiro";
import { curva, GRADE_CORTES, otimo } from "@/lib/visuais/economia";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 01 · c7p1 · Mapa do capítulo: as quatro perguntas como infográfico navegável. Ordenação, probabilidade e decisão em
 * fluxo; validação como faixa que atravessa as três. Cada pergunta traz a frase que ela responde, um número da nossa
 * janela e os slides que a tratam, como links no mesmo modo (apresentação ou estudo). Números calculados aqui.
 */
type P = Exclude<Pergunta, "todas" | "apoio">;
const KS_ = ks(Y, PL), G = calibracaoGlobal(Y, PL), DL = delong(Y, PL, PGR);
const ECON = otimo(curva(PL as number[], EAD as number[], GRADE_CORTES)).corte;
const NUMERO: Record<P, string> = {
  ordenacao: `AUC ${num(DL.auc1, 4)} · KS ${num(KS_.ks, 4)}`,
  probabilidade: `PD média ${pct(G.pdMedia!, 1)} contra ${pct(D / N, 1)} observados`,
  decisao: `Corte econômico ${pct(ECON, 1)}; o KS está em ${pct(KS_.limiar, 1)}`,
  validacao: `Vantagem de AUC ${num(DL.dif, 4)}, IC 95% de ${num(DL.ic[0], 4)} a ${num(DL.ic[1], 4)}`,
};
const SIMB: Record<P, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
const TAMBEM: Partial<Record<P, string[]>> = { decisao: ["c7p28"] };
const slides = (p: P) => [...ROTEIRO.filter((s) => TAMBEM[p]?.includes(s.slug)), ...ROTEIRO.filter((s) => s.pergunta === p)];

function Cartao({ p }: { p: P }) {
  const q = PERGUNTAS.find((x) => x.id === p)!;
  return (
    <section className="q7-s01-c" data-p={p} aria-labelledby={`s01-${p}`}>
      <h3 id={`s01-${p}`}><span aria-hidden="true">{SIMB[p]}</span>{q.nome}</h3>
      <p className="q7-s01-f">{q.frase}</p>
      <p className="q7-s01-n">{NUMERO[p]}</p>
      {p === "decisao" && <p className="q7-s01-x">Resultado esperado = receita × (1 − PD) − perda × PD − custos.</p>}
      <ul className="q7-s01-l">{slides(p).map((s) => <li key={s.slug}><LinkSlide slug={s.slug} className="q7-s01-k" rotulo={`Slide ${s.n}: ${s.titulo}`}><b>{s.n}</b>{CURTO[s.slug]}</LinkSlide></li>)}</ul>
    </section>
  );
}

export function S01Mapa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c7p1" pagina={pagina} layout="um"
      fonte={`Números da logística na janela fora do tempo: ${N} propostas, ${D} defaults. Percurso essencial de ${minutos("essencial")} minutos; completo, ${minutos()}.`}>
      <div className="q7-s01">
        <div className="q7-s01-fluxo">
          <Cartao p="ordenacao" />
          <span className="q7-s01-seta" aria-hidden="true">→</span>
          <Cartao p="probabilidade" />
          <span className="q7-s01-seta" aria-hidden="true">→</span>
          <Cartao p="decisao" />
        </div>
        <div className="q7-s01-val"><Cartao p="validacao" /></div>
        <nav className="q7-s01-pe" aria-label="Atalhos do capítulo">
          <LinkSlide slug="c7p21" className="q7-s01-ir q7-s01-ir--prim">Começar: slide 2</LinkSlide>
          <LinkSlide slug="c7p38" className="q7-s01-ir">Caso: slide 36</LinkSlide>
          <LinkSlide slug="c7p20" className="q7-s01-ir">Conclusão: slide 37</LinkSlide>
          <LinkSlide slug="c7p19" className="q7-s01-ir">Apêndice: slide 38</LinkSlide>
        </nav>
      </div>
    </Quadro>
  );
}

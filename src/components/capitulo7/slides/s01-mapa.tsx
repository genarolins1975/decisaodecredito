"use client";
import { LinkSlide, Quadro, type Pagina } from "../base";
import { D, EAD, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, delong, ks } from "@/lib/capitulo7/metricas";
import { CURTO, PERGUNTAS, ROTEIRO, SLIDE, type Pergunta } from "@/lib/capitulo7/roteiro";
import { curva, GRADE_CORTES, otimo } from "@/lib/visuais/economia";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 01 · c7p1 · Mapa do capítulo: as quatro perguntas como infográfico navegável. Ordenação, probabilidade e decisão em
 * fluxo; validação como faixa que atravessa as três. Cada pergunta traz a frase que ela responde, um número da nossa
 * janela e os slides que a tratam, como links no mesmo modo (apresentação ou estudo). Números calculados aqui. O cartão
 * Validação não antecipa quem vence a comparação (slides 33 e 34): mostra só o tamanho da janela que decide.
 */
type P = Exclude<Pergunta, "todas" | "apoio">;
const KS_ = ks(Y, PL), G = calibracaoGlobal(Y, PL), DL = delong(Y, PL, PGR);
const ECON = otimo(curva(PL as number[], EAD as number[], GRADE_CORTES)).corte;
const NUMERO: Record<P, string> = {
  ordenacao: `AUC ${num(DL.auc1, 4)} · KS ${num(KS_.ks, 4)}`,
  probabilidade: `PD média ${pct(G.pdMedia!, 1)} contra ${pct(D / N, 1)} observados`,
  decisao: `Corte econômico ${pct(ECON, 1)}; KS em ${pct(KS_.limiar, 1)}`,
  validacao: `Logística ou boosting? Decidem ${int(N)} propostas e só ${D} defaults`,
};
const SIMB: Record<P, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
const TAMBEM: Partial<Record<P, string[]>> = { decisao: ["c7p28"] };
/** A sigla OOT não aparece no mapa: o slide 35 entra pelo nome da janela. */
const curto = (slug: string) => (slug === "c7p17" ? "Janela fora do tempo" : CURTO[slug]);
const titulo = (t: string) => t.replace(/^OOT:/, "Janela fora do tempo (OOT):");
const slides = (p: P) => [...ROTEIRO.filter((s) => TAMBEM[p]?.includes(s.slug)), ...ROTEIRO.filter((s) => s.pergunta === p)];

/** Régua do cartão Decisão: onde o KS e o resultado esperado põem o corte, na mesma escala de PD. */
function Regua() {
  const x = (v: number) => 4 + (v / 0.25) * 92;
  return (
    <svg className="q7-s01-r" viewBox="0 0 100 26" role="img" aria-label={`Corte pelo KS em ${pct(KS_.limiar, 1)} e corte econômico em ${pct(ECON, 1)}, numa escala de PD de 0% a 25%`}>
      <line x1={x(0)} x2={x(0.25)} y1={15} y2={15} stroke="#9AA1AD" strokeWidth={0.6} />
      {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={14} y2={16} stroke="#9AA1AD" strokeWidth={0.5} /><text x={x(t)} y={22.5} fontSize={4} textAnchor="middle" fill="#5B6475">{pct(t, 0)}</text></g>)}
      <line x1={x(KS_.limiar)} x2={x(KS_.limiar)} y1={6} y2={15} stroke="#3D5A8A" strokeWidth={1.2} /><text x={x(KS_.limiar)} y={5} fontSize={4.2} textAnchor="end" fill="#3D5A8A" fontWeight={700}>KS {pct(KS_.limiar, 1)}</text>
      <line x1={x(ECON)} x2={x(ECON)} y1={6} y2={15} stroke="#A85A0C" strokeWidth={1.2} /><text x={x(ECON)} y={5} fontSize={4.2} fill="#A85A0C" fontWeight={700}>econômico {pct(ECON, 1)}</text>
    </svg>
  );
}

function Cartao({ p }: { p: P }) {
  const q = PERGUNTAS.find((x) => x.id === p)!;
  return (
    <section className="q7-s01-c" data-p={p} aria-labelledby={`s01-${p}`}>
      <h3 id={`s01-${p}`}><span aria-hidden="true">{SIMB[p]}</span>{q.nome}</h3>
      <p className="q7-s01-f">{q.frase}</p>
      <p className="q7-s01-n">{NUMERO[p]}</p>
      {p === "decisao" && <Regua />}
      <ul className="q7-s01-l">{slides(p).map((s) => <li key={s.slug}><LinkSlide slug={s.slug} className={`q7-s01-k${s.nivel === "aprofundamento" ? " q7-s01-k--ap" : ""}`} rotulo={`Slide ${s.n}${s.nivel === "aprofundamento" ? ", aprofundamento" : ""}: ${titulo(s.titulo)}`}><b>{s.n}</b>{s.nivel === "aprofundamento" ? null : curto(s.slug)}</LinkSlide></li>)}</ul>
    </section>
  );
}

export function S01Mapa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c7p1" pagina={pagina} layout="um"
      conclusao={<>A logística ordena (AUC {num(DL.auc1, 4)}), mas prevê {pct(G.pdMedia!, 1)} de default contra {pct(D / N, 1)}, e <b>o KS e a economia apontam cortes diferentes</b>. Primeiro, a pergunta: slide {SLIDE.c7p21.n}.</>}
      fonte={`Base sintética, semente 20260501; janela fora do tempo, safras 2023-08 a 2023-12: ${int(N)} propostas, ${D} defaults. Corte econômico: slide ${SLIDE.c7p18.n}. Tracejado: aprofundamento.`}>
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
          <LinkSlide slug="c7p38" className="q7-s01-ir">Comitê: 36</LinkSlide>
          <LinkSlide slug="c7p20" className="q7-s01-ir">Conclusão: 37</LinkSlide>
          <LinkSlide slug="c7p19" className="q7-s01-ir">Apêndice: 38</LinkSlide>
        </nav>
      </div>
    </Quadro>
  );
}

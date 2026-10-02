"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Botao, LinkSlide, Painel, Previsao, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Tex } from "@/components/visuais/tex";
import { CFG_DIDATICA, DIDATICA, NA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { estagios, sigmoide, valorArvore, type No, type Vetor } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 11 · c6p10 · A fórmula depois da história: o algoritmo de Friedman (2001) para log loss em cinco linhas, cada termo
 * ligado ao slide em que apareceu, e a coluna "no exemplo" preenchida com a árvore m e a proposta escolhidas, nas 16
 * propostas sintéticas (CFG_DIDATICA, gbm.ts). A última linha (F_m), fórmula e exemplo, fica oculta até a previsão
 * certa: com F_{m−1}, η e γ na tela, quanto vale F_m? A regra de soma é a do slide 8, e a turma a reconstrói de memória.
 * As alternativas erradas são as confusões de η (esquecido ou aplicado ao acumulado) e da sigmoide aplicada a cada passo.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const MOD = modelo(CFG_DIDATICA, XD, YD);
const ETA = MOD.eta, M = MOD.arvores.length;
const EST = estagios(MOD, XD);
const NDEF = YD.reduce((s, v) => s + v, 0);
const NOMES = ["util.", "atraso"];
const sinal = (v: number, c = 2) => `${v >= 0 ? "+" : "−"}${num(Math.abs(v), c)}`;
const par = (v: number, c = 2) => (v < 0 ? `(${num(v, c)})` : num(v, c));

function folhaDe(no: No, x: Vetor): No { let a = no; while (!a.folha) a = Math.fround(x[a.variavel]) <= a.corte ? a.esq : a.dir; return a; }
function regra(no: No, x: Vetor): string {
  const lo = NOMES.map(() => -Infinity), hi = NOMES.map(() => Infinity); let a = no;
  while (!a.folha) { if (Math.fround(x[a.variavel]) <= a.corte) { hi[a.variavel] = Math.min(hi[a.variavel], a.corte); a = a.esq; } else { lo[a.variavel] = Math.max(lo[a.variavel], a.corte); a = a.dir; } }
  return NOMES.map((n, v) => (lo[v] > -Infinity && hi[v] < Infinity ? `${num(lo[v], 1)} < ${n} ≤ ${num(hi[v], 1)}` : hi[v] < Infinity ? `${n} ≤ ${num(hi[v], 1)}` : lo[v] > -Infinity ? `${n} > ${num(lo[v], 1)}` : "")).filter(Boolean).join(" e ");
}
/** Os números do passo m para a proposta i, todos da biblioteca: estágio anterior, resíduo, folha, Newton e soma. */
function passo(m: number, i: number) {
  const arv = MOD.arvores[m - 1]; const F = EST[m - 1]; const fo = folhaDe(arv, XD[i]);
  const membros = XD.map((x, j) => j).filter((j) => folhaDe(arv, XD[j]) === fo);
  let sr = 0, sh = 0; for (const j of membros) { const p = sigmoide(F[j]); sr += YD[j] - p; sh += p * (1 - p); }
  const p = sigmoide(F[i]);
  return { Fant: F[i], p, r: YD[i] - p, regra: regra(arv, XD[i]), n: membros.length, sr, sh, gama: valorArvore(arv, XD[i]), Fm: EST[m][i] };
}
const SUBS = "₀₁₂₃₄₅₆₇₈₉";
const sb = (n: number) => String(n).split("").map((c) => SUBS[+c]).join("");
const INI_M = 2, INI_I = DIDATICA.findIndex((p) => p.id === 10);
const P0 = passo(INI_M, INI_I);
const ID0 = DIDATICA[INI_I].id;
const OPS = [
  { texto: `${num(P0.Fant, 2)} ${P0.gama < 0 ? "−" : "+"} ${num(Math.abs(P0.gama), 2)} = ${num(P0.Fant + P0.gama, 2)}`, certa: false, retorno: <>Soma a correção inteira. A taxa do <LinkSlide slug="c6p7">slide {SLIDE.c6p7.n}</LinkSlide> multiplica só a folha: {num(ETA, 1)} × {par(P0.gama)}.</> },
  { texto: `${num(P0.Fant, 2)} + ${num(ETA, 1)} × ${par(P0.gama)} = ${num(P0.Fm, 2)}`, certa: true, retorno: <>Isso: o acumulado fica inteiro e só a correção nova entra pela fração η.</> },
  { texto: `${num(ETA, 1)} × (${num(P0.Fant, 2)} ${P0.gama < 0 ? "−" : "+"} ${num(Math.abs(P0.gama), 2)}) = ${num(ETA * (P0.Fant + P0.gama), 2)}`, certa: false, retorno: <>A taxa não encolhe o que já foi aprendido: F{sb(INI_M - 1)} entra inteiro; η vale só para a árvore nova.</> },
  { texto: `σ(${num(P0.Fant, 2)} ${P0.gama < 0 ? "−" : "+"} ${num(ETA * Math.abs(P0.gama), 2)}) = ${pct(sigmoide(P0.Fm), 1)}`, certa: false, retorno: <>Confunde as escalas. F soma em log odds; a sigmoide só converte F em PD, para o resíduo de cada passo (linha 2) e para a PD final (<LinkSlide slug="c6p9">slide {SLIDE.c6p9.n}</LinkSlide>). PDs nunca se somam.</> },
];

function Linha({ n, f, oque, slide, ex, oculto }: { n: string; f: string; oque: string; slide: string; ex: ReactNode; oculto?: boolean }) {
  return (
    <li className="q6-s10-l" data-oculto={oculto ? "1" : undefined}>
      <span className="q6-s10-n">{n}</span>
      <span className="q6-s10-f"><Tex f={oculto ? String.raw`F_m = \;?` : f} /></span>
      <span className="q6-s10-o">{oque} {!oculto && <LinkSlide slug={slide} className="q6-s10-ln" rotulo={`Ver o slide ${SLIDE[slide].n}`}>slide {SLIDE[slide].n}</LinkSlide>}</span>
      <span className="q6-s10-e" data-oculto={oculto ? "1" : undefined}>{ex}</span>
    </li>
  );
}

export function S10Formula({ pagina }: { pagina?: Pagina }) {
  const [m, setM] = useState(INI_M);
  const [sel, setSel] = useState(INI_I);
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc !== null && OPS[esc].certa;
  const P = useMemo(() => passo(m, sel), [m, sel]);
  const id = DIDATICA[sel].id;
  return (
    <Quadro slug="c6p10" pagina={pagina} layout="gl"
      conclusao={revelado
        ? <>Árvore {m}, proposta {id}: F{sb(m)} = {num(P.Fant, 2)} + {num(ETA, 1)} × {par(P.gama)} = <b>{num(P.Fm, 2)}</b>. Repetida {M} vezes, a linha 5 dá a soma do <LinkSlide slug="c6p9">slide {SLIDE.c6p9.n}</LinkSlide>. Agora o mesmo algoritmo nas {int(NA)} propostas do ajuste, no <LinkSlide slug="c6p11">slide {SLIDE.c6p11.n}</LinkSlide>.</>
        : <>Árvore {m}, proposta {id}: F{sb(m - 1)} = {num(P.Fant, 2)}, η = {num(ETA, 1)} e a folha γ = {num(P.gama, 2)}. Antes de ver a linha 5, calcule F{sb(m)}.</>}
      fonte={`${YD.length} propostas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}), ${NDEF} defaults; η ${num(ETA, 1)}, ${M} árvores, profundidade ${CFG_DIDATICA.profundidade}, mínimo ${CFG_DIDATICA.minFolha} por folha; gbm.ts, conferida contra o scikit-learn. Friedman (2001), Annals of Statistics 29(5).`}>
      <Painel>
        <p className="q7-k">Gradient boosting em log loss · Friedman (2001)</p>
        <ol className="q6-s10">
          <Linha n="1" f={String.raw`F_0 = \ln\dfrac{\bar p}{1-\bar p}`} oque="palpite: log odds da carteira" slide="c6p3" ex={<>{NDEF} de {YD.length}: F₀ = <b>{num(MOD.f0, 2)}</b></>} />
          <li className="q6-s10-laco">
            <p className="q6-s10-para"><Tex f={String.raw`\text{para } m = 1, \dots, M = ${M}`} /><span>proposta {id}, árvore {m}</span></p>
            <ol className="q6-s10">
          <Linha n="2" f={String.raw`r_i = y_i - \sigma\!\big(F_{m-1}(x_i)\big)`} oque="erro como alvo" slide="c6p4" ex={<>{DIDATICA[sel].y} − σ({num(P.Fant, 2)}) = <b>{num(P.r, 2)}</b></>} />
          <Linha n="3" f={String.raw`\text{árvore}(r) \to \text{folhas } R_{jm}`} oque="agrupa erros parecidos" slide="c6p5" ex={<>{P.regra}, <b>{P.n}{"\u00a0"}propostas</b></>} />
          <Linha n="4" f={String.raw`\gamma_{jm} = \dfrac{\sum r_i}{\sum p_i(1-p_i)}`} oque="folha por Newton" slide="c6p6" ex={<>{num(P.sr, 2)} ÷ {num(P.sh, 2)} = <b>{num(P.gama, 2)}</b></>} />
          <Linha n="5" f={String.raw`F_m = F_{m-1} + \eta\,\gamma_{jm}`} oque={revelado ? "só uma fração η" : "como F muda: depois da previsão"} slide="c6p7" oculto={!revelado}
            ex={revelado ? <>{num(P.Fant, 2)} + {num(ETA, 1)} × {par(P.gama)} = <b>{num(P.Fm, 2)}</b></> : <>F{sb(m)} = ?</>} />
            </ol>
          </li>
        </ol>
        <p className="q6-s10-fim">A perda costuma cair a cada m, sem garantia (<LinkSlide slug="c6p8">slide {SLIDE.c6p8.n}</LinkSlide>); no fim, PD = σ(F<sub>M</sub>) (<LinkSlide slug="c6p9">slide {SLIDE.c6p9.n}</LinkSlide>).</p>
      </Painel>
      <Painel>
        <p className="q7-k">Árvore m e proposta{revelado ? "" : " · depois da previsão"}</p>
        <Seg rotulo="Árvore m" opcoes={Array.from({ length: M }, (_, k) => ({ v: k + 1, r: String(k + 1) }))} valor={m} onChange={setM} cor desab={!revelado} />
        <div className="q6-s09-props" role="group" aria-label="Proposta">
          {DIDATICA.map((q, i) => (
            <button key={q.id} type="button" className="q6-s09-prop" data-y={q.y} disabled={!revelado} aria-pressed={i === sel} aria-label={`Proposta ${q.id}: utilização ${q.util}%, atraso ${q.atraso} dias, ${q.y ? "default" : "adimplente"}`} onClick={() => setSel(i)}>
              <i aria-hidden="true" />{q.id}
            </button>
          ))}
        </div>
        <Previsao pergunta={`Árvore ${INI_M}, proposta ${ID0}: quanto vale F${sb(INI_M)}?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setM(INI_M); setSel(INI_I); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

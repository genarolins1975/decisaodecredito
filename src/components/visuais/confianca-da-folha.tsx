"use client";
import { useState } from "react";
import { CARTOES, FOCO_INICIAL, FORMULAS, fmtPct, leitura, LIMITE_INICIAL, LIMITE_MAX, LIMITE_MIN, LIMITE_PASSO, MULTIPLOS, RODAPE, ROTULO_MULTIPLO, ROTULO_VEREDITO, situacao, SUBTITULO, TITULO, TITULO_CTL, TITULO_GRAF, type Multiplo } from "@/lib/visuais/confianca-da-folha";
import { Tex } from "./tex";

/**
 * Quanto cada folha afirma (c5p13), no quadro 16:9 do sistema .rl. Na faixa, a estimativa d ÷ n e a regra de
 * decisão em KaTeX; à esquerda, as quatro folhas da árvore com a PD e o intervalo de Wilson a 95%, a linha do limite
 * L da política e o veredito de cada folha (aprova, recusa, não decide); à direita, o painel, com o limite, o número
 * de propostas em cada folha (como na árvore, 10 ou 100 vezes, com a mesma frequência) e a folha em foco. Contas em
 * src/lib/visuais/confianca-da-folha.ts. Substitui a versão com tabela e barras que repetiam os mesmos números; a
 * questão c5p13q continua no estudo, depois do quadro.
 */
type Geo = { W: number; ML: number; MR: number; MT: number; RH: number; MB: number; aoLado: boolean };
/** Duas geometrias: a larga, do palco e do estudo, com o veredito numa pílula à direita; a compacta, do celular, com o
 *  veredito embaixo do nome da folha e letra maior em unidades do desenho. A consulta de contêiner escolhe qual aparece. */
const LARGA: Geo = { W: 900, ML: 150, MR: 190, MT: 58, RH: 88, MB: 56, aoLado: true };
const COMPACTA: Geo = { W: 560, ML: 186, MR: 26, MT: 60, RH: 112, MB: 60, aoLado: false };
type Linha = ReturnType<typeof situacao>[number];

function Grafico({ g, s, limite, foco, onFoco }: { g: Geo; s: Linha[]; limite: number; foco: number; onFoco: (i: number) => void }) {
  const H = g.MT + 4 * g.RH + g.MB, X0 = g.ML, X1 = g.W - g.MR;
  const sx = (p: number) => X0 + p * (X1 - X0);
  const xl = sx(limite), ancoraL = limite < 0.12 ? "start" : limite > 0.88 ? "end" : "middle";
  return (
    <svg viewBox={`0 0 ${g.W} ${H}`} className={`fq-svg ${g.aoLado ? "fq-svg--larga" : "fq-svg--compacta"}`} role="img"
      aria-label={`Limite de ${fmtPct(limite)}. ${s.map((x) => `${x.nome}, ${x.d} de ${x.n}: PD ${fmtPct(x.d / x.n, 1)}, intervalo de ${fmtPct(x.ic.lo, 1)} a ${fmtPct(x.ic.hi, 1)}, ${ROTULO_VEREDITO[x.v]}`).join("; ")}.`}>
      <rect x={X0} y={g.MT - 10} width={X1 - X0} height={4 * g.RH + 20} className="fq-fundo" />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line x1={sx(t)} x2={sx(t)} y1={g.MT - 10} y2={g.MT + 4 * g.RH + 10} className="fq-grade" />{(g.aoLado || t === 0 || t === 0.5 || t === 1) && <text x={sx(t)} y={H - g.MB + 38} textAnchor={t === 0 && !g.aoLado ? "start" : t === 1 && !g.aoLado ? "end" : "middle"} className="fq-tick">{fmtPct(t)}</text>}</g>)}
      {s.map((x, i) => {
        const y = g.MT + i * g.RH + g.RH / 2, on = i === foco;
        return (
          <g key={x.nome} className={`fq-linha ${on ? "fq-linha--on" : ""}`} role="button" tabIndex={0} aria-pressed={on}
            aria-label={`${x.nome}: ${x.d} de ${x.n}, intervalo de ${fmtPct(x.ic.lo, 1)} a ${fmtPct(x.ic.hi, 1)}, ${ROTULO_VEREDITO[x.v]}`}
            onClick={() => onFoco(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFoco(i); } }}>
            <rect x={6} y={y - g.RH / 2 + 4} width={g.W - 12} height={g.RH - 8} rx={10} className="fq-linha-fundo" />
            <text x={g.aoLado ? g.ML - 20 : 16} y={g.aoLado ? y - 6 : y - 18} textAnchor={g.aoLado ? "end" : "start"} className="fq-nome">{x.nome}</text>
            <text x={g.aoLado ? g.ML - 20 : 16} y={g.aoLado ? y + 22 : y + 10} textAnchor={g.aoLado ? "end" : "start"} className="fq-conta">{x.d.toLocaleString("pt-BR")} de {x.n.toLocaleString("pt-BR")}</text>
            {!g.aoLado && <text x={16} y={y + 38} textAnchor="start" className={`fq-ver-t fq-ver-t--${x.v}`}>{ROTULO_VEREDITO[x.v]}</text>}
            <rect x={sx(x.ic.lo)} y={y - 13} width={Math.max(3, sx(x.ic.hi) - sx(x.ic.lo))} height={26} rx={5} className={`fq-ic fq-ic--${x.v}`} />
            <circle cx={sx(x.d / x.n)} cy={y} r={10} className="fq-pd" />
            {g.aoLado && <>
              <rect x={X1 + 26} y={y - 21} width={g.MR - 40} height={42} rx={21} className={`fq-ver fq-ver--${x.v}`} />
              <text x={X1 + 26 + (g.MR - 40) / 2} y={y + 8} textAnchor="middle" className={`fq-ver-t fq-ver-t--${x.v}`}>{ROTULO_VEREDITO[x.v]}</text>
            </>}
          </g>
        );
      })}
      <line x1={xl} x2={xl} y1={g.MT - 22} y2={g.MT + 4 * g.RH + 10} className="fq-limite" />
      <text x={xl} y={g.MT - 30} textAnchor={ancoraL} className="fq-limite-t">L = {fmtPct(limite)}</text>
    </svg>
  );
}

export function ConfiancaDaFolha({ pagina }: { pagina?: { index: number; total: number } }) {
  const [limite, setLimite] = useState(LIMITE_INICIAL);
  const [m, setM] = useState<Multiplo>(1);
  const [foco, setFoco] = useState(FOCO_INICIAL);
  const s = situacao(limite, m);
  const f = s[foco];
  const decidem = s.filter((x) => x.v !== "nao-decide").length;
  const restaurar = () => { setLimite(LIMITE_INICIAL); setM(1); setFoco(FOCO_INICIAL); };
  return (
    <figure className="vz rl fq" data-vz="confianca-da-folha">
      <section className="rl-slide" data-tela="13">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 5 · Árvores de decisão</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Quanto a folha afirma"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="fq-eq">
          {FORMULAS.map((q) => <div key={q.k}><p className="fq-eq-k">{q.k}</p><div className="fq-eq-fs">{q.tex.map((t) => <Tex key={t} f={t} className="fq-eq-f" />)}</div></div>)}
        </div>

        <div className="rl-corpo fq-corpo">
          <div className="fq-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="fq-svg-wrap">
              <Grafico g={LARGA} s={s} limite={limite} foco={foco} onFoco={setFoco} />
              <Grafico g={COMPACTA} s={s} limite={limite} foco={foco} onFoco={setFoco} />
            </div>
          </div>

          <aside className="fq-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="fq-ctl">
              <label htmlFor="fq-l"><b>Aprovar se a PD ficar abaixo de</b> {fmtPct(limite)}</label>
              <input id="fq-l" type="range" min={LIMITE_MIN * 100} max={LIMITE_MAX * 100} step={LIMITE_PASSO * 100} value={Math.round(limite * 100)}
                onChange={(e) => setLimite(Number(e.target.value) / 100)} aria-valuetext={`${fmtPct(limite)}; decidem ${decidem} de 4 folhas`} />
            </div>
            <div className="fq-ctl">
              <p className="fq-ctl-rot"><b>Propostas em cada folha,</b> mesma frequência</p>
              <div className="fq-mult" role="group" aria-label="Propostas em cada folha">
                {MULTIPLOS.map((k) => <button key={k} type="button" className={`rl-btn rl-btn--mini ${k === m ? "rl-btn--on" : ""}`} aria-pressed={k === m} onClick={() => setM(k)}>{ROTULO_MULTIPLO[k]}</button>)}
              </div>
            </div>
            <dl className="fq-res" aria-live="polite">
              <div><dt>Folhas que decidem</dt><dd>{decidem} de 4</dd></div>
              <div><dt>Em foco, {f.nome}</dt><dd>{f.d.toLocaleString("pt-BR")} de {f.n.toLocaleString("pt-BR")}</dd></div>
              <div><dt>PD e intervalo</dt><dd>{fmtPct(f.d / f.n, 1)} · {fmtPct(f.ic.lo, 1)} a {fmtPct(f.ic.hi, 1)}</dd></div>
            </dl>
            <p className="fq-lei">{leitura(limite, m)}</p>
            <div className="fq-acoes"><button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button></div>
          </aside>
        </div>

        <div className="fq-base">
          {CARTOES.map((k) => <div key={k.k}><p className="fq-base-k">{k.k}</p><p className="fq-base-t">{k.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

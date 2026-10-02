"use client";
import { useState } from "react";
import { Botao, Controle, Expandir, Formula, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { sigmoide, valorArvore, type No } from "@/lib/capitulo6/gbm";
import { num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 06 · c6p6 · O valor da folha. Para cada folha da primeira árvore (slide 5), a perda da folha em função do valor γ somado
 * às log odds das suas propostas, L(γ) = Σ ℓ(yᵢ, F₀ + γ); a parábola de segunda ordem em γ = 0,
 * L(0) − γ Σr + ½ γ² Σp(1 − p), tem mínimo no passo de Newton Σr ÷ Σp(1 − p), que é o valor da folha na biblioteca
 * (conferido aqui contra valorArvore) e no GradientBoostingClassifier do scikit-learn. A média do resíduo, Σr ÷ n, está
 * na escala de probabilidade; somada às log odds, anda pouco. A turma prevê o valor da folha B (seis adimplentes, erro
 * −0,5 cada) antes de ver a parábola e os dois marcadores; as alternativas erradas são a média e o mínimo exato da
 * perda, que numa folha pura foge para menos infinito. O controle move γ e mostra a PD e a perda da folha.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const MOD = modelo(CFG_DIDATICA, XD, YD);
const F0 = MOD.f0, P0 = sigmoide(F0);
type Folha = { nome: string; membros: number[]; soma: number; h: number; media: number; newton: number; lib: number };
function folhasDe(no: No, membros: number[], out: Folha[]) {
  if (no.folha) {
    const soma = membros.reduce((s, i) => s + (YD[i] - P0), 0), h = membros.reduce((s) => s + P0 * (1 - P0), 0);
    out.push({ nome: String.fromCharCode(65 + out.length), membros, soma, h, media: soma / membros.length, newton: soma / h, lib: no.valor });
    return out;
  }
  folhasDe(no.esq, membros.filter((i) => Math.fround(XD[i][no.variavel]) <= no.corte), out);
  folhasDe(no.dir, membros.filter((i) => Math.fround(XD[i][no.variavel]) > no.corte), out);
  return out;
}
const FOLHAS = folhasDe(MOD.arvores[0], DIDATICA.map((_, i) => i), []);
// o passo de Newton calculado aqui é o valor da folha na biblioteca (que reproduz o scikit-learn)
for (const f of FOLHAS) for (const i of f.membros) if (Math.abs(valorArvore(MOD.arvores[0], XD[i]) - f.newton) > 1e-9) throw new Error("passo de Newton diverge da biblioteca");
const ell = (y: number, F: number) => (y === 1 ? Math.log1p(Math.exp(-F)) : Math.log1p(Math.exp(F)));
const perdaFolha = (f: Folha, g: number) => f.membros.reduce((s, i) => s + ell(YD[i], F0 + g), 0);
const parabola = (f: Folha, g: number) => perdaFolha(f, 0) - g * f.soma + 0.5 * g * g * f.h;
const B = FOLHAS.reduce((a, f) => (f.media < a.media ? f : a)); // a folha dos adimplentes
const iB = FOLHAS.indexOf(B);
const sinal = (v: number) => `${v > 1e-12 ? "+" : ""}${num(Math.abs(v) < 1e-12 ? 0 : v, 2)}`;
const lista = (m: number[]) => (m.length > 3 ? `#${DIDATICA[m[0]].id} a #${DIDATICA[m[m.length - 1]].id}` : m.map((i) => `#${DIDATICA[i].id}`).join(" e "));

const OPCOES: Opcao[] = [
  { texto: `${sinal(B.media)}: a média do erro da folha`, retorno: <>Confunde as escalas. {sinal(B.media)} é erro em <b>probabilidade</b>; somado às log odds, leva a PD das {B.membros.length} só de {pct(P0, 0)} a {pct(sigmoide(F0 + B.media), 1)}.</> },
  { texto: `${sinal(B.newton)} = ${num(B.soma, 1)} ÷ (${B.membros.length} × ${num(P0 * (1 - P0), 2)})`, certa: true, retorno: <>Isso: Σ r ÷ Σ p(1 − p), o passo de Newton. A PD das {B.membros.length} vai a <b>{pct(sigmoide(F0 + B.newton), 1)}</b>.</> },
  { texto: "Menos infinito: a folha só tem adimplentes", retorno: <>Esse é o mínimo <b>exato</b> da perda numa folha pura, que foge para menos infinito. O passo de Newton para no mínimo da parábola: um passo finito.</> },
];

export function S06PassoNewton({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [j, setJ] = useState(iB);
  const [g, setG] = useState(B.newton);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const f = FOLHAS[j];
  const pg = sigmoide(F0 + g);
  const restaurar = () => { setEsc(null); setJ(iB); setG(B.newton); };
  return (
    <Quadro slug="c6p6" pagina={pagina} layout="gl"
      titulo={rev ? undefined : "Quanto a folha soma às log odds?"}
      sub={rev ? undefined : "Folha B da primeira árvore: seis adimplentes, cada uma com erro −0,5 no palpite de 50%."}
      conclusao={!rev ? <>A árvore do <LinkSlide slug="c6p5">slide 5</LinkSlide> agrupou os erros; falta o número que cada folha soma às log odds F. A perda da folha B cai sempre que esse número desce. Qual valor somar?</>
        : <>Folha {f.nome} ({lista(f.membros)}): média {sinal(f.media)}, Newton <b>{sinal(f.newton)}</b>. Com γ = {sinal(g)}, a PD vai de {pct(P0, 0)} a <b>{pct(pg, 1)}</b> e a perda da folha de {num(perdaFolha(f, 0), 2)} a {num(perdaFolha(f, g), 2)}. Quanto somar desse passo: <LinkSlide slug="c6p7">slide 7</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}); árvore 1 do slide 5, palpite F₀ = ${num(F0, 2)}. Valor da folha: passo de Newton de Friedman (2001), aproximação finita do mínimo exato da perda na folha, o do GradientBoostingClassifier do scikit-learn, que a biblioteca reproduz (tests/capitulo6-gbm.test.ts). Perda da folha: soma da log loss das suas propostas.`}>
      <Painel>
        <Grafico titulo={`Perda da folha ${f.nome} conforme o valor somado`} sub={`${f.membros.length} propostas: ${lista(f.membros)}`} rotulo={rev ? `Folha ${f.nome}: média ${sinal(f.media)}, passo de Newton ${sinal(f.newton)}; perda ${num(perdaFolha(f, g), 2)} em γ ${sinal(g)}` : `Perda da folha ${f.nome} em função do valor somado às log odds; parábola e marcadores ocultos até a previsão`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.2, r: 1.2, t: 1.4, b: 2.9 });
            const dom: [number, number] = f.soma < -1e-9 ? [-4, 1] : f.soma > 1e-9 ? [-1, 4] : [-2.5, 2.5];
            const ymax = Math.ceil(perdaFolha(f, 0) * 1.6);
            const x = escala(dom, [m.l, d.w - m.r]), y = escala([0, ymax], [d.h - m.b, m.t]);
            const gs = Array.from({ length: 101 }, (_, i) => dom[0] + (i / 100) * (dom[1] - dom[0]));
            const dentro = (pts: { v: number; l: number }[]) => pts.filter((q) => q.l <= ymax && q.l >= 0).map((q) => ({ x: x(q.v), y: y(q.l) }));
            const exata = dentro(gs.map((v) => ({ v, l: perdaFolha(f, v) }))), par = dentro(gs.map((v) => ({ v, l: parabola(f, v) })));
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const ticks = Array.from({ length: ymax + 1 }, (_, i) => i).filter((t) => t % (ymax > 8 ? 2 : 1) === 0);
            const xt = Array.from({ length: Math.round(dom[1] - dom[0]) + 1 }, (_, i) => dom[0] + i);
            const iguais = Math.abs(f.media - f.newton) < 1e-9;
            const lx = f.soma > 1e-9 ? d.w - m.r - d.fs * 15 : m.l + d.fs * 1.2, ly = m.t + d.fs * 0.8; // legenda no canto vazio
            const mk = (cx: number, cy: number, tipo: "nw" | "md" | "pt", r = d.fs * 0.34) => tipo === "nw" ? <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} transform={`rotate(45 ${cx} ${cy})`} fill="#3D5A8A" />
              : tipo === "md" ? <path d={`M${cx - r} ${cy - r}l${2 * r} ${2 * r}m0 ${-2 * r}l${-2 * r} ${2 * r}`} stroke="#5B6475" strokeWidth={3} /> : <circle cx={cx} cy={cy} r={r * 1.1} fill="#176C73" stroke="#fff" strokeWidth={2.5} />;
            return (
              <g>
                {ticks.map((t) => <g key={t}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(t)} y2={y(t)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(t)} dy=".34em" textAnchor="end">{t}</text></g>)}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                {xt.map((v) => <text key={v} className="q7-tick" x={x(v)} y={y(0)} dy="1.25em" textAnchor="middle">{sinal(v).replace(",00", "")}</text>)}
                <text className="q7-eixo-t" x={(m.l + d.w - m.r) / 2} y={y(0)} dy="2.6em" textAnchor="middle">γ, o valor somado às log odds da folha</text>
                <text className="q7-eixo-t" x={m.l} y={m.t} dy="-.45em">Perda da folha</text>
                <path className="q7-linha q7-linha--mudo" d={caminho(exata)} />
                {rev && <>
                  <path className="q7-linha q7-linha--ord q7-linha--fina" strokeDasharray="10 6" d={caminho(par)} />
                  <line x1={x(f.newton)} x2={x(f.newton)} y1={y(0)} y2={y(Math.min(perdaFolha(f, f.newton), parabola(f, f.newton)))} stroke="#3D5A8A" strokeWidth={2} strokeDasharray="4 4" />
                  {!iguais && <line x1={x(f.media)} x2={x(f.media)} y1={y(0)} y2={y(perdaFolha(f, f.media))} stroke="#9AA1AD" strokeWidth={2} strokeDasharray="4 4" />}
                  {mk(x(f.newton), y(parabola(f, f.newton)), "nw")}
                  {mk(x(f.media), y(perdaFolha(f, f.media)), "md")}
                  {mk(x(g), y(Math.min(ymax, perdaFolha(f, g))), "pt")}
                  <g>
                    {mk(lx + d.fs * 0.4, ly, "nw")}<text className="q7-rot--peq" x={lx + d.fs * 1.2} y={ly} dy=".35em" style={{ fill: "#3D5A8A", fontWeight: 700 }}>Newton {sinal(f.newton)}: mínimo da parábola</text>
                    {!iguais && <>{mk(lx + d.fs * 0.4, ly + d.fs * 1.4, "md")}<text className="q7-rot--peq" x={lx + d.fs * 1.2} y={ly + d.fs * 1.4} dy=".35em" style={{ fill: "#5B6475", fontWeight: 700 }}>média {sinal(f.media)}</text></>}
                    {mk(lx + d.fs * 0.4, ly + d.fs * (iguais ? 1.4 : 2.8), "pt")}<text className="q7-rot--peq" x={lx + d.fs * 1.2} y={ly + d.fs * (iguais ? 1.4 : 2.8)} dy=".35em" style={{ fill: "#176C73", fontWeight: 700 }}>γ = {sinal(g)}: perda {num(perdaFolha(f, g), 2)}</text>
                  </g>
                </>}
                {(() => { const gx = f.soma < -1e-9 ? dom[0] + 0.3 : f.soma > 1e-9 ? dom[1] - 0.3 : 0; return <text className="q7-rot--peq" x={x(gx)} y={y(Math.min(ymax, perdaFolha(f, gx)))} dy={Math.abs(f.soma) > 1e-9 ? "-.7em" : "1.5em"} textAnchor="middle" style={{ fill: "#5B6475", ...halo }}>perda exata</text>; })()}
              </g>
            );
          }}
        </Grafico>
        {rev && <Controle rotulo="Valor somado γ" valor={g} min={-4} max={4} passo={0.05} onChange={setG} mostrar={`${sinal(g)} · PD ${pct(pg, 1)}`} />}
      </Painel>
      <Painel>
        <Previsao pergunta={`Folha B: ${B.membros.length} adimplentes, erro ${sinal(B.media)} cada, p = ${pct(P0, 0)}. Que valor ela soma às log odds?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setJ(iB); setG(B.newton); }} recolher />
        {rev && <>
          <div className="q7-botoes q6-s06-l"><Seg rotulo="Folha" opcoes={FOLHAS.map((q, k) => ({ v: k, r: q.nome }))} valor={j} onChange={(k) => { setJ(k); setG(FOLHAS[k].newton); }} /><Botao sec onClick={restaurar}>Restaurar</Botao></div>
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Folha</th><th>Σ r</th><th>Σ p(1 − p)</th><th>Média</th><th>Newton</th></tr></thead>
            <tbody>{FOLHAS.map((q, k) => <tr key={q.nome} data-on={k === j ? "1" : undefined}><th>{q.nome} · {q.membros.length}</th><td>{sinal(q.soma)}</td><td>{num(q.h, 2)}</td><td>{sinal(q.media)}</td><td>{sinal(q.newton)}</td></tr>)}</tbody>
          </table>
        </>}
        {rev && (
          <Expandir resumo="Por que dividir por p(1 − p)">
            <Formula compacta f={String.raw`\begin{aligned}L(\gamma)&\approx L(0)-\gamma\textstyle\sum r_i+\tfrac12\gamma^2\sum p_i(1-p_i)\\ \gamma^{*}&=\frac{\sum r_i}{\sum p_i(1-p_i)}\end{aligned}`} />
            <p className="q7-nota">p(1 − p) é quanto a PD anda por unidade de log odds: dividir por ela leva o erro para a escala de F. O XGBoost soma λ ao denominador (Chen e Guestrin, 2016).</p>
          </Expandir>
        )}
        {!rev && <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>}
      </Painel>
    </Quadro>
  );
}

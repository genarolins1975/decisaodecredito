"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Grafico, Legenda, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { CAL, CAL_PGR, D, N, PGR, Y } from "@/lib/capitulo7/dados";
import { ajustarIsotonica, ajustarPlatt, aplicarIsotonica, aucPorPares, brier, eventosPorBloco, logit, logLoss, media, sigmoide, transformar, valoresDistintos } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 30 · c7p36 · Isotônica contra Platt, ajustadas no boosting sem recalibrar, com a amostra de calibração inteira
 * (3.000 casos) ou só com os 300 primeiros. A isotônica é monotônica mas não estritamente: junta propostas em
 * degraus, cria empates e a AUC na janela cai. Com poucos dados, as duas aprendem também o ruído do nível da amostra.
 * Isotônica pelo PAV com interpolação linear entre os pontos de quebra, como o IsotonicRegression do scikit-learn.
 * A barra de pares da isotônica (empates e AUC) fica escondida até a previsão certa, para não mostrar a resposta.
 * Rodada 2: a amostra pequena deixa de ser só os 300 primeiros casos (o bloco mais extremo, 49 defaults contra 27 a 42
 * nos outros nove, por eventosPorBloco): o aluno escolhe qualquer um dos dez blocos de 300 e vê o nível calibrado seguir
 * a sorte do bloco. Sem calibrar e Platt dividem uma barra só, porque com b > 0 os pares são os mesmos.
 */
type Tam = "grande" | "pequena";
function ajustes(ini: number, n: number) {
  const y = CAL.y.slice(ini, ini + n), x = CAL_PGR.slice(ini, ini + n);
  const iso = ajustarIsotonica(x, y), pc = ajustarPlatt(y, x);
  const pi = aplicarIsotonica(iso, PGR), pp = transformar(PGR, pc.a, pc.b);
  const met = (p: readonly number[]) => ({ distintos: valoresDistintos(p), pares: aucPorPares(Y, p), media: media(p)!, brier: brier(Y, p), ll: logLoss(Y, p).valor });
  return { ini, n, x, defaults: y.reduce((s, v) => s + v, 0), iso, pc, platt: met(pp), isot: met(pi) };
}
const NB = CAL.nPequena;
const GRANDE = ajustes(0, CAL.n);
/** Os dez blocos consecutivos de 300 da amostra de calibração; o primeiro é o mais extremo. */
const BLOCOS = Array.from({ length: Math.floor(CAL.n / NB) }, (_, k) => ajustes(k * NB, NB));
const EVENTOS = eventosPorBloco(CAL.y, NB);
const FAIXA_PLATT = [Math.min(...BLOCOS.map((b) => b.platt.media)), Math.max(...BLOCOS.map((b) => b.platt.media))];
const BRUTO = { distintos: valoresDistintos(PGR), pares: aucPorPares(Y, PGR) };
/** Com b > 0, o Platt mantém todos os pares: a barra de pares é a mesma de sem calibrar. */
const MESMOS = (a: ReturnType<typeof ajustes>) => a.pc.b > 0 && a.platt.pares.corretos === BRUTO.pares.corretos && a.platt.pares.empates === BRUTO.pares.empates;

/** Índice da alternativa certa da previsão: a comparação só abre depois dela; errar mostra o retorno e pede nova tentativa. */
const CERTA = 1;

export function S30Isotonica({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState<Tam>("grande");
  const [bloco, setBloco] = useState(1);
  const [prev, setPrev] = useState<number | null>(null);
  const a = t === "grande" ? GRANDE : BLOCOS[bloco - 1];
  const revelado = prev === CERTA;
  const barras = [
    ...(MESMOS(a) ? [{ nome: "Sem calibrar e Platt", c: BRUTO.pares, dist: BRUTO.distintos }] : [{ nome: "Sem calibrar", c: BRUTO.pares, dist: BRUTO.distintos }, { nome: "Platt", c: a.platt.pares, dist: a.platt.distintos }]),
    { nome: "Isotônica", c: a.isot.pares, dist: a.isot.distintos },
  ];
  const ISO = barras.length - 1;
  const restaurar = () => { setT("grande"); setBloco(1); setPrev(null); };
  return (
    <Quadro slug="c7p36" pagina={pagina} layout="gl"
      conclusao={prev !== CERTA ? <>Primeiro a previsão: a isotônica também é crescente.</>
        : t === "grande" ? <>Com {int(a.n)} casos, a isotônica reduz as {int(BRUTO.distintos)} PDs distintas da janela a <b>{a.isot.distintos}</b> degraus: {int(a.isot.pares.empates)} pares viram empates e a AUC cai de {num(BRUTO.pares.auc!, 4)} para <b>{num(a.isot.pares.auc!, 4)}</b>. Platt mantém a AUC e, aqui, tem Brier e log loss menores.</>
          : <>Bloco {bloco} de {NB} casos ({a.defaults} defaults, {pct(a.defaults / a.n, 1)}): PD média {pct(a.platt.media, 1)} (Platt) e {pct(a.isot.media, 1)} (isotônica) contra {pct(D / N, 1)} observados; a isotônica fica com {a.isot.distintos} degraus e AUC {num(a.isot.pares.auc!, 4)}. Nos dez blocos, a PD média do Platt vai de {pct(FAIXA_PLATT[0], 1)} a {pct(FAIXA_PLATT[1], 1)}: <b>com {NB} casos, o nível calibrado segue a sorte do bloco.</b></>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults, ${int(BRUTO.pares.pares)} pares default × adimplente. Calibração sintética: sorteios dos proponentes da janela, desfecho da PD verdadeira (semente ${CAL.semente}); blocos de ${NB} consecutivos da mesma amostra, com ${EVENTOS.join(", ")} defaults (o primeiro é o mais extremo). Empate conta meio par na AUC.`}>
      <Painel>
        <div className="q7-s26-g">
          <Grafico titulo="As duas transformações" sub={`em ${int(a.n)} casos`} rotulo={`Isotônica em degraus e curva de Platt ajustadas em ${a.n} casos`} arCelular="1 / 1">
            {(d) => {
              const mg = margens(d.fs, { l: 3, b: 2.8, t: 1, r: 0.8 }); const lado = Math.min(d.w - mg.l - mg.r, d.h - mg.t - mg.b);
              const x = escala([0, 0.5], [mg.l, mg.l + lado]), y = escala([0, 0.5], [mg.t + lado, mg.t]);
              const cl = (v: number) => Math.min(0.5, v);
              const qs = Array.from({ length: 100 }, (_, i) => 0.003 + (i / 99) * 0.497);
              const isoPts = [{ x: 0, y: a.iso.y[0] }, ...a.iso.x.map((xx, i) => ({ x: xx, y: a.iso.y[i] })), { x: 0.5, y: a.iso.y[a.iso.y.length - 1] }].filter((p) => p.x <= 0.5);
              return (
                <g>
                  <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} yt={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD sem calibrar" yTit="PD calibrada" />
                  <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(0.5)} y2={y(0.5)} />
                  <path className="q7-linha q7-linha--prob" d={caminho(qs.map((q) => ({ x: x(q), y: y(cl(sigmoide(a.pc.a + a.pc.b * logit(q)))) })))} />
                  <path className="q7-linha q7-linha--ink" d={caminho(isoPts.map((p) => ({ x: x(p.x), y: y(cl(p.y)) })))} />
                  {a.x.map((p, i) => <line key={i} x1={x(cl(p))} x2={x(cl(p))} y1={y(0)} y2={y(0) - d.fs * 0.5} stroke="#5B6475" strokeOpacity={a.n > 1000 ? 0.12 : 0.35} />)}
                </g>
              );
            }}
          </Grafico>
          <Grafico titulo="Os pares da janela" sub="certos, empatados, invertidos" rotulo={barras.filter((b, i) => revelado || i < ISO).map((b) => `${b.nome}: ${b.c.corretos} certos, ${b.c.empates} empates, ${b.c.invertidos} invertidos`).join("; ") + (revelado ? "" : "; isotônica: aguardando a previsão")} arCelular="1 / 1">
            {(d) => {
              const x = escala([0, BRUTO.pares.pares], [d.fs * 0.5, d.w - d.fs * 0.5]); const lh = (d.h - d.fs * 1) / barras.length;
              return (
                <g>
                  {barras.map((b, k) => { const y0 = k * lh + d.fs * 2.4, h = lh - d.fs * 3.6;
                    if (k === ISO && !revelado) return <g key={b.nome}><text className="q7-rot" x={x(0)} y={y0 - d.fs * 0.6}>{b.nome}</text><rect x={x(0)} y={y0} width={x(BRUTO.pares.pares) - x(0)} height={h} fill="#FBFAF7" stroke="#C9CDD5" strokeDasharray="6 5" /><text className="q7-rot--peq" x={(x(0) + x(BRUTO.pares.pares)) / 2} y={y0 + h / 2} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>? responda à previsão</text></g>;
                    const seg = [{ v: b.c.corretos, c: "#2E6B4F" }, { v: b.c.empates, c: "#5B6475" }, { v: b.c.invertidos, c: "#8C2332" }]; let acc = 0; return (
                    <g key={b.nome}>
                      <text className="q7-rot" x={x(0)} y={y0 - d.fs * 0.6}>{b.nome}<tspan className="q7-rot--peq" dx="8" style={{ fill: "#5B6475" }}>{int(b.dist)} distintas · AUC {num(b.c.auc!, 4)}</tspan></text>
                      {seg.map((s, i) => { const r = <rect key={i} x={x(acc)} y={y0} width={Math.max(0, x(acc + s.v) - x(acc))} height={h} fill={s.c} />; acc += s.v; return r; })}
                      {b.c.empates > BRUTO.pares.pares * 0.06 && <text className="q7-rot q7-rot--peq" x={x(b.c.corretos + b.c.empates / 2)} y={y0 + h / 2} dy=".35em" textAnchor="middle" style={{ fill: "#fff" }}>{pct(b.c.empates / b.c.pares, 0)}</text>}
                    </g>
                  ); })}
                </g>
              );
            }}
          </Grafico>
        </div>
        <Legenda itens={[{ mk: "linha prob", r: "Platt" }, { mk: "linha ink", r: "isotônica" }, { mk: "", r: "barras: verde certos, cinza empates, vinho invertidos" }]} />
      </Painel>
      <Painel>
        {prev !== CERTA ? (
          <Previsao pergunta="A isotônica nunca inverte a ordem de duas propostas. Na janela, a AUC depois dela..." escolha={prev} onEscolha={setPrev} recolher
            opcoes={[
              { texto: "Fica igual, como em Platt", retorno: "Ela não inverte, mas junta: é não decrescente, não estritamente crescente. Propostas diferentes no mesmo degrau ficam empatadas, e empate conta meio par." },
              { texto: "Pode cair, por causa de empates", certa: true, retorno: "Isso. Os degraus juntam propostas com PDs diferentes; pares que estavam certos viram empates e a AUC cai." },
              { texto: "Sobe, porque a isotônica é mais flexível", retorno: "Flexibilidade melhora o ajuste do nível na amostra de calibração, não a ordenação. Uma função monotônica nunca cria pares certos novos." },
            ]} />
        ) : (
          <>
            <div className="q7-linha-ctl"><Seg rotulo="Amostra de calibração" opcoes={[{ v: "grande" as Tam, r: `${int(CAL.n)} casos` }, { v: "pequena" as Tam, r: `Blocos de ${NB}` }]} valor={t} onChange={setT} cor /><Botao sec onClick={restaurar}>Restaurar</Botao></div>
            {t === "pequena" && <Controle rotulo={`Bloco de ${NB} (de 1 a ${BLOCOS.length})`} valor={bloco} min={1} max={BLOCOS.length} passo={1} onChange={setBloco} mostrar={`${bloco}: ${EVENTOS[bloco - 1]} defaults`} />}
            <table className="q7-tab q7-tab--comp">
              <thead><tr><th className="q7-t-l">Na janela</th><th>Platt</th><th>Isotônica</th></tr></thead>
              <tbody>
                <tr><th>Parâmetros</th><td>2</td><td>{a.iso.x.length} pontos</td></tr>
                <tr><th>PDs distintas</th><td>{int(a.platt.distintos)}</td><td>{a.isot.distintos}</td></tr>
                <tr><th>AUC</th><td>{num(a.platt.pares.auc!, 4)}</td><td>{num(a.isot.pares.auc!, 4)}</td></tr>
                <tr><th>PD média</th><td>{pct(a.platt.media, 2)}</td><td>{pct(a.isot.media, 2)}</td></tr>
                <tr><th>Brier</th><td>{num(a.platt.brier, 5)}</td><td>{num(a.isot.brier, 5)}</td></tr>
                <tr><th>Log loss</th><td>{num(a.platt.ll, 4)}</td><td>{num(a.isot.ll, 4)}</td></tr>
              </tbody>
            </table>
            <p className="q7-nota">Observado na janela: {pct(D / N, 2)}. {t === "grande" ? <>Amostra usada: {a.defaults} defaults em {int(a.n)} ({pct(a.defaults / a.n, 1)}).</> : <>Blocos: de {Math.min(...EVENTOS)} a {Math.max(...EVENTOS)} defaults.</>}</p>
          </>
        )}
        <Expandir resumo="Quando cada uma">
          <p className="q7-nota">Platt supõe que a distorção é uma reta em log odds: dois parâmetros, estável com pouco dado. A isotônica só supõe ordem: corrige formas que Platt não alcança, mas precisa de muitos casos por região de PD e devolve degraus. Arredondar PDs para relatório também cria empates: veja o slide 7.</p>
        </Expandir>
        {!revelado && <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>}
      </Painel>
    </Quadro>
  );
}

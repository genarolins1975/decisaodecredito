"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Expandir, Grafico, Legenda, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { CAL, CAL_PGR, D, N, PGR, Y } from "@/lib/capitulo7/dados";
import { ajustarIsotonica, ajustarPlatt, aplicarIsotonica, aucPorPares, brier, logit, logLoss, media, sigmoide, transformar, valoresDistintos } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 30 · c7p36 · Isotônica contra Platt, ajustadas no boosting sem recalibrar, com a amostra de calibração inteira
 * (3.000 casos) ou só com os 300 primeiros. A isotônica é monotônica mas não estritamente: junta propostas em
 * degraus, cria empates e a AUC na janela cai. Com poucos dados, as duas aprendem também o ruído do nível da amostra.
 * Isotônica pelo PAV com interpolação linear entre os pontos de quebra, como o IsotonicRegression do scikit-learn.
 * A barra de pares da isotônica (empates e AUC) fica escondida até a previsão certa, para não mostrar a resposta.
 */
type Tam = "grande" | "pequena";
function ajustes(n: number) {
  const y = CAL.y.slice(0, n), x = CAL_PGR.slice(0, n);
  const iso = ajustarIsotonica(x, y), pc = ajustarPlatt(y, x);
  const pi = aplicarIsotonica(iso, PGR), pp = transformar(PGR, pc.a, pc.b);
  const met = (p: readonly number[]) => ({ distintos: valoresDistintos(p), pares: aucPorPares(Y, p), media: media(p)!, brier: brier(Y, p), ll: logLoss(Y, p).valor });
  return { n, defaults: y.reduce((s, v) => s + v, 0), iso, pc, platt: met(pp), isot: met(pi) };
}
const AJ: Record<Tam, ReturnType<typeof ajustes>> = { grande: ajustes(CAL.n), pequena: ajustes(CAL.nPequena) };
const BRUTO = { distintos: valoresDistintos(PGR), pares: aucPorPares(Y, PGR) };

/** Índice da alternativa certa da previsão: a comparação só abre depois dela; errar mostra o retorno e pede nova tentativa. */
const CERTA = 1;

export function S30Isotonica({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState<Tam>("grande");
  const [prev, setPrev] = useState<number | null>(null);
  const a = AJ[t];
  const revelado = prev === CERTA;
  const barras = [
    { nome: "Sem calibrar", c: BRUTO.pares, dist: BRUTO.distintos },
    { nome: "Platt", c: a.platt.pares, dist: a.platt.distintos },
    { nome: "Isotônica", c: a.isot.pares, dist: a.isot.distintos },
  ];
  return (
    <Quadro slug="c7p36" pagina={pagina} layout="gl"
      conclusao={prev !== CERTA ? <>Primeiro a previsão: a isotônica também é crescente.</>
        : t === "grande" ? <>Com {int(a.n)} casos, a isotônica reduz as {int(BRUTO.distintos)} PDs distintas da janela a <b>{a.isot.distintos}</b> degraus: {int(a.isot.pares.empates)} pares viram empates e a AUC cai de {num(BRUTO.pares.auc!, 4)} para <b>{num(a.isot.pares.auc!, 4)}</b>. Platt mantém a AUC e, aqui, tem Brier e log loss menores.</>
          : <>Com {int(a.n)} casos ({a.defaults} defaults, {pct(a.defaults / a.n, 1)}), as duas erram o nível: PD média {pct(a.platt.media, 1)} (Platt) e {pct(a.isot.media, 1)} (isotônica) contra {pct(D / N, 1)} observados. A isotônica fica com {a.isot.distintos} degraus e AUC {num(a.isot.pares.auc!, 4)}. A amostra pequena tinha mais defaults que a janela, e as duas aprenderam esse nível: <b>com pouco dado, nenhum calibrador é confiável.</b></>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults, ${int(BRUTO.pares.pares)} pares default × adimplente. Calibração sintética: sorteios dos proponentes da janela, desfecho da PD verdadeira (semente ${CAL.semente}); a pequena são os ${CAL.nPequena} primeiros casos da mesma amostra. Empate conta meio par na AUC.`}>
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
                  {CAL_PGR.slice(0, a.n).map((p, i) => <line key={i} x1={x(cl(p))} x2={x(cl(p))} y1={y(0)} y2={y(0) - d.fs * 0.5} stroke="#5B6475" strokeOpacity={a.n > 1000 ? 0.12 : 0.35} />)}
                </g>
              );
            }}
          </Grafico>
          <Grafico titulo="Os pares da janela" sub="certos, empatados, invertidos" rotulo={barras.filter((b, i) => revelado || i < 2).map((b) => `${b.nome}: ${b.c.corretos} certos, ${b.c.empates} empates, ${b.c.invertidos} invertidos`).join("; ") + (revelado ? "" : "; isotônica: aguardando a previsão")} arCelular="1 / 1">
            {(d) => {
              const x = escala([0, BRUTO.pares.pares], [d.fs * 0.5, d.w - d.fs * 0.5]); const lh = (d.h - d.fs * 1) / barras.length;
              return (
                <g>
                  {barras.map((b, k) => { const y0 = k * lh + d.fs * 2.4, h = lh - d.fs * 3.6;
                    if (k === 2 && !revelado) return <g key={b.nome}><text className="q7-rot" x={x(0)} y={y0 - d.fs * 0.6}>{b.nome}</text><rect x={x(0)} y={y0} width={x(BRUTO.pares.pares) - x(0)} height={h} fill="#FBFAF7" stroke="#C9CDD5" strokeDasharray="6 5" /><text className="q7-rot--peq" x={(x(0) + x(BRUTO.pares.pares)) / 2} y={y0 + h / 2} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>? responda à previsão</text></g>;
                    const seg = [{ v: b.c.corretos, c: "#2E6B4F" }, { v: b.c.empates, c: "#5B6475" }, { v: b.c.invertidos, c: "#8C2332" }]; let acc = 0; return (
                    <g key={b.nome}>
                      <text className="q7-rot" x={x(0)} y={y0 - d.fs * 0.6}>{b.nome}<tspan className="q7-rot--peq" dx="8" style={{ fill: "#5B6475" }}>{int(b.dist)} PDs distintas · AUC {num(b.c.auc!, 4)}</tspan></text>
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
            <Seg rotulo="Amostra de calibração" opcoes={[{ v: "grande" as Tam, r: `${int(CAL.n)} casos` }, { v: "pequena" as Tam, r: `${CAL.nPequena} casos` }]} valor={t} onChange={setT} cor />
            <table className="q7-tab">
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
            <p className="q7-nota">Observado na janela: {pct(D / N, 2)}. Amostra usada: {a.defaults} defaults em {int(a.n)} ({pct(a.defaults / a.n, 1)}).</p>
          </>
        )}
        <Expandir resumo="Quando cada uma">
          <p className="q7-nota">Platt supõe que a distorção é uma reta em log odds: dois parâmetros, estável com pouco dado. A isotônica só supõe ordem: corrige formas que Platt não alcança, mas precisa de muitos casos por região de PD e devolve degraus. Arredondar PDs para relatório também cria empates: veja o slide 7.</p>
        </Expandir>
        <div className="q7-botoes"><Botao sec onClick={() => { setT("grande"); setPrev(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

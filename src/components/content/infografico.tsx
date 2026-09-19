import katex from "katex";
import { ehFluxo, type Etapa, type Infografico, type InfograficoFluxo, type Painel } from "@/lib/content/infograficos";

/**
 * Infográfico de abertura de capítulo (componente de servidor, sem JavaScript no cliente).
 * Estrutura fixa em quatro blocos: fluxo em quatro cartões, três números com fórmula, três painéis de evidência
 * e a faixa de três ideias. Estilos em globals.css (.info-*), sobre os tokens da plataforma e a cor do capítulo (--cap).
 */
export function InfograficoCapitulo({ d, modo = "aula" }: { d: Infografico; modo?: "aula" | "apresentacao" }) {
  if (ehFluxo(d)) return <InfograficoFluxo d={d} modo={modo} />;
  return (
    <section className={`info ${modo === "apresentacao" ? "info--slide" : ""}`} aria-labelledby={`info-${d.numero}`} data-testid="infografico" data-unidades={modo === "apresentacao" ? "" : undefined}>
      <header className="info-cab">
        <span className="info-num" aria-hidden="true">{d.numero}</span>
        <div>
          <p className="eyebrow">Infográfico de abertura</p>
          <h2 id={`info-${d.numero}`} className="info-tit">{d.titulo}</h2>
          <p className="info-perg">{d.pergunta}</p>
        </div>
      </header>

      <p className="info-kicker">{d.kicker1}</p>
      <ol className="info-fluxo">
        {d.cartoes.map((c, i) => (
          <li key={i} className="info-cartao" data-cor={c.cor}>
            <p className="info-cartao-tit">{i + 1}. {c.tit}</p>
            <p>{c.corpo}</p>
          </li>
        ))}
      </ol>

      <p className="info-kicker">{d.kicker2}</p>
      <div className="info-tiles">
        {d.tiles.map((t, i) => (
          <div key={i} className="info-tile" data-cor={t.cor}>
            <p className="info-sigla" data-tam={t.sigla.length <= 4 ? "g" : t.sigla.length <= 8 ? "m" : "p"}>{t.sigla}</p>
            <p className="info-nome">{t.nome}</p>
            <p className="info-desc">{t.desc}</p>
          </div>
        ))}
        <div className="info-formula">
          <p className="info-formula-t">{d.formula}</p>
          {d.formulaNota && <p className="info-formula-n">{d.formulaNota}</p>}
        </div>
      </div>

      <p className="info-kicker">{d.kicker3}</p>
      <div className="info-paineis">
        {d.paineis.map((p, i) => <PainelView key={i} p={p} />)}
      </div>

      <div className="info-faixa">
        <p className="info-faixa-k">{d.faixa.kicker}</p>
        <dl>
          {d.faixa.itens.map((it, i) => (
            <div key={i}><dt>{it.k}</dt><dd>{it.v}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PainelView({ p }: { p: Painel }) {
  return (
    <div className="info-painel" data-tipo={p.tipo}>
      <p className="info-painel-t">{p.titulo}</p>
      {p.tipo === "pontos" && (
        <>
          <div className="info-pontos" style={{ ["--cols" as string]: p.cols }} role="img" aria-label={p.legenda}>
            {Array.from({ length: p.n }, (_, k) => <i key={k} data-d={p.defaults.includes(k) ? "1" : undefined} />)}
          </div>
          <p className="info-legenda">{p.legenda}</p>
        </>
      )}
      {p.tipo === "tempo" && <Tempo p={p} />}
      {p.tipo === "barras" && (
        <>
          {p.texto && <p className="info-texto">{p.texto}</p>}
          <div className="info-barras">
            {(() => { const max = Math.max(...p.itens.map((i) => Math.abs(i.v))) || 1; return p.itens.map((it, i) => (
              <div key={i} className="info-barra" data-cor={it.cor}>
                <span className="info-barra-rot">{it.rot}</span>
                <span className="info-barra-trilho"><span className="info-barra-fill" style={{ width: `${Math.max(2, (Math.abs(it.v) / max) * 100)}%` }} /></span>
                <span className="info-barra-val">{it.texto}</span>
              </div>
            )); })()}
          </div>
          {p.nota && <p className="info-nota">{p.nota}</p>}
        </>
      )}
      {p.tipo === "kv" && (
        <>
          {p.texto && <p className="info-texto">{p.texto}</p>}
          <dl className="info-kv">
            {p.linhas.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {p.nota && <p className="info-nota">{p.nota}</p>}
        </>
      )}
      {p.tipo === "lista" && (
        <ul className="info-lista">{p.itens.map((it, i) => <li key={i}>{it}</li>)}</ul>
      )}
    </div>
  );
}

function Tempo({ p }: { p: Extract<Painel, { tipo: "tempo" }> }) {
  const fim = p.meses[p.meses.length - 1]; const W = 320, X0 = 16, X1 = 250, Y = 40;
  const px = (m: number) => X0 + ((X1 - X0) * m) / fim;
  return (
    <>
      <p className="info-texto info-texto--mute">{p.legenda}</p>
      <svg className="info-tempo" viewBox={`0 0 ${W} 96`} role="img" aria-label={`${p.marcaTexto}. ${p.janelas.map((j) => j.texto).join(". ")}`}>
        <line x1={X0} y1={Y} x2={X1} y2={Y} className="info-tempo-eixo" />
        {p.meses.map((m) => (
          <g key={m}><line x1={px(m)} y1={Y - 4} x2={px(m)} y2={Y + 4} className="info-tempo-eixo" /><text x={px(m)} y={Y + 16} textAnchor="middle" className="info-tempo-rot">M{m}</text></g>
        ))}
        <circle cx={px(p.marcaMes)} cy={Y} r={5.5} className="info-tempo-marca" />
        <text x={px(p.marcaMes)} y={Y - 10} textAnchor="middle" className="info-tempo-marca-t">{p.marcaTexto}</text>
        {p.janelas.map((j, i) => (
          <g key={i} data-cor={j.cor}>
            <rect x={X0} y={Y + 26 + i * 18} width={px(j.ate) - X0} height={10} rx={2} className="info-tempo-janela" />
            <text x={px(j.ate) + 6} y={Y + 35 + i * 18} className="info-tempo-janela-t">{j.texto}</text>
          </g>
        ))}
      </svg>
    </>
  );
}

const tex = (t: string) => ({ __html: katex.renderToString(t, { throwOnError: false, output: "html" }) });

/** Curva logística em SVG puro: p = 1 / (1 + e^(−z)), z de −6 a 6, ponto em (0, 50%). */
function CurvaLogistica({ titulo, eixoX }: { titulo: string; eixoX: string }) {
  const W = 300, H = 170, ML = 40, MR = 12, MT = 26, MB = 34; const sx = (z: number) => ML + ((z + 6) / 12) * (W - ML - MR), sy = (p: number) => MT + (1 - p) * (H - MT - MB);
  const d = Array.from({ length: 61 }, (_, i) => -6 + i * 0.2).map((z, i) => `${i ? "L" : "M"}${sx(z).toFixed(1)} ${sy(1 / (1 + Math.exp(-z))).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="info-fx-curva" role="img" aria-label={`${titulo}: curva em S de 0% a 100%, com 50% em z igual a zero`}>
      <text x={(ML + W - MR) / 2} y={14} textAnchor="middle" className="info-fx-curva-t">{titulo}</text>
      {[0, 0.5, 1].map((p) => <g key={p}><line x1={ML} x2={W - MR} y1={sy(p)} y2={sy(p)} className="info-fx-grade" /><text x={ML - 6} y={sy(p) + 4} textAnchor="end" className="info-fx-tick">{p * 100}%</text></g>)}
      <line x1={sx(0)} x2={sx(0)} y1={MT} y2={H - MB} className="info-fx-grade" />
      {[-4, 0, 4].map((z) => <text key={z} x={sx(z)} y={H - MB + 14} textAnchor="middle" className="info-fx-tick">{z < 0 ? `−${-z}` : z}</text>)}
      <text x={(ML + W - MR) / 2} y={H - 6} textAnchor="middle" className="info-fx-tick">{eixoX}</text>
      <path d={d} className="info-fx-linha" /><circle cx={sx(0)} cy={sy(0.5)} r={4} className="info-fx-ponto" />
    </svg>
  );
}

function EtapaView({ e, i }: { e: Etapa; i: number }) {
  return (
    <li className="info-fx-etapa">
      <p className="info-fx-rot"><b>{String(i + 1).padStart(2, "0")}</b> {e.rot}</p>
      {e.tit && <p className="info-fx-tit">{e.tit}</p>}
      {e.entradas && (
        <dl className="info-fx-entradas">
          {e.entradas.map((x) => <div key={x.k}><dt>{x.k}</dt><dd><b>{x.v}</b><span className="info-fx-x">→ {x.x}</span></dd></div>)}
        </dl>
      )}
      {e.tex && <div className="info-fx-formula" dangerouslySetInnerHTML={tex(e.tex)} />}
      {e.parcelas && <ul className="info-fx-parcelas">{e.parcelas.map((p) => <li key={p.rot} data-cor={p.cor}><b>{p.v}</b><span>{p.rot}</span></li>)}</ul>}
      {e.total && <p className="info-fx-total">{e.total}</p>}
      {e.destaque && <p className="info-fx-destaque">{e.destaque}</p>}
      {e.texto && <p className="info-texto">{e.texto}</p>}
      {e.nota && <p className={e.notaForte ? "info-fx-nota-forte" : "info-nota"}>{e.nota}</p>}
    </li>
  );
}

/** Variante de fluxo (capítulo 4): três etapas encadeadas, dois painéis e a faixa de limite. */
function InfograficoFluxo({ d, modo }: { d: InfograficoFluxo; modo: "aula" | "apresentacao" }) {
  return (
    <section className={`info info-fx ${modo === "apresentacao" ? "info--slide" : ""}`} aria-labelledby={`info-${d.numero}`} data-testid="infografico" data-unidades={modo === "apresentacao" ? "" : undefined}>
      <header className="info-cab">
        <span className="info-num" aria-hidden="true">{d.numero}</span>
        <div>
          <p className="eyebrow">{d.eyebrow ?? "Infográfico de abertura"}</p>
          <h2 id={`info-${d.numero}`} className="info-tit">{d.titulo}</h2>
          <p className="info-perg">{d.pergunta}</p>
        </div>
      </header>
      <ol className="info-fx-etapas">{d.etapas.map((e, i) => <EtapaView key={e.rot} e={e} i={i} />)}</ol>
      <div className="info-fx-paineis">
        <div className="info-painel info-fx-escalas">
          <p className="info-fx-rot">{d.escalas.titulo}</p>
          <div className="info-fx-escalas-grade">
            <div>
              {d.escalas.formulas.map((f) => <div key={f.txt} className="info-fx-formula info-fx-formula--p" dangerouslySetInnerHTML={tex(f.tex)} />)}
              <p className="info-fx-sub">{d.escalas.exemploTit}</p>
              <p className="info-fx-exemplo">{d.escalas.exemplo}</p>
              {d.escalas.exemploLinhas.map((l) => <p key={l} className="info-nota">{l}</p>)}
            </div>
            <CurvaLogistica titulo={d.escalas.curvaTit} eixoX={d.escalas.eixoX} />
          </div>
        </div>
        <div className="info-painel info-fx-coef">
          <p className="info-fx-rot">{d.coeficiente.titulo}</p>
          <p className="info-fx-headline">{d.coeficiente.headline}</p>
          <p className="info-nota">{d.coeficiente.texto}</p>
          <ul className="info-fx-casos">{d.coeficiente.casos.map((c) => <li key={c.de}><b>{c.de} → {c.para}</b><span>{c.delta}</span></li>)}</ul>
          <p className="info-fx-nota-forte">{d.coeficiente.nota}</p>
        </div>
      </div>
      <div className="info-faixa info-fx-faixa"><p className="info-faixa-k">{d.faixa.kicker}</p><p className="info-fx-faixa-t">{d.faixa.texto}</p></div>
      <p className="info-fx-rodape">{d.rodape.map((r, i) => <span key={i}>{r}</span>)}</p>
    </section>
  );
}

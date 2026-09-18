import type { Infografico, Painel } from "@/lib/content/infograficos";

/**
 * Infográfico de abertura de capítulo (componente de servidor, sem JavaScript no cliente).
 * Estrutura fixa em quatro blocos: fluxo em quatro cartões, três números com fórmula, três painéis de evidência
 * e a faixa de três ideias. Estilos em globals.css (.info-*), sobre os tokens da plataforma e a cor do capítulo (--cap).
 */
export function InfograficoCapitulo({ d, modo = "aula" }: { d: Infografico; modo?: "aula" | "apresentacao" }) {
  return (
    <section className={`info ${modo === "apresentacao" ? "info--slide" : ""}`} aria-labelledby={`info-${d.numero}`} data-testid="infografico">
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

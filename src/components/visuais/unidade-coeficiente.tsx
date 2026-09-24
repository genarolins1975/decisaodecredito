"use client";
import { Fragment, useState } from "react";
import { ATALHOS, ATRASO_FIXO, comparacaoOdds, CONCLUSAO_K, CONCLUSAO_T, deltaXTex, deltaXTexto, efeitoTex, efeitoTexto, escoreTex, escoreTexto, fmt, fmtNum, fmtPct, FRASE_RESULTADO, linhas, LIMITES_UTIL, NOTA_OR, NOTA_OR_2, NOTA_PARCELAS, NOTA_PROPOSTA, orTex, orTexto, PERGUNTA_OR, resultado, RODAPE, ROTULO_CONTRIB, somaTex, somaTexto, UNIDADES, UTIL_INICIAL, validarUtil } from "@/lib/visuais/unidade-coeficiente";
import { Tex } from "./tex";

/**
 * Slide 14 do capítulo 4 (c4p14): a mesma contribuição escrita em três unidades. Quadro 16:9 no sistema .rl.
 * A proposta é o único dado que o aluno muda; selecionar uma linha apenas destaca a representação e mostra a
 * definição de x, sem alterar a proposta nem esconder as demais. Contas em
 * src/lib/visuais/unidade-coeficiente.ts. Substitui o conteúdo herdado da página. A definição de x, a soma das parcelas,
 * o escore e o detalhe da razão de odds em KaTeX desde 24/09/2026, com o texto como rótulo acessível; a tabela fica em texto.
 */
function Campo({ mostrado, onValor }: { mostrado: string; onValor: (v: number) => void }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [erro, setErro] = useState<string | null>(null);
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); }
  return (
    <span className="uc-campo">
      <label htmlFor="uc-util">Utilização, campo em %</label>
      <span className="uc-campo-in">
        <input id="uc-util" type="text" inputMode="numeric" value={texto} aria-invalid={Boolean(erro)} aria-describedby="uc-util-msg"
          onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); setErro(null); }}
          onChange={(e) => { setTexto(e.target.value); const r = validarUtil(e.target.value); if (r.ok) { onValor(r.valor); setErro(null); } else setErro(r.erro); }} />
        <span>%</span>
      </span>
      <span id="uc-util-msg" className="uc-msg" aria-live="polite">{erro ?? ""}</span>
    </span>
  );
}

export function UnidadeCoeficiente({ pagina }: { pagina?: { index: number; total: number } }) {
  const [util, setUtil] = useState(UTIL_INICIAL);
  const [sel, setSel] = useState<string | null>(null);
  const [odds, setOdds] = useState(false);
  const ls = linhas(util);
  const r = resultado(util);
  const c = comparacaoOdds();
  const escolhida = UNIDADES.find((u) => u.id === sel) ?? null;
  return (
    <figure className="vz rl uc" data-vz="unidade-coeficiente">
      <section className="rl-slide" data-tela="14">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Unidades"}</span></p>
          <h3 className="rl-tit">A unidade muda. A previsão permanece.</h3>
          <p className="rl-sub">O coeficiente compensa a mudança de escala para preservar a contribuição βx.</p>
        </header>

        <div className="uc-proposta">
          <label className="uc-slider" htmlFor="uc-range"><b>Utilização do limite</b> <span className="uc-val">{fmt(util, 0)}%</span>
            <input id="uc-range" type="range" min={LIMITES_UTIL[0]} max={LIMITES_UTIL[1]} step={1} value={util} onChange={(e) => setUtil(Number(e.target.value))} aria-valuetext={`${fmt(util, 0)} por cento`} /></label>
          <Campo mostrado={String(util)} onValor={setUtil} />
          <div className="rl-atalhos" role="group" aria-label="Atalhos de utilização">
            {ATALHOS.map((a) => <button key={a} type="button" className={`rl-btn rl-btn--mini ${a === util ? "rl-btn--on" : ""}`} aria-pressed={a === util} onClick={() => setUtil(a)}>{a}%</button>)}
            <button type="button" className="rl-btn rl-btn--mini" onClick={() => { setUtil(UTIL_INICIAL); setSel(null); setOdds(false); }}>Restaurar exemplo</button>
          </div>
          <p className="uc-atraso"><b>Atraso</b> {ATRASO_FIXO} dias <span className="uc-fixo">fixo neste slide</span></p>
          <p className="uc-mesma nota">{NOTA_PROPOSTA}</p>
        </div>

        <div className="rl-corpo uc-corpo">
          <p className="rl-k uc-tit">Três maneiras de escrever a mesma contribuição</p>
          <table className="uc-tab">
            <colgroup><col className="uc-c1" /><col className="uc-c2" /><col className="uc-c3" /><col className="uc-c4" /><col className="uc-c5" /><col className="uc-c6" /><col className="uc-c7" /></colgroup>
            <thead><tr><th scope="col">Unidade</th><th scope="col">Valor x</th><th scope="col" aria-hidden="true"></th><th scope="col">Coeficiente β</th><th scope="col" aria-hidden="true"></th><th scope="col">Contribuição βx</th><th scope="col"><span className="sr-only">Selecionar</span></th></tr></thead>
            <tbody>
              {ls.map((l) => (
                <tr key={l.unidade.id} className={sel === l.unidade.id ? "uc-on" : ""}>
                  <th scope="row"><span className="uc-un">{l.unidade.rotulo}</span><span className="uc-eq">{l.unidade.equivale}</span></th>
                  <td className="uc-x">{fmtNum(l.x, l.unidade.casasX, l.unidade.fixarX)}</td>
                  <td className="uc-op" aria-hidden="true">×</td>
                  <td className="uc-b">{fmt(l.beta, l.unidade.casasBeta)}</td>
                  <td className="uc-op" aria-hidden="true">=</td>
                  <td className="uc-c">{fmt(l.contribuicao, 4)}</td>
                  <td className="uc-sel">
                    <button type="button" className={`rl-btn rl-btn--mini ${sel === l.unidade.id ? "rl-btn--on" : ""}`} aria-pressed={sel === l.unidade.id}
                      onClick={() => setSel(sel === l.unidade.id ? null : l.unidade.id)}>{sel === l.unidade.id ? "Selecionada" : "Ver definição"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="uc-rot"><span className="uc-rot-c">{ROTULO_CONTRIB}</span>{escolhida && <span className="uc-def" aria-live="polite"><b>{escolhida.rotulo}:</b> <span role="img" aria-label={escolhida.definicao}><Tex f={escolhida.definicaoTex} className="tx-linha" /></span>. A proposta não muda, só a forma de escrevê-la.</span>}</p>
        </div>

        <div className="uc-resultado" aria-live="polite">
          <div>
            <p className="uc-res-k">Intercepto + utilização + atraso</p>
            <p className="uc-soma" role="img" aria-label={somaTexto(r)}><Tex f={somaTex(r)} /></p>
            <p className="uc-res-n nota">{NOTA_PARCELAS}</p>
          </div>
          <div>
            <p className="uc-res-k">Escore</p>
            <p className="uc-res-v uc-res-v--tex" role="img" aria-label={escoreTexto(r.z)}><Tex f={escoreTex(r.z)} /></p>
          </div>
          <div>
            <p className="uc-res-k">PD estimada</p>
            <p className="uc-res-v uc-res-v--pd">{fmtPct(r.pd)}</p>
          </div>
          <p className="uc-frase">{FRASE_RESULTADO}</p>
        </div>

        <div className="uc-odds-area">
          <button type="button" className={`rl-btn rl-btn--mini ${odds ? "rl-btn--on" : ""}`} aria-expanded={odds} onClick={() => setOdds((v) => !v)}>{PERGUNTA_OR}</button>
          {odds && (
            <div className="uc-odds">
              <p className="uc-odds-k">{NOTA_OR} <span className="uc-odds-n nota">{NOTA_OR_2}</span></p>
              <p className="uc-odds-l">{c.itens.map((i, k) => <Fragment key={i.unidade.id}>{k ? " · " : ""}{i.unidade.rotulo}: <span role="img" aria-label={deltaXTexto(i.dx)}><Tex f={deltaXTex(i.dx)} className="tx-linha" /></span></Fragment>)}</p>
              <p className="uc-odds-v"><span role="img" aria-label={efeitoTexto(c.efeito)}><Tex f={efeitoTex(c.efeito)} className="tx-linha" /></span> nas três · <span role="img" aria-label={orTexto(c.or)}><Tex f={orTex(c.or)} className="tx-linha" /></span></p>
            </div>
          )}
        </div>

        <div className="uc-conclusao">
          <p className="uc-conc-k">{CONCLUSAO_K}</p>
          <p className="uc-conc-t">{CONCLUSAO_T}</p>
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

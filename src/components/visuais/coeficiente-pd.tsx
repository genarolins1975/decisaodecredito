"use client";
import { useRef, useState } from "react";
import { ALTERNATIVAS, alternativa, contas, demonstracao, DETALHE_K, DETALHE_T, fmt, fmtPct, fmtPp, NOTA_CAUSAL, NOTA_MODELO, ORIENTACAO, ORIENTACAO_FECHO, RODAPE, SINTESE_ANTES, SINTESE_DEPOIS, SITUACAO } from "@/lib/visuais/coeficiente-pd";
import { ComTex, Tex } from "./tex";

/**
 * Slide 10 do capítulo 4 (c4p10): o aluno escolhe a leitura do coeficiente e confere. Quadro 16:9 no sistema .rl,
 * com enunciado fixo, exercício de três alternativas e painel que troca de conteúdo entre orientação, resposta e
 * o detalhe sobre manter constante. A altura do quadro não muda entre os estados. Contas em
 * src/lib/visuais/coeficiente-pd.ts. Substitui o conteúdo herdado da página, inclusive a questão equivalente.
 * Fórmulas e contas em KaTeX desde 24/09/2026, com o texto como rótulo acessível; nas frases, trechos em linha (ComTex).
 */
type Painel = "orientacao" | "resposta" | "detalhe";

export function CoeficientePd({ pagina }: { pagina?: { index: number; total: number } }) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [conferido, setConferido] = useState<string | null>(null);
  const [painel, setPainel] = useState<Painel>("orientacao");
  const voltarRef = useRef<HTMLButtonElement>(null);
  const d = demonstracao();
  const alt = alternativa(conferido);
  const conferir = () => { if (!escolha) return; setConferido(escolha); setPainel("resposta"); };
  const tentar = () => { setEscolha(null); setConferido(null); setPainel("orientacao"); };
  return (
    <figure className="vz rl cf" data-vz="coeficiente-pd">
      <section className="rl-slide" data-tela="10">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Coeficiente"}</span></p>
          <h3 className="rl-tit">Você interpretaria este coeficiente corretamente?</h3>
          <p className="rl-sub">Observe a unidade da variável e identifique em qual escala o efeito acontece.</p>
        </header>

        <div className="cf-situacao">
          {SITUACAO.map((s) => (
            <div key={s.k} className="cf-sit">
              <p className="cf-sit-k">{s.k}</p>
              {s.tex
                ? <p className={`cf-sit-v cf-sit-v--tex cf-sit-v--${s.cor}`} role="img" aria-label={s.v}><Tex f={s.tex} /></p>
                : <p className={`cf-sit-v cf-sit-v--${s.cor}`}>{s.v}</p>}
              <p className="cf-sit-n">{s.n}</p>
            </div>
          ))}
        </div>

        <div className="rl-corpo cf-corpo">
          <div className="cf-ex">
            <fieldset className="cf-fs">
              <legend className="cf-legend">Qual afirmação está correta?</legend>
              <div className="cf-alts">
              {ALTERNATIVAS.map((a) => (
                <label key={a.id} className={`cf-alt ${escolha === a.id ? "cf-alt--on" : ""} ${conferido ? "cf-alt--travada" : ""}`}>
                  <input type="radio" name="cf-alt" value={a.id} checked={escolha === a.id} disabled={Boolean(conferido)} onChange={() => setEscolha(a.id)} />
                  <span className="cf-alt-id" aria-hidden="true">{a.id}</span>
                  <span className="cf-alt-t">{a.texto}</span>
                </label>
              ))}
              </div>
            </fieldset>
            <p className="cf-nota nota">{NOTA_MODELO}</p>
            <p className="cf-acoes">
              <button type="button" className={`rl-btn ${escolha && !conferido ? "rl-btn--on" : ""}`} disabled={!escolha || Boolean(conferido)} onClick={conferir}>Conferir resposta</button>
              <span className="cf-dica">{conferido ? "Resposta conferida ao lado." : escolha ? "Clique para conferir." : "Selecione uma alternativa."}</span>
            </p>
          </div>

          <aside className="cf-painel" aria-live="polite">
            {painel === "orientacao" && (
              <div className="cf-p cf-p--orienta">
                <p className="cf-p-k">Antes de responder</p>
                <ol className="cf-passos">
                  {ORIENTACAO.map((q, i) => <li key={q}><span className="cf-passo-n" aria-hidden="true">{i + 1}</span>{q}</li>)}
                </ol>
                <p className="cf-p-fecho">{ORIENTACAO_FECHO}</p>
                <button type="button" className="rl-btn rl-btn--mini" onClick={() => setPainel("detalhe")}>{DETALHE_K}</button>
              </div>
            )}

            {painel === "resposta" && alt && (
              <div className={`cf-p cf-p--${alt.correta ? "ok" : "erro"}`}>
                <p className="cf-p-k"><span className="cf-icone" aria-hidden="true">{alt.correta ? "✓" : "!"}</span>{alt.correta ? "Resposta correta" : "Resposta incorreta"}</p>
                <p className="cf-p-t">{alt.tituloFeedback}</p>
                <p className="cf-p-s"><ComTex t={alt.feedback} /></p>
                <div className="cf-dem">
                  {contas().map((c) => <p key={c.texto} className="cf-conta" role="img" aria-label={c.texto}><Tex f={c.tex} /></p>)}
                  <p className="cf-linha"><span>Escore</span><b>{fmt(d.z0, 4)}</b><span aria-hidden="true">→</span><b>{fmt(d.z1, 4)}</b></p>
                  <p className="cf-linha"><span>PD</span><b>{fmtPct(d.pd0)}</b><span aria-hidden="true">→</span><b className="cf-pd">{fmtPct(d.pd1)}</b></p>
                  <p className="cf-destaque">A variação da PD neste exemplo é {fmtPp(d.deltaPd)}.</p>
                </div>
                <button type="button" ref={voltarRef} className="rl-btn rl-btn--mini" onClick={tentar}>Tentar novamente</button>
              </div>
            )}

            {painel === "detalhe" && (
              <div className="cf-p cf-p--detalhe">
                <p className="cf-p-k">{DETALHE_K}</p>
                <p className="cf-p-s">{DETALHE_T}</p>
                <button type="button" className="rl-btn rl-btn--mini" onClick={() => setPainel(conferido ? "resposta" : "orientacao")}>Voltar</button>
              </div>
            )}
          </aside>
        </div>

        <div className={`cf-sintese ${conferido ? "cf-sintese--depois" : ""}`}>
          <p className="cf-sintese-t">{conferido ? <ComTex t={SINTESE_DEPOIS} /> : SINTESE_ANTES}</p>
          {conferido && <p className="cf-sintese-n">{NOTA_CAUSAL}</p>}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

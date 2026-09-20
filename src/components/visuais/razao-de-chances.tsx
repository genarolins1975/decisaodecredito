"use client";
import { useState } from "react";
import { alternativa, alternativas, CAMINHO, CAMINHO_FECHO, conclusao, conversao, ENUNCIADO, etapas, fmtPd1, NOTA_ENUNCIADO, NOTA_OR, RODAPE, SINTESE_ANTES, TRANSICAO } from "@/lib/visuais/razao-de-chances";

/**
 * Slide 11 do capítulo 4 (c4p11): a razão de odds multiplica odds, não probabilidade. Quadro 16:9 no sistema .rl.
 * O aluno escolhe a nova PD e confere; a demonstração à direita mostra os três passos com os números calculados,
 * qualquer que seja a alternativa escolhida. Contas em src/lib/visuais/razao-de-chances.ts, com OR = exp(β) em
 * precisão integral. Substitui o conteúdo herdado da página, inclusive a questão equivalente.
 */
export function RazaoDeChances({ pagina }: { pagina?: { index: number; total: number } }) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [conferido, setConferido] = useState<string | null>(null);
  const alts = alternativas();
  const alt = alternativa(conferido);
  const c = conversao();
  const es = etapas();
  const fim = conclusao();
  const conferir = () => { if (escolha) setConferido(escolha); };
  const tentar = () => { setEscolha(null); setConferido(null); };
  return (
    <figure className="vz rl ro" data-vz="razao-de-chances">
      <section className="rl-slide" data-tela="11">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Razão de odds"}</span></p>
          <h3 className="rl-tit">As odds multiplicam por 2,11. E a PD?</h3>
          <p className="rl-sub">Partindo de uma PD de 10%, calcule a nova probabilidade.</p>
        </header>

        <div className="ro-enunciado">
          <div className="ro-faixa">
            {ENUNCIADO.map((e) => (
              <div key={e.k} className="ro-dado">
                <p className="ro-dado-k">{e.k}</p>
                <p className={`ro-dado-v ro-dado-v--${e.cor}`}>{e.v}</p>
              </div>
            ))}
          </div>
          <p className="ro-nota nota">{NOTA_ENUNCIADO} {NOTA_OR}</p>
        </div>

        <div className="rl-corpo ro-corpo">
          <div className="ro-ex">
            <fieldset className="ro-fs">
              <legend className="ro-legend">Qual é a nova PD?</legend>
              <div className="ro-alts">
                {alts.map((a) => (
                  <div key={a.id} className={`ro-alt-caixa ${conferido === a.id ? (a.correta ? "ro-alt-caixa--ok" : "ro-alt-caixa--erro") : ""}`}>
                    <label className={`ro-alt ${escolha === a.id ? "ro-alt--on" : ""} ${conferido ? "ro-alt--travada" : ""}`}>
                      <input type="radio" name="ro-alt" value={a.id} checked={escolha === a.id} disabled={Boolean(conferido)} onChange={() => setEscolha(a.id)} />
                      <span className="ro-alt-id" aria-hidden="true">{a.id}</span>
                      <span className="ro-alt-v">{fmtPd1(a.valor)}</span>
                      <span className="ro-alt-t">{a.rotulo}</span>
                    </label>
                    {conferido === a.id && (
                      <p className="ro-fb" aria-live="polite">
                        <span className="ro-fb-i" aria-hidden="true">{a.correta ? "✓" : "!"}</span>
                        <b>{a.correta ? "Resposta correta." : "Resposta incorreta."}</b> {a.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
            <p className="ro-acoes">
              {conferido
                ? <button type="button" className="rl-btn" onClick={tentar}>Tentar novamente</button>
                : <button type="button" className={`rl-btn ${escolha ? "rl-btn--on" : ""}`} disabled={!escolha} onClick={conferir}>Conferir resposta</button>}
              <span className="ro-dica">{conferido ? "A conversão completa está ao lado." : escolha ? "Clique para conferir." : "Selecione uma alternativa."}</span>
            </p>
          </div>

          <aside className="ro-painel" aria-live="polite">
            {!conferido && (
              <div className="ro-p">
                <p className="ro-p-k">Qual caminho você usaria?</p>
                <ol className="ro-passos">
                  {CAMINHO.map((p, i) => (
                    <li key={p.t}><span className="ro-passo-n" aria-hidden="true">{i + 1}</span><span><b>{p.t}</b><span className="ro-passo-f">{p.f}</span></span></li>
                  ))}
                </ol>
                <p className="ro-p-fecho">{CAMINHO_FECHO}</p>
              </div>
            )}
            {conferido && (
              <div className="ro-p ro-p--dem">
                <p className="ro-p-k">Da PD às odds e de volta</p>
                <ol className="ro-passos ro-passos--dem">
                  {es.map((e, i) => (
                    <li key={e.k} className={e.destaque ? "ro-etapa--fim" : ""}>
                      <span className="ro-passo-n" aria-hidden="true">{i + 1}</span>
                      <span><b>{e.k}</b><span className="ro-passo-f">{e.conta}</span></span>
                      <span className={`ro-etapa-v ${e.destaque ? "ro-etapa-v--fim" : ""}`}>{e.valor}</span>
                    </li>
                  ))}
                </ol>
                <p className="ro-p-fecho">Portanto, aproximadamente {fmtPd1(c.p1)}.</p>
              </div>
            )}
          </aside>
        </div>

        <div className={`ro-sintese ${conferido ? "ro-sintese--depois" : ""}`}>
          <p className="ro-sintese-t">{conferido ? fim.principal : SINTESE_ANTES}</p>
          {conferido && <p className="ro-sintese-n">{fim.detalhe}</p>}
        </div>
        <p className="rl-rod nota ro-rod"><span><b>A seguir</b> {TRANSICAO}</span><span>{RODAPE}</span></p>
      </section>
    </figure>
  );
}

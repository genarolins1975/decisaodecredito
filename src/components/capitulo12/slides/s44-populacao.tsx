"use client";
import { useState } from "react";
import { Botao, LinkSlide, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { BVS } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 44 · c12p44 · Aprofundamento: sobreajuste ou mudança na população? (o "Pare e pense" da aula). Seis evidências que
 * um analista poderia pedir; a turma escolhe uma, classifica (apoia sobreajuste, não separa, apoia mudança na
 * população) e só então vê o diagnóstico com o porquê; no acerto, o cartão desce para a coluna certa. As contagens
 * da leitura saem da própria lista. A ligação com a figura por safra do apêndice (slide 51) é descritiva e cautelosa.
 * O único número do caso é a queda de AUC do exemplo BVS (b4.ts). Estado inicial: nada classificado, a primeira
 * evidência em foco; "Restaurar" volta a ele.
 */
type Diag = "sobre" | "nao" | "pop";
const COLUNAS: { v: Diag; r: string }[] = [{ v: "sobre", r: "Apoia sobreajuste" }, { v: "nao", r: "Não separa" }, { v: "pop", r: "Apoia mudança na população" }];
const EVID: { id: string; texto: string; certa: Diag; porque: string; erro: Partial<Record<Diag, string>> }[] = [
  { id: "e1", texto: "Queda muito maior no modelo complexo que nos simples, na mesma janela", certa: "sobre", porque: "A população é a mesma para todos os modelos; se só o complexo cai, a causa está nele: decorou o treino.", erro: { nao: "Separa: a janela é a mesma para todos, e a população não explica a diferença entre modelos.", pop: "Se a população tivesse mudado, os modelos simples também cairiam muito." } },
  { id: "e2", texto: "Variáveis de entrada deslocadas nas safras novas", certa: "pop", porque: "Se as entradas mudaram, o modelo é aplicado fora do perfil em que aprendeu: a população mudou.", erro: { sobre: "Sobreajuste é do modelo; entradas deslocadas são dos dados e afetam qualquer modelo.", nao: "Separa: mostra que as safras novas são diferentes antes de olhar qualquer modelo." } },
  { id: "e3", texto: "Faixas boas com mais maus depois do início da validação", certa: "nao", porque: "Os dois mecanismos produzem isso. Ajuda o momento: subida que já começa no treino aponta para a população.", erro: { sobre: "Sozinha não basta: uma população mais arriscada também eleva os maus das faixas boas.", pop: "Sozinha não basta: um modelo que decorou o treino também erra as faixas boas fora dele." } },
  { id: "e4", texto: "Queda parecida em todos os modelos", certa: "pop", porque: "Uma causa comum a modelos diferentes está nos dados: perfil, período ou política.", erro: { sobre: "Se fosse sobreajuste, os modelos simples cairiam menos que o complexo.", nao: "Separa: queda igual em modelos diferentes aponta para uma causa comum, nos dados." } },
  { id: "e5", texto: "Queda já na validação aleatória do mesmo período", certa: "sobre", porque: "Sem passar o tempo, a população é a mesma: a queda vem do ajuste ao treino.", erro: { pop: "Na validação aleatória do mesmo período, a população não mudou.", nao: "Separa: sem passagem do tempo, só resta o ajuste do modelo." } },
  { id: "e6", texto: "Mudança na política de concessão no período", certa: "pop", porque: "Quem é aprovado muda, e com isso o perfil dos maus: a validação vem de outra população.", erro: { sobre: "A política muda quem entra na carteira; não muda o modelo.", nao: "Separa: é uma mudança conhecida na população aprovada, a investigar antes de culpar o modelo." } },
];
const VAZIO: Record<string, Diag | null> = Object.fromEntries(EVID.map((e) => [e.id, null]));
const NOME: Record<Diag, string> = { sobre: "sobreajuste", nao: "não separa", pop: "mudança na população" };
const conta = (d: Diag) => EVID.filter((e) => e.certa === d).length;

export function S44Populacao({ pagina }: { pagina?: Pagina }) {
  const [diag, setDiag] = useState(VAZIO);
  const [sel, setSel] = useState(EVID[0].id);
  const e = EVID.find((x) => x.id === sel)!;
  const d = diag[sel];
  const certas = EVID.filter((x) => diag[x.id] === x.certa).length;
  const fim = certas === EVID.length;
  const escolher = (v: Diag) => setDiag({ ...diag, [sel]: v });
  // a próxima evidência só entra em foco quando a turma pede: o porquê da atual fica à vista até lá
  const prox = EVID.find((x) => x.id !== sel && diag[x.id] !== x.certa);
  const ultima = EVID.filter((x) => diag[x.id] === x.certa);
  return (
    <Quadro slug="c12p44" pagina={pagina} layout="gl"
      conclusao={fim ? <><b>{int(conta("sobre"))} evidências</b> apontam para sobreajuste, <b>{int(conta("pop"))}</b> para mudança na população e {int(conta("nao"))} não separa. A queda de {pct(-BVS.variacao, 1)} pede as duas checagens antes do corte (slide {SLIDE.c12p45.n}).</>
        : <>Classifique as seis evidências: {int(certas)} de {int(EVID.length)} no lugar. Que dado separa as duas hipóteses?</>}
      fonte="Evidências e diagnósticos propostos para discussão; não são medidas do caso. A figura por safra é a do exemplo de alta renda (BVS) do material da aula.">
      <Painel className="q12-s44-quadro">
        <ul className="q12-s44-pilha" aria-label="Evidências a classificar">
          {EVID.filter((x) => diag[x.id] !== x.certa).map((x) => (
            <li key={x.id}><button type="button" className="q12-s44-ev" aria-pressed={x.id === sel} data-erro={diag[x.id] ? "1" : undefined} onClick={() => setSel(x.id)}>{x.texto}</button></li>
          ))}
          {EVID.every((x) => diag[x.id] === x.certa) && <li className="q12-s44-vazio">Todas classificadas.</li>}
        </ul>
        <div className="q12-s44-cols">
          {COLUNAS.map((c) => (
            <section key={c.v} className="q12-s44-col" data-d={c.v} aria-label={c.r}>
              <p className="q7-k">{c.r}</p>
              <ul>{ultima.filter((x) => x.certa === c.v).map((x) => <li key={x.id}><button type="button" className="q12-s44-ev q12-s44-ev--ok" aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>{x.texto}</button></li>)}</ul>
            </section>
          ))}
        </div>
      </Painel>
      <Painel>
        <p className="q7-k">Evidência em foco</p>
        <p className="q12-s44-foco">{e.texto}</p>
        <div className="q12-s44-ops" role="group" aria-label="Diagnóstico">
          {COLUNAS.map((c) => <button key={c.v} type="button" className="q7-prev-op" aria-pressed={d === c.v} disabled={d !== null} data-estado={d === c.v ? (c.v === e.certa ? "certa" : "errada") : undefined} onClick={() => escolher(c.v)}>{c.r}</button>)}
        </div>
        {d !== null && (
          <div className="q12-s44-ret">
            <p className="q7-retorno" data-tom={d === e.certa ? "certa" : "errada"} aria-live="polite"><b>{d === e.certa ? `Certo: ${NOME[e.certa]}.` : `Não: ${NOME[d]} não explica.`}</b> {d === e.certa ? e.porque : e.erro[d]}</p>
            {d !== e.certa ? <Botao sec onClick={() => setDiag({ ...diag, [sel]: null })}>Tentar outra</Botao>
              : prox && <Botao onClick={() => setSel(prox.id)}>Próxima evidência</Botao>}
          </div>
        )}
        <p className="q7-nota q12-s44-ap">Na figura por safra (<LinkSlide slug="c12p51">slide {SLIDE.c12p51.n}</LinkSlide>), as faixas de menor risco sobem já na safra anterior à linha do período fora do tempo: também compatível com mudança na população.</p>
        <div className="q7-botoes"><Botao sec onClick={() => { setDiag(VAZIO); setSel(EVID[0].id); }} desab={EVID.every((x) => diag[x.id] === null) && sel === EVID[0].id}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

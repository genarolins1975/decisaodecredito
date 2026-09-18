"use client";
import { useMemo, useSyncExternalStore } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import ref from "@/lib/visuais/memorando.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { fmtReais } from "@/lib/visuais/economia";
import { avaliarCarteira, POLITICA } from "@/lib/visuais/politica";
import { wilson } from "@/lib/visuais/arvore";
import { diferencaProporcoes } from "@/lib/visuais/monitoramento";
import { assinarLab, decodificarLab, decodificarMemo, gravarMemo, lerLab, lerMemo, type CampoMemo, type Memo } from "@/lib/visuais/lab-estado";

/**
 * O memorando de cinco campos (capítulo 10, c10p5 a c10p9). Um campo por página, escrito neste navegador e guardado
 * em lab10.memo: o texto, os cinco itens que a rubrica procura, o medidor de completude e, à direita, o material
 * que a evidência do curso oferece para aquele campo. A política congelada no capítulo 8 entra no campo 1.
 */
export const CAMPOS: { k: CampoMemo; n: number; nome: string; rot: string; label: string; itens: string[] }[] = [
  { k: "recomendacao", n: 1, nome: "recomendação", rot: "Campo 1 de 5: recomendação", label: "Escreva a recomendação em até cinco linhas: modelo, corte, faixa de revisão, capacidade e por quanto tempo a decisão vale.",
    itens: ["Nomeia o modelo principal e o modelo mantido em paralelo", "Traz corte, teto da faixa de revisão e capacidade em números", "Declara a finalidade da PD: ordenar, precificar ou provisionar", "Declara a validade da decisão e a data da próxima revisão", "Diz quem assina e quem executa"] },
  { k: "evidencia", n: 2, nome: "evidência", rot: "Campo 2 de 5: evidência", label: "Liste a evidência que sustenta a recomendação. Cada número com amostra, denominador e origem.",
    itens: ["Toda métrica vem de amostra que não participou do ajuste", "Ordenação e calibração aparecem separadas, e não como um índice só", "Cada proporção usada para decidir vem com intervalo e denominador", "O resultado econômico vem da mesma carteira e fecha pela ponte", "A estabilidade da entrada vem com os cortes congelados no treino"] },
  { k: "incerteza", n: 3, nome: "incerteza", rot: "Campo 3 de 5: incerteza", label: "Escreva o que a evidência não decide. Diga onde ela é fraca e o que ainda pode inverter a recomendação.",
    itens: ["A comparação de ordenação é apresentada com intervalo, não com rótulo de vencedor", "O tamanho da amostra fora do tempo e o número de defaults estão escritos", "O viés de seleção da base de aprovados está declarado", "A base é sintética e isso está dito no corpo do memorando", "Nenhuma associação é apresentada como causa"] },
  { k: "condicoes", n: 4, nome: "condições", rot: "Campo 4 de 5: condições", label: "Escreva as condições de aprovação: o que precisa existir antes da entrada em produção e o que suspende a decisão.",
    itens: ["Condição sobre motivo de recusa individual, exigível por regulação", "Condição sobre validação independente, com escopo e prazo", "Condição sobre monotonicidade nas variáveis com direção econômica clara", "Condição de suspensão: o que faz a decisão voltar ao comitê antes do prazo", "Cada condição tem responsável nomeado e data"] },
  { k: "plano", n: 5, nome: "plano", rot: "Campo 5 de 5: plano de acompanhamento", label: "Traga o plano do capítulo 9: indicadores, limiar, janela, responsável e ação, mais o que o painel não vê.",
    itens: ["Um indicador para deslocamento de entrada", "Um indicador para mudança de nível", "Um indicador para mudança de relação, em safra madura", "Pelo menos um indicador que não espera rótulo", "O que o painel não mede, escrito como limitação e não omitido"] },
];
export const MINIMO = 120;
const FENOMENOS = [
  { k: "entrada", nome: "Deslocamento de entrada", como: "índice de estabilidade do escore e por característica, sem esperar rótulo" },
  { k: "nivel", nome: "Mudança de nível", como: "razão entre PD média prevista e default observado, em safra madura" },
  { k: "relacao", nome: "Mudança de relação", como: "ordenação por faixa em safra madura, comparada com a validação" },
  { k: "rapido", nome: "Sem espera de rótulo", como: "pelo menos um indicador que dispare antes da maturação da safra, porque o rótulo demora doze meses" },
  { k: "equidade", nome: "Equidade", como: "diferença de aprovação entre grupos declarados, com denominador e intervalo" },
];
const N = oot.y.length, D = oot.y.reduce((s: number, v: number) => s + v, 0);

/** Situação de um campo: itens marcados, caracteres e se está completo pela regra da rubrica. */
export function situacao(memo: Memo, k: CampoMemo): { marcados: number; n: number; completo: boolean } {
  const campo = CAMPOS.find((c) => c.k === k)!;
  const marcados = (memo.itens?.[k] ?? []).filter(Boolean).length; const n = (memo.textos?.[k] ?? "").trim().length;
  return { marcados, n, completo: marcados === campo.itens.length && n >= MINIMO };
}

export function Memorando({ campo }: { campo: 1 | 2 | 3 | 4 | 5 }) {
  const c = CAMPOS[campo - 1];
  const brutoMemo = useSyncExternalStore(assinarLab, lerMemo, () => "{}");
  const brutoLab = useSyncExternalStore(assinarLab, lerLab, () => "{}");
  const memo = useMemo(() => decodificarMemo(brutoMemo), [brutoMemo]);
  const lab = useMemo(() => decodificarLab(brutoLab), [brutoLab]);
  const texto = memo.textos?.[c.k] ?? ""; const itens = c.itens.map((_, i) => !!memo.itens?.[c.k]?.[i]);
  const s = situacao(memo, c.k);
  const gravar = (parcial: Partial<Memo>) => gravarMemo({ ...memo, ...parcial });
  const setTexto = (v: string) => gravar({ textos: { ...memo.textos, [c.k]: v } });
  const setItem = (i: number, v: boolean) => { const arr = [...itens]; arr[i] = v; gravar({ itens: { ...memo.itens, [c.k]: arr } }); };
  const r1 = lab.rodada1;
  const pol = useMemo(() => (r1 ? { ...POLITICA, corte: r1.corte, teto: Math.max(r1.teto, r1.corte), capacidade: r1.capacidade } : POLITICA), [r1]);
  const av = useMemo(() => avaliarCarteira(oot, pol), [pol]);
  const estado = s.completo
    ? `Campo completo. ${c.itens.length} de ${c.itens.length} itens declarados e ${s.n} caracteres escritos. A rubrica ainda pode reprovar este campo se o texto afirmar mais do que a evidência sustenta. Marcar item não é o mesmo que cumprir item, e o revisor lê o texto, não as caixas.`
    : `Campo incompleto. ${s.marcados} de ${c.itens.length} itens declarados e ${s.n} caracteres escritos. Faltam ${c.itens.length - s.marcados} itens${s.n < MINIMO ? " e o texto ainda está curto para ser avaliável" : ""}.`;
  return (
    <figure className="vz" data-vz={`memorando-${campo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Memorando do comitê · {c.rot.toLowerCase()} · guardado neste navegador</p>
          <p className="vz-tit">{TITULOS[campo - 1]}</p>
        </div>
        <div className="vz-memo-mapa" role="img" aria-label={`Cinco campos: ${CAMPOS.map((q) => `${q.nome} ${situacao(memo, q.k).completo ? "completo" : "incompleto"}`).join(", ")}`}>
          {CAMPOS.map((q) => { const sq = situacao(memo, q.k); return <span key={q.k} className={`vz-memo-pag ${q.k === c.k ? "vz-memo-pag--atual" : ""} ${sq.completo ? "vz-memo-pag--ok" : ""}`}><b>{q.n}</b><i style={{ width: `${Math.min(100, (sq.n / MINIMO) * 100)}%` }} /><small>{sq.marcados}/5</small></span>; })}
        </div>
      </header>
      <div className={`vz-estado ${s.completo ? "vz-estado--ok" : s.marcados === 0 && s.n === 0 ? "" : "vz-estado--alterado"}`}><b>{estado.split(".")[0]}.</b>{estado.slice(estado.indexOf(".") + 1)}</div>
      <div className="vz-memo-grade">
        <div className="vz-memo-escrita">
          <label className="vz-memo-label" htmlFor={`memo_${c.k}`}>{c.label}</label>
          <textarea id={`memo_${c.k}`} className="vz-memo-texto" rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva aqui. O texto fica neste navegador e entra na síntese do capítulo." />
          <div className="vz-memo-medidor" aria-hidden="true"><span className="vz-tdc-trilho"><span className={`vz-tdc-fill ${s.n >= MINIMO ? "vz-tdc-fill--ok" : "vz-tdc-fill--ouro"}`} style={{ width: `${Math.min(100, (s.n / MINIMO) * 100)}%` }} /></span><small>{s.n} de {MINIMO} caracteres para ser avaliável</small></div>
          <p className="eyebrow vz-memo-rot">O que a rubrica procura neste campo</p>
          <div className="vz-memo-itens">
            {c.itens.map((it, i) => <label key={it} className={`vz-memo-item ${itens[i] ? "vz-memo-item--on" : ""}`}><input type="checkbox" checked={itens[i]} onChange={(e) => setItem(i, e.target.checked)} /> <span>{it}</span></label>)}
          </div>
        </div>
        <div className="vz-memo-lado">
          {campo === 1 && <Campo1 pol={pol} congelada={!!lab.rodada1} aprovados={av.aprovados} esperado={av.esperado} />}
          {campo === 2 && <Campo2 pol={pol} aprovados={av.aprovados} esperado={av.esperado} perdaSobreExp={av.perda / av.exposicao} />}
          {campo === 3 && <Campo3 />}
          {campo === 4 && <Campo4 />}
          {campo === 5 && <Campo5 cobertura={memo.cobertura ?? []} setCobertura={(v) => gravar({ cobertura: v })} />}
        </div>
      </div>
      <p className="vz-fonte">Regra de completude da rubrica: os cinco itens declarados e pelo menos {MINIMO} caracteres. O texto e as marcações ficam em lab10.memo neste navegador, campo a campo, e a síntese do capítulo os reúne. Números do material: janela fora do tempo de {N} propostas com {D} defaults; política de referência com corte 12,0%, teto 30,0% e capacidade 80.</p>
    </figure>
  );
}

const TITULOS = [
  "Uma recomendação é executável quando traz modelo, parâmetros, finalidade, validade e responsável.",
  "Evidência de comitê é um número que um terceiro consegue recalcular: amostra, denominador e fonte em cada linha.",
  "A incerteza é declarada com número, não com adjetivo, e diz o que inverteria a decisão.",
  "Aprovar com condições só é diferente de aprovar quando cada condição tem verificação, responsável e data.",
  "O plano de acompanhamento cobre os três fenômenos, dispara antes do rótulo e declara o que não vê.",
];

function Campo1({ pol, congelada, aprovados, esperado }: { pol: typeof POLITICA; congelada: boolean; aprovados: number; esperado: number }) {
  return <>
    <div className="vz-tile"><p className="eyebrow">O material disponível para este campo</p>
      <table className="table text-[.85em] vz-esc-usos"><tbody>
        <tr><th scope="row">Modelo com melhor calibração fora do tempo</th><td>logística com WoE, Brier {fmtNum(ref.logit.brier, 5)}</td></tr>
        <tr><th scope="row">Modelo desafiante</th><td>boosting calibrado por Platt, Brier {fmtNum(ref.gbm.brier, 5)}</td></tr>
        <tr><th scope="row">Corte da política {congelada ? "congelada" : "de referência"}</th><td>{fmtPct(pol.corte, 1)}</td></tr>
        <tr><th scope="row">Teto da faixa de revisão</th><td>{fmtPct(pol.teto, 1)}</td></tr>
        <tr><th scope="row">Capacidade de revisão</th><td>{pol.capacidade} por janela</td></tr>
        <tr><th scope="row">Aprovados e resultado esperado</th><td>{aprovados} de {N}, {fmtReais(esperado)}</td></tr>
      </tbody></table>
      <p className="hint">{congelada ? "Valores lidos da política que você congelou no capítulo 8 neste navegador." : "Nenhuma política foi congelada no capítulo 8 neste navegador. Os valores acima são a referência declarada do curso, e o memorando precisa dizer isso."}</p></div>
    <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Versão que a rubrica reprova</p><p className="vz-num vz-num--texto">Recomendamos manter o modelo atual, que tem desempenho satisfatório, e ajustar o corte conforme o apetite de risco da instituição.</p><p className="hint">Nenhum número, nenhuma finalidade, nenhum prazo e nenhum responsável. Não é executável nem revisável, e ninguém consegue dizer daqui a um ano se foi cumprida.</p></div>
    <div className="vz-tile vz-tile--ok"><p className="eyebrow">Versão que passa</p><p className="vz-num vz-num--texto">Recomendamos manter a logística com WoE como modelo principal de PD em 12 meses, para ordenar e precificar, com o boosting calibrado mantido em paralelo como desafiante. Política: aprovação automática até PD de {fmtPct(pol.corte, 1)}, faixa de revisão até {fmtPct(pol.teto, 1)} com capacidade de {pol.capacidade} casos por janela, recusa acima disso. A decisão vale por dois ciclos de safra madura ou até que um gatilho do campo 5 dispare, o que vier primeiro. Assina o comitê de crédito, executa a área de política de crédito, e a validação independente emite parecer antes da entrada em produção.</p></div>
  </>;
}

function Campo2({ pol, aprovados, esperado, perdaSobreExp }: { pol: typeof POLITICA; aprovados: number; esperado: number; perdaSobreExp: number }) {
  const w = wilson(D, N);
  const linhas = [
    ["Ordenação", `AUC de ${fmtNum(ref.logit.auc, 4)} na janela fora do tempo de ${N} propostas, contra ${fmtNum(ref.gbm.auc, 4)} do desafiante na mesma janela`],
    ["Calibração, nível", `PD média prevista de ${fmtPct(ref.logit.pd_media, 2)} contra frequência observada de ${fmtPct(ref.logit.obs, 2)}, com ${D} defaults em ${N} propostas e intervalo de Wilson de ${fmtPct(w.lo, 2)} a ${fmtPct(w.hi, 2)}`],
    ["Calibração, agregado", `Brier de ${fmtNum(ref.logit.brier, 5)} e log loss de ${fmtNum(ref.logit.logloss, 5)}, mesma janela`],
    ["Economia", `com corte de ${fmtPct(pol.corte, 1)} e capacidade de ${pol.capacidade}, ${aprovados} aprovados de ${N}, resultado esperado de ${fmtReais(esperado)} e perda esperada de ${fmtPct(perdaSobreExp, 2)} da exposição, com as cinco parcelas fechando pela ponte`],
    ["Estabilidade", `índice de estabilidade do escore de ${fmtNum(ref.psi.valor, 4)}, com ${ref.psi.faixas} faixas congeladas no treino, contra limiar de 0,10 declarado antes da medição`],
    ["Procedência", `base sintética de ${ref.meta.n.toLocaleString("pt-BR")} propostas, semente ${ref.meta.seed}, data de referência ${ref.meta.data}, com ${ref.meta.treino.toLocaleString("pt-BR")} no treino, ${ref.meta.validacao} na validação e ${ref.meta.oot} fora do tempo`],
  ];
  return <>
    <div className="vz-tile"><p className="eyebrow">Linhas prontas para citação, já na forma correta</p>
      <table className="table text-[.85em] vz-esc-usos"><tbody>{linhas.map((l) => <tr key={l[0]}><th scope="row">{l[0]}</th><td>{l[1]}</td></tr>)}</tbody></table></div>
    <div className="vz-tile vz-tile--alerta"><p className="eyebrow">O que reprova neste campo</p><p className="vz-num vz-num--texto">Métrica sem amostra, do tipo o modelo tem AUC de 0,82. Esse número existe no material do curso, é a AUC de treino do boosting, e a configuração que o produz tem a pior AUC fora do tempo da grade inteira do capítulo 6. Métrica de treino apresentada como resultado é o erro mais caro desta lista.</p></div>
    <div className="vz-tile vz-tile--ok"><p className="eyebrow">O teste que o campo precisa passar</p><p className="vz-num vz-num--texto">Entregue este campo a alguém que não participou da modelagem, com acesso à base, e pergunte se ela consegue reproduzir cada número. Se qualquer linha exigir uma conversa com o autor, ela ainda não está no formato de evidência.</p></div>
  </>;
}

function Campo3() {
  const w = wilson(D, N); const g1 = ref.grupos.G1, g2 = ref.grupos.G2;
  const d = diferencaProporcoes(Math.round(g1.taxaAprov * g1.n), g1.n, Math.round(g2.taxaAprov * g2.n), g2.n);
  const fontes = [
    ["Comparação de ordenação", `${fmtNum(ref.comparacao.diferenca, 4)}, erro padrão ${fmtNum(ref.comparacao.erro_padrao, 4)}, intervalo de ${fmtNum(ref.comparacao.ic95[0], 4)} a ${fmtNum(ref.comparacao.ic95[1], 4)}`, "a diferença de ordenação entre os dois modelos não é distinguível de zero com esta amostra, e a recomendação não se apoia nela"],
    ["Nível do risco na janela", `${fmtPct(ref.logit.obs, 2)}, intervalo de ${fmtPct(w.lo, 2)} a ${fmtPct(w.hi, 2)}, ${D} defaults em ${N}`, "a frequência observada é conhecida com folga de mais de dois pontos percentuais, o que limita qualquer conclusão fina sobre calibração de nível"],
    ["Faixa recusada pela política", `taxa de aprovação de ${fmtPct(ref.taxaAprovacao)}`, "não existe evidência sobre o comportamento na faixa que a política vigente não deixa passar, e nenhuma técnica cria esse dado"],
    ["Diferença entre grupos declarados", `${fmtNum(100 * d.dif, 1)} pp, intervalo de ${fmtNum(100 * d.lo, 1)} a ${fmtNum(100 * d.hi, 1)} pp`, `a diferença medida entre os grupos declarados tem intervalo que ${d.excluiZero ? "exclui" : "inclui"} o zero nesta janela, e o poder de detecção com este denominador é baixo`],
  ];
  return <>
    <div className="vz-tile"><p className="eyebrow">As quatro fontes de incerteza desta decisão</p>
      <table className="table text-[.85em] vz-memo-fontes"><thead><tr><th>Fonte</th><th>Número que a mede</th><th>Como escrever</th></tr></thead><tbody>{fontes.map((f) => <tr key={f[0]}><th scope="row">{f[0]}</th><td className="vz-t-forte">{f[1]}</td><td>{f[2]}</td></tr>)}</tbody></table>
      <p className="hint">A base é sintética e isso precisa estar escrito no corpo do memorando, não em nota de rodapé. Os números de prevalência da faixa recusada só existem porque o gerador conhece o desfecho de quem foi recusado, e em carteira real eles não existiriam.</p></div>
    <div className="vz-tile vz-tile--ok"><p className="eyebrow">A frase que fecha o campo</p><p className="vz-num vz-num--texto">A recomendação seria revista se qualquer uma destas três coisas acontecesse: a diferença de ordenação medida em uma segunda janela fora do tempo passasse a excluir zero com folga, a razão entre PD média prevista e default observado saísse da banda de 0,80 a 1,25 em duas safras maduras seguidas, ou a coleta de desfecho na faixa recusada mostrasse relação diferente da estimada entre aprovados.</p><p className="hint">Este é o item que separa incerteza declarada de incerteza ornamental: dizer o que inverteria a decisão obriga a decisão a ser falseável.</p></div>
  </>;
}

function Campo4() {
  const cond = [
    ["Motivo de recusa individual disponível", "a recusa precisa ser informada ao cliente, e isso independe da escolha de modelo", "amostra de cem recusas com as três principais contribuições por proposta, conferidas por área independente"],
    ["Parecer de validação independente antes da produção", "quem estima não valida; o capítulo 6 mostrou como a escolha por amostra errada altera o resultado", "parecer escrito com escopo, amostra usada e conclusão, arquivado antes da primeira decisão em produção"],
    ["Monotonicidade imposta onde há direção econômica clara", "o desafiante pode estimar relação não monótona sem hipótese que a sustente", "efeito parcial por variável, com a direção conferida contra a hipótese declarada antes da estimação"],
    ["Desenho de coleta na faixa recusada", "toda a evidência vem de aprovados, e a expansão de crédito acontece justamente fora dessa faixa", "protocolo de aprovação deliberada em amostra pequena e limitada, com teto de exposição e prazo"],
    ["Cláusula de suspensão", "sem ela, a decisão só volta ao comitê quando alguém se lembrar", "qualquer gatilho do campo 5 disparado suspende o corte automático e devolve o assunto ao comitê na reunião seguinte"],
  ];
  return <>
    <div className="vz-tile"><p className="eyebrow">Condições que esta evidência torna obrigatórias</p>
      <table className="table text-[.85em] vz-memo-fontes"><thead><tr><th>Condição</th><th>Por que ela existe</th><th>Como se verifica</th></tr></thead><tbody>{cond.map((f) => <tr key={f[0]}><th scope="row">{f[0]}</th><td>{f[1]}</td><td>{f[2]}</td></tr>)}</tbody></table>
      <p className="hint">A referência de processo aqui é o arcabouço de gestão de risco de crédito, que trata modelo como insumo de um processo com governança, e não como o processo inteiro. Diretriz internacional vale pela transposição do regulador local, e o memorando precisa citar a norma aplicável, não a diretriz.</p></div>
    <div className="vz-tile vz-tile--alerta"><p className="eyebrow">A condição que não é condição</p><p className="vz-num vz-num--texto">Aprovado com a recomendação de que a equipe acompanhe o desempenho. Sem verificação, sem responsável, sem data e sem consequência, essa linha não restringe nada, e o comitê aprovou sem condição acreditando que aprovou com condição.</p></div>
  </>;
}

function Campo5({ cobertura, setCobertura }: { cobertura: string[]; setCobertura: (v: string[]) => void }) {
  const tem = (k: string) => cobertura.includes(k);
  const faltam = FENOMENOS.filter((f) => !tem(f.k));
  const alternar = (k: string) => setCobertura(tem(k) ? cobertura.filter((x) => x !== k) : [...cobertura, k]);
  return <>
    <div className="vz-tile"><p className="eyebrow">Cobertura do seu plano · marque o que o plano escrito à esquerda cobre</p>
      <div className="vz-memo-itens">{FENOMENOS.map((f) => <label key={f.k} className={`vz-memo-item ${tem(f.k) ? "vz-memo-item--on" : ""}`}><input type="checkbox" checked={tem(f.k)} onChange={() => alternar(f.k)} /> <span><b>{f.nome}:</b> {f.como}</span></label>)}</div>
      <p className={`hint ${faltam.length ? "vz-t-default" : "vz-t-ok"}`}>{faltam.length === 0 ? "Os três fenômenos têm leitura, existe indicador rápido e a equidade está coberta. Cada indicador ainda precisa de limiar, janela, responsável e ação." : `Sem cobertura para: ${faltam.map((f) => f.nome.toLowerCase()).join(", ")}. Um fenômeno sem leitura não é acompanhado, é esperado.`}</p></div>
    <div className="vz-tile"><p className="eyebrow">Os quatro campos de cada gatilho</p>
      <table className="table text-[.85em] vz-esc-usos"><tbody>
        <tr><th scope="row">Limiar</th><td>escrito antes da medição, e não ajustado depois de conhecido o número</td></tr>
        <tr><th scope="row">Janela</th><td>o período de medição e quantas janelas seguidas confirmam o disparo</td></tr>
        <tr><th scope="row">Responsável</th><td>uma área nomeada, e não o comitê inteiro</td></tr>
        <tr><th scope="row">Ação</th><td>o que se faz no disparo, incluindo a hipótese de não fazer nada até o laudo ficar pronto</td></tr>
      </tbody></table></div>
    <div className="vz-tile vz-tile--alerta"><p className="eyebrow">O que precisa aparecer como limitação</p><p className="vz-num vz-num--texto">Dois sinais do capítulo 9 não estão instrumentados nesta base: a taxa de exceção manual sobre o planejado e a perda dado o default realizada contra a premissa declarada. Sinal sem instrumento não sai do relatório: ele fica escrito como pendência, com prazo de instrumentação. Retirar da lista o que não se consegue medir é a forma mais silenciosa de um painel ficar verde.</p></div>
  </>;
}

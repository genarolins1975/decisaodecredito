"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { avaliarCarteira, CHOQUE, POLITICA, sobChoque, type Avaliacao } from "@/lib/visuais/politica";
import { fmtReais } from "@/lib/visuais/economia";
import { wilson } from "@/lib/visuais/arvore";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { assinarLab, decodificarLab, gravarLab, lerLab, type EstadoLab } from "@/lib/visuais/lab-estado";

/**
 * A mesa do comitê (capítulo 10). Rodada 1 (c10p11): a política na tela, congelada pela turma. Choque (c10p12): funding,
 * perda no default e PD deslocada, com o estado sempre visível. Rodada 2 (c10p13): o que a reação recupera e o que não
 * recupera. O estado (política congelada, choque ligado, rodada 2) fica gravado neste navegador e aparece nas três páginas.
 */
export type ModoMesa = "rodada1" | "choque" | "rodada2";
type Estado = EstadoLab;
const OPS = { pd: oot.pd as number[], ead: oot.ead as number[], y: oot.y as number[], pt: oot.pt as number[] };
const OPS_CHOQUE = { ...OPS, pd: sobChoque(OPS.pd), pt: sobChoque(OPS.pt) };
const PAR_CHOQUE = { funding: CHOQUE.funding, lgd: CHOQUE.lgd };
const ler = lerLab, gravar = gravarLab, assinar = assinarLab;

export function MesaSobChoque({ modo = "choque" }: { modo?: ModoMesa }) {
  // estado gravado neste navegador (política congelada, choque, rodada 2), lido como fonte externa para não divergir entre páginas
  const bruto = useSyncExternalStore(assinar, ler, () => "{}");
  const estado = useMemo<Estado>(() => decodificarLab(bruto), [bruto]);
  const [edicao, setEdicao] = useState<{ corte: number; teto: number; capacidade: number } | null>(null);
  const [edicao2, setEdicao2] = useState<{ corte: number; capacidade: number } | null>(null);
  const salvar = (patch: Estado) => gravar({ ...estado, ...patch });
  const r1 = useMemo(() => estado.rodada1 ?? { corte: POLITICA.corte, teto: POLITICA.teto, capacidade: POLITICA.capacidade }, [estado.rodada1]);
  const { corte, teto, capacidade } = edicao ?? r1;
  const setCorte = (v: number) => setEdicao({ corte: v, teto: Math.max(v, teto), capacidade });
  const setTeto = (v: number) => setEdicao({ corte, teto: Math.max(corte, v), capacidade });
  const setCapacidade = (v: number) => setEdicao({ corte, teto, capacidade: v });
  const corte2 = edicao2?.corte ?? estado.rodada2?.corte ?? POLITICA.corte; const cap2 = edicao2?.capacidade ?? estado.rodada2?.capacidade ?? POLITICA.capacidade;
  const setCorte2 = (v: number) => setEdicao2({ corte: v, capacidade: cap2 }); const setCap2 = (v: number) => setEdicao2({ corte: corte2, capacidade: v });
  const pronto = true;
  const choque = modo === "rodada1" ? false : !!estado.choque;
  const politica = useMemo(() => (modo === "rodada1" ? { corte, teto, capacidade } : r1), [modo, corte, teto, capacidade, r1]);
  const base = useMemo(() => avaliarCarteira(OPS, politica), [politica]);
  const sob = useMemo(() => avaliarCarteira(OPS_CHOQUE, { ...r1, ...PAR_CHOQUE }), [r1]);
  const atual = choque ? sob : base;
  const r2 = useMemo(() => avaliarCarteira(choque ? OPS_CHOQUE : OPS, { ...r1, corte: corte2, capacidade: cap2, ...(choque ? PAR_CHOQUE : {}) }), [choque, r1, corte2, cap2]);
  const curva = useMemo(() => { const cortes = Array.from({ length: 24 }, (_, i) => 0.02 + i * 0.02); return cortes.map((c) => ({ c, base: avaliarCarteira(OPS, { ...r1, corte: c }).esperado, choque: avaliarCarteira(OPS_CHOQUE, { ...r1, corte: c, ...PAR_CHOQUE }).esperado })); }, [r1]);
  const w = wilson(atual.defaultsAprovados, atual.aprovados);

  return (
    <figure className="vz" data-vz={`mesa-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A mesa do comitê · 737 propostas fora do tempo · política em três zonas · o motor da aula</p>
          <p className="vz-tit">{modo === "rodada1" ? "Rodada 1: a política na tela, cada parcela fechada, e o contra-argumento antes de congelar." : modo === "choque" ? "O choque entra na mesa, e o estado dele fica visível daqui em diante. Nunca há choque em silêncio." : "Rodada 2: o que mudou, o que não mudou e o que a reação recupera. Parte do choque não volta."}</p>
        </div>
        <div className="vz-acoes">
          {modo === "rodada1" && <button type="button" className="btn btn-sm" onClick={() => salvar({ rodada1: { corte, teto, capacidade } })}>Congelar a rodada 1</button>}
          {modo === "choque" && <button type="button" className={`btn btn-sm ${choque ? "btn-secondary" : ""}`} onClick={() => salvar({ choque: !choque })}>{choque ? "Voltar ao cenário base" : "Aplicar o choque"}</button>}
          {modo === "rodada2" && <button type="button" className="btn btn-sm" onClick={() => salvar({ rodada2: { corte: corte2, capacidade: cap2 } })}>Congelar a rodada 2</button>}
        </div>
      </header>
      <div className={`vz-estado ${choque ? "vz-estado--choque" : ""}`}><b>Estado do cenário: {choque ? "sob choque." : "base."}</b> {choque ? `Funding em ${fmtPct(CHOQUE.funding)}, perda no default em ${fmtPct(CHOQUE.lgd)} e PD deslocada em +${fmtNum(CHOQUE.deslocamento, 2)} em log odds.` : "Nenhum choque aplicado. Funding em 12%, perda no default em 65% e PD do modelo sem deslocamento."} Política {modo === "rodada1" ? "em edição" : estado.rodada1 ? "congelada na rodada 1" : "de referência do curso (nenhuma rodada 1 congelada neste navegador)"}: corte {fmtPct(politica.corte, 1)}, teto {fmtPct(politica.teto, 1)}, capacidade {politica.capacidade}.{pronto && modo !== "rodada1" && estado.rodada2 && ` Rodada 2 congelada: corte ${fmtPct(estado.rodada2.corte, 1)}, capacidade ${estado.rodada2.capacidade}.`}</div>

      {modo === "rodada1" && <div className="vz-mesa-grade">
        <div className="vz-mesa-controles">
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte de aprovação automática</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={2} max={30} step={0.5} value={corte * 100} onChange={(e) => setCorte(Number(e.target.value) / 100)} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Teto da faixa de revisão</span><span className="vz-slider-valor">{fmtPct(teto, 1)}</span></span><input type="range" min={5} max={60} step={1} value={teto * 100} onChange={(e) => setTeto(Number(e.target.value) / 100)} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Capacidade de revisão por janela</span><span className="vz-slider-valor">{capacidade}</span></span><input type="range" min={0} max={300} step={10} value={capacidade} onChange={(e) => setCapacidade(Number(e.target.value))} /></label>
          <Ponte a={base} />
        </div>
        <div className="vz-mesa-painel">
          <Tiles a={base} w={w} />
          <div className="vz-tile"><p className="eyebrow">Os cinco papéis da mesa</p><ul className="vz-mesa-papeis"><li><b>Negócio</b> volume, conversão e relacionamento</li><li><b>Risco</b> perda esperada e apetite declarado</li><li><b>Modelagem</b> ordenação, calibração e estabilidade</li><li><b>Operações</b> capacidade da esteira e custo por caso revisado</li><li><b>Governança</b> documentação, validação independente e gatilhos</li></ul><p className="hint">Ninguém nesta mesa representa o cliente: a regulação e o motivo de recusa fazem esse papel.</p></div>
        </div>
      </div>}

      {modo === "choque" && <div className="vz-mesa-grade">
        <div>
          <p className="vz-grafico-t">Efeito sobre a política {estado.rodada1 ? "congelada na rodada 1" : "de referência"} <span className="hint">o resultado realizado não entra: o desfecho observado é do passado e não foi deslocado</span></p>
          <Comparacao colunas={[{ rot: "Cenário base", a: base }, { rot: "Sob o choque", a: sob }]} variacao />
          <Curva curva={curva} marcas={[{ c: r1.corte, rot: "corte da rodada 1" }]} />
        </div>
        <div className="vz-mesa-painel">
          <div className="vz-tile"><p className="eyebrow">O choque desta rodada</p><ul className="vz-mesa-papeis"><li><b>Custo de funding</b> de 12% para 21%</li><li><b>Perda dado o default</b> de 65% para 80%</li><li><b>PD de toda a carteira</b> deslocada em 0,30 em log odds, sobre a PD do modelo e sobre a PD verdadeira do gerador</li><li><b>Notícia sem número</b> uma campanha comercial mudou o perfil de quem chega, e essa informação não está na carteira já observada</li></ul></div>
          <div className="vz-tile"><p className="eyebrow">Custo de não reagir</p><p className={`vz-num ${sob.esperado - base.esperado < 0 ? "vz-num--default" : ""}`}>{fmtReais(sob.esperado - base.esperado)}</p><p className="hint">manter o corte de {fmtPct(r1.corte, 1)} sob o choque leva o resultado de {fmtReais(base.esperado)} para {fmtReais(sob.esperado)}: é o que a rodada 2 tenta recuperar, e o limite do que a reação devolve</p></div>
          <div className="vz-tile"><p className="eyebrow">A notícia que não move número nenhum</p><p className="vz-num vz-num--texto">A carteira fora do tempo já foi observada e não contém a campanha. Nenhuma célula se move, e mesmo assim ela obriga a perguntar se o treino ainda representa a população futura: o deslocamento de entrada do capítulo 9.</p></div>
        </div>
      </div>}

      {modo === "rodada2" && <div className="vz-mesa-grade">
        <div>
          <div className="vz-mesa-controles vz-mesa-controles--linha">
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Novo corte</span><span className="vz-slider-valor">{fmtPct(corte2, 1)}</span></span><input type="range" min={2} max={30} step={0.5} value={corte2 * 100} onChange={(e) => setCorte2(Number(e.target.value) / 100)} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Nova capacidade de revisão</span><span className="vz-slider-valor">{cap2}</span></span><input type="range" min={0} max={300} step={10} value={cap2} onChange={(e) => setCap2(Number(e.target.value))} /></label>
          </div>
          <Comparacao colunas={[{ rot: "Rodada 1, cenário base", a: base }, { rot: `Rodada 1 mantida no cenário ${choque ? "sob choque" : "base"}`, a: atual }, { rot: "Rodada 2", a: r2 }]} />
          <Curva curva={curva} marcas={[{ c: r1.corte, rot: "rodada 1" }, { c: corte2, rot: "rodada 2" }]} />
        </div>
        <div className="vz-mesa-painel">
          <div className="vz-tile"><p className="eyebrow">O que a reação recuperou</p><p className={`vz-num ${r2.esperado - atual.esperado >= 0 ? "" : "vz-num--default"}`}>{fmtReais(r2.esperado - atual.esperado)}</p><p className="hint">manter a rodada 1 no cenário atual dá {fmtReais(atual.esperado)}; a rodada 2 dá {fmtReais(r2.esperado)}</p></div>
          <div className="vz-tile"><p className="eyebrow">A distância que permanece</p><p className={`vz-num ${base.esperado - r2.esperado > 0 ? "vz-num--default" : ""}`}>{fmtReais(r2.esperado - base.esperado)}</p><p className="hint">{choque ? "parte do choque não é recuperável movendo o corte, porque funding e perda no default encarecem toda proposta aprovada" : "sem choque aplicado na página anterior, as três colunas estão no cenário base e a rodada 2 só faz sentido com o choque ligado"}</p></div>
          <div className="vz-tile"><p className="eyebrow">Qual premissa caiu</p><p className="vz-num vz-num--texto">{choque ? "A de que o custo de cada proposta aprovada era o do cenário base. A ordenação do modelo não caiu: a fila é a mesma, o nível e o preço mudaram." : "Nenhuma ainda: aplique o choque para testar a premissa que sustentava a rodada 1."}</p></div>
        </div>
      </div>}
      <p className="vz-fonte">Motor da aula: aprovação automática até o corte, revisão manual até o teto com capacidade limitada atendendo primeiro o menos arriscado (o revisor observa um sinal ruidoso da PD verdadeira do gerador, qualidade 0,6, R$ 90 por caso), recusa acima. Corte 12%, teto 30% e capacidade 80: 548 aprovados e R$ 607 mil; sob o choque, 461 aprovados e −R$ 225 mil, os números das páginas.</p>
    </figure>
  );
}

function Tiles({ a, w }: { a: Avaliacao; w: { lo: number; hi: number } }) {
  return (
    <div className="vz-tiles">
      <div className="vz-tile"><p className="eyebrow">Aprovados</p><p className="vz-num">{a.aprovados}</p><p className="hint">{fmtPct(a.aprovados / 737)} de 737 · {a.revisados} revisados</p></div>
      <div className="vz-tile"><p className="eyebrow">Resultado esperado</p><p className={`vz-num ${a.esperado < 0 ? "vz-num--default" : ""}`}>{fmtReais(a.esperado)}</p><p className="hint">líquido de {fmtReais(a.revisoes)} de revisões</p></div>
      <div className="vz-tile"><p className="eyebrow">Perda esperada</p><p className="vz-num">{fmtPct(a.exposicao ? a.perda / a.exposicao : 0, 2)}</p><p className="hint">da exposição aprovada de {fmtReais(a.exposicao)}</p></div>
      <div className="vz-tile"><p className="eyebrow">Default observado entre aprovados</p><p className="vz-num">{a.defaultsAprovados} em {a.aprovados}</p><p className="hint">Wilson de {fmtPct(w.lo, 2)} a {fmtPct(w.hi, 2)}</p></div>
    </div>
  );
}

function Ponte({ a }: { a: Avaliacao }) {
  const linhas = [["Receita esperada, ponderada por não default", a.receitaEsp], ["Perda esperada", -a.perda], ["Custo de funding", -a.funding], ["Custo operacional", -a.operacao], ["Custo de capital", -a.capital], ["Custo das revisões", -a.revisoes]] as const;
  return (
    <div className="table-wrap"><table className="table text-[.85em] vz-mesa-ponte"><tbody>{linhas.map(([r, v]) => <tr key={r}><th scope="row">{r}</th><td className={v < 0 ? "vz-t-baixo" : ""}>{fmtReais(v)}</td></tr>)}<tr className="vz-t-on"><th scope="row">Resultado esperado</th><td>{fmtReais(a.esperado)}</td></tr></tbody></table><p className="hint">As parcelas fecham sem folga: a soma é o resultado.</p></div>
  );
}

function Comparacao({ colunas, variacao }: { colunas: { rot: string; a: Avaliacao }[]; variacao?: boolean }) {
  const linhas: { rot: string; f: (a: Avaliacao) => number; fmt: (v: number) => string; dif?: (v: number) => string }[] = [
    { rot: "Aprovados", f: (a) => a.aprovados, fmt: (v) => String(Math.round(v)), dif: (v) => `${v < 0 ? "menos" : "mais"} ${Math.abs(Math.round(v))}` },
    { rot: "Taxa de aprovação", f: (a) => a.aprovados / 737, fmt: (v) => fmtPct(v, 1), dif: (v) => `${v < 0 ? "menos" : "mais"} ${fmtPct(Math.abs(v), 1)}` },
    { rot: "Exposição aprovada", f: (a) => a.exposicao, fmt: fmtReais, dif: (v) => `${v < 0 ? "menos" : "mais"} ${fmtReais(Math.abs(v))}` },
    { rot: "Perda esperada", f: (a) => a.perda, fmt: fmtReais, dif: (v) => `${v < 0 ? "menos" : "mais"} ${fmtReais(Math.abs(v))}` },
    { rot: "Perda esperada sobre exposição", f: (a) => (a.exposicao ? a.perda / a.exposicao : 0), fmt: (v) => fmtPct(v, 2), dif: (v) => `${v < 0 ? "menos" : "mais"} ${fmtPct(Math.abs(v), 2)}` },
    { rot: "Resultado esperado", f: (a) => a.esperado, fmt: fmtReais, dif: (v) => `${v < 0 ? "menos" : "mais"} ${fmtReais(Math.abs(v))}` },
  ];
  return (
    <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Medida</th>{colunas.map((c) => <th key={c.rot}>{c.rot}</th>)}{variacao && <th>Variação</th>}</tr></thead>
      <tbody>{linhas.map((l) => { const vs = colunas.map((c) => l.f(c.a)); const d = vs[vs.length - 1] - vs[0]; return <tr key={l.rot}><th scope="row">{l.rot}</th>{vs.map((v, i) => <td key={i}>{l.fmt(v)}</td>)}{variacao && <td className={d < 0 ? "vz-t-baixo" : "vz-t-ok"}>{l.dif ? l.dif(d) : ""}</td>}</tr>; })}</tbody></table></div>
  );
}

function Curva({ curva, marcas }: { curva: { c: number; base: number; choque: number }[]; marcas: { c: number; rot: string }[] }) {
  const W = 560, H = 220, ML = 70, MR = 16, MT = 14, MB = 36;
  const vals = curva.flatMap((p) => [p.base, p.choque]); const lo = Math.min(...vals, 0), hi = Math.max(...vals);
  const sx = (c: number) => ML + ((c - 0.02) / 0.46) * (W - ML - MR); const sy = (v: number) => MT + (1 - (v - lo) / (hi - lo)) * (H - MT - MB);
  const d = (k: "base" | "choque") => curva.map((p, i) => `${i ? "L" : "M"}${sx(p.c).toFixed(1)} ${sy(p[k]).toFixed(1)}`).join("");
  return (
    <div className="vz-grafico vz-mesa-curva">
      <p className="vz-grafico-t">Resultado esperado por corte, teto e capacidade da rodada 1 <span className="hint">escuro: cenário base · vermelho: sob o choque</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Resultado esperado por corte, base e sob choque">
        {[lo, 0, hi].filter((v, i, a) => a.indexOf(v) === i).map((v) => <g key={v}><line x1={sx(0.02)} x2={sx(0.48)} y1={sy(v)} y2={sy(v)} className={v === 0 ? "vz-zero" : "vz-grade"} /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtReais(v)}</text></g>)}
        {[0.05, 0.1, 0.2, 0.3, 0.4].map((c) => <text key={c} x={sx(c)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(c)}</text>)}
        <text x={sx(0.25)} y={H - 6} textAnchor="middle" className="vz-rotulo">corte de aprovação automática</text>
        <path d={d("base")} className="vz-curva" /><path d={d("choque")} className="vz-curva vz-curva--choque" />
        {marcas.map((m, i) => <g key={m.rot}><line x1={sx(m.c)} x2={sx(m.c)} y1={sy(hi)} y2={sy(lo)} className="vz-corte" /><text x={sx(m.c) + 4} y={sy(hi) + 12 + i * 14} className="vz-tick vz-tick--ouro">{m.rot} {fmtPct(m.c, 1)}</text></g>)}
      </svg>
    </div>
  );
}

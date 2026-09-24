"use client";
import { useState } from "react";
import { ATALHOS, base, comparacaoPassos, DEFINICAO, DEFINICAO_TEX, fmtDesloc, fmtOdds, fmtPd, fmtPdCurta, fmtPp, fmtZ, IDENTIDADE, IDENTIDADE_TEX, JANELA_Z, leitura, NOTA_LEGENDA, NOTA_PD, NOTA_Z, PD_INICIAL, posicaoPd, posicaoZ, REGUA_PD, REGUA_Z, RODAPE, ROTULO_ATALHOS, ROTULO_COMPARAR, SUBTITULO, TICKS_PD, TICKS_Z, TITULO, TITULO_CTL, TITULO_GRAF, validarPd, type Cenario, type Validacao } from "@/lib/visuais/escala-logodds";
import { Tex } from "./tex";

/**
 * Slide 5 do capítulo 4 (c4p5): a escala de log odds. Quadro 16:9 no sistema .rl, na gramática do c4p2: faixa da
 * identidade, gráfico à esquerda, painel de controle à direita e três cartões na base. O gráfico são duas réguas com
 * os mesmos três cenários (odds ÷ 2, partida, odds × 2): em PD os passos só empatam na partida de 50%, em log odds
 * valem ∓ln(2) sempre. "Comparar os dois passos" espelha o passo ÷ 2 para o lado do × 2 e pinta a diferença.
 * Contas em src/lib/visuais/escala-logodds.ts; aqui só geometria, rótulos e estado.
 */
type Faixa = { cab: number; cab2: number | null; rot: number; y: number; tick: number };
type Geo = { w: number; h: number; x0: number; x1: number; pd: Faixa; z: Faixa; leg: number; fonteRot: number; compacta: boolean };
/** Duas geometrias para as mesmas réguas: a larga da leitura e da projeção, a compacta do celular, onde o texto
 *  precisa de mais unidades do viewBox para continuar legível. A consulta de contêiner decide qual aparece. */
const LARGA: Geo = { w: 1180, h: 560, x0: 64, x1: 1116, pd: { cab: 40, cab2: null, rot: 114, y: 150, tick: 190 }, z: { cab: 270, cab2: null, rot: 344, y: 380, tick: 420 }, leg: 502, fonteRot: 28, compacta: false };
const COMPACTA: Geo = { w: 400, h: 452, x0: 34, x1: 366, pd: { cab: 28, cab2: 56, rot: 106, y: 134, tick: 166 }, z: { cab: 226, cab2: 254, rot: 304, y: 332, tick: 364 }, leg: 426, fonteRot: 22, compacta: true };
const largura = (t: string, fonte: number) => t.length * fonte * 0.56 + 4; // estimativa para rótulos em negrito

type Marca = { chave: Cenario["chave"]; x: number; texto: string; fora: boolean };

/** Rótulos dos três pontos: o da partida é centrado, os extremos apontam para fora; some o que não couber. */
function rotulos(marcas: Marca[], g: Geo) {
  const caixa = (m: Marca) => {
    const w = largura(m.texto, g.fonteRot);
    return m.chave === "partida" ? [m.x - w / 2, m.x + w / 2] : m.chave === "menor" ? [m.x - 14 - w, m.x - 14] : [m.x + 14, m.x + 14 + w];
  };
  const cp = caixa(marcas.find((m) => m.chave === "partida")!);
  return marcas.map((m) => {
    if (m.chave === "partida") return { ...m, mostra: true };
    const c = caixa(m);
    return { ...m, mostra: !m.fora && c[0] >= g.x0 - 30 && c[1] <= g.x1 + 30 && (c[1] < cp[0] - 8 || c[0] > cp[1] + 8) };
  });
}

function Regua({ g, tipo, tres, comparar, iguais }: { g: Geo; tipo: "pd" | "z"; tres: Cenario[]; comparar: boolean; iguais: boolean }) {
  const f = g[tipo];
  const sx = (t: number) => g.x0 + t * (g.x1 - g.x0);
  const tz = (v: number) => (v - JANELA_Z[0]) / (JANELA_Z[1] - JANELA_Z[0]);
  const marcas = rotulos(tres.map((c) => {
    const q = tipo === "pd" ? posicaoPd(c.p) : posicaoZ(c.z);
    return { chave: c.chave, x: sx(q.t), texto: tipo === "pd" ? fmtPd(c.p) : fmtZ(c.z), fora: q.fora };
  }), g);
  const [m, pt, M] = marcas;
  const [cm, , cM] = tres;
  const todos = tipo === "pd" ? TICKS_PD.map((t) => ({ x: sx(t), texto: `${t * 100}%` }))
    : TICKS_Z.map((v) => ({ x: sx(tz(v)), texto: v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0" }));
  const ticks = g.compacta ? todos.filter((_, i) => i === 0 || i === todos.length - 1 || i === (todos.length - 1) / 2) : todos;
  const passos = tipo === "pd" ? [fmtPp(cm.deltaPd), fmtPp(cM.deltaPd)] : [fmtDesloc(cm.deltaZ), fmtDesloc(cM.deltaZ)];
  const igual = tipo === "z" || iguais;
  const veredito = tipo === "z" ? "iguais" : iguais ? "iguais só em 50%" : "desiguais";
  const espelho = pt.x + (pt.x - m.x); // o passo ÷ 2 levado para o lado do × 2
  const nome = tipo === "pd" ? REGUA_PD : REGUA_Z;
  const nota = tipo === "pd" ? NOTA_PD : NOTA_Z;
  const linhaPassos = (
    <><tspan className="lo-v--menor">{passos[0]}</tspan> e <tspan className="lo-v--maior">{passos[1]}</tspan>: <tspan className={igual ? "lo-v--iguais" : "lo-v--desiguais"}>{veredito}</tspan></>
  );
  return (
    <g className={`lo-regua lo-regua--${tipo}`}>
      {f.cab2 === null ? <>
        <text x={g.x0} y={f.cab} className="lo-cab-t">{nome}{nota && <tspan className="lo-cab-n"> · {nota}</tspan>}</text>
        <text x={g.x1} y={f.cab} textAnchor="end" className="lo-cab-v">{linhaPassos}</text>
      </> : <>
        <text x={g.x0} y={f.cab} className="lo-cab-t">{nome}</text>
        <text x={g.x0} y={f.cab2} className="lo-cab-v">{linhaPassos}</text>
      </>}
      <line x1={g.x0} x2={g.x1} y1={f.y} y2={f.y} className="lo-eixo" />
      {tipo === "pd"
        ? <><line x1={g.x0} x2={g.x0} y1={f.y - 15} y2={f.y + 15} className="lo-parede" /><line x1={g.x1} x2={g.x1} y1={f.y - 15} y2={f.y + 15} className="lo-parede" /></>
        : <><path d={`M${g.x0 - 24} ${f.y} l14 -8 v16 z`} className="lo-seta" /><path d={`M${g.x1 + 24} ${f.y} l-14 -8 v16 z`} className="lo-seta" /></>}
      {ticks.map((t) => <g key={t.texto}><line x1={t.x} x2={t.x} y1={f.y} y2={f.y + 10} className="lo-tick-l" /><text x={t.x} y={f.tick} textAnchor="middle" className="lo-tick">{t.texto}</text></g>)}
      <rect x={Math.min(m.x, pt.x)} y={f.y - 8} width={Math.max(2, Math.abs(pt.x - m.x))} height={16} rx={3} className="lo-barra lo-barra--menor" />
      <rect x={Math.min(pt.x, M.x)} y={f.y - 8} width={Math.max(2, Math.abs(M.x - pt.x))} height={16} rx={3} className="lo-barra lo-barra--maior" />
      {comparar && <>
        {Math.abs(M.x - espelho) >= 1 && <rect x={Math.min(M.x, espelho)} y={f.y - 8} width={Math.abs(M.x - espelho)} height={16} className="lo-dif" />}
        <rect x={pt.x} y={f.y - 16} width={Math.max(2, espelho - pt.x)} height={32} rx={4} className="lo-espelho" />
      </>}
      {marcas.map((k) => (
        <g key={k.chave} className={`lo-ponto lo-ponto--${k.chave} ${k.fora ? "lo-ponto--fora" : ""}`}>
          <circle cx={k.x} cy={f.y} r={k.chave === "partida" ? 13 : 10} />
          {k.mostra && <text x={k.chave === "partida" ? k.x : k.chave === "menor" ? k.x - 14 : k.x + 14} y={f.rot} textAnchor={k.chave === "partida" ? "middle" : k.chave === "menor" ? "end" : "start"} className="lo-rot">{k.texto}</text>}
        </g>
      ))}
    </g>
  );
}

function Legenda({ g, comparar, foraJanela }: { g: Geo; comparar: boolean; foraJanela: boolean }) {
  const itens = g.compacta ? [["menor", "÷ 2"], ["partida", "Partida"], ["maior", "× 2"]] : [["menor", "Odds ÷ 2"], ["partida", "Partida"], ["maior", "Odds × 2"]];
  const passo = g.compacta ? 104 : 150;
  const fimItens = itens.length * passo + 8;
  return (
    <g className="lo-leg" transform={`translate(${g.x0}, ${g.leg})`}>
      {itens.map(([c, t], i) => <g key={c} transform={`translate(${i * passo}, 0)`}><circle cx={9} cy={-7} r={9} className={`lo-leg-c lo-leg-c--${c}`} /><text x={26} y={0}>{t}</text></g>)}
      {!g.compacta && (comparar
        ? <g transform={`translate(${fimItens}, 0)`}>
            <rect x={0} y={-19} width={36} height={24} rx={4} className="lo-espelho" /><text x={46} y={0}>passo ÷ 2 espelhado</text>
            <rect x={266} y={-15} width={30} height={16} className="lo-dif" /><text x={306} y={0}>diferença</text>
          </g>
        : <text x={fimItens} y={0}>· {foraJanela ? "fora da janela de −6 a +6, os valores estão no painel" : NOTA_LEGENDA}</text>)}
    </g>
  );
}

function Reguas({ g, tres, comparar, iguais, rotulo }: { g: Geo; tres: Cenario[]; comparar: boolean; iguais: boolean; rotulo: string }) {
  const foraJanela = tres.some((c) => posicaoZ(c.z).fora);
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className={`lo-svg lo-svg--${g.compacta ? "compacta" : "larga"}`} role="img" aria-label={rotulo}>
      <Regua g={g} tipo="pd" tres={tres} comparar={comparar} iguais={iguais} />
      <Regua g={g} tipo="z" tres={tres} comparar={comparar} iguais={iguais} />
      <Legenda g={g} comparar={comparar} foraJanela={foraJanela} />
    </svg>
  );
}

function Campo({ mostrado, onValor }: { mostrado: string; onValor: (v: number) => void }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [msg, setMsg] = useState<{ tipo: "erro" | "aviso"; texto: string } | null>(null);
  // valor mudado de fora (atalho, controle deslizante, restaurar): o campo acompanha e o aviso antigo sai
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); setMsg(null); }
  const aplicar = (t: string) => { const r: Validacao = validarPd(t); if (r.ok) { onValor(r.valor); setMsg(r.aviso ? { tipo: "aviso", texto: r.aviso } : null); } else setMsg({ tipo: "erro", texto: r.erro }); };
  return (
    <div className="lo-campo">
      <label htmlFor="lo-pd">PD de partida, campo em %</label>
      <span className="lo-campo-in">
        <input id="lo-pd" type="text" inputMode="decimal" value={texto} aria-invalid={msg?.tipo === "erro"} aria-describedby="lo-pd-msg"
          onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); setUltimo(mostrado); if (msg?.tipo === "erro") setMsg(null); }}
          onChange={(e) => { setTexto(e.target.value); aplicar(e.target.value); }} />
        <span>%</span>
      </span>
      <p id="lo-pd-msg" className={`lo-msg ${msg ? `lo-msg--${msg.tipo}` : ""}`} aria-live="polite">{msg?.texto ?? ""}</p>
    </div>
  );
}

export function EscalaLogOdds({ pagina }: { pagina?: { index: number; total: number } }) {
  const [p, setP] = useState(PD_INICIAL);
  const [comparar, setComparar] = useState(false);
  const lei = leitura(p);
  const tres = [lei.menor, lei.partida, lei.maior];
  const comp = comparacaoPassos(p);
  const cartoes = base(p);
  const restaurar = () => { setP(PD_INICIAL); setComparar(false); };
  const rotulo = `Réguas de PD e de log odds com a partida em ${fmtPd(p)}. ${lei.frasePd} ${lei.fraseZ}`;
  return (
    <figure className="vz rl lo" data-vz="escala-logodds">
      <section className="rl-slide" data-tela="5">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Log odds"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="lo-eq">
          <div><p className="lo-eq-k">A identidade</p><span className="lo-eq-f" role="img" aria-label={IDENTIDADE}><Tex f={IDENTIDADE_TEX} /></span></div>
          <div><p className="lo-eq-k">Definição</p><span className="lo-eq-u" role="img" aria-label={DEFINICAO}><Tex f={DEFINICAO_TEX} /></span></div>
        </div>

        <div className="rl-corpo lo-corpo">
          <div className="lo-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="lo-svg-wrap">
              <Reguas g={LARGA} tres={tres} comparar={comparar} iguais={lei.iguais} rotulo={rotulo} />
              <Reguas g={COMPACTA} tres={tres} comparar={comparar} iguais={lei.iguais} rotulo={rotulo} />
            </div>
          </div>

          <aside className="lo-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="lo-ctl">
              <div className="lo-ctl-topo">
                <label htmlFor="lo-range"><b>PD de partida:</b> {fmtPdCurta(p)}</label>
                <div className="lo-atalhos" role="group" aria-label="Atalhos de PD de partida">
                  <span>{ROTULO_ATALHOS}</span>
                  {ATALHOS.map((a) => { const on = Math.abs(a - p) < 1e-9; return <button key={a} type="button" className={`rl-btn rl-btn--mini ${on ? "rl-btn--on" : ""}`} aria-pressed={on} onClick={() => setP(a)}>{fmtPdCurta(a)}</button>; })}
                </div>
              </div>
              <input id="lo-range" type="range" min={1} max={99} step={1} value={Math.min(99, Math.max(1, Math.round(p * 100)))} onChange={(e) => setP(Number(e.target.value) / 100)}
                aria-valuetext={`${fmtPd(p)}. ${lei.frasePd}`} />
            </div>
            <Campo mostrado={(p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} onValor={setP} />
            <table className="lo-tab">
              <thead><tr><th scope="col"><span className="sr-only">Cenário</span></th><th scope="col">odds</th><th scope="col">PD</th><th scope="col">log odds</th></tr></thead>
              <tbody>{tres.map((c) => <tr key={c.chave} className={`lo-lin lo-lin--${c.chave}`}><th scope="row">{c.rotulo}</th><td>{fmtOdds(c.odds)}</td><td>{fmtPd(c.p)}</td><td>{fmtZ(c.z)}</td></tr>)}</tbody>
            </table>
            {/* com a comparação ligada, a caixa da comparação ocupa o lugar da leitura: o veredito continua no alto de cada régua */}
            {!comparar && <div className="lo-lei-area" aria-live="polite">
              <p className={`lo-lei ${lei.iguais ? "" : "lo-lei--desiguais"}`}>{lei.frasePd}</p>
              <p className="lo-lei">{lei.fraseZ}</p>
            </div>}
            <div className="lo-acoes">
              <button type="button" className={`rl-btn rl-btn--mini ${comparar ? "rl-btn--on" : ""}`} aria-pressed={comparar} onClick={() => setComparar((v) => !v)}>{ROTULO_COMPARAR}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            {comparar && <div className="lo-comp-box" aria-live="polite"><p className="lo-comp-v">{comp.frase}</p></div>}
          </aside>
        </div>

        <div className="lo-base">
          {cartoes.map((k) => <div key={k.k}><p className="lo-base-k">{k.k}</p><p className="lo-base-t">{k.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}

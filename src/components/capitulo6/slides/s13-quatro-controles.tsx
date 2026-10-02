"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XA, XV, YA, YV, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { auc, estagios, perdaLog, type Opcoes } from "@/lib/capitulo6/gbm";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 14 · c6p13 · Laboratório dos quatro controles na carteira: taxa η, número de árvores, profundidade e mínimo por folha.
 * Cada combinação de η, profundidade e mínimo é ajustada ao vivo com gbm.ts (até 300 árvores, memorizada por modelo());
 * o número de árvores só corta os estágios. Perdas de ajuste e validação por árvore, com a validação da referência
 * (CFG_CARTEIRA, slide 12) em cinza; AUC de ajuste e de validação no ponto escolhido. A previsão (qual dos quatro freia
 * a complexidade quando aumenta) trava os controles até a resposta certa; o retorno de cada alternativa é calculado
 * com o par de ajustes que a prova, só quando ela é escolhida.
 */
const MAXA = CFG_CARTEIRA.arvores;
const ETAS = [0.05, 0.1, 0.2, 0.5], PROFS = [1, 2, 3, 4], MINS = [5, 20, 40, 160];
const DA = YA.reduce((s, v) => s + v, 0), DV = YV.reduce((s, v) => s + v, 0);
type Cfg = { eta: number; prof: number; min: number };
const REF: Cfg = { eta: CFG_CARTEIRA.eta, prof: CFG_CARTEIRA.profundidade, min: CFG_CARTEIRA.minFolha };
const opc = (c: Cfg): Opcoes => ({ ...CFG_CARTEIRA, eta: c.eta, profundidade: c.prof, minFolha: c.min });
const cacheP = new Map<string, { pa: number[]; pv: number[]; ea: number[][]; ev: number[][] }>();
/** Perdas por estágio de uma combinação (os estágios ficam guardados para a AUC no ponto escolhido). */
function perdas(c: Cfg) {
  const k = JSON.stringify(c); let r = cacheP.get(k);
  if (!r) { const mod = modelo(opc(c)); const ea = estagios(mod, XA), ev = estagios(mod, XV); r = { ea, ev, pa: ea.map((F) => perdaLog(F, YA)), pv: ev.map((F) => perdaLog(F, YV)) }; cacheP.set(k, r); }
  return r;
}
const pa300 = (c: Cfg) => perdas(c).pa[MAXA];

const OPS_T = ["Taxa de aprendizagem η", "Número de árvores", "Profundidade", "Mínimo de propostas por folha"];
/** Retorno de cada alternativa, calculado só quando ela é escolhida (dois ajustes por alternativa). */
function retorno(i: number) {
  if (i === 0) { const a = pa300({ ...REF, eta: ETAS[0] }), b = pa300({ ...REF, eta: ETAS[3] }); return <>Taxa maior soma mais de cada folha: com {MAXA} árvores, a perda de ajuste vai de {num(a, 3)} (η {num(ETAS[0], 2)}) a {num(b, 3)} (η {num(ETAS[3], 1)}). Acelera, não freia.</>; }
  if (i === 1) { const p = perdas(REF).pa; return <>Cada árvore a mais baixa a perda de ajuste: {num(p[50], 3)} com 50, {num(p[MAXA], 3)} com {MAXA} (<LinkSlide slug="c6p11">slide {SLIDE.c6p11.n}</LinkSlide>). Acelera, não freia.</>; }
  if (i === 2) { const a = pa300({ ...REF, prof: PROFS[0] }), b = pa300({ ...REF, prof: PROFS[3] }); return <>Árvore mais funda combina mais variáveis por folha (<LinkSlide slug="c6p12">slide {SLIDE.c6p12.n}</LinkSlide>): a perda de ajuste vai de {num(a, 3)} (profundidade {PROFS[0]}) a {num(b, 3)} ({PROFS[3]}). Acelera.</>; }
  const a = pa300({ ...REF, min: MINS[0] }), b = pa300({ ...REF, min: MINS[3] });
  return <>Isso: folha maior não pode isolar poucas propostas. A perda de ajuste <b>sobe</b> de {num(a, 3)} (mínimo {MINS[0]}) para {num(b, 3)} ({MINS[3]}).</>;
}

function Curva({ cfg, m, revelado }: { cfg: Cfg; m: number; revelado: boolean }) {
  const P = perdas(cfg), R = perdas(REF);
  const xs = Array.from({ length: MAXA + 1 }, (_, k) => k);
  return (
    <Grafico titulo="Perda (log loss) por número de árvores" sub={revelado ? "● ajuste · ▲ validação · cinza: validação da referência" : "● ajuste · ▲ validação"} rotulo={`Perda de ajuste e de validação por número de árvores com η ${num(cfg.eta, 2)}, profundidade ${cfg.prof} e mínimo ${cfg.min} por folha; com ${m} árvores, ajuste ${num(P.pa[m], 3)} e validação ${num(P.pv[m], 3)}`} arCelular="4 / 3">
      {(d) => {
        const g = margens(d.fs, { l: 3.4, r: 1, t: 0.8, b: 2.7 });
        const todos = [...P.pa, ...P.pv, ...(revelado ? R.pv : [])];
        const lo = Math.floor(Math.min(...todos) * 20) / 20, hi = Math.ceil(Math.max(...todos) * 20) / 20;
        const passo = hi - lo > 0.25 ? 0.1 : 0.05; const yt: number[] = []; for (let v = Math.ceil(lo / passo - 1e-9) * passo; v <= hi + 1e-9; v += passo) yt.push(Math.round(v * 100) / 100 + 0);
        const x = escala([0, MAXA], [g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
        const cl = (v: number) => Math.min(hi, Math.max(lo, v));
        const pts = (s: number[]) => xs.map((k) => ({ x: x(k), y: y(cl(s[k])) })); const r = d.fs * 0.36;
        const tri = (cx: number, cy: number, rr: number) => `M${cx} ${cy - rr}L${cx + rr * 0.95} ${cy + rr * 0.7}L${cx - rr * 0.95} ${cy + rr * 0.7}Z`;
        return (
          <g>
            <Eixos x={x} y={y} xt={[0, 50, 100, 150, 200, 250, 300]} yt={yt} fx={(v) => int(v)} fy={(v) => num(v, 2)} xTit="número de árvores somadas" />
            {revelado && <path className="q7-linha q7-linha--mudo q7-linha--fina" strokeDasharray="6 5" d={caminho(pts(R.pv))} />}
            <line x1={x(m)} x2={x(m)} y1={g.t} y2={d.h - g.b} stroke="#5B6475" strokeWidth={1.8} strokeDasharray="3 4" />
            <path className="q7-linha q7-linha--ink" d={caminho(pts(P.pa))} />
            <path className="q7-linha q7-linha--val" strokeDasharray="9 6" d={caminho(pts(P.pv))} />
            <circle cx={x(m)} cy={y(cl(P.pa[m]))} r={r} fill="#00205B" stroke="#fff" strokeWidth={2} />
            <path d={tri(x(m), y(cl(P.pv[m])), r * 1.25)} fill="#2E6B4F" stroke="#fff" strokeWidth={1.5} />
          </g>
        );
      }}
    </Grafico>
  );
}

export function S13QuatroControles({ pagina }: { pagina?: Pagina }) {
  const [cfg, setCfg] = useState<Cfg>(REF);
  const [m, setM] = useState(MAXA);
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc === 3;
  const ops = useMemo(() => OPS_T.map((t, i) => ({ texto: t, certa: i === 3, retorno: esc === i ? retorno(i) : null })), [esc]);
  const P = useMemo(() => perdas(cfg), [cfg]);
  const aa = useMemo(() => auc(YA, P.ea[m]), [P, m]), av = useMemo(() => auc(YV, P.ev[m]), [P, m]);
  const vmin = Math.min(...P.pv), imin = P.pv.indexOf(vmin);
  const muda = (k: keyof Cfg, v: number) => { if (revelado) setCfg((c) => ({ ...c, [k]: v })); };
  const ref = cfg.eta === REF.eta && cfg.prof === REF.prof && cfg.min === REF.min;
  return (
    <Quadro slug="c6p13" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Qual dos quatro controles freia a complexidade?"}
      sub={revelado ? undefined : "Taxa, número de árvores, profundidade e mínimo por folha: preveja antes de mexer."}
      conclusao={!revelado
        ? <>Referência do <LinkSlide slug="c6p11">slide {SLIDE.c6p11.n}</LinkSlide>: com {MAXA} árvores, perda de ajuste {num(P.pa[MAXA], 3)} e de validação {num(P.pv[MAXA], 3)}. Responda à previsão para liberar os controles.</>
        : <>{ref ? "Referência" : <>η {num(cfg.eta, 2)}, profundidade {cfg.prof}, mínimo {cfg.min}</>} com {m} árvores: ajuste {num(P.pa[m], 3)}, validação <b>{num(P.pv[m], 3)}</b>. A melhor validação desta combinação, escolhida na própria validação e por isso otimista, é {num(vmin, 3)}, com {imin} {imin === 1 ? "árvore" : "árvores"}{m > imin ? <>; as {m - imin} seguintes só baixam o ajuste</> : ""}. Taxa e árvores se compensam: <LinkSlide slug="c6p14">slide {SLIDE.c6p14.n}</LinkSlide>.</>}
      fonte={`Ajuste: ${int(NA)} propostas, ${DA} defaults; validação sorteada: ${int(NV)}, ${DV} defaults. Cada combinação ajustada ao vivo (gbm.ts), até ${MAXA} árvores; referência: η ${num(REF.eta, 1)}, profundidade ${REF.prof}, mínimo ${REF.min}.`}>
      <Painel>
        <Curva cfg={cfg} m={m} revelado={revelado} />
        <div className="q6-s13-ctl">
          <div><p className="q7-k">Taxa de aprendizagem</p><Seg rotulo="Taxa de aprendizagem" opcoes={ETAS.map((v) => ({ v, r: num(v, 2) }))} valor={cfg.eta} onChange={(v) => muda("eta", v)} cor desab={!revelado} /></div>
          <div><p className="q7-k">Profundidade</p><Seg rotulo="Profundidade" opcoes={PROFS.map((v) => ({ v, r: String(v) }))} valor={cfg.prof} onChange={(v) => muda("prof", v)} cor desab={!revelado} /></div>
          <div><p className="q7-k">Mínimo por folha</p><Seg rotulo="Mínimo de propostas por folha" opcoes={MINS.map((v) => ({ v, r: String(v) }))} valor={cfg.min} onChange={(v) => muda("min", v)} cor desab={!revelado} /></div>
          <Controle rotulo="Árvores" valor={m} min={1} max={MAXA} passo={1} onChange={(v) => revelado && setM(v)} mostrar={int(m)} />
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Perda de ajuste" valor={num(P.pa[m], 3)} tam="mini" />
          <Kpi rotulo="Perda de validação" valor={num(P.pv[m], 3)} tam="mini" tom="val" />
          <Kpi rotulo="AUC de ajuste" valor={num(aa, 3)} tam="mini" />
          <Kpi rotulo="AUC de validação" valor={num(av, 3)} tam="mini" tom="val" />
        </div>
        <Previsao pergunta="Qual dos quatro, quando aumenta, freia a complexidade?" opcoes={ops} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setCfg(REF); setM(MAXA); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}

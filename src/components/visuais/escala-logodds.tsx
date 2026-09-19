"use client";
import { useRef, useState } from "react";
import { ATALHOS, cenarios, curvaLogit, FAIXA_SLIDER, fmtDesloc, fmtOdds, fmtPd, fmtPp, fmtZ, IDENTIDADE, JANELA_Z, leitura, LN2, NOTA_CENTRO, NOTA_JANELA, NOTA_MODELO, PD_INICIAL, PERGUNTA, posicaoPd, posicaoZ, REVELACAO, TICKS_PD, TICKS_Z, validarPd, type Cenario, type Validacao } from "@/lib/visuais/escala-logodds";

/**
 * Escala 3, log odds (capítulo 4, c4p5). Uma PD de partida, as odds divididas e multiplicadas por 2 e as duas réguas
 * alinhadas: em PD os passos quase nunca têm o mesmo tamanho, em log odds são ∓ln(2) sempre. Contas em
 * src/lib/visuais/escala-logodds.ts; aqui só formatação, posição de rótulos e estado da interface.
 */
/** Duas geometrias para a mesma régua: a larga da leitura e da projeção, a compacta do celular, onde o texto
 *  precisa de mais unidades do viewBox para continuar legível. O container query decide qual aparece. */
const GEO = {
  larga: { w: 900, h: 116, l: 46, r: 876, yRot: 40, yEixo: 70, yTick: 92, fRot: 16, soPartida: false },
  compacta: { w: 360, h: 136, l: 27, r: 333, yRot: 50, yEixo: 86, yTick: 114, fRot: 21, soPartida: true },
} as const;
type Variante = keyof typeof GEO;
const GW = 760, GH = 380, GML = 62, GMR = 22, GMT = 34, GMB = 50;
const largura = (t: string, fonte: number) => t.length * fonte * 0.49 + 6; // estimativa para evitar rótulos sobrepostos

type Marca = { chave: Cenario["chave"]; t: number; texto: string; fora: boolean };

/** Rótulos dos marcadores: o de partida é centrado, os extremos apontam para fora; some o que não couber. */
function visiveis(marcas: (Marca & { x: number })[], v: Variante): Record<string, boolean> {
  const g = GEO[v];
  const caixa = (m: Marca & { x: number }) => {
    const w = largura(m.texto, g.fRot);
    if (m.chave === "partida") return [m.x - w / 2, m.x + w / 2] as const;
    if (m.chave === "menor") return [m.x - 9 - w, m.x - 9] as const;
    return [m.x + 9, m.x + 9 + w] as const;
  };
  const p = marcas.find((m) => m.chave === "partida")!;
  const cp = caixa(p);
  const ok: Record<string, boolean> = { partida: true };
  for (const m of marcas) {
    if (m.chave === "partida") continue;
    const c = caixa(m);
    ok[m.chave] = !g.soPartida && !m.fora && c[0] >= g.l - 6 && c[1] <= g.r + 6 && (c[1] < cp[0] - 6 || c[0] > cp[1] + 6);
  }
  return ok;
}

function Desenho({ id, variante, titulo, marcas, ticks }: { id: string; variante: Variante; titulo: string; marcas: (Marca & { rotuloCurto: string })[]; ticks: { t: number; texto: string }[] }) {
  const g = GEO[variante], span = g.r - g.l;
  const pos = marcas.map((k) => ({ ...k, x: g.l + k.t * span }));
  const mostra = visiveis(pos, variante);
  const acha = (c: Cenario["chave"]) => pos.find((k) => k.chave === c)!;
  const m = { menor: acha("menor"), partida: acha("partida"), maior: acha("maior") };
  const barras = [
    { de: Math.min(m.menor.x, m.partida.x), ate: Math.max(m.menor.x, m.partida.x), classe: "vz-lo-barra--menor" },
    { de: Math.min(m.partida.x, m.maior.x), ate: Math.max(m.partida.x, m.maior.x), classe: "vz-lo-barra--maior" },
  ];
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className={`vz-lo-svg vz-lo-svg--${variante}`} role="img" aria-labelledby={`${id}-${variante}-t`}>
      <title id={`${id}-${variante}-t`}>{`${titulo}. ${marcas.map((k) => `${k.rotuloCurto}: ${k.texto}`).join("; ")}.`}</title>
      <line x1={g.l} x2={g.r} y1={g.yEixo} y2={g.yEixo} className="vz-lo-eixo" />
      {ticks.map((t) => <g key={t.texto}><line x1={g.l + t.t * span} x2={g.l + t.t * span} y1={g.yEixo} y2={g.yEixo + 7} className="vz-lo-eixo" /><text x={g.l + t.t * span} y={g.yTick} textAnchor="middle" className="vz-lo-tick">{t.texto}</text></g>)}
      {barras.map((b) => <rect key={b.classe} x={b.de} y={g.yEixo - 5} width={Math.max(2, b.ate - b.de)} height={10} rx={2} className={`vz-lo-barra ${b.classe}`} />)}
      {pos.map((k) => <g key={k.chave} className={`vz-lo-marca vz-lo-marca--${k.chave}`}>
        <line x1={k.x} x2={k.x} y1={g.yRot + 8} y2={g.yEixo - 8} className="vz-lo-haste" />
        <circle cx={k.x} cy={g.yEixo} r={k.chave === "partida" ? 8 : 6.5} />
        {mostra[k.chave] && <text x={k.chave === "partida" ? k.x : k.chave === "menor" ? k.x - 9 : k.x + 9} y={g.yRot} textAnchor={k.chave === "partida" ? "middle" : k.chave === "menor" ? "end" : "start"} className="vz-lo-marca-t">{k.texto}</text>}
      </g>)}
    </svg>
  );
}

/** A régua sai em duas versões; o celular recebe a compacta, com menos rótulos e texto maior. */
function Regua({ id, titulo, nota, marcas, ticks, cor }: { id: string; titulo: string; nota: string; marcas: (Marca & { rotuloCurto: string })[]; ticks: { t: number; texto: string }[]; cor: "pd" | "z" }) {
  const passo = (ticks.length - 1) / 2;
  const poucos = ticks.filter((_, i) => i % passo === 0);
  return (
    <div className="vz-lo-regua" data-regua={cor}>
      <p className="vz-lo-regua-t"><b>{titulo}</b> <span className="vz-lo-regua-n">{nota}</span></p>
      <Desenho id={id} variante="larga" titulo={titulo} marcas={marcas} ticks={ticks} />
      <Desenho id={id} variante="compacta" titulo={titulo} marcas={marcas} ticks={poucos} />
    </div>
  );
}

function Campo({ mostrado, onValor }: { mostrado: string; onValor: (v: number) => void }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [msg, setMsg] = useState<{ tipo: "erro" | "aviso"; texto: string } | null>(null);
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); }
  const aplicar = (t: string) => { const r: Validacao = validarPd(t); if (r.ok) { onValor(r.valor); setMsg(r.aviso ? { tipo: "aviso", texto: r.aviso } : null); } else setMsg({ tipo: "erro", texto: r.erro }); };
  return (
    <div className="vz-lo-campo">
      <label htmlFor="lo-pd">PD de partida, campo em %</label>
      <span className="vz-lo-campo-in"><input id="lo-pd" type="text" inputMode="decimal" value={texto} aria-invalid={msg?.tipo === "erro"} aria-describedby="lo-pd-msg" onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); if (msg?.tipo === "erro") setMsg(null); }} onChange={(e) => { setTexto(e.target.value); aplicar(e.target.value); }} /><span>%</span></span>
      <p id="lo-pd-msg" className={`vz-lo-msg ${msg ? `vz-lo-msg--${msg.tipo}` : ""}`} aria-live="polite">{msg?.texto ?? ""}</p>
    </div>
  );
}

export function EscalaLogOdds({ palco = false }: { palco?: boolean }) {
  const [p, setP] = useState(PD_INICIAL);
  const [aba, setAba] = useState<"reguas" | "funcao">("reguas");
  const [revelado, setRevelado] = useState(false);
  const [notas, setNotas] = useState(false);
  const figRef = useRef<HTMLElement>(null);
  const { menor, partida, maior, iguais, frasePd, fraseZ } = leitura(p);
  const tres = [menor, partida, maior];
  const foraDaFaixa = p < FAIXA_SLIDER[0] || p > FAIXA_SLIDER[1];
  const restaurar = () => { setP(PD_INICIAL); setRevelado(false); setNotas(false); setAba("reguas"); };
  const marcasPd = tres.map((c) => { const q = posicaoPd(c.p); return { chave: c.chave, t: q.t, texto: fmtPd(c.p), fora: q.fora, rotuloCurto: c.rotulo }; });
  const marcasZ = tres.map((c) => { const q = posicaoZ(c.z); return { chave: c.chave, t: q.t, texto: fmtZ(c.z), fora: q.fora, rotuloCurto: c.rotulo }; });
  const foraJanela = marcasZ.some((k) => k.fora);
  const gx = (q: number) => GML + q * (GW - GML - GMR);
  const gy = (z: number) => GMT + (1 - (z - JANELA_Z[0]) / (JANELA_Z[1] - JANELA_Z[0])) * (GH - GMT - GMB);
  const curva = curvaLogit().map((q, i) => `${i ? "L" : "M"}${gx(q.p).toFixed(1)} ${gy(q.z).toFixed(1)}`).join("");
  return (
    <figure className="vz vz-lo" data-vz="escala-logodds" ref={figRef}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Regressão logística / Escala 3: log odds · ln(odds) · a escala em que somar faz sentido</p>
          <p className="vz-tit">Nas odds, multiplicar. Nos log odds, somar.</p>
          <p className="vz-lo-sub">Dividir e multiplicar por 2 geram deslocamentos de −ln(2) e +ln(2), qualquer que seja a PD inicial.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Exibição">
          <div className="vz-lo-abas" role="tablist" aria-label="Como ver a transformação">
            <button type="button" role="tab" id="lo-aba-reguas" aria-selected={aba === "reguas"} aria-controls="lo-painel-reguas" className={`btn btn-sm ${aba === "reguas" ? "" : "btn-secondary"}`} onClick={() => setAba("reguas")}>Réguas</button>
            <button type="button" role="tab" id="lo-aba-funcao" aria-selected={aba === "funcao"} aria-controls="lo-painel-funcao" className={`btn btn-sm ${aba === "funcao" ? "" : "btn-secondary"}`} onClick={() => setAba("funcao")}>Ver a função</button>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={restaurar}>Restaurar</button>
        </div>
      </header>

      <div className="vz-lo-controles">
        <label className="vz-slider vz-lo-slider"><span className="vz-slider-rotulo"><b>PD de partida</b> <span className="vz-slider-valor">{fmtPd(p)}</span></span>
          <input type="range" min={1} max={99} step={1} value={Math.min(99, Math.max(1, Math.round(p * 100)))} onChange={(e) => setP(Number(e.target.value) / 100)} aria-label="PD de partida" aria-valuetext={fmtPd(p)} /></label>
        <Campo mostrado={(p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} onValor={setP} />
        <div className="vz-lo-atalhos" role="group" aria-label="Atalhos de PD de partida">{ATALHOS.map((a) => <button key={a} type="button" className={`btn btn-sm ${Math.abs(a - p) < 1e-9 ? "" : "btn-secondary"}`} aria-pressed={Math.abs(a - p) < 1e-9} onClick={() => setP(a)}>{fmtPd(a).replace(",00", "")}</button>)}</div>
      </div>

      <div className="vz-lo-colunas" role="list" aria-label="Os três cenários">
        {tres.map((c) => <div key={c.chave} className={`vz-lo-col vz-lo-col--${c.chave}`} role="listitem">
          <p className="vz-lo-col-k">{c.rotulo}</p>
          <p className="vz-lo-col-f">{c.chave === "partida" ? `odds ${fmtOdds(partida.odds)}` : `odds ${fmtOdds(partida.odds)} ${c.chave === "menor" ? "÷" : "×"} 2 = ${fmtOdds(c.odds)}`}</p>
          <p className="vz-lo-col-pd">{fmtPd(c.p)}</p>
          <p className="vz-lo-col-sec"><span>odds</span> <b>{fmtOdds(c.odds)}</b> <span>log odds</span> <b>{fmtZ(c.z)}</b></p>
          <p className="vz-lo-col-d">{c.chave === "partida" ? "referência dos dois movimentos" : <>{fmtPp(c.deltaPd)} em PD · <b>{fmtDesloc(c.deltaZ)}</b> em log odds</>}</p>
        </div>)}
      </div>

      <div className={`vz-estado ${foraDaFaixa || foraJanela ? "vz-estado--alterado" : "vz-estado--ok"}`} aria-live="polite">
        <b>Partida em PD {fmtPd(p)}.</b> {frasePd} {fraseZ}{foraDaFaixa && " Valor fora da faixa do controle deslizante, mantido como digitado."}{foraJanela && " Um dos cenários está fora da janela de leitura das réguas; os valores exatos ficam nas colunas."}
      </div>

      <div className="vz-lo-grade">
        <div className="vz-lo-painel" id="lo-painel-reguas" role="tabpanel" aria-labelledby="lo-aba-reguas" hidden={aba !== "reguas"}>
          <Regua id="lo-r-pd" titulo="Probabilidade de default" nota="escala fixa de 0% a 100%" cor="pd" ticks={TICKS_PD.map((t) => ({ t, texto: `${t * 100}%` }))} marcas={marcasPd} />
          <p className="vz-lo-passos">
            <span className="vz-lo-chip vz-lo-chip--menor">Odds ÷ 2: <b>{fmtPp(menor.deltaPd)}</b></span>
            <span className="vz-lo-chip vz-lo-chip--maior">Odds × 2: <b>{fmtPp(maior.deltaPd)}</b></span>
            <span className="vz-lo-passos-l">{iguais ? "os dois passos têm o mesmo tamanho" : "os dois passos têm tamanhos diferentes"}</span>
          </p>
          <Regua id="lo-r-z" titulo="Log odds" nota={`janela de leitura de −${Math.abs(JANELA_Z[0])} a +${JANELA_Z[1]}`} cor="z" ticks={TICKS_Z.map((v) => ({ t: (v - JANELA_Z[0]) / (JANELA_Z[1] - JANELA_Z[0]), texto: v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0" }))} marcas={marcasZ} />
          <p className="vz-lo-passos">
            <span className="vz-lo-chip vz-lo-chip--menor">Odds ÷ 2: <b>{fmtDesloc(menor.deltaZ)}</b></span>
            <span className="vz-lo-chip vz-lo-chip--maior">Odds × 2: <b>{fmtDesloc(maior.deltaZ)}</b></span>
            <span className="vz-lo-passos-l">o mesmo ln(2) nos dois sentidos, para qualquer PD de partida</span>
          </p>
          <p className="hint vz-lo-janela">{NOTA_JANELA}</p>
        </div>

        <div className="vz-lo-painel vz-lo-painel--graf" id="lo-painel-funcao" role="tabpanel" aria-labelledby="lo-aba-funcao" hidden={aba !== "funcao"}>
          <p className="vz-grafico-t">log odds em função da PD <span className="hint">os três cenários, sincronizados com o controle</span></p>
          <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={`Função log odds da PD; partida ${fmtPd(p)} em ${fmtZ(partida.z)}, odds ÷ 2 em ${fmtZ(menor.z)}, odds × 2 em ${fmtZ(maior.z)}`}>
            {TICKS_Z.map((v) => <g key={v}><line x1={gx(0)} x2={gx(1)} y1={gy(v)} y2={gy(v)} className={v === 0 ? "vz-lo-zero" : "vz-lo-grade-l"} /><text x={GML - 8} y={gy(v) + 4} textAnchor="end" className="vz-lo-tick">{v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0"}</text></g>)}
            {TICKS_PD.map((v) => <text key={v} x={gx(v)} y={GH - GMB + 20} textAnchor="middle" className="vz-lo-tick">{v * 100}%</text>)}
            <text x={gx(0.5)} y={GH - 10} textAnchor="middle" className="vz-lo-eixo-t">probabilidade de default</text>
            <text x={GML - 46} y={16} className="vz-lo-eixo-t">log odds</text>
            <path d={curva} className="vz-lo-curva" />
            {tres.map((c) => { const q = posicaoPd(c.p); const x = gx(q.t), y = gy(Math.min(JANELA_Z[1], Math.max(JANELA_Z[0], c.z))); return <g key={c.chave} className={`vz-lo-gp vz-lo-gp--${c.chave}`}>
              <line x1={gx(0)} x2={x} y1={y} y2={y} className="vz-lo-guia" /><line x1={x} x2={x} y1={y} y2={GH - GMB} className="vz-lo-guia" />
              <circle cx={x} cy={y} r={c.chave === "partida" ? 8 : 6.5} />
            </g>; })}
            {/* a legenda fica no canto superior esquerdo, sempre vazio: a curva só chega ali em PD acima de 88% */}
            <g className="vz-lo-leg" transform={`translate(${GML + 14}, ${GMT + 10})`}>
              {tres.map((c, i) => { const z = posicaoZ(c.z); return <g key={c.chave} className={`vz-lo-gp--${c.chave}`} transform={`translate(0, ${i * 22})`}>
                <circle cx={7} cy={-4} r={6} /><text x={22} y={0} className="vz-lo-gp-t">{c.rotulo}: {fmtPd(c.p)} → {fmtZ(c.z)}{z.fora ? " (fora da janela)" : ""}</text>
              </g>; })}
            </g>
          </svg>
        </div>

        <aside className="vz-lo-lado">
          <p className="vz-lo-k">A identidade</p>
          <p className="vz-lo-id">{IDENTIDADE}</p>
          <p className="vz-lo-id-curta">Multiplicar as odds por 2 soma ln(2) = {fmtDesloc(LN2).replace("+", "")}; dividir por 2 subtrai o mesmo valor.</p>
          <p className="vz-lo-id-l">Multiplicar as odds por 2 soma ln(2) = {fmtDesloc(LN2).replace("+", "")} nos log odds. Dividir por 2 subtrai o mesmo valor. O fator vira parcela, e o ponto de partida não altera o tamanho da parcela.</p>
          <p className="vz-lo-k vz-lo-k--modelo">Por que isso importa</p>
          <p className="vz-lo-id-l">{NOTA_MODELO}</p>
          <button type="button" className="btn btn-sm btn-ghost vz-lo-notas-b" aria-expanded={notas} onClick={() => setNotas((v) => !v)}>{notas ? "Ocultar notas técnicas" : "Notas técnicas"}</button>
          {notas && <div className="vz-lo-notas">
            <p>{NOTA_CENTRO}</p>
            <p>Probabilidades complementares têm log odds opostos, uma relação diferente desta e tratada na escala anterior. Nada aqui afirma que a distribuição dos log odds de uma carteira seja simétrica.</p>
            <p>Dizer “dobrar a chance” sem dizer em qual escala é ambíguo: aqui o que dobra são as odds, não a probabilidade.</p>
          </div>}
        </aside>
      </div>

      <div className="vz-lo-rodape">
        <div>
          <p className="vz-lo-perg">{PERGUNTA}</p>
          {revelado && <p className="vz-lo-resp" data-testid="revelacao">{REVELACAO}</p>}
        </div>
        <button type="button" className={`btn btn-sm ${revelado ? "btn-secondary" : ""}`} aria-expanded={revelado} onClick={() => setRevelado((v) => !v)}>{revelado ? "Ocultar explicação" : "Revelar explicação"}</button>
      </div>
      {!palco && <p className="vz-fonte">odds = PD ÷ (1 − PD); log odds = ln(odds). Os dois cenários partem sempre das odds iniciais {fmtOdds(partida.odds)}: ÷ 2 e × 2, nunca aplicados em sequência. Exemplo ilustrativo; a soma em log odds descreve o efeito estimado, não estabelece causa.</p>}
    </figure>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { dia, entraPelaRegraIngenua, estadoDoCampo, rotuloDia, type EstadoCampo } from "@/lib/visuais/tempo";

/**
 * A linha do tempo do cliente (capítulo 3). Sete fatos de quatro fontes, cada um com a data em que ocorreu e a data em que
 * o banco passou a saber. Arraste a decisão: o que autoriza um campo é a disponibilidade, não o evento.
 */
type Fato = { fonte: string; nome: string; evento: number; disponibilidade: number; latencia: string };
const FATOS: Fato[] = [
  { fonte: "Cadastro interno", nome: "Renda declarada atualizada", evento: dia(20, 1), disponibilidade: dia(20, 1), latencia: "no ato" },
  { fonte: "Comportamento interno", nome: "Atraso de 12 dias na parcela", evento: dia(3, 3), disponibilidade: dia(4, 3), latencia: "1 dia" },
  { fonte: "Comportamento interno", nome: "Fatura de fevereiro fecha", evento: dia(28, 2), disponibilidade: dia(30, 4), latencia: "dois meses" },
  { fonte: "Bureau externo", nome: "Consulta ao bureau", evento: dia(10, 3), disponibilidade: dia(10, 3), latencia: "no ato" },
  { fonte: "Bureau externo", nome: "Novo apontamento", evento: dia(14, 3), disponibilidade: dia(19, 3), latencia: "5 dias" },
  { fonte: "SCR", nome: "Posição de janeiro", evento: dia(31, 1), disponibilidade: dia(11, 3), latencia: "40 dias" },
  { fonte: "SCR", nome: "Posição de fevereiro", evento: dia(28, 2), disponibilidade: dia(8, 4), latencia: "40 dias" },
];
const ALVO = { nome: "Atraso de 90 dias", evento: dia(20, 7) };
const D0 = dia(1, 1), D1 = dia(31, 7);
const ROTULO: Record<EstadoCampo, string> = { utilizavel: "utilizável", ocorreu_sem_saber: "já ocorreu, o banco ainda não sabe", futuro: "ainda não aconteceu" };
const W = 900, ML = 362, MR = 16, MT = 34, LH = 34, MB = 30; const XF = 8, XN = ML - 10; const HGT = MT + (FATOS.length + 1) * LH + MB;
const px = (d: number) => ML + ((d - D0) / (D1 - D0)) * (W - ML - MR);

export function LinhaDoTempo() {
  const [decisao, setDecisao] = useState(dia(15, 3));
  const [regra, setRegra] = useState<"disponibilidade" | "evento">("disponibilidade");
  const [tocando, setTocando] = useState(false);
  const estados = useMemo(() => FATOS.map((f) => estadoDoCampo(f.evento, f.disponibilidade, decisao)), [decisao]);
  const entra = (i: number) => (regra === "disponibilidade" ? estados[i] === "utilizavel" : entraPelaRegraIngenua(FATOS[i].evento, decisao));
  const nUtil = estados.filter((e) => e === "utilizavel").length;
  const nVaz = estados.filter((e) => e === "ocorreu_sem_saber").length;
  const nFut = estados.filter((e) => e === "futuro").length;
  const vazamentos = regra === "evento" ? nVaz : 0;

  useEffect(() => {
    if (!tocando) return;
    if (decisao >= dia(30, 6)) { const t = setTimeout(() => setTocando(false), 0); return () => clearTimeout(t); }
    const t = setTimeout(() => setDecisao((d) => d + 1), 55);
    return () => clearTimeout(t);
  }, [tocando, decisao]);

  const marcas = [dia(1, 1), dia(1, 2), dia(1, 3), dia(1, 4), dia(1, 5), dia(1, 6), dia(1, 7)];
  return (
    <figure className="vz" data-vz="linha-do-tempo">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A linha do tempo do cliente · sete fatos, quatro fontes · exemplo sintético</p>
          <p className="vz-tit">Arraste a decisão. O que entra é o que o banco sabia, não o que já tinha acontecido.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => { if (decisao >= dia(30, 6)) setDecisao(dia(1, 2)); setTocando((v) => !v); }} aria-pressed={tocando}>{tocando ? "Pausar" : "Mover a decisão pelo calendário"}</button>
          <div className="vz-seg" role="group" aria-label="Regra de inclusão">
            <button type="button" className={`vz-seg-b ${regra === "disponibilidade" ? "vz-seg-b--on" : ""}`} aria-pressed={regra === "disponibilidade"} onClick={() => setRegra("disponibilidade")}>Regra da disponibilidade</button>
            <button type="button" className={`vz-seg-b ${regra === "evento" ? "vz-seg-b--on" : ""}`} aria-pressed={regra === "evento"} onClick={() => setRegra("evento")}>Só a data do evento</button>
          </div>
        </div>
      </header>

      <svg className="vz-tempo-svg" viewBox={`0 0 ${W} ${HGT}`} role="img" aria-label={`Decisão em ${rotuloDia(decisao)}: ${nUtil} campos utilizáveis, ${nVaz} já ocorridos sem o banco saber, ${nFut} ainda não ocorridos`}>
        <rect x={px(decisao)} y={MT - 10} width={px(D1) - px(decisao)} height={HGT - MT - MB + 14} className="vz-futuro" />
        {marcas.map((m) => <g key={m}><line x1={px(m)} x2={px(m)} y1={MT - 10} y2={HGT - MB + 4} className="vz-grade" /><text x={px(m)} y={HGT - MB + 18} textAnchor="middle" className="vz-tick">{rotuloDia(m).replace("1 ", "")}</text></g>)}
        {FATOS.map((f, i) => {
          const y = MT + i * LH + LH / 2; const e = estados[i]; const ok = entra(i); const vaz = regra === "evento" && e === "ocorreu_sem_saber";
          return (
            <g key={i} className={`vz-fato vz-fato--${e} ${ok ? "vz-fato--entra" : ""} ${vaz ? "vz-fato--vazamento" : ""}`}>
              {(i === 0 || FATOS[i - 1].fonte !== f.fonte) && <text x={XF} y={y + 4} className="vz-fonte-rotulo">{f.fonte}</text>}
              <text x={XN} y={y + 4} textAnchor="end" className="vz-fato-nome">{f.nome}</text>
              <line x1={px(f.evento)} x2={px(f.disponibilidade)} y1={y} y2={y} className="vz-latencia" />
              <circle cx={px(f.evento)} cy={y} r={6} className="vz-evento" />
              <path d={`M${px(f.disponibilidade)} ${y - 7} l7 7 l-7 7 l-7 -7 z`} className="vz-disp" />
              {f.disponibilidade > f.evento && <text x={(px(f.evento) + px(f.disponibilidade)) / 2} y={y - 9} textAnchor="middle" className="vz-latencia-t">{f.latencia}</text>}
              <text x={px(f.disponibilidade) + 12} y={y + 4} className="vz-estado-t">{vaz ? "entrou sem o banco saber: vazamento" : ROTULO[e]}</text>
            </g>
          );
        })}
        {(() => { const y = MT + FATOS.length * LH + LH / 2; return (
          <g className="vz-fato vz-fato--alvo">
            <text x={XF} y={y + 4} className="vz-fonte-rotulo">Depois da decisão</text>
            <text x={XN} y={y + 4} textAnchor="end" className="vz-fato-nome">{ALVO.nome}</text>
            <circle cx={px(ALVO.evento)} cy={y} r={6} className="vz-evento" />
            <text x={px(ALVO.evento) - 12} y={y + 4} textAnchor="end" className="vz-estado-t">{ALVO.evento > decisao ? "é o alvo, nunca variável" : "já passou: a decisão aqui seria tarde demais"}</text>
          </g>
        ); })()}
        <line x1={px(decisao)} x2={px(decisao)} y1={MT - 14} y2={HGT - MB + 4} className="vz-decisao" />
        <text x={px(decisao)} y={MT - 18} textAnchor="middle" className="vz-decisao-t">decisão em {rotuloDia(decisao)}</text>
      </svg>
      <label className="vz-slider">
        <span className="vz-slider-rotulo"><b>Data da decisão</b> <span className="vz-slider-valor">{rotuloDia(decisao)}</span></span>
        <input type="range" min={dia(15, 1)} max={dia(15, 7)} step={1} value={decisao} onChange={(e) => { setTocando(false); setDecisao(Number(e.target.value)); }} aria-valuetext={rotuloDia(decisao)} />
      </label>
      <div className="vz-legenda"><span><i className="vz-sw vz-sw--evento" /> o fato ocorre</span><span><i className="vz-sw vz-sw--disp" /> o banco passa a saber</span><span><i className="vz-sw vz-sw--lat" /> latência declarada</span><span><i className="vz-sw vz-sw--futuro" /> depois da decisão</span></div>
      <div className="vz-tiles" aria-live="polite">
        <div className="vz-tile"><p className="eyebrow">Entram como variável</p><p className="vz-num">{regra === "disponibilidade" ? nUtil : nUtil + nVaz}</p><p className="hint">{regra === "disponibilidade" ? "disponíveis até a decisão" : "ocorridos até a decisão, pela regra ingênua"}</p></div>
        <div className="vz-tile"><p className="eyebrow">Já ocorreram, banco não sabia</p><p className={`vz-num ${nVaz ? "vz-num--default" : ""}`}>{nVaz}</p><p className="hint">{vazamentos ? `${vazamentos} entram por engano: vazamento` : "ficam fora, e é isso que a regra exige"}</p></div>
        <div className="vz-tile"><p className="eyebrow">Ainda não aconteceram</p><p className="vz-num">{nFut}</p><p className="hint">fora por construção</p></div>
      </div>
      <figcaption className="vz-fonte">Ser anterior à decisão é necessário e não é suficiente: a fatura de fevereiro fecha em 28 de fevereiro, entra no ambiente analítico em 30 de abril e fica fora de uma decisão de 15 de março. Uma base com decisões espalhadas por 24 meses tem 24 réguas como esta, uma por mês de decisão, e cada fonte entra com a latência dela. Latências ilustrativas; as suas precisam estar no dicionário de dados.</figcaption>
    </figure>
  );
}

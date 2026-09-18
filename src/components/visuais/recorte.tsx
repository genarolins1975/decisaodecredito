"use client";
import { useState } from "react";

/**
 * O recorte do modelo na data da decisão (capítulo 2, c2p2). O que já existe na data da proposta entra no modelo;
 * o desfecho pertence aos doze meses seguintes e serve como alvo, não como entrada. Cada informação pode ser
 * testada contra o corte da data da decisão.
 */
type Info = { k: string; nome: string; valor: string; futuro: boolean; texto: string };
const INFOS: Info[] = [
  { k: "renda", nome: "Renda declarada", valor: "R$ 6.800", futuro: false, texto: "Passa pelo recorte: a renda declarada já existe quando a proposta é analisada." },
  { k: "utilizacao", nome: "Utilização do limite", valor: "58%", futuro: false, texto: "Passa pelo recorte: a utilização do limite é conhecida na data da proposta." },
  { k: "atraso", nome: "Maior atraso recente", valor: "8 dias", futuro: false, texto: "Passa pelo recorte: o atraso recente resume somente o histórico já observado." },
  { k: "relacionamento", nome: "Tempo de relacionamento", valor: "26 meses", futuro: false, texto: "Passa pelo recorte: o tempo de relacionamento é calculado até a data da decisão." },
  { k: "atraso_futuro", nome: "Maior atraso futuro", valor: "?", futuro: true, texto: "Barrada: o maior atraso nos 12 meses seguintes ainda não existe na data da decisão." },
  { k: "default", nome: "Default em 12 meses", valor: "?", futuro: true, texto: "Barrada: default em 12 meses só será conhecido no futuro. Usá-lo como entrada vazaria a resposta." },
];
const PD = 0.13;
const W = 640, H = 200, XC = 330;

export function Recorte() {
  const [sel, setSel] = useState<string | null>(null);
  const info = INFOS.find((i) => i.k === sel) ?? null;
  return (
    <figure className="vz" data-vz="recorte">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O recorte do modelo na data da decisão · uma proposta de 15 de março de 2024</p>
          <p className="vz-tit">O modelo recebe só o que existe quando a proposta é analisada. O default pertence aos doze meses seguintes: é alvo, não entrada.</p>
        </div>
      </header>
      <div className={`vz-estado ${info ? (info.futuro ? "vz-estado--alterado" : "vz-estado--ok") : ""}`}>{info ? <><b>{info.nome}.</b> {info.texto}</> : <><b>Clique em uma informação</b> para testar se ela passa pelo corte da data da decisão. Quatro estão registradas até a proposta; duas só existem depois.</>}</div>
      <div className="vz-rec-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">A linha do tempo da proposta <span className="hint">à esquerda do corte, histórico já registrado e utilizável; à direita, desfecho que ainda será observado</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Linha do tempo com o corte na data da decisão">
            <rect x={10} y={30} width={XC - 10} height={158} rx={6} className="vz-rec-zona vz-rec-zona--antes" />
            <rect x={XC} y={30} width={W - XC - 10} height={158} rx={6} className="vz-rec-zona vz-rec-zona--depois" />
            <line x1={XC} x2={XC} y1={16} y2={196} className="vz-rec-corte" />
            <text x={XC} y={12} textAnchor="middle" className="vz-rotulo">corte temporal · data da decisão, 15 mar 2024</text>
            <text x={20} y={48} className="vz-tick vz-tick--forte">até a proposta</text><text x={20} y={62} className="vz-tick">histórico já registrado e utilizável</text>
            <text x={W - 20} y={48} textAnchor="end" className="vz-tick vz-tick--forte">próximos 12 meses</text><text x={W - 20} y={62} textAnchor="end" className="vz-tick">desfecho que ainda será observado · não entra no modelo</text>
            {INFOS.filter((i) => !i.futuro).map((i, j) => <g key={i.k} className={`vz-rec-chip ${sel === i.k ? "vz-rec-chip--on" : ""}`} style={{ transform: `translate(20px, ${74 + j * 27}px)` }} onClick={() => setSel(i.k)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(i.k)} aria-label={i.nome}><rect width={220} height={24} rx={12} /><text x={10} y={16}>{i.nome} · {i.valor}</text></g>)}
            {INFOS.filter((i) => i.futuro).map((i, j) => <g key={i.k} className={`vz-rec-chip vz-rec-chip--futuro ${sel === i.k ? "vz-rec-chip--barrada" : ""}`} style={{ transform: `translate(${XC + 24}px, ${74 + j * 27}px)` }} onClick={() => setSel(i.k)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(i.k)} aria-label={i.nome}><rect width={170} height={24} rx={12} /><text x={10} y={16}>{i.nome}</text></g>)}
          </svg>
        </div>
        <div className="vz-rec-fluxo">
          <div className="vz-tile vz-rec-passo"><p className="eyebrow">1. Informações disponíveis</p><ul className="vz-rec-lista">{INFOS.filter((i) => !i.futuro).map((i) => <li key={i.k} className={sel === i.k ? "vz-t-forte" : ""}>{i.nome} <b>{i.valor}</b></li>)}</ul></div>
          <div className="vz-rec-seta" aria-hidden="true">→</div>
          <div className="vz-tile vz-rec-passo"><p className="eyebrow">2. O recorte entra</p><p className="vz-num vz-num--mono">6.800 · 0,58 · 8 · 26</p><p className="hint">f(x), o modelo de PD</p></div>
          <div className="vz-rec-seta" aria-hidden="true">→</div>
          <div className="vz-tile vz-rec-passo"><p className="eyebrow">3. A estimativa sai</p><p className="vz-num vz-num--default">13%</p><p className="hint">PD em 12 meses</p>
            <svg viewBox="0 0 200 44" className="vz-rec-cem" role="img" aria-label="Cem propostas, treze em default"><g>{Array.from({ length: 100 }, (_, i) => <rect key={i} x={(i % 25) * 8} y={Math.floor(i / 25) * 11} width={6} height={8} rx={1.5} className={i < PD * 100 ? "vz-cem--default" : "vz-cem--pagou"} />)}</g></svg>
            <p className="hint">Em 100 propostas com perfil semelhante, cerca de 13 defaults nos 12 meses seguintes. Não é uma certeza sobre esta pessoa.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Tudo o que o modelo usa está à esquerda do corte; o que ele estima está à direita. Usar o desfecho, ou qualquer coisa registrada depois da decisão, como entrada é vazamento: a resposta entraria pela porta da frente. O capítulo 11 mede quanto isso custa.</p>
    </figure>
  );
}

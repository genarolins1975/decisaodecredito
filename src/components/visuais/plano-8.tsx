import { PONTOS } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";

/**
 * Plano dos oito pontos de regressão do capítulo 6 (x de 1 a 8, y de 2 a 12), compartilhado pelas peças que o
 * redesenho do capítulo usa no palco: abertura (c6p1), o erro como alvo (c6p5) e a primeira correção (c6p6).
 * Mesma escala em todas, para a turma reconhecer o desenho de uma página para a outra.
 */
export const X8 = PONTOS.x, Y8 = PONTOS.y;
export const F0_8 = Y8.reduce((s, v) => s + v, 0) / Y8.length;
export type Escala8 = { W: number; H: number; ML: number; MR: number; MT: number; MB: number; sx: (x: number) => number; sy: (v: number) => number };

export function escala8(W = 560, H = 340, ML = 44, MR = 16, MT = 16, MB = 40, YMAX = 14): Escala8 {
  return { W, H, ML, MR, MT, MB, sx: (x) => ML + ((x - 0.5) / 8) * (W - ML - MR), sy: (v) => MT + (1 - v / YMAX) * (H - MT - MB) };
}

/** resíduo com sinal explícito, uma casa: +5,5 e −4,5 */
export const sinal8 = (v: number, casas = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmtNum(Math.abs(v), casas)}`;

export function Eixos8({ e }: { e: Escala8 }) {
  return (
    <g>
      {[0, 4, 8, 12].map((v) => <g key={v}><line x1={e.ML} x2={e.W - e.MR} y1={e.sy(v)} y2={e.sy(v)} className="vz-grade" /><text x={e.ML - 8} y={e.sy(v) + 4} textAnchor="end" className="vz-tick">{v}</text></g>)}
      {X8.map((x) => <text key={x} x={e.sx(x)} y={e.H - e.MB + 18} textAnchor="middle" className="vz-tick">{x}</text>)}
      <text x={(e.ML + e.W - e.MR) / 2} y={e.H - 6} textAnchor="middle" className="vz-rotulo">x</text>
      <text x={e.ML - 8} y={e.MT - 4} textAnchor="end" className="vz-rotulo">y</text>
    </g>
  );
}

/** linha horizontal do palpite constante F₀, tracejada, com rótulo */
export function LinhaF0({ e, apagada = false }: { e: Escala8; apagada?: boolean }) {
  return (
    <g className={apagada ? "vz-p8-apagado" : ""}>
      <line x1={e.ML} x2={e.W - e.MR} y1={e.sy(F0_8)} y2={e.sy(F0_8)} className="vz-op-f0" />
      <text x={e.ML + 6} y={e.sy(F0_8) - 8} className="vz-tick vz-op-f0-t">F₀ = {fmtNum(F0_8, 1)}</text>
    </g>
  );
}

/** segmento vertical entre a previsão e o observado: vermelho quando falta subir, azul quando falta descer */
export function Residuo8({ e, i, prev, rotulo = false }: { e: Escala8; i: number; prev: number; rotulo?: boolean }) {
  const r = Y8[i] - prev;
  return (
    <g>
      <line x1={e.sx(X8[i])} x2={e.sx(X8[i])} y1={e.sy(prev)} y2={e.sy(Y8[i])} className={`vz-p8-res ${r >= 0 ? "vz-p8-res--sobe" : "vz-p8-res--desce"}`} />
      {rotulo && <text x={e.sx(X8[i]) + 10} y={(e.sy(prev) + e.sy(Y8[i])) / 2 + 4} className={`vz-tick vz-p8-res-t ${r >= 0 ? "vz-p8-res-t--sobe" : "vz-p8-res-t--desce"}`}>{sinal8(r)}</text>}
    </g>
  );
}

export function Pontos8({ e, destaque = [], anel = [] }: { e: Escala8; destaque?: number[]; anel?: number[] }) {
  return (
    <g>
      {X8.map((x, i) => (
        <g key={x}>
          {anel.includes(i) && <circle cx={e.sx(x)} cy={e.sy(Y8[i])} r={15} className="vz-p8-anel" />}
          <circle cx={e.sx(x)} cy={e.sy(Y8[i])} r={destaque.includes(i) ? 10 : 8} className={destaque.includes(i) ? "vz-p8-ponto vz-p8-ponto--on" : "vz-p8-ponto"} />
        </g>
      ))}
    </g>
  );
}

/** previsão em degraus: um patamar por ponto, ligado ao seguinte no meio do caminho */
export function Degraus8({ e, F, className = "vz-p8-degrau" }: { e: Escala8; F: number[]; className?: string }) {
  const d = F.map((f, i) => {
    const x0 = i === 0 ? e.sx(0.5) : e.sx(X8[i] - 0.5), x1 = i === F.length - 1 ? e.sx(8.5) : e.sx(X8[i] + 0.5);
    return `${i === 0 ? "M" : "L"}${x0.toFixed(1)} ${e.sy(f).toFixed(1)} L${x1.toFixed(1)} ${e.sy(f).toFixed(1)}`;
  }).join(" ");
  return <path d={d} className={className} />;
}

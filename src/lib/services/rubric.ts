/** Cálculo de nota por rubrica: puro, sem banco, compartilhado por tela, API e exportação. */
export type RubricDef = { criteria: { key: string; name: string; weight?: number; levels: { score: number; label: string; description: string }[] }[]; maxScore?: number; rounding?: { decimals: number }; cutoffRule?: string | null; scale?: number[] };

export function computeTotal(def: RubricDef, scores: Record<string, number>) {
  let total = 0, max = 0;
  const detail: { key: string; name: string; score: number | null; weight: number; weighted: number | null }[] = [];
  let anyZero = false, incomplete = false;
  for (const c of def.criteria) {
    const w = c.weight ?? 1;
    const maxLevel = Math.max(...c.levels.map((l) => l.score));
    max += maxLevel * w;
    const s = scores[c.key];
    if (typeof s !== "number") { incomplete = true; detail.push({ key: c.key, name: c.name, score: null, weight: w, weighted: null }); continue; }
    if (s === 0) anyZero = true;
    total += s * w;
    detail.push({ key: c.key, name: c.name, score: s, weight: w, weighted: s * w });
  }
  const decimals = def.rounding?.decimals ?? 1;
  const factor = 10 ** decimals;
  const rounded = Math.round(total * factor) / factor;
  const cutoffFailed = Boolean(def.cutoffRule && /zero/i.test(def.cutoffRule) && anyZero);
  return { total: rounded, max, detail, incomplete, cutoffFailed, rounding: `${decimals} casa(s) decimal(is), arredondamento matemático` };
}


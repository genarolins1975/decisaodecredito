/**
 * Regras puras da publicação de conteúdo, separadas do importador para poderem ser testadas sem banco:
 * comparação estável de uma versão publicada e as substituições canônicas do capítulo 11.
 */
/**
 * O Postgres devolve jsonb com as chaves reordenadas, então comparar JSON.stringify direto
 * acusaria diferença onde não há nenhuma. Ordena as chaves em profundidade antes de comparar.
 * Arrays mantêm a ordem, que é significativa em blocos.
 */
export function estavel(v: any): any {
  if (Array.isArray(v)) return v.map(estavel);
  if (v && typeof v === "object") {
    const out: any = {};
    // chave com valor undefined não chega ao jsonb: descartar aqui para não acusar diferença falsa
    for (const k of Object.keys(v).sort()) if (v[k] !== undefined) out[k] = estavel(v[k]);
    return out;
  }
  return v;
}
export type ConteudoPagina = { title: string; objective: any; support: any; connection: any; timeBudget: any; blocks: any; teacherGuide: any };
export const CAMPOS_PAGINA: (keyof ConteudoPagina)[] = ["title", "objective", "support", "connection", "timeBudget", "blocks", "teacherGuide"];
export function mesmoConteudo(a: ConteudoPagina, b: ConteudoPagina) {
  const norm = (x: ConteudoPagina) => JSON.stringify(estavel(Object.fromEntries(CAMPOS_PAGINA.map((k) => [k, x[k] ?? null]))));
  return norm(a) === norm(b);
}

export const PATCH_C11: Record<string, [string, string][]> = {
 "c11p1": [
  [
   "60.000 propostas",
   "1 milhão de propostas"
  ]
 ],
 "c11p2": [
  [
   "<span class=\"big\">51.000</span><small>treino + validação · rótulo somente nas aprovadas</small>",
   "<span class=\"big\">≈ 900 mil</span><small>treino + validação (jan/21 a dez/23) · rótulo somente nas aprovadas</small>"
  ],
  [
   "<span class=\"big\">8.420</span><small>5.930 propostas aprovadas com rótulo</small>",
   "<span class=\"big\">jul–dez/23</span><small>cerca de 150 mil propostas; as aprovadas com rótulo você conta na sua base</small>"
  ],
  [
   "<span class=\"big\">9.000</span><small>jan–jun/24 · nenhum desfecho no pacote do aluno</small>",
   "<span class=\"big\">100.000</span><small>jan–jun/24 · nenhum desfecho no pacote do aluno</small>"
  ]
 ],
 "c11p7": [
  [
   "<small>42.580 propostas</small><small>30.938 aprovadas com rótulo</small>",
   "<small>cerca de 750 mil propostas</small><small>aprovadas com rótulo: contar na sua base</small>"
  ],
  [
   "<small>8.420 propostas</small><small>5.930 aprovadas com rótulo</small>",
   "<small>cerca de 150 mil propostas</small><small>aprovadas com rótulo: contar na sua base</small>"
  ],
  [
   "<small>9.000 IDs, sem desfecho</small>",
   "<small>100.000 IDs, sem desfecho</small>"
  ]
 ],
 "c11p8": [
  [
   "<small>baseline aprendido no treino</small><span class=\"big\">6,655%</span><p>a mesma PD para toda proposta</p>",
   "<small>baseline aprendido no treino</small><span class=\"big\">p̂₀ da sua base</span><p>a mesma PD para toda proposta: defaults sobre aprovadas com rótulo no treino (o exemplo abaixo é do Banco Aurora)</p>"
  ]
 ],
 "c11p9": [
  [
   "exatamente os mesmos 5.930 casos aprovados da validação",
   "exatamente os mesmos casos aprovados com rótulo da validação (o número é o da sua base)"
  ]
 ],
 "c11p17": [
  [
   "Exatamente 9.000 IDs; nenhuma volta para melhorar.",
   "Exatamente 100.000 IDs; nenhuma volta para melhorar."
  ]
 ]
};
/**
 * Aplica as substituições do capítulo 11 a um par (blocos, guia docente). Trabalha sobre o JSON
 * serializado porque os trechos atravessam a fronteira dos blocos. Devolve `changed: false` quando
 * nada bateu, o que torna a função idempotente: rodar de novo sobre o resultado não muda nada.
 */
export function patchC11(slug: string, blocks: any, guia: any): { blocks: any; guia: any; changed: boolean } {
  const subs = PATCH_C11[slug];
  let changed = false;
  let saida = blocks;
  if (subs) {
    let json = JSON.stringify(blocks);
    for (const [a, b] of subs) {
      const ea = JSON.stringify(a).slice(1, -1), eb = JSON.stringify(b).slice(1, -1);
      if (json.includes(ea)) { json = json.split(ea).join(eb); changed = true; }
    }
    if (changed) saida = JSON.parse(json);
  }
  // guia docente: a saída esperada da missão 3 citava 60.000 IDs (pacote antigo)
  let g = guia;
  const gj = JSON.stringify(guia ?? null);
  if (gj.includes("60.000 IDs")) { g = JSON.parse(gj.split("60.000 IDs").join("todos os IDs da base do grupo")); changed = true; }
  return { blocks: saida, guia: g, changed };
}

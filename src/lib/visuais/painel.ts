/**
 * Indicadores candidatos do painel de acompanhamento (capítulo 9, c9p8) e o diagnóstico de cobertura: os três
 * fenômenos, a leitura sem espera de rótulo e a equidade. Lista e regras idênticas às da página herdada.
 */
export type Fenomeno = "entrada" | "nivel" | "relacao" | "equidade" | "processo";
export const FENOMENOS: Record<Fenomeno, string> = { entrada: "Deslocamento de entrada", nivel: "Mudança de nível", relacao: "Mudança de relação", equidade: "Equidade entre grupos", processo: "Processo e premissa econômica" };
export type Indicador = { id: string; nome: string; fen: Fenomeno; rot: boolean; freq: string; resp: string; mede: string };
export const INDICADORES: Indicador[] = [
  { id: "psi", nome: "Índice de estabilidade do escore", fen: "entrada", rot: false, freq: "mensal", resp: "monitoramento", mede: "deslocamento da distribuição do escore contra as faixas congeladas no treino" },
  { id: "csi", nome: "Índice por característica", fen: "entrada", rot: false, freq: "mensal", resp: "engenharia de dados", mede: "deslocamento de cada variável do modelo, como mapa de investigação" },
  { id: "aus", nome: "Ausentes e valores fora de domínio por campo", fen: "entrada", rot: false, freq: "mensal", resp: "engenharia de dados", mede: "integridade do dado que entra, antes de qualquer estatística" },
  { id: "apr", nome: "Taxa de aprovação por faixa de escore", fen: "entrada", rot: false, freq: "mensal", resp: "política de crédito", mede: "se a política está sendo aplicada como foi aprovada" },
  { id: "niv", nome: "PD média prevista contra default observado, com intervalo", fen: "nivel", rot: true, freq: "por safra madura", resp: "modelagem", mede: "o nível agregado, com a incerteza da proporção observada" },
  { id: "cal", nome: "Curva de calibração por faixa, com intervalo por faixa", fen: "nivel", rot: true, freq: "por safra madura", resp: "modelagem", mede: "se o erro de nível é uniforme ou concentrado em faixas" },
  { id: "ord", nome: "AUC e KS da safra madura, com intervalo", fen: "relacao", rot: true, freq: "por safra madura", resp: "validação independente", mede: "se a ordenação entre propostas se manteve" },
  { id: "dec", nome: "Default por decil e diferenças entre vizinhos, com intervalo", fen: "relacao", rot: true, freq: "por safra madura", resp: "validação independente", mede: "onde a ordenação se degradou, faixa a faixa" },
  { id: "eq", nome: "Diferença entre grupos declarados, com denominador e intervalo", fen: "equidade", rot: true, freq: "acumulado trimestral", resp: "governança, com conformidade", mede: "diferença de tratamento e de erro entre grupos" },
  { id: "exc", nome: "Taxa de exceção manual e resultado das exceções", fen: "processo", rot: true, freq: "mensal, com desfecho por safra madura", resp: "política de crédito", mede: "quanto da decisão está fora do modelo e se essa parte melhora ou piora o resultado" },
  { id: "lgd", nome: "Perda dado o default realizada contra a premissa", fen: "processo", rot: true, freq: "trimestral", resp: "risco", mede: "a premissa econômica que sustenta o corte do capítulo 8" },
];
export const SELECAO_INICIAL = ["psi", "niv", "ord"];
export type Diagnostico = { sel: Indicador[]; rapidos: number; tem: Record<"entrada" | "nivel" | "relacao" | "equidade", boolean>; faltam: Fenomeno[]; ok: boolean; grande: boolean };
export function diagnostico(ids: string[]): Diagnostico {
  const sel = INDICADORES.filter((x) => ids.includes(x.id));
  const t = (f: Fenomeno) => sel.some((s) => s.fen === f);
  const tem = { entrada: t("entrada"), nivel: t("nivel"), relacao: t("relacao"), equidade: t("equidade") };
  const rapidos = sel.filter((s) => !s.rot).length;
  const faltam = (["entrada", "nivel", "relacao"] as Fenomeno[]).filter((f) => !t(f));
  return { sel, rapidos, tem, faltam, ok: faltam.length === 0 && rapidos > 0 && tem.equidade, grande: sel.length > 7 };
}

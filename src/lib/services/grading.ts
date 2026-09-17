import "server-only";

export type AnswerKey = {
  correct?: number | number[] | null; explanation?: string | null;
  perAlternative?: ({ confusion?: string | null; concept?: string | null; exampleHtml?: string | null; yours?: string | null; adequate?: string | null; followUp?: { prompt: string; alternatives: string[]; correct: number; explanation?: string | null } | null } | null)[];
  expected?: number; tolerance?: number; unit?: string; // numérica
  acceptable?: string[]; // texto curto (correspondência exata normalizada, opcional)
};

export type Answer = { choice?: number; choices?: number[]; value?: number; text?: string; decision?: string; justification?: string; output?: Record<string, unknown> };

/**
 * Corrige no servidor. Retorna correto/indefinido (null para formativas sem gabarito)
 * e o feedback que pode ser mostrado ao aluno APÓS a resposta.
 */
export function grade(kind: string, answer: Answer, key: AnswerKey | null, feedback: Record<string, unknown> | null) {
  if (kind === "single") {
    const c = typeof key?.correct === "number" ? key.correct : null;
    const chosen = answer.choice;
    if (c === null || chosen === undefined) return { isCorrect: null, feedback: null };
    const ok = chosen === c;
    const alt = key?.perAlternative?.[chosen] ?? null;
    return { isCorrect: ok, feedback: { correct: c, explanation: key?.explanation ?? null, recovery: ok ? null : alt } };
  }
  if (kind === "multi") {
    const c = Array.isArray(key?.correct) ? [...key!.correct as number[]].sort() : null;
    const chosen = [...(answer.choices ?? [])].sort();
    if (!c) return { isCorrect: null, feedback: null };
    const ok = c.length === chosen.length && c.every((v, i) => v === chosen[i]);
    return { isCorrect: ok, feedback: { correct: c, explanation: key?.explanation ?? null } };
  }
  if (kind === "numeric") {
    if (typeof key?.expected !== "number" || typeof answer.value !== "number") return { isCorrect: null, feedback: null };
    const tol = key.tolerance ?? 0;
    const ok = Math.abs(answer.value - key.expected) <= tol;
    return { isCorrect: ok, feedback: { expected: key.expected, tolerance: tol, unit: key.unit ?? null, explanation: key?.explanation ?? null } };
  }
  if (kind === "short_text") {
    const acc = key?.acceptable ?? [];
    const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const ok = acc.length ? acc.some((a) => norm(a) === norm(answer.text ?? "")) : null;
    return { isCorrect: ok, feedback: { modelAnswer: (feedback?.modelAnswer as string) ?? null, explanation: key?.explanation ?? null } };
  }
  if (kind === "predict") {
    return { isCorrect: null, feedback: { revealHtml: (feedback?.revealHtml as string) ?? null } };
  }
  // credit_decision e simulator_output: avaliação formativa/manual
  return { isCorrect: null, feedback: { modelAnswer: (feedback?.modelAnswer as string) ?? null, explanation: key?.explanation ?? null } };
}

/**
 * Feedback em dois estágios (prática de recuperação): na primeira resposta errada de uma questão com
 * gabarito, o aluno recebe só a recuperação (confusão, conceito, exemplo, pergunta de retomada) e tenta
 * de novo; a alternativa correta e a explicação só aparecem quando acerta, a partir da segunda tentativa
 * ou quando pede "Ver a resposta". Sessões ao vivo não usam esta regra: lá a divulgação é por "Liberar resultados".
 */
export const GRADED_KINDS = ["single", "multi", "numeric"] as const;

export function shouldDisclose(kind: string, isCorrect: boolean | null, attemptNo: number, revealedBefore: boolean, requested = false) {
  if (!(GRADED_KINDS as readonly string[]).includes(kind)) return true;
  if (isCorrect === null) return true;
  return isCorrect || attemptNo >= 2 || revealedBefore || requested;
}

/** Remove do feedback o que identifica a resposta certa, preservando a recuperação. */
export function redactFeedback<T extends Record<string, unknown> | null>(feedback: T): T {
  if (!feedback) return feedback;
  const { correct: _c, explanation: _e, expected: _x, tolerance: _t, unit: _u, ...rest } = feedback as Record<string, unknown>;
  void _c; void _e; void _x; void _t; void _u;
  return rest as T;
}

export function validateAnswer(kind: string, answer: unknown, options: Record<string, unknown>): Answer {
  const a = (answer ?? {}) as Answer;
  const nAlt = Array.isArray(options.alternatives) ? (options.alternatives as unknown[]).length : 0;
  if (kind === "single" || kind === "predict") {
    if (typeof a.choice !== "number" || a.choice < 0 || a.choice >= nAlt) throw new Error("Escolha uma alternativa válida");
    return { choice: a.choice };
  }
  if (kind === "multi") {
    if (!Array.isArray(a.choices) || a.choices.some((c) => typeof c !== "number" || c < 0 || c >= nAlt)) throw new Error("Alternativas inválidas");
    return { choices: [...new Set(a.choices)] };
  }
  if (kind === "numeric") {
    if (typeof a.value !== "number" || !Number.isFinite(a.value)) throw new Error("Informe um valor numérico");
    return { value: a.value };
  }
  if (kind === "short_text") {
    const max = Number(options.maxLength ?? 600);
    if (typeof a.text !== "string" || !a.text.trim()) throw new Error("Escreva uma resposta");
    return { text: a.text.trim().slice(0, max) };
  }
  if (kind === "credit_decision") {
    const decisions = (options.decisions as string[] | undefined) ?? ["aprovar", "recusar", "revisar"];
    if (!a.decision || !decisions.includes(a.decision)) throw new Error("Escolha uma decisão");
    if (typeof a.justification !== "string" || a.justification.trim().length < 10) throw new Error("Justifique a decisão (mínimo de 10 caracteres)");
    return { decision: a.decision, justification: a.justification.trim().slice(0, 2000) };
  }
  if (kind === "simulator_output") {
    if (!a.output || typeof a.output !== "object") throw new Error("Cole a saída do simulador");
    return { output: a.output };
  }
  throw new Error("Tipo de questão desconhecido");
}

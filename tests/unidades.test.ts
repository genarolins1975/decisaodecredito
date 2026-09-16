import { describe, expect, it } from "vitest";
import { normalizeEmail, isValidEmail } from "../src/lib/auth/email";
import { passwordProblems } from "../src/lib/auth/password";
import { safeCell, toCsv, parseCsv } from "../src/lib/csv";
import { fromSaoPaulo, toLocalInput } from "../src/lib/time";
import { grade, validateAnswer } from "../src/lib/services/grading";
import { computeTotal } from "../src/lib/services/rubric";
import { codeForSlot } from "../src/lib/services/attendance";
import { sniffMime } from "../src/lib/storage";

describe("e-mail", () => {
  it("normaliza espaços e caixa sem remover pontos ou sufixo +", () => {
    expect(normalizeEmail("  Maria.Silva+fgv@Gmail.com ")).toBe("maria.silva+fgv@gmail.com");
    expect(normalizeEmail("maria.silva@gmail.com")).not.toBe(normalizeEmail("mariasilva@gmail.com"));
  });
  it("valida formato", () => { expect(isValidEmail("a@b.co")).toBe(true); expect(isValidEmail("a@b")).toBe(false); });
});

describe("senha", () => {
  it("rejeita curta, só dígitos e contendo o e-mail", () => {
    expect(passwordProblems("123456789")).toHaveLength(2);
    expect(passwordProblems("mariasilva-2026", "mariasilva@x.com")).toHaveLength(1);
    expect(passwordProblems("senha-forte-2026")).toHaveLength(0);
  });
});

describe("csv", () => {
  it("neutraliza fórmulas", () => { expect(safeCell("=SUM(A1)")).toBe("'=SUM(A1)"); expect(safeCell("+1")).toBe("'+1"); expect(safeCell("ok")).toBe("ok"); });
  it("exporta e lê de volta", () => {
    const csv = toCsv([{ nome: "Ana", email: "a@b.co" }], ["nome", "email"]);
    const { rows } = parseCsv(csv);
    expect(rows[0].nome).toBe("Ana");
  });
});

describe("fuso America/Sao_Paulo", () => {
  it("converte horário local em instante UTC e volta", () => {
    const d = fromSaoPaulo("2026-03-10T19:00");
    expect(d.toISOString()).toBe("2026-03-10T22:00:00.000Z");
    expect(toLocalInput(d)).toBe("2026-03-10T19:00");
  });
});

describe("correção no servidor", () => {
  it("alternativa única com recuperação", () => {
    const key = { correct: 1, explanation: "porque", perAlternative: [{ confusion: "x" }, null] };
    expect(grade("single", { choice: 1 }, key, null).isCorrect).toBe(true);
    const r = grade("single", { choice: 0 }, key, null);
    expect(r.isCorrect).toBe(false); expect(r.feedback?.recovery?.confusion).toBe("x");
  });
  it("numérica com tolerância e unidade", () => {
    expect(grade("numeric", { value: 10.4 }, { expected: 10, tolerance: 0.5, unit: "%" }, null).isCorrect).toBe(true);
    expect(grade("numeric", { value: 11 }, { expected: 10, tolerance: 0.5 }, null).isCorrect).toBe(false);
  });
  it("valida respostas", () => {
    expect(() => validateAnswer("single", { choice: 5 }, { alternatives: ["a", "b"] })).toThrow();
    expect(validateAnswer("credit_decision", { decision: "aprovar", justification: "porque a PD é baixa e o EAD pequeno" }, {})).toMatchObject({ decision: "aprovar" });
  });
});

describe("rubrica", () => {
  const def = { criteria: [{ key: "a", name: "A", levels: [{ score: 0, label: "0", description: "" }, { score: 3, label: "3", description: "" }] }, { key: "b", name: "B", weight: 2, levels: [{ score: 0, label: "0", description: "" }, { score: 3, label: "3", description: "" }] }], rounding: { decimals: 1 }, cutoffRule: "Zero em qualquer dimensão reprova." };
  it("soma ponderada, máximo e regra de corte", () => {
    const r = computeTotal(def, { a: 3, b: 3 });
    expect(r.total).toBe(9); expect(r.max).toBe(9); expect(r.cutoffFailed).toBe(false);
    expect(computeTotal(def, { a: 0, b: 3 }).cutoffFailed).toBe(true);
    expect(computeTotal(def, { a: 3 }).incomplete).toBe(true);
  });
});

describe("código de chamada", () => {
  it("é determinístico por intervalo e muda entre intervalos", () => {
    expect(codeForSlot("s", 1)).toBe(codeForSlot("s", 1));
    expect(codeForSlot("s", 1)).not.toBe(codeForSlot("s", 2));
    expect(codeForSlot("s", 1)).toMatch(/^[A-Z2-9]{6}$/);
  });
});

describe("tipo real de arquivo", () => {
  it("rejeita PDF falso e aceita PDF e CSV", () => {
    expect(sniffMime(Buffer.from("PK"), "application/pdf", "x.pdf")).toBeNull();
    expect(sniffMime(Buffer.from("%PDF-1.4"), "application/pdf", "x.pdf")).toBe("application/pdf");
    expect(sniffMime(Buffer.from("a,b\n1,2"), "text/csv", "x.csv")).toBe("text/csv");
  });
});

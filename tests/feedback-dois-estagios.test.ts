import { describe, expect, it } from "vitest";
import { grade, redactFeedback, shouldDisclose } from "../src/lib/services/grading";

const key = { correct: 1, explanation: "regra completa", perAlternative: [{ confusion: "c", concept: "k", followUp: { prompt: "p", alternatives: ["a", "b"], correct: 1 } }, null, null] };

describe("feedback em dois estágios", () => {
  it("primeira resposta errada não divulga o gabarito; acerto, segunda tentativa, divulgação prévia ou pedido divulgam", () => {
    expect(shouldDisclose("single", false, 1, false)).toBe(false);
    expect(shouldDisclose("single", true, 1, false)).toBe(true);
    expect(shouldDisclose("single", false, 2, false)).toBe(true);
    expect(shouldDisclose("single", false, 1, true)).toBe(true);
    expect(shouldDisclose("single", false, 1, false, true)).toBe(true);
    expect(shouldDisclose("numeric", false, 1, false)).toBe(false);
    expect(shouldDisclose("short_text", null, 1, false)).toBe(true);
    expect(shouldDisclose("predict", null, 1, false)).toBe(true);
  });
  it("a redação remove a alternativa correta e a explicação e preserva a recuperação", () => {
    const r = grade("single", { choice: 0 }, key, null);
    expect(r.isCorrect).toBe(false);
    const red = redactFeedback(r.feedback as Record<string, unknown>) as Record<string, unknown>;
    expect(red.correct).toBeUndefined(); expect(red.explanation).toBeUndefined();
    expect((red.recovery as { confusion: string }).confusion).toBe("c");
    expect((red.recovery as { followUp: { prompt: string } }).followUp.prompt).toBe("p");
    const num = redactFeedback({ expected: 3, tolerance: 0.1, unit: "%", explanation: "x" }) as Record<string, unknown>;
    expect(num).toEqual({});
    expect(redactFeedback(null)).toBeNull();
  });
});

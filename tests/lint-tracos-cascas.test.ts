import { describe, expect, it } from "vitest";
// @ts-expect-error script em JavaScript, sem tipos
import { tracosNasCascas } from "../scripts/lint-tracos-cascas.mjs";

/**
 * A regra editorial do curso proíbe hífen e travessão como pontuação de prosa no texto exibido.
 * O baralho da Aula 2 já era conferido por aula_credito_html/lint-tracos.mjs; este contrato estende
 * a mesma regra às cascas React, que é a recomendação R6 do plano de melhorias.
 */
describe("travessão como pontuação de prosa nas cascas React", () => {
  it("não aparece em src/app, src/components e src/lib", () => {
    const achados = tracosNasCascas() as { arquivo: string; linha: number; texto: string }[];
    const lista = achados.map((a) => `${a.arquivo}:${a.linha}  ${a.texto}`).join("\n");
    expect(lista, `travessão de prosa encontrado:\n${lista}`).toBe("");
  });

  it("distingue pontuação de prosa da marca de ausência de valor", () => {
    const achados = tracosNasCascas(["src/components/professor"]) as { texto: string }[];
    // a área do professor usa "—" em célula e em opção vazia; nenhum deles é pontuação de prosa
    expect(achados).toHaveLength(0);
  });
});

import { describe, expect, it } from "vitest";
import { carga, paginar, type Unidade } from "@/lib/palco/compositor";

const u = (h: number, w = 10, grupo?: number, coluna?: 0 | 1): Unidade => ({ h, w, grupo, coluna });

describe("compositor do deck", () => {
  it("uma tela quando tudo cabe", () => {
    expect(paginar([u(100), u(100), u(100)], {}, { altura: 400, gap: 10 })).toEqual([[0, 1, 2]]);
  });
  it("divide no menor número de telas e equilibra", () => {
    // 5 unidades de 150 em altura 400: mínimo 3 telas (2+2+1 cabe); o equilíbrio prefere 2+2+1 ou 2+1+2, nunca 1+1+3
    const telas = paginar([u(150), u(150), u(150), u(150), u(150)], {}, { altura: 400 });
    expect(telas.length).toBe(3);
    expect(telas.every((t) => t.length <= 2)).toBe(true);
  });
  it("teto de palavras abre tela nova mesmo cabendo na altura, desde que as telas não fiquem ralas", () => {
    expect(paginar([u(200, 120), u(200, 120), u(200, 120)], {}, { altura: 400, palavras: 150 }).length).toBe(3);
    // três unidades baixas: dividir deixaria cada tela com 12% da altura; fica em uma tela apesar das palavras
    expect(paginar([u(50, 120), u(50, 120), u(50, 120)], {}, { altura: 400, palavras: 150 }).length).toBe(1);
  });
  it("unidade que estoura as palavras não força divisões que deixariam telas ralas", () => {
    expect(paginar([u(50, 400), u(50, 10)], {}, { altura: 400, palavras: 150 })).toEqual([[0, 1]]);
    // com altura para isso, a unidade pesada fica sozinha e as outras vão juntas
    expect(paginar([u(300, 400), u(150, 10), u(150, 10)], {}, { altura: 400, palavras: 150 })).toEqual([[0], [1, 2]]);
  });
  it("duas colunas: altura é a da coluna mais alta e a figura persistente conta em toda tela", () => {
    const us = [u(100, 10, 1, 1), u(100, 10, 1, 1), u(100, 10, 1, 1)];
    const grupos = { 1: { persistente: { coluna: 0 as const, h: 250, w: 5 } } };
    expect(carga(us, grupos, 0, 3, { altura: 400 }).h).toBe(300);
    expect(carga(us, grupos, 0, 1, { altura: 400 }).h).toBe(250);
    expect(paginar(us, grupos, { altura: 400 })).toEqual([[0, 1, 2]]);
    // com 5 unidades, 2 telas (300 + 200→250) e não 3
    const cinco = [...us, u(100, 10, 1, 1), u(100, 10, 1, 1)];
    const telas = paginar(cinco, grupos, { altura: 400 });
    expect(telas.length).toBe(2);
  });
  it("coluna sozinha na tela flui em duas colunas: altura cai pela metade, nunca abaixo da maior unidade", () => {
    const us = [u(200, 10, 1, 0), u(100, 10, 1, 0), u(100, 10, 1, 0), u(150, 10, 1, 1)];
    expect(carga(us, {}, 0, 3, { altura: 400 }).h).toBe(200); // 400 / 2 = 200 ≥ maior unidade 200
    expect(carga(us, {}, 0, 4, { altura: 400 }).h).toBe(400); // com as duas colunas presentes vale a mais alta
    expect(carga(us, {}, 1, 3, { altura: 400 }).h).toBe(100);
  });
  it("entre partições de mesma carga máxima, prefere a que deixa a tela mais baixa mais cheia", () => {
    // 4 unidades: 100, 100, 100, 250 em altura 400 → 2 telas; [0,1,2] + [3] (300 e 250) é melhor que [0,1] + [2,3] (200 e 350)? não: carga máxima 350/400
    // vs 300/400; o mínimo de carga máxima escolhe 300, e a menor tela é 250. Com unidades 100, 100, 100, 100, 200 (altura 400):
    // 2 telas de carga máxima 300: [0,1,2]+[3,4] (300, 300) vence [0,1]+[2,3,4] (200, 400 estoura) e [0,1,2,3]+[4] (400, 200)
    const telas = paginar([u(100), u(100), u(100), u(100), u(200)], {}, { altura: 400 });
    expect(telas).toEqual([[0, 1, 2], [3, 4]]);
  });
  it("não abre tela por palavras se alguma tela ficaria rala", () => {
    // 3 unidades de 120 palavras: a terceira sozinha teria 25% da altura → fica em 2 telas apesar das palavras
    expect(paginar([u(200, 120), u(200, 120), u(100, 120)], {}, { altura: 400, palavras: 150 }).length).toBe(2);
  });
  it("unidade fora de grupo e grupo somam em sequência", () => {
    const us = [u(100), u(100, 10, 1, 0), u(100, 10, 1, 1)];
    expect(carga(us, {}, 0, 3, { altura: 400, gap: 10 }).h).toBe(210);
  });
});

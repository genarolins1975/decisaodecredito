import { describe, expect, it } from "vitest";
import { FOLHAS, FOLHA_INICIAL, V_INICIAL, acimaDoMinimo, fmtNum, fmtPct, frequencia, leitura, noMinimo, penalidade, perdaMedia, perdaMinima, pura } from "../src/lib/visuais/valor-da-folha";
import * as CF from "../src/lib/visuais/confianca-da-folha";

describe("c5p12: a PD da folha é a frequência da folha", () => {
  it("folhas das árvores de um e de dois cortes: 1 de 8 e 7 de 8; 1 de 2 (folhas 1 e 4), 0 de 6 e 6 de 6", () => {
    expect(FOLHAS.map((f) => [f.arvore, f.d, f.n])).toEqual([[1, 1, 8], [1, 7, 8], [2, 1, 2], [2, 0, 6], [2, 6, 6]]);
    expect(FOLHAS[0].onde).toBe("Folha 1: utilização até 57,5%.");
    expect(FOLHAS[2].onde).toBe("Folhas 1 e 4: utilização até 27,5% e acima de 87,5%.");
    expect(FOLHAS[3].onde).toBe("Folha 2: utilização de 27,5% a 57,5%.");
    expect([FOLHA_INICIAL.d, FOLHA_INICIAL.n, V_INICIAL]).toEqual([1, 8, 0.5]);
  });
  it("a perda média é a média do que cada proposta paga", () => {
    for (const f of FOLHAS) for (const v of [0.01, 0.125, 0.3, 0.5, 0.875, 0.99]) {
      const pagas = [...Array(f.d).fill(true), ...Array(f.n - f.d).fill(false)].map((y) => penalidade(y, v));
      expect(perdaMedia(f.d, f.n, v)).toBeCloseTo(pagas.reduce((s, x) => s + x, 0) / f.n, 12);
    }
  });
  it("o mínimo cai na frequência, d ÷ n, em toda folha que não é pura", () => {
    for (const f of FOLHAS.filter((g) => !pura(g))) {
      let melhor = 0.001, lmin = Infinity;
      for (let v = 0.001; v < 1; v += 0.0005) { const l = perdaMedia(f.d, f.n, v); if (l < lmin) { lmin = l; melhor = v; } }
      expect(Math.abs(melhor - frequencia(f))).toBeLessThan(0.001);
      expect(perdaMinima(f)).toBeCloseTo(lmin, 6);
    }
    expect(fmtNum(perdaMinima({ d: 1, n: 8 }), 5)).toBe("0,37677"); expect(fmtNum(perdaMinima({ d: 1, n: 2 }), 5)).toBe("0,69315");
    expect(fmtNum(perdaMedia(1, 8, 0.5), 4)).toBe("0,6931");
    // a diferença do painel fecha com os dois números exibidos, em toda folha e todo valor do controle
    for (const f of FOLHAS) for (let k = 2; k <= 198; k++) { const v = k / 200; expect(fmtNum(acimaDoMinimo(f, v), 4)).toBe(fmtNum(Number(fmtNum(perdaMedia(f.d, f.n, v), 4).replace(",", ".")) - Number(fmtNum(perdaMinima(f), 4).replace(",", ".")), 4)); }
  });
  it("na folha pura a perda só cai em direção à ponta e chega a zero nela", () => {
    const vs = Array.from({ length: 99 }, (_, i) => (i + 1) / 100);
    const sem = vs.map((v) => perdaMedia(0, 6, v)), so = vs.map((v) => perdaMedia(6, 6, v));
    for (let i = 1; i < vs.length; i++) { expect(sem[i]).toBeGreaterThan(sem[i - 1]); expect(so[i]).toBeLessThan(so[i - 1]); }
    expect(perdaMedia(0, 6, 1e-9)).toBeLessThan(1e-8); expect(perdaMinima({ d: 0, n: 6 })).toBe(0); expect(perdaMinima({ d: 6, n: 6 })).toBe(0);
  });
  it("a frase do painel diz o sentido da correção e reconhece o mínimo", () => {
    expect(leitura({ d: 1, n: 8 }, 0.5)).toBe("Desça $v$ até 12,5%, a frequência da folha, e a perda cai.");
    expect(leitura({ d: 1, n: 8 }, 0.05)).toBe("Suba $v$ até 12,5%, a frequência da folha, e a perda cai.");
    expect(leitura({ d: 1, n: 8 }, 0.125)).toBe("Em 12,5%, a frequência da folha, a perda é mínima: mover $v$ para qualquer lado a aumenta.");
    expect(noMinimo({ d: 7, n: 8 }, 0.875)).toBe(true); expect(noMinimo({ d: 0, n: 6 }, 0.01)).toBe(false);
    expect(leitura({ d: 0, n: 6 }, 0.3)).toContain("a folha afirma risco zero com 6 propostas");
    expect(leitura({ d: 6, n: 6 }, 0.3)).toContain("a folha afirma certeza com 6 propostas");
    expect(fmtPct(0.125, 1)).toBe("12,5%");
  });
});

describe("c5p13: quanto cada folha afirma", () => {
  const ic = (s: { lo: number; hi: number }) => `${fmtPct(s.lo, 1)} a ${fmtPct(s.hi, 1)}`;
  it("as quatro folhas da árvore de dois cortes e os intervalos de Wilson a 95%, com 1, 10 e 100 vezes as propostas", () => {
    expect(CF.FOLHAS4.map((f) => [f.d, f.n])).toEqual([[1, 2], [0, 6], [6, 6], [1, 2]]);
    expect(CF.FOLHAS4.map((f) => ic(CF.intervalo(f, 1)))).toEqual(["9,5% a 90,5%", "0,0% a 39,0%", "61,0% a 100,0%", "9,5% a 90,5%"]);
    expect(CF.FOLHAS4.map((f) => ic(CF.intervalo(f, 10)))).toEqual(["29,9% a 70,1%", "0,0% a 6,0%", "94,0% a 100,0%", "29,9% a 70,1%"]);
    expect(ic(CF.intervalo(CF.FOLHAS4[1], 100))).toBe("0,0% a 0,6%"); expect(ic(CF.intervalo(CF.FOLHAS4[0], 100))).toBe("43,1% a 56,9%");
  });
  it("mais propostas com a mesma frequência estreitam o intervalo, sem mudar a estimativa", () => {
    for (const f of CF.FOLHAS4) {
      const larg = CF.MULTIPLOS.map((m) => { const s = CF.intervalo(f, m); return s.hi - s.lo; });
      expect(larg[1]).toBeLessThan(larg[0]); expect(larg[2]).toBeLessThan(larg[1]);
      for (const m of CF.MULTIPLOS) { const e = CF.escalada(f, m); expect(e.d / e.n).toBe(f.d / f.n); }
    }
  });
  it("a folha decide só quando o intervalo inteiro fica de um lado do limite", () => {
    const v = (L: number, m: CF.Multiplo) => CF.situacao(L, m).map((f) => f.v);
    expect(v(0.2, 1)).toEqual(["nao-decide", "nao-decide", "recusa", "nao-decide"]);
    expect(v(0.2, 10)).toEqual(["recusa", "aprova", "recusa", "recusa"]);
    expect(v(0.5, 1)).toEqual(["nao-decide", "aprova", "recusa", "nao-decide"]);
    expect(v(0.5, 100)).toEqual(["nao-decide", "aprova", "recusa", "nao-decide"]); // perto do limite, nem 200 propostas decidem
    expect(CF.veredito({ lo: 0.1, hi: 0.3 }, 0.3)).toBe("nao-decide"); expect(CF.veredito({ lo: 0.1, hi: 0.29 }, 0.3)).toBe("aprova");
    for (let L = CF.LIMITE_MIN; L <= CF.LIMITE_MAX + 1e-9; L += CF.LIMITE_PASSO) for (const m of CF.MULTIPLOS) for (const f of CF.situacao(L, m)) {
      if (f.v === "aprova") expect(f.ic.hi).toBeLessThan(L); if (f.v === "recusa") expect(f.ic.lo).toBeGreaterThan(L);
      if (f.v === "nao-decide") { expect(f.ic.lo).toBeLessThanOrEqual(L); expect(f.ic.hi).toBeGreaterThanOrEqual(L); }
    }
  });
  it("a frase do painel nomeia as folhas que cruzam o limite e por isso não decidem", () => {
    expect(CF.leitura(0.2, 1)).toBe("As folhas 1, 2 e 4 cruzam o limite de 20%: não decidem.");
    expect(CF.leitura(0.2, 10)).toBe("Com 10 vezes as propostas e a mesma frequência, cada intervalo fica inteiro de um lado do limite de 20%: as quatro folhas decidem.");
    expect(CF.leitura(0.5, 100)).toBe("Com 100 vezes as propostas e a mesma frequência, as folhas 1 e 4 cruzam o limite de 50%: não decidem.");
    expect(CF.leitura(0.95, 1)).toBe("A folha 3 cruza o limite de 95%: não decide.");
    for (let L = CF.LIMITE_MIN; L <= CF.LIMITE_MAX + 1e-9; L += CF.LIMITE_PASSO) for (const m of CF.MULTIPLOS) expect(CF.leitura(L, m)).toMatch(/^[A-Z][^]*\.$/);
    expect(CF.CARTOES[0].t).toContain("39,0%");
  });
});

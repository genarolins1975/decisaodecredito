import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CFG_CARTEIRA, CFG_DIDATICA, XA, XD, XV, YA, YD, YV, modelo } from "@/lib/capitulo6/dados";
import { auc, dependenciaParcialRapida, estagios, perdaLog, sigmoide, valorArvore } from "@/lib/capitulo6/gbm";
import { ANCORA, D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, calibracaoGlobal, delong, faixasQuantis, jeffreys, logit, mulberry32, sigmoide as sig7, wilson } from "@/lib/capitulo7/metricas";
import { aucEsperada } from "@/lib/capitulo7/janelas";
import { num, pct } from "@/lib/capitulo7/formato";

/** As questões curadas citam números dos quadros. Elas não leem a biblioteca: quando um quadro muda, a questão fica
    para trás sem aviso (foi o que aconteceu com as do capítulo 6 reconstruído). Aqui cada número citado é recalculado
    como o quadro o calcula, e a questão precisa trazê-lo. */
const { questoes } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "questoes-curadas.json"), "utf8")) as { questoes: { slug: string }[] };
const texto = (slug: string) => JSON.stringify(questoes.find((q) => q.slug === slug));
const cita = (slug: string, numeros: string[]) => { const t = texto(slug); for (const n of numeros) expect(t, `${slug}: ${n}`).toContain(n); };

describe("questões curadas do capítulo 6 citam os números da biblioteca", () => {
  const MOD = modelo(CFG_DIDATICA, XD, YD);
  const EST = estagios(MOD, XD);

  it("c6p2q: alvo da proposta #3 nas árvores 1 e 2 de corrigir", () => {
    const i = 2; // proposta #3
    cita("c6p2q", [num(YD[i] - sigmoide(EST[0][i]), 2), num(YD[i] - sigmoide(EST[1][i]), 2)]);
  });

  it("c6p5q: erro quadrático dos resíduos antes e depois do segundo nível", () => {
    const r = YD.map((y) => y - sigmoide(MOD.f0));
    const sse = (m: number[]) => { const mm = m.reduce((s, i) => s + r[i], 0) / m.length; return m.reduce((s, i) => s + (r[i] - mm) ** 2, 0); };
    const folha = (x: readonly number[]) => valorArvore(MOD.arvores[0], x);
    const grupos = new Map<number, number[]>(); XD.forEach((x, i) => grupos.set(folha(x), [...(grupos.get(folha(x)) ?? []), i]));
    const total = [...grupos.values()].reduce((s, m) => s + sse(m), 0);
    cita("c6p5q", [num(sse(XD.map((_, i) => i)), 2), num(total, 2)]);
  });

  it("c6p6q: PD e perda da folha B com o passo de Newton", () => {
    const B = XD.map((_, i) => i).filter((i) => valorArvore(MOD.arvores[0], XD[i]) < 0);
    const g = valorArvore(MOD.arvores[0], XD[B[0]]);
    const perda = (v: number) => B.reduce((s, i) => s + Math.log1p(Math.exp(MOD.f0 + v)), 0);
    cita("c6p6q", [num(g, 2), pct(sigmoide(MOD.f0 + g), 1), num(perda(0), 2), num(perda(g), 2)]);
  });

  it("c6p7q: perda após quatro árvores com η = 0,95 e η = 1, e o múltiplo do passo na árvore 2 de η = 1", () => {
    const L = (eta: number) => perdaLog(estagios(modelo({ ...CFG_DIDATICA, eta }, XD, YD), XD)[4], YD);
    const m1 = modelo({ ...CFG_DIDATICA, eta: 1 }, XD, YD), e1 = estagios(m1, XD);
    const f = (a: number) => perdaLog(e1[1].map((v, i) => v + a * valorArvore(m1.arvores[1], XD[i])), YD);
    let lo = 0, hi = 4; for (let k = 0; k < 120; k++) { const u = lo + (hi - lo) / 3, w = hi - (hi - lo) / 3; if (f(u) < f(w)) hi = w; else lo = u; }
    cita("c6p7q", [num(L(0.95), 3), num(L(1), 3), num((lo + hi) / 2, 2), num(L(0.1), 3)]);
  });

  it("c6p10q: a folha da proposta 10 na árvore 2", () => {
    const i10 = 9, i15 = 14;
    const p = (i: number) => sigmoide(EST[1][i]);
    cita("c6p10q", [num(EST[1][i10], 2), num(YD[i10] - p(i10), 2), num(valorArvore(MOD.arvores[1], XD[i10]), 2), num(p(i10) * (1 - p(i10)) + p(i15) * (1 - p(i15)), 2)]);
  });

  it("c6p13q: taxa 0,1 contra 0,5 com 300 árvores, no ajuste e na validação", () => {
    const r = (eta: number) => { const m = modelo({ ...CFG_CARTEIRA, eta }); const ea = estagios(m, XA), ev = estagios(m, XV); const pv = ev.map((F) => perdaLog(F, YV)); const vmin = Math.min(...pv); return { pa: perdaLog(ea[300], YA), pv: pv[300], vmin, imin: pv.indexOf(vmin), aa: auc(YA, ea[300]), av: auc(YV, ev[300]) }; };
    const a = r(0.1), b = r(0.5);
    cita("c6p13q", [num(a.pa, 3), num(b.pa, 3), num(a.pv, 3), num(b.pv, 3), num(b.vmin, 3), `${b.imin} árvores`, `com ${a.imin}`, num(b.aa, 3), num(b.av, 3)]);
  });

  it("c6p20q: quedas, PD monotônica acima de 30 dias, Wilson e AUC na validação", () => {
    let n = 0, d = 0; XA.forEach((x, i) => { if (x[1] >= 31 && x[1] <= 60) { n++; d += YA[i]; } });
    const grade = Array.from({ length: 61 }, (_, i) => i);
    const r = [false, true].map((mono) => {
      const m = modelo({ ...CFG_CARTEIRA, minFolha: 10, ...(mono ? { monotonia: [1, 1, -1] } : {}) });
      const dp = dependenciaParcialRapida(m, XA, 1, grade);
      return { quedas: dp.reduce((s, v, i) => s + (i > 0 && v < dp[i - 1] - 1e-12 ? 1 : 0), 0), alta: grade.filter((g) => g >= 31).reduce((s, g) => s + dp[g], 0) / 30, F: estagios(m, XV)[300] };
    });
    const dl = delong(YV, r[1].F, r[0].F);
    expect(r[1].quedas).toBe(0);
    cita("c6p20q", [`${d} defaults em ${n}`, pct(wilson(d, n)!.hi, 1), pct(r[1].alta, 1), `contra ${r[0].quedas}`, num(auc(YV, r[0].F), 4), num(auc(YV, r[1].F), 4), num(dl.ic[0], 3), num(dl.ic[1], 3)]);
  });
});

describe("questões curadas do capítulo 7 citam os números dos quadros", () => {
  it("c7p17q: o escolhido em dez reaberturas, na janela e nas réplicas sintéticas, contra a logística (slide 35)", () => {
    const r = mulberry32(20261035);
    const gauss = () => { const u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    let melhor = { oot: -1, nova: 0 };
    for (let i = 0; i < 10; i++) { const p = PL.map((q) => sig7(logit(q) + 0.3 * gauss())); const oot = aucPorPares(Y, p).auc!; if (oot > melhor.oot) melhor = { oot, nova: aucEsperada(p) }; }
    const log = aucPorPares(Y, PL).auc!, logNova = aucEsperada(PL);
    cita("c7p17q", [num(melhor.oot, 4), num(melhor.nova, 4), num(log, 4), num(logNova, 4), num(log - logNova, 4), num(melhor.oot - melhor.nova, 4)]);
  });

  it("c7p29q: O/E da janela, das metades e da validação, Jeffreys e o nível recalibrado (slides 18 e 36)", () => {
    const g = calibracaoGlobal(Y, PL);
    const metades = faixasQuantis(Y, PL, 2).map((f) => num(f.d / f.somaPd, 2));
    cita("c7p29q", [num(g.esperados, 1), `${D}`, num(g.razaoOE!, 2), num(jeffreys(D, N, g.pdMedia!), 2), ...metades,
      num(ANCORA.validacao.oe, 2), num(ANCORA.validacao.jeffreys, 3), pct(ANCORA.sem.pdMedia, 1), pct(ANCORA.recentes.pdMedia, 1)]);
  });
});

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ROTEIRO_AULA_2, type NotaSlideAula2 } from "../src/lib/content/roteiro-aula-2";

/**
 * As três saídas de `aula_credito_html/build.mjs` que a plataforma serve: o baralho completo
 * (professor e monitor), a variante sem notas (aluno) e as notas por slide (painel do professor).
 * O que se garante aqui é o contrato entre elas, não a didática de cada slide.
 */
const pasta = path.join(__dirname, "../content/slides");
const completo = fs.readFileSync(path.join(pasta, "aula-2.html"), "utf8");
const aluno = fs.readFileSync(path.join(pasta, "aula-2-aluno.html"), "utf8");
const notas = JSON.parse(fs.readFileSync(path.join(pasta, "aula-2-notas.json"), "utf8")) as { versao: string; slides: NotaSlideAula2[] };
const VERSAO = /var AULA_VERSAO = "([0-9a-f]{12})"/;

function frasesDe(s: NotaSlideAula2): string[] {
  if (!s.notas) return [];
  return [...s.notas.conducao, ...s.notas.respostas, ...s.notas.cuidados, ...s.notas.aprofundar, s.notas.transicao].filter((x): x is string => Boolean(x));
}

describe("compilação da Aula 2", () => {
  it("as três saídas vêm da mesma compilação", () => {
    expect(notas.versao).toMatch(/^[0-9a-f]{12}$/);
    expect(completo.match(VERSAO)?.[1]).toBe(notas.versao);
    expect(aluno.match(VERSAO)?.[1]).toBe(notas.versao);
  });

  it("tem notas para os 50 slides, na ordem do roteiro, com condução e transição", () => {
    expect(notas.slides.map((s) => s.n)).toEqual(ROTEIRO_AULA_2.map((s) => s.n));
    for (const s of notas.slides) {
      expect(s.notas, `slide ${s.n} sem notas`).toBeTruthy();
      expect(s.notas!.conducao.length, `slide ${s.n} sem condução`).toBeGreaterThan(0);
      expect(s.notas!.transicao, `slide ${s.n} sem transição`).toBeTruthy();
      expect(s.titulo.length).toBeGreaterThan(0);
    }
    expect(notas.slides[49].proximo).toBeNull();
    expect(notas.slides[0].proximo?.n).toBe("02");
  });

  it("nenhuma frase das notas sobrevive na variante do aluno, e todas estão na completa", () => {
    let conferidas = 0;
    for (const s of notas.slides) {
      for (const fr of frasesDe(s)) {
        expect(aluno, `slide ${s.n}: "${fr.slice(0, 50)}" está no arquivo do aluno`).not.toContain(fr);
        expect(completo, `slide ${s.n}: "${fr.slice(0, 50)}" falta no arquivo completo`).toContain(fr);
        conferidas++;
      }
    }
    expect(conferidas).toBeGreaterThan(400);
  });

  it("a variante do aluno mantém os 50 slides, o motor e os modos embutidos", () => {
    expect((aluno.match(/Aula\.slide\(\{/g) ?? []).length).toBe(50);
    expect((completo.match(/Aula\.slide\(\{/g) ?? []).length).toBe(50);
    for (const trecho of ["definirModo", "aula-credito-estado:", "indice-busca", "modo=([a-z]+)"]) {
      expect(aluno).toContain(trecho);
      expect(completo).toContain(trecho);
    }
    expect(aluno.length).toBeLessThan(completo.length);
  });

  it("os exercícios com resposta verificada continuam no arquivo do aluno: a resposta deles é revelada por desenho, não é nota", () => {
    for (const trecho of ["Reiniciar exercício", "Conferir", "Resolver passo a passo"]) expect(aluno).toContain(trecho);
  });
});

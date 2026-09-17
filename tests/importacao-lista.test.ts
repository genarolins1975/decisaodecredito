import { describe, expect, it } from "vitest";
import { parseImportList } from "../src/lib/services/enrollment";

describe("lista de alunos colada", () => {
  it("com cabeçalho, ponto e vírgula, nome vazio permitido", () => {
    const r = parseImportList("nome;email\nRenata Carneiro Valsa;renata_valsa@hotmail.com\n;michelle.bouhid@gmail.com\n");
    expect(r.rows.map((x) => [x.nome, x.email])).toEqual([["Renata Carneiro Valsa", "renata_valsa@hotmail.com"], ["", "michelle.bouhid@gmail.com"]]);
  });
  it("sem cabeçalho: reconhece as colunas pelo conteúdo, inclusive papel e tabulação", () => {
    const r = parseImportList("Renata Carneiro Valsa;renata_valsa@hotmail.com\n;michelle.bouhid@gmail.com\nTomaz Leal;tomazleal@outlook.com;monitor\n");
    expect(r.rows.map((x) => [x.nome, x.email, x.papel])).toEqual([["Renata Carneiro Valsa", "renata_valsa@hotmail.com", ""], ["", "michelle.bouhid@gmail.com", ""], ["Tomaz Leal", "tomazleal@outlook.com", "monitor"]]);
    expect(parseImportList("larissafbastos98@gmail.com\tLarissa Fialho Bastos\n").rows[0]).toEqual({ nome: "Larissa Fialho Bastos", email: "larissafbastos98@gmail.com", papel: "" });
  });
  it("cabeçalho em inglês e vírgula continuam aceitos", () => {
    expect(parseImportList("name,email\nAndré Nunes e Souza,andrenesouza@gmail.com\n").rows[0]).toMatchObject({ name: "André Nunes e Souza", email: "andrenesouza@gmail.com" });
  });
});

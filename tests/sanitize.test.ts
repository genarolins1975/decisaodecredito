import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * O editor de página (/professor/conteudo/[pid]) respondia 500 em produção: a rota carregava o sanitizador no topo do
 * módulo, e o jsdom 30 não carrega em Node 22 anterior a 22.12 (dependência só em ES module) nem em Node 20, que é o que
 * as funções da Vercel executavam; o build, num Node mais novo, passava. Estes testes prendem as duas defesas.
 */
describe("sanitizador do editor de conteúdo", () => {
  it("remove script, iframe, formulário e eventos, e mantém classe, estilo, SVG e a fonte do TeX", () => {
    const html = sanitizeHtml(
      '<p class="x" style="color:red" data-latex="p(u)">a <b onclick="alert(1)">b</b></p><script>alert(1)</script>' +
      '<iframe src="https://exemplo"></iframe><form><input name="q"></form><svg viewBox="0 0 10 10"><path d="M0 0L1 1"/></svg>',
    );
    expect(html).toContain('<p class="x" style="color:red" data-latex="p(u)">');
    expect(html).toContain("<b>b</b>");
    expect(html).toContain('<svg viewBox="0 0 10 10"><path d="M0 0L1 1"></path></svg>');
    expect(html).not.toMatch(/script|iframe|onclick|<form|<input/);
  });

  it("usa um jsdom que declara suporte a Node 20 e a Node 22 anterior a 22.12", () => {
    // jsdom 27 em diante exige Node 20.19 ou 22.12; o 30 exige 22.22.2. Subir de versão pede conferir o Node da Vercel.
    const versao = JSON.parse(readFileSync(path.resolve("node_modules/jsdom/package.json"), "utf8")).version as string;
    expect(Number(versao.split(".")[0])).toBeLessThanOrEqual(26);
  });

  it("não carrega o sanitizador no topo do serviço do editor: abrir o editor não depende do jsdom", () => {
    const fonte = readFileSync(path.resolve("src/lib/services/content-admin.ts"), "utf8");
    expect(fonte).not.toMatch(/^import[^\n]*(@\/lib\/sanitize|jsdom|dompurify)/m);
    expect(fonte).toContain('await import("@/lib/sanitize")');
  });
});
